import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Printer,
  Download,
  ShieldCheck,
  Award,
  FileText,
} from 'lucide-react';
import { EvaluationResult } from '../types/oral';
import { useLanguage } from '../context/LanguageContext';

interface ReportCardExportModalProps {
  evaluation: EvaluationResult;
  studentName?: string;
  schoolCode?: string;
  onClose: () => void;
}

export const ReportCardExportModal: React.FC<ReportCardExportModalProps> = ({
  evaluation,
  studentName = 'Learner',
  schoolCode = 'SELF-PRACTICE',
  onClose,
}) => {
  const { t } = useLanguage();
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Compute 50-point practice reference breakdown:
  // Part 1: Reading Aloud (10 pts)
  // Part 2: Planned Response (15 pts)
  // Part 3: Spoken Interaction (25 pts)
  const part1ReadingScore =
    evaluation.readingAloudScore ?? evaluation.rubric.pronunciation.score;
  const part2PlannedScore = evaluation.rubric.content.score;
  const part3SpokenScore = Math.min(
    25,
    evaluation.rubric.expression.score + evaluation.rubric.vocabulary.score
  );
  const paper3Total = Math.min(
    50,
    part1ReadingScore + part2PlannedScore + part3SpokenScore
  );

  const buildShareableTextSummary = () => {
    const traps =
      evaluation.pronunciationIssues.length > 0
        ? evaluation.pronunciationIssues
            .map((p) => `${p.word} (${p.pinyin})`)
            .join(', ')
        : 'None detected (Clear pronunciation)';

    return [
      `📋 OralAce · Chinese Oral Self-Practice Reference Summary`,
      `Learner: ${studentName} (${schoolCode})`,
      `Topic: ${evaluation.topicTitle}`,
      `Date: ${new Date(evaluation.createdAt).toLocaleDateString()}`,
      `----------------------------------------`,
      `💡 Reference Score: ${paper3Total} / 50 (${evaluation.band}) — For Study Reference Only`,
      `• Part 1 Reading Aloud (朗读短文): ${part1ReadingScore} / 10`,
      `• Part 2 Video Discussion (短片看法): ${part2PlannedScore} / 15`,
      `• Part 3 Interactive Dialogue (互动延伸): ${part3SpokenScore} / 25`,
      `----------------------------------------`,
      `✅ Strengths: ${evaluation.tripleFeedback.clearExpression.summary}`,
      `🎯 Practice Suggestion: ${evaluation.tripleFeedback.nextTimeImprovements.summary}`,
      `🔤 Phonetic Focus: ${traps}`,
      `🔒 SG PDPA Compliant · Independent Practice Reference by OralAce`,
    ].join('\n');
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildShareableTextSummary());
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch (e) {
      // fallback
    }
  };

  const handleDownloadReportFile = () => {
    const content = buildShareableTextSummary();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OralAce_Report_${evaluation.topicId}_${new Date()
      .toISOString()
      .slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      data-testid="report-card-export-modal"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full overflow-hidden shadow-xl my-auto">
        {/* Top Modal Header */}
        <div className="bg-[#062426] text-white px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-base font-bold truncate">
                {t(
                  'Oral Practice Reference Summary (For Personal Review & Sharing)',
                  '华文口语练习自测参考小结（供个人复盘与分享参考）'
                )}
              </h3>
              <p className="text-xs text-teal-200/80 truncate">
                {t(
                  'Self-Practice Reference Breakdown · Non-official advisory suggestions for study use',
                  '口语自测参考拆解 · 非官方评分，旨在提供日常表达参考与改进建议'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Report Card Modal"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-teal-900/60 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Report Sheet Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Learner & Reference Score Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs text-slate-500 font-mono">
                {t('LEARNER:', '练习者：')} <strong className="text-slate-900">{studentName}</strong> ·{' '}
                {t('MODE:', '模式：')} <strong className="text-teal-800">{t('Self-Practice Reference', '日常自测参考')}</strong>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mt-1">
                {evaluation.topicTitle}
              </h4>
              <div className="text-xs text-slate-500 mt-0.5">
                {t('Practice Date:', '练习时间：')}{' '}
                {new Date(evaluation.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="bg-teal-950 text-white px-4 py-3 rounded-2xl text-right shrink-0">
              <div className="text-[11px] text-emerald-300 font-semibold">
                {evaluation.band}
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums">
                {paper3Total}{' '}
                <span className="text-sm font-normal text-slate-300">/ 50</span>
              </div>
            </div>
          </div>

          {/* 3-Part Practice Reference Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90">
              <div className="text-xs text-slate-500 font-medium">
                {t('Part 1 · Reading Aloud', '第一部分 · 朗读短文参考')}
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {part1ReadingScore} <span className="text-xs font-normal text-slate-400">/ 10</span>
              </div>
              <div className="text-[11px] text-teal-800 mt-1">
                {t('Pronunciation, Tones & Fluency', '字音准确度与停连语调')}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90">
              <div className="text-xs text-slate-500 font-medium">
                {t('Part 2 · Video Discussion', '第二部分 · 短片看法表达')}
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {part2PlannedScore} <span className="text-xs font-normal text-slate-400">/ 15</span>
              </div>
              <div className="text-[11px] text-teal-800 mt-1">
                {t('ORID Structure & Video Details', '思路清晰度与短片例证')}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90">
              <div className="text-xs text-slate-500 font-medium">
                {t('Part 3 · Interactive Dialogue', '第三部分 · 延伸互动交流')}
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {part3SpokenScore} <span className="text-xs font-normal text-slate-400">/ 25</span>
              </div>
              <div className="text-[11px] text-teal-800 mt-1">
                {t('Multi-Angle Depth & Vocabulary', '多角度思考与日常词汇')}
              </div>
            </div>
          </div>

          {/* Examiner Core Diagnostic Summary */}
          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <strong className="text-emerald-950 block mb-1">
                {t('1. Key Strengths (What Was Clear):', '一、表达亮点（哪里表达清楚）：')}
              </strong>
              <p className="text-slate-700 leading-relaxed">
                {evaluation.tripleFeedback.clearExpression.summary}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <strong className="text-amber-950 block mb-1">
                {t('2. Logic & Rationale Gaps:', '二、待补强的论据（哪里缺少理由）：')}
              </strong>
              <p className="text-slate-700 leading-relaxed">
                {evaluation.tripleFeedback.missingReasons.summary}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-900/15">
              <strong className="text-teal-950 block mb-1">
                {t('3. Actionable Next-Round Plan:', '三、下一次提分行动方案：')}
              </strong>
              <p className="text-slate-700 leading-relaxed">
                {evaluation.tripleFeedback.nextTimeImprovements.summary}
              </p>
            </div>
          </div>

          {/* PDPA Footer Assurance */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {t(
                'SG PDPA Compliant Assessment Report · No raw audio or biometric voiceprint is stored.',
                '符合新加坡 PDPA 隐私保护规范 · 本报告仅包含脱敏评分与文本诊断，不留存任何原始录音。'
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="btn-copy-report-summary"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 bg-[#0B3B3C] hover:bg-teal-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>{t('Copied for WhatsApp / WeChat!', '已复制！可直接粘贴至微信/WhatsApp')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>{t('Copy Summary for Parent / Teacher', '一键复制成绩单发给家长/老师')}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadReportFile}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-teal-800 shrink-0" />
              <span>{t('Download Report (.txt)', '下载报告文件')}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4 text-teal-800 shrink-0" />
              <span>{t('Print / Save PDF', '打印 / 存为 PDF')}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {t('Close', '关闭')}
          </button>
        </div>
      </div>
    </div>
  );
};
