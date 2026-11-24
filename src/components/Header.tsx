import React from 'react';
import { Globe, Sparkles, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  activeTab: 'practice' | 'progress' | 'corpus' | 'mobile_export';
  setActiveTab: (tab: 'practice' | 'progress' | 'corpus' | 'mobile_export') => void;
  weeklyStreak: number;
  totalPractices: number;
  totalTopicsCount?: number;
  onOpenAiInfo?: () => void;
  isTrialMode?: boolean;
  trialSessionsRemaining?: number;
  userDisplayName?: string | null;
  onOpenTrialModal?: (section?: 'overview' | 'pricing' | 'mobile_install') => void;
  onOpenConsentModal?: () => void;
  isConsentSigned?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalTopicsCount = 40,
  isTrialMode = true,
  userDisplayName,
  onOpenTrialModal,
}) => {
  const { lang, toggleLang, t } = useLanguage();

  // Strict 3-Zone Top Bar Contract: concise single-line text nav links
  const tabs = [
    { id: 'practice' as const, label: t('Oral Studio', '口语练习室') },
    { id: 'progress' as const, label: t('Progress & Analytics', '学情分析与档案') },
    { id: 'corpus' as const, label: t('Culture & Phonetics', '本土语料与发音') },
    { id: 'mobile_export' as const, label: t('Mobile App', '手机应用') },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#072B2E] text-white border-b border-teal-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Zone 1: Clean Academic Brand Wordmark (no decorative pulse dots) */}
          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className="flex items-baseline gap-2.5 text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            <span className="font-extrabold tracking-tight text-white">OralAce</span>
            <span className="hidden xl:inline text-xs font-normal text-teal-200/80 border-l border-teal-700/80 pl-2.5">
              {t('Chinese Oral Practice Studio', '新加坡华文口语陪练室')}
            </span>
          </button>

          {/* Zone 2: Clean Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 h-full">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative h-full inline-flex items-center text-xs xl:text-sm whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-emerald-300 font-semibold'
                      : 'text-teal-100/75 hover:text-white font-medium'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Account/Unlock CTA + Compact Language Switch */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            {onOpenTrialModal && (
              <button
                type="button"
                onClick={() => onOpenTrialModal('overview')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-teal-700 bg-[#0B3B3C] hover:bg-teal-800 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title={t('Email Account & Topic Unlock', '电子邮箱注册与考题解锁')}
              >
                {userDisplayName ? (
                  <UserIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                )}
                <span className="hidden sm:inline">
                  {userDisplayName
                    ? `${userDisplayName.split(' ')[0]} · ${t(`${totalTopicsCount} Topics`, `解锁${totalTopicsCount}题`)}`
                    : isTrialMode
                    ? t(`Register · Unlock ${totalTopicsCount} Topics`, `邮箱注册 · 解锁${totalTopicsCount}题`)
                    : t(`All ${totalTopicsCount} Unlocked`, `全部${totalTopicsCount}题已解锁`)}
                </span>
                <span className="sm:hidden">
                  {userDisplayName
                    ? userDisplayName.split(' ')[0].slice(0, 6)
                    : isTrialMode
                    ? t('Register', '邮箱注册')
                    : t('Account', '账户')}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleLang}
              aria-label={t('Switch Language', '切换语言')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title={t('Switch UI language to Chinese (切换中文)', 'Switch UI language to English')}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'en' ? '中文' : 'EN'}</span>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Navigation Strip (<1024px) */}
        <div className="lg:hidden flex items-center justify-between border-t border-teal-800/80 py-1.5 gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-teal-100/80 hover:text-white font-medium'
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
