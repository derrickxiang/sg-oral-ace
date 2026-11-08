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
  Users,
  Download,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { playNaturalSpeech } from '../utils/naturalSpeech';
import {
  computeClassCohortInsights,
  generateClassReportCsv,
} from '../utils/seabRubric';

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
  const { lang, t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'pronunciation_book' | 'corpus_book' | 'class_insights'
  >('overview');
  const [selectedSchoolCode, setSelectedSchoolCode] = useState<string>('GROUP-A');

  // Compute stats
  const totalPractices = history.length;
  const avgScore =
    totalPractices > 0
      ? Math.round(history.reduce((acc, cur) => acc + cur.totalScore, 0) / totalPractices)
      : 0;
  const retestsCount = history.filter((h) => h.isRetest).length;

  const classInsights = computeClassCohortInsights(selectedSchoolCode, history);

  // Speak pronunciation
  const speakWord = (word: string) => {
    playNaturalSpeech(word, { voiceType: 'examiner', voiceName: 'Puck', rate: 0.85 });
  };

  const handleDownloadClassCsv = () => {
    const csvContent = generateClassReportCsv(classInsights);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OralAce_Class_${selectedSchoolCode}_Report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Clean Studio Portfolio Header & KPI Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{t('OralAce Practice Log', 'OralAce 练习记录档案')}</span>
              <span aria-hidden="true">·</span>
              <span>{t('Personal Self-Practice Reference', '个人口语自测与进步参考')}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {t('Weekly Oral Practice & Progress Tracker', '每周口语练习与进步追踪')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            {t(
              'Archive of completed video oral practices, AI coach follow-ups, retest comparisons, and bookmarked pronunciation tips.',
              '完整归档每一次生活短片练习、延伸互动、二次再练前后对比与多音字读音参考。'
            )}
          </p>
        </div>

        {/* 4-Column Tabular KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 block">{t('Total Sessions', '累计练习场次')}</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
              {totalPractices} <span className="text-xs font-normal text-slate-500">{t('sessions', '次')}</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 block">{t('Average Score (/50)', '平均得分 (满分50)')}</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
              {avgScore} <span className="text-xs font-normal text-slate-500">{t('pts', '分')}</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 block">{t('Retest Comparisons', '二次再练攻坚')}</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
              {retestsCount} <span className="text-xs font-normal text-slate-500">{t('completed', '次')}</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 block">{t('Saved Tone Corrections', '已收藏易错发音')}</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
              {savedPronunciations.length} <span className="text-xs font-normal text-slate-500">{t('words', '词')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 gap-4 sm:gap-6 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'text-teal-900 border-b-2 border-teal-900'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          {t(`Practice History (${history.length})`, `练习历史记录 (${history.length})`)}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('pronunciation_book')}
          className={`pb-3 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'pronunciation_book'
              ? 'text-teal-900 border-b-2 border-teal-900'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          {t(`Pronunciation Notebook (${savedPronunciations.length})`, `易错发音纠错本 (${savedPronunciations.length})`)}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('corpus_book')}
          className={`pb-3 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'corpus_book'
              ? 'text-teal-900 border-b-2 border-teal-900'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          {t(`Vocabulary & Corpus Bank (${savedCorpusWords.length})`, `高分语料积累库 (${savedCorpusWords.length})`)}
        </button>

        <button
          type="button"
          data-testid="tab-teacher-class-insights"
          onClick={() => setActiveSubTab('class_insights')}
          className={`pb-3 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'class_insights'
              ? 'text-teal-900 border-b-2 border-teal-900'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>{t('Teacher / Class Insights', '教师与班级学情看板')}</span>
        </button>
      </div>

      {/* 1. Overview & History List */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">
                {t('No Practice Sessions Yet', '暂无练习记录')}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {t(
                  'Complete a video oral practice and examiner follow-up under the "Oral Practice" tab to archive your diagnostic reports here.',
                  '请在“口试陪练”页面完成一次生活话题短片说话与考官追问，系统将自动归档您的答题记录与三项反馈。'
                )}
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
                        {new Date(item.createdAt).toLocaleDateString(lang === 'en' ? 'en-SG' : 'zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {item.isRetest ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {t('Retest Leap', '二次再练飞跃')}
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {t('Initial Attempt', '首轮实战')}
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
                      <span className="text-xs text-gray-400 block">{t('Total Score', '综合得分')}</span>
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
              <h3 className="font-bold text-gray-900 text-base">
                {t('Personal Pronunciation & Tone Notebook', '学生专属易错发音本')}
              </h3>
              <p className="text-xs text-gray-500">
                {t(
                  'Review bookmarked polyphonic characters and Mandarin tones for accurate exam delivery',
                  '针对新加坡常见读音误区，反复磨练四声与多音字，确保口试考场字字规范'
                )}
              </p>
            </div>
            <span className="text-xs bg-rose-50 text-rose-700 font-semibold px-2.5 py-1 rounded-full border border-rose-200">
              {t(`${savedPronunciations.length} Saved`, `共记录 ${savedPronunciations.length} 处`)}
            </span>
          </div>

          {savedPronunciations.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-xs">
              {t(
                'No pronunciation items saved yet. Click the bookmark icon on any Pronunciation Correction card during practice to add it here.',
                '暂未收藏发音问题。在口试练习时，点击发音纠错卡片旁的“书签”图标即可加入本纠错本。'
              )}
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
                        {t('Tone: ', '调值：')}
                        {item.toneInfo}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => speakWord(item.word)}
                        className="p-1.5 bg-white border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-medium transition-colors"
                        title={t('Listen to standard pronunciation', '标准读音')}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      {onRemovePronunciation && (
                        <button
                          onClick={() => onRemovePronunciation(item.word)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title={t('Remove from notebook', '移出纠错本')}
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
            <h3 className="font-bold text-gray-900 text-base">
              {t('High-Scoring Corpus & Idioms Bank', '学生高分语料库积累')}
            </h3>
            <p className="text-xs text-gray-500">
              {t(
                'Essential connectives, four-character idioms, and standard Singapore Chinese vocabulary',
                '积累高频转折词、四字成语与新加坡本土规范用语'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { phrase: '举手之劳', pinyin: 'jǔ shǒu zhī láo', note: t('A small, effortless act (e.g. returning hawker trays)', '形容小贩中心归还托盘、随手捡垃圾') },
              { phrase: '潜移默化', pinyin: 'qián yí mò huà', note: t('Subtle, positive influence from family & school education', '家庭与学校教育的无形熏陶') },
              { phrase: '双管齐下', pinyin: 'shuāng guǎn qí xià', note: t('Two-pronged approach combining enforcement & moral education', '法律严惩与品德培育并重') },
              { phrase: '老吾老以及人之老', pinyin: 'lǎo wú lǎo...', note: t('Extending respect & care to all elderly in the community', '社区关怀独居乐龄人士') },
              { phrase: '迫在眉睫', pinyin: 'pò zài méi jié', note: t('An urgent matter (e.g. Semakau Landfill capacity crisis)', '实马高垃圾填埋场饱和危机') },
              { phrase: '防患于未然', pinyin: 'fáng huàn yú wèi rán', note: t('Taking preventive measures before problems occur (anti-scam)', '防范网络诈骗与数码安全') },
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

      {/* 4. Teacher / Class Insights Dashboard (Enhancement 4) */}
      {activeSubTab === 'class_insights' && (
        <div
          data-testid="teacher-class-insights-panel"
          className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6"
        >
          {/* Top Study Group Selector & Export CSV Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-semibold text-teal-800">
                {t(
                  'Study Group Practice Reference Overview',
                  '学习小组口语练习参考趋势看板（仅供练习参考）'
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                {t(
                  `Group Practice Reference · ${classInsights.schoolCode}`,
                  `小组练习参考记录 · 编号 ${classInsights.schoolCode}`
                )}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl">
                {['GROUP-A', 'GROUP-B', 'SEC-PRACTICE', 'ORAL-CLUB'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedSchoolCode(code)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      selectedSchoolCode === code
                        ? 'bg-[#0B3B3C] text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>

              <button
                type="button"
                data-testid="btn-export-class-csv"
                onClick={handleDownloadClassCsv}
                className="inline-flex items-center gap-1.5 bg-[#0B3B3C] hover:bg-teal-900 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>{t('Export Class CSV', '导出全班成绩 CSV')}</span>
              </button>
            </div>
          </div>

          {/* Cohort Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">
                {t('Active Students', '参训学生人数')}
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
                {classInsights.totalStudents}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">
                {t('Class Avg Paper 3 (/50)', '全班总平均分 (/50)')}
              </span>
              <span className="text-xl font-bold font-mono text-teal-900 mt-1 block tabular-nums">
                {classInsights.classAverageScore}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">
                {t('Avg Reading Aloud (/10)', '朗读短文平均分 (/10)')}
              </span>
              <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block tabular-nums">
                {classInsights.classAverageReadingAloud}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">
                {t('Band 1 & 2 Distinction/Merit', 'Band 1 & 2 优良率')}
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
                {Math.round(
                  ((classInsights.bandDistribution.band1 +
                    classInsights.bandDistribution.band2) /
                    Math.max(1, classInsights.totalStudents)) *
                    100
                )}
                %
              </span>
            </div>
          </div>

          {/* Top Class-Wide Mispronounced Words */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t(
                'Top Class-Wide Polyphonic & Tone Traps (Recommended for Classroom Drill)',
                '全班高频易错多音字与声调统计（建议课堂集中听写纠音）'
              )}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {classInsights.topClassPronunciationTraps.map((trap, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/80 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{trap.word}</div>
                    <div className="text-[11px] font-mono text-rose-800">{trap.pinyin}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {t(`${trap.errorCount} class occurrences`, `全班累计出现 ${trap.errorCount} 次`)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakWord(trap.word)}
                    className="p-2 rounded-lg bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer shrink-0"
                    title={t('Play standard pronunciation for class', '向全班播放标准示范读音')}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">{t('Learner Name', '练习者姓名')}</th>
                  <th className="py-2.5 px-3 font-mono">{t('Sessions', '练习次数')}</th>
                  <th className="py-2.5 px-3 font-mono">{t('Reading (/10)', '朗读参考 (/10)')}</th>
                  <th className="py-2.5 px-3 font-mono">{t('Ref Score (/50)', '参考分 (/50)')}</th>
                  <th className="py-2.5 px-3">{t('Reference Tier', '参考区间')}</th>
                  <th className="py-2.5 px-3">{t('Primary Phonetic Focus', '建议留意读音')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classInsights.students.map((stu) => (
                  <tr key={stu.studentId} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {stu.studentName}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">
                      {stu.sessionsCompleted}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-teal-800 font-semibold">
                      {stu.readingAloudScore}/10
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums font-bold text-slate-900">
                      {stu.latestScore}/50
                    </td>
                    <td className="py-2.5 px-3 text-xs text-emerald-800 font-medium">
                      {stu.band}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-rose-700">
                      {stu.topPronunciationTrap}
                    </td>
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

