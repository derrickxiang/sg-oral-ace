import React from 'react';
import { Globe, Sparkles, Smartphone, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  activeTab: 'practice' | 'progress' | 'corpus' | 'mobile_export';
  setActiveTab: (tab: 'practice' | 'progress' | 'corpus' | 'mobile_export') => void;
  weeklyStreak: number;
  totalPractices: number;
  onOpenAiInfo?: () => void;
  isTrialMode?: boolean;
  trialSessionsRemaining?: number;
  userDisplayName?: string | null;
  onOpenTrialModal?: (section?: 'overview' | 'pricing' | 'mobile_install') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAiInfo,
  isTrialMode = true,
  trialSessionsRemaining = 3,
  userDisplayName,
  onOpenTrialModal,
}) => {
  const { lang, toggleLang, t } = useLanguage();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const tabs = [
    { id: 'practice' as const, label: t('Oral Practice', '口试陪练') },
    { id: 'progress' as const, label: t('Weekly Progress', '每周进步') },
    { id: 'corpus' as const, label: t('Pronunciation & SG Corpus', '发音与本土词库') },
    { id: 'mobile_export' as const, label: t('Download Mobile App', '下载手机应用') },
  ];

  const handleMobileAppClick = async () => {
    if (isInstallable && !isInstalled) {
      const accepted = await install();
      if (accepted) return;
    }
    setActiveTab('mobile_export');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#072B2E] text-white border-b border-teal-800/80 shadow-xs overflow-x-clip">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 min-h-14 py-1.5">
          {/* Zone 1: Clean single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className="flex items-center gap-2 text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <span>OralAce</span>
            <span className="hidden lg:inline xl:hidden 2xl:inline text-xs font-normal text-emerald-300/90 border-l border-teal-700 pl-2">
              {t('AI Chinese Oral Practice Coach', '新加坡华文口语陪练助手')}
            </span>
          </button>

          {/* Zone 2: Clean single-line Typography Navigation Links (xl+ wide viewports) */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 h-11">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative h-full inline-flex items-center text-xs 2xl:text-sm whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-emerald-300 font-semibold'
                      : 'text-slate-300 hover:text-white font-medium'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Concise Utility & Account / Install Actions */}
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 min-w-0">
            {/* In-App PWA Install / Mobile Download Button */}
            <button
              type="button"
              onClick={handleMobileAppClick}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title={t('Download & Install OralAce on iPhone / Android', '下载并安装 OralAce 到手机桌面')}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">
                {isInstallable ? t('Install App', '装入手机') : t('Mobile App', '手机应用')}
              </span>
            </button>

            {/* User Account / Email Registration & Topic Unlock Button */}
            {onOpenTrialModal && (
              <button
                type="button"
                onClick={() => onOpenTrialModal('overview')}
                className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-lg border border-teal-700 bg-teal-900/80 hover:bg-teal-800 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title={t('Email Registration & Unlock All 20 Topics', '电子邮箱注册登录 · 解锁全部 20 套考题')}
              >
                {userDisplayName ? (
                  <UserIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                )}
                <span className="hidden sm:inline">
                  {userDisplayName
                    ? `${userDisplayName.split(' ')[0]} · ${t('All 20 Unlocked', '20题已解锁')}`
                    : isTrialMode
                    ? t('Email Register (2/20 Free)', '邮箱注册 (免费2题)')
                    : t('All 20 Topics Unlocked', '全部20题已解锁')}
                </span>
                <span className="sm:hidden">
                  {userDisplayName
                    ? userDisplayName.split(' ')[0].slice(0, 8)
                    : isTrialMode
                    ? t('Register (2/20)', '邮箱注册')
                    : t('Unlocked', '已解锁')}
                </span>
              </button>
            )}

            {onOpenAiInfo && (
              <button
                type="button"
                onClick={onOpenAiInfo}
                className="hidden md:inline-flex text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer px-2 py-1.5 rounded-md hover:bg-teal-900"
              >
                {t('AI Architecture', 'AI 架构')}
              </button>
            )}

            <button
              type="button"
              onClick={toggleLang}
              aria-label={t('Switch to Chinese', '切换为英文')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title={t('Switch UI language to Chinese (切换中文)', 'Switch UI language to English')}
            >
              <Globe className="w-3.5 h-3.5 text-slate-900 shrink-0" />
              <span>{lang === 'en' ? '中文' : 'EN'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Row Navigation Bar for Mobile, Tablet & Split-Screen Desktop (<1280px) */}
        <div className="xl:hidden flex items-center justify-start sm:justify-between border-t border-teal-800/80 py-1.5 gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white font-medium'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
