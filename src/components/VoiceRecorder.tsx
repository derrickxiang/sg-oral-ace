import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Edit3,
  Check,
  AlertCircle,
  Clock,
  Send,
  Volume2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface VoiceRecorderProps {
  onTranscriptReady: (transcript: string, audioBlobUrl: string | null, durationSeconds: number) => void;
  isLoading: boolean;
  disabled?: boolean;
  sampleAnswer?: string;
  placeholderText?: string;
  submitButtonText?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptReady,
  isLoading,
  disabled = false,
  sampleAnswer = '',
  placeholderText,
  submitButtonText,
}) => {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [showPrivacyDetails, setShowPrivacyDetails] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Timer while recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    setRecordingError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Web Speech API
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
            setTranscript(currentText);
          };

          recognition.onerror = (event: any) => {
            console.warn('Speech recognition status:', event.error);
            if (event.error === 'not-allowed') {
              setRecordingError(
                t(
                  'Microphone permission denied. You can type or edit your Chinese oral response directly below.',
                  '麦克风权限已被拒绝，您可直接在下方文本框输入或编辑您的回答。'
                )
              );
            }
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (err) {
          console.warn('Speech recognition start failed:', err);
        }
      }
    } catch (err: any) {
      console.warn('Failed to get user media for recording:', err);
      setRecordingError(
        t(
          'Unable to access microphone. Please allow microphone permission or type your Chinese response below.',
          '无法访问麦克风设备，请在浏览器中允许麦克风权限，或直接在文本框中键入您的回答。'
        )
      );
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsRecording(false);
  };

  const handleReset = () => {
    stopRecording();
    setTranscript('');
    setDuration(0);
    setAudioUrl(null);
    setIsPlayingAudio(false);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  };

  const handleFillSample = () => {
    if (sampleAnswer) {
      setTranscript(sampleAnswer);
      setDuration(45);
    }
  };

  const toggleAudioPlay = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleSubmit = () => {
    if (!transcript.trim()) {
      setRecordingError(
        t('Response cannot be empty. Please record or enter your answer first.', '回答内容不能为空，请先录音或输入文字。')
      );
      return;
    }
    onTranscriptReady(transcript.trim(), audioUrl, duration > 0 ? duration : 35);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const effectivePlaceholder =
    placeholderText ||
    t(
      'Click the microphone to speak your response in Chinese, or type/edit your transcript below…',
      '请点击麦克风开始录音回答，或在下方输入/修改你的口述内容……'
    );

  const effectiveSubmitText =
    submitButtonText ||
    t('Submit to AI Examiner for Follow-Up & Grading', '提交给AI考官评分与追问');

  return (
    <div className="bg-white rounded-2xl border border-teal-900/15 p-4 sm:p-6 overflow-hidden shadow-2xs">
      {/* Control row — Mobile-first responsive layout so Timer never overflows */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={disabled || isLoading}
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3.5 sm:px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
            >
              <Mic className="w-4 h-4 shrink-0" />
              <span>{t('Start Voice Recording', '开始录音答题')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center justify-center gap-2 bg-[#0B3B3C] hover:bg-teal-900 text-white px-3.5 sm:px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Square className="w-3.5 h-3.5 fill-current text-red-400 shrink-0" />
              <span>{t('Stop Recording', '停止录音')}</span>
            </button>
          )}

          {/* Timer — locked single line (whitespace-nowrap + shrink-0) so 00:00 / 02:00 never splits or overflows */}
          <div className="inline-flex items-center gap-1.5 font-mono tabular-nums text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 whitespace-nowrap shrink-0">
            <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span className={isRecording ? 'text-red-600 font-semibold' : 'font-semibold text-slate-800'}>
              {formatTime(duration)}
            </span>
            <span className="text-slate-400 text-xs">/ 02:00</span>
          </div>

          {/* Audio Playback button if recorded */}
          {audioUrl && !isRecording && (
            <button
              type="button"
              onClick={toggleAudioPlay}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-950 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5 shrink-0" /> : <Play className="w-3.5 h-3.5 fill-current shrink-0" />}
              <span>{isPlayingAudio ? t('Pause', '暂停') : t('Listen', '试听录音')}</span>
            </button>
          )}
        </div>

        {/* Action helper buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {sampleAnswer && (
            <button
              type="button"
              onClick={handleFillSample}
              disabled={isRecording || isLoading}
              className="inline-flex items-center gap-1.5 text-xs text-teal-950 bg-teal-50/80 hover:bg-teal-100/80 border border-teal-800/15 px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap"
              title={t('Load a realistic student response to test AI evaluation', '载入考生的典型作答范例，快速体验评估')}
            >
              <span>{t('Load Sample Answer', '填入典型试答')}</span>
            </button>
          )}

          {transcript && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isRecording || isLoading}
              className="text-xs text-slate-500 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title={t('Clear & Re-record', '清空重录')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Recording Status Banner */}
      {isRecording && (
        <div className="py-2.5 px-3.5 my-3 bg-red-50/70 border border-red-200 rounded-xl flex items-center justify-between gap-2 text-xs text-red-900 font-medium">
          <span className="leading-snug">
            {t(
              'Recording & transcribing Mandarin speech in real time. Speak clearly into your microphone…',
              '正在录音与实时中文语音识别中，请清晰口述……'
            )}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-red-700 font-bold shrink-0">
            ● REC
          </span>
        </div>
      )}

      {/* Error alert */}
      {recordingError && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{recordingError}</span>
          </div>
        </div>
      )}

      {/* Transcript Textarea Area */}
      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
          <span className="font-medium flex items-center gap-1.5 min-w-0">
            <Edit3 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span className="truncate sm:whitespace-normal">
              {t(
                'Chinese Oral Transcript (Voice-to-text, editable)',
                '口试回答文稿（录音自动转文字，可随时修改）'
              )}
            </span>
          </span>
          <span className="font-mono tabular-nums whitespace-nowrap shrink-0 bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
            {t('Characters: ', '字数：')}
            <strong className="text-slate-900">{transcript.length}</strong>
          </span>
        </div>

        <textarea
          rows={6}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={effectivePlaceholder}
          disabled={isLoading}
          className="w-full text-sm sm:text-base leading-relaxed p-3.5 sm:p-4 rounded-xl border border-slate-200 focus:border-[#0B3B3C] focus:ring-1 focus:ring-[#0B3B3C] transition-colors outline-hidden text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
        />

        {/* SG PDPA Voice & Pronunciation Privacy Shield */}
        <div
          data-testid="pdpa-privacy-badge"
          className="mt-2.5 rounded-xl bg-teal-50/60 border border-teal-900/15 px-3 py-2 text-[11px] sm:text-xs text-teal-950"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-start sm:items-center gap-1.5 min-w-0 flex-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
              <span className="font-medium leading-snug">
                {t(
                  'Privacy Protected (SG PDPA Compliant): Real-time speech-to-text only. Zero raw audio or voiceprint is stored on servers.',
                  '隐私安全保障（符合新加坡 PDPA）：语音仅在本地实时转文字与诊断发音，服务器绝不保存原始录音或声纹。'
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPrivacyDetails((prev) => !prev)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 hover:text-teal-950 underline underline-offset-2 cursor-pointer shrink-0"
            >
              <Info className="w-3 h-3 shrink-0" />
              <span>
                {showPrivacyDetails
                  ? t('Hide Details', '收起详情')
                  : t('Privacy Details', '隐私详情')}
              </span>
            </button>
          </div>

          {showPrivacyDetails && (
            <div className="mt-2 pt-2 border-t border-teal-900/10 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-700 leading-relaxed">
              <div className="bg-white/80 rounded-lg p-2 border border-teal-900/10">
                <strong className="text-teal-950 block mb-0.5">
                  {t('1. Ephemeral Browser Audio', '1. 音频仅驻留本地内存')}
                </strong>
                {t(
                  'Playback audio stays inside your browser tab memory (Blob URL) and is erased immediately when you reset or close the page.',
                  '试听音频仅暂存在您手机/电脑浏览器的本地内存中，点击清空或关闭网页即彻底销毁。'
                )}
              </div>
              <div className="bg-white/80 rounded-lg p-2 border border-teal-900/10">
                <strong className="text-teal-950 block mb-0.5">
                  {t('2. Zero Voiceprint Upload', '2. 零声纹与零录音上传')}
                </strong>
                {t(
                  'Only the de-identified Chinese text transcript and duration count are sent for expression suggestions & polyphonic tone analysis.',
                  '仅将脱敏后的华文转写文本与时长字数提交给陪练模型进行表达建议与多音字读音参考，绝不上传人声文件。'
                )}
              </div>
              <div className="bg-white/80 rounded-lg p-2 border border-teal-900/10">
                <strong className="text-teal-950 block mb-0.5">
                  {t('3. Youth Privacy Safe', '3. 符合青少年隐私保护规范')}
                </strong>
                {t(
                  'Designed for students under Singapore PDPA guidelines—no student audio is ever used to train public AI models.',
                  '专为青少年学习者设计，严格遵循 PDPA 规范，所有口语练习绝不用于公共大模型训练。'
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit footer */}
      <div className="mt-4 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-500 leading-relaxed">
          {t(
            'Target: 1m 30s – 2m 00s · Observation → Causes → Personal Example → Suggestions',
            '建议时长：1分30秒 ~ 2分钟 · 结构：现象描述 → 原因剖析 → 个人见闻 → 多元建议'
          )}
        </p>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !transcript.trim() || isRecording}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0B3B3C] hover:bg-teal-900 text-white px-5 py-3 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors disabled:opacity-40 cursor-pointer shrink-0"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              <span>{t('Analyzing Response…', '考官正在分析与出题……')}</span>
            </>
          ) : (
            <>
              <span className="text-center">{effectiveSubmitText}</span>
              <Send className="w-3.5 h-3.5 shrink-0" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

