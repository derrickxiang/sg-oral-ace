import React, { useState, useEffect } from 'react';
import { ORAL_TOPICS } from './data/topics';
import { OralTopic, EvaluationResult, ComparisonResult, PronunciationIssue } from './types/oral';
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
import {
  Sparkles,
  RotateCcw,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  Volume2,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'practice' | 'progress' | 'corpus' | 'mobile_export'>('practice');
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(0);
  const currentTopic = ORAL_TOPICS[currentTopicIndex] || ORAL_TOPICS[0];

  // Practice session state
  const [sessionStep, setSessionStep] = useState<'video' | 'record_initial' | 'followup' | 'feedback'>('video');
  const [initialTranscript, setInitialTranscript] = useState<string>('');
  const [initialAudioUrl, setInitialAudioUrl] = useState<string | null>(null);
  const [initialDuration, setInitialDuration] = useState<number>(0);

  // Follow-up state
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState<boolean>(false);
  const [followUpQuestion, setFollowUpQuestion] = useState<string>('');
  const [followUpRationale, setFollowUpRationale] = useState<string>('');
  const [examinerToneAdvice, setExaminerToneAdvice] = useState<string>('');
  const [followUpTranscript, setFollowUpTranscript] = useState<string>('');

  // Evaluation & Feedback state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationResult | null>(null);

  // Retest & Comparison Modal state
  const [showRetestModal, setShowRetestModal] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

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

  const [savedCorpusWords, setSavedCorpusWords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('oralpass_corpus');
      return saved ? JSON.parse(saved) : ['举手之劳', '潜移默化', '双管齐下', '老吾老以及人之老', '迫在眉睫'];
    } catch {
      return ['举手之劳', '潜移默化', '双管齐下', '老吾老以及人之老', '迫在眉睫'];
    }
  });

  const [weeklyStreak, setWeeklyStreak] = useState<number>(() => {
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

  // Step 1 -> Step 2: After watching video, proceed to voice answer
  const handleProceedToRecord = () => {
    setSessionStep('record_initial');
  };

  // Step 2 -> Step 3: Submit initial answer, generate follow-up question
  const handleInitialAnswerSubmit = async (transcript: string, audioUrl: string | null, duration: number) => {
    setInitialTranscript(transcript);
    setInitialAudioUrl(audioUrl);
    setInitialDuration(duration);
    setIsGeneratingFollowUp(true);

    try {
      const res = await fetch('/api/oral/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: currentTopic.id,
          topicTitle: currentTopic.title,
          primaryQuestion: currentTopic.primaryQuestion,
          studentTranscript: transcript,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFollowUpQuestion(data.followUpQuestion);
        setFollowUpRationale(data.rationaleForQuestion);
        setExaminerToneAdvice(data.examinerToneAdvice);
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
    } finally {
      setIsGeneratingFollowUp(false);
      setSessionStep('followup');
    }
  };

  // Step 3 -> Step 4: Submit follow-up response and generate complete evaluation
  const handleFollowUpAnswerSubmit = async (fTranscript: string, _audioUrl: string | null, _duration: number) => {
    setFollowUpTranscript(fTranscript);
    await triggerFullEvaluation(initialTranscript, fTranscript);
  };

  const handleSkipFollowUp = async () => {
    setFollowUpTranscript('');
    await triggerFullEvaluation(initialTranscript, '');
  };

  const triggerFullEvaluation = async (initText: string, followText: string) => {
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
          followUpQuestion,
          followUpTranscript: followText,
          audioDurationSeconds: initialDuration,
        }),
      });

      let evaluationData: EvaluationResult;
      if (res.ok) {
        evaluationData = await res.json();
      } else {
        throw new Error('Evaluation request failed');
      }

      setCurrentEvaluation(evaluationData);
      setHistory((prev) => [evaluationData, ...prev]);
      setSessionStep('feedback');
    } catch (err) {
      console.warn('Evaluation fallback:', err);
    } finally {
      setIsEvaluating(false);
    }
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

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        weeklyStreak={weeklyStreak}
        totalPractices={history.length}
        onOpenAiInfo={() => setShowAiModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: Oral Practice Sparring */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            {/* Topic Selector Ribbon */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-red-600" />
                  <span>选择 O-Level 会考高频短片话题：</span>
                </span>
                <span className="text-xs text-gray-400">共 {ORAL_TOPICS.length} 套新加坡生活实景话题</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {ORAL_TOPICS.map((topic, index) => {
                  const isSelected = index === currentTopicIndex;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        if (index !== currentTopicIndex) {
                          setCurrentTopicIndex(index);
                          handleRestartTopic();
                        }
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-red-50/80 border-red-500 ring-2 ring-red-100 shadow-xs'
                          : 'bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{topic.videoThumbnail}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                          {topic.title}
                        </h4>
                        <span className="text-[10px] text-gray-500 block truncate">
                          {topic.theme}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-2">
              {[
                { step: 'video', label: '1. 看生活话题短片' },
                { step: 'record_initial', label: '2. 录音作答首题' },
                { step: 'followup', label: '3. 考官现场智能追问' },
                { step: 'feedback', label: '4. 三项核心诊断与提分' },
              ].map((s, idx) => {
                const stepOrder = ['video', 'record_initial', 'followup', 'feedback'];
                const currentIndex = stepOrder.indexOf(sessionStep);
                const itemIndex = stepOrder.indexOf(s.step);
                const isCompleted = itemIndex < currentIndex;
                const isCurrent = itemIndex === currentIndex;

                return (
                  <div key={s.step} className="flex items-center space-x-2 text-xs font-semibold">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-red-600 text-white ring-2 ring-red-200'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </span>
                    <span className={isCurrent ? 'text-red-700 font-bold' : isCompleted ? 'text-emerald-700' : 'text-gray-400'}>
                      {s.label}
                    </span>
                    {idx < 3 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:block" />}
                  </div>
                );
              })}
            </div>

            {/* Step 1: Watch Video Screen */}
            {sessionStep === 'video' && (
              <div className="space-y-6">
                <VideoPlayerSimulator
                  topic={currentTopic}
                  onVideoFinished={handleProceedToRecord}
                />

                {/* Question & Prompt Banner */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                      会考主考官首题：
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                      “{currentTopic.primaryQuestion}”
                    </h3>
                    <p className="text-xs text-gray-500">
                      💡 备考提示：回答时可先概括短片中观察到的现象，表达主观看法，再由浅入深分析成因，最后提出合理建议。
                    </p>
                  </div>

                  <button
                    onClick={handleProceedToRecord}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md shadow-red-200 transition-all cursor-pointer"
                  >
                    <span>我已看完短片，开始录音作答</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Record Initial Answer */}
            {sessionStep === 'record_initial' && (
              <div className="space-y-6">
                {/* Topic context header */}
                <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-red-700">
                      {currentTopic.theme} · 试卷三录像说话
                    </span>
                    <button
                      onClick={() => setSessionStep('video')}
                      className="text-xs text-red-600 hover:text-red-800 underline"
                    >
                      返回重新观看短片
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    “{currentTopic.primaryQuestion}”
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {currentTopic.backgroundContext}
                  </p>
                </div>

                {/* Voice Recorder */}
                <VoiceRecorder
                  onTranscriptReady={handleInitialAnswerSubmit}
                  isLoading={isGeneratingFollowUp}
                  sampleAnswer={
                    currentTopic.id === 'topic-hawker-tray'
                      ? '看了这个录像短片，我认为大家在小贩中心吃完饭后应该主动把托盘放回去。因为保持桌子干净是好事，而且那些清洁阿公阿婆年纪都很大了，推着重车很辛苦。如果不归还托盘，下一位食客就没有位子坐。所以政府应该提高罚款，警察也要抓不遵守规则的人，学校老师也要跟学生说要做好事。'
                      : '看了这个短片，我觉得环保很重要。现在很多塑料袋丢在垃圾桶里，会破坏环境。中学生应该带自己的饭盒打包鸡饭，这样就可以减少垃圾。政府可以给带饭盒的人打折，大家就会慢慢习惯了。'
                  }
                  placeholderText="请点击麦克风口述您的见解，清晰阐述短片现象、您的看法及生活实例……"
                  submitButtonText="提交回答，进入考官智能追问环节"
                />

                {/* Vocabulary & Connectives Helper Drawer */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>本题高分语料库提示（答题时可尝试融入）：</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {currentTopic.suggestedVocabulary.map((vocab, i) => (
                      <div key={i} className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs text-gray-900">{vocab.word}</strong>
                          <span className="text-[10px] font-mono text-gray-500">{vocab.pinyin}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{vocab.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Follow-Up Questioning */}
            {sessionStep === 'followup' && (
              <div className="space-y-6">
                <FollowUpSection
                  followUpQuestion={followUpQuestion}
                  rationaleForQuestion={followUpRationale}
                  examinerToneAdvice={examinerToneAdvice}
                  onFollowUpAnswerSubmit={handleFollowUpAnswerSubmit}
                  onSkipFollowUp={handleSkipFollowUp}
                  isLoading={isEvaluating}
                />
              </div>
            )}

            {/* Step 4: Triple Feedback & SEAB Rubric Report */}
            {sessionStep === 'feedback' && currentEvaluation && (
              <div className="space-y-6">
                {/* Top Action Bar */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block">
                      口试试卷三 · 诊断与提分报告
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      《{currentTopic.title}》全方位测评反馈
                    </h3>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowRetestModal(true)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-red-200 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>用同类题再练一次，比较前后变化</span>
                    </button>

                    <button
                      onClick={handleRestartTopic}
                      className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      练习新话题
                    </button>
                  </div>
                </div>

                {/* SEAB 4-Dimension Rubric Score */}
                <RubricScoreCard evaluation={currentEvaluation} />

                {/* THE 3 CORE FEEDBACKS: 哪里表达清楚, 哪里缺少理由, 下一次怎么改 */}
                <TripleFeedbackCard tripleFeedback={currentEvaluation.tripleFeedback} />

                {/* Pronunciation & Tone Correction Card */}
                <PronunciationCard
                  issues={currentEvaluation.pronunciationIssues}
                  onSaveToNotebook={handleSavePronunciation}
                  savedWords={savedPronunciations.map((p) => p.word)}
                />

                {/* Corpus & Logic Connectives Upgrade Card */}
                <CorpusCard corpusSuggestions={currentEvaluation.corpusSuggestions} />

                {/* Retest Bottom CTA */}
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold">
                      趁热打铁：用同类题/同话题再练一次！
                    </h4>
                    <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-xl">
                      结合考官指出的逻辑漏洞与发音纠正，立刻进行第二次作答。系统将实时呈现论点扩充度与提分对比图。
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRetestModal(true)}
                    className="bg-white text-gray-900 hover:bg-amber-50 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    立即开启二次作答对比
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

        {/* TAB 3: Corpus & Pronunciation Dictionary */}
        {activeTab === 'corpus' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                新加坡 O-Level 华文口试备考语料库大全
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                系统整理历年新加坡会考高频成语、易混淆多音字、新加坡特有词汇规范与论证衔接词
              </p>

              <CorpusCard
                corpusSuggestions={{
                  connectives: [
                    { type: '因果', words: ['之所以……是因为', '其根本原因在于', '导致了'], example: '之所以出现这种现象，其根本原因在于部分人缺乏同理心。' },
                    { type: '转折', words: ['不可否认的是', '话虽如此', '相反地'], example: '不可否认的是，提升罚款能收一时之效，但长远看仍需教育熏陶。' },
                    { type: '递进', words: ['不仅如此', '更进一步来说', '甚至'], example: '不仅如此，保持桌面整洁更直接减轻了乐龄保洁人员的体力负担。' },
                    { type: '总结', words: ['总而言之', '综上所述', '长远来看'], example: '总而言之，唯有家庭、学校与社会三管齐下，方能构建真正的优雅狮城。' },
                  ],
                  idiomsAndProverbs: [
                    { phrase: '举手之劳', meaning: '毫不费力的小举动', usageContext: '归还餐盘、自备环保袋' },
                    { phrase: '潜移默化', meaning: '不知不觉受到感染而变化', usageContext: '父母言传身教、校园文化熏陶' },
                    { phrase: '双管齐下', meaning: '两项措施并进配合', usageContext: '法律严厉执法与品德公民教育' },
                    { phrase: '老吾老以及人之老', meaning: '尊敬爱护社会所有长辈', usageContext: '敬老爱幼、社区义工关爱独居乐龄' },
                    { phrase: '迫在眉睫', meaning: '事情十分紧迫', usageContext: '实马高垃圾埋置场饱和、源头减塑' },
                    { phrase: '防患于未然', meaning: '在灾难发生前就防备好', usageContext: '防范网络电信诈骗与数码安全' },
                  ],
                  singaporeTerms: [
                    { term: '小贩中心 / 熟食中心', properUsage: '规范华语称谓，避免英文直接混杂 Hawker Centre' },
                    { term: '租赁组屋 (Rental Flat)', properUsage: '新加坡公共住房关怀老龄弱势群体的语境' },
                    { term: '社区服务时数 (VIA)', properUsage: '德育在于行动（Values in Action）课程' },
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

      {/* AI Architecture & Inspection Modal */}
      {showAiModal && (
        <AiArchitectureModal onClose={() => setShowAiModal(false)} />
      )}
    </div>
  );
}
