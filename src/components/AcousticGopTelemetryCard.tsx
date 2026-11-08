import React, { useState } from 'react';
import { ShieldCheck, Activity, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { AcousticGopFluencyTelemetry } from '../types/oral';
import { GOP_CONFIDENCE_FLAG_THRESHOLD } from '../utils/seabRubric';
import { useLanguage } from '../context/LanguageContext';

interface AcousticGopTelemetryCardProps {
  telemetry: AcousticGopFluencyTelemetry;
  titleOverrideZh?: string;
  titleOverrideEn?: string;
}

export const AcousticGopTelemetryCard: React.FC<AcousticGopTelemetryCardProps> = ({
  telemetry,
  titleOverrideZh,
  titleOverrideEn,
}) => {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';
  const [showTables, setShowTables] = useState(false);

  const flaggedPhonemes = telemetry.phonemeGopSegments.filter((p) => p.flagged);

  return (
    <div
      data-testid="acoustic-gop-telemetry-card"
      className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5"
    >
      {/* Top Header + Zero Network Request Privacy Verification Pill (from proto-pron.html) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-700 shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
            {isZh
              ? titleOverrideZh || '本机声学强制对齐与流利度遥测 (Forced Alignment & GOP)'
              : titleOverrideEn || 'On-Device Acoustic Forced Alignment & GOP Fluency Telemetry'}
          </h4>
        </div>

        <div
          data-testid="zero-network-request-badge"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-bold"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            {isZh
              ? `🔒 本次分析过程中的网络请求数：${telemetry.networkRequestCount}（录音未离开本机 · 用时 ${(telemetry.analysisTimeMs / 1000).toFixed(2)}s）`
              : `🔒 Network Requests During Analysis: ${telemetry.networkRequestCount} (Audio Never Left Device · ${(telemetry.analysisTimeMs / 1000).toFixed(2)}s)`}
          </span>
        </div>
      </div>

      {/* 4 Fluency Stat Cards (matching proto-pron.html fluRow) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-lg sm:text-xl font-extrabold text-teal-800 font-mono tabular-nums">
            {telemetry.totalDurationSec.toFixed(1)}s
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
            {isZh ? '总时长 (Duration)' : 'Total Duration'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-lg sm:text-xl font-extrabold text-teal-800 font-mono tabular-nums">
            {telemetry.speechRateCharsPerSec.toFixed(1)}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
            {isZh ? '语速（字/秒）' : 'Speech Rate (chars/s)'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-lg sm:text-xl font-extrabold text-amber-700 font-mono tabular-nums">
            {telemetry.pauseCountOver300ms}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
            {isZh ? '停顿 (≥0.3s)' : 'Pauses (≥0.3s)'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-lg sm:text-xl font-extrabold text-slate-800 font-mono tabular-nums">
            {telemetry.longestPauseSec.toFixed(1)}s
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
            {isZh ? '最长停顿' : 'Longest Pause'}
          </div>
        </div>
      </div>

      {/* GOP Low-Confidence Hints (matching proto-pron.html hints) */}
      {flaggedPhonemes.length > 0 ? (
        <div className="space-y-1.5">
          {flaggedPhonemes.slice(0, 3).map((p, idx) => (
            <div
              key={`${p.char}-${p.phone}-${idx}`}
              className="flex items-start gap-2 bg-amber-50/90 border-l-4 border-amber-500 px-3 py-2 rounded-r-lg text-xs text-amber-950"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {isZh
                  ? `第「${p.char}」字的「${p.phone}」音置信度偏低（GOP ${p.gop.toFixed(1)} < ${GOP_CONFIDENCE_FLAG_THRESHOLD}），建议重听复核声母/韵母清晰度——可能是平翘舌/边鼻音未读准，也可能是环境杂音。`
                  : `Low GOP confidence (${p.gop.toFixed(1)} < ${GOP_CONFIDENCE_FLAG_THRESHOLD}) on phoneme “${p.phone}” in character “${p.char}”. Re-check retroflex/flat or nasal/lateral articulation.`}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-900">
          {isZh
            ? `没有置信度低于 ${GOP_CONFIDENCE_FLAG_THRESHOLD} 的音素。注意：这并不等于发音全对（声调误判由上方多音字与声调模块独立检测）。`
            : `No phonemes fell below GOP ${GOP_CONFIDENCE_FLAG_THRESHOLD}. Note: Tone accuracy is evaluated separately by the Polyphone & Tone engine above.`}
        </div>
      )}

      {/* Toggle for Detailed Character Timestamps & Phoneme GOP Confidence Table */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-[11px] text-slate-500">
          {isZh
            ? '注：声母/韵母 GOP 置信度与声调诊断互补，共同构成完整发音评估。'
            : 'Note: Phoneme GOP confidence complements the tone & polyphone diagnostics.'}
        </p>
        <button
          type="button"
          data-testid="toggle-gop-tables-btn"
          onClick={() => setShowTables(!showTables)}
          className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer shrink-0"
        >
          <span>
            {showTables
              ? isZh
                ? '收起逐字时间戳与音素表'
                : 'Hide Alignment & GOP Tables'
              : isZh
              ? '展开逐字时间戳与音素GOP表'
              : 'View Character Alignment & GOP Table'}
          </span>
          {showTables ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showTables && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
          {/* Character Timestamps Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto">
            <div className="text-xs font-bold text-slate-800 mb-2">
              {isZh ? '逐字时间戳（Forced Alignment 采样）' : 'Character Alignment Timestamps'}
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-1 pr-2 font-semibold">{isZh ? '字' : 'Char'}</th>
                  <th className="py-1 px-2 font-semibold">{isZh ? '开始' : 'Start'}</th>
                  <th className="py-1 px-2 font-semibold">{isZh ? '结束' : 'End'}</th>
                  <th className="py-1 pl-2 font-semibold">{isZh ? '时长' : 'Dur'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {telemetry.characterSegments.slice(0, 8).map((seg, i) => (
                  <tr key={`${seg.char}-${i}`}>
                    <td className="py-1 pr-2 font-sans font-bold text-slate-900">{seg.char}</td>
                    <td className="py-1 px-2 text-slate-600">{seg.startSec.toFixed(2)}s</td>
                    <td className="py-1 px-2 text-slate-600">{seg.endSec.toFixed(2)}s</td>
                    <td className="py-1 pl-2 text-slate-700">{seg.durationSec.toFixed(2)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phoneme GOP Confidence Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto">
            <div className="text-xs font-bold text-slate-800 mb-2">
              {isZh
                ? `逐音素 GOP 置信度（阈值 ${GOP_CONFIDENCE_FLAG_THRESHOLD}）`
                : `Phoneme GOP Confidence (Flag < ${GOP_CONFIDENCE_FLAG_THRESHOLD})`}
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-1 pr-2 font-semibold">{isZh ? '字' : 'Char'}</th>
                  <th className="py-1 px-2 font-semibold">{isZh ? '音素' : 'Phone'}</th>
                  <th className="py-1 px-2 font-semibold">{isZh ? '置信度 (GOP)' : 'GOP'}</th>
                  <th className="py-1 pl-2 font-semibold">{isZh ? '帧数' : 'Frames'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {telemetry.phonemeGopSegments.slice(0, 10).map((seg, i) => (
                  <tr key={`${seg.char}-${seg.phone}-${i}`}>
                    <td className="py-1 pr-2 font-sans font-bold text-slate-900">{seg.char}</td>
                    <td className="py-1 px-2 text-slate-700">{seg.phone}</td>
                    <td
                      className={`py-1 px-2 ${
                        seg.flagged ? 'text-red-700 font-bold' : 'text-emerald-700'
                      }`}
                    >
                      {seg.gop.toFixed(2)}
                    </td>
                    <td className="py-1 pl-2 text-slate-500">{seg.frames}</td>
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
