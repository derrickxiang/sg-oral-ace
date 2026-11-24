import React from 'react';
import { EvaluationResult } from '../types/oral';
import { Award, CheckCircle2, Clock, Target, Compass } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface RubricScoreCardProps {
  evaluation: EvaluationResult;
}

export const RubricScoreCard: React.FC<RubricScoreCardProps> = ({ evaluation }) => {
  const { t } = useLanguage();
  const { totalScore, band, rubric, practiceMode, prepSecondsUsed } = evaluation;

  const getTierStyle = () => {
    if (totalScore >= 42) {
      return {
        scoreText: 'text-emerald-700',
        labelText: 'text-emerald-900 bg-emerald-50 border-emerald-200',
        Icon: Award,
      };
    }
    if (totalScore >= 34) {
      return {
        scoreText: 'text-[#072B2E]',
        labelText: 'text-teal-900 bg-teal-50 border-teal-200',
        Icon: CheckCircle2,
      };
    }
    return {
      scoreText: 'text-amber-700',
      labelText: 'text-amber-900 bg-amber-50 border-amber-200',
      Icon: Target,
    };
  };

  const tier = getTierStyle();
  const TierIcon = tier.Icon;

  const dimensions = [
    {
      key: 'content',
      title: t('Content & Ideas', '思想内容'),
      subtitle: t('Depth & relevance', '紧扣题旨 · 个人例证'),
      data: rubric.content,
    },
    {
      key: 'expression',
      title: t('Structure & Logic', '表达与结构'),
      subtitle: t('Coherence & reasoning', '条理衔接 · 多维剖析'),
      data: rubric.expression,
    },
    {
      key: 'vocabulary',
      title: t('Vocabulary & Corpus', '词汇与语料'),
      subtitle: t('Idioms & local terms', '成语运用 · 新加坡词汇'),
      data: rubric.vocabulary,
    },
    {
      key: 'pronunciation',
      title: t('Pronunciation & Tone', '语音与发音'),
      subtitle: t('Clarity & polyphones', '声调规范 · 停连自然'),
      data: rubric.pronunciation,
    },
  ];

  const formatPrepTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6">
      {/* Top Reference Score & Tier Row */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-teal-800">
              {t(
                'Self-Practice Reference Evaluation · Advisory Only',
                '口语练习自测参考评估 · 仅供日常学习参考'
              )}
            </span>
            {practiceMode && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                  <Compass className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  {practiceMode === 'exam_sim'
                    ? t('Timed Exam Sim', '限时模拟模式')
                    : t('Guided Studio', '引导练习模式')}
                </span>
              </>
            )}
            {typeof prepSecondsUsed === 'number' && prepSecondsUsed > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {t('Prep:', '备考用时')} {formatPrepTime(prepSecondsUsed)}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-3 mt-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              <span className="text-sm font-semibold text-slate-500 mr-2 font-sans">
                {t('Reference Score', '参考分')}
              </span>
              <span className={`font-mono tabular-nums ${tier.scoreText}`}>{totalScore}</span>
              <span className="text-base text-slate-400 font-mono font-normal tabular-nums"> / 50</span>
            </h3>

            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${tier.labelText}`}
            >
              <TierIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{band}</span>
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5">
          <p>{t('Independent AI Study Coaching · Not Official Examination Grading', '独立 AI 陪练参考建议 · 不代表官方评分')}</p>
          <p className="text-emerald-700 font-semibold font-mono tabular-nums">
            {t('Mastery Benchmark: 42+ / 50 (Tier 1)', '进阶参考目标：42 分及以上 (Tier 1)')}
          </p>
        </div>
      </div>

      {/* 4 Rubric Dimensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {dimensions.map(({ key, title, subtitle, data }) => {
          const percentage = Math.min(100, Math.round((data.score / data.maxScore) * 100));
          const barColor =
            percentage >= 80
              ? 'bg-emerald-600'
              : percentage >= 65
              ? 'bg-[#0B3B3C]'
              : 'bg-amber-500';

          return (
            <div
              key={key}
              className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{title}</div>
                    <div className="text-[11px] text-slate-500">{subtitle}</div>
                  </div>
                  <div className="text-xs font-mono tabular-nums text-slate-600 shrink-0">
                    <strong className="text-base font-bold text-slate-900">{data.score}</strong>
                    <span className="text-slate-400">/{data.maxScore}</span>
                  </div>
                </div>

                {/* Crisp linear meter */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2.5">
                  <div
                    className={`${barColor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="text-[11px] font-semibold text-teal-800 mb-1.5">
                  {data.level} · <span className="font-mono tabular-nums">{percentage}%</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{data.feedback}</p>
              </div>

              {data.keyObservations && data.keyObservations.length > 0 && (
                <div className="pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                  {data.keyObservations.map((obs, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-700 font-bold">·</span>
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
