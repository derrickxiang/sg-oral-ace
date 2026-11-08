import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Clock,
  Volume2,
  VolumeX,
  Mic,
  Square,
  Check,
  Sparkles,
  RotateCcw,
  FileText,
  Play,
  Pause,
} from 'lucide-react';
import {
  ReadingAloudPassage,
  ReadingAloudEvaluation,
  OridScratchpadNotes,
} from '../types/oral';
import {
  getReadingAloudPassage,
  evaluateReadingAloud,
  getSuggestedOridKeywordsForTopic,
} from '../utils/seabRubric';
import { playNaturalSpeech, stopNaturalSpeech } from '../utils/naturalSpeech';
import { useLanguage } from '../context/LanguageContext';
import { AcousticGopTelemetryCard } from './AcousticGopTelemetryCard';

interface ReadingAloudAndPrepDeckProps {
  topicId: string;
  topicTitle: string;
  readingEvaluation: ReadingAloudEvaluation | null;
  onReadingEvaluated: (evaluation: ReadingAloudEvaluation) => void;
  oridNotes: OridScratchpadNotes;
  onOridNotesChange: (notes: OridScratchpadNotes) => void;
}

export const ReadingAloudAndPrepDeck: React.FC<ReadingAloudAndPrepDeckProps> = ({
  topicId,
  topicTitle,
  readingEvaluation,
  onReadingEvaluated,
  oridNotes,
  onOridNotesChange,
}) => {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'reading' | 'prep_orid'>('reading');
  const [showRhythmMarks, setShowRhythmMarks] = useState<boolean>(true);
  const [isPlayingModel, setIsPlayingModel] = useState<boolean>(false);
  const [isRecordingReading, setIsRecordingReading] = useState<boolean>(false);
  const [readingDuration, setReadingDuration] = useState<number>(0);
  const [spokenReadingText, setSpokenReadingText] = useState<string>('');

  // 10-minute (600s) SEAB Exam Preparation Countdown Timer
  const [prepSecondsLeft, setPrepSecondsLeft] = useState<number>(600);
  const [isPrepTimerRunning, setIsPrepTimerRunning] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const readingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prepTimerRef = useRef<NodeJS.Timeout | null>(null);

  const passageData: ReadingAloudPassage = getReadingAloudPassage(topicId, topicTitle);

  useEffect(() => {
    setSpokenReadingText(readingEvaluation?.spokenTranscript || '');
    stopNaturalSpeech();
    setIsPlayingModel(false);
  }, [topicId]);

  useEffect(() => {
    if (isRecordingReading) {
      readingTimerRef.current = setInterval(() => {
        setReadingDuration((prev) => prev + 1);
      }, 1000);
    } else if (readingTimerRef.current) {
      clearInterval(readingTimerRef.current);
    }
    return () => {
      if (readingTimerRef.current) clearInterval(readingTimerRef.current);
    };
  }, [isRecordingReading]);

  useEffect(() => {
    if (isPrepTimerRunning && prepSecondsLeft > 0) {
      prepTimerRef.current = setInterval(() => {
        setPrepSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (prepTimerRef.current) {
      clearInterval(prepTimerRef.current);
    }
    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
  }, [isPrepTimerRunning, prepSecondsLeft]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleListenModelPassage = async () => {
    if (isPlayingModel) {
      stopNaturalSpeech();
      setIsPlayingModel(false);
      return;
    }
    setIsPlayingModel(true);
    await playNaturalSpeech(passageData.passage, {
      voiceType: 'narration',
      rate: 0.92,
      onStart: () => setIsPlayingModel(true),
      onEnd: () => setIsPlayingModel(false),
      onError: () => setIsPlayingModel(false),
    });
  };

  const handleStartReadingRecord = () => {
    setIsRecordingReading(true);
    setReadingDuration(0);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setSpokenReadingText(currentText);
        };
        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        // fallback to manual/simulated input
      }
    }
  };

  const handleStopReadingRecord = () => {
    setIsRecordingReading(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    if (spokenReadingText.trim()) {
      const result = evaluateReadingAloud(
        passageData,
        spokenReadingText.trim(),
        readingDuration || 35
      );
      onReadingEvaluated(result);
    }
  };

  const handleSimulateReadingGrade = () => {
    // Simulate a realistic student reading aloud with 96%+ accuracy
    const simulatedText = passageData.passage;
    setSpokenReadingText(simulatedText);
    const result = evaluateReadingAloud(passageData, simulatedText, 38);
    onReadingEvaluated(result);
  };

  const handleAutoFillOrid = () => {
    const suggested = getSuggestedOridKeywordsForTopic(topicId);
    onOridNotesChange(suggested);
  };

  return (
    <div
      data-testid="reading-aloud-prep-deck"
      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4 overflow-hidden"
    >
      {/* Top Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            data-testid="tab-reading-aloud"
            onClick={() => setActiveSubTab('reading')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'reading'
                ? 'bg-[#0B3B3C] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>{t('Part 1: Reading Aloud (10m)', '第一部分：朗读短文 (10分)')}</span>
            {readingEvaluation && (
              <span className="font-mono text-[11px] text-emerald-300">
                · {readingEvaluation.score}/10
              </span>
            )}
          </button>

          <button
            type="button"
            data-testid="tab-prep-orid"
            onClick={() => setActiveSubTab('prep_orid')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'prep_orid'
                ? 'bg-[#0B3B3C] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>{t('10m Prep Timer & ORID Notes', '10分钟备考倒计时与 ORID 速记')}</span>
          </button>
        </div>

        {/* Always-visible 10:00 Practice Prep Timer Control */}
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono tabular-nums shrink-0">
          <Clock className="w-3.5 h-3.5 text-teal-800 shrink-0" />
          <span className="text-slate-500 font-sans">
            {t('Prep Timer:', '准备计时：')}
          </span>
          <strong className={prepSecondsLeft < 120 ? 'text-red-600' : 'text-slate-900'}>
            {formatTimer(prepSecondsLeft)}
          </strong>
          <button
            type="button"
            onClick={() => setIsPrepTimerRunning((prev) => !prev)}
            className="px-2 py-0.5 rounded bg-teal-900 text-white font-sans font-semibold text-[11px] hover:bg-teal-800 transition-colors cursor-pointer"
          >
            {isPrepTimerRunning ? t('Pause', '暂停') : t('Start', '开始')}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPrepTimerRunning(false);
              setPrepSecondsLeft(600);
            }}
            title={t('Reset 10:00 Timer', '重置10分钟计时')}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Part 1 — Reading Aloud Practice (朗读短文练习 · 参考分 10) */}
      {activeSubTab === 'reading' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs text-teal-800 font-semibold">
                {t(
                  'Part 1 · Reading Aloud Self-Practice (Reference / 10)',
                  '第一部分 · 朗读短文自测练习（参考分 10 分 · 仅供练习参考）'
                )}
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                {t(`${passageData.titleEn} (${passageData.titleZh})`, passageData.titleZh)}
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRhythmMarks((p) => !p)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                {showRhythmMarks
                  ? t('Hide Pause Marks (/)', '隐藏停连符号 (/)')
                  : t('Show Pause Marks (/)', '显示停连符号 (/)')}
              </button>

              <button
                type="button"
                onClick={handleListenModelPassage}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isPlayingModel
                    ? 'bg-emerald-600 text-white'
                    : 'bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-900/15'
                }`}
              >
                {isPlayingModel ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('Stop Model Audio', '停止范读')}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('Listen Model Reading', '收听示范朗读')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Passage Display Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/90 leading-loose text-base sm:text-lg text-slate-900 font-medium tracking-wide">
            {showRhythmMarks ? passageData.segmentedRhythm : passageData.passage}
          </div>

          {/* Polyphonic & Tone Traps in this Passage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {passageData.focusTraps.map((trap, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-xs sm:text-sm text-slate-900">{trap.word}</strong>
                    <span className="text-[11px] font-mono font-semibold text-amber-900">
                      [{trap.pinyin}]
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    {t(trap.noteEn, trap.noteZh)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    playNaturalSpeech(trap.word, { voiceType: 'examiner', rate: 0.85 })
                  }
                  className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-200/80 shrink-0 cursor-pointer"
                  title={t('Listen pronunciation', '收听标准读音')}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Action Row: Record Reading Aloud or Simulate Instant Grade */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              {!isRecordingReading ? (
                <button
                  type="button"
                  onClick={handleStartReadingRecord}
                  className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Mic className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('Record Reading Aloud', '开始朗读评测')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopReadingRecord}
                  className="inline-flex items-center gap-1.5 bg-[#0B3B3C] hover:bg-teal-900 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Square className="w-3.5 h-3.5 fill-current text-red-400 shrink-0" />
                  <span>
                    {t('Stop & Score Reading', '结束朗读并评分')} ({formatTimer(readingDuration)})
                  </span>
                </button>
              )}

              <button
                type="button"
                data-testid="btn-simulate-reading-aloud"
                onClick={handleSimulateReadingGrade}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-900/15 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>
                  {t('1-Click Reading Aloud Assessment (10m)', '一键体验朗读短文 AI 评分 (10分)')}
                </span>
              </button>
            </div>

            {readingEvaluation && (
              <div
                data-testid="reading-aloud-score-pill"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {t('Part 1 Score:', '朗读短文得分：')}{' '}
                  <strong className="font-mono">{readingEvaluation.score}/10</strong> ·{' '}
                  {readingEvaluation.accuracyPercent}% {t('Accuracy', '吻合度')}
                </span>
              </div>
            )}
          </div>

          {readingEvaluation && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-800 space-y-1">
                <div className="font-semibold text-emerald-950">
                  {t('Reading Aloud Practice Tips:', '朗读短文练习参考建议：')}{' '}
                  <span className="font-mono text-emerald-700">
                    ({readingEvaluation.fluencyRating})
                  </span>
                </div>
                <p className="leading-relaxed">
                  {t(readingEvaluation.feedbackEn, readingEvaluation.feedbackZh)}
                </p>
              </div>

              {readingEvaluation.acousticTelemetry && (
                <AcousticGopTelemetryCard
                  telemetry={readingEvaluation.acousticTelemetry}
                  titleOverrideZh="Part 1 朗读短文 · 本机声学对齐与音素 GOP 置信度 (proto-pron)"
                  titleOverrideEn="Part 1 Reading Aloud · On-Device Forced Alignment & Phoneme GOP"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: 10-Minute Practice Prep ORID Keyword Scratchpad */}
      {activeSubTab === 'prep_orid' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                {t(
                  '10-Minute Silent Preparation · ORID Keyword Scratchpad',
                  '10分钟默读与思路梳理 · ORID 四步关键词速记板'
                )}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'Jot down 4–6 keywords while watching the video. Your notes will stay visible above the microphone in Step 2 & Step 3!',
                  '观看短片时速记4~6个关键词。进入第二步录音与第三步延伸提问时，您的提纲会自动固定在麦克风上方供随时参考！'
                )}
              </p>
            </div>

            <button
              type="button"
              data-testid="btn-autofill-orid"
              onClick={handleAutoFillOrid}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-900/15 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span>{t('Auto-Fill Topic ORID Keywords', '填入本话题高分 ORID 提纲')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('O · Observation (What happened in the clip?)', 'O · 观察见闻（短片正反人物对比细节）')}
              </label>
              <input
                type="text"
                value={oridNotes.observation}
                onChange={(e) =>
                  onOridNotesChange({ ...oridNotes, observation: e.target.value })
                }
                placeholder={t('e.g., Positive vs negative diner actions...', '例如：归还托盘青年 vs 留下碗碟食客……')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/60 focus:bg-white focus:border-[#0B3B3C] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('R · Reflection & Personal Example (Feelings / Story)', 'R · 感受与亲身经历（我的生活见闻）')}
              </label>
              <input
                type="text"
                value={oridNotes.reflection}
                onChange={(e) =>
                  onOridNotesChange({ ...oridNotes, reflection: e.target.value })
                }
                placeholder={t('e.g., Empathy for elderly cleaners, my school canteen...', '例如：体谅年迈保洁员辛劳、大巴窑熟食中心经历……')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/60 focus:bg-white focus:border-[#0B3B3C] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('I · Interpretation (Root Causes & Mindset)', 'I · 原因剖析（为什么会出现这种现象？）')}
              </label>
              <input
                type="text"
                value={oridNotes.interpretation}
                onChange={(e) =>
                  onOridNotesChange({ ...oridNotes, interpretation: e.target.value })
                }
                placeholder={t('e.g., Lack of civic consciousness vs family upbringing...', '例如：侥幸心理、缺乏同理心 vs 家庭言传身教……')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/60 focus:bg-white focus:border-[#0B3B3C] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('D · Decision & Policy (Individual / School / Govt)', 'D · 多元建议（个人 + 学校 VIA + 政府政策）')}
              </label>
              <input
                type="text"
                value={oridNotes.decision}
                onChange={(e) =>
                  onOridNotesChange({ ...oridNotes, decision: e.target.value })
                }
                placeholder={t('e.g., Two-pronged approach: NEA law + school VIA...', '例如：双管齐下：环境局执法 + 学校“德育在于行动”……')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/60 focus:bg-white focus:border-[#0B3B3C] outline-hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
