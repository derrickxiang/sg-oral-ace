import React from 'react';
import { CoreTripleFeedback } from '../types/oral';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface TripleFeedbackCardProps {
  tripleFeedback: CoreTripleFeedback;
}

export const TripleFeedbackCard: React.FC<TripleFeedbackCardProps> = ({ tripleFeedback }) => {
  const { t } = useLanguage();
  const { clearExpression, missingReasons, nextTimeImprovements } = tripleFeedback;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between border-b border-slate-200 pb-3 gap-2">
        <h3 className="font-bold text-slate-900 text-lg">
          {t('Three-Part Expression Suggestions & Reference', '三项口语表达改进建议（仅供参考）')}
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{t('AI Practice Coach Suggestions', 'AI 陪练参考建议')}</span>
          <span aria-hidden="true">·</span>
          <span>{t('Strengths · Logic Ideas · Practice Tips', '表达亮点 · 思路补充 · 练习建议')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Where Expression is Clear */}
        <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  {t('Feedback 1 · Strengths', '第一项反馈 · 优势剖析')}
                </span>
                <h4 className="font-bold text-emerald-950 text-base">
                  {t('Where Expression is Clear (哪里表达清楚)', '哪里表达清楚')}
                </h4>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed mb-4 bg-white/80 p-3 rounded-xl border border-emerald-100">
              {clearExpression.summary}
            </p>

            <div className="space-y-2 mb-4">
              <h5 className="text-xs font-bold text-emerald-900 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('Key Highlights:', '表现亮点：')}</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-emerald-950">
                {clearExpression.highlights.map((h, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {clearExpression.goodPhrasesUsed && clearExpression.goodPhrasesUsed.length > 0 && (
            <div className="pt-3 border-t border-emerald-200/60">
              <span className="text-[11px] font-semibold text-emerald-800 block mb-1.5">
                {t('Effective Vocabulary & Connectives Used:', '有效运用的词语/连接句：')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {clearExpression.goodPhrasesUsed.map((phrase, i) => (
                  <span
                    key={i}
                    className="bg-white text-emerald-800 text-xs px-2 py-0.5 rounded-md border border-emerald-300 font-medium shadow-2xs"
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Where Reasons are Missing */}
        <div className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  {t('Feedback 2 · Logic Gaps', '第二项反馈 · 逻辑盲区')}
                </span>
                <h4 className="font-bold text-amber-950 text-base">
                  {t('Where Reasons are Missing (哪里缺少理由)', '哪里缺少理由')}
                </h4>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed mb-4 bg-white/80 p-3 rounded-xl border border-amber-100">
              {missingReasons.summary}
            </p>

            <div className="space-y-2 mb-4">
              <h5 className="text-xs font-bold text-amber-900 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('Argument Weaknesses & Gaps:', '论点薄弱点与漏洞：')}</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-amber-950">
                {missingReasons.gaps.map((gap, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-amber-600 font-bold shrink-0 mt-0.5">✕</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {missingReasons.suggestedAngles && missingReasons.suggestedAngles.length > 0 && (
            <div className="pt-3 border-t border-amber-200/60">
              <span className="text-[11px] font-semibold text-amber-800 block mb-1.5">
                {t('Suggested Perspectives to Add:', '建议补充的论据切入角：')}
              </span>
              <ul className="space-y-1 text-xs text-amber-900">
                {missingReasons.suggestedAngles.map((angle, i) => (
                  <li key={i} className="flex items-start space-x-1">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{angle}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 3. How to Improve Next Time */}
        <div className="bg-blue-50/70 border-2 border-blue-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                  {t('Feedback 3 · Action Plan', '第三项反馈 · 提分路径')}
                </span>
                <h4 className="font-bold text-blue-950 text-base">
                  {t('How to Improve Next Time (下一次怎么改)', '下一次怎么改')}
                </h4>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-blue-900 font-medium leading-relaxed mb-4 bg-white/80 p-3 rounded-xl border border-blue-100">
              {nextTimeImprovements.summary}
            </p>

            <div className="space-y-2 mb-4">
              <h5 className="text-xs font-bold text-blue-900 flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('Actionable Upgrade Steps:', '实操提升锦囊：')}</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-blue-950">
                {nextTimeImprovements.actionableSteps.map((step, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-blue-600 font-bold shrink-0 mt-0.5">✓</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {nextTimeImprovements.modelSentenceStarter && (
            <div className="pt-3 border-t border-blue-200/60">
              <span className="text-[11px] font-semibold text-blue-800 block mb-1.5">
                {t('High-Scoring Sentence Starters:', '高分句式开头公式（套用练习）：')}
              </span>
              <div className="space-y-1">
                {nextTimeImprovements.modelSentenceStarter.slice(0, 2).map((starter, i) => (
                  <p key={i} className="text-[11px] bg-white p-1.5 rounded text-blue-950 font-mono border border-blue-200">
                    {starter}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ORID Detailed Exemplar Framework for Oral Practice */}
      {nextTimeImprovements.oridFrameworkExample && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {t('Expression Reference', '表达思路参考')}
              </span>
              <h4 className="font-bold text-base text-gray-100">
                {t(
                  'Sample Structured Discussion Framework (ORID Method Reference)',
                  '清晰口语表达四步框架参考示范（ORID 思路梳理法）'
                )}
              </h4>
            </div>
            <span className="text-xs text-slate-400">
              {t('Suggested Flow Reference', '总-分-总思路参考')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs mt-3">
            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
              <div className="text-amber-400 font-bold mb-1">O (Objective · 见闻)</div>
              <p className="text-slate-300 leading-relaxed">
                {nextTimeImprovements.oridFrameworkExample.objective}
              </p>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
              <div className="text-rose-400 font-bold mb-1">R (Reflective · 感受)</div>
              <p className="text-slate-300 leading-relaxed">
                {nextTimeImprovements.oridFrameworkExample.reflective}
              </p>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
              <div className="text-cyan-400 font-bold mb-1">I (Interpretive · 剖析)</div>
              <p className="text-slate-300 leading-relaxed">
                {nextTimeImprovements.oridFrameworkExample.interpretive}
              </p>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
              <div className="text-emerald-400 font-bold mb-1">D (Decisional · 建议)</div>
              <p className="text-slate-300 leading-relaxed">
                {nextTimeImprovements.oridFrameworkExample.decisional}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

