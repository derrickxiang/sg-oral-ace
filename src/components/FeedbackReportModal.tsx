import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  ShieldAlert,
  HelpCircle,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  UserCheck,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  FeedbackType,
  FEEDBACK_TYPE_METADATA,
  FeedbackSubmissionPayload,
  FeedbackItem,
} from '../types/feedback';
import { CloudUserProfile } from '../firebase';
import { User } from 'firebase/auth';

interface FeedbackReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  userProfile: CloudUserProfile | null;
  initialTopicTitle?: string;
  onOpenAuthModal?: () => void;
  onFeedbackSubmitted?: (item: FeedbackItem) => void;
}

export const FeedbackReportModal: React.FC<FeedbackReportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  initialTopicTitle,
  onOpenAuthModal,
  onFeedbackSubmitted,
}) => {
  const { lang, t } = useLanguage();
  const isZh = lang === 'zh';

  const [type, setType] = useState<FeedbackType>('feature_issue');
  const [description, setDescription] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>(() => {
    return userProfile?.email || currentUser?.email || '';
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedFeedback, setSubmittedFeedback] = useState<FeedbackItem | null>(null);

  if (!isOpen) return null;

  const isLoggedIn = Boolean(currentUser || userProfile);
  const userId = userProfile?.uid || currentUser?.uid || '';
  const currentMeta = FEEDBACK_TYPE_METADATA[type];

  const handleResetAndClose = () => {
    setDescription('');
    setErrorMessage(null);
    setSubmittedFeedback(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !userId) {
      setErrorMessage(t('Please log in with your email account first.', '请先登录您的邮箱账号后再提交反馈。'));
      return;
    }

    if (!description.trim()) {
      setErrorMessage(
        t('Please provide a brief description of the issue.', '请简要填写问题描述。')
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: FeedbackSubmissionPayload = {
      userId,
      userEmail: userProfile?.email || currentUser?.email || undefined,
      type,
      description: description.trim(),
      contactEmail: contactEmail.trim() || undefined,
      topicTitle: initialTopicTitle,
      autoContext: {
        language: lang,
        browser: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 150) : 'Browser',
        topicTitle: initialTopicTitle,
      },
    };

    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || t('Failed to submit feedback', '反馈提交失败'));
      }

      setSubmittedFeedback(data.feedback);
      onFeedbackSubmitted?.(data.feedback);
    } catch (err: any) {
      setErrorMessage(err.message || t('Submission failed. Please try again.', '提交失败，请重试。'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="feedback-report-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl border border-teal-900/20 max-w-xl w-full overflow-hidden shadow-2xl my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#072B2E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {t('Feedback & Issue Report', '反馈与举报问题')}
              </h2>
              <p className="text-[11px] text-emerald-300/80">
                {t(
                  'Content safety, privacy requests, or system issues — handled promptly.',
                  '功能异常、内容安全举报或数据隐私请求 · 专人及时跟进'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            aria-label={t('Close modal', '关闭窗口')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-teal-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Case 1: Successfully Submitted Confirmation View */}
          {submittedFeedback ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">
                  {t('Feedback Submitted Successfully', '反馈提交成功')}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  {t(
                    'Your report has been securely registered in the system. An alert notification has been routed to the review team.',
                    '您的记录已安全登记至系统。系统已通过安全链路向管理人员发送简报通知，描述全文已安全封存。'
                  )}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-1.5 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Reference ID:', '反馈编号:')}</span>
                  <span className="font-mono font-bold text-teal-800">{submittedFeedback.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Type:', '类型:')}</span>
                  <span className="font-semibold text-slate-800">
                    {isZh ? currentMeta.labelZh : currentMeta.labelEn}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Target SLA:', '承诺时限:')}</span>
                  <span className="font-semibold text-emerald-700">
                    {isZh ? currentMeta.slaHoursZh : currentMeta.slaHoursEn}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-[#0B3B3C] text-white font-bold text-xs hover:bg-[#072B2E] transition-colors cursor-pointer shadow-xs"
              >
                {t('Done', '完成')}
              </button>
            </div>
          ) : !isLoggedIn ? (
            /* Case 2: Unauthenticated Warning Gate */
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {t('Account Login Required', '需先登录电子邮箱账号')}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  {t(
                    'To prevent automated spam and ensure every student request is reliably tracked and resolved, please register or sign in with your email first.',
                    '为防范匿名恶意灌水并确保学生诉求得到可靠核验与跟进回复，提交反馈须绑定邮箱账号。'
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal?.();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  {t('Sign In or Register with Email', '前往电子邮箱注册 / 登录 →')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  {t('Cancel', '取消')}
                </button>
              </div>
            </div>
          ) : (
            /* Case 3: Interactive Feedback Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Type Selection (必选三选一) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  {t('1. Feedback Type (Required)', '1. 请选择反馈类型（必选）')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['feature_issue', 'content_safety', 'privacy_data_request'] as FeedbackType[]).map(
                    (key) => {
                      const isSelected = type === key;
                      const meta = FEEDBACK_TYPE_METADATA[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setType(key)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-teal-800 bg-teal-50/70 shadow-2xs ring-1 ring-teal-800'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">
                                {isZh ? meta.labelZh : meta.labelEn}
                              </span>
                              {key === 'content_safety' && (
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                              )}
                              {key === 'privacy_data_request' && (
                                <Lock className="w-3.5 h-3.5 text-amber-600" />
                              )}
                              {key === 'feature_issue' && (
                                <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight">
                              {isZh ? meta.descriptionZh : meta.descriptionEn}
                            </p>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Target SLA Callout */}
                <div className="flex items-center gap-1.5 text-[11px] text-teal-800 pt-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>
                    {t('Target Response Time:', '处理时限承诺：')}
                    <strong className="ml-1 text-teal-900">
                      {isZh ? currentMeta.slaHoursZh : currentMeta.slaHoursEn}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Step 2: Description Input (问题描述 · 上限 2000 字) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="feedback-desc" className="text-xs font-bold text-slate-800">
                    {t('2. Description (Optional)', '2. 问题描述（可选）')}
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {description.length} / 2000
                  </span>
                </div>
                <textarea
                  id="feedback-desc"
                  rows={4}
                  maxLength={2000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t(
                    'Simply describe the issue you encountered. No need to paste your practice answer or speech.',
                    '只需描述您遇到的具体问题或情况，不用粘贴作答内容...'
                  )}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-800 bg-slate-50/50 resize-none leading-relaxed"
                />
                <p className="text-[11px] text-slate-500">
                  {t(
                    'Tip: Practice audio, answers, and AI reports will not be automatically included.',
                    '提示：表单不会自动上传您的录音、作答文字或练习报告。'
                  )}
                </p>
              </div>

              {/* Step 3: Contact Email (联系方式 · 默认登录邮箱) */}
              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="text-xs font-bold text-slate-800">
                  {t('3. Contact Email (Optional)', '3. 回复联系邮箱（可选）')}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  maxLength={254}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-800 bg-slate-50/50"
                />
                <p className="text-[11px] text-slate-500">
                  {t(
                    'Defaults to your registered email. Leave empty if you do not wish to receive email replies.',
                    '默认带入您的注册邮箱；若无需接收邮件处理进展通知可清空此项。'
                  )}
                </p>
              </div>

              {/* Step 4: Transparent Auto-Context Card */}
              <div className="p-3 bg-teal-50/60 border border-teal-200/80 rounded-xl text-xs space-y-1.5 text-teal-950">
                <div className="font-bold flex items-center gap-1.5 text-teal-900">
                  <Lock className="w-3.5 h-3.5 text-teal-700" />
                  <span>{t('Transparent Data & Privacy Guardrail', '自动附带上下文与隐私说明')}</span>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-5 leading-snug">
                  <li>
                    {t(
                      'Auto-attached metadata: Submission timestamp, UI language, app version, and device type.',
                      '自动附带上下文：提交时间、界面语言、App 版本号、浏览器设备信息。'
                    )}
                  </li>
                  {initialTopicTitle && (
                    <li>
                      {t('Practice Topic Name (Name only): ', '关联考题（仅含标题，不含作答）：')}
                      <strong className="text-slate-800">{initialTopicTitle}</strong>
                    </li>
                  )}
                  <li className="text-teal-900 font-medium">
                    {t(
                      'Zero audio/transcript collection: Speech recordings, transcripts, and scores are never attached.',
                      '不收集练习内容：录音音频、作答文字、AI 追问与报告均绝不自动上传。'
                    )}
                  </li>
                  <li>
                    {t(
                      'Retention: Feedback data is retained for 90 days and deleted automatically upon account deletion.',
                      '数据由系统统一存储，保留 90 天到期自动删除；注销账号时一并彻底销毁。'
                    )}
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {t('Cancel', '取消')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t('Submitting...', '提交中...') : t('Submit Report', '提交反馈 / 举报')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
