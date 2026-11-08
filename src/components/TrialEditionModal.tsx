import React, { useState } from 'react';
import {
  X,
  Zap,
  Sparkles,
  CheckCircle2,
  Unlock,
  RotateCcw,
  Copy,
  Check,
  Play,
  ArrowRight,
  Gauge,
  LogOut,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Download,
  Share2,
  Mail,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CloudUserProfile, SubscriptionPlanTier, User } from '../firebase';
import { usePWAInstall } from '../hooks/usePWAInstall';

export interface EmailRegisterPayload {
  mode: 'register' | 'login';
  email: string;
  password: string;
  displayName?: string;
}

interface TrialEditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTrialMode: boolean;
  setIsTrialMode: (val: boolean) => void;
  trialSessionsRemaining: number;
  onResetTrialQuota: () => void;
  fastMode: boolean;
  setFastMode: (val: boolean) => void;
  onRunInstantFollowUpDemo: () => void;
  onRunInstantReportDemo: () => void;
  // Auth & Subscription props
  currentUser: User | null;
  userProfile: CloudUserProfile | null;
  isAuthLoading: boolean;
  onSignInWithGoogle?: () => Promise<void>;
  onEmailAuth?: (payload: EmailRegisterPayload) => Promise<{ ok: boolean; message?: string }>;
  onSignOut: () => Promise<void>;
  onSelectSubscriptionPlan: (tier: SubscriptionPlanTier, planLabel: string) => Promise<void>;
  initialSection?: 'overview' | 'pricing' | 'mobile_install';
}

export const TrialEditionModal: React.FC<TrialEditionModalProps> = ({
  isOpen,
  onClose,
  isTrialMode,
  trialSessionsRemaining,
  onResetTrialQuota,
  fastMode,
  setFastMode,
  onRunInstantFollowUpDemo,
  onRunInstantReportDemo,
  currentUser,
  userProfile,
  isAuthLoading,
  onEmailAuth,
  onSignOut,
  onSelectSubscriptionPlan,
  initialSection = 'overview',
}) => {
  const { t } = useLanguage();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'pricing' | 'mobile_install'>(initialSection);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<string | null>(null);
  const [checkoutSuccessMsg, setCheckoutSuccessMsg] = useState<string | null>(null);

  // Email-only Registration & Login states
  const [emailMode, setEmailMode] = useState<'register' | 'login'>('register');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [studentNameInput, setStudentNameInput] = useState('');
  const [authFeedback, setAuthFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const isLoggedIn = Boolean(currentUser || userProfile);
  const activeTier: SubscriptionPlanTier = userProfile?.planTier || (isTrialMode ? 'trial' : 'monthly_pro');

  const handleCopyTrialLink = () => {
    const shareOrigin = window.location.origin.replace('https://ais-dev-', 'https://ais-pre-');
    const url = `${shareOrigin}/?edition=trial`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePlanActivation = async (tier: SubscriptionPlanTier, label: string) => {
    setIsProcessingCheckout(tier);
    setCheckoutSuccessMsg(null);
    try {
      await onSelectSubscriptionPlan(tier, label);
      setCheckoutSuccessMsg(
        t(
          `Successfully activated: ${label}. All 20 Singapore O-Level video topics are now unlocked!`,
          `已成功开通：${label}！全部 20 套新加坡 O-Level 实景视频题库已为您解锁。`
        )
      );
    } finally {
      setIsProcessingCheckout(null);
    }
  };

  const handleEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthFeedback(null);
    if (!emailInput.trim() || !passwordInput.trim() || passwordInput.length < 6) {
      setAuthFeedback({
        type: 'error',
        text: t(
          'Please enter a valid email address and password (at least 6 characters).',
          '请输入有效的电子邮箱地址与密码（至少 6 位字符）。'
        ),
      });
      return;
    }
    if (onEmailAuth) {
      const res = await onEmailAuth({
        mode: emailMode,
        email: emailInput.trim(),
        password: passwordInput,
        displayName: studentNameInput.trim() || emailInput.split('@')[0],
      });
      if (res.ok) {
        setAuthFeedback({
          type: 'success',
          text:
            res.message ||
            t(
              'Email account registered! All 20 Singapore O-Level Oral Topics are now unlocked.',
              '邮箱账号注册并登录成功！已为您解锁全部 20 套新加坡 O 水准口试考题。'
            ),
        });
      } else {
        setAuthFeedback({
          type: 'error',
          text: res.message || t('Authentication failed. Please check your email and password.', '注册或登录失败，请检查邮箱与密码。'),
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-teal-900/20 max-w-4xl w-full overflow-hidden shadow-2xl my-6">
        {/* Top Header — Singapore Academic Deep Teal */}
        <div className="px-6 py-4 bg-[#072B2E] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold mb-0.5">
              <Zap className="w-3.5 h-3.5" />
              <span>
                {t(
                  'OralAce Member Center · Email Account Registration & Topic Unlock',
                  'OralAce 账户中心 · 邮箱注册解锁全部 20 套考题与手机端安装'
                )}
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              {t(
                'Email Registration (Unlock All 20 Topics), Plans & Mobile App',
                '电子邮箱注册登录（解锁全部 20 套考题）、会员方案与手机 App 下载'
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close modal', '关闭窗口')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-teal-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Navigation Bar */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto py-2.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-[#0B3B3C] text-white'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {t('1. Email Registration & Unlock All Topics (邮箱注册)', '1. 电子邮箱注册登录 · 解锁全部考题')}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('pricing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeSubTab === 'pricing'
                ? 'bg-[#0B3B3C] text-white'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {t('2. Membership Plans & Quotas (会员方案)', '2. 会员套餐与练习权限说明')}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('mobile_install')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeSubTab === 'mobile_install'
                ? 'bg-[#0B3B3C] text-white'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {t('3. Download & Install Phone App (iOS / Android)', '3. 下载安装手机 App (iOS / Android)')}
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Account Status or Email-Only Registration Box */}
          {isLoggedIn ? (
            <div className="bg-teal-50/70 rounded-xl border border-teal-200 p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#0B3B3C] text-emerald-300 flex items-center justify-center font-bold text-base shrink-0">
                  {(userProfile?.displayName || currentUser?.displayName || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {userProfile?.displayName || currentUser?.displayName || 'Registered Student'}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {t('Email Registered · All 20 Topics Unlocked', '已注册邮箱账号 · 全部 20 套考题已解锁')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {userProfile?.email || currentUser?.email || 'student@oralace.sg'} ·{' '}
                    {t('Personal Oral Portfolio Active', '个人口试练习档案已激活')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('Sign Out (Return to 2-Topic Free Mode)', '退出登录（返回 2 题免费版）')}</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {t(
                      'Register or Sign In with Your Email Address',
                      '使用电子邮箱注册或登录账户'
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t(
                      'Free Guest Mode includes 2 topics (#01–#02). Register with your Email to immediately unlock all 20 Singapore O-Level Oral Topics.',
                      '未注册免费版仅开放前 2 个主题（#01–#02）。使用电子邮箱免费注册后，即可立即解锁全部 20 套新加坡口试主题。'
                    )}
                  </p>
                </div>

                {/* Register vs Login Switcher */}
                <div className="inline-flex rounded-xl bg-slate-200/80 p-1 text-xs font-semibold gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode('register');
                      setAuthFeedback(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                      emailMode === 'register'
                        ? 'bg-[#0B3B3C] text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {t('Email Register', '邮箱注册')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode('login');
                      setAuthFeedback(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                      emailMode === 'login'
                        ? 'bg-[#0B3B3C] text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {t('Email Sign In', '邮箱登录')}
                  </button>
                </div>
              </div>

              {/* Clean Email & Password Registration / Login Form (No Class / School Selection) */}
              <form
                data-testid="email-auth-form"
                onSubmit={handleEmailFormSubmit}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-950">
                    {emailMode === 'register'
                      ? t('Create Account with Email (Unlocks All 20 Topics)', '电子邮箱创建新账号（注册即解锁全部 20 套考题）')
                      : t('Sign In with Existing Email Account', '使用已有电子邮箱账号登录')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {emailMode === 'register' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {t('Name / Nickname (Optional)', '姓名或昵称（选填）')}
                      </label>
                      <input
                        type="text"
                        value={studentNameInput}
                        onChange={(e) => setStudentNameInput(e.target.value)}
                        placeholder={t('e.g., Tan Wei Ming / 陈伟明', '例如：陈伟明 / Wei Ming')}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-teal-800"
                      />
                    </div>
                  )}

                  <div className={emailMode === 'login' ? 'sm:col-span-2' : ''}>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {t('Email Address (电子邮箱)', '电子邮箱地址 (Email)')}
                    </label>
                    <input
                      type="email"
                      required
                      data-testid="email-auth-input"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-teal-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {t('Password (密码 · min 6 chars)', '设置登录密码（至少 6 位）')}
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      data-testid="password-auth-input"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-teal-800"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-slate-500">
                    {t(
                      'Free version opens Topics #01–#02. Registering with Email unlocks Topics #03–#20 immediately.',
                      '免费版可练习 #01–#02 两个主题；完成邮箱注册后立即解锁其余全部 18 个主题（共 20 题）。'
                    )}
                  </span>
                  <button
                    type="submit"
                    data-testid="submit-email-auth-btn"
                    disabled={isAuthLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B3B3C] hover:bg-teal-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-300" />
                    <span>
                      {emailMode === 'register'
                        ? t('Register with Email & Unlock All Topics', '立即邮箱注册并解锁全部考题')
                        : t('Sign In with Email', '使用邮箱登录')}
                    </span>
                  </button>
                </div>
              </form>

              {authFeedback && (
                <div
                  data-testid="email-auth-feedback"
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    authFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border border-amber-200 text-amber-900'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{authFeedback.text}</span>
                </div>
              )}
            </div>
          )}

          {checkoutSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{checkoutSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 rounded-lg bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
              >
                {t('Start Practicing Now', '立即开始练习')}
              </button>
            </div>
          )}

          {/* TAB 1: Overview & 1-Click Instant Trial Walkthrough */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* 1-Click Instant Trial Walkthrough */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-700" />
                    <span>
                      {t(
                        '1-Click Instant Trial Walkthrough (No Recording Required)',
                        '一键秒级体验核心流程（免录音直接预览）'
                      )}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {t(
                      'Immediately experience AI coach follow-up questions and the 3-part expression suggestions in under 1 second.',
                      '1 秒内快速预览 AI 陪练延伸提问与三项口语表达参考建议。'
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onRunInstantFollowUpDemo();
                      onClose();
                    }}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-500">
                        {t('Step 03 Instant Demo', '第 03 步 · 秒级互动演示')}
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {t('Jump to AI Coach Follow-up', '立即体验 AI 陪练延伸提问')}
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-teal-800 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onRunInstantReportDemo();
                      onClose();
                    }}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0B3B3C] hover:bg-teal-900 text-white text-left transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-emerald-300">
                        {t('Step 04 Practice Tips (<0.1s)', '第 04 步 · 完整练习建议 (<0.1秒)')}
                      </div>
                      <div className="text-sm font-bold mt-0.5">
                        {t('Instant 3-Part Practice Suggestions', '一键查看三项口语改进建议')}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                </div>
              </div>

              {/* Speed Engine Control */}
              <div className="rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-teal-800" />
                      <span>
                        {t('AI Response Speed Mode', 'AI 考官响应速度模式')}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t(
                        'Switch between Turbo Instant Mode (<0.1s) and Live Gemini Low-Thinking Mode (~1.5s).',
                        '可随时切换“极速秒回模式 (<0.1秒)”或“实时大模型推理模式 (~1.5秒)”。'
                      )}
                    </p>
                  </div>

                  <div className="inline-flex rounded-lg bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setFastMode(true)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        fastMode ? 'bg-[#0B3B3C] text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t('⚡ Turbo (<0.1s)', '⚡ 极速秒回 (<0.1秒)')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFastMode(false)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        !fastMode ? 'bg-[#0B3B3C] text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t('🧠 Live AI (~1.5s)', '🧠 实时大模型 (~1.5秒)')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Membership Plans & Quotas */}
          {activeSubTab === 'pricing' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Plan 1: Free Guest Trial (2 Topics) */}
                <div
                  className={`rounded-xl border p-5 flex flex-col justify-between ${
                    isTrialMode && !isLoggedIn
                      ? 'border-teal-900 bg-white ring-2 ring-teal-900/10'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        {t('Free Guest Version', '未注册免费体验版')}
                      </span>
                      {isTrialMode && !isLoggedIn && (
                        <span className="text-[11px] font-semibold bg-[#0B3B3C] text-white px-2 py-0.5 rounded-md">
                          {t('Current', '当前')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold text-slate-900">S$0</span>
                      <span className="text-xs text-slate-500">{t('/ 2 topics open', '/ 开放 2 个考题')}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {t(
                        'Try the 4-step O-Level oral coaching loop on the first 2 topics without an account.',
                        '无需注册即可零门槛体验前 2 个主题的完整四步口试闭环。'
                      )}
                    </p>
                    <ul className="mt-4 space-y-2 text-xs text-slate-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{t('Topics #01–#02 Free to Practice', '免费练习第 #01–#02 两个主题')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {t(
                            `3 Free AI Examiner Sessions (${trialSessionsRemaining}/3 left)`,
                            `3 次免费 AI 考官诊断 (${trialSessionsRemaining}/3)`
                          )}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{t('Singapore Local Culture Corpus', '新加坡本土文化高分语料库')}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePlanActivation('trial', 'Free Guest Trial (2 Topics)')}
                      className="flex-1 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {t('Use 2-Topic Free Mode', '使用 2 题免费模式')}
                    </button>
                    <button
                      type="button"
                      onClick={onResetTrialQuota}
                      title={t('Reset 3 free trial sessions', '重置 3 次免费试用额度')}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Plan 2: Registered Email Member / Monthly Pass */}
                <div
                  className={`rounded-xl border p-5 flex flex-col justify-between ${
                    isLoggedIn || (!isTrialMode && activeTier === 'monthly_pro')
                      ? 'border-teal-900 bg-white ring-2 ring-teal-900/10'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
                        {t('Email Member / Monthly Pro', '注册会员 / 月度冲刺版')}
                      </span>
                      <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                        {t('Unlock All 20', '解锁全部 20 题')}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold text-slate-900">
                        {t('Free w/ Email', '邮箱注册解锁')}
                      </span>
                      <span className="text-xs text-slate-500">{t('/ or S$14.90 Pro', '/ 无限次陪练')}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {t(
                        'Registering with your email unlocks all 20 Singapore O-Level oral topics immediately.',
                        '使用电子邮箱注册账户即可立即解锁全部 20 套新加坡实景短片题库。'
                      )}
                    </p>
                    <ul className="mt-4 space-y-2 text-xs text-slate-700">
                      <li className="flex items-center gap-2">
                        <Unlock className="w-4 h-4 text-teal-900 shrink-0" />
                        <span>{t('All 20 O-Level Video Topics (#01–#20)', '解锁全部 20 套实景考题 (#01–#20)')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Unlock className="w-4 h-4 text-teal-900 shrink-0" />
                        <span>{t('Unlimited AI Follow-ups & 50-Mark Scoring', '无限次考官追问与 50 分制精批')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Unlock className="w-4 h-4 text-teal-900 shrink-0" />
                        <span>{t('Real Silent Clip (seat-land.mp4) & Flow Sync', '含真题无声短片与 Google Flow 导入')}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isProcessingCheckout === 'monthly_pro'}
                      onClick={() => {
                        if (!isLoggedIn) {
                          setActiveSubTab('overview');
                          return;
                        }
                        handlePlanActivation('monthly_pro', 'Registered Member Pass (20 Topics)');
                      }}
                      className="w-full py-2.5 px-3 rounded-lg bg-[#0B3B3C] hover:bg-teal-900 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>
                        {isLoggedIn
                          ? t('All 20 Topics Unlocked', '已登录 · 全部 20 题已解锁')
                          : t('Go to Email Registration →', '前往邮箱注册解锁全部 20 题 →')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Plan 3: Annual O-Level Pass */}
                <div
                  className={`rounded-xl border p-5 flex flex-col justify-between ${
                    !isTrialMode && activeTier === 'annual_pro'
                      ? 'border-teal-900 bg-white ring-2 ring-teal-900/10'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        {t('Annual O-Level Pass', '全年会考通关版')}
                      </span>
                      <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        {t('Save 50%', '立省 50%')}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold text-slate-900">S$89.00</span>
                      <span className="text-xs text-slate-500">{t('/ year (S$7.40/mo)', '/ 年 (合 S$7.40/月)')}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {t(
                        'For full-year O-Level Chinese oral preparation with cloud portfolio sync.',
                        '适合全年备考冲刺，提供全部 20 套考题与云端成长档案长期保存。'
                      )}
                    </p>
                    <ul className="mt-4 space-y-2 text-xs text-slate-700">
                      <li className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{t('All 20 Topics + Priority Turbo AI', '全部 20 套考题 + 专属极速 AI 通道')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{t('Full Singapore Culture Lexicon', '完整新加坡政策与文化高分语料库')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{t('50-Mark Report Card Export', '支持 50 分制成绩单导出打印')}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isProcessingCheckout === 'annual_pro'}
                      onClick={() => handlePlanActivation('annual_pro', 'Annual O-Level Pass (S$89/yr)')}
                      className="w-full py-2.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>
                        {isProcessingCheckout === 'annual_pro'
                          ? t('Activating...', '正在激活...')
                          : !isTrialMode && activeTier === 'annual_pro'
                          ? t('Active · Annual Pass Unlocked', '已激活 · 全年通关版')
                          : t('Activate Annual Pass (Unlock All 20)', '一键开通年卡（解锁全部20题）')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Install on Phone (PWA + iOS / Android Guide) */}
          {activeSubTab === 'mobile_install' && (
            <div className="space-y-5">
              <div className="bg-[#072B2E] text-white rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <Smartphone className="w-4 h-4" />
                    <span>{t('Installable Standalone Mobile App (iOS / Android)', '真正可下载安装的独立手机应用 (iOS / Android)')}</span>
                  </div>
                  <h3 className="text-base font-bold">
                    {t(
                      'Install OralAce Directly on iPhone, iPad, or Android Phone',
                      '将 OralAce 直接下载安装到您的 iPhone、iPad 或 Android 手机桌面'
                    )}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t(
                      'Install straight from your browser as a standalone desktop/mobile app, or go to the "Download Mobile App" tab in the main header to download the full Android APK / iOS Capacitor build bundle.',
                      '点击右侧按钮即可在手机或电脑上直接生成独立桌面 App 图标；您也可以在顶部导航栏点击“下载手机应用”一键下载完整 Android APK 云端构建包。'
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  {isInstallable && !isInstalled && (
                    <button
                      type="button"
                      onClick={install}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t('Install App Now', '立即安装到本设备')}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyTrialLink}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{t('App Link Copied!', '手机安装链接已复制！')}</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>{t('Copy Link to Send to Phone', '复制链接发到手机微信/WhatsApp')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4 space-y-2.5">
                  <div className="text-xs font-bold text-slate-900">
                    {t('iPhone / iPad (iOS Safari) Installation', '苹果手机 iPhone / iPad (Safari) 安装步骤')}
                  </div>
                  <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>
                      {t(
                        'Open this app link in Safari on your iPhone or iPad.',
                        '在 iPhone 或 iPad 的 Safari 浏览器中打开本应用链接。'
                      )}
                    </li>
                    <li>
                      {t(
                        'Tap the "Share" button (square with upward arrow) at the bottom bar.',
                        '点击底部工具栏正中间的“分享”图标（向上箭头方框）。'
                      )}
                    </li>
                    <li>
                      {t(
                        'Scroll down and tap "Add to Home Screen" → "Add".',
                        '向下滑动菜单，点击“添加到主屏幕 (Add to Home Screen)”即可生成独立 App 图标。'
                      )}
                    </li>
                  </ol>
                  {isIOS && (
                    <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                      {t('You are on iOS — tap Share → Add to Home Screen now!', '检测到您正在使用 iOS 设备，点击下方分享即可添加到桌面！')}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 p-4 space-y-2.5">
                  <div className="text-xs font-bold text-slate-900">
                    {t('Android (Chrome / APK Package) Installation', '安卓手机 Android (Chrome / APK 安装包) 步骤')}
                  </div>
                  <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>
                      {t(
                        'Open this app link in Chrome on your Android phone.',
                        '在安卓手机的 Chrome 浏览器中打开本应用链接。'
                      )}
                    </li>
                    <li>
                      {t(
                        'Tap the "Install App" button in the top bar or browser menu (⋮).',
                        '点击顶部导航栏的“Install App / 装入手机”按钮，或点击右上角菜单 (⋮)。'
                      )}
                    </li>
                    <li>
                      {t(
                        'Or open the "Download Mobile App" tab to export the Android APK GitHub Cloud Builder bundle.',
                        '或前往顶部“下载手机应用”页面一键导出 Android .apk 云端打包工程。'
                      )}
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Share Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              {t(
                'Share OralAce link with students or parents:',
                '一键复制应用链接分享给学生或家长：'
              )}
            </div>
            <button
              type="button"
              onClick={handleCopyTrialLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('Link Copied!', '分享链接已复制！')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('Copy Share Link', '复制分享链接')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
