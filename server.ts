import express, { type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  analyzeOralTranscript,
  determineBand,
  generateTripleFeedback,
  detectPronunciationIssues,
  compareAttempts,
  COMMON_PRONUNCIATION_DATABASE,
  getProgressiveFollowUpQuestion,
} from './src/utils/seabRubric.ts';
import type { EvaluationResult } from './src/types/oral.ts';
import { ORAL_TOPICS } from './src/data/topics.ts';
import {
  createFeedback,
  getUserFeedbacks,
  getAllFeedbacks,
  updateFeedbackStatus,
  purgeExpiredFeedbacks,
} from './src/services/feedbackService.ts';
import type { FeedbackSubmissionPayload, FeedbackStatus } from './src/types/feedback.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NARRATION_AUDIO_DIR = path.resolve(__dirname, 'public', 'audio', 'narration');
if (!fs.existsSync(NARRATION_AUDIO_DIR)) {
  fs.mkdirSync(NARRATION_AUDIO_DIR, { recursive: true });
}

const VIDEOS_DIR = path.resolve(__dirname, 'public', 'videos');
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '60mb' }));
app.use('/audio', express.static(path.resolve(__dirname, 'public', 'audio'), { maxAge: '7d' }));
app.use('/videos', express.static(VIDEOS_DIR, { maxAge: '7d' }));

// Initialize GoogleGenAI if GEMINI_API_KEY is present
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with provided key, using local fallback:', err);
  }
}

// High-speed in-memory caches for sub-100ms repeat/sample responses
const followupCache = new Map<string, any>();
const evaluationCache = new Map<string, EvaluationResult>();

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function cleanSpeechText(raw: string): string {
  return raw
    .replace(/【.*?】/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/（.*?）/g, '')
    .replace(/\(.*?\)/g, '')
    .trim();
}

function getSafeCacheFilename(cacheKey?: string, voiceName = 'Kore', text = ''): string {
  if (cacheKey && /^[a-zA-Z0-9_-]+$/.test(cacheKey)) {
    return `${cacheKey}.wav`;
  }
  const hash = crypto.createHash('sha1').update(`${voiceName}:${text.trim()}`).digest('hex').slice(0, 16);
  return `tts_${voiceName.toLowerCase()}_${hash}.wav`;
}

// In-flight deduplication map so concurrent requests for the same scene don't duplicate TTS calls
const inFlightTts = new Map<string, Promise<string | null>>();

async function generateOrGetSavedAudioUrl(
  rawText: string,
  voiceType: 'examiner' | 'narration' = 'narration',
  voiceName: string = voiceType === 'examiner' ? 'Puck' : 'Kore',
  cacheKey?: string
): Promise<{ audioUrl: string | null; cached: boolean }> {
  const cleanedText = cleanSpeechText(rawText);
  if (!cleanedText) return { audioUrl: null, cached: false };

  const filename = getSafeCacheFilename(cacheKey, voiceName, cleanedText);
  const filePath = path.join(NARRATION_AUDIO_DIR, filename);
  const publicUrl = `/audio/narration/${filename}`;

  // 1. Check if pre-generated file already exists on disk
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
    return { audioUrl: publicUrl, cached: true };
  }

  if (!aiClient) {
    return { audioUrl: null, cached: false };
  }

  // 2. Deduplicate in-flight generation
  if (inFlightTts.has(filename)) {
    const url = await inFlightTts.get(filename)!;
    return { audioUrl: url, cached: true };
  }

  const generationPromise = (async (): Promise<string | null> => {
    try {
      const stylePrompt =
        voiceType === 'examiner'
          ? '温和沉稳、自然从容、吐字清晰、充满启发性的新加坡华文资深考官风格。语气亲切，富有真实人声起伏与亲和力。'
          : '生动流畅、自然沉浸、语速适中、吐字清晰的新加坡生活短片旁白风格。声调自然，具有真实纪录片质感。';

      const ttsResponse = await aiClient!.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanedText,
                speechMetadata: {
                  style: stylePrompt,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const buffer = Buffer.from(base64Audio, 'base64');
        fs.writeFileSync(filePath, buffer);
        return publicUrl;
      }
      return null;
    } catch (e) {
      console.warn(`Failed to generate TTS for ${filename}:`, e);
      return null;
    } finally {
      inFlightTts.delete(filename);
    }
  })();

  inFlightTts.set(filename, generationPromise);
  const audioUrl = await generationPromise;
  return { audioUrl, cached: false };
}

// Background pre-generation of all topic video narrations on startup
async function preGenerateAllTopicNarrationsInBackground() {
  if (!aiClient) return;
  for (const topic of ORAL_TOPICS) {
    for (let i = 0; i < topic.scenes.length; i++) {
      const scene = topic.scenes[i];
      const text = scene.dialogue || scene.description;
      const cacheKey = `${topic.id}_${scene.id}`;
      const filename = getSafeCacheFilename(cacheKey, 'Kore', text);
      const filePath = path.join(NARRATION_AUDIO_DIR, filename);
      if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
        continue;
      }
      await generateOrGetSavedAudioUrl(text, 'narration', 'Kore', cacheKey);
      await new Promise((r) => setTimeout(r, 350));
    }
  }
}

// AI Status endpoint
app.get('/api/oral/ai-status', (_req: Request, res: Response) => {
  const isGeminiReady = Boolean(aiClient);
  return res.json({
    isGeminiReady,
    model: 'gemini-3.8-flash',
    aiEngine: isGeminiReady ? 'Google Gemini 3.8 Flash (云端会考考官引擎)' : 'SEAB 华文口试考纲规则引擎 (高可用模式)',
    aiApplications: [
      {
        title: '1. 智能动态追问 (Dynamic Follow-up)',
        desc: '实时研读学生作答文本，抓住论述漏洞或单向思维（如只提罚款未提教育），现场生成 1 对 1 追问。',
      },
      {
        title: '2. 核心三项诊断 (Triple Diagnostic Feedback)',
        desc: '精准归因哪里表达清楚、哪里缺少论据理由、下一次怎么用 ORID/总分总架构改进。',
      },
      {
        title: '3. SEAB 四维评分标准 (MOE Syllabus Rubric)',
        desc: '细化评估思想内容(15分)、表达结构(15分)、词汇语料(10分)、语音发音(10分)并评定等级 Band 1-4。',
      },
      {
        title: '4. 发音纠错与声调扫描 (Phonetic Trap Detection)',
        desc: '精准定位新加坡学生高发多音字（角色 jué、提供 gōng、塑料 sù、潜移默化 qián）与声调混淆。',
      },
      {
        title: '5. 前后作答对比引擎 (Before-and-After Analysis)',
        desc: '智能对比学生二次练习前后的论点扩充度、字数增长、衔接词密度与提分幅度。',
      },
    ],
  });
});

// Preload / get saved narration audio files for an entire topic
app.get('/api/oral/topic-narrations/:topicId', async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const topic = ORAL_TOPICS.find((t) => t.id === topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const sceneAudioMap: Record<string, string> = {};
    for (const scene of topic.scenes) {
      const text = scene.dialogue || scene.description;
      const cacheKey = `${topic.id}_${scene.id}`;
      const { audioUrl } = await generateOrGetSavedAudioUrl(text, 'narration', 'Kore', cacheKey);
      if (audioUrl) {
        sceneAudioMap[scene.id] = audioUrl;
      }
    }

    return res.json({
      topicId: topic.id,
      sceneAudioMap,
    });
  } catch (err: any) {
    console.warn('Error in /api/oral/topic-narrations:', err);
    return res.json({ topicId: req.params.topicId, sceneAudioMap: {} });
  }
});

// List all permanently saved topic videos (.mp4 or .webm) from public/videos/
app.get('/api/oral/topic-videos', (_req: Request, res: Response) => {
  try {
    const videos: Record<string, { url: string; format: string; sizeKB: number; updatedAt: string }> = {};
    if (fs.existsSync(VIDEOS_DIR)) {
      const files = fs.readdirSync(VIDEOS_DIR);
      for (const file of files) {
        const match = file.match(/^(topic-[a-z0-9-]+)\.(mp4|webm)$/i);
        if (match) {
          const topicId = match[1];
          const ext = match[2].toLowerCase();
          const stat = fs.statSync(path.join(VIDEOS_DIR, file));
          if (stat.size > 1000) {
            // Prefer .mp4 over .webm if both exist
            if (!videos[topicId] || ext === 'mp4') {
              videos[topicId] = {
                url: `/videos/${file}?t=${Math.floor(stat.mtimeMs)}`,
                format: ext.toUpperCase(),
                sizeKB: Math.round(stat.size / 1024),
                updatedAt: stat.mtime.toISOString(),
              };
            }
          }
        }
      }
    }
    return res.json({ videos });
  } catch (err: any) {
    console.warn('Error scanning /api/oral/topic-videos:', err);
    return res.json({ videos: {} });
  }
});

// Permanently save an uploaded Google Flow (.mp4) or synthesized (.webm) video for a topic
app.post('/api/oral/save-video', async (req: Request, res: Response) => {
  try {
    const { topicId, videoBase64, mimeType = 'video/mp4', source = 'Google Flow AI Pro' } = req.body;
    if (!topicId || !/^topic-[a-z0-9-]+$/i.test(topicId)) {
      return res.status(400).json({ error: 'Invalid topicId' });
    }
    if (!videoBase64 || typeof videoBase64 !== 'string') {
      return res.status(400).json({ error: 'Missing videoBase64 payload' });
    }

    const cleanBase64 = videoBase64.replace(/^data:video\/[a-z0-9.+-]+;base64,/i, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    if (buffer.length < 1000) {
      return res.status(400).json({ error: 'Video file is too small or corrupted' });
    }

    const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
    const filename = `${topicId}.${ext}`;
    const filePath = path.join(VIDEOS_DIR, filename);
    fs.writeFileSync(filePath, buffer);

    const stat = fs.statSync(filePath);
    const videoUrl = `/videos/${filename}?t=${Math.floor(stat.mtimeMs)}`;
    return res.json({
      success: true,
      topicId,
      videoUrl,
      format: ext.toUpperCase(),
      sizeKB: Math.round(stat.size / 1024),
      source,
      updatedAt: stat.mtime.toISOString(),
    });
  } catch (err: any) {
    console.error('Error saving topic video:', err);
    return res.status(500).json({ error: 'Failed to save video file', details: err?.message });
  }
});

// AI Natural Speech TTS endpoint (with permanent disk caching so identical prompts play the exact same saved file)
app.post('/api/oral/tts', async (req: Request, res: Response) => {
  try {
    const {
      text,
      voiceType = 'examiner',
      voiceName = voiceType === 'examiner' ? 'Puck' : 'Kore',
      cacheKey,
    } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text required for TTS' });
    }

    const { audioUrl, cached } = await generateOrGetSavedAudioUrl(text, voiceType, voiceName, cacheKey);
    if (audioUrl) {
      return res.json({
        audioUrl,
        cached,
        mimeType: 'audio/wav',
        voiceUsed: voiceName,
        engine: 'Gemini 3.8 Flash-Lite TTS (预生成固定原声存档)',
      });
    }

    return res.json({ fallbackToClient: true });
  } catch (err: any) {
    console.warn('TTS route error:', err);
    return res.json({ fallbackToClient: true });
  }
});

// 1. Follow-up Question Generation (AI 陪练多轮渐进延伸提问 — Low-Latency ThinkingLevel.LOW + Cache)
app.post('/api/oral/followup', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const {
      topicId = 'topic-hawker-tray',
      topicTitle,
      primaryQuestion,
      studentTranscript,
      round = 1,
      previousExchanges = [],
      practiceMode = 'guided',
      fastMode,
    } = req.body;

    if (!studentTranscript || studentTranscript.trim().length === 0) {
      return res.status(400).json({ error: '回答内容不能为空' });
    }

    const roundNum = ([1, 2, 3].includes(Number(round)) ? Number(round) : 1) as 1 | 2 | 3;
    const exchangesSummary = Array.isArray(previousExchanges)
      ? previousExchanges
          .map((ex: any, i: number) => `R${ex?.round ?? i + 1} 问：${ex?.question || ''}\nR${ex?.round ?? i + 1} 答：${ex?.candidateAnswer || ''}`)
          .join('\n')
      : '';

    const cacheKey = crypto
      .createHash('sha1')
      .update(`followup:r${roundNum}:${practiceMode}:${topicTitle || ''}:${studentTranscript.trim()}:${exchangesSummary}`)
      .digest('hex');

    if (followupCache.has(cacheKey)) {
      const cached = followupCache.get(cacheKey);
      return res.json({
        ...cached,
        latencyMs: Date.now() - startTime,
        cached: true,
      });
    }

    if (aiClient && !fastMode) {
      try {
        const roundFocus =
          roundNum === 1
            ? '第1轮：结合学生首答内容，从“校园或组屋社区亲身见闻/具体生活细节”自然追问1个问题。'
            : roundNum === 2
            ? '第2轮：承接前面对话，从“学校育人、同侪影响或青少年实践方案”层面深挖1个问题，避免与前轮重复。'
            : '第3轮：进行高阶思辨追问，聚焦“外在条规约束 vs 内在同理心与多方协同”提出1个总结性挑战问题。';

        const prompt = `你是亲切、富有启发性的新加坡中学华文口试 AI 陪练教练（提供练习指导，非官方考评）。
短片主题：《${topicTitle}》 | 首问：“${primaryQuestion}”
学生首答：“${studentTranscript}”
${exchangesSummary ? `已进行的延伸对话：\n${exchangesSummary}\n` : ''}当前轮次：第 ${roundNum}/3 轮（${roundFocus}）
练习模式：${practiceMode === 'exam_sim' ? '计时模拟测试模式（语气贴近真实面谈节奏）' : '循序引导练习模式（语气亲切具启发性）'}

请针对学生回答的逻辑盲点、可深挖的细节或尚未兼顾的角度，用自然规范的新加坡华语提出 1 个延伸提问（50-85字）。
仅输出 JSON：
{"followUpQuestion":"你刚才提到……那么在现实生活中……？","rationaleForQuestion":"思考切入点参考（30字内）","examinerToneAdvice":"表达小建议（25字内）"}`;

        const response = await withTimeout(
          aiClient.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
            },
          }),
          3200
        );

        const responseText = response.text || '';
        const parsed = JSON.parse(responseText);
        const payload = {
          ...parsed,
          round: roundNum,
          latencyMs: Date.now() - startTime,
          aiMetadata: {
            engine: 'Google Gemini 3.8 Flash (多轮上下文推理)',
            model: 'gemini-3.8-flash',
            timestamp: new Date().toISOString(),
          },
        };
        followupCache.set(cacheKey, payload);
        return res.json(payload);
      } catch (e) {
        console.warn('Gemini follow-up API timed out or fell back to instant SEAB engine:', e);
      }
    }

    // Instant progressive heuristic follow-up generator (<5ms)
    const cleaned = studentTranscript.toLowerCase();
    const progressive = getProgressiveFollowUpQuestion(topicId, roundNum, studentTranscript);
    let followUpQuestion = progressive.question.replace(/^[“"]|[”"]$/g, '');
    let rationale = progressive.intent;
    let toneAdvice = progressive.tip;

    if (roundNum === 1) {
      if (cleaned.includes('罚款') || cleaned.includes('法律') || cleaned.includes('警察') || cleaned.includes('惩罚')) {
        followUpQuestion =
          '你刚才提到可以通过加强规则和罚款来改善问题。不过在现实生活里，如果遇到记忆力下降的长者或疏忽的青少年，单靠惩罚就能真正改变习惯吗？学校和社区还可以采取哪些更温和有效的引导方式？';
        rationale = '回答偏重条规约束，延伸提问旨在引导思考“规则约束与品德自觉”的平衡。';
      } else if (cleaned.includes('应该') && !cleaned.includes('我记得') && !cleaned.includes('有一次')) {
        followUpQuestion =
          '你刚才提出了很有道理的想法。在你的学校或日常居住的组屋邻里里，你自己或身边的同学家人，是否曾亲身经历或目睹过类似的事情？当时你们是怎么处理或感受的？';
        rationale = '回答以倡导观点为主，延伸提问旨在鼓励补充“个人亲身见闻”，让内容更有温度。';
      }
    }

    const fallbackPayload = {
      followUpQuestion,
      rationaleForQuestion: rationale,
      examinerToneAdvice: toneAdvice,
      round: roundNum,
      latencyMs: Date.now() - startTime,
      aiMetadata: {
        engine: 'OralAce 多轮语境规则引擎 (<10ms 极速响应)',
        model: 'oralace-fast-engine',
        timestamp: new Date().toISOString(),
      },
    };
    followupCache.set(cacheKey, fallbackPayload);
    return res.json(fallbackPayload);
  } catch (err: any) {
    console.error('Error generating follow-up:', err);
    return res.status(500).json({ error: '生成延伸提问失败', details: err?.message });
  }
});

// 2. Comprehensive SEAB Evaluation (Hybrid Parallel: Instant Local Corpus/Pronunciation + Low-Latency Gemini Rubric)
app.post('/api/oral/evaluate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const {
      topicId,
      topicTitle,
      primaryQuestion,
      initialTranscript,
      followUpQuestion,
      followUpTranscript,
      audioDurationSeconds = 45,
      practiceMode = 'guided',
      prepSecondsUsed,
      readingAloudScore,
      fastMode = false,
    } = req.body;

    const fullStudentText = `${initialTranscript || ''}\n${followUpTranscript || ''}`.trim();
    const evalCacheKey = crypto
      .createHash('sha1')
      .update(`eval:${practiceMode}:${topicId}:${fullStudentText}`)
      .digest('hex');

    if (evaluationCache.has(evalCacheKey)) {
      const cached = evaluationCache.get(evalCacheKey)!;
      return res.json({
        ...cached,
        id: `eval-${Date.now()}`,
        createdAt: new Date().toISOString(),
        practiceMode,
        prepSecondsUsed,
      });
    }

    // 0ms deterministic local computation for pronunciation traps & corpus suggestions
    const localAnalysis = analyzeOralTranscript(fullStudentText);
    const localPronunciationIssues = detectPronunciationIssues(fullStudentText);
    const defaultPronunciationIssues =
      localPronunciationIssues.length > 0
        ? localPronunciationIssues
        : [
            {
              word: '角色',
              pinyin: 'jué sè',
              studentMistake: '常被误读为 jiǎo sè',
              explanation: '在华语中表示“扮演角色、社会角色”时必须读第二声 jué。',
              toneInfo: '第二声 (阳平 /)',
              category: 'polyphone' as const,
            },
            {
              word: '提供',
              pinyin: 'tí gōng',
              studentMistake: '常被误读为 tí gòng',
              explanation: '动词表示供给、出资或提供服务时读第一声 gōng。',
              toneInfo: '第一声 (阴平 —)',
              category: 'polyphone' as const,
            },
          ];

    const defaultCorpusSuggestions = {
      connectives: [
        { type: '因果' as const, words: ['之所以', '其根本原因在于'], example: '之所以出现不文明现象，其根本原因在于同理心教育尚未内化。' },
        { type: '转折' as const, words: ['不可否认的是', '话虽如此'], example: '不可否认的是，罚款能起震慑作用，但长远仍依赖公民自律。' },
        { type: '递进' as const, words: ['不仅如此', '更进一步来说'], example: '不仅如此，保持桌面整洁更体现了对弱势群体的尊重。' },
        { type: '总结' as const, words: ['总而言之', '长远来看'], example: '总而言之，唯有多管齐下，方能构建真正的优雅社会。' },
      ],
      idiomsAndProverbs: [
        { phrase: '举手之劳', meaning: '轻而易举毫不费力', usageContext: '形容随手归还托盘与顺手关灯' },
        { phrase: '潜移默化', meaning: '思想品德受感染无形改变', usageContext: '形容父母言传身教与校园风气熏陶' },
        { phrase: '双管齐下', meaning: '两项措施并进配合', usageContext: '形容严格执法与宣传教育紧密结合' },
      ],
      singaporeTerms: [
        { term: '小贩中心', properUsage: '规范华语称呼熟食中心，体现非遗文化' },
        { term: '租赁组屋', properUsage: '新加坡公共住房关怀乐龄群体的语境' },
      ],
    };

    if (aiClient && !fastMode) {
      // Compact, focused prompt: Gemini generates advisory practice feedback & constructive phrasing upgrades
      const evaluationPrompt = `你是温和专业的新加坡中学华文口语陪练教练（以下评分与建议仅供学生日常练习参考，不代表官方考试评定）。
短片主题：《${topicTitle}》 | 首问：“${primaryQuestion}”
学生首答：“${initialTranscript || ''}”
延伸提问：“${followUpQuestion || '无'}” | 学生延伸回答：“${followUpTranscript || '无'}”
${typeof readingAloudScore === 'number' ? `第一部分朗读参考分：${readingAloudScore}/10\n` : ''}练习模式：${practiceMode === 'exam_sim' ? '计时模拟测试模式' : '循序引导练习模式'}

请按50分制练习参考（思想内容15、表达结构15、词汇语料10、语音发音10）及三项核心练习建议，给出真诚、具体且有启发性的 JSON 反馈（尤其在 modelSentenceStarter 中把学生原句升级成更地道自然的表达）：
{
  "totalScore": 38,
  "band": "Band 2 (优良 34-41)",
  "rubric": {
    "content": { "name": "思想内容", "score": 11, "maxScore": 15, "level": "优良 (Band 2)", "feedback": "1句话评语", "keyObservations": ["要点1", "要点2"] },
    "expression": { "name": "表达与结构", "score": 11, "maxScore": 15, "level": "优良 (Band 2)", "feedback": "1句话评语", "keyObservations": ["要点1", "要点2"] },
    "vocabulary": { "name": "词汇与语料", "score": 8, "maxScore": 10, "level": "优良 (Band 2)", "feedback": "1句话评语", "keyObservations": ["要点1", "要点2"] },
    "pronunciation": { "name": "语音与发音", "score": 8, "maxScore": 10, "level": "优良 (Band 2)", "feedback": "1句话评语", "keyObservations": ["要点1", "要点2"] }
  },
  "tripleFeedback": {
    "clearExpression": { "summary": "哪里表达清楚总结", "highlights": ["亮点1", "亮点2"], "goodPhrasesUsed": ["得当词汇1", "得当词汇2"] },
    "missingReasons": { "summary": "哪里还可以补充理由总结", "gaps": ["可补充点1", "可补充点2"], "suggestedAngles": ["补充角度1", "补充角度2"] },
    "nextTimeImprovements": {
      "summary": "下一次怎么表达更自然总结",
      "actionableSteps": ["改进步骤1", "改进步骤2"],
      "modelSentenceStarter": ["句式升级示范1", "句式升级示范2"],
      "oridFrameworkExample": { "objective": "见闻", "reflective": "感受", "interpretive": "剖析", "decisional": "建议" }
    }
  }
}`;

      try {
        const aiResponse = await withTimeout(
          aiClient.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: evaluationPrompt,
            config: {
              responseMimeType: 'application/json',
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
            },
          }),
          3600
        );

        const text = aiResponse.text || '';
        const parsed = JSON.parse(text);
        const result: EvaluationResult = {
          id: `eval-${Date.now()}`,
          topicId,
          topicTitle,
          createdAt: new Date().toISOString(),
          totalScore: parsed.totalScore || localAnalysis.totalScore,
          band: parsed.band || determineBand(parsed.totalScore || localAnalysis.totalScore),
          rubric: parsed.rubric,
          tripleFeedback: parsed.tripleFeedback,
          pronunciationIssues: defaultPronunciationIssues,
          corpusSuggestions: defaultCorpusSuggestions,
          initialTranscript,
          followUpQuestion,
          followUpTranscript,
          audioDurationSeconds,
          practiceMode,
          prepSecondsUsed,
          aiMetadata: {
            engine: `Google Gemini 3.8 Flash (日常口语陪练参考 · ${Date.now() - startTime}ms)`,
            model: 'gemini-3.8-flash',
            analysisFocus: '针对表达条理、新加坡生活事例与常用华语声调提供自我练习参考建议',
          },
        };
        evaluationCache.set(evalCacheKey, result);
        return res.json(result);
      } catch (err) {
        console.warn('Gemini evaluation timed out or fell back to instant SEAB engine:', err);
      }
    }

    // Instant Hybrid SEAB syllabus evaluation (<15ms)
    const triple = generateTripleFeedback(fullStudentText, localAnalysis, topicTitle);
    const band = determineBand(localAnalysis.totalScore);

    const result: EvaluationResult = {
      id: `eval-${Date.now()}`,
      topicId,
      topicTitle,
      createdAt: new Date().toISOString(),
      totalScore: localAnalysis.totalScore,
      band,
      rubric: {
        content: {
          name: '思想内容',
          score: localAnalysis.depthScore,
          maxScore: 15,
          level: localAnalysis.depthScore >= 13 ? '极佳 (Band 1)' : localAnalysis.depthScore >= 10 ? '优良 (Band 2)' : '尚可 (Band 3)',
          feedback: localAnalysis.hasMultiAngle ? '论述切题，能从多角度思考问题。' : '抓住了核心现象，但论据稍显单一，缺少多方剖析。',
          keyObservations: [
            localAnalysis.hasPersonalExample ? '包含个人见闻经历，富有真情实感' : '缺少具体生活实例，建议融入身边故事',
            localAnalysis.hasMultiAngle ? '兼顾了学校、家庭或社会多维层面' : '建议构建家庭-学校-社会三方论证',
          ],
        },
        expression: {
          name: '表达与结构',
          score: localAnalysis.expressionScore,
          maxScore: 15,
          level: localAnalysis.expressionScore >= 13 ? '极佳 (Band 1)' : localAnalysis.expressionScore >= 10 ? '优良 (Band 2)' : '尚可 (Band 3)',
          feedback: localAnalysis.connectorsFound.length >= 2 ? '逻辑连贯，运用了衔接词。' : '语言朴实，但句与句之间的逻辑链条需进一步紧凑。',
          keyObservations: [
            `检测到衔接词：${localAnalysis.connectorsFound.length > 0 ? localAnalysis.connectorsFound.join('、') : '较少'}`,
            '整体结构清晰，建议熟练掌握ORID答题步骤',
          ],
        },
        vocabulary: {
          name: '词汇与语料',
          score: localAnalysis.vocabularyScore,
          maxScore: 10,
          level: localAnalysis.vocabularyScore >= 8 ? '优良 (Band 2)' : '尚可 (Band 3)',
          feedback: '用词较为得体，建议积累更多新加坡高频口试成语与连接词。',
          keyObservations: ['规范使用华语，表达意思明确', '可增加如“潜移默化”、“双管齐下”等高分语料'],
        },
        pronunciation: {
          name: '语音与发音',
          score: localAnalysis.pronunciationScore,
          maxScore: 10,
          level: '优良 (Band 2)',
          feedback: '吐字清晰，语速平稳。请重点注意常见多音字与规范声调。',
          keyObservations: [
            localPronunciationIssues.length > 0
              ? `发现了 ${localPronunciationIssues.length} 个易错发音词，已生成发音纠错卡`
              : '声调掌握良好，未发现明显声调混淆',
          ],
        },
      },
      tripleFeedback: triple,
      pronunciationIssues: defaultPronunciationIssues,
      corpusSuggestions: defaultCorpusSuggestions,
      initialTranscript,
      followUpQuestion,
      followUpTranscript,
      audioDurationSeconds,
      practiceMode,
      prepSecondsUsed,
      aiMetadata: {
        engine: `OralAce 口语练习快速参考引擎 (${Date.now() - startTime}ms 零延迟响应)`,
        analysisFocus: '针对表达条理、新加坡生活事例与常用华语声调提供自我练习参考建议',
      },
    };

    evaluationCache.set(evalCacheKey, result);
    return res.json(result);
  } catch (err: any) {
    console.error('Error in /api/oral/evaluate:', err);
    return res.status(500).json({ error: '评估生成失败', details: err?.message });
  }
});

// 3. Before-and-After Comparison (同类题再练一次对比)
app.post('/api/oral/compare', async (req: Request, res: Response) => {
  try {
    const { round1, round2 } = req.body;
    if (!round1 || !round2) {
      return res.status(400).json({ error: '必须提供前测与后测两个练习结果进行对比' });
    }

    const comparison = compareAttempts(round1, round2);
    return res.json(comparison);
  } catch (err: any) {
    console.error('Error in /api/oral/compare:', err);
    return res.status(500).json({ error: '对比分析生成失败', details: err?.message });
  }
});

// ==========================================
// FEEDBACK & ISSUE REPORTING PIPELINE (符合设计原则)
// 1. 不公开邮箱，应用内入口
// 2. 不自动收集学生练习录音与文字
// 3. 复用现有 Brevo / 存储，90 天保留期
// 4. 每账号每天最多 5 条防滥用
// ==========================================

// 1. Submit Feedback or Content Safety Report
app.post('/api/feedback/submit', async (req: Request, res: Response) => {
  try {
    const payload: FeedbackSubmissionPayload = req.body;
    if (!payload || !payload.userId) {
      return res.status(401).json({ error: '必须登录账号后方可提交反馈或举报' });
    }
    if (!payload.type || !['feature_issue', 'content_safety', 'privacy_data_request'].includes(payload.type)) {
      return res.status(400).json({ error: '请选择反馈类型（功能问题 / 内容安全 / 隐私数据）' });
    }
    const result = await createFeedback(payload);
    if (!result.success) {
      return res.status(429).json({ error: result.error });
    }
    return res.json({ success: true, feedback: result.feedback });
  } catch (err: any) {
    console.error('Error in /api/feedback/submit:', err);
    return res.status(500).json({ error: '反馈提交异常，请稍后重试' });
  }
});

// 2. Fetch Feedback History for Current Student
app.get('/api/feedback/my-list', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }
  const items = getUserFeedbacks(userId);
  return res.json({ items });
});

// 3. Fetch Admin Feedback Queue (For Derrick.Xiang@gmail.com / Admin View)
app.get('/api/feedback/admin/list', (req: Request, res: Response) => {
  const requesterEmail = (req.query.requesterEmail as string || '').toLowerCase();
  const adminEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || 'Derrick.Xiang@gmail.com').toLowerCase();
  if (requesterEmail !== adminEmail && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: '无权查看管理员反馈队列' });
  }
  const statusFilter = req.query.status as FeedbackStatus | undefined;
  const items = getAllFeedbacks(statusFilter);
  return res.json({ items });
});

// 4. Update Feedback Status & Reply (Admin Only)
app.post('/api/feedback/admin/update', (req: Request, res: Response) => {
  const { feedbackId, status, adminReply, requesterEmail } = req.body;
  const adminEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || 'Derrick.Xiang@gmail.com').toLowerCase();
  if ((requesterEmail || '').toLowerCase() !== adminEmail && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: '无权执行管理员操作' });
  }
  if (!feedbackId || !status) {
    return res.status(400).json({ error: '缺少 feedbackId 或 status 参数' });
  }
  const result = updateFeedbackStatus(feedbackId, status, adminReply);
  if (!result.success) {
    return res.status(404).json({ error: result.error });
  }
  return res.json({ success: true, feedback: result.feedback });
});

// Mount Vite or serve static
async function startServer() {
  // Purge any expired feedbacks older than 90 days on startup
  const purged = purgeExpiredFeedbacks();
  if (purged > 0) {
    console.log(`[Data Retention Policy] Purged ${purged} feedback records past 90 days.`);
  }

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`狮城口试宝 Server running at http://localhost:${PORT}`);
    preGenerateAllTopicNarrationsInBackground().catch((err) =>
      console.warn('Background narration pre-generation error:', err)
    );
  });
}

startServer();

