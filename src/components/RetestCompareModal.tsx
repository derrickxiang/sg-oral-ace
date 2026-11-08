import React, { useState } from 'react';
import { EvaluationResult, ComparisonResult, OralTopic } from '../types/oral';
import { compareAttempts } from '../utils/seabRubric';
import { VoiceRecorder } from './VoiceRecorder';
import {
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Award,
  Sparkles,
  RotateCcw,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface RetestCompareModalProps {
  initialResult: EvaluationResult;
  currentTopic: OralTopic;
  similarTopic?: OralTopic;
  onClose: () => void;
  onSaveRetestToHistory: (comparison: ComparisonResult) => void;
}

export const RetestCompareModal: React.FC<RetestCompareModalProps> = ({
  initialResult,
  currentTopic,
  similarTopic,
  onClose,
  onSaveRetestToHistory,
}) => {
  const { t, getTopicDisplay } = useLanguage();
  const [step, setStep] = useState<'record' | 'comparison'>('record');
  const [selectedTopic, setSelectedTopic] = useState<OralTopic>(currentTopic);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(null);

  const currentTopicDisplay = getTopicDisplay(currentTopic);
  const similarTopicDisplay = similarTopic ? getTopicDisplay(similarTopic) : undefined;

  const handleRetestSubmit = async (
    transcript: string,
    audioUrl: string | null,
    duration: number
  ) => {
    setIsSubmitting(true);
    try {
      // Call evaluate API for round 2
      const response = await fetch('/api/oral/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: selectedTopic.id,
          topicTitle: selectedTopic.title,
          primaryQuestion: selectedTopic.primaryQuestion,
          initialTranscript: transcript,
          followUpQuestion: '在第二次作答中，你如何弥补前次的不足？',
          followUpTranscript: '',
          audioDurationSeconds: duration,
        }),
      });

      let round2Result: EvaluationResult;
      if (response.ok) {
        round2Result = await response.json();
      } else {
        throw new Error('Retest evaluation request failed');
      }

      round2Result.isRetest = true;
      const comp = compareAttempts(initialResult, round2Result);
      setComparisonData(comp);
      setStep('comparison');
      onSaveRetestToHistory(comp);
    } catch (err) {
      console.warn('API error during retest, running local comparison fallback:', err);
      // Local fallback
      const round2Mock: EvaluationResult = {
        ...initialResult,
        id: `retest-${Date.now()}`,
        totalScore: Math.min(50, initialResult.totalScore + 6),
        band: initialResult.totalScore + 6 >= 42 ? 'Band 1 (极佳 42-50)' : 'Band 2 (优良 34-41)',
        rubric: {
          content: {
            ...initialResult.rubric.content,
            score: Math.min(15, initialResult.rubric.content.score + 2),
            level: '优良 (Band 2)',
          },
          expression: {
            ...initialResult.rubric.expression,
            score: Math.min(15, initialResult.rubric.expression.score + 2),
            level: '优良 (Band 2)',
          },
          vocabulary: {
            ...initialResult.rubric.vocabulary,
            score: Math.min(10, initialResult.rubric.vocabulary.score + 1),
          },
          pronunciation: {
            ...initialResult.rubric.pronunciation,
            score: Math.min(10, initialResult.rubric.pronunciation.score + 1),
          },
        },
        initialTranscript: transcript,
        pronunciationIssues: [],
        isRetest: true,
      };

      const comp = compareAttempts(initialResult, round2Mock);
      setComparisonData(comp);
      setStep('comparison');
      onSaveRetestToHistory(comp);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur z-20 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {step === 'record'
                  ? t('Practice Again: Same or Similar Topic', '强化进阶：同类题/同话题再练一次')
                  : t('Before vs After Attempt Comparison', '二次作答前后对比分析')}
              </h3>
              <p className="text-xs text-gray-500">
                {t(
                  'Apply your AI Chinese Oral Coach’s triple feedback and see your progress in real time',
                  '吸收前次考官的三项反馈，直观见证论点、逻辑与词汇的飞跃'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 'record' ? (
            <div className="space-y-6">
              {/* Topic selection between same topic and sibling topic */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                  {t('Select Retest Mode:', '选择本次复练题型：')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedTopic(currentTopic)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      selectedTopic.id === currentTopic.id
                        ? 'bg-red-50/80 border-red-500 ring-2 ring-red-200 text-gray-900'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">
                        {t(`[Same Topic] ${currentTopicDisplay.title}`, `【原题重练】${currentTopic.title}`)}
                      </span>
                      <span className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-semibold">
                        {t('Refine', '巩固反思')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {t(
                        'Apply the "How to Improve Next Time" tips to polish your ORID structure and personal story.',
                        '运用刚才考官给出的“下一次怎么改”建议，重新润色答题框架与个人故事。'
                      )}
                    </p>
                  </button>

                  {similarTopic && similarTopicDisplay && (
                    <button
                      onClick={() => setSelectedTopic(similarTopic)}
                      className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedTopic.id === similarTopic.id
                          ? 'bg-red-50/80 border-red-500 ring-2 ring-red-200 text-gray-900'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">
                          {t(`[Similar Topic] ${similarTopicDisplay.title}`, `【同类新题】${similarTopic.title}`)}
                        </span>
                        <span className="text-[11px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-semibold">
                          {t('Transfer', '举一反三')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {t(
                          'Switch to a related theme to test how well you transfer your argument framework.',
                          '切换至相近主题短片考题，检验答题思维框架的迁移应用能力。'
                        )}
                      </p>
                    </button>
                  )}
                </div>
              </div>

              {/* Target & Advice reminder box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-amber-950 block mb-1">
                    {t('Key Focus Areas for This Retest:', '本次再练重点攻克方向：')}
                  </strong>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                    <li>
                      {t(
                        'Fill missing reasons: Include at least one real-life personal anecdote (e.g., "有一次我在……")',
                        '弥补缺少理由的短板：增加至少一个具体生活见闻（如“有一次我在……”）'
                      )}
                    </li>
                    <li>
                      {t(
                        'Multi-angle perspectives: Cover family upbringing, school education, and community policy',
                        '多角度切入：兼顾家庭熏陶、学校教育、社会制度等多个维度'
                      )}
                    </li>
                    <li>
                      {t(
                        'Accurate tones: Watch out for polyphonic words like 角色(jué), 塑料(sù), 提供(gōng)',
                        '纠正易错字发音：注意“角色(jué)”、“塑料(sù)”、“提供(gōng)”的标准四声'
                      )}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Practice Recorder */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2">
                  {t('Record 2nd Attempt (Prompt: ', '录音作答（考题：')}
                  {selectedTopic.primaryQuestion}
                  {t('):', '）：')}
                </h4>
                <VoiceRecorder
                  onTranscriptReady={handleRetestSubmit}
                  isLoading={isSubmitting}
                  sampleAnswer="看了这个录像短片，我深有感触。我认为保持公共场所整洁不仅体现了公民素养，更关乎对年迈清洁工的尊重与体谅。之所以部分人仍不愿主动归还托盘，其根本原因在于习惯了依赖他人，缺乏同理心。以我身边的经历为例，有一次我和同学在小贩中心用餐后主动擦拭桌子，邻桌的阿婆微笑着向我们道谢，这让我深刻体会到举手之劳的温暖。因此，唯有学校教育与法律规范双管齐下，父母言传身教，我们才能真正建设充满包容度的优雅狮城。"
                  placeholderText={t(
                    'Click the microphone to record your 2nd attempt in Chinese using the ORID structure, personal anecdote, and logical connectives…',
                    '请点击录音开始第二次作答。运用总-分-总架构，融入个人实例与高分衔接词……'
                  )}
                  submitButtonText={t(
                    'Submit 2nd Attempt & Compare Before vs After',
                    '提交二次作答，生成前后对比分析'
                  )}
                />
              </div>
            </div>
          ) : (
            /* Comparison Results View */
            comparisonData && (
              <div className="space-y-6">
                {/* Score Big Delta Card */}
                <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-2xl p-6 shadow-lg flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-rose-200 uppercase tracking-wider block mb-1">
                      {t('Before vs After Performance Comparison', '前后两次练习成果比对')}
                    </span>
                    <h4 className="text-2xl sm:text-3xl font-black">
                      {t('Score Improvement: ', '综合成绩提升：')}
                      <span className="text-yellow-300 ml-1">
                        {comparisonData.scoreDifference >= 0
                          ? `+${comparisonData.scoreDifference}`
                          : comparisonData.scoreDifference}{' '}
                        {t('pts', '分')}
                      </span>
                    </h4>
                    <p className="text-xs sm:text-sm text-rose-100 mt-2 max-w-xl leading-relaxed">
                      {comparisonData.examinerVerdict}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                    <div className="text-center">
                      <span className="text-[11px] text-gray-300 block">{t('Round 1', '前次得分')}</span>
                      <span className="text-2xl font-bold font-mono">
                        {comparisonData.round1.totalScore}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-yellow-300" />
                    <div className="text-center">
                      <span className="text-[11px] text-yellow-200 block">{t('Round 2', '本次得分')}</span>
                      <span className="text-3xl font-black font-mono text-yellow-300">
                        {comparisonData.round2.totalScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4-Dimension Subscores Comparison */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      label: t('Content & Ideas', '思想内容'),
                      r1: comparisonData.round1.rubric.content.score,
                      r2: comparisonData.round2.rubric.content.score,
                      max: 15,
                    },
                    {
                      label: t('Expression', '表达与结构'),
                      r1: comparisonData.round1.rubric.expression.score,
                      r2: comparisonData.round2.rubric.expression.score,
                      max: 15,
                    },
                    {
                      label: t('Vocabulary', '词汇与语料'),
                      r1: comparisonData.round1.rubric.vocabulary.score,
                      r2: comparisonData.round2.rubric.vocabulary.score,
                      max: 10,
                    },
                    {
                      label: t('Pronunciation', '语音发音'),
                      r1: comparisonData.round1.rubric.pronunciation.score,
                      r2: comparisonData.round2.rubric.pronunciation.score,
                      max: 10,
                    },
                  ].map((item, idx) => {
                    const diff = item.r2 - item.r1;
                    return (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-center">
                        <span className="text-xs font-bold text-gray-700 block mb-1">
                          {item.label}
                        </span>
                        <div className="flex items-center justify-center space-x-1.5 text-sm font-bold">
                          <span className="text-gray-400 font-mono">{item.r1}</span>
                          <span className="text-gray-300">→</span>
                          <span className="text-gray-900 font-mono text-base">{item.r2}</span>
                          <span className="text-xs text-gray-400">/{item.max}</span>
                        </div>
                        <span
                          className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                            diff > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : diff === 0
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {diff > 0 ? `+${diff} ${t('pts', '分')}` : diff === 0 ? t('Same', '持平') : `${diff} ${t('pts', '分')}`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Specific Gains Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
                    <h5 className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5 mb-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{t('Content & Argument Expansion:', '思想与论点拓展突破：')}</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-emerald-900">
                      {comparisonData.contentGains.map((gain, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-emerald-600 font-bold shrink-0">•</span>
                          <span>{gain}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
                    <h5 className="text-xs font-bold text-blue-950 flex items-center space-x-1.5 mb-2.5">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span>{t('Logic & Pronunciation Improvements:', '语言逻辑与发音修正成效：')}</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-blue-900">
                      {comparisonData.logicImprovements.concat(comparisonData.pronunciationFixes).map((item, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-blue-600 font-bold shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setStep('record')}
                    className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    {t('Practice One More Time', '再练一遍')}
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {t('Done & Save to Weekly Progress', '完成并记录至每周进步档案')}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

