import React, { useState, useEffect, useRef } from 'react';
import { OralTopic } from '../types/oral';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  CheckCircle,
  HelpCircle,
  Sparkles,
  MapPin,
} from 'lucide-react';

import {
  playNaturalSpeech,
  preloadTopicNarrations,
  stopAllSpeech,
} from '../utils/naturalSpeech';

interface VideoPlayerSimulatorProps {
  topic: OralTopic;
  onVideoFinished?: () => void;
}

export const VideoPlayerSimulator: React.FC<VideoPlayerSimulatorProps> = ({
  topic,
  onVideoFinished,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [sceneProgress, setSceneProgress] = useState<number>(0); // 0 - 100
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [playCount, setPlayCount] = useState<number>(1); // O-level allows watching twice
  const [sceneAudioMap, setSceneAudioMap] = useState<Record<string, string>>({});
  const [isAudioPreloaded, setIsAudioPreloaded] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextSceneTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopSpeechRef = useRef<(() => void) | null>(null);

  const currentScene = topic.scenes[currentSceneIndex] || topic.scenes[0];

  // Reset player & preload saved narration audio files when topic changes
  useEffect(() => {
    let active = true;
    setIsPlaying(false);
    setCurrentSceneIndex(0);
    setSceneProgress(0);
    setIsAudioPreloaded(false);
    stopAllSpeech();

    preloadTopicNarrations(topic.id).then((map) => {
      if (active) {
        setSceneAudioMap(map);
        setIsAudioPreloaded(true);
      }
    });

    return () => {
      active = false;
      stopAllSpeech();
    };
  }, [topic.id]);

  // Synchronize scene playback with pre-saved narration audio so speech is never cut off
  useEffect(() => {
    let cancelled = false;

    const cleanupTimers = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (nextSceneTimeoutRef.current) {
        clearTimeout(nextSceneTimeoutRef.current);
        nextSceneTimeoutRef.current = null;
      }
      if (stopSpeechRef.current) {
        stopSpeechRef.current();
        stopSpeechRef.current = null;
      }
    };

    if (!isPlaying) {
      cleanupTimers();
      stopAllSpeech();
      return cleanupTimers;
    }

    const advanceToNextSceneOrFinish = () => {
      if (cancelled) return;
      setSceneProgress(100);
      nextSceneTimeoutRef.current = setTimeout(() => {
        if (cancelled) return;
        if (currentSceneIndex < topic.scenes.length - 1) {
          setCurrentSceneIndex((idx) => idx + 1);
          setSceneProgress(0);
        } else {
          setIsPlaying(false);
          stopAllSpeech();
          if (onVideoFinished) onVideoFinished();
        }
      }, 450);
    };

    const narrationText = currentScene?.dialogue || currentScene?.description || '';

    if (isMuted || !narrationText) {
      // Muted mode: steady 6-second visual timer per scene
      intervalRef.current = setInterval(() => {
        setSceneProgress((prev) => {
          if (prev >= 100) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            advanceToNextSceneOrFinish();
            return 100;
          }
          return prev + 1.7;
        });
      }, 100);
    } else {
      // Unmuted mode: audio-driven progression so narration plays completely and identically every time
      let hasRealAudioProgress = false;

      // Fallback smooth visual progress up to 92% while waiting for audio completion
      intervalRef.current = setInterval(() => {
        if (!hasRealAudioProgress) {
          setSceneProgress((prev) => (prev < 92 ? prev + 1.2 : prev));
        }
      }, 100);

      const cacheKey = `${topic.id}_${currentScene.id}`;
      const savedUrl = sceneAudioMap[currentScene.id];

      playNaturalSpeech(narrationText, {
        voiceType: 'narration',
        voiceName: 'Kore',
        cacheKey,
        savedAudioUrl: savedUrl,
        rate: 0.92,
        onProgress: (pct) => {
          if (!cancelled) {
            hasRealAudioProgress = true;
            setSceneProgress(pct);
          }
        },
        onEnd: () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          advanceToNextSceneOrFinish();
        },
        onError: () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          advanceToNextSceneOrFinish();
        },
      }).then((stopFn) => {
        if (cancelled) {
          stopFn();
        } else {
          stopSpeechRef.current = stopFn;
        }
      });
    }

    return () => {
      cancelled = true;
      cleanupTimers();
    };
  }, [isPlaying, currentSceneIndex, isMuted, topic.id]);

  const togglePlay = () => {
    if (!isPlaying && sceneProgress >= 100 && currentSceneIndex === topic.scenes.length - 1) {
      // Replay from start
      setCurrentSceneIndex(0);
      setSceneProgress(0);
      setPlayCount((p) => p + 1);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    stopAllSpeech();
    setCurrentSceneIndex(0);
    setSceneProgress(0);
    setIsPlaying(true);
    setPlayCount((p) => p + 1);
  };

  const selectScene = (index: number) => {
    stopAllSpeech();
    setCurrentSceneIndex(index);
    setSceneProgress(0);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Video Header bar */}
      <div className="bg-gray-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-300">
            SEAB 试卷三 · 录像短片
          </span>
          <span className="text-xs text-gray-400">|</span>
          <h2 className="text-sm font-bold text-gray-100">{topic.videoTitle}</h2>
        </div>

        <div className="flex items-center space-x-2.5 text-xs text-gray-300">
          <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded text-[11px] flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{isAudioPreloaded ? '原声旁白已固定存档' : '原声旁白预加载中…'}</span>
          </span>
          <span className="bg-gray-800 px-2.5 py-1 rounded-md border border-gray-700">
            观摩次数：第 <strong className="text-amber-400">{playCount}</strong> / 2 次
          </span>
          <span className="hidden sm:inline bg-red-950/80 text-red-300 border border-red-800/60 px-2 py-0.5 rounded text-[11px]">
            {topic.level} 会考标准
          </span>
        </div>
      </div>

      {/* Simulated Screen Area */}
      <div className="relative aspect-video max-h-[420px] w-full bg-slate-950 overflow-hidden flex flex-col justify-between select-none">
        {/* Dynamic Background Visual Canvas depicting the scene */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${currentScene.bgGradient} opacity-90 transition-all duration-700 flex items-center justify-center`}
        >
          {/* Subtle animated pattern */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Central Scene Graphic Card */}
          <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-2xl mb-4 transform hover:scale-105 transition-transform">
              <span className="text-4xl">{topic.videoThumbnail}</span>
            </div>
            <div className="inline-block bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white/90 mb-2 border border-white/10">
              {currentScene.timestamp} · {currentScene.title}
            </div>
            <p className="text-base sm:text-lg font-medium text-white drop-shadow-md leading-relaxed">
              {currentScene.description}
            </p>
          </div>
        </div>

        {/* Top Overlay Badge */}
        <div className="relative z-20 p-4 flex justify-between items-start pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg border border-white/10 text-xs flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>新加坡真实生活情境 · {topic.theme}</span>
          </div>

          <button
            onClick={() => setShowSubtitles(!showSubtitles)}
            className="pointer-events-auto bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white/90 text-xs px-2.5 py-1 rounded-md border border-white/10 transition-colors"
          >
            {showSubtitles ? '隐藏字幕' : '显示字幕'}
          </button>
        </div>

        {/* Subtitles Overlay */}
        {showSubtitles && currentScene.dialogue && (
          <div className="relative z-20 px-4 pb-16 text-center">
            <div className="inline-block bg-black/80 backdrop-blur-md text-amber-200 text-sm sm:text-base font-medium px-4 py-2 rounded-xl shadow-lg border border-amber-400/20 max-w-2xl">
              {currentScene.dialogue}
            </div>
          </div>
        )}

        {/* Bottom Controller Bar */}
        <div className="relative z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-6">
          {/* Progress Bar */}
          <div className="w-full bg-white/20 h-1.5 rounded-full mb-3 cursor-pointer overflow-hidden">
            <div
              className="bg-red-500 h-full rounded-full transition-all duration-100 ease-linear"
              style={{
                width: `${((currentSceneIndex * 100 + sceneProgress) / topic.scenes.length)}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? '暂停录像' : '播放录像'}
                className="w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform active:scale-95 shadow"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
              </button>

              <button
                onClick={handleRestart}
                aria-label="从头重新观看"
                className="text-gray-300 hover:text-white p-1 rounded transition-colors"
                title="重新观看"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                aria-label={isMuted ? '开启旁白发音' : '静音'}
                className="text-gray-300 hover:text-white p-1 rounded transition-colors"
                title={isMuted ? '开启声音' : '静音'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <span className="text-gray-300 font-mono">
                分段 {currentSceneIndex + 1} / {topic.scenes.length}
              </span>
            </div>

            {/* Scene Selector Dots */}
            <div className="flex items-center space-x-1.5">
              {topic.scenes.map((sc, i) => (
                <button
                  key={sc.id}
                  onClick={() => selectScene(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentSceneIndex ? 'bg-red-500 w-6' : 'bg-white/40 hover:bg-white/70'
                  }`}
                  title={sc.title}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Observation Guidelines Under the Video */}
      <div className="p-4 bg-amber-50/60 border-t border-amber-100/80">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <Eye className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-amber-900 mb-1 flex items-center">
              <span>考官视听重点导引（O水准备考诀窍）</span>
              <span className="ml-2 text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                必看要点
              </span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-800">
              <div className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>关注短片中正反两组人物行为的对比</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>留心环境背景中的标语牌与政策导向</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>体察年长清洁工/弱势群体的面部神态与动作</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>思考现象背后的心理成因及家庭学校角色</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
