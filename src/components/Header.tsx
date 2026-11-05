import React from 'react';
import { Award, BookOpen, Flame, History, Smartphone, Volume2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'practice' | 'progress' | 'corpus' | 'mobile_export';
  setActiveTab: (tab: 'practice' | 'progress' | 'corpus' | 'mobile_export') => void;
  weeklyStreak: number;
  totalPractices: number;
  onOpenAiInfo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  weeklyStreak,
  totalPractices,
  onOpenAiInfo,
}) => {
  const tabs = [
    { id: 'practice' as const, label: '口试陪练', icon: BookOpen },
    { id: 'progress' as const, label: '每周进步', icon: History },
    { id: 'corpus' as const, label: '发音语料', icon: Volume2 },
    { id: 'mobile_export' as const, label: '移动发布包', icon: Smartphone },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-red-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer shrink-0"
            onClick={() => setActiveTab('practice')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-200">
              <span className="font-bold text-base sm:text-lg tracking-wider">狮</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-gray-900 text-base sm:text-lg tracking-tight whitespace-nowrap">
                  狮城口试宝
                </span>
                <span className="bg-red-50 text-red-700 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border border-red-200 whitespace-nowrap">
                  O-Level
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                新加坡中学会考华文口试 · 录像说话与深度追问陪练
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex space-x-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Badges */}
          <div className="flex items-center space-x-2">
            {/* AI Engine Status Button */}
            {onOpenAiInfo && (
              <button
                onClick={onOpenAiInfo}
                className="flex items-center space-x-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer"
                title="查看本应用 AI 考官模型架构与应用细节"
              >
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                <span>AI引擎剖析</span>
              </button>
            )}

            <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{weeklyStreak}天打卡</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>已练 {totalPractices} 题</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tab Bar */}
        <div className="md:hidden flex items-center justify-between pb-2 border-t border-gray-100 pt-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'text-red-600 font-bold bg-red-50/60'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-red-600' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
