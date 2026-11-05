import React, { useState } from 'react';
import { EvaluationResult, PronunciationIssue } from '../types/oral';
import {
  Calendar,
  TrendingUp,
  Award,
  Volume2,
  Trash2,
  FileCheck,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  Flame,
  ArrowUpRight,
} from 'lucide-react';

interface WeeklyTrackerProps {
  history: EvaluationResult[];
  savedPronunciations: PronunciationIssue[];
  savedCorpusWords: string[];
  onRemovePronunciation?: (word: string) => void;
  onSelectHistoryItem?: (item: EvaluationResult) => void;
}

export const WeeklyTracker: React.FC<WeeklyTrackerProps> = ({
  history,
  savedPronunciations,
  savedCorpusWords,
  onRemovePronunciation,
  onSelectHistoryItem,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'pronunciation_book' | 'corpus_book'>('overview');

  // Compute stats
  const totalPractices = history.length;
  const avgScore =
    totalPractices > 0
      ? Math.round(history.reduce((acc, cur) => acc + cur.totalScore, 0) / totalPractices)
      : 0;
  const retestsCount = history.filter((h) => h.isRetest).length;

  // Speak pronunciation
  const speakWord = (word: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI cards */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold text-rose-200 uppercase tracking-wider block mb-1">
            新加坡 O-Level 华文备考成长档案
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mb-2">
            每周口试进步与能力追踪
          </h2>
          <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
            记录每一次生活短片会话、考官追问诊断与二次再练成长。循序渐进构建自信与高分语料库。
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <span className="text-xs text-rose-200 block">累计练习场次</span>
            <span className="text-2xl sm:text-3xl font-black font-mono mt-1 block">
              {totalPractices} <span className="text-xs font-normal">次</span>
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <span className="text-xs text-rose-200 block">平均得分 (满分50)</span>
            <span className="text-2xl sm:text-3xl font-black font-mono mt-1 block text-amber-300">
              {avgScore} <span className="text-xs font-normal">分</span>
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <span className="text-xs text-rose-200 block">二次再练攻坚</span>
            <span className="text-2xl sm:text-3xl font-black font-mono mt-1 block text-emerald-300">
              {retestsCount} <span className="text-xs font-normal">次</span>
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <span className="text-xs text-rose-200 block">已扫除易错发音</span>
            <span className="text-2xl sm:text-3xl font-black font-mono mt-1 block text-cyan-300">
              {savedPronunciations.length} <span className="text-xs font-normal">词</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-gray-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeSubTab === 'overview'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          练习历史记录 ({history.length})
        </button>

        <button
          onClick={() => setActiveSubTab('pronunciation_book')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeSubTab === 'pronunciation_book'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          易错发音纠错本 ({savedPronunciations.length})
        </button>

        <button
          onClick={() => setActiveSubTab('corpus_book')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeSubTab === 'corpus_book'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          高分语料积累库 ({savedCorpusWords.length})
        </button>
      </div>

      {/* 1. Overview & History List */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">暂无练习记录</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                请在“口试陪练”页面完成一次生活话题短片说话与考官追问，系统将自动归档您的答题记录与三项反馈。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, index) => (
                <div
                  key={item.id || index}
                  onClick={() => onSelectHistoryItem && onSelectHistoryItem(item)}
                  className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs hover:border-red-300 hover:shadow-md transition-all cursor-pointer flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {item.isRetest ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          二次再练飞跃
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          首轮实战
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">{item.topicTitle}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1 italic">
                      “{item.initialTranscript}”
                    </p>
                  </div>

                  {/* Score & Band Pill */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">综合得分</span>
                      <span className="text-2xl font-black font-mono text-gray-900">
                        {item.totalScore}
                        <span className="text-xs text-gray-400 font-normal"> / 50</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          item.totalScore >= 42
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.totalScore >= 34
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.band.split(' ')[0]}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Pronunciation Notebook */}
      {activeSubTab === 'pronunciation_book' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">学生专属易错发音本</h3>
              <p className="text-xs text-gray-500">
                针对新加坡常见读音误区，反复磨练四声与多音字，确保口试考场字字规范
              </p>
            </div>
            <span className="text-xs bg-rose-50 text-rose-700 font-semibold px-2.5 py-1 rounded-full border border-rose-200">
              共记录 {savedPronunciations.length} 处
            </span>
          </div>

          {savedPronunciations.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-xs">
              暂未收藏发音问题。在口试练习时，点击发音纠错卡片旁的“书签”图标即可加入本纠错本。
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPronunciations.map((item, idx) => (
                <div key={idx} className="bg-rose-50/50 border border-rose-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-black text-gray-900">{item.word}</span>
                        <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                          {item.pinyin}
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-800 block mt-1">
                        调值：{item.toneInfo}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => speakWord(item.word)}
                        className="p-1.5 bg-white border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-medium transition-colors"
                        title="标准读音"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      {onRemovePronunciation && (
                        <button
                          onClick={() => onRemovePronunciation(item.word)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="移出纠错本"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 mt-2 bg-white/80 p-2 rounded-lg border border-rose-100">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Corpus Notebook */}
      {activeSubTab === 'corpus_book' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 text-base">学生高分语料库积累</h3>
            <p className="text-xs text-gray-500">
              积累高频转折词、四字成语与新加坡本土规范用语
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { phrase: '举手之劳', pinyin: 'jǔ shǒu zhī láo', note: '形容小贩中心归还托盘、随手捡垃圾' },
              { phrase: '潜移默化', pinyin: 'qián yí mò huà', note: '家庭与学校教育的无形熏陶' },
              { phrase: '双管齐下', pinyin: 'shuāng guǎn qí xià', note: '法律严惩与品德培育并重' },
              { phrase: '老吾老以及人之老', pinyin: 'lǎo wú lǎo...', note: '社区关怀独居乐龄人士' },
              { phrase: '迫在眉睫', pinyin: 'pò zài méi jié', note: '实马高垃圾填埋场饱和危机' },
              { phrase: '防患于未然', pinyin: 'fáng huàn yú wèi rán', note: '防范网络诈骗与数码安全' },
            ].map((item, idx) => (
              <div key={idx} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5">
                <span className="font-bold text-indigo-950 font-serif block text-sm">
                  {item.phrase}
                </span>
                <span className="text-[11px] font-mono text-indigo-700 block mt-0.5">
                  {item.pinyin}
                </span>
                <p className="text-xs text-gray-600 mt-1.5">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
