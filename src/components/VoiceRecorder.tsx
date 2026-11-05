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
} from 'lucide-react';

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
  placeholderText = '请点击麦克风开始录音回答，或在下方输入/修改你的口述内容……',
  submitButtonText = '提交给AI考官评分与追问',
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isManualEditing, setIsManualEditing] = useState<boolean>(false);
  const [speechApiSupported, setSpeechApiSupported] = useState<boolean>(true);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechApiSupported(false);
    }
  }, []);

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
              setRecordingError('麦克风权限已被拒绝，您可直接在下方文本框输入或编辑您的回答。');
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
      setRecordingError('无法访问麦克风设备，请在浏览器中允许麦克风权限，或直接在文本框中键入您的回答。');
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
      setRecordingError('回答内容不能为空，请先录音或输入文字。');
      return;
    }
    onTranscriptReady(transcript.trim(), audioUrl, duration > 0 ? duration : 35);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      {/* Control row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={disabled || isLoading}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md shadow-red-200 disabled:opacity-50 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>开始录音答题</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md animate-pulse cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current text-red-400" />
              <span>停止录音</span>
            </button>
          )}

          {/* Timer */}
          <div className="flex items-center space-x-1.5 font-mono text-sm px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span className={isRecording ? 'text-red-600 font-bold' : ''}>{formatTime(duration)}</span>
            <span className="text-gray-400 text-xs">/ 2:00</span>
          </div>

          {/* Audio Playback button if recorded */}
          {audioUrl && !isRecording && (
            <button
              onClick={toggleAudioPlay}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-medium transition-colors"
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlayingAudio ? '暂停回放' : '试听录音'}</span>
            </button>
          )}
        </div>

        {/* Action helper buttons */}
        <div className="flex items-center space-x-2">
          {sampleAnswer && (
            <button
              onClick={handleFillSample}
              disabled={isRecording || isLoading}
              className="flex items-center space-x-1 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
              title="载入考生的典型作答范例，快速体验评估"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>填入典型试答</span>
            </button>
          )}

          {transcript && (
            <button
              onClick={handleReset}
              disabled={isRecording || isLoading}
              className="text-xs text-gray-500 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              title="清空重录"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Recording Animation wave */}
      {isRecording && (
        <div className="py-3 px-4 my-3 bg-red-50/70 border border-red-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-red-800 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span>正在录音与实时中文语音识别中，请清晰口述……</span>
          </div>
          {/* Animated sound wave bars */}
          <div className="flex items-center space-x-1">
            <span className="w-1 h-3 bg-red-500 animate-pulse rounded-full" />
            <span className="w-1 h-5 bg-red-600 animate-pulse delay-75 rounded-full" />
            <span className="w-1 h-4 bg-red-400 animate-pulse delay-150 rounded-full" />
            <span className="w-1 h-6 bg-red-600 animate-pulse delay-100 rounded-full" />
            <span className="w-1 h-3 bg-red-500 animate-pulse delay-200 rounded-full" />
          </div>
        </div>
      )}

      {/* Error alert */}
      {recordingError && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{recordingError}</span>
          </div>
        </div>
      )}

      {/* Transcript Textarea Area */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span className="font-medium flex items-center space-x-1">
            <Edit3 className="w-3.5 h-3.5 text-gray-400" />
            <span>口试回答文稿（录音自动转文字，亦可随时手动润色补充）：</span>
          </span>
          <span>
            字数：<strong className="text-gray-800">{transcript.length}</strong> 字
          </span>
        </div>

        <textarea
          rows={5}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={placeholderText}
          disabled={isLoading}
          className="w-full text-sm sm:text-base leading-relaxed p-3.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all outline-hidden text-gray-800 placeholder:text-gray-400 bg-gray-50/50"
        />
      </div>

      {/* Submit footer */}
      <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-400">
          💡 建议作答时长：1分30秒 ~ 2分钟，围绕“现象描述-原因剖析-个人见闻-多元建议”展开。
        </p>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !transcript.trim() || isRecording}
          className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-red-200 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>考官正在深入分析与出题……</span>
            </>
          ) : (
            <>
              <span>{submitButtonText}</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
