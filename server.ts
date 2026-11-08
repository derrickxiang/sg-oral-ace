import express, { Request, Response } from 'express';
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
} from './src/utils/seabRubric.ts';
import { EvaluationResult } from './src/types/oral.ts';
import { ORAL_TOPICS } from './src/data/topics.ts';

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

// 1. Follow-up Question Generation (AI 考官智能追问 — Low-Latency ThinkingLevel.LOW + Cache)
app.post('/api/oral/followup', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { topicTitle, primaryQuestion, studentTranscript, fastMode } = req.body;

    if (!studentTranscript || studentTranscript.trim().length === 0) {
      return res.status(400).json({ error: '回答内容不能为空' });
    }

    const cacheKey = crypto
      .createHash('sha1')
      .update(`followup:${topicTitle || ''}:${studentTranscript.trim()}`)
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
        const prompt = `你是新加坡O水准（SEAB Paper 3）华文口试考官。
短片：《${topicTitle}》 | 首问：“${primaryQuestion}”
考生回答：“${studentTranscript}”
请针对考生回答的逻辑盲点或未展开角度（如只谈惩罚未谈教育、缺乏个人亲身经历、或忽略现实阻力），用温和规范的新加坡考官口吻提出1个追问（50-85字）。
仅输出JSON：
{"followUpQuestion":"你刚才提到……那么在现实生活中……？","rationaleForQuestion":"考查意图（30字内）","examinerToneAdvice":"应对提示（25字内）"}`;

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
          latencyMs: Date.now() - startTime,
          aiMetadata: {
            engine: 'Google Gemini 3.8 Flash (ThinkingLevel.LOW 极速推理)',
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

    // Instant SEAB syllabus heuristic follow-up generator (<5ms)
    const cleaned = studentTranscript.toLowerCase();
    let followUpQuestion = '';
    let rationale = '';

    if (cleaned.includes('罚款') || cleaned.includes('法律') || cleaned.includes('警察') || cleaned.includes('惩罚')) {
      followUpQuestion =
        '你刚才提到可以通过提高罚款和严格执法来解决问题。但如果在现实生活中，有些年长者或低收入群体确实无力承担，你认为单靠重罚是否能从根本上改变人们的习惯？学校和社区还可以采取哪些更温和有效的引导方式？';
      rationale = '考生过于侧重刚性惩罚手段，追问旨在引导其反思法制与德治的关系，拓展至学校育人与社区关怀。';
    } else if (cleaned.includes('应该') && !cleaned.includes('我记得') && !cleaned.includes('有一次')) {
      followUpQuestion =
        '你刚才提出了不少很好的建议和道理。那么在你的学校或日常邻里生活中，你自己或者身边的同学朋友，是否曾亲身经历过类似的事情？当时你们是如何处理的？';
      rationale = '考生论述停留在口号式的倡议层面，追问意在促使考生结合真实生活经历（Personal Experience），增强说服力。';
    } else {
      followUpQuestion =
        '听了你的观点，如果要在全岛范围内真正推广并内化为你所说的这种风气，你认为目前最大的现实阻力是什么？年轻人又能扮演怎样独特的积极角色？';
      rationale = '考察考生对现实社会复杂性的体察洞察力，以及青少年作为社会先锋的主体担当意识。';
    }

    const fallbackPayload = {
      followUpQuestion,
      rationaleForQuestion: rationale,
      examinerToneAdvice: '答追问时不必慌张，可先用一句话承接考官问题，再分两点阐述，并结合自身经历佐证。',
      latencyMs: Date.now() - startTime,
      aiMetadata: {
        engine: 'SEAB 口试极速规则引擎 (<10ms 零延迟响应)',
        model: 'seab-fast-engine',
        timestamp: new Date().toISOString(),
      },
    };
    followupCache.set(cacheKey, fallbackPayload);
    return res.json(fallbackPayload);
  } catch (err: any) {
    console.error('Error generating follow-up:', err);
    return res.status(500).json({ error: '生成追问失败', details: err?.message });
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
      fastMode = false,
    } = req.body;

    const fullStudentText = `${initialTranscript || ''}\n${followUpTranscript || ''}`.trim();
    const evalCacheKey = crypto
      .createHash('sha1')
      .update(`eval:${topicId}:${fullStudentText}`)
      .digest('hex');

    if (evaluationCache.has(evalCacheKey)) {
      const cached = evaluationCache.get(evalCacheKey)!;
      return res.json({
        ...cached,
        id: `eval-${Date.now()}`,
        createdAt: new Date().toISOString(),
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
      // Compact, focused prompt: Gemini only generates the dynamic rubric & tripleFeedback with ThinkingLevel.LOW
      const evaluationPrompt = `你是新加坡O水准（SEAB Paper 3）华文口试首席考官。
短片：《${topicTitle}》 | 首问：“${primaryQuestion}”
考生首答：“${initialTranscript || ''}”
考官追问：“${followUpQuestion || '无'}” | 考生追答：“${followUpTranscript || '无'}”

按SEAB满分50分（内容15、表达15、词汇10、语音10）及三项核心诊断，输出精简JSON：
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
    "missingReasons": { "summary": "哪里缺少理由总结", "gaps": ["漏洞1", "漏洞2"], "suggestedAngles": ["补充角度1", "补充角度2"] },
    "nextTimeImprovements": {
      "summary": "下一次怎么改总结",
      "actionableSteps": ["改进步骤1", "改进步骤2"],
      "modelSentenceStarter": ["高分句式示范1", "高分句式示范2"],
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
          aiMetadata: {
            engine: `Google Gemini 3.8 Flash (ThinkingLevel.LOW 极速混合引擎 · ${Date.now() - startTime}ms)`,
            model: 'gemini-3.8-flash',
            analysisFocus: '针对学生口语表达的逻辑严密性、新加坡本土真实生活例证及规范华语四声展开深度剖析',
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
      aiMetadata: {
        engine: `SEAB 华文口试考纲极速引擎 (${Date.now() - startTime}ms 零延迟响应)`,
        analysisFocus: '针对学生口语表达的逻辑严密性、新加坡本土真实生活例证及规范华语四声展开深度剖析',
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

// Mount Vite or serve static
async function startServer() {
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

