import React from 'react';
import { EvaluationResult } from '../types/oral';
import { Award, Check, TrendingUp, BarChart3, HelpCircle } from 'lucide-react';

interface RubricScoreCardProps {
  evaluation: EvaluationResult;
}

export const RubricScoreCard: React.FC<RubricScoreCardProps> = ({ evaluation }) => {
  const { totalScore, band, rubric } = evaluation;

  // Band styling
  const getBandBadgeClass = () => {
    if (totalScore >= 42) return 'bg-emerald-600 text-white';
    if (totalScore >= 34) return 'bg-blue-600 text-white';
    if (totalScore >= 25) return 'bg-amber-600 text-white';
    return 'bg-rose-600 text-white';
  };

  const dimensions = [
    { key: 'content', title: '思想内容', data: rubric.content, color: 'bg-indigo-500' },
    { key: 'expression', title: '表达与结构', data: rubric.expression, color: 'bg-blue-500' },
    { key: 'vocabulary', title: '词汇与语料', data: rubric.vocabulary, color: 'bg-emerald-500' },
    { key: 'pronunciation', title: '语音与发音', data: rubric.pronunciation, color: 'bg-rose-500' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
      {/* Top Total Score & Band Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            新加坡教育部 SEAB 评分标准
          </span>
          <div className="flex items-center space-x-3 mt-1">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
              综合得分：<span className="text-red-600">{totalScore}</span>
              <span className="text-base text-gray-400 font-normal"> / 50</span>
            </h3>
            <span className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full shadow-xs ${getBandBadgeClass()}`}>
              {band}
            </span>
          </div>
        </div>

        <div className="text-right text-xs text-gray-500 hidden sm:block">
          <p>O-Level 华文试卷三（口试录像与会话）</p>
          <p className="text-emerald-700 font-medium">目标区间：Band 1 (42分及以上)</p>
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
