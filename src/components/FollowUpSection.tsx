import React, { useState, useEffect } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import {
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  Zap,
  Check,
  Layers,
  FileText,
} from 'lucide-react';
import { FollowUpExchange, OridScratchpadNotes } from '../types/oral';
import { getProgressiveFollowUpQuestion } from '../utils/seabRubric';
import { playNaturalSpeech, stopNaturalSpeech } from '../utils/naturalSpeech';
import { useLanguage } from '../context/LanguageContext';

interface FollowUpSectionProps {
  topicId?: string;
  followUpQuestion: string;
  rationaleForQuestion?: string;
  examinerToneAdvice?: string;
  latencyMs?: number | null;
  oridNotes?: OridScratchpadNotes;
  onFollowUpAnswerSubmit: (
    transcript: string,
    audioUrl: string | null,
    duration: number,
    exchanges?: FollowUpExchange[]
  ) => void;
  onSkipFollowUp: () => void;
  isLoading: boolean;
}

export const FollowUpSection: React.FC<FollowUpSectionProps> = ({
  topicId = 'topic-hawker-tray',
  followUpQuestion,
  rationaleForQuestion,
  examinerToneAdvice,
  latencyMs,
  oridNotes,
  onFollowUpAnswerSubmit,
  onSkipFollowUp,
  isLoading,
}) => {
  const { t } = useLanguage();
  const [isPlayingTTS, setIsPlayingTTS] = useState<boolean>(false);
  const [dialogueMode, setDialogueMode] = useState<'single' | 'multi_3'>('multi_3');
  const [currentRound, setCurrentRound] = useState<1 | 2 | 3>(1);
  const [completedExchanges, setCompletedExchanges] = useState<FollowUpExchange[]>([]);

  const roundPreset = getProgressiveFollowUpQuestion(topicId, currentRound);

  // Active question for the current round
  const activeQuestion =
    currentRound === 1 && followUpQuestion ? followUpQuestion : roundPreset.question;
  const activeIntent =
    currentRound === 1 && rationaleForQuestion ? rationaleForQuestion : roundPreset.intent;
  const activeTip =
    currentRound === 1 && examinerToneAdvice ? examinerToneAdvice : roundPreset.tip;

  // Pre-warm examiner voice audio in background
  useEffect(() => {
    if (!activeQuestion) return;
    fetch('/api/oral/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: activeQuestion,
        voiceType: 'examiner',
        voiceName: 'Puck',
      }),
    }).catch(() => {
      // Ignore background pre-warm error
    });
  }, [activeQuestion]);

  const playExaminerVoice = async () => {
    if (isPlayingTTS) {
      stopNaturalSpeech();
      setIsPlayingTTS(false);
      return;
    }

    setIsPlayingTTS(true);
    await playNaturalSpeech(activeQuestion, {
      voiceType: 'examiner',
      voiceName: 'Puck',
      rate: 0.92,
      onStart: () => setIsPlayingTTS(true),
      onEnd: () => setIsPlayingTTS(false),
      onError: () => setIsPlayingTTS(false),
    });
  };

  const handleRoundAnswerReady = (
    transcript: string,
    audioUrl: string | null,
    duration: number
  ) => {
    const newExchange: FollowUpExchange = {
      round: currentRound,
      tierLabelZh: roundPreset.tierLabelZh,
      tierLabelEn: roundPreset.tierLabelEn,
      question: activeQuestion,
      intent: activeIntent,
      tip: activeTip,
      candidateAnswer: transcript,
      durationSeconds: duration,
    };

    const updatedExchanges = [...completedExchanges, newExchange];
    setCompletedExchanges(updatedExchanges);

    if (dialogueMode === 'single' || currentRound === 3) {
      const combinedTranscript = updatedExchanges
        .map((ex) => `【第${ex.round}轮回答】${ex.candidateAnswer}`)
        .join('\n\n');
      const totalDuration = updatedExchanges.reduce((acc, ex) => acc + ex.durationSeconds, 0);
      onFollowUpAnswerSubmit(combinedTranscript, audioUrl, totalDuration, updatedExchanges);
    } else {
      const nextRound = (currentRound + 1) as 2 | 3;
      setCurrentRound(nextRound);
    }
  };

  const handleFinishEarlyWithCompleted = () => {
    if (completedExchanges.length === 0) {
      onSkipFollowUp();
      return;
    }
    const combinedTranscript = completedExchanges
      .map((ex) => `【第${ex.round}轮回答】${ex.candidateAnswer}`)
      .join('\n\n');
    const totalDuration = completedExchanges.reduce((acc, ex) => acc + ex.durationSeconds, 0);
    onFollowUpAnswerSubmit(combinedTranscript, null, totalDuration, completedExchanges);
  };

  const hasOridNotes =
    oridNotes &&
    (oridNotes.observation.trim() ||
      oridNotes.reflection.trim() ||
      oridNotes.interpretation.trim() ||
      oridNotes.decision.trim());

  return (
    <div className="bg-white rounded-2xl border border-teal-900/15 p-3.5 sm:p-6 space-y-5 overflow-hidden shadow-2xs">
      {/* Header Bar + Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-teal-800">
              {t('Interactive Spoken Practice · Reference Dialogue', '口语互动延伸练习 · 思路启发')}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              {latencyMs
                ? t(`Generated in ${(latencyMs / 1000).toFixed(2)}s`, `极速响应 ${(latencyMs / 1000).toFixed(2)}秒`)
                : t('Low-Latency AI Practice Partner', 'AI 口语陪练助手')}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {t('AI Coach Progressive Follow-Up Practice', 'AI 陪练渐进式延伸提问练习')}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Question vs 3-Round Progressive Dialogue Switcher */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              data-testid="mode-3-round-dialogue"
              onClick={() => setDialogueMode('multi_3')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                dialogueMode === 'multi_3'
                  ? 'bg-[#0B3B3C] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>{t('3-Round Practice Mode', '三轮渐进延伸练习')}</span>
            </button>
            <button
              type="button"
              data-testid="mode-1-round-quick"
              onClick={() => setDialogueMode('single')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                dialogueMode === 'single'
                  ? 'bg-[#0B3B3C] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('1-Round Quick Drill', '单轮快速练习')}
            </button>
          </div>

          <button
            type="button"
            onClick={playExaminerVoice}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-800/15 transition-colors cursor-pointer shrink-0"
          >
            {isPlayingTTS ? (
              <VolumeX className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 text-teal-800 shrink-0" />
            )}
            <span>
              {isPlayingTTS
                ? t('Stop Voice Playback', '停止语音朗读')
                : t('Listen to Prompt Audio', '收听提问示范语音')}
            </span>
          </button>
        </div>
      </div>

      {/* 3-Round Progress Stepper (when in 3-Round Exam Mode) */}
      {dialogueMode === 'multi_3' && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { r: 1 as const, labelEn: 'R1: Personal & Clip', labelZh: '第一轮：个人见闻' },
            { r: 2 as const, labelEn: 'R2: School & Youth', labelZh: '第二轮：校园责任' },
            { r: 3 as const, labelEn: 'R3: Policy & Values', labelZh: '第三轮：国家政策思辨' },
          ].map((step) => {
            const isDone = completedExchanges.some((ex) => ex.round === step.r);
            const isCurrent = currentRound === step.r;
            return (
              <button
                key={step.r}
                type="button"
                onClick={() => setCurrentRound(step.r)}
                className={`px-2.5 py-2 rounded-xl border text-left transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-teal-950 text-white border-teal-900'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[11px] font-semibold">
                  <span className="truncate">{t(step.labelEn, step.labelZh)}</span>
                  {isDone && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Completed Rounds Conversation History Thread */}
      {completedExchanges.length > 0 && (
        <div className="space-y-2.5 bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80">
          <div className="text-xs font-semibold text-teal-900">
            {t('Completed Practice Rounds:', '已完成的互动练习记录：')}
          </div>
          {completedExchanges.map((ex) => (
            <div
              key={ex.round}
              className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs"
            >
              <div className="font-semibold text-teal-800">
                {t(ex.tierLabelEn, ex.tierLabelZh)} — {ex.question}
              </div>
              <div className="text-slate-700 bg-teal-50/50 p-2.5 rounded-lg border border-teal-900/10">
                <strong className="text-teal-950">
                  {t('Your Answer:', '考生回答：')}{' '}
                </strong>
                {ex.candidateAnswer}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate ORID Scratchpad Reference Bar (if student took notes in Step 1) */}
      {hasOridNotes && (
        <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-amber-950">
            <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>{t('Your 10-Minute Prep ORID Notes:', '您在备考阶段记录的 ORID 提纲关键词：')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-700">
            {oridNotes?.observation && (
              <div>
                <strong className="text-slate-900">O:</strong> {oridNotes.observation}
              </div>
            )}
            {oridNotes?.reflection && (
              <div>
                <strong className="text-slate-900">R:</strong> {oridNotes.reflection}
              </div>
            )}
            {oridNotes?.interpretation && (
              <div>
                <strong className="text-slate-900">I:</strong> {oridNotes.interpretation}
              </div>
            )}
            {oridNotes?.decision && (
              <div>
                <strong className="text-slate-900">D:</strong> {oridNotes.decision}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Examiner Question Card */}
      <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-teal-800 shrink-0 mt-1" />
          <div className="flex-1 min-w-0 space-y-3">
            <div className="text-xs font-semibold text-teal-800">
              {t(roundPreset.tierLabelEn, roundPreset.tierLabelZh)}
            </div>
            <p className="text-slate-900 font-semibold text-sm sm:text-lg leading-relaxed break-words">
              {activeQuestion.startsWith('“') ? activeQuestion : `“${activeQuestion}”`}
            </p>

            {activeIntent && (
              <div className="pt-3 border-t border-slate-200/70 flex items-start gap-2 text-xs text-slate-600">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold">
                    {t('Discussion Focus Reference: ', '思考切入点参考：')}
                  </strong>
                  <span>{activeIntent}</span>
                </div>
              </div>
            )}

            {activeTip && (
              <p className="text-xs text-slate-500">
                <strong className="text-slate-700 font-semibold">
                  {t('Practice Tip: ', '表达建议：')}
                </strong>
                {activeTip}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Answer Recorder for Current Round */}
      <div>
        <VoiceRecorder
          key={`followup-round-${currentRound}-${dialogueMode}`}
          onTranscriptReady={handleRoundAnswerReady}
          isLoading={isLoading}
          sampleAnswer={roundPreset.sampleAnswer}
          placeholderText={t(
            'Click the microphone to answer the follow-up question in Chinese. Acknowledge the question first, then expand with real-life examples…',
            '请点击录音回答延伸提问，可先用一句话回应问题，再结合真实生活案例展开分享……'
          )}
          submitButtonText={
            dialogueMode === 'multi_3' && currentRound < 3
              ? t(
                  `Submit Round ${currentRound} & Proceed to Follow-Up ${currentRound + 1}/3`,
                  `提交第 ${currentRound} 轮回答，进入下一轮延伸提问 (${currentRound + 1}/3)`
                )
              : t(
                  'Submit Follow-Up Answer & View Practice Suggestions',
                  '提交回答，查看三项口语练习参考建议'
                )
          }
        />
      </div>

      {/* Skip or Early Finish option */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
        {completedExchanges.length > 0 && (
          <button
            type="button"
            onClick={handleFinishEarlyWithCompleted}
            disabled={isLoading}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 underline cursor-pointer"
          >
            {t(
              `Finish dialogue now (${completedExchanges.length} round(s) answered) & generate full report →`,
              `已完成 ${completedExchanges.length} 轮追问，立即生成完整诊断报告 →`
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onSkipFollowUp}
          disabled={isLoading}
          className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
        >
          {t(
            'Skip follow-up question and generate diagnostic feedback for initial answer only →',
            '暂不回答追问，仅针对首轮回答生成诊断反馈 →'
          )}
        </button>
      </div>
    </div>
  );
};
