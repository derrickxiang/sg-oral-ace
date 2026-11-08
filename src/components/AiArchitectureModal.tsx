import React from 'react';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  MessageSquare,
  Cpu,
  Zap,
  Volume2,
  X,
  FileCheck,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AiArchitectureModalProps {
  onClose: () => void;
}

export const AiArchitectureModal: React.FC<AiArchitectureModalProps> = ({ onClose }) => {
  const { t } = useLanguage();

  const aiApplications = [
    {
      step: '01',
      icon: MessageSquare,
      title: t(
        'Dynamic Follow-up Questioning (AI 动态追问生成)',
        'AI 动态追问生成 (Dynamic Follow-up Questioning)'
      ),
      subtitle: t(
        'Powered by Google Gemini 3.8 Flash as an Interactive Chinese Oral Practice Partner',
        '基于 Google Gemini 3.8 Flash 口语陪练助手微调'
      ),
      desc: t(
        'Unlike static question banks, OralAce analyzes your spoken transcript in real time to spot areas where you can expand your ideas (e.g., adding personal experiences or multiple perspectives) and generates supportive 1-on-1 follow-up questions.',
        '与传统预设题库不同，AI 实时研读刚才的练习文本，识别可以进一步展开的思路（如补充个人生活经历或从多角度思考），即时生成 1 对 1 的启发式延伸提问。'
      ),
      tech: 'Gemini 3.8 Flash + Contextual Practice Prompting + JSON Schema Response',
      badge: t('Interactive Core', '深度互动核心'),
    },
    {
      step: '02',
      icon: BrainCircuit,
      title: t(
        'Triple Diagnostic Reasoning (三项核心定向诊断反馈)',
        '三项核心定向诊断反馈 (Triple Diagnostic Reasoning)'
      ),
      subtitle: t(
        'Where Expression is Clear · Where Reasoning is Missing · How to Improve Next Time',
        '哪里表达清楚 · 哪里缺少理由 · 下一次怎么改'
      ),
      desc: t(
        'Deconstructs the student’s argument chain: ① Highlights clear points and effective connectives; ② Pinpoints missing causal analysis and real-life examples; ③ Generates a customized Band 1 model response using the ORID (Objective-Reflective-Interpretive-Decisional) framework.',
        '运用大语言模型的自然语言理解能力，深度拆解学生的论据链条：① 识别亮点与有效逻辑连接词；② 定位成因分析缺失与生活案例盲区；③ 基于 ORID 架构（见闻-感受-剖析-建议）自动为学生生成专属的高分示范表达。'
      ),
      tech: 'Chain-of-Thought + ORID Framework Reasoning + Contrastive Attribution',
      badge: t('Diagnostic Core', '教学反馈核心'),
    },
    {
      step: '03',
      icon: FileCheck,
      title: t(
        '4-Dimension Self-Practice Reference Evaluation (四维口语自测参考评估)',
        '四维口语表达自测参考评估（仅供日常练习参考）'
      ),
      subtitle: t(
        'Content & Ideas · Structure · Vocabulary & Corpus · Pronunciation',
        '思想内容 · 表达结构 · 词汇语料 · 语音发音'
      ),
      desc: t(
        'Provides a supportive 4-dimension reference evaluation out of 50 points for personal study reference, offering non-official constructive suggestions to help learners track their own progress.',
        '从四个表达维度提供满分 50 分的日常练习自测参考与改进建议（非官方权威评分），帮助学习者清晰了解自身表达亮点与可提升空间。'
      ),
      tech: '4-Dimension Practice Reference Matrix + Advisory Feedback Engine',
      badge: t('Practice Reference', '自测参考评估'),
    },
    {
      step: '04',
      icon: Volume2,
      title: t(
        'Speech Recognition, Tone Scanning & Neural Voice Synthesis',
        '语音识别、发音纠错与声调扫描'
      ),
      subtitle: t(
        'Singapore Mandarin Polyphonic Trap Detection & Pre-cached Neural Narration',
        '新加坡华语常见易错多音字与规范声调纠正'
      ),
      desc: t(
        'Combines Web Speech API transcription with a Singapore Mandarin polyphonic trap lexicon (e.g., 角色 jué, 提供 gōng, 塑料 sù, 潜移默化 qián) and Gemini 2.5 Flash Neural TTS for natural narration and pronunciation coaching.',
        '结合 Web Speech API 进行实时语音转文字，并联动新加坡语料库对“角色(jué)”、“提供(gōng)”、“塑料(sù)”、“潜移默化(qián)”等高发混淆字进行精准声调比对与纠错，并驱动标准发音音频合成示范。'
      ),
      tech: 'Web Speech API + Singapore Polyphonic Trap Lexicon + Gemini 2.5 Neural TTS',
      badge: t('Pronunciation Guard', '语音声调护航'),
    },
    {
      step: '05',
      icon: TrendingUp,
      title: t(
        'Before-and-After Retest Delta Engine (同类题再练前后对比引擎)',
        '同类题再练前后对比引擎 (Before-and-After Delta)'
      ),
      subtitle: t(
        'Same-Topic Retry or Similar-Topic Transfer Comparison',
        '同话题重练或同类新题迁移能力比对'
      ),
      desc: t(
        'When a student retries after reviewing feedback, the AI engine compares Round 1 vs Round 2 argument depth, elaboration length, advanced vocabulary usage, and pronunciation fixes to quantify score gains.',
        '当学生吸收考官反馈进行二次作答时，AI 引擎比对前后两轮的论点深度、信息量扩展（如字数从 130 字增至 196 字）、高分词汇使用率与发音纠正率，直观呈现提分增量。'
      ),
      tech: 'Semantic Difference Analysis + Score Delta + Examiner Verdict Synthesis',
      badge: t('Improvement Loop', '提分见证闭环'),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur z-20 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-red-600 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-gray-900 text-lg">
                  {t('OralAce AI Architecture & Capabilities', 'AI 核心技术与应用全景解析')}
                </h3>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                  Google Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {t(
                  'OralAce (your AI Chinese Oral Coach) — purpose-built for Singapore GCE O-Level Chinese Oral Exam',
                  'OralAce (your AI Chinese Oral Coach) —— 深度聚焦新加坡 O-Level 华文口试的专业 AI 陪练系统'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Architecture Summary Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-6 h-6 text-yellow-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-base text-yellow-300 mb-1">
                  {t('5 AI-Powered Coaching Nodes in OralAce', 'AI 驱动的五大核心业务节点')}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t(
                    'In OralAce, AI powers the entire learning loop: from watching life-topic videos with pre-saved neural narration, voice recording, dynamic examiner follow-up questioning, triple diagnostic feedback, and pronunciation correction to before-and-after retest comparison.',
                    '在 OralAce 中，AI 贯穿了从看短片、录音作答、考官现场动态追问、三项核心诊断归因、发音纠错到同类题再练对比的整个学习与考评生命周期。'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 5 Applications List */}
          <div className="space-y-4">
            {aiApplications.map((app, index) => {
              const Icon = app.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50/70 border border-gray-200 rounded-2xl p-4 sm:p-5 hover:border-indigo-300 hover:shadow-xs transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-black font-mono text-indigo-600 bg-indigo-50 border border-indigo-200 w-7 h-7 rounded-lg flex items-center justify-center">
                        {app.step}
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{app.title}</span>
                      </h4>
                    </div>

                    <span className="bg-indigo-100 text-indigo-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      {app.badge}
                    </span>
                  </div>

                  <p className="text-xs text-indigo-900/80 font-medium mb-2">
                    {app.subtitle}
                  </p>

                  <p className="text-xs text-gray-700 leading-relaxed mb-3">
                    {app.desc}
                  </p>

                  <div className="pt-2 border-t border-gray-200/60 flex items-center space-x-1.5 text-[11px] text-gray-500 font-mono">
                    <Cpu className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{t('Tech Stack:', '底层技术栈：')} {app.tech}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Model & Architecture Diagram */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 space-y-3">
            <div>
              <h5 className="font-bold text-slate-900 mb-1.5 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>{t('Hybrid AI Engine Guarantee:', '双引擎混合架构保障（Hybrid Engine）：')}</span>
              </h5>
              <p className="leading-relaxed">
                <strong>{t('1. Cloud Gemini 3.8 Flash Real-Time Reasoning:', '1. 云端 Gemini 3.8 Flash 实时推理：')}</strong>{' '}
                {t(
                  'Powers contextual examiner follow-up generation and deep 3-part diagnostic evaluation.',
                  '负责大模型上下文深度追问生成与自由文本的高阶三项诊断。'
                )}
                <br />
                <strong>{t('2. Local Practice Reference & On-Device GOP Engine:', '2. 本地自测参考与本机声学 GOP 对齐引擎：')}</strong>{' '}
                {t(
                  'Computes acoustic pause telemetry and phoneme GOP confidence locally with 0 network requests.',
                  '在浏览器本机执行声学强制对齐与音素 GOP 置信度分析（网络请求数：0），保障隐私与 100% 离线可用。'
                )}
              </p>
            </div>

            <div
              data-testid="production-guardrails-card"
              className="pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5"
            >
              <div className="bg-white border border-slate-200 rounded-xl p-3">
                <div className="font-bold text-teal-900 mb-1">
                  {t('🛡️ Student Fail-Closed Audio Guard', '🛡️ 学生模式“先审后放”安全护栏')}
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {t(
                    'Real-time TTS audio buffers until output transcript passes moderation (verdict clean) before releasing audio to students.',
                    '针对未成年学生，语音流在网关全缓冲并收集完整转写文本，通过内容安全审核（moderateText）后才释放音频。'
                  )}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3">
                <div className="font-bold text-teal-900 mb-1">
                  {t('💳 CostLedger Atomic Micro-Cent Quota', '💳 CostLedger 原子微美分预算防爆')}
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {t(
                    'Single-threaded atomic /reserve → /settle ledger with daily caps (Free: 30 calls/day · Pro: 300 calls/day).',
                    '采用单线程原子预留（/reserve）与实际用量结算（/settle），配合每日配额上限（免费档 30 次/天 · Pro 档 300 次/天）。'
                  )}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3">
                <div className="font-bold text-teal-900 mb-1">
                  {t('🔒 U18 Parent Consent & PBKDF2', '🔒 13–17岁家长同意与安全认证')}
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {t(
                    'Stamps CONSENT_VERSION (trial-notice-2026-11-08) with age-band separation (adult vs u18-parent) and PBKDF2-SHA256 100k iterations.',
                    '记录试用须知版本号（trial-notice-2026-11-08）与年龄段分层（adult / u18-parent），保障未成年人合规试用。'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {t('Got It, Back to Oral Practice', '了解完毕，返回口试练习')}
          </button>
        </div>
      </div>
    </div>
  );
};
