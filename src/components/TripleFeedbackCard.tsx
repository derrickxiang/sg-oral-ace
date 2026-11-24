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
  onOpenFeedbackReport?: () => void;
}

export const TripleFeedbackCard: React.FC<TripleFeedbackCardProps> = ({
  tripleFeedback,
  onOpenFeedbackReport,
}) => {
  const { t } = useLanguage();
  const { clearExpression, missingReasons, nextTimeImprovements } = tripleFeedback;

  return (
    <div className="space-y-5">
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

      {/* Flat hairline-bordered Studio Columns (Zero nested cards inside tinted cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Where Expression is Clear */}
        <div className="bg-white border border-slate-200 border-t-4 border-t-emerald-600 rounded-2xl p-5 shadow-2xs flex flex-col justify-between gap-4">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  {t('01 · Strengths', '第一项反馈 · 优势剖析')}
                </span>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {t('Where Expression is Clear', '哪里表达清楚')}
                </h4>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed border-b border-slate-100 pb-3">
              {clearExpression.summary}
            </p>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('Key Highlights', '表现亮点')}</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {clearExpression.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">•</span>
                    <span className="leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {clearExpression.goodPhrasesUsed && clearExpression.goodPhrasesUsed.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                {t('Effective Vocabulary & Connectives Used:', '有效运用的词语/连接句：')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {clearExpression.goodPhrasesUsed.map((phrase, i) => (
                  <span
                    key={i}
                    className="bg-emerald-50 text-emerald-900 text-xs px-2 py-0.5 rounded-md border border-emerald-200/80 font-medium"
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Where Reasons are Missing */}
        <div className="bg-white border border-slate-200 border-t-4 border-t-amber-500 rounded-2xl p-5 shadow-2xs flex flex-col justify-between gap-4">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  {t('02 · Logic Gaps', '第二项反馈 · 逻辑盲区')}
                </span>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {t('Where Reasons are Missing', '哪里缺少理由')}
                </h4>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed border-b border-slate-100 pb-3">
              {missingReasons.summary}
            </p>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{t('Reasoning Gaps to Address', '论点薄弱点与可补充处')}</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {missingReasons.gaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold shrink-0">·</span>
                    <span className="leading-relaxed">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {missingReasons.suggestedAngles && missingReasons.suggestedAngles.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                {t('Suggested Perspectives to Add:', '建议补充的论据切入角：')}
              </span>
              <ul className="space-y-1 text-xs text-slate-700">
                {missingReasons.suggestedAngles.map((angle, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{angle}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 3. How to Improve Next Time */}
        <div className="bg-white border border-slate-200 border-t-4 border-t-[#0B3B3C] rounded-2xl p-5 shadow-2xs flex flex-col justify-between gap-4">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                  {t('03 · Action Plan', '第三项反馈 · 进阶路径')}
                </span>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {t('How to Improve Next Time', '下一次怎么改')}
                </h4>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed border-b border-slate-100 pb-3">
              {nextTimeImprovements.summary}
            </p>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>{t('Actionable Upgrade Steps', '实操提升建议')}</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {nextTimeImprovements.actionableSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-teal-700 font-bold shrink-0">✓</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {nextTimeImprovements.modelSentenceStarter && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                {t('Model Sentence Starters:', '高分句式开头参考：')}
              </span>
              <div className="space-y-1.5">
                {nextTimeImprovements.modelSentenceStarter.slice(0, 2).map((starter, i) => (
                  <p
                    key={i}
                    className="text-[11px] bg-slate-50 px-2.5 py-1.5 rounded-lg text-slate-800 border border-slate-200 leading-snug"
                  >
                    {starter}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ORID Detailed Exemplar Framework for Oral Practice (Deep Teal Studio Block) */}
      {nextTimeImprovements.oridFrameworkExample && (
        <div className="bg-[#072B2E] text-white rounded-2xl p-5 sm:p-6 border border-teal-800 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-teal-800/80">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                {t('ORID Reference', 'ORID 表达思路示范')}
              </span>
              <span className="text-teal-700" aria-hidden="true">·</span>
              <h4 className="font-bold text-sm sm:text-base text-white">
                {t(
                  'Sample Structured Discussion Framework (Observation → Action)',
                  '清晰口语表达四步框架参考示范（见闻 → 感受 → 成因 → 建议）'
                )}
              </h4>
            </div>
            <span className="text-xs text-teal-200/80">
              {t('Suggested Flow Reference', '总-分-总思路参考')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs">
            <div className="bg-[#0B3B3C] p-3.5 rounded-xl border border-teal-800/80">
              <div className="text-amber-300 font-bold mb-1.5 font-mono">O · {t('Objective', '见闻')}</div>
              <p className="text-teal-50/90 leading-relaxed">
                {nextTimeImprovements.oridFrameworkExample.objective}
              </p>
            </div>

            <div className="bg-[#0B3B3C] p-3.5 rounded-xl border border-teal-800/80">
              <div className="text-rose-300 font-bold mb-1.5 font-mono">R · {t('Reflective', '感受')}</div>
              <p className="text-teal-50/90 leading-relaxed">
                {nextTimeImprovements.oridFrameworkExample.reflective}
              </p>
            </div>

            <div className="bg-[#0B3B3C] p-3.5 rounded-xl border border-teal-800/80">
              <div className="text-cyan-300 font-bold mb-1.5 font-mono">I · {t('Interpretive', '剖析')}</div>
              <p className="text-teal-50/90 leading-relaxed">
                {nextTimeImprovements.oridFrameworkExample.interpretive}
              </p>
            </div>

            <div className="bg-[#0B3B3C] p-3.5 rounded-xl border border-teal-800/80">
              <div className="text-emerald-300 font-bold mb-1.5 font-mono">D · {t('Decisional', '建议')}</div>
              <p className="text-teal-50/90 leading-relaxed">
                {nextTimeImprovements.oridFrameworkExample.decisional}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Report Card Bottom Entry (Design Doc Phase 2): 这个回复有问题？告诉我们 */}
      {onOpenFeedbackReport && (
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200/80 gap-2">
          <span className="flex items-center gap-1.5 text-slate-500">
            <HelpCircle className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span>{t('Is there an issue with this AI response or prompt?', '这个回复或 AI 反馈有问题？')}</span>
          </span>
          <button
            type="button"
            data-testid="report-feedback-link"
            onClick={onOpenFeedbackReport}
            className="text-teal-800 hover:text-teal-950 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <span>{t('Tell us / Report issue →', '告诉我们 / 提交反馈 →')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
