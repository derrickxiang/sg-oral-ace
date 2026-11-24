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
  Timer,
  Compass,
} from 'lucide-react';
import { OralTopic, PracticeMode } from '../types/oral';
import { useLanguage } from '../context/LanguageContext';

export const FREE_TRIAL_TOPIC_COUNT = 2;

export type SeabDomainId =
  | 'all'
  | 'free_only'
  | 'unpracticed'
  | 'practiced'
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
      'topic-civic-queue-courtesy',
      'topic-civic-shared-bicycle',
      'topic-civic-community-fridge',
      'topic-civic-pet-responsibility',
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
      'topic-green-water-conservation',
      'topic-green-ewaste-recycling',
      'topic-green-sleep-wellness',
      'topic-green-urban-farming',
      'topic-green-sugar-health',
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
      'topic-tech-cyberbullying',
      'topic-tech-fake-news',
      'topic-tech-digital-privacy',
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
      'topic-culture-dialect-roots',
      'topic-culture-festive-greetings',
      'topic-culture-mother-tongue-use',
      'topic-culture-kopitiam-heritage',
      'topic-culture-museum-arts',
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
      'topic-youth-failure-resilience',
      'topic-youth-teamwork-cca',
      'topic-youth-filial-gratitude',
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
  'topic-civic-queue-courtesy': 'Queue & Alight First',
  'topic-civic-shared-bicycle': 'Shared Bike Parking',
  'topic-civic-community-fridge': 'Community Fridge Care',
  'topic-civic-pet-responsibility': 'HDB Pet Etiquette',
  'topic-green-water-conservation': 'Saving Every Drop',
  'topic-green-ewaste-recycling': 'E-Waste Recycling',
  'topic-green-sleep-wellness': 'Healthy Sleep Habits',
  'topic-green-urban-farming': 'HDB Rooftop Farming',
  'topic-green-sugar-health': 'Low-Sugar Choices',
  'topic-tech-cyberbullying': 'Stop Cyberbullying',
  'topic-tech-fake-news': 'Verify Before Sharing',
  'topic-tech-digital-privacy': 'Digital Footprint Safety',
  'topic-culture-dialect-roots': 'Dialect & Elders',
  'topic-culture-festive-greetings': 'Festive Traditions',
  'topic-culture-mother-tongue-use': 'Speak Mandarin Daily',
  'topic-culture-kopitiam-heritage': 'Nanyang Kopitiam',
  'topic-culture-museum-arts': 'Museums & Heritage',
  'topic-youth-failure-resilience': 'Bouncing Back',
  'topic-youth-teamwork-cca': 'CCA Teamwork',
  'topic-youth-filial-gratitude': 'Gratitude to Parents',
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
  'topic-civic-queue-courtesy': '公共场所排队与先下后上',
  'topic-civic-shared-bicycle': '共享单车规范停放',
  'topic-civic-community-fridge': '社区共享冰箱温度',
  'topic-civic-pet-responsibility': '组屋区文明养宠',
  'topic-green-water-conservation': '居家与校园节约用水',
  'topic-green-ewaste-recycling': '电子垃圾分类回收',
  'topic-green-sleep-wellness': '规律作息远离熬夜',
  'topic-green-urban-farming': '组屋社区与都市菜园',
  'topic-green-sugar-health': '减糖饮料与健康饮食',
  'topic-tech-cyberbullying': '拒绝网络霸凌',
  'topic-tech-fake-news': '辨别假消息理性转发',
  'topic-tech-digital-privacy': '保护隐私与数码足迹',
  'topic-culture-dialect-roots': '方言温情与跨代沟通',
  'topic-culture-festive-greetings': '守护传统佳节仪式感',
  'topic-culture-mother-tongue-use': '自信开口多讲华语',
  'topic-culture-kopitiam-heritage': '南洋传统咖啡店文化',
  'topic-culture-museum-arts': '走进博物馆看历史',
  'topic-youth-failure-resilience': '面对挫折与抗逆力',
  'topic-youth-teamwork-cca': '课外活动团队合作',
  'topic-youth-filial-gratitude': '体谅父母与日常感恩',
};

interface TopicSelectorDeckProps {
  topics: OralTopic[];
  currentTopicIndex: number;
  onSelectTopic: (index: number) => void;
  isLockedTopic: (index: number) => boolean;
  isRegisteredOrUnlockedAll: boolean;
  onOpenEmailRegister: () => void;
  sessionStep: 'video' | 'record_initial' | 'followup' | 'feedback';
  practiceMode: PracticeMode;
  onPracticeModeChange: (mode: PracticeMode) => void;
  practicedTopicScores?: Record<string, number>;
}

export const TopicSelectorDeck: React.FC<TopicSelectorDeckProps> = ({
  topics,
  currentTopicIndex,
  onSelectTopic,
  isLockedTopic,
  isRegisteredOrUnlockedAll,
  onOpenEmailRegister,
  sessionStep,
  practiceMode,
  onPracticeModeChange,
  practicedTopicScores = {},
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
  const practicedCount = Object.keys(practicedTopicScores).length;

  const filteredTopicsWithIndex = useMemo(() => {
    return topics
      .map((topic, index) => ({ topic, index }))
      .filter(({ topic, index }) => {
        if (selectedDomain === 'free_only' && index >= FREE_TRIAL_TOPIC_COUNT) {
          return false;
        }
        if (selectedDomain === 'practiced' && practicedTopicScores[topic.id] === undefined) {
          return false;
        }
        if (selectedDomain === 'unpracticed' && practicedTopicScores[topic.id] !== undefined) {
          return false;
        }
        if (
          selectedDomain !== 'all' &&
          selectedDomain !== 'free_only' &&
          selectedDomain !== 'practiced' &&
          selectedDomain !== 'unpracticed'
        ) {
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
  }, [topics, selectedDomain, searchQuery, getTopicDisplay, practicedTopicScores]);

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
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden min-w-0"
    >
      {/* ZONE 1: Executive Active Topic Header & Practice Mode Segmented Control */}
      <div className="p-4 sm:px-5 sm:py-4 border-b border-slate-100 bg-white">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 min-w-0">
          {/* Left: Active Topic Number, Domain & Title */}
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#0B3B3C] text-white flex flex-col items-center justify-center shrink-0">
              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-300 leading-none">
                TOPIC
              </span>
              <span className="text-base font-mono font-bold tabular-nums leading-tight mt-0.5">
                {currentNum}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span className="font-semibold text-teal-900">
                  {currentDomain
                    ? t(currentDomain.labelEn, currentDomain.labelZh)
                    : currentDisplay.theme}
                </span>
                <span aria-hidden="true">·</span>
                <span>{currentDisplay.theme}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-emerald-700">
                  {currentTopicIndex < FREE_TRIAL_TOPIC_COUNT
                    ? t(
                        `Free Open (${currentTopicIndex + 1}/${FREE_TRIAL_TOPIC_COUNT})`,
                        `免费开放 (${currentTopicIndex + 1}/${FREE_TRIAL_TOPIC_COUNT})`
                      )
                    : t('Member Unlocked', '会员已解锁')}
                </span>
                {practicedTopicScores[currentTopic.id] !== undefined && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums font-semibold text-teal-800">
                      {t(
                        `Best ${practicedTopicScores[currentTopic.id]}/50`,
                        `最高参考分 ${practicedTopicScores[currentTopic.id]}/50`
                      )}
                    </span>
                  </>
                )}
                {currentTopic.realVideoUrl && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-medium text-teal-800">
                      <Film className="w-3 h-3 text-emerald-600" />
                      {t('Silent Clip', '实景无声短片')}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-1 truncate">
                {currentDisplay.title}
              </h1>
            </div>
          </div>

          {/* Right: Guided vs Timed Exam Simulation Mode + Topic Navigation + Catalog Toggle */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Guided Coaching vs Timed Exam Simulation Segmented Switch */}
            <div
              data-testid="practice-mode-toggle"
              className="inline-flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200"
              role="group"
              aria-label={t('Practice Mode', '练习模式')}
            >
              <button
                type="button"
                data-testid="mode-guided-btn"
                onClick={() => onPracticeModeChange('guided')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  practiceMode === 'guided'
                    ? 'bg-[#0B3B3C] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span>{t('Guided Studio', '引导精练')}</span>
              </button>
              <button
                type="button"
                data-testid="mode-exam-sim-btn"
                onClick={() => onPracticeModeChange('exam_sim')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  practiceMode === 'exam_sim'
                    ? 'bg-amber-700 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Timer className="w-3.5 h-3.5 shrink-0" />
                <span>{t('Timed Exam Sim', '计时模拟考')}</span>
              </button>
            </div>

            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={handlePrevTopic}
                title={t('Previous Topic', '上一道话题')}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('Prev', '上一题')}</span>
              </button>
              <span className="px-2 text-xs font-mono font-semibold text-slate-600 tabular-nums border-x border-slate-100">
                {currentNum} / {topics.length}
              </span>
              <button
                type="button"
                onClick={handleNextTopic}
                title={t('Next Topic', '下一道话题')}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="hidden sm:inline">{t('Next', '下一题')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              data-testid="toggle-topic-catalog-btn"
              onClick={() => setIsCatalogExpanded((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
                isCatalogExpanded
                  ? 'bg-[#0B3B3C] text-white border-[#0B3B3C]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {isCatalogExpanded
                  ? t('Close Library', '收起题库目录')
                  : t(`All ${topics.length} Topics`, `浏览全部 ${topics.length} 题`)}
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {t(
                    `Unlock All ${topics.length}`,
                    `邮箱解锁 ${topics.length} 题`
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ZONE 2: Structured Quick-Select Bar */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-2.5 min-w-0">
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 w-full pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-teal-900 whitespace-nowrap shrink-0 pr-1">
            {isRegisteredOrUnlockedAll
              ? t(`All ${topics.length} Unlocked:`, `全部 ${topics.length} 题已解锁:`)
              : t(`Free Open (2/${topics.length}):`, `免费体验 (前2题):`)}
          </span>

          {topics.map((topic, index) => {
            const isSelected = index === currentTopicIndex;
            const isLocked = isLockedTopic(index);
            const bestScore = practicedTopicScores[topic.id];
            const numLabel = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;
            const shortTitle = t(
              SHORT_TOPIC_LABELS_EN[topic.id] || topic.title,
              SHORT_TOPIC_LABELS_ZH[topic.id] || topic.title
            );

            return (
              <React.Fragment key={topic.id}>
                {index === FREE_TRIAL_TOPIC_COUNT && !isRegisteredOrUnlockedAll && (
                  <span
                    aria-hidden="true"
                    className="mx-1 h-4 w-px bg-slate-300 shrink-0"
                    title={t(
                      `Register with Email to unlock topics 03–${topics.length}`,
                      `邮箱注册解锁 03–${topics.length} 题`
                    )}
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
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#0B3B3C] text-white border-[#0B3B3C] font-semibold'
                      : isLocked
                      ? 'bg-white/80 text-slate-400 border-slate-200/80 hover:border-teal-700/40 hover:text-slate-700 font-medium'
                      : bestScore !== undefined
                      ? 'bg-emerald-50/70 text-teal-950 border-emerald-200 hover:bg-emerald-100/70 font-medium'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-teal-700/40 font-medium'
                  }`}
                >
                  <span className="font-mono text-[11px] tabular-nums opacity-75">
                    {numLabel}
                  </span>
                  <span>{shortTitle}</span>
                  {bestScore !== undefined && !isSelected && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  )}
                  {isLocked && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ZONE 3: Expandable Categorized 40-Topic Syllabus Matrix */}
      {isCatalogExpanded && (
        <div
          data-testid="topic-catalog-matrix"
          className="p-4 sm:p-5 bg-white border-b border-slate-100 space-y-4"
        >
          {/* Catalog Header + Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-800 shrink-0" />
                <h2 className="text-sm font-bold text-slate-900">
                  {t(
                    `Singapore Chinese Oral Practice Library (5 Themes · ${topics.length} Topics)`,
                    `新加坡华文口语日常练习主题库（5 大生活社会分类 · 共 ${topics.length} 个话题）`
                  )}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRegisteredOrUnlockedAll
                  ? t(
                      `Your account is active — all ${topics.length} video topics are unlocked. Practiced so far: ${practicedCount}/${topics.length}.`,
                      `您的邮箱账号已生效 — 全部 ${topics.length} 个实景短片话题已开放。已完成练习：${practicedCount}/${topics.length}。`
                    )
                  : t(
                      `Free Mode includes Topic #01 & #02. Register with Email for free to unlock Topics #03–#${topics.length}.`,
                      `免费版开放第 #01 题与第 #02 题。使用邮箱免费注册即可立即解锁第 #03 至 #${topics.length} 全部练习话题。`
                    )}
              </p>
            </div>

            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'Search topic, theme, or keyword...',
                  '搜索话题名称、分类或关键词...'
                )}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-800 bg-slate-50/60"
              />
            </div>
          </div>

          {/* Domain & Progress Filter Tabs */}
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
              {t(`All (${topics.length})`, `全部 (${topics.length})`)}
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
              {t(`Free Open (${FREE_TRIAL_TOPIC_COUNT})`, `免费开放 (${FREE_TRIAL_TOPIC_COUNT})`)}
            </button>

            <button
              type="button"
              onClick={() => setSelectedDomain('unpracticed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                selectedDomain === 'unpracticed'
                  ? 'bg-[#0B3B3C] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              {t(
                `Unpracticed (${topics.length - practicedCount})`,
                `未练 (${topics.length - practicedCount})`
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedDomain('practiced')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                selectedDomain === 'practiced'
                  ? 'bg-[#0B3B3C] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              {t(`Practiced (${practicedCount})`, `已练 (${practicedCount})`)}
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

          {/* 3-Column Clean Academic Topic Catalog Cards (Zero-Pill Inline Metadata) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[62vh] overflow-y-auto pr-1">
            {filteredTopicsWithIndex.map(({ topic, index }) => {
              const isSelected = index === currentTopicIndex;
              const isLocked = isLockedTopic(index);
              const isFreeTopic = index < FREE_TRIAL_TOPIC_COUNT;
              const bestScore = practicedTopicScores[topic.id];
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
                  className={`p-4 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-[#0B3B3C] bg-[#0B3B3C] text-white'
                      : isLocked
                      ? 'border-slate-200 bg-slate-50/75 hover:border-teal-700/50 hover:bg-white text-slate-700'
                      : 'border-slate-200 bg-white hover:border-teal-800 text-slate-900'
                  }`}
                >
                  <div className="space-y-2 w-full">
                    {/* Card Header: Unboxed Inline Metadata separated by · */}
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            isSelected ? 'text-emerald-300' : 'text-teal-900'
                          }`}
                        >
                          #{numLabel}
                        </span>
                        <span aria-hidden="true" className="opacity-40">
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
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-800 shrink-0">
                          <Lock className="w-3 h-3" />
                          <span>{t('Email Unlock', '注册解锁')}</span>
                        </span>
                      ) : bestScore !== undefined ? (
                        <span
                          className={`inline-flex items-center gap-1 font-mono tabular-nums font-semibold shrink-0 ${
                            isSelected ? 'text-emerald-300' : 'text-emerald-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{bestScore}/50</span>
                        </span>
                      ) : isFreeTopic ? (
                        <span
                          className={`inline-flex items-center gap-1 font-semibold shrink-0 ${
                            isSelected ? 'text-emerald-300' : 'text-emerald-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t('Free', '免费')}</span>
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 font-semibold shrink-0 ${
                            isSelected ? 'text-emerald-300' : 'text-teal-700'
                          }`}
                        >
                          <Unlock className="w-3 h-3" />
                          <span>{t('Unlocked', '已解锁')}</span>
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-bold leading-snug line-clamp-1">
                      {display.title}
                    </div>

                    <p
                      className={`text-xs leading-relaxed line-clamp-2 ${
                        isSelected ? 'text-slate-200' : 'text-slate-600'
                      }`}
                    >
                      {questionPreview}
                    </p>
                  </div>

                  {/* Card Footer */}
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
                      className={`font-semibold whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'text-emerald-300'
                          : isLocked
                          ? 'text-teal-800'
                          : 'text-emerald-700'
                      }`}
                    >
                      {isSelected
                        ? t('Current', '当前话题')
                        : isLocked
                        ? t('Unlock →', '注册解锁 →')
                        : t('Practice →', '进入练习 →')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ZONE 4: Clean 4-Step Progress Indicator + Mode Indicator */}
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
            {practiceMode === 'exam_sim'
              ? t(
                  `Timed Exam Sim Active · Prompts hidden until feedback · Self-practice reference`,
                  `计时模拟考模式进行中 · 答题阶段隐藏句型提示 · 仅供自我练习参考`
                )
              : isRegisteredOrUnlockedAll
              ? t(
                  `All ${topics.length} Topics Unlocked · Practiced ${practicedCount}/${topics.length} · Self-Practice Reference`,
                  `全部 ${topics.length} 题已解锁 · 已练 ${practicedCount}/${topics.length} · 仅供日常练习参考`
                )
              : t(
                  `Free Open: #01–#02 · Register Email to Unlock All ${topics.length} Topics →`,
                  `免费体验 #01–#02 · 邮箱注册解锁全部 ${topics.length} 题 →`
                )}
          </span>
        </button>
      </div>
    </section>
  );
};
