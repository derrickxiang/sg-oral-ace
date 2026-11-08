import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, CheckCircle2, X, FileCheck2 } from 'lucide-react';
import { ConsentRecord } from '../types/oral';
import { useLanguage } from '../context/LanguageContext';

export const CONSENT_VERSION = 'trial-notice-2026-11-08';
const STORAGE_KEY = 'oralace_consent_v1';

export const ParentConsentBannerModal: React.FC = () => {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';

  const [consent, setConsent] = useState<ConsentRecord | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'adult' | 'u18-parent'>('u18-parent');

  useEffect(() => {
    if (consent) {
      setSelectedTab(consent.ageBand);
    }
  }, [consent]);

  const handleConfirmConsent = (ageBand: 'adult' | 'u18-parent') => {
    const newRecord: ConsentRecord = {
      version: CONSENT_VERSION,
      ageBand,
      consentedAt: new Date().toISOString(),
    };
    setConsent(newRecord);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecord));
    } catch {
      // ignore storage quota errors
    }
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Compact Compliance & U18 Parent Consent Strip */}
      <div
        data-testid="u18-consent-strip"
        className="w-full overflow-x-clip bg-teal-950/95 text-teal-50 border-b border-teal-800/80 px-3 sm:px-6 py-2"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold truncate">
              {isZh
                ? `SG PDPA 隐私与未成年人保护合规 (${CONSENT_VERSION}) · 录音转写本机处理，不保存原始音频`
                : `SG PDPA & Minor Protection (${CONSENT_VERSION}) · Zero raw voice storage`}
            </span>
            {consent && (
              <span
                data-testid="consent-verified-pill"
                className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold shrink-0"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                {consent.ageBand === 'u18-parent'
                  ? isZh
                    ? '已签署：13–17岁家长/监护人同意'
                    : 'Signed: 13–17 Parent/Guardian Consent'
                  : isZh
                  ? '已签署：18+ 成人同意'
                  : 'Signed: 18+ Adult Consent'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="open-consent-gate-btn"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-800 hover:bg-teal-700 text-teal-50 border border-teal-600/70 font-bold text-[11px] transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {consent
                  ? isZh
                    ? '查看/更新家长同意记录'
                    : 'View / Update Consent'
                  : isZh
                  ? '13–17岁家长/成人试用同意确认'
                  : '13–17 Parent / Adult Consent'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Consent Gate Modal (ported from derrickxiang/oralace app.html & accounts.js) */}
      {isModalOpen && (
        <div
          data-testid="parent-consent-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>CONSENT VERSION: {CONSENT_VERSION}</span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {isZh
                    ? 'OralAce 试用须知与年龄分层确认'
                    : 'OralAce Trial Notice & Age-Band Consent'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                aria-label="Close Consent Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notice Bullet Points from derrickxiang/oralace app.html */}
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-4 list-disc pl-8">
              <li>
                {isZh
                  ? 'AI 生成的追问、反馈与参考评分仅供华文口试日常练习参考，不代表官方考评或预测实际考试成绩。'
                  : 'AI follow-up prompts, feedback, and rubric scores are for practice reference only and do not predict official exam grades.'}
              </li>
              <li>
                {isZh
                  ? '隐私保护（符合新加坡 PDPA）：本机声学流利度与音素对齐（Forced Alignment & GOP）完全在浏览器本地完成（网络请求数：0），服务器不保存原始录音或声纹。'
                  : 'SG PDPA Privacy: On-device acoustic alignment & GOP run locally in your browser (0 network requests); servers never store raw audio or voiceprints.'}
              </li>
              <li>
                {isZh
                  ? '学生安全护栏（Fail-Closed Moderation）：针对未成年学生，语音与文本反馈均经过内容安全过滤后才释放。'
                  : 'Student Safety Guardrail: All AI responses and synthesized speech pass fail-closed content moderation before release.'}
              </li>
              <li className="font-semibold text-teal-900">
                {isZh
                  ? '未满 18 岁（13–17 岁中学生）须由家长或法定监护人阅读本说明并代为点击同意后使用。'
                  : 'Students under 18 (ages 13–17) require a parent or legal guardian to review and confirm consent below.'}
              </li>
            </ul>

            {/* Age Band Selector Tabs (u18-parent vs adult) */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                data-testid="consent-tab-u18"
                onClick={() => setSelectedTab('u18-parent')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedTab === 'u18-parent'
                    ? 'bg-white text-teal-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-teal-700" />
                <span>{isZh ? '13–17 岁（中学生）' : 'Ages 13–17 (Student)'}</span>
              </button>

              <button
                type="button"
                data-testid="consent-tab-adult"
                onClick={() => setSelectedTab('adult')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedTab === 'adult'
                    ? 'bg-white text-teal-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>{isZh ? '18 岁及以上（成人/教师）' : '18+ (Adult / Teacher)'}</span>
              </button>
            </div>

            {selectedTab === 'u18-parent' ? (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-3">
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  {isZh
                    ? '如果您是 13–17 岁的中学生，请把设备交给家长或法定监护人阅读上述条款，并由家长/监护人本人点击下方按钮确认：'
                    : 'If you are a 13–17 secondary student, please ask your parent or legal guardian to read the notice above and click the confirmation button below:'}
                </p>
                <button
                  type="button"
                  data-testid="confirm-u18-parent-consent-btn"
                  onClick={() => handleConfirmConsent('u18-parent')}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                >
                  {isZh
                    ? '我是家长/监护人，已阅读并同意孩子试用 (band: u18-parent)'
                    : 'I am the Parent/Guardian — I Have Read & Agree (band: u18-parent)'}
                </button>
              </div>
            ) : (
              <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 space-y-3">
                <p className="text-xs text-teal-950 font-medium leading-relaxed">
                  {isZh
                    ? '请确认您已年满 18 周岁（如教师、家长或成年学习者），并已阅读上述数据隐私与试用说明：'
                    : 'Please confirm that you are 18 years of age or older and have read the data privacy and trial notice above:'}
                </p>
                <button
                  type="button"
                  data-testid="confirm-adult-consent-btn"
                  onClick={() => handleConfirmConsent('adult')}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                >
                  {isZh
                    ? '我已年满 18 岁，已阅读并同意试用 (band: adult)'
                    : 'I am 18 or older — I Have Read & Agree (band: adult)'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
