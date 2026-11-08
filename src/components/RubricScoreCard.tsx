import React from 'react';
import { EvaluationResult } from '../types/oral';
import { Award, Check, TrendingUp, BarChart3, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface RubricScoreCardProps {
  evaluation: EvaluationResult;
}

export const RubricScoreCard: React.FC<RubricScoreCardProps> = ({ evaluation }) => {
  const { t } = useLanguage();
  const { totalScore, band, rubric } = evaluation;

  // Band styling
  const getBandBadgeClass = () => {
    if (totalScore >= 42) return 'bg-emerald-600 text-white';
    if (totalScore >= 34) return 'bg-blue-600 text-white';
    if (totalScore >= 25) return 'bg-amber-600 text-white';
    return 'bg-rose-600 text-white';
  };

  const dimensions = [
    { key: 'content', title: t('Content & Ideas (思想内容)', '思想内容'), data: rubric.content, color: 'bg-indigo-500' },
    { key: 'expression', title: t('Structure & Expression (表达结构)', '表达与结构'), data: rubric.expression, color: 'bg-blue-500' },
    { key: 'vocabulary', title: t('Vocabulary & Corpus (词汇语料)', '词汇与语料'), data: rubric.vocabulary, color: 'bg-emerald-500' },
    { key: 'pronunciation', title: t('Pronunciation & Tone (语音发音)', '语音与发音'), data: rubric.pronunciation, color: 'bg-rose-500' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
      {/* Top Reference Score & Tier Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            {t(
              'Self-Practice Reference Evaluation (For Study Reference Only)',
              '口语练习自测参考评估（仅供日常练习参考，非官方评分）'
            )}
          </span>
          <div className="flex items-center space-x-3 mt-1">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
              {t('Reference Score: ', '练习参考分：')}
              <span className="text-red-600">{totalScore}</span>
              <span className="text-base text-gray-400 font-normal"> / 50</span>
            </h3>
            <span className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full shadow-xs ${getBandBadgeClass()}`}>
              {band}
            </span>
          </div>
        </div>

        <div className="text-right text-xs text-gray-500 hidden sm:block">
          <p>{t('Independent AI Practice Reference · Advisory Suggestions Only', 'AI 陪练自测参考 · 旨在提供表达启发与改进建议')}</p>
          <p className="text-emerald-700 font-medium">
            {t('Practice Goal Reference: Tier 1 (42+ pts)', '练习进步参考目标：42分及以上')}
          </p>
        </div>
      </div>

      {/* 4 Rubric Dimensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {dimensions.map(({ key, title, data, color }) => {
          const percentage = (data.score / data.maxScore) * 100;
          return (
            <div key={key} className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700">{title}</span>
                  <span className="text-xs font-mono font-bold text-gray-900">
                    <strong className="text-sm">{data.score}</strong> / {data.maxScore}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className={`${color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="inline-block bg-white text-gray-700 border border-gray-200 text-[11px] font-semibold px-2 py-0.5 rounded-md mb-2">
                  {data.level}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  {data.feedback}
                </p>
              </div>

              {data.keyObservations && data.keyObservations.length > 0 && (
                <div className="pt-2 border-t border-gray-200/60 text-[11px] text-gray-500 space-y-1">
                  {data.keyObservations.map((obs, i) => (
                    <div key={i} className="flex items-start space-x-1">
                      <span className="text-gray-400">•</span>
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

