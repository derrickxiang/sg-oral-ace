import React, { useState } from 'react';
import { EvaluationResult, PronunciationIssue } from '../types/oral';
import {
  Calendar,
  TrendingUp,
  Volume2,
  Trash2,
  ChevronRight,
  Users,
  Download,
  Target,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Compass,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { playNaturalSpeech } from '../utils/naturalSpeech';
import {
  computeClassCohortInsights,
  computeStudentAnalytics,
  generateClassReportCsv,
} from '../utils/seabRubric';

interface WeeklyTrackerProps {
  history: EvaluationResult[];
  savedPronunciations: PronunciationIssue[];
  savedCorpusWords: string[];
  totalTopicCount?: number;
  onRemovePronunciation?: (word: string) => void;
  onSelectHistoryItem?: (item: EvaluationResult) => void;
  onJumpToWeakestTopic?: (dimensionKey: string) => void;
  onJumpToPractice?: () => void;
}

export const WeeklyTracker: React.FC<WeeklyTrackerProps> = ({
  history,
  savedPronunciations,
  savedCorpusWords,
  totalTopicCount = 40,
  onRemovePronunciation,
  onSelectHistoryItem,
  onJumpToWeakestTopic,
  onJumpToPractice,
}) => {
  const { lang, t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'pronunciation_book' | 'corpus_book' | 'class_insights'
  >('overview');
  const [selectedSchoolCode, setSelectedSchoolCode] = useState<string>('GROUP-A');

  // Compute student & cohort analytics
  const analytics = computeStudentAnalytics(history, savedPronunciations, totalTopicCount);
  const retestsCount = history.filter((h) => h.isRetest).length;
  const classInsights = computeClassCohortInsights(selectedSchoolCode, history);

  // Speak pronunciation
  const speakWord = (word: string) => {
    playNaturalSpeech(word, { voiceType: 'examiner', voiceName: 'Puck', rate: 0.85 });
  };

  const handleDownloadClassCsv = () => {
    const csvContent = generateClassReportCsv(classInsights);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OralAce_Class_${selectedSchoolCode}_Report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getWeakestCoachingHint = (key: string) => {
    switch (key) {
      case 'content':
        return t(
          'Add one concrete Singapore personal story (time, place, action) in every response.',
          '建议每次作答至少加入 1 个具体的新加坡个人生活或校园真实案例。'
        );
      case 'expression':
        return t(
          'Use ORID flow and 3+ connectives (之所以、不可否认、总而言之) to sharpen structure.',
          '建议遵循 ORID 思路并串联「之所以」「不可否认」「总而言之」提升条理。'
        );
      case 'vocabulary':
        return t(
          'Weave in 1–2 topic-specific idioms and local terms like 德育在于行动 (VIA).',
          '建议自然融入 1~2 个四字成语及新加坡本土规范表达（如 德育在于行动）。'
        );
      default:
        return t(
          'Drill high-frequency polyphones (角色, 提供, 塑料) and practice steady phrase pausing.',
          '建议重点磨练高频易错多音字（角色、提供、塑料）及句间自然停连节奏。'
        );
    }
  };

  // Build SVG trajectory points cleanly
  const svgW = 540;
  const svgH = 165;
  const padX = 34;
  const padTop = 18;
  const padBottom = 26;
  const plotW = svgW - padX * 2;
  const plotH = svgH - padTop - padBottom;

  const trajectoryPoints = analytics.trajectory.map((pt, idx) => {
    const count = analytics.trajectory.length;
    const x = count === 1 ? padX + plotW / 2 : padX + (idx / (count - 1)) * plotW;
    const clampedScore = Math.max(0, Math.min(50, pt.totalScore));
    const y = padTop + plotH - (clampedScore / 50) * plotH;
    return { ...pt, x, y };
  });

  const polylinePoints = trajectoryPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const tier1Y = padTop + plotH - (42 / 50) * plotH;

  return (
    <div className="space-y-6">
      {/* Studio Portfolio Header & Tabular KPI Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-teal-800">
                {t('OralAce Progress Analytics', 'OralAce 学习进度与错题追踪')}
              </span>
              <span aria-hidden="true">·</span>
              <span>{t('Personal Self-Practice Reference', '个人口语自测与进步参考')}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {t('Weekly Oral Practice & Analytics Studio', '每周口语练习与学情追踪看板')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            {t(
              'Track score progression across Guided Studio and Timed Exam Sim sessions, spot recurring pronunciation or reasoning gaps, and drill weak skills.',
              '实时追踪「引导练习」与「限时考场模拟」得分曲线、四维能力短板、重复发音错题与思维盲区，精准查漏补缺。'
            )}
          </p>
        </div>

        {/* 4-Column Tabular KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 block">
              {t('Topics Practiced', '已练习话题覆盖')}
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
              {analytics.uniqueTopicsPracticed}
              <span className="text-sm font-normal text-slate-400">
                {' '}
                / {analytics.totalTopicCount}
              </span>
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block font-mono tabular-nums">
              {analytics.totalSessions} {t('total sessions', '次累计练习')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 block">
              {t('Average Ref Score (/50)', '练习平均参考分 (/50)')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-[#072B2E]">
                {analytics.averageScore}
              </span>
              {analytics.scoreDeltaLastVsPrev !== null && (
                <span
                  className={`inline-flex items-center text-xs font-mono font-semibold tabular-nums ${
                    analytics.scoreDeltaLastVsPrev >= 0 ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {analytics.scoreDeltaLastVsPrev >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {analytics.scoreDeltaLastVsPrev >= 0 ? '+' : ''}
                  {analytics.scoreDeltaLastVsPrev}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block font-mono tabular-nums">
              {t('Best:', '最高：')} {analytics.bestScore}/50
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 block">
              {t('Studio vs Exam Sim', '引导 vs 限时模拟分布')}
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
              {analytics.guidedCount}
              <span className="text-slate-400 font-normal mx-1">/</span>
              <span className="text-amber-700">{analytics.examSimCount}</span>
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {t('Guided · Timed Exam Sim', '引导练习 · 考场限时模拟')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 block">
              {t('Retests & Tone Fixes', '二次再练与发音本')}
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
              {retestsCount}
              <span className="text-slate-400 font-normal mx-1">·</span>
              <span className="text-slate-900">{savedPronunciations.length}</span>
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {t('Retest attempts · Saved words', '再练对比 · 已收藏易错读音')}
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 gap-4 sm:gap-6 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'text-teal-900 border-b-2 border-teal-900'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {t(`Analytics & History (${history.length})`, `学情分析与历史 (${history.length})`)}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('pronunciation_book')}
          className={`pb-3 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'pronunciation_book'
              ? 'text-teal-900 border-b-2 border-teal-900'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {t(
            `Pronunciation Notebook (${savedPronunciations.length})`,
            `易错发音纠错本 (${savedPronunciations.length})`
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('corpus_book')}
          className={`pb-3 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'corpus_book'
              ? 'text-teal-900 border-b-2 border-teal-900'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {t(
            `Vocabulary & Corpus Bank (${savedCorpusWords.length})`,
            `高分语料积累库 (${savedCorpusWords.length})`
          )}
        </button>

        <button
          type="button"
          data-testid="tab-teacher-class-insights"
          onClick={() => setActiveSubTab('class_insights')}
          className={`pb-3 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'class_insights'
              ? 'text-teal-900 border-b-2 border-teal-900'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>{t('Teacher / Class Insights', '教师与班级学情看板')}</span>
        </button>
      </div>

      {/* 1. Analytics Overview & History List */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {history.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs">
              <Calendar className="w-11 h-11 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">
                {t('No Practice Sessions Recorded Yet', '暂无口语练习记录')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                {t(
                  'Complete a Guided Studio or Timed Exam Sim session under Oral Studio to unlock your score trajectory chart, dimension balance, and recurring gap tracker.',
                  '在「口语练习室」完成一次引导练习或限时考场模拟后，这里将自动呈现您的得分趋势图、四维能力分析与高频错题追踪。'
                )}
              </p>
              {onJumpToPractice && (
                <button
                  type="button"
                  onClick={onJumpToPractice}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B3B3C] hover:bg-teal-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{t('Start First Oral Session', '前往口语练习室开始练习')}</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Analytics Row: Score Trajectory SVG + 4-Dimension Mastery Balance */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Score Trajectory SVG Chart */}
                <div
                  data-testid="analytics-trajectory-card"
                  className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{t('Score Trajectory (Recent Sessions)', '近期练习参考得分趋势')}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t(
                          'Dashed benchmark marks 42/50 Tier 1 reference.',
                          '虚线为 42/50 分第一梯队参考基准线。'
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                        {t('Guided', '引导练习')}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        {t('Exam Sim', '限时模拟')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 overflow-x-auto">
                    <svg
                      viewBox={`0 0 ${svgW} ${svgH}`}
                      className="w-full h-44 min-w-[320px]"
                      role="img"
                      aria-label={t('Score trajectory chart', '得分趋势图表')}
                    >
                      {/* Horizontal grid lines */}
                      {[0, 25, 42, 50].map((val) => {
                        const y = padTop + plotH - (val / 50) * plotH;
                        const isBenchmark = val === 42;
                        return (
                          <g key={val}>
                            <line
                              x1={padX}
                              y1={y}
                              x2={svgW - padX}
                              y2={y}
                              stroke={isBenchmark ? '#059669' : '#E2E8F0'}
                              strokeWidth={isBenchmark ? 1.2 : 1}
                              strokeDasharray={isBenchmark ? '4 4' : undefined}
                            />
                            <text
                              x={padX - 6}
                              y={y + 3}
                              textAnchor="end"
                              fontSize="10"
                              fill={isBenchmark ? '#047857' : '#94A3B8'}
                              fontFamily="monospace"
                            >
                              {val}
                            </text>
                          </g>
                        );
                      })}

                      {/* Tier 1 annotation */}
                      <text
                        x={svgW - padX}
                        y={tier1Y - 4}
                        textAnchor="end"
                        fontSize="9"
                        fill="#047857"
                      >
                        42+ Tier 1
                      </text>

                      {/* Line path */}
                      {trajectoryPoints.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="#0B3B3C"
                          strokeWidth="2.2"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          points={polylinePoints}
                        />
                      )}

                      {/* Data points */}
                      {trajectoryPoints.map((pt, i) => {
                        const fill = pt.practiceMode === 'exam_sim' ? '#D97706' : '#059669';
                        return (
                          <g key={pt.id || i}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="4.5"
                              fill={fill}
                              stroke="#FFFFFF"
                              strokeWidth="1.5"
                            />
                            <text
                              x={pt.x}
                              y={pt.y - 8}
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight="700"
                              fill="#0F172A"
                              fontFamily="monospace"
                            >
                              {pt.totalScore}
                            </text>
                            <text
                              x={pt.x}
                              y={svgH - 6}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#64748B"
                            >
                              {pt.dateLabel}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* 4-Dimension Mastery Balance + Weakest Skill Drill CTA */}
                <div
                  data-testid="analytics-dimension-balance-card"
                  className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 pb-3 border-b border-slate-100">
                      <Target className="w-4 h-4 text-teal-800 shrink-0" />
                      <span>{t('4-Dimension Mastery Balance', '四维能力均衡度分析')}</span>
                    </div>

                    <div className="space-y-3 pt-3">
                      {analytics.dimensionMastery.map((dim) => {
                        const barColor =
                          dim.percentage >= 80
                            ? 'bg-emerald-600'
                            : dim.percentage >= 65
                            ? 'bg-[#0B3B3C]'
                            : 'bg-amber-500';
                        return (
                          <div key={dim.key}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-800">
                                {t(dim.labelEn, dim.labelZh)}
                              </span>
                              <span className="font-mono tabular-nums text-slate-700">
                                <strong>{dim.avgScore}</strong>/{dim.maxScore}{' '}
                                <span className="text-slate-400">({dim.percentage}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`${barColor} h-full rounded-full transition-all duration-500`}
                                style={{ width: `${dim.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {analytics.weakestDimension && (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-amber-950">
                          {t('Priority Focus:', '当前优先提升项：')}{' '}
                          {t(
                            analytics.weakestDimension.labelEn,
                            analytics.weakestDimension.labelZh
                          )}
                        </span>
                        <span className="font-mono font-bold text-amber-800 tabular-nums">
                          {analytics.weakestDimension.percentage}%
                        </span>
                      </div>
                      <p className="text-slate-700 leading-snug">
                        {getWeakestCoachingHint(analytics.weakestDimension.key)}
                      </p>
                      {onJumpToWeakestTopic && (
                        <button
                          type="button"
                          data-testid="btn-practice-weakest-skill"
                          onClick={() =>
                            onJumpToWeakestTopic(analytics.weakestDimension!.key)
                          }
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#072B2E] hover:text-emerald-700 underline cursor-pointer"
                        >
                          <span>{t('Jump to Recommended Practice Topic →', '前往针对性强化话题练习 →')}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Recurring Pronunciation Traps & Reasoning Gaps Card */}
              <div
                data-testid="analytics-recurring-gaps-card"
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {t(
                        'Recurring Pronunciation & Reasoning Gap Tracker',
                        '重复易错读音与论述结构盲区追踪'
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {t('Aggregated across all completed sessions', '基于全部历史作答自动统计')}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Top Recurring Tone/Polyphone Traps */}
                  <div className="lg:col-span-7 space-y-2.5">
                    <div className="text-xs font-semibold text-slate-600">
                      {t('Repeated Phonetic / Polyphone Flags', '高频提醒字词与多音字')}
                    </div>
                    {analytics.recurringPronunciationTraps.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3">
                        {t(
                          'No repeated pronunciation traps detected yet — keep maintaining clear Mandarin tones!',
                          '暂未检测到重复高频发音误区，请继续保持清晰标准的声调表达！'
                        )}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {analytics.recurringPronunciationTraps.map((trap) => (
                          <div
                            key={trap.word}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-slate-900 text-sm">
                                  {trap.word}
                                </span>
                                <span className="text-xs font-mono text-teal-800">
                                  [{trap.pinyin}]
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                                {t(
                                  `Flagged in ${trap.occurrences} session(s)`,
                                  `累计提示 ${trap.occurrences} 次`
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => speakWord(trap.word)}
                              className="p-1.5 rounded-lg bg-white hover:bg-teal-50 text-teal-800 border border-slate-200 cursor-pointer shrink-0"
                              title={t('Listen standard pronunciation', '收听标准读音')}
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recurring Logic Gaps */}
                  <div className="lg:col-span-5 space-y-2.5">
                    <div className="text-xs font-semibold text-slate-600">
                      {t('Reasoning & Expression Habit Counters', '表达习惯与论述完整度统计')}
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-700">
                          {t('Sessions missing a personal story', '缺少具体个人生活实例场次')}
                        </span>
                        <span className="font-mono font-bold tabular-nums text-amber-700">
                          {analytics.recurringLogicGaps.missingPersonalExampleCount} /{' '}
                          {analytics.totalSessions}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-700">
                          {t('Sessions needing multi-angle perspectives', '需拓展家庭/校园/社会多视角场次')}
                        </span>
                        <span className="font-mono font-bold tabular-nums text-amber-700">
                          {analytics.recurringLogicGaps.missingMultiAngleCount} /{' '}
                          {analytics.totalSessions}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-700">
                          {t('Sessions with fewer than 2 connectives', '逻辑衔接词偏少 (<2个) 场次')}
                        </span>
                        <span className="font-mono font-bold tabular-nums text-slate-800">
                          {analytics.recurringLogicGaps.lowConnectivesCount} /{' '}
                          {analytics.totalSessions}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chronological Practice Sessions List */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('Archived Session Reports (Click to Reopen)', '历史练习诊断档案（点击可重温完整报告）')}
                </div>
                {history.map((item, index) => (
                  <div
                    key={item.id || index}
                    onClick={() => onSelectHistoryItem && onSelectHistoryItem(item)}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:border-teal-800/40 transition-colors cursor-pointer flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono tabular-nums">
                          {new Date(item.createdAt).toLocaleDateString(
                            lang === 'en' ? 'en-SG' : 'zh-CN',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-teal-800">
                          {item.practiceMode === 'exam_sim'
                            ? t('Timed Exam Sim', '限时考场模拟')
                            : t('Guided Studio', '引导练习')}
                        </span>
                        {item.isRetest && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-emerald-700">
                              {t('Retest Leap', '二次再练对比')}
                            </span>
                          </>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">{item.topicTitle}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 italic">
                        “{item.initialTranscript}”
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">
                          {t('Ref Score', '参考分')}
                        </span>
                        <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                          {item.totalScore}
                          <span className="text-xs text-slate-400 font-normal"> / 50</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                            item.totalScore >= 42
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : item.totalScore >= 34
                              ? 'bg-teal-50 text-teal-900 border-teal-200'
                              : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}
                        >
                          {item.band.split(' ')[0]}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. Pronunciation Notebook */}
      {activeSubTab === 'pronunciation_book' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t('Personal Pronunciation & Tone Notebook', '学生专属易错发音本')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'Review bookmarked polyphonic characters and Mandarin tones for accurate delivery',
                  '针对新加坡常见读音误区，反复磨练四声与多音字，确保表达清晰规范'
                )}
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums font-semibold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              {t(`${savedPronunciations.length} Saved`, `共记录 ${savedPronunciations.length} 处`)}
            </span>
          </div>

          {savedPronunciations.length === 0 ? (
            <p className="text-center py-10 text-slate-400 text-xs">
              {t(
                'No pronunciation items saved yet. Click the bookmark icon on any Pronunciation Correction card during practice to add it here.',
                '暂未收藏发音问题。在口试练习时，点击发音纠错卡片旁的“书签”图标即可加入本纠错本。'
              )}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPronunciations.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900">{item.word}</span>
                        <span className="text-xs font-mono font-semibold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {item.pinyin}
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-800 block mt-1">
                        {t('Tone: ', '调值：')}
                        {item.toneInfo}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => speakWord(item.word)}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-teal-50 text-teal-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        title={t('Listen to standard pronunciation', '标准读音')}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      {onRemovePronunciation && (
                        <button
                          type="button"
                          onClick={() => onRemovePronunciation(item.word)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title={t('Remove from notebook', '移出纠错本')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200/70">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Corpus Notebook */}
      {activeSubTab === 'corpus_book' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">
              {t('High-Scoring Corpus & Idioms Bank', '学生高分语料库积累')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(
                'Essential connectives, four-character idioms, and standard Singapore Chinese vocabulary',
                '积累高频转折词、四字成语与新加坡本土规范用语'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {[
              {
                phrase: '举手之劳',
                pinyin: 'jǔ shǒu zhī láo',
                note: t('A small, effortless act (e.g. returning hawker trays)', '形容小贩中心归还托盘、随手捡垃圾'),
              },
              {
                phrase: '潜移默化',
                pinyin: 'qián yí mò huà',
                note: t('Subtle, positive influence from family & school education', '家庭与学校教育的无形熏陶'),
              },
              {
                phrase: '双管齐下',
                pinyin: 'shuāng guǎn qí xià',
                note: t('Two-pronged approach combining enforcement & moral education', '法律严惩与品德培育并重'),
              },
              {
                phrase: '老吾老以及人之老',
                pinyin: 'lǎo wú lǎo...',
                note: t('Extending respect & care to all elderly in the community', '社区关怀独居乐龄人士'),
              },
              {
                phrase: '迫在眉睫',
                pinyin: 'pò zài méi jié',
                note: t('An urgent matter (e.g. Semakau Landfill capacity crisis)', '实马高垃圾填埋场饱和危机'),
              },
              {
                phrase: '防患于未然',
                pinyin: 'fáng huàn yú wèi rán',
                note: t('Taking preventive measures before problems occur (anti-scam)', '防范网络诈骗与数码安全'),
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">{item.phrase}</span>
                    <span className="text-[11px] font-mono text-teal-800 block mt-0.5">
                      {item.pinyin}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakWord(item.phrase)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-teal-800 hover:bg-teal-50 cursor-pointer shrink-0"
                    title={t('Listen pronunciation', '收听读音')}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Teacher / Class Insights Dashboard */}
      {activeSubTab === 'class_insights' && (
        <div
          data-testid="teacher-class-insights-panel"
          className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6"
        >
          {/* Top Study Group Selector & Export CSV Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-semibold text-teal-800">
                {t(
                  'Study Group Practice Reference Overview',
                  '学习小组口语练习参考趋势看板（仅供练习参考）'
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                {t(
                  `Group Practice Reference · ${classInsights.schoolCode}`,
                  `小组练习参考记录 · 编号 ${classInsights.schoolCode}`
                )}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl">
                {['GROUP-A', 'GROUP-B', 'SEC-PRACTICE', 'ORAL-CLUB'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedSchoolCode(code)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      selectedSchoolCode === code
                        ? 'bg-[#0B3B3C] text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>

              <button
                type="button"
                data-testid="btn-export-class-csv"
                onClick={handleDownloadClassCsv}
                className="inline-flex items-center gap-1.5 bg-[#0B3B3C] hover:bg-teal-900 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>{t('Export Class CSV', '导出小组记录 CSV')}</span>
              </button>
            </div>
          </div>

          {/* Cohort Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">
                {t('Active Students', '参训学生人数')}
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
                {classInsights.totalStudents}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">
                {t('Class Avg Ref (/50)', '小组参考平均分 (/50)')}
              </span>
              <span className="text-xl font-bold font-mono text-teal-900 mt-1 block tabular-nums">
                {classInsights.classAverageScore}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">
                {t('Avg Reading Aloud (/10)', '朗读参考平均分 (/10)')}
              </span>
              <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block tabular-nums">
                {classInsights.classAverageReadingAloud}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">
                {t('Tier 1 & 2 Rate', 'Tier 1 & 2 占比')}
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
                {Math.round(
                  ((classInsights.bandDistribution.band1 +
                    classInsights.bandDistribution.band2) /
                    Math.max(1, classInsights.totalStudents)) *
                    100
                )}
                %
              </span>
            </div>
          </div>

          {/* Top Class-Wide Mispronounced Words */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t(
                'Top Cohort Polyphonic & Tone Focus (Recommended for Group Drill)',
                '小组高频易错多音字与声调参考（建议集中听写纠音）'
              )}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {classInsights.topClassPronunciationTraps.map((trap, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{trap.word}</div>
                    <div className="text-[11px] font-mono text-teal-800">{trap.pinyin}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                      {t(`${trap.errorCount} occurrences`, `累计出现 ${trap.errorCount} 次`)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakWord(trap.word)}
                    className="p-2 rounded-lg bg-white hover:bg-teal-50 text-teal-800 border border-slate-200 cursor-pointer shrink-0"
                    title={t('Play standard pronunciation', '播放标准示范读音')}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">{t('Learner Name', '练习者姓名')}</th>
                  <th className="py-2.5 px-3 font-mono">{t('Sessions', '练习次数')}</th>
                  <th className="py-2.5 px-3 font-mono">{t('Reading (/10)', '朗读参考 (/10)')}</th>
                  <th className="py-2.5 px-3 font-mono">{t('Ref Score (/50)', '参考分 (/50)')}</th>
                  <th className="py-2.5 px-3">{t('Reference Tier', '参考区间')}</th>
                  <th className="py-2.5 px-3">{t('Primary Phonetic Focus', '建议留意读音')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classInsights.students.map((stu) => (
                  <tr key={stu.studentId} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {stu.studentName}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">
                      {stu.sessionsCompleted}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-teal-800 font-semibold">
                      {stu.readingAloudScore}/10
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums font-bold text-slate-900">
                      {stu.latestScore}/50
                    </td>
                    <td className="py-2.5 px-3 text-xs text-emerald-800 font-medium">
                      {stu.band}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-amber-800">
                      {stu.topPronunciationTrap}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
