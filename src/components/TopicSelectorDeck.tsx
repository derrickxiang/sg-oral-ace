import React, { useState, useMemo } from 'react';
import {
  LayoutGrid,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Mail,
  CheckCircle2,
  Film,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { OralTopic } from '../types/oral';
import { useLanguage } from '../context/LanguageContext';

export const FREE_TRIAL_TOPIC_COUNT = 2;

export type SeabDomainId =
  | 'all'
  | 'free_only'
  | 'civic_community'
  | 'green_health'
  | 'tech_digital'
  | 'culture_heritage'
  | 'youth_growth';

interface DomainMeta {
  id: SeabDomainId;
  labelEn: string;
  labelZh: string;
  topicIds: string[];
}

export const SEAB_THEMATIC_DOMAINS: DomainMeta[] = [
  {
    id: 'civic_community',
    labelEn: '1. Civic Ethos & Community',
    labelZh: '一、社区公德与邻里温情',
    topicIds: [
      'topic-hawker-tray',
      'topic-youth-volunteer',
      'topic-hdb-neighbour',
      'topic-public-transport-seat',
    ],
  },
  {
    id: 'green_health',
    labelEn: '2. Green Plan & Active Living',
    labelZh: '二、绿色环保与健康生活',
    topicIds: [
      'topic-green-campus',
      'topic-active-youth-health',
      'topic-food-waste-reduction',
    ],
  },
  {
    id: 'tech_digital',
    labelEn: '3. Smart Nation, AI & Digital Life',
    labelZh: '三、智慧国、AI与数码素养',
    topicIds: [
      'topic-scam-prevention',
      'topic-social-media',
      'topic-ai-learning',
      'topic-cashless-seniors',
      'topic-phubbing-communication',
    ],
  },
  {
    id: 'culture_heritage',
    labelEn: '4. Heritage & Racial Harmony',
    labelZh: '四、多元文化与非遗传承',
    topicIds: [
      'topic-cultural-heritage',
      'topic-racial-harmony',
      'topic-hawker-heritage',
    ],
  },
  {
    id: 'youth_growth',
    labelEn: '5. Youth Growth & Lifelong Learning',
    labelZh: '五、青少年成长与价值塑造',
    topicIds: [
      'topic-campus-wellbeing',
      'topic-part-time-work',
      'topic-tuition-stress',
      'topic-youth-financial-literacy',
      'topic-reading-lifelong-learning',
    ],
  },
];

const SHORT_TOPIC_LABELS_EN: Record<string, string> = {
  'topic-hawker-tray': 'Hawker Tray Return',
  'topic-green-campus': 'Green Campus & BYO',
  'topic-scam-prevention': 'Anti-Scam Shield',
  'topic-youth-volunteer': 'Active Ageing Care',
  'topic-social-media': 'Social Media Balance',
  'topic-ai-learning': 'AI & Independent Study',
  'topic-hdb-neighbour': 'HDB Neighbourliness',
  'topic-cultural-heritage': 'Cultural Heritage',
  'topic-campus-wellbeing': 'Peer Support & Stress',
  'topic-cashless-seniors': 'Cashless Seniors',
  'topic-racial-harmony': 'Racial Harmony',
  'topic-hawker-heritage': 'Hawker Succession',
  'topic-public-transport-seat': 'MRT Priority Seat',
  'topic-part-time-work': 'Student Part-Time Work',
  'topic-active-youth-health': 'Outdoor Sports & Health',
  'topic-food-waste-reduction': 'Food Waste Reduction',
  'topic-tuition-stress': 'Tuition & Holistic Growth',
  'topic-phubbing-communication': 'Phubbing & Family Talk',
  'topic-youth-financial-literacy': 'Youth Financial Literacy',
  'topic-reading-lifelong-learning': 'Reading & NLB Habit',
};

const SHORT_TOPIC_LABELS_ZH: Record<string, string> = {
  'topic-hawker-tray': '小贩中心归还托盘',
  'topic-green-campus': '校园减塑与自备餐盒',
  'topic-scam-prevention': '全民防诈与长者守护',
  'topic-youth-volunteer': '跨代义工与乐龄关怀',
  'topic-social-media': '社交媒体与现实社交',
  'topic-ai-learning': '人工智能与自主学习',
  'topic-hdb-neighbour': '组屋睦邻与甘榜精神',
  'topic-cultural-heritage': '传统节庆与文化传承',
  'topic-campus-wellbeing': '校园抗压与同侪互助',
  'topic-cashless-seniors': '无现金支付与数码包容',
  'topic-racial-harmony': '种族和谐与求同存异',
  'topic-hawker-heritage': '小贩非遗与青年接班',
  'topic-public-transport-seat': '地铁优先座与礼让',
  'topic-part-time-work': '假期兼职与社会历练',
  'topic-active-youth-health': '户外运动与身心健康',
  'topic-food-waste-reduction': '惜食减量与光盘行动',
  'topic-tuition-stress': '课外补习与全面发展',
  'topic-phubbing-communication': '餐桌低头族与亲情沟通',
  'topic-youth-financial-literacy': '理性消费与理财观念',
  'topic-reading-lifelong-learning': '深度阅读与终身学习',
};

interface TopicSelectorDeckProps {
  topics: OralTopic[];
  currentTopicIndex: number;
  onSelectTopic: (index: number) => void;
  isLockedTopic: (index: number) => boolean;
  isRegisteredOrUnlockedAll: boolean;
  onOpenEmailRegister: () => void;
  sessionStep: 'video' | 'record_initial' | 'followup' | 'feedback';
}

export const TopicSelectorDeck: React.FC<TopicSelectorDeckProps> = ({
  topics,
  currentTopicIndex,
  onSelectTopic,
  isLockedTopic,
  isRegisteredOrUnlockedAll,
  onOpenEmailRegister,
  sessionStep,
}) => {
  const { t, getTopicDisplay } = useLanguage();
  const [isCatalogExpanded, setIsCatalogExpanded] = useState<boolean>(false);
  const [selectedDomain, setSelectedDomain] = useState<SeabDomainId>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentTopic = topics[currentTopicIndex] || topics[0];
  const currentDisplay = getTopicDisplay(currentTopic);
  const currentNum = currentTopicIndex + 1 < 10 ? `0${currentTopicIndex + 1}` : `${currentTopicIndex + 1}`;

  const getDomainForTopic = (topicId: string): DomainMeta | undefined => {
    return SEAB_THEMATIC_DOMAINS.find((d) => d.topicIds.includes(topicId));
  };

  const currentDomain = getDomainForTopic(currentTopic.id);

  const filteredTopicsWithIndex = useMemo(() => {
    return topics
      .map((topic, index) => ({ topic, index }))
      .filter(({ topic, index }) => {
        if (selectedDomain === 'free_only' && index >= FREE_TRIAL_TOPIC_COUNT) {
          return false;
        }
        if (selectedDomain !== 'all' && selectedDomain !== 'free_only') {
          const domain = SEAB_THEMATIC_DOMAINS.find((d) => d.id === selectedDomain);
          if (domain && !domain.topicIds.includes(topic.id)) {
            return false;
          }
        }
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const disp = getTopicDisplay(topic);
          const shortEn = SHORT_TOPIC_LABELS_EN[topic.id] || '';
          const shortZh = SHORT_TOPIC_LABELS_ZH[topic.id] || '';
          const vocabMatch = topic.suggestedVocabulary.some((v) =>
            v.word.toLowerCase().includes(q)
          );
          return (
            topic.title.toLowerCase().includes(q) ||
            topic.theme.toLowerCase().includes(q) ||
            disp.title.toLowerCase().includes(q) ||
            disp.theme.toLowerCase().includes(q) ||
            topic.primaryQuestion.toLowerCase().includes(q) ||
            (disp.primaryQuestionEnHint || '').toLowerCase().includes(q) ||
            shortEn.toLowerCase().includes(q) ||
            shortZh.toLowerCase().includes(q) ||
            vocabMatch
          );
        }
        return true;
      });
  }, [topics, selectedDomain, searchQuery, getTopicDisplay]);

  const handlePrevTopic = () => {
    const prevIdx = currentTopicIndex > 0 ? currentTopicIndex - 1 : topics.length - 1;
    if (isLockedTopic(prevIdx)) {
      onOpenEmailRegister();
      return;
    }
    onSelectTopic(prevIdx);
  };

  const handleNextTopic = () => {
    const nextIdx = currentTopicIndex < topics.length - 1 ? currentTopicIndex + 1 : 0;
    if (isLockedTopic(nextIdx)) {
      onOpenEmailRegister();
      return;
    }
    onSelectTopic(nextIdx);
  };

  return (
    <section
      aria-label={t('Chinese Oral Practice Topic Selector', '华文口语练习主题选择器')}
      className="bg-white rounded-2xl border border-teal-900/15 shadow-2xs overflow-hidden min-w-0"
    >
      {/* ZONE 1: Executive Active Topic Header & Syllabus Switcher */}
      <div className="p-4 sm:px-5 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-[#F7FBFA] to-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 min-w-0">
          {/* Left: Active Topic Number, Syllabus Domain & Title */}
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#0B3B3C] text-white flex flex-col items-center justify-center shrink-0 shadow-2xs">
              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-300 leading-none">
                TOPIC
              </span>
              <span className="text-base font-mono font-bold tabular-nums leading-tight mt-0.5">
                {currentNum}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                <span className="font-semibold text-teal-900">
                  {currentDomain
                    ? t(currentDomain.labelEn, currentDomain.labelZh)
                    : currentDisplay.theme}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500">{currentDisplay.theme}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-emerald-700">
                  {currentTopicIndex < FREE_TRIAL_TOPIC_COUNT
                    ? t(
                        `Free Practice Topic (${currentTopicIndex + 1} of ${FREE_TRIAL_TOPIC_COUNT})`,
                        `免费练习主题 (${currentTopicIndex + 1}/${FREE_TRIAL_TOPIC_COUNT})`
                      )
                    : t('Registered Member Unlocked', '注册会员已解锁')}
                </span>
                {currentTopic.realVideoUrl && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-teal-800">
                      <Film className="w-3 h-3 text-emerald-600" />
                      {t('Silent Practice Clip', '生活实景无声短片')}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-1 truncate">
                {currentDisplay.title}
              </h1>
            </div>
          </div>

          {/* Right: Topic Navigation & Syllabus Catalog Toggle */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={handlePrevTopic}
                title={t('Previous Topic', '上一道考题')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('Prev', '上一题')}</span>
              </button>
              <span className="px-2 text-xs font-mono font-semibold text-slate-500 tabular-nums border-x border-slate-100">
                {currentNum} / {topics.length}
              </span>
              <button
                type="button"
                onClick={handleNextTopic}
                title={t('Next Topic', '下一道考题')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="hidden sm:inline">{t('Next', '下一题')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              data-testid="toggle-topic-catalog-btn"
              onClick={() => setIsCatalogExpanded((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isCatalogExpanded
                  ? 'bg-[#0B3B3C] text-white border-[#0B3B3C] shadow-xs'
                  : 'bg-teal-50/90 hover:bg-teal-100/80 text-teal-950 border-teal-800/20'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {isCatalogExpanded
                  ? t('Close Topic Library', '收起主题分类目录')
                  : t(
                      `Browse All ${topics.length} Practice Topics`,
                      `切换主题 · 浏览全部 ${topics.length} 个分类话题`
                    )}
              </span>
              {isCatalogExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              )}
            </button>

            {!isRegisteredOrUnlockedAll && (
              <button
                type="button"
                data-testid="unlock-topics-email-btn"
                onClick={onOpenEmailRegister}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {t(
                    'Email Register to Unlock All 20 Topics',
                    '免费邮箱注册 · 解锁其余 18 个话题'
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ZONE 2: Structured Quick-Select Bar (Free Topics 01-02 Highlighted + Remaining Topics) */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 w-full pb-1 sm:pb-0">
          {/* Free Trial Badge Label */}
          <span className="text-[11px] font-bold text-emerald-800 whitespace-nowrap shrink-0 pr-1">
            {isRegisteredOrUnlockedAll
              ? t('All 20 Unlocked:', '全部 20 题已解锁:')
              : t('Free Trial (2 Topics):', '免费体验 (限2题):')}
          </span>

          {topics.map((topic, index) => {
            const isSelected = index === currentTopicIndex;
            const isLocked = isLockedTopic(index);
            const numLabel = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;
            const shortTitle = t(
              SHORT_TOPIC_LABELS_EN[topic.id] || topic.title,
              SHORT_TOPIC_LABELS_ZH[topic.id] || topic.title
            );

            return (
              <React.Fragment key={topic.id}>
                {/* Visual divider between the 2 Free Trial topics and the 18 Registered topics */}
                {index === FREE_TRIAL_TOPIC_COUNT && !isRegisteredOrUnlockedAll && (
                  <span
                    aria-hidden="true"
                    className="mx-1 h-4 w-px bg-slate-300 shrink-0"
                    title={t('Register with Email to unlock topics 03–20', '邮箱注册解锁 03–20 题')}
                  />
                )}
                <button
                  type="button"
                  data-testid={`quick-topic-btn-${index + 1}`}
                  onClick={() => {
                    if (isLocked) {
                      onOpenEmailRegister();
                      return;
                    }
                    onSelectTopic(index);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#0B3B3C] text-white border-[#0B3B3C] font-semibold shadow-2xs'
                      : isLocked
                      ? 'bg-white/80 text-slate-400 border-slate-200/80 hover:border-teal-700/40 hover:text-slate-700 font-medium'
                      : 'bg-white text-teal-950 border-teal-900/15 hover:bg-teal-50/80 font-medium'
                  }`}
                >
                  <span className="font-mono text-[11px] tabular-nums opacity-75">
                    {numLabel}
                  </span>
                  <span>{shortTitle}</span>
                  {isLocked && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ZONE 3: Expandable Categorized 20-Topic SEAB Syllabus Matrix */}
      {isCatalogExpanded && (
        <div
          data-testid="topic-catalog-matrix"
          className="p-4 sm:p-5 bg-white border-b border-slate-100 space-y-4"
        >
          {/* Catalog Header + Search + Access Policy Notice */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-800 shrink-0" />
                <h2 className="text-sm font-bold text-slate-900">
                  {t(
                    'Singapore Chinese Oral Practice Topic Library (5 Everyday & Social Themes · 20 Topics)',
                    '新加坡华文口语日常练习主题库（5 大常见生活与社会话题分类 · 共 20 个练习主题）'
                  )}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRegisteredOrUnlockedAll
                  ? t(
                      'Your Email account is active — all 20 Singapore everyday video topics and practice suggestions are unlocked.',
                      '您的邮箱账号已激活 — 全部 20 个新加坡生活短片话题与表达参考建议已开放。'
                    )
                  : t(
                      'Free Mode includes Topic #01 (Hawker Tray Return) and Topic #02 (Green Campus). Register with your Email for free to unlock Topics #03–#20.',
                      '免费版开放第 #01 题（小贩中心归还托盘）与第 #02 题（校园减塑与自备餐盒）。使用邮箱免费注册即可解锁第 #03 至 #20 全部练习话题。'
                    )}
              </p>
            </div>

            {/* Keyword Search Box */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'Search topic, theme, or keyword...',
                  '搜索话题名称、主题分类或关键词...'
                )}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-800 bg-slate-50/60"
              />
            </div>
          </div>

          {/* 5 Thematic Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDomain('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                selectedDomain === 'all'
                  ? 'bg-[#0B3B3C] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              {t(`All Topics (${topics.length})`, `全部主题 (${topics.length})`)}
            </button>

            <button
              type="button"
              onClick={() => setSelectedDomain('free_only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                selectedDomain === 'free_only'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {t(
                `Free Open (${FREE_TRIAL_TOPIC_COUNT})`,
                `免费开放主题 (${FREE_TRIAL_TOPIC_COUNT})`
              )}
            </button>

            {SEAB_THEMATIC_DOMAINS.map((domain) => (
              <button
                key={domain.id}
                type="button"
                onClick={() => setSelectedDomain(domain.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  selectedDomain === domain.id
                    ? 'bg-[#0B3B3C] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                {t(domain.labelEn, domain.labelZh)} ({domain.topicIds.length})
              </button>
            ))}
          </div>

          {/* 3-Column Professional Syllabus Topic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[62vh] overflow-y-auto pr-1">
            {filteredTopicsWithIndex.map(({ topic, index }) => {
              const isSelected = index === currentTopicIndex;
              const isLocked = isLockedTopic(index);
              const isFreeTopic = index < FREE_TRIAL_TOPIC_COUNT;
              const display = getTopicDisplay(topic);
              const numLabel = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;
              const domain = getDomainForTopic(topic.id);
              const questionPreview = t(
                display.primaryQuestionEnHint || topic.primaryQuestion,
                topic.primaryQuestion
              );

              return (
                <button
                  key={topic.id}
                  type="button"
                  data-testid={`catalog-topic-card-${index + 1}`}
                  onClick={() => {
                    if (isLocked) {
                      onOpenEmailRegister();
                      return;
                    }
                    onSelectTopic(index);
                    setIsCatalogExpanded(false);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-[#0B3B3C] bg-[#0B3B3C] text-white shadow-sm'
                      : isLocked
                      ? 'border-slate-200 bg-slate-50/75 hover:border-teal-700/50 hover:bg-white text-slate-700'
                      : 'border-slate-200 bg-white hover:border-teal-800 hover:shadow-2xs text-slate-900'
                  }`}
                >
                  <div className="space-y-2 w-full">
                    {/* Card Header: Topic Number, Domain & Access Status */}
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            isSelected ? 'text-emerald-300' : 'text-teal-900'
                          }`}
                        >
                          #{numLabel}
                        </span>
                        <span aria-hidden="true" className="opacity-50">
                          ·
                        </span>
                        <span
                          className={`truncate font-medium ${
                            isSelected ? 'text-slate-200' : 'text-slate-500'
                          }`}
                        >
                          {domain ? t(domain.labelEn, domain.labelZh) : display.theme}
                        </span>
                      </div>

                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md shrink-0">
                          <Lock className="w-3 h-3" />
                          <span>{t('Email Unlock', '注册解锁')}</span>
                        </span>
                      ) : isFreeTopic ? (
                        <span
                          className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t('Free Topic', '免费开放')}</span>
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : 'bg-teal-50 text-teal-800'
                          }`}
                        >
                          <Unlock className="w-3 h-3" />
                          <span>{t('Unlocked', '已解锁')}</span>
                        </span>
                      )}
                    </div>

                    {/* Topic Title */}
                    <div className="text-sm font-bold leading-snug line-clamp-1">
                      {display.title}
                    </div>

                    {/* Discussion Prompt Preview */}
                    <p
                      className={`text-xs leading-relaxed line-clamp-2 ${
                        isSelected ? 'text-slate-200' : 'text-slate-600'
                      }`}
                    >
                      {t('Discussion Prompt: ', '思考与讨论问题：')}
                      {questionPreview}
                    </p>
                  </div>

                  {/* Card Footer: Key Vocabulary Terms & Action Prompt */}
                  <div
                    className={`pt-2.5 border-t flex items-center justify-between gap-2 text-[11px] w-full ${
                      isSelected ? 'border-teal-800' : 'border-slate-100'
                    }`}
                  >
                    <div
                      className={`truncate ${
                        isSelected ? 'text-emerald-200' : 'text-slate-500'
                      }`}
                    >
                      {topic.suggestedVocabulary
                        .slice(0, 3)
                        .map((v) => v.word)
                        .join(' · ')}
                    </div>

                    <span
                      className={`font-bold whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'text-emerald-300'
                          : isLocked
                          ? 'text-teal-800'
                          : 'text-emerald-700'
                      }`}
                    >
                      {isSelected
                        ? t('Current Topic', '当前考题')
                        : isLocked
                        ? t('Register →', '免费注册解锁 →')
                        : t('Practice →', '进入练习 →')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ZONE 4: Clean 4-Step Practice Progress Indicator + Registration Unlock Prompt */}
      <div className="px-4 sm:px-5 py-2.5 bg-white flex flex-wrap items-center justify-between gap-2 text-xs min-w-0">
        <div className="flex items-center gap-2 overflow-x-auto min-w-0">
          {[
            { step: 'video', num: '01', label: t('Video Clip', '观看短片') },
            { step: 'record_initial', num: '02', label: t('Initial Response', '表达看法') },
            { step: 'followup', num: '03', label: t('Follow-up Practice', '延伸互动提问') },
            { step: 'feedback', num: '04', label: t('Practice Reference & Tips', '练习参考与建议') },
          ].map((s, idx) => {
            const stepOrder = ['video', 'record_initial', 'followup', 'feedback'];
            const currentIndex = stepOrder.indexOf(sessionStep);
            const itemIndex = stepOrder.indexOf(s.step);
            const isCompleted = itemIndex < currentIndex;
            const isCurrent = itemIndex === currentIndex;

            return (
              <React.Fragment key={s.step}>
                <div
                  className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isCurrent
                      ? 'text-teal-950 font-bold'
                      : isCompleted
                      ? 'text-emerald-700 font-medium'
                      : 'text-slate-400 font-normal'
                  }`}
                >
                  <span className="font-mono text-[11px] tabular-nums">
                    {isCompleted ? '✓' : s.num}
                  </span>
                  <span>{s.label}</span>
                </div>
                {idx < 3 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenEmailRegister}
          className="text-[11px] font-semibold text-teal-800 hover:text-teal-950 transition-colors cursor-pointer text-left sm:whitespace-nowrap inline-flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>
            {isRegisteredOrUnlockedAll
              ? t(
                  `Registered Account Active: All ${topics.length} Practice Topics Unlocked · For Self-Practice Reference Only`,
                  `注册账户已生效：全部 ${topics.length} 个口语练习主题已解锁 · 建议仅供日常练习参考`
                )
              : t(
                  `Free Version: Practice 2 Topics (#01–#02) · Register with Email to Unlock All ${topics.length} Topics →`,
                  `免费版可练习 2 个主题 (#01–#02) · 使用邮箱免费注册立即解锁全部 ${topics.length} 个练习主题 →`
                )}
          </span>
        </button>
      </div>
    </section>
  );
};
