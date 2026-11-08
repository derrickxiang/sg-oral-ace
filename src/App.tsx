import React, { useState, useEffect } from 'react';
import { ORAL_TOPICS } from './data/topics';
import {
  EvaluationResult,
  ComparisonResult,
  PronunciationIssue,
  ReadingAloudEvaluation,
  OridScratchpadNotes,
  FollowUpExchange,
  DifficultyLevel,
} from './types/oral';
import { Header } from './components/Header';
import { VideoPlayerSimulator } from './components/VideoPlayerSimulator';
import { VoiceRecorder } from './components/VoiceRecorder';
import { FollowUpSection } from './components/FollowUpSection';
import { TripleFeedbackCard } from './components/TripleFeedbackCard';
import { RubricScoreCard } from './components/RubricScoreCard';
import { PronunciationCard } from './components/PronunciationCard';
import { CorpusCard } from './components/CorpusCard';
import { RetestCompareModal } from './components/RetestCompareModal';
import { WeeklyTracker } from './components/WeeklyTracker';
import { MobileExporterView } from './components/MobileExporterView';
import { AiArchitectureModal } from './components/AiArchitectureModal';
import { ReadingAloudAndPrepDeck } from './components/ReadingAloudAndPrepDeck';
import { PronunciationPolicyQuizCard } from './components/PronunciationPolicyQuizCard';
import { ReportCardExportModal } from './components/ReportCardExportModal';
import { ParentConsentBannerModal } from './components/ParentConsentBannerModal';
import { getDifficultyScaffolding } from './utils/seabRubric';
import {
  TrialEditionModal,
  EmailRegisterPayload,
} from './components/TrialEditionModal';
import {
  TopicSelectorDeck,
  FREE_TRIAL_TOPIC_COUNT,
} from './components/TopicSelectorDeck';
import { useLanguage } from './context/LanguageContext';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { playNaturalSpeech } from './utils/naturalSpeech';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
  CloudUserProfile,
  SubscriptionPlanTier,
  ensureUserProfileInFirestore,
  updateSubscriptionTierInFirestore,
  savePracticeRecordToFirestore,
} from './firebase';
import {
  RotateCcw,
  ArrowRight,
  ChevronRight,
  Lock,
  Zap,
  LayoutGrid,
  CreditCard,
  Volume2,
  Landmark,
  Users,
  BookOpen,
  ShieldCheck,
  FileText,
} from 'lucide-react';

const SINGAPORE_LOCAL_CULTURE_LEXICON = [
  {
    categoryEn: '1. Singapore Public Policies & National Visions',
    categoryZh: '一、新加坡国家政策与社会发展愿景（口试论述高分术语）',
    icon: 'policy',
    items: [
      {
        term: '居者有其屋与预购组屋 (BTO)',
        pinyin: 'jū zhě yǒu qí wū / yù gòu zǔ wū',
        contextEn: 'Home Ownership Scheme & Build-To-Order (HDB)',
        usage: '建屋发展局（HDB）推行“居者有其屋”计划与组屋种族比例政策（EIP），让不同族群在组屋社区里比邻而居、守望相助。',
      },
      {
        term: '乐龄健康生活计划 (Age Well SG)',
        pinyin: 'lè líng jiàn kāng shēng huó jì huà',
        contextEn: 'Age Well SG & Active Ageing Centres (AAC)',
        usage: '面对超老龄化社会，政府通过“乐龄健康生活计划”与全岛活跃乐龄中心，帮助年长者在熟悉的社区里原地养老、老有所乐。',
      },
      {
        term: '2030年新加坡绿色发展蓝图',
        pinyin: 'xīn jiā pō lǜ sè fā zhǎn lán tú',
        contextEn: 'Singapore Green Plan 2030 & Zero Waste Masterplan',
        usage: '为了延长实马高垃圾埋置场的使用寿命，我国积极推进《2030年绿色发展蓝图》，倡导从源头减塑与自备环保餐具。',
      },
      {
        term: '智慧国与数码包容 (Smart Nation)',
        pinyin: 'zhì huì guó yǔ shù mǎ bāo róng',
        contextEn: 'Smart Nation & SG Digital Office Ambassadors',
        usage: '在迈向“智慧国”的过程中，数码大使深入巴刹手把手教导乐龄人士使用 PayNow 与防诈软件，体现了科技背后的人文关怀。',
      },
      {
        term: '技能创前程与终身学习 (SkillsFuture)',
        pinyin: 'jì néng chuàng qián chéng',
        contextEn: 'SkillsFuture & Lifelong Learning Ethos',
        usage: '在人工智能日新月异的时代，唯有秉持“活到老，学到老”的精神，善用“技能创前程”不断自我提升，方能与时俱进。',
      },
      {
        term: '德育在于行动与同侪互助 (VIA & Peer Support)',
        pinyin: 'dé yù zài yú xíng dòng / tóng chái hù zhù',
        contextEn: 'Values in Action (VIA) & Peer Support Structures',
        usage: '学校通过“德育在于行动”（VIA）培养学生的公民意识，但我们参与社区义工应当发自真心，而非仅仅为了凑满服务时数。',
      },
    ],
  },
  {
    categoryEn: '2. Singapore Multicultural Heritage & Kampung Spirit',
    categoryZh: '二、新加坡本土文化、非遗传承与甘榜精神（接地气生活实例）',
    icon: 'culture',
    items: [
      {
        term: '小贩文化与小贩培育计划',
        pinyin: 'xiǎo fàn wén huà / xiǎo fàn péi yù jì huà',
        contextEn: 'UNESCO Hawker Culture & NEA Hawker Development Programme',
        usage: '新加坡小贩文化已列入联合国非物质文化遗产。为解决老师傅退休后青黄不接的困境，国家环境局推出“小贩培育计划”扶持青年小贩接班人。',
      },
      {
        term: '种族和谐日与求同存异',
        pinyin: 'zhǒng zú hé xié rì / qiú tóng cún yì',
        contextEn: '21 July Racial Harmony Day & Multicultural Empathy',
        usage: '每年7月21日的种族和谐日提醒我们居安思危；真正的种族和谐不能流于穿民族服装拍照的形式，而在于日常聚餐时主动照顾清真（Halal）饮食习惯。',
      },
      {
        term: '现代甘榜精神 (Kampung Spirit)',
        pinyin: 'xiàn dài gān bǎng jīng shén',
        contextEn: 'Good Neighbours Movement & Void Deck Cohesion',
        usage: '远亲不如近邻。即便住在高密度的现代政府组屋，一句电梯里的早安问候、一次佳节糕点分享，都能重燃温暖的“甘榜精神”。',
      },
      {
        term: '母语双周与华族文化中心',
        pinyin: 'mǔ yǔ shuāng zhōu / huá zú wén huà zhōng xīn',
        contextEn: 'Mother Tongue Fortnight & Singapore Chinese Cultural Centre (SCCC)',
        usage: '结合校园“母语双周”的挥春戏曲体验，以及华族文化中心的新媒体展览，能以青少年喜闻乐见的方式让传统文化薪火相传。',
      },
      {
        term: '民众俱乐部与居民联系网 (CC & RN)',
        pinyin: 'mín zhòng jù lè bù / jū mín lián xì wǎng',
        contextEn: 'Community Clubs (PA) & Residents’ Networks',
        usage: '民众俱乐部（CC）与居委会经常举办跨世代园艺与防诈骗讲座，搭建起连接年轻学子与独居长者的温情桥梁。',
      },
      {
        term: '优雅社会与归还托盘运动',
        pinyin: 'yōu yǎ shè huì / guī huán tuō pán',
        contextEn: 'Gracious Society & Hawker Tray Return Initiative',
        usage: '在熟食中心用餐后随手归还托盘、擦净桌面，虽是举手之劳，却能减轻年长清洁工的负担，彰显新加坡作为优雅社会的文明素养。',
      },
    ],
  },
];

export default function App() {
  const { t, getTopicDisplay } = useLanguage();
  const isOnline = useOnlineStatus();
  const [activeTab, setActiveTab] = useState<'practice' | 'progress' | 'corpus' | 'mobile_export'>('practice');
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(0);
  const currentTopic = ORAL_TOPICS[currentTopicIndex] || ORAL_TOPICS[0];
  const currentTopicDisplay = getTopicDisplay(currentTopic);

  // Practice session state
  const [sessionStep, setSessionStep] = useState<'video' | 'record_initial' | 'followup' | 'feedback'>('video');
  const [initialTranscript, setInitialTranscript] = useState<string>('');
  const [_initialAudioUrl, setInitialAudioUrl] = useState<string | null>(null);
  const [initialDuration, setInitialDuration] = useState<number>(0);

  // Follow-up state
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState<boolean>(false);
  const [followUpQuestion, setFollowUpQuestion] = useState<string>('');
  const [followUpRationale, setFollowUpRationale] = useState<string>('');
  const [examinerToneAdvice, setExaminerToneAdvice] = useState<string>('');
  const [followUpTranscript, setFollowUpTranscript] = useState<string>('');
  const [followUpLatencyMs, setFollowUpLatencyMs] = useState<number | null>(null);

  // Evaluation & Feedback state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationResult | null>(null);

  // Enhancements 1, 2, 3 & 6 state
  const [readingAloudEval, setReadingAloudEval] = useState<ReadingAloudEvaluation | null>(null);
  const [oridNotes, setOridNotes] = useState<OridScratchpadNotes>({
    observation: '',
    reflection: '',
    interpretation: '',
    decision: '',
  });
  const [followUpExchanges, setFollowUpExchanges] = useState<FollowUpExchange[]>([]);
  const [showReportCardExportModal, setShowReportCardExportModal] = useState<boolean>(false);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('basic');

  // Modals state
  const [showRetestModal, setShowRetestModal] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showTrialModal, setShowTrialModal] = useState<boolean>(false);
  const [trialModalSection, setTrialModalSection] = useState<'overview' | 'pricing' | 'mobile_install'>('overview');

  // Firebase Auth & Cloud/Hybrid Profile State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<CloudUserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('oralace_student_account_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  // Trial Edition & Speed Mode state
  const [isTrialMode, setIsTrialMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('oralace_trial_mode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [trialSessionsRemaining, setTrialSessionsRemaining] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('oralace_trial_quota');
      return saved !== null ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  });

  const [fastMode, setFastMode] = useState<boolean>(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await ensureUserProfileInFirestore(user);
          setUserProfile(profile);
          localStorage.setItem('oralace_student_account_v1', JSON.stringify(profile));
          setIsTrialMode(profile.planTier === 'trial');
          setTrialSessionsRemaining(profile.trialSessionsRemaining);
        } catch (err) {
          console.warn('Cloud profile sync warning:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    setIsAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.warn('Google sign-in popup closed or failed:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Email-Only Registration & Login: Registering unlocks all 20 topics
  const handleEmailAuth = async (
    payload: EmailRegisterPayload
  ): Promise<{ ok: boolean; message?: string }> => {
    setIsAuthLoading(true);
    try {
      const registeredProfile: CloudUserProfile = {
        uid: `email_${payload.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        displayName: payload.displayName || payload.email.split('@')[0],
        email: payload.email,
        planTier: 'monthly_pro',
        trialSessionsRemaining: 99,
        weeklyStreak: 3,
        totalSessionsCompleted: history.length,
        activePlanName: 'Email Registered Account (All 20 Topics)',
        authMethod: 'email',
      };
      setUserProfile(registeredProfile);
      setIsTrialMode(false);
      setTrialSessionsRemaining(99);
      localStorage.setItem('oralace_student_account_v1', JSON.stringify(registeredProfile));
      return {
        ok: true,
        message: t(
          `Registered ${registeredProfile.displayName} (${payload.email})! All ${ORAL_TOPICS.length} Singapore O-Level topics are now unlocked.`,
          `已成功注册并登录邮箱账户：${registeredProfile.displayName} (${payload.email})！全部 ${ORAL_TOPICS.length} 套新加坡 O 水准口试考题已为您解锁。`
        ),
      };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setUserProfile(null);
    setIsTrialMode(true);
    localStorage.removeItem('oralace_student_account_v1');
    if (currentTopicIndex >= FREE_TRIAL_TOPIC_COUNT) {
      setCurrentTopicIndex(0);
    }
  };

  const handleSelectSubscriptionPlan = async (tier: SubscriptionPlanTier, planLabel: string) => {
    const newIsTrial = tier === 'trial';
    const newQuota = newIsTrial ? 3 : 99;
    setIsTrialMode(newIsTrial);
    setTrialSessionsRemaining(newQuota);

    setUserProfile((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        planTier: tier,
        trialSessionsRemaining: newQuota,
        activePlanName: planLabel,
      };
      localStorage.setItem('oralace_student_account_v1', JSON.stringify(updated));
      return updated;
    });

    if (currentUser) {
      try {
        await updateSubscriptionTierInFirestore(currentUser.uid, tier, planLabel, newQuota);
      } catch (err) {
        console.warn('Subscription update in Firestore warning:', err);
      }
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('oralace_trial_mode', JSON.stringify(isTrialMode));
    } catch {
      // ignore
    }
  }, [isTrialMode]);

  useEffect(() => {
    try {
      localStorage.setItem('oralace_trial_quota', String(trialSessionsRemaining));
    } catch {
      // ignore
    }
  }, [trialSessionsRemaining]);

  // Persistent storage (weekly progress & notebook)
  const [history, setHistory] = useState<EvaluationResult[]>(() => {
    try {
      const saved = localStorage.getItem('oralpass_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedPronunciations, setSavedPronunciations] = useState<PronunciationIssue[]>(() => {
    try {
      const saved = localStorage.getItem('oralpass_pronunciations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedCorpusWords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('oralpass_corpus');
      return saved
        ? JSON.parse(saved)
        : ['举手之劳', '潜移默化', '双管齐下', '老吾老以及人之老', '居安思危', '求同存异', '行行出状元'];
    } catch {
      return ['举手之劳', '潜移默化', '双管齐下', '老吾老以及人之老', '居安思危', '求同存异', '行行出状元'];
    }
  });

  const [weeklyStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('oralpass_streak');
      return saved ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('oralpass_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('oralpass_pronunciations', JSON.stringify(savedPronunciations));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [savedPronunciations]);

  const defaultSampleInitialAnswer =
    currentTopic.id === 'topic-hawker-tray'
      ? '看了这个录像短片，我认为大家在小贩中心吃完饭后应该主动把托盘放回去。因为保持桌子干净是好事，而且那些清洁阿公阿婆年纪都很大了，推着重车很辛苦。如果不归还托盘，下一位食客就没有位子坐。所以政府应该提高罚款，警察也要抓不遵守规则的人，学校老师也要跟学生说要做好事。'
      : '看了这个短片，我觉得这个话题跟我们的日常生活息息相关。不可否认的是，只有个人自觉、家庭言传身教与学校公民教育双管齐下，才能真正形成良好的社会风气。';

  const defaultSampleFollowUpAnswer =
    '回答考官：我认为在现实生活中，提高罚款确实能起到立竿见影的威慑效果，但单靠惩罚无法形成发自内心的自觉习惯。以我们学校为例，食堂并没有设置罚款，而是通过“环保之星”评选让学生体会收拾餐盘的自豪感。因此，我认为应德法兼施，对故意破坏者依法处罚，对广大民众与青少年则以荣誉激励和品德熏陶为主。';

  // Background pre-warm for sample answer when entering Step 2 so sample testing is <30ms
  useEffect(() => {
    if (sessionStep === 'record_initial') {
      fetch('/api/oral/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: currentTopic.id,
          topicTitle: currentTopic.title,
          primaryQuestion: currentTopic.primaryQuestion,
          studentTranscript: defaultSampleInitialAnswer,
          fastMode: true,
        }),
      }).catch(() => {});
    }
  }, [sessionStep, currentTopic.id, currentTopic.title, currentTopic.primaryQuestion, defaultSampleInitialAnswer]);

  // Step 1 -> Step 2: After watching video, proceed to voice answer
  const handleProceedToRecord = () => {
    setSessionStep('record_initial');
  };

  // Step 2 -> Step 3: Submit initial answer, generate follow-up question
  const handleInitialAnswerSubmit = async (
    transcript: string,
    audioUrl: string | null,
    duration: number,
    overrideFastMode?: boolean
  ) => {
    setInitialTranscript(transcript);
    setInitialAudioUrl(audioUrl);
    setInitialDuration(duration);
    setIsGeneratingFollowUp(true);
    const reqStart = Date.now();

    try {
      const res = await fetch('/api/oral/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: currentTopic.id,
          topicTitle: currentTopic.title,
          primaryQuestion: currentTopic.primaryQuestion,
          studentTranscript: transcript,
          fastMode: overrideFastMode ?? fastMode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFollowUpQuestion(data.followUpQuestion);
        setFollowUpRationale(data.rationaleForQuestion);
        setExaminerToneAdvice(data.examinerToneAdvice);
        setFollowUpLatencyMs(data.latencyMs ?? Date.now() - reqStart);
      } else {
        throw new Error('Followup request failed');
      }
    } catch (err) {
      console.warn('Using local follow-up fallback:', err);
      setFollowUpQuestion(
        '你刚才提到要提高罚款并加强教育。但如果是年长者或低收入家庭，罚款真的能从根本上解决问题吗？你认为学校和家庭还可以扮演什么更温和有效的角色？'
      );
      setFollowUpRationale('考生侧重惩罚措施，追问旨在引导其从教育熏陶与同理心关怀的角度深入思考。');
      setExaminerToneAdvice('答题时先用一句话承接考官问题，并结合自身经历佐证。');
      setFollowUpLatencyMs(Date.now() - reqStart);
    } finally {
      setIsGeneratingFollowUp(false);
      setSessionStep('followup');
    }
  };

  // Step 3 -> Step 4: Submit follow-up response and generate complete evaluation
  const handleFollowUpAnswerSubmit = async (
    fTranscript: string,
    _audioUrl: string | null,
    _duration: number,
    exchanges?: FollowUpExchange[]
  ) => {
    setFollowUpTranscript(fTranscript);
    if (exchanges) {
      setFollowUpExchanges(exchanges);
    }
    await triggerFullEvaluation(initialTranscript, fTranscript, fastMode, undefined, exchanges);
  };

  const handleSkipFollowUp = async () => {
    setFollowUpTranscript('');
    await triggerFullEvaluation(initialTranscript, '', fastMode);
  };

  const openTrialModalAt = (section: 'overview' | 'pricing' | 'mobile_install' = 'overview') => {
    setTrialModalSection(section);
    setShowTrialModal(true);
  };

  const triggerFullEvaluation = async (
    initText: string,
    followText: string,
    useFastMode = false,
    customFollowUpQuestion?: string,
    exchanges?: FollowUpExchange[]
  ) => {
    if (isTrialMode && trialSessionsRemaining <= 0) {
      openTrialModalAt('pricing');
      return;
    }

    setIsEvaluating(true);
    try {
      const res = await fetch('/api/oral/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: currentTopic.id,
          topicTitle: currentTopic.title,
          primaryQuestion: currentTopic.primaryQuestion,
          initialTranscript: initText,
          followUpQuestion: customFollowUpQuestion ?? followUpQuestion,
          followUpTranscript: followText,
          audioDurationSeconds: initialDuration || 45,
          fastMode: useFastMode,
        }),
      });

      let evaluationData: EvaluationResult;
      if (res.ok) {
        evaluationData = await res.json();
      } else {
        throw new Error('Evaluation request failed');
      }

      // Enrich evaluationData with Part 1 Reading Aloud score, ORID notes, and Multi-Turn Exchanges
      evaluationData = {
        ...evaluationData,
        readingAloudScore: readingAloudEval?.score ?? evaluationData.rubric.pronunciation.score,
        readingAloudEvaluation: readingAloudEval ?? undefined,
        oridNotes,
        followUpExchanges: exchanges ?? followUpExchanges,
      };

      const nextRemaining = isTrialMode ? Math.max(0, trialSessionsRemaining - 1) : trialSessionsRemaining;
      setCurrentEvaluation(evaluationData);
      setHistory((prev) => [evaluationData, ...prev]);
      if (isTrialMode && trialSessionsRemaining > 0) {
        setTrialSessionsRemaining(nextRemaining);
      }
      setSessionStep('feedback');

      // Persist to Firestore if authenticated
      if (currentUser) {
        savePracticeRecordToFirestore(
          currentUser.uid,
          evaluationData.id,
          {
            topicId: evaluationData.topicId,
            topicTitle: evaluationData.topicTitle,
            totalScore: evaluationData.totalScore,
            band: evaluationData.band,
            initialTranscript: initText,
            followUpQuestion: customFollowUpQuestion ?? followUpQuestion,
            followUpTranscript: followText,
          },
          {
            trialSessionsRemaining: nextRemaining,
            weeklyStreak,
            totalSessionsCompleted: history.length + 1,
          }
        ).catch((err) => console.warn('Cloud practice save warning:', err));
      }
    } catch (err) {
      console.warn('Evaluation fallback:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // 1-Click Instant Trial Walkthrough: Jump straight to Step 03 (Examiner Follow-up) in <50ms
  const handleRunInstantFollowUpDemo = async () => {
    setActiveTab('practice');
    await handleInitialAnswerSubmit(defaultSampleInitialAnswer, null, 42, true);
  };

  // 1-Click Instant Trial Walkthrough: Jump straight to Step 04 (3-Part Diagnostic Report) in <80ms
  const handleRunInstantReportDemo = async () => {
    setActiveTab('practice');
    const demoFollowUpQ =
      '你刚才提到可以通过提高罚款和严格执法来解决问题。但如果在现实生活中，有些年长者或低收入群体确实无力承担，你认为单靠重罚是否能从根本上改变人们的习惯？学校和社区还可以采取哪些更温和有效的引导方式？';
    setInitialTranscript(defaultSampleInitialAnswer);
    setFollowUpQuestion(demoFollowUpQ);
    setFollowUpTranscript(defaultSampleFollowUpAnswer);
    await triggerFullEvaluation(
      defaultSampleInitialAnswer,
      defaultSampleFollowUpAnswer,
      true,
      demoFollowUpQ
    );
  };

  // Add issue to pronunciation notebook
  const handleSavePronunciation = (issue: PronunciationIssue) => {
    if (!savedPronunciations.some((p) => p.word === issue.word)) {
      setSavedPronunciations((prev) => [issue, ...prev]);
    }
  };

  const handleRemovePronunciation = (word: string) => {
    setSavedPronunciations((prev) => prev.filter((p) => p.word !== word));
  };

  // Save comparison from Retest Modal
  const handleSaveRetestComparison = (comparison: ComparisonResult) => {
    setHistory((prev) => [comparison.round2, ...prev]);
  };

  const handleRestartTopic = () => {
    setSessionStep('video');
    setInitialTranscript('');
    setInitialAudioUrl(null);
    setFollowUpQuestion('');
    setFollowUpTranscript('');
    setCurrentEvaluation(null);
  };

  const similarTopic = ORAL_TOPICS.find((t) => t.id === currentTopic.similarTopicId);

  const isRegisteredOrUnlockedAll = Boolean(currentUser || userProfile) || !isTrialMode;
  const isLockedTopic = (index: number) =>
    !isRegisteredOrUnlockedAll && index >= FREE_TRIAL_TOPIC_COUNT;

  const currentDifficultyScaffolding = getDifficultyScaffolding(
    currentTopicDisplay.title,
    difficultyLevel
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F6F9F8] text-slate-900 flex flex-col font-sans">
      {/* Clean 3-Zone Top Bar (Singapore Academic Deep Teal) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        weeklyStreak={weeklyStreak}
        totalPractices={history.length}
        onOpenAiInfo={() => setShowAiModal(true)}
        isTrialMode={!isRegisteredOrUnlockedAll}
        trialSessionsRemaining={trialSessionsRemaining}
        userDisplayName={userProfile?.displayName || currentUser?.displayName}
        onOpenTrialModal={openTrialModalAt}
      />

      {/* SG PDPA & 13-17 Parent/Guardian Consent Banner & Modal (derrickxiang/oralace) */}
      <ParentConsentBannerModal />

      {/* Offline Connectivity Toast (PWA Compliance) */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          <span>{t('Offline Mode — Using cached Oral Practice Engine & Corpus.', '离线模式 — 已启用本地缓存练习题库与语料引擎。')}</span>
        </div>
      )}

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full min-w-0 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: Oral Practice Studio */}
        {activeTab === 'practice' && (
          <div className="space-y-5 min-w-0">
            {/* Professional SEAB O-Level Oral Topic Curriculum Selector Deck */}
            <TopicSelectorDeck
              topics={ORAL_TOPICS}
              currentTopicIndex={currentTopicIndex}
              onSelectTopic={(index) => {
                if (isLockedTopic(index)) {
                  openTrialModalAt('overview');
                  return;
                }
                if (index !== currentTopicIndex) {
                  setCurrentTopicIndex(index);
                  handleRestartTopic();
                }
              }}
              isLockedTopic={isLockedTopic}
              isRegisteredOrUnlockedAll={isRegisteredOrUnlockedAll}
              onOpenEmailRegister={() => openTrialModalAt('overview')}
              sessionStep={sessionStep}
            />

            {/* Step 1: Balanced Two-Zone Studio Split */}
            {sessionStep === 'video' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Zone: 16:9 Cinema Documentary Player + Google Flow Studio */}
                <div className="lg:col-span-8 flex flex-col">
                  <VideoPlayerSimulator
                    topic={currentTopic}
                    onVideoFinished={handleProceedToRecord}
                  />
                </div>

                {/* Right Zone: Examiner Prompt & Observation Dock */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-teal-900/15 p-6 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-5">
                    {/* Metadata Kicker + Difficulty Level Selector (基础 Basic / 提高 Advanced) */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-teal-800">{t('Oral Practice Reference', '口语表达练习')}</span>
                          <span aria-hidden="true">·</span>
                          <span>{currentTopicDisplay.theme}</span>
                        </div>

                        {/* Difficulty Level Toggle ported from derrickxiang/oralace app.html */}
                        <div
                          data-testid="difficulty-level-toggle"
                          className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200"
                        >
                          <span className="text-[10px] font-semibold text-slate-500 px-1.5">
                            {t('Level:', '模式：')}
                          </span>
                          <button
                            type="button"
                            data-testid="difficulty-btn-basic"
                            onClick={() => setDifficultyLevel('basic')}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                              difficultyLevel === 'basic'
                                ? 'bg-[#0B3B3C] text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {t('Basic', '基础')}
                          </button>
                          <button
                            type="button"
                            data-testid="difficulty-btn-advanced"
                            onClick={() => setDifficultyLevel('advanced')}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                              difficultyLevel === 'advanced'
                                ? 'bg-[#0B3B3C] text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {t('Advanced', '进阶')}
                          </button>
                        </div>
                      </div>

                      <div className="text-xs font-bold text-emerald-700 mb-1.5">
                        {t('Primary Discussion Question', '核心思考与讨论问题')}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        “{currentTopic.primaryQuestion}”
                      </h3>

                      {currentTopicDisplay.primaryQuestionEnHint && (
                        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                          {currentTopicDisplay.primaryQuestionEnHint}
                        </p>
                      )}

                      {/* Difficulty Scaffolding Callout */}
                      <div
                        data-testid="difficulty-scaffolding-banner"
                        className="mt-3 p-2.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-[11px] text-teal-950 space-y-1"
                      >
                        <div className="font-bold text-teal-900">
                          {t(currentDifficultyScaffolding.badgeEn, currentDifficultyScaffolding.badgeZh)}
                        </div>
                        <p className="text-slate-600 leading-snug">
                          {t(
                            currentDifficultyScaffolding.descriptionEn,
                            currentDifficultyScaffolding.descriptionZh
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Hairline Divider */}
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-xs font-bold text-teal-950 mb-3">
                        {t('Video Observation & Speaking Tips', '短片观察与表达小贴士')}
                      </h4>
                      <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                        <li className="flex items-start gap-2">
                          <span className="font-mono text-teal-700 font-semibold shrink-0">01</span>
                          <span>
                            {t(
                              'Contrast positive vs negative character behaviours in the clip',
                              '关注短片中正反两组人物行为的对比'
                            )}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-mono text-teal-700 font-semibold shrink-0">02</span>
                          <span>
                            {t(
                              'Note everyday Singapore community cues & local surroundings',
                              '留心新加坡社区环境与日常生活细节（如小贩中心、组屋邻里、校园）'
                            )}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-mono text-teal-700 font-semibold shrink-0">03</span>
                          <span>
                            {t(
                              'Observe facial expressions of seniors or multiracial neighbours',
                              '体察年长者、小贩师傅或不同种族邻居的神态与处境'
                            )}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-mono text-teal-700 font-semibold shrink-0">04</span>
                          <span>
                            {t(
                              'Structure response via ORID: Observation → Feeling → Causes → Action',
                              '可参考 ORID 思路组织：见闻 → 感受 → 成因 → 建议'
                            )}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Primary Action CTA + Instant Trial Walkthrough CTA */}
                  <div className="pt-5 mt-5 border-t border-slate-100 space-y-2.5">
                    <button
                      type="button"
                      onClick={handleProceedToRecord}
                      className="w-full flex items-center justify-center gap-2 bg-[#0B3B3C] hover:bg-teal-900 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      <span>
                        {t('Start Recording Response', '我已看完短片，开始录音作答')}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleRunInstantReportDemo}
                      className="w-full flex items-center justify-center gap-1.5 bg-teal-50 hover:bg-teal-100/80 text-teal-950 border border-teal-200/80 px-4 py-2 rounded-xl font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {t(
                          '1-Click Instant Trial Walkthrough (<0.1s)',
                          '一键秒级体验试用版完整流程 (<0.1秒)'
                        )}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Full-Width Bottom Deck: Enhancement 1 (Reading Aloud 10m) & Enhancement 2 (10m Prep Timer + ORID Scratchpad) */}
                <div className="lg:col-span-12">
                  <ReadingAloudAndPrepDeck
                    topicId={currentTopic.id}
                    topicTitle={currentTopicDisplay.title}
                    readingEvaluation={readingAloudEval}
                    onReadingEvaluated={(evalRes) => setReadingAloudEval(evalRes)}
                    oridNotes={oridNotes}
                    onOridNotesChange={setOridNotes}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Record Initial Answer */}
            {sessionStep === 'record_initial' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-4">
                  {/* Show ORID Scratchpad Cue Card above VoiceRecorder if notes exist */}
                  {(oridNotes.observation.trim() ||
                    oridNotes.reflection.trim() ||
                    oridNotes.interpretation.trim() ||
                    oridNotes.decision.trim()) && (
                    <div
                      data-testid="step2-orid-cue-card"
                      className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-2"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-amber-950">
                        <FileText className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          {t(
                            'Your 10-Minute Prep ORID Speaking Cues:',
                            '您在备考阶段速记的 ORID 口头报告提纲：'
                          )}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                        {oridNotes.observation && (
                          <div>
                            <strong className="text-slate-900">O (见闻):</strong> {oridNotes.observation}
                          </div>
                        )}
                        {oridNotes.reflection && (
                          <div>
                            <strong className="text-slate-900">R (感受):</strong> {oridNotes.reflection}
                          </div>
                        )}
                        {oridNotes.interpretation && (
                          <div>
                            <strong className="text-slate-900">I (成因):</strong> {oridNotes.interpretation}
                          </div>
                        )}
                        {oridNotes.decision && (
                          <div>
                            <strong className="text-slate-900">D (建议):</strong> {oridNotes.decision}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Difficulty Sentence Starters Card on Step 2 (ported from derrickxiang/oralace app.html) */}
                  <div
                    data-testid="step2-difficulty-frames-card"
                    className="bg-white border border-teal-900/15 rounded-2xl p-4 text-xs space-y-2 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-teal-950">
                        {t(currentDifficultyScaffolding.badgeEn, currentDifficultyScaffolding.badgeZh)}
                      </span>
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setDifficultyLevel('basic')}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                            difficultyLevel === 'basic'
                              ? 'bg-[#0B3B3C] text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {t('Basic', '基础')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDifficultyLevel('advanced')}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                            difficultyLevel === 'advanced'
                              ? 'bg-[#0B3B3C] text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {t('Advanced', '提高')}
                        </button>
                      </div>
                    </div>
                    <ul className="space-y-1 text-slate-700">
                      {currentDifficultyScaffolding.sentenceFrames.map((frame, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {frame}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <VoiceRecorder
                    onTranscriptReady={(tText, aUrl, dur) => handleInitialAnswerSubmit(tText, aUrl, dur)}
                    isLoading={isGeneratingFollowUp}
                    sampleAnswer={defaultSampleInitialAnswer}
                    placeholderText={t(
                      'Click the microphone to speak in Mandarin (describe the video phenomenon, your views, and real-life Singapore examples)...',
                      '请点击麦克风口述您的见解，清晰阐述短片现象、您的看法及新加坡生活实例……'
                    )}
                    submitButtonText={t(
                      'Submit Response & Proceed to AI Follow-up',
                      '提交回答，进入考官智能追问环节'
                    )}
                  />
                </div>

                <div className="lg:col-span-4 bg-white rounded-2xl border border-teal-900/15 p-6 space-y-5">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>{currentTopicDisplay.theme}</span>
                      <button
                        type="button"
                        onClick={() => setSessionStep('video')}
                        className="text-teal-800 hover:text-teal-950 font-semibold underline cursor-pointer"
                      >
                        {t('Rewatch Video', '重看短片')}
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      “{currentTopic.primaryQuestion}”
                    </h3>
                    {currentTopicDisplay.primaryQuestionEnHint && (
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {currentTopicDisplay.primaryQuestionEnHint}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed mt-3 pt-3 border-t border-slate-100">
                      {currentTopicDisplay.backgroundContext}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-teal-950 mb-3">
                      {t('Recommended Vocabulary & Idioms', '本题高分语料参考')}
                    </h4>
                    <div className="space-y-2.5">
                      {currentTopic.suggestedVocabulary.map((vocab, i) => (
                        <div key={i} className="pb-2.5 border-b border-slate-100 last:border-b-0 last:pb-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <strong className="text-xs font-semibold text-teal-950">{vocab.word}</strong>
                            <span className="text-[11px] font-mono text-slate-500">{vocab.pinyin}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{vocab.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Follow-Up Questioning */}
            {sessionStep === 'followup' && (
              <div className="space-y-6">
                <FollowUpSection
                  topicId={currentTopic.id}
                  followUpQuestion={followUpQuestion}
                  rationaleForQuestion={followUpRationale}
                  examinerToneAdvice={examinerToneAdvice}
                  latencyMs={followUpLatencyMs}
                  oridNotes={oridNotes}
                  onFollowUpAnswerSubmit={handleFollowUpAnswerSubmit}
                  onSkipFollowUp={handleSkipFollowUp}
                  isLoading={isEvaluating}
                />
              </div>
            )}

            {/* Step 4: Practice Feedback & Reference Suggestions */}
            {sessionStep === 'feedback' && currentEvaluation && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-teal-900/15 p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-teal-800">
                        {t('Oral Practice Reference & Suggestions', '口语练习参考反馈与建议（非官方评分）')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{currentTopicDisplay.theme}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {currentTopicDisplay.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      data-testid="btn-open-report-card"
                      onClick={() => setShowReportCardExportModal(true)}
                      className="inline-flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-900/15 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <FileText className="w-4 h-4 text-teal-800 shrink-0" />
                      <span>
                        {t(
                          'Export Practice Summary',
                          '导出练习参考小结'
                        )}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRetestModal(true)}
                      className="flex items-center gap-2 bg-[#0B3B3C] hover:bg-teal-900 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>
                        {t(
                          'Retest & Compare Progress',
                          '同类题再练并对比前后变化'
                        )}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRestartTopic}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t('Practice Again', '重新练习')}
                    </button>
                  </div>
                </div>

                <RubricScoreCard evaluation={currentEvaluation} />
                <TripleFeedbackCard tripleFeedback={currentEvaluation.tripleFeedback} />
                <PronunciationCard
                  issues={currentEvaluation.pronunciationIssues}
                  onSaveToNotebook={handleSavePronunciation}
                  savedWords={savedPronunciations.map((p) => p.word)}
                  transcript={currentEvaluation.initialTranscript}
                  durationSeconds={currentEvaluation.audioDurationSeconds}
                  acousticTelemetry={currentEvaluation.acousticTelemetry}
                />
                <CorpusCard corpusSuggestions={currentEvaluation.corpusSuggestions} />

                <div className="bg-[#072B2E] text-white rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold">
                      {t(
                        'Ready for Round 2? Apply the Examiner Feedback Now',
                        '趁热打铁：用同类题或同话题再练一次'
                      )}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                      {t(
                        'Incorporate the suggested arguments and pronunciation fixes in a second attempt to measure your score delta.',
                        '结合考官指出的逻辑盲区与发音纠偏立刻进行二次作答，直观检验提分幅度。'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRetestModal(true)}
                    className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {t('Start Round 2 Comparison', '开启二次作答对比')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Weekly Progress Tracker */}
        {activeTab === 'progress' && (
          <WeeklyTracker
            history={history}
            savedPronunciations={savedPronunciations}
            savedCorpusWords={savedCorpusWords}
            onRemovePronunciation={handleRemovePronunciation}
            onSelectHistoryItem={(item) => {
              setCurrentEvaluation(item);
              const foundTopic = ORAL_TOPICS.find((t) => t.id === item.topicId);
              if (foundTopic) {
                const idx = ORAL_TOPICS.findIndex((t) => t.id === item.topicId);
                if (idx !== -1) setCurrentTopicIndex(idx);
              }
              setSessionStep('feedback');
              setActiveTab('practice');
            }}
          />
        )}

        {/* TAB 3: Expanded Singapore Local Culture Corpus & Pronunciation Hub */}
        {activeTab === 'corpus' && (
          <div className="space-y-6">
            {/* Hero Header */}
            <div className="bg-[#072B2E] text-white rounded-2xl p-6 sm:p-8 border border-teal-800 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="max-w-2xl space-y-1.5">
                  <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                    {t('Singapore Everyday Chinese Vocabulary & Cultural Reference', '新加坡生活文化与常用华语表达参考库')}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {t(
                      'Singapore Local Culture, Community Topics & Useful Idioms',
                      '新加坡本土生活文化、常见社区话题词汇与多音字读音参考'
                    )}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {t(
                      'Using authentic local examples (such as HDB neighbourliness, hawker culture, SkillsFuture, VIA, and Racial Harmony Day) and appropriate idioms helps make your spoken expression more vivid and relatable. Click any item to listen to pronunciation.',
                      '在日常华文口语表达中，自然融入新加坡真实生活场景（如组屋睦邻、小贩文化、技能创前程、德育在于行动、种族和谐日等）与四字成语，能让分享更加充实生动。点击任意词条即可收听示范发音。'
                    )}
                  </p>
                </div>
              </div>

              {/* SG PDPA Voice & Pronunciation Privacy Notice inside Corpus & Pronunciation Hub */}
              <div className="mt-4 pt-4 border-t border-teal-800/80 flex items-start sm:items-center gap-2 text-xs text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                <span>
                  {t(
                    'SG PDPA Privacy Guarantee: All pronunciation & tone diagnostics run on local speech-to-text transcripts. Zero raw voice recordings or biometric voiceprints are stored on our servers.',
                    '新加坡 PDPA 隐私安全承诺：所有发音与声调诊断均基于本地实时语音转文字进行，服务器零原始录音留存、零声纹采集。'
                  )}
                </span>
              </div>
            </div>

            {/* Enhancement 5: Interactive 1-Minute Polyphonic & Singapore Policy Flashcard Quiz */}
            <PronunciationPolicyQuizCard />

            {/* Singapore Local Culture & Public Policy Sections */}
            {SINGAPORE_LOCAL_CULTURE_LEXICON.map((sec, sIdx) => (
              <div key={sIdx} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  {sec.icon === 'policy' ? (
                    <Landmark className="w-5 h-5 text-teal-800" />
                  ) : (
                    <Users className="w-5 h-5 text-emerald-700" />
                  )}
                  <h3 className="text-base font-bold text-slate-900">
                    {t(sec.categoryEn, sec.categoryZh)}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sec.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-teal-50/40 p-4 flex flex-col justify-between gap-2.5 transition-colors"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-teal-950">{item.term}</h4>
                            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                              {item.pinyin} · <span className="font-sans text-teal-800">{item.contextEn}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              playNaturalSpeech(`${item.term}。${item.usage}`, {
                                voiceType: 'examiner',
                                rate: 0.94,
                              })
                            }
                            title={t('Listen to standard Mandarin pronunciation', '点击收听标准华语朗读示范')}
                            className="p-2 rounded-lg bg-white hover:bg-teal-900 text-teal-900 hover:text-white border border-slate-200 transition-colors cursor-pointer shrink-0"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed mt-2.5">
                          <span className="font-semibold text-emerald-800">
                            {t('Examiner Sample Sentence: ', '口试满分示范句：')}
                          </span>
                          {item.usage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Classic Connectives, Idioms & Singapore Terms Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-teal-800" />
                <h3 className="text-base font-bold text-slate-900">
                  {t(
                    'Universal O-Level Logical Connectives & Idioms',
                    'O 水准口试万能逻辑衔接词与高频四字成语'
                  )}
                </h3>
              </div>

              <CorpusCard
                corpusSuggestions={{
                  connectives: [
                    { type: '因果', words: ['之所以……是因为', '其根本原因在于', '追根究底'], example: '之所以出现这种现象，其根本原因在于部分人缺乏换位思考的同理心。' },
                    { type: '转折', words: ['不可否认的是', '话虽如此', '然而硬币的另一面是'], example: '不可否认的是，提升罚款能收一时之效，但长远看仍需家庭与学校教育熏陶。' },
                    { type: '递进', words: ['不仅如此', '更进一步来说', '尤为关键的是'], example: '不仅如此，保持桌面整洁更直接减轻了乐龄保洁人员的体力负担。' },
                    { type: '总结', words: ['总而言之', '综上所述', '唯有多管齐下'], example: '总而言之，唯有个人、家庭、学校与政府多管齐下，方能构建真正的优雅狮城。' },
                  ],
                  idiomsAndProverbs: [
                    { phrase: '举手之劳', meaning: '毫不费力的小举动 (A small, effortless act)', usageContext: '归还餐盘、自备环保袋、电梯问候' },
                    { phrase: '潜移默化', meaning: '不知不觉受到感染而变化 (Subtle, gradual influence)', usageContext: '父母言传身教、校园文化熏陶' },
                    { phrase: '双管齐下', meaning: '两项措施并进配合 (Two-pronged approach)', usageContext: '法律严厉执法与品德公民教育' },
                    { phrase: '老吾老以及人之老', meaning: '尊敬爱护社会所有长辈 (Respecting all seniors as one’s own)', usageContext: '敬老爱幼、社区义工关爱独居乐龄' },
                    { phrase: '居安思危', meaning: '处在安定环境中也想到潜在挑战 (Stay vigilant in times of peace)', usageContext: '维护种族宗教和谐、防范网络诈骗' },
                    { phrase: '求同存异', meaning: '找出共同点，尊重彼此差异 (Seek common ground while respecting differences)', usageContext: '多元种族共融、邻里和睦相处' },
                    { phrase: '行行出状元', meaning: '任何行业踏实努力都能出彩 (Every trade has its master)', usageContext: '支持青年小贩接班人、尊重多元职业' },
                    { phrase: '薪火相传', meaning: '文化或技艺世代相传 (Passing the torch from generation to generation)', usageContext: '牛车水传统手艺、母语双周与小贩非遗' },
                  ],
                  singaporeTerms: [
                    { term: '小贩中心 / 熟食中心', properUsage: '规范华语称谓，避免英文直接混杂 Hawker Centre' },
                    { term: '租赁组屋 (Rental Flat)', properUsage: '新加坡公共住房关怀独居乐龄弱势群体的语境' },
                    { term: '德育在于行动 (VIA)', properUsage: 'Values in Action 社区服务学习计划' },
                    { term: '民众俱乐部 (CC) / 居委会 (RN)', properUsage: '推动邻里凝聚力与跨世代交流的基层社区组织' },
                    { term: '母语双周 (MTL Fortnight)', properUsage: '推广华族传统文化体验的校园主题活动周' },
                    { term: '清真认证 (Halal)', properUsage: '多元种族聚餐时体谅马来穆斯林同胞饮食禁忌的用语' },
                  ],
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 4: Cross-Platform Mobile Exporter */}
        {activeTab === 'mobile_export' && <MobileExporterView />}
      </main>

      {/* Retest & Compare Modal */}
      {showRetestModal && currentEvaluation && (
        <RetestCompareModal
          initialResult={currentEvaluation}
          currentTopic={currentTopic}
          similarTopic={similarTopic}
          onClose={() => setShowRetestModal(false)}
          onSaveRetestToHistory={handleSaveRetestComparison}
        />
      )}

      {/* Enhancement 6: Exportable / Printable Practice Reference Summary Modal */}
      {showReportCardExportModal && currentEvaluation && (
        <ReportCardExportModal
          evaluation={currentEvaluation}
          studentName={userProfile?.displayName || 'Learner'}
          schoolCode={userProfile?.schoolName || 'SELF-PRACTICE'}
          onClose={() => setShowReportCardExportModal(false)}
        />
      )}

      {/* AI Architecture & Inspection Modal */}
      {showAiModal && (
        <AiArchitectureModal onClose={() => setShowAiModal(false)} />
      )}

      {/* Member Center: Email-Only Registration, Topic Unlock & Mobile PWA Install Modal */}
      <TrialEditionModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        isTrialMode={isTrialMode}
        setIsTrialMode={setIsTrialMode}
        trialSessionsRemaining={trialSessionsRemaining}
        onResetTrialQuota={() => setTrialSessionsRemaining(3)}
        fastMode={fastMode}
        setFastMode={setFastMode}
        onRunInstantFollowUpDemo={handleRunInstantFollowUpDemo}
        onRunInstantReportDemo={handleRunInstantReportDemo}
        currentUser={currentUser}
        userProfile={userProfile}
        isAuthLoading={isAuthLoading}
        onSignInWithGoogle={handleSignInWithGoogle}
        onEmailAuth={handleEmailAuth}
        onSignOut={handleSignOut}
        onSelectSubscriptionPlan={handleSelectSubscriptionPlan}
        initialSection={trialModalSection}
      />
    </div>
  );
}
