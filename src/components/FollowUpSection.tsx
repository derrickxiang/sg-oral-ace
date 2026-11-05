import React, { useState } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import {
  HelpCircle,
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  UserCheck,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

import { playNaturalSpeech, stopNaturalSpeech } from '../utils/naturalSpeech';

interface FollowUpSectionProps {
  followUpQuestion: string;
  rationaleForQuestion?: string;
  examinerToneAdvice?: string;
  onFollowUpAnswerSubmit: (transcript: string, audioUrl: string | null, duration: number) => void;
  onSkipFollowUp: () => void;
  isLoading: boolean;
}

export const FollowUpSection: React.FC<FollowUpSectionProps> = ({
  followUpQuestion,
  rationaleForQuestion,
  examinerToneAdvice,
  onFollowUpAnswerSubmit,
  onSkipFollowUp,
  isLoading,
}) => {
  const [isPlayingTTS, setIsPlayingTTS] = useState<boolean>(false);

  // Play examiner voice with realistic neural voice
  const playExaminerVoice = async () => {
    if (isPlayingTTS) {
      stopNaturalSpeech();
      setIsPlayingTTS(false);
      return;
    }

    setIsPlayingTTS(true);
    await playNaturalSpeech(followUpQuestion, {
      voiceType: 'examiner',
      voiceName: 'Puck', // Standard neutral/authoritative examiner
      rate: 0.92,
      onStart: () => setIsPlayingTTS(true),
      onEnd: () => setIsPlayingTTS(false),
      onError: () => setIsPlayingTTS(false),
    });
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50/70 via-white to-white rounded-2xl border-2 border-indigo-200 shadow-md p-5 sm:p-7 relative overflow-hidden">
      {/* Background seal */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-100/50 pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
              陈
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-gray-900 text-base">考官现场深度追问</h3>
              <span className="bg-indigo-100 text-indigo-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                O水准会话互动 (SEAB Paper 3)
              </span>
            </div>
            <p className="text-xs text-gray-500">主考官根据你刚才的回答漏洞或亮点进行针对性追问</p>
          </div>
        </div>

        {/* Read voice button */}
        <button
          onClick={playExaminerVoice}
          className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-xs"
        >
          {isPlayingTTS ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
          <span>{isPlayingTTS ? '停止考官朗读' : '聆听考官提问语音'}</span>
        </button>
      </div>

      {/* Examiner Speech Bubble */}
      <div className="bg-white rounded-xl border border-indigo-100 p-4 sm:p-5 shadow-xs mb-4">
        <div className="flex items-start space-x-3">
          <MessageSquare className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-gray-900 font-semibold text-base sm:text-lg leading-relaxed">
              “{followUpQuestion}”
            </p>

            {rationaleForQuestion && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-start space-x-2 text-xs text-indigo-900/80 bg-indigo-50/50 p-2.5 rounded-lg">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-indigo-950 font-bold">考查意图：</strong>
                  <span>{rationaleForQuestion}</span>
                </div>
              </div>
            )}

            {examinerToneAdvice && (
              <p className="mt-2 text-xs text-gray-500 italic">
                💡 应对技巧：{examinerToneAdvice}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Answer Recorder for Follow-up */}
      <div className="mt-4">
        <VoiceRecorder
          onTranscriptReady={onFollowUpAnswerSubmit}
          isLoading={isLoading}
          sampleAnswer="回答考官：我认为在现实生活中，提高罚款确实能起到立竿见影的威慑效果，但单靠惩罚无法形成发自内心的自觉习惯。以我们学校为例，食堂并没有设置罚款，而是通过‘环保之星’评选让学生体会收拾餐盘的自豪感。因此，我认为应德法兼施，对故意破坏者依法处罚，对广大民众与青少年则以荣誉激励和品德熏陶为主。"
          placeholderText="请点击录音回答考官的追问，可先用一句话承接考官的提问，再结合真实生活案例展开论证……"
          submitButtonText="提交追问回答，生成全套三项反馈报告"
        />
      </div>

      {/* Skip option */}
      <div className="mt-3 text-center">
        <button
          onClick={onSkipFollowUp}
          disabled={isLoading}
          className="text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer"
        >
          暂不回答追问，仅针对首轮回答生成诊断反馈 →
        </button>
      </div>
    </div>
  );
};
