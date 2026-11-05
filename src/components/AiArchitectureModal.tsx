import React from 'react';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  MessageSquare,
  CheckCircle2,
  Cpu,
  Zap,
  Volume2,
  X,
  FileCheck,
  TrendingUp,
} from 'lucide-react';

interface AiArchitectureModalProps {
  onClose: () => void;
}

export const AiArchitectureModal: React.FC<AiArchitectureModalProps> = ({ onClose }) => {
  const aiApplications = [
    {
      step: '01',
      icon: MessageSquare,
      title: 'AI 动态追问生成 (Dynamic Follow-up Questioning)',
      subtitle: '基于 Google Gemini 3.8 Flash 考官角色微调',
      desc: '与传统预设题库不同，AI 实时研读学生刚才的录音文本，抓取考生论述中的“漏洞”或“单向思维”（如考生只提重罚而忽略教育，或表达过于空泛缺少个人经历），即时生成 1 对 1 的具有针对性和启发性的考官追问。',
      tech: 'Gemini 3.8 Flash + Few-Shot Singapore MOE Examiner Prompting + JSON Schema Response',
      badge: '深度互动核心',
    },
    {
      step: '02',
      icon: BrainCircuit,
      title: '三项核心定向诊断反馈 (Triple Diagnostic Reasoning)',
      subtitle: '哪里表达清楚 · 哪里缺少理由 · 下一次怎么改',
      desc: '运用大语言模型的自然语言理解能力，深度拆解学生的论据链条：① 识别亮点与有效逻辑连接词；② 定位成因分析缺失与生活案例盲区；③ 基于 ORID 架构（见闻-感受-剖析-建议）自动为学生生成专属的高分示范表达。',
      tech: 'Chain-of-Thought (思维链) + ORID 会话框架推理 + 对比归因分析',
      badge: '教学反馈核心',
    },
    {
      step: '03',
      icon: FileCheck,
      title: '新加坡教育部 SEAB 考纲四维标准评分',
      subtitle: '思想内容 · 表达结构 · 词汇语料 · 语音发音',
      desc: '将新加坡中学会考 Paper 3 考纲标准内化为 AI 评分准则，对满分 50 分进行多维度量化评定，输出 Band 1 (42-50)、Band 2 (34-41)、Band 3 (25-33) 等级预测与针对性评语。',
      tech: 'SEAB Rubric Matrix + Multi-Criteria Evaluation Scoring Engine',
      badge: '会考考纲对齐',
    },
    {
      step: '04',
      icon: Volume2,
      title: '语音识别、发音纠错与声调扫描',
      subtitle: '新加坡华语常见易错多音字与规范声调纠正',
      desc: '结合 Web Speech API 进行实时语音转文字，并联动新加坡语料库对“角色(jué)”、“提供(gōng)”、“塑料(sù)”、“潜移默化(qián)”等高发混淆字进行精准声调比对与纠错，并驱动标准发音音频合成示范。',
      tech: 'Web Speech API + Singapore Polyphonic Trap Lexicon + Web SpeechSynthesis',
      badge: '语音声调护航',
    },
    {
      step: '05',
      icon: TrendingUp,
      title: '同类题再练前后对比引擎 (Before-and-After Delta)',
      subtitle: '同话题重练或同类新题迁移能力比对',
      desc: '当学生吸收考官反馈进行二次作答时，AI 引擎比对前后两轮的论点深度、信息量扩展（如字数从 130 字增至 196 字）、高分词汇使用率与发音纠正率，直观呈现提分增量。',
      tech: 'Semantic Difference Analysis + Score Delta + Examiner Verdict Synthesis',
      badge: '提分见证闭环',
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
                <h3 className="font-bold text-gray-900 text-lg">AI 核心技术与应用全景解析</h3>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                  Google Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-gray-500">
                本应用绝非泛泛的通用聊天机器人，而是深度聚焦新加坡 O-Level 华文口试的专业 AI 陪练系统
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
                  AI 驱动的五大核心业务节点
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  在“狮城口试宝”中，AI 贯穿了从<strong>看短片</strong>、<strong>录音作答</strong>、<strong>考官现场动态追问</strong>、<strong>三项核心诊断归因</strong>、<strong>发音纠错</strong>到<strong>同类题再练对比</strong>的整个学习与考评生命周期。
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
                    <span>底层技术栈：{app.tech}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Model & Architecture Diagram */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700">
            <h5 className="font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>双引擎混合架构保障（Hybrid Engine）：</span>
            </h5>
            <p className="leading-relaxed">
              <strong>1. 云端 Gemini 3.8 Flash 实时推理：</strong>负责大模型上下文深度追问生成与自由文本的高阶三项诊断。<br />
              <strong>2. 本地 SEAB 考纲规则引擎：</strong>在网络异常或离线备考时无缝承接，保障 100% 随时可用，不影响学生在考场的流畅冲刺练习。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
          >
            了解完毕，返回口试练习
          </button>
        </div>
      </div>
    </div>
  );
};
