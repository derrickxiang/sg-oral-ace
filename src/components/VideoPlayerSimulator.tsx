import React, { useState, useEffect, useRef } from 'react';
import { OralTopic } from '../types/oral';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Subtitles,
  Film,
  Upload,
  Copy,
  CheckCircle2,
  Sparkles,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import {
  playNaturalSpeech,
  preloadTopicNarrations,
  stopAllSpeech,
} from '../utils/naturalSpeech';
import { useLanguage } from '../context/LanguageContext';

interface VideoPlayerSimulatorProps {
  topic: OralTopic;
  onVideoFinished?: () => void;
}

interface SavedVideoMeta {
  url: string;
  format: string;
  sizeKB: number;
  updatedAt: string;
}

const TOPIC_DOCUMENTARY_IMAGES: Record<string, string> = {
  'topic-hawker-tray': '/src/assets/images/hawker_tray_documentary_1793891855954.jpg',
  'topic-green-campus': '/src/assets/images/green_campus_documentary_1793891858364.jpg',
  'topic-scam-prevention': '/src/assets/images/scam_prevention_documentary_1793891858458.jpg',
  'topic-youth-volunteer': '/src/assets/images/youth_volunteer_documentary_1793891859233.jpg',
  'topic-social-media': '/src/assets/images/social_media_balance_documentary_1793891859222.jpg',
  'topic-ai-learning': '/src/assets/images/ai_learning_documentary_1793932551922.jpg',
  'topic-hdb-neighbour': '/src/assets/images/neighbourliness_hdb_documentary_1793932554527.jpg',
  'topic-cultural-heritage': '/src/assets/images/cultural_heritage_documentary_1793932555645.jpg',
  'topic-campus-wellbeing': '/src/assets/images/campus_wellbeing_documentary_1793932556978.jpg',
  'topic-cashless-seniors': '/src/assets/images/cashless_seniors_documentary_1793932556901.jpg',
  'topic-racial-harmony': '/src/assets/images/racial_harmony_documentary_1793957718637.jpg',
  'topic-hawker-heritage': '/src/assets/images/young_hawker_documentary_1793957718975.jpg',
};

// Multi-angle documentary camera presets per scene index (Establishing -> Medium -> Detail -> Wide Closing)
const SCENE_CAMERA_PRESETS: Array<{
  shotTypeEn: string;
  shotTypeZh: string;
  objectPosition: string;
  filterClass: string;
  kenBurnsClass: string;
}> = [
  {
    shotTypeEn: 'Establishing Wide Shot',
    shotTypeZh: '全景纪实镜头',
    objectPosition: '50% 45%',
    filterClass: 'contrast-105 saturate-105 brightness-95',
    kenBurnsClass: 'animate-kenburns-0',
  },
  {
    shotTypeEn: 'Medium Character Focus',
    shotTypeZh: '人物近景纪实',
    objectPosition: '35% 35%',
    filterClass: 'contrast-108 saturate-110 brightness-100',
    kenBurnsClass: 'animate-kenburns-1',
  },
  {
    shotTypeEn: 'Contextual Detail Shot',
    shotTypeZh: '细节特写镜头',
    objectPosition: '70% 55%',
    filterClass: 'contrast-110 saturate-95 brightness-92',
    kenBurnsClass: 'animate-kenburns-2',
  },
  {
    shotTypeEn: 'Reflective Closing Frame',
    shotTypeZh: '纪实总结定格',
    objectPosition: '50% 50%',
    filterClass: 'contrast-105 saturate-105 brightness-96',
    kenBurnsClass: 'animate-kenburns-3',
  },
];

export const VideoPlayerSimulator: React.FC<VideoPlayerSimulatorProps> = ({
  topic,
  onVideoFinished,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [sceneProgress, setSceneProgress] = useState<number>(0); // 0 - 100
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [playCount, setPlayCount] = useState<number>(1);
  const [sceneAudioMap, setSceneAudioMap] = useState<Record<string, string>>({});
  const [isAudioPreloaded, setIsAudioPreloaded] = useState<boolean>(false);
  const [imgFailed, setImgFailed] = useState<boolean>(false);

  // Google Flow & Permanent Saved Video States
  const [savedVideoMap, setSavedVideoMap] = useState<Record<string, SavedVideoMeta>>({});
  const [useNativeSavedVideo, setUseNativeSavedVideo] = useState<boolean>(false);
  const [useRealSilentClip, setUseRealSilentClip] = useState<boolean>(Boolean(topic.realVideoUrl));
  const [showFlowStudio, setShowFlowStudio] = useState<boolean>(false);
  const [copiedFlowPrompt, setCopiedFlowPrompt] = useState<boolean>(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);
  const [isSynthesizingVideo, setIsSynthesizingVideo] = useState<boolean>(false);
  const [synthesizeProgress, setSynthesizeProgress] = useState<number>(0);
  const [studioStatusMsg, setStudioStatusMsg] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextSceneTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopSpeechRef = useRef<(() => void) | null>(null);
  const nativeVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentScene = topic.scenes[currentSceneIndex] || topic.scenes[0];
  const cameraPreset = SCENE_CAMERA_PRESETS[currentSceneIndex % SCENE_CAMERA_PRESETS.length];
  const documentaryImgSrc =
    TOPIC_DOCUMENTARY_IMAGES[topic.id] || TOPIC_DOCUMENTARY_IMAGES['topic-hawker-tray'];
  const savedVideoForTopic = savedVideoMap[topic.id];

  // Fetch permanently saved topic videos from server
  const fetchSavedVideos = async () => {
    try {
      const res = await fetch('/api/oral/topic-videos');
      if (res.ok) {
        const data = await res.json();
        if (data?.videos) {
          setSavedVideoMap(data.videos);
          if (data.videos[topic.id]) {
            setUseNativeSavedVideo(true);
          }
        }
      }
    } catch {
      // ignore offline
    }
  };

  useEffect(() => {
    fetchSavedVideos();
  }, []);

  // Reset player & preload saved narration audio files when topic changes
  useEffect(() => {
    let active = true;
    setIsPlaying(false);
    setCurrentSceneIndex(0);
    setSceneProgress(0);
    setIsAudioPreloaded(false);
    setImgFailed(false);
    setStudioStatusMsg(null);
    stopAllSpeech();

    setUseNativeSavedVideo(Boolean(savedVideoMap[topic.id]));
    setUseRealSilentClip(Boolean(topic.realVideoUrl));

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
    if ((useNativeSavedVideo && savedVideoForTopic) || useRealSilentClip) {
      return;
    }

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
      let hasRealAudioProgress = false;

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
  }, [isPlaying, currentSceneIndex, isMuted, topic.id, useNativeSavedVideo, savedVideoForTopic]);

  const togglePlay = () => {
    if (useNativeSavedVideo && savedVideoForTopic && nativeVideoRef.current) {
      if (nativeVideoRef.current.paused) {
        nativeVideoRef.current.play();
        setIsPlaying(true);
      } else {
        nativeVideoRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    if (!isPlaying && sceneProgress >= 100 && currentSceneIndex === topic.scenes.length - 1) {
      setCurrentSceneIndex(0);
      setSceneProgress(0);
      setPlayCount((p) => p + 1);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    if (useNativeSavedVideo && savedVideoForTopic && nativeVideoRef.current) {
      nativeVideoRef.current.currentTime = 0;
      nativeVideoRef.current.play();
      setIsPlaying(true);
      setPlayCount((p) => p + 1);
      return;
    }

    stopAllSpeech();
    setCurrentSceneIndex(0);
    setSceneProgress(0);
    setIsPlaying(true);
    setPlayCount((p) => p + 1);
  };

  const selectScene = (index: number) => {
    stopAllSpeech();
    setUseNativeSavedVideo(false);
    setCurrentSceneIndex(index);
    setSceneProgress(0);
  };

  const { t, getTopicDisplay } = useLanguage();
  const topicDisplay = getTopicDisplay(topic);
  const totalProgressPct = (currentSceneIndex * 100 + sceneProgress) / topic.scenes.length;

  // Build Google Flow (Veo) prompt for user's personal Google AI Pro subscription
  const buildGoogleFlowPrompt = (): string => {
    const sceneLines = topic.scenes
      .map(
        (s, i) =>
          `Shot ${i + 1} (${s.timestamp}): ${s.imagePromptDescription}. Context: ${s.description}`
      )
      .join('\n');
    return `Cinematic 16:9 documentary video for Singapore GCE O-Level Chinese Oral Exam: "${topicDisplay.title}" (${topic.title}).
Photorealistic Leica 35mm documentary style, natural tropical daylight in Singapore, authentic local HDB/school/hawker architecture and multiracial Singaporean cast.
${sceneLines}
Smooth camera movement, warm documentary color grading, high detail, 1080p.`;
  };

  const handleCopyFlowPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildGoogleFlowPrompt());
      setCopiedFlowPrompt(true);
      setStudioStatusMsg(
        t(
          'Copied! Open Google Flow (labs.google/fx/tools/flow) with your AI Pro subscription, paste & generate, then upload the .mp4 here.',
          '已复制分镜提示词！请前往 Google Flow (用您的 AI Pro 订阅免费生成)，下载 .mp4 后点击右侧按钮上传即可永久保存。'
        )
      );
      setTimeout(() => setCopiedFlowPrompt(false), 3000);
    } catch {
      setStudioStatusMsg(t('Copy failed, please select text manually.', '复制失败，请手动复制。'));
    }
  };

  const handleUploadFlowVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVideo(true);
    setStudioStatusMsg(
      t('Uploading and saving video permanently to server...', '正在上传并永久保存到服务器 public/videos/ 目录...')
    );

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;
      const res = await fetch('/api/oral/save-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          videoBase64: base64Data,
          mimeType: file.type || 'video/mp4',
          source: 'Google Flow (AI Pro Subscription)',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.videoUrl) {
        throw new Error(data.error || 'Upload failed');
      }

      await fetchSavedVideos();
      setUseNativeSavedVideo(true);
      setStudioStatusMsg(
        t(
          `Saved permanently (${data.format} · ${data.sizeKB} KB)! Every student practicing this topic will now play this saved video.`,
          `已永久保存至服务器 (${data.format} · ${data.sizeKB} KB)！现在每次打开本题都会直接播放该实景视频。`
        )
      );
    } catch (err: any) {
      setStudioStatusMsg(
        t(`Save failed: ${err?.message || 'Unknown error'}`, `保存失败：${err?.message || '请检查文件格式'}`)
      );
    } finally {
      setIsUploadingVideo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Zero-cost local browser Canvas-to-WebM synthesizer + permanent server save
  const handleSynthesizeAndSaveWebm = async () => {
    if (isSynthesizingVideo) return;
    setIsSynthesizingVideo(true);
    setSynthesizeProgress(5);
    setStudioStatusMsg(
      t(
        'Synthesizing 4-scene documentary video (.webm) locally at $0 API cost...',
        '正在本地合成 4 幕纪实短片 (.webm)，无需消耗任何付费 API...'
      )
    );

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      // Load documentary image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load documentary frame'));
        img.src = documentaryImgSrc;
      });

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const stream = canvas.captureStream(24);
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };

      const stoppedPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
      });

      recorder.start(200);

      // Render 4 scenes x 2.2 seconds each (~8.8 seconds total at 24fps) for fast synthesis
      const totalFramesPerScene = 48;
      const cropAnchors = [
        { x: 0.0, y: 0.0, scale: 1.08 },
        { x: -0.06, y: -0.04, scale: 1.16 },
        { x: -0.1, y: -0.07, scale: 1.18 },
        { x: -0.03, y: -0.02, scale: 1.1 },
      ];

      for (let sIdx = 0; sIdx < topic.scenes.length; sIdx++) {
        const scene = topic.scenes[sIdx];
        const anchor = cropAnchors[sIdx % cropAnchors.length];

        for (let f = 0; f < totalFramesPerScene; f++) {
          const pct = f / totalFramesPerScene;
          const zoom = anchor.scale + pct * 0.06;
          const panX = (anchor.x - pct * 0.03) * canvas.width;
          const panY = (anchor.y - pct * 0.02) * canvas.height;

          ctx.fillStyle = '#041f1e';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.save();
          ctx.drawImage(
            img,
            panX,
            panY,
            canvas.width * zoom,
            canvas.height * zoom
          );
          ctx.restore();

          // Top & bottom cinema scrims
          const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          grad.addColorStop(0, 'rgba(4, 31, 30, 0.65)');
          grad.addColorStop(0.25, 'rgba(0, 0, 0, 0.05)');
          grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
          grad.addColorStop(1, 'rgba(4, 31, 30, 0.88)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Top badge
          ctx.fillStyle = 'rgba(11, 59, 60, 0.85)';
          ctx.fillRect(40, 32, 460, 42);
          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText(`ORAL PRACTICE · 0${sIdx + 1}/0${topic.scenes.length} · ${scene.timestamp}`, 56, 59);

          // Scene title & subtitle at bottom
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText(scene.title, 48, canvas.height - 96);

          ctx.fillStyle = '#fde68a';
          ctx.font = '20px sans-serif';
          const dialogueClean = (scene.dialogue || scene.description).slice(0, 54);
          ctx.fillText(dialogueClean, 48, canvas.height - 54);

          await new Promise((r) => setTimeout(r, 25));
        }

        setSynthesizeProgress(Math.round(((sIdx + 1) / topic.scenes.length) * 85));
      }

      recorder.stop();
      const videoBlob = await stoppedPromise;
      setSynthesizeProgress(92);

      // Convert blob to base64 and save to server permanently
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(videoBlob);
      });

      const res = await fetch('/api/oral/save-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          videoBase64: base64Data,
          mimeType: 'video/webm',
          source: 'OralAce Local Documentary Synthesizer',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.videoUrl) {
        throw new Error(data.error || 'Failed to save synthesized video');
      }

      setSynthesizeProgress(100);
      await fetchSavedVideos();
      setUseNativeSavedVideo(true);
      setStudioStatusMsg(
        t(
          `Synthesized & permanently saved to /videos/${topic.id}.webm (${data.sizeKB} KB)!`,
          `已零成本合成并永久保存至服务器 /videos/${topic.id}.webm (${data.sizeKB} KB)！`
        )
      );
    } catch (err: any) {
      setStudioStatusMsg(
        t(`Synthesis error: ${err?.message || 'Failed'}`, `合成失败：${err?.message || '浏览器不支持录制'}`)
      );
    } finally {
      setIsSynthesizingVideo(false);
    }
  };

  return (
    <div className="bg-[#062426] rounded-2xl border border-teal-900/80 overflow-hidden flex flex-col shadow-md">
      {/* Minimal Documentary Header Bar */}
      <div className="px-4 py-3 bg-[#041B1D] border-b border-teal-900/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-emerald-400 font-semibold whitespace-nowrap">
            {t('ORAL PRACTICE', '生活短片练习')}
          </span>
          <span className="text-teal-800" aria-hidden="true">·</span>
          <h2 className="font-semibold text-slate-100 truncate">
            {topicDisplay.videoTitle}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-slate-300 font-mono text-[11px] shrink-0 tabular-nums">
          <button
            type="button"
            data-testid="toggle-real-silent-video-btn"
            onClick={() => {
              stopAllSpeech();
              setIsPlaying(false);
              setUseRealSilentClip(!useRealSilentClip);
            }}
            className={`px-2.5 py-0.5 rounded border transition-colors cursor-pointer font-sans font-bold ${
              useRealSilentClip
                ? 'bg-amber-400/20 text-amber-200 border-amber-400/50'
                : 'bg-teal-900/60 text-teal-200 border-teal-700/70 hover:bg-teal-800/70'
            }`}
          >
            {useRealSilentClip
              ? t('🎬 Silent MP4 Active (Switch to 4-Scene)', '🎬 真实无声短片播放中 (切换分镜)')
              : t('🎬 Play Real Silent Clip (seat-land.mp4)', '🎬 播放真实无声短片 (seat-land.mp4)')}
          </button>
          {savedVideoForTopic && (
            <button
              type="button"
              onClick={() => {
                stopAllSpeech();
                setIsPlaying(false);
                setUseNativeSavedVideo(!useNativeSavedVideo);
              }}
              className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors cursor-pointer"
            >
              {useNativeSavedVideo
                ? t(`Saved ${savedVideoForTopic.format} Active`, `已启用存档 ${savedVideoForTopic.format}`)
                : t('Switch to Saved Video', '切换至存档视频')}
            </button>
          )}
          <span>
            {useRealSilentClip
              ? t('Silent Clip · Observe Actions', '无声短片 · 留意动作与表情')
              : isAudioPreloaded
              ? t('Neural Audio Ready', '原声旁白就绪')
              : t('Loading Audio…', '音频加载中…')}
          </span>
          <span className="text-teal-800" aria-hidden="true">·</span>
          <span>
            {t(`Pass ${playCount}/2`, `第 ${playCount}/2 遍`)}
          </span>
        </div>
      </div>

      {/* 16:9 Cinema Documentary Viewport */}
      <div
        onClick={useRealSilentClip ? undefined : togglePlay}
        className="relative aspect-video w-full bg-[#031517] overflow-hidden select-none cursor-pointer group"
      >
        {useRealSilentClip ? (
          <div className="relative w-full h-full bg-[#0b3b40]">
            <video
              data-testid="real-silent-mp4-player"
              src={topic.realVideoUrl || '/video/seat-land.mp4'}
              controls
              playsInline
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                if (onVideoFinished) onVideoFinished();
              }}
              className="w-full h-full object-cover"
            />
            <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-950/75 border border-teal-500/40 text-[11px] font-bold text-teal-100">
              <span>{t('🎬 Silent Exam Clip (seat-land.mp4)', '🎬 真实无声考试短片 (seat-land.mp4)')}</span>
            </div>
          </div>
        ) : useNativeSavedVideo && savedVideoForTopic ? (
          <video
            ref={nativeVideoRef}
            src={savedVideoForTopic.url}
            muted={isMuted}
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              if (onVideoFinished) onVideoFinished();
            }}
            className="w-full h-full object-cover"
          />
        ) : !imgFailed ? (
          <img
            key={`${topic.id}-${currentSceneIndex}-${isPlaying ? 'play' : 'pause'}`}
            src={documentaryImgSrc}
            alt={currentScene.description}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            style={{ objectPosition: cameraPreset.objectPosition }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${cameraPreset.filterClass} ${
              isPlaying ? cameraPreset.kenBurnsClass : 'scale-105'
            }`}
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${currentScene.bgGradient} opacity-80`}
          />
        )}

        {/* Measured Cinema Contrast Scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

        {/* Top Broadcast Bar: Timecode, Shot Metadata & Subtitle Toggle */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative z-20 px-2.5 sm:px-5 pt-2.5 sm:pt-4 flex items-center justify-between gap-1.5 sm:gap-2"
        >
          <div className="inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-white/95 font-mono tabular-nums bg-black/60 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-white/15 whitespace-nowrap shrink-0">
            <span className="text-emerald-400 font-semibold">
              0{currentSceneIndex + 1}/0{topic.scenes.length}
            </span>
            <span className="text-white/40" aria-hidden="true">·</span>
            <span className="text-white font-semibold">
              {currentScene.timestamp}
            </span>
            <span className="text-white/40 hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-white/85 font-sans hidden sm:inline">
              {useNativeSavedVideo && savedVideoForTopic
                ? t(`Saved ${savedVideoForTopic.format} Clip`, `已保存实景短片 (${savedVideoForTopic.format})`)
                : t(cameraPreset.shotTypeEn, cameraPreset.shotTypeZh)}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowFlowStudio(!showFlowStudio)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium bg-teal-950/85 hover:bg-teal-900 text-emerald-300 border border-emerald-500/35 backdrop-blur-md transition-colors cursor-pointer whitespace-nowrap"
            >
              <Film className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t('Google Flow Video Studio', 'Google Flow 视频工坊')}</span>
              <span className="sm:hidden">{t('Flow', '工坊')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium backdrop-blur-md border transition-colors cursor-pointer whitespace-nowrap ${
                showSubtitles
                  ? 'bg-black/65 text-white border-white/25'
                  : 'bg-black/45 text-white/70 border-white/10 hover:text-white'
              }`}
            >
              <Subtitles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden sm:inline">
                {showSubtitles ? t('Subtitles On', '字幕已开') : t('Subtitles Off', '字幕已关')}
              </span>
              <span className="sm:hidden">
                {showSubtitles ? t('CC', '字幕') : t('Off', '关')}
              </span>
            </button>
          </div>
        </div>

        {/* Center Play Overlay Button when Paused */}
        {!isPlaying && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label={t('Play Documentary Clip', '播放纪实短片')}
              className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-[#062426]/90 hover:bg-emerald-600 text-white border border-emerald-400/30 shadow-2xl backdrop-blur-md transition-all duration-150 transform hover:scale-105 cursor-pointer"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold tracking-tight pr-1 whitespace-nowrap">
                {sceneProgress > 0 && sceneProgress < 100
                  ? t('Resume Video Clip', '继续播放短片')
                  : t('Play Oral Exam Video', '播放会考录像短片')}
              </span>
            </button>
          </div>
        )}

        {/* Clean Broadcast Subtitle Track Anchored at Bottom of Frame */}
        {showSubtitles && currentScene.dialogue && (
          <div className="absolute inset-x-0 bottom-2.5 sm:bottom-4 z-20 px-3 sm:px-6 text-center pointer-events-none">
            <div className="inline-block bg-black/80 backdrop-blur-md text-amber-100 text-[11px] sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-white/15 leading-relaxed max-w-2xl shadow-lg">
              {currentScene.dialogue}
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Dark Studio Deck Below Video */}
      <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-[#041B1D] border-t border-teal-900/70 space-y-3.5">
        {/* Current Scene Narrative Synopsis */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div className="text-xs font-semibold text-white">
            {currentScene.title}
          </div>
          <p className="text-xs text-slate-300 line-clamp-1 sm:max-w-xl">
            {currentScene.description}
          </p>
        </div>

        {/* 4-Chapter Segmented Scrubber */}
        <div className="grid grid-cols-4 gap-2">
          {topic.scenes.map((sc, idx) => {
            const segPct =
              idx < currentSceneIndex
                ? 100
                : idx === currentSceneIndex
                ? sceneProgress
                : 0;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => selectScene(idx)}
                aria-label={sc.title}
                className="group/seg text-left focus-visible:outline-none cursor-pointer"
              >
                <div className="h-1.5 w-full bg-teal-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
                    style={{ width: `${segPct}%` }}
                  />
                </div>
                <span
                  className={`mt-1.5 block text-[11px] truncate transition-colors ${
                    idx === currentSceneIndex
                      ? 'text-white font-semibold'
                      : 'text-slate-400 group-hover/seg:text-slate-200'
                  }`}
                >
                  0{idx + 1}. {sc.title.replace(/^场景[一二三四]：/, '')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Transport Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-teal-900/60 text-xs text-white">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? t('Pause Video', '暂停录像') : t('Play Video', '播放录像')}
              className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              aria-label={t('Restart from Beginning', '从头重新观看')}
              className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title={t('Restart Video', '重新观看')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? t('Unmute Narration', '开启旁白发音') : t('Mute', '静音')}
              className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title={isMuted ? t('Unmute', '开启声音') : t('Mute', '静音')}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <span className="font-mono text-slate-300 tabular-nums whitespace-nowrap">
              {Math.round(totalProgressPct)}% · {t(`Scene ${currentSceneIndex + 1}/${topic.scenes.length}`, `片段 ${currentSceneIndex + 1}/${topic.scenes.length}`)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowFlowStudio(!showFlowStudio)}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 hover:text-emerald-200 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>
              {t(
                'Use Google AI Pro (Flow) — No Paid API Needed',
                '用您的 Google AI Pro (Flow) 免费生成并保存视频'
              )}
            </span>
            {showFlowStudio ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
          </button>
        </div>

        {/* Collapsible Google Flow (AI Pro Subscription) & Permanent Local Video Saver Studio */}
        {showFlowStudio && (
          <div className="mt-3 pt-3.5 border-t border-teal-800/70 bg-[#072B2E] rounded-xl p-4 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-emerald-300 flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  <span>
                    {t(
                      'Google Flow (AI Pro Subscription) Video Studio & Permanent Server Archive',
                      'Google Flow (AI Pro 个人订阅直通车) · 免买 API 永久保存视频'
                    )}
                  </span>
                </h3>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  {t(
                    'Why did it ask for a paid API earlier? Google One AI Pro is a consumer web subscription (for Google Flow & Gemini web) and does not issue server API keys. With this studio, you DO NOT need to buy an API—use your AI Pro subscription on Google Flow or our 1-click zero-cost synthesizer and save the .mp4/.webm permanently!',
                    '为什么之前会弹窗要求购买 API？因为 Google AI Pro 属于个人网页版订阅（包含 Google Flow 网页工具），不提供后台代码调用密钥。现在您完全不需要额外买 API！直接复制下方分镜去 Google Flow 免费生成，再上传 .mp4 即可永久保存在本服务器！'
                  )}
                </p>
              </div>
              {savedVideoForTopic && (
                <a
                  href={savedVideoForTopic.url}
                  download={`${topic.id}.${savedVideoForTopic.format.toLowerCase()}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-500/30 font-medium shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {t(
                      `Download Saved ${savedVideoForTopic.format} (${savedVideoForTopic.sizeKB}KB)`,
                      `下载已存视频 (${savedVideoForTopic.format})`
                    )}
                  </span>
                </a>
              )}
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* Step 1: Copy Google Flow Prompt & Open Flow */}
              <div className="bg-[#041B1D] border border-teal-800/80 rounded-lg p-3 flex flex-col justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-emerald-400">
                    {t('Method A · Step 1 (Google AI Pro)', '方式 A · 第 1 步 (使用您的 AI Pro 订阅)')}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {t(
                      'Copy the 4-shot Singapore documentary prompt for this topic and paste it into Google Flow.',
                      '一键复制本题的新加坡实景 4 镜头英文提示词，粘贴到您的 Google Flow 免费生成。'
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyFlowPrompt}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-teal-800 hover:bg-teal-700 text-white font-semibold transition-colors cursor-pointer"
                  >
                    {copiedFlowPrompt ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{t('Copied Prompt!', '已复制提示词！')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t('Copy Flow Prompt', '复制 Google Flow 提示词')}</span>
                      </>
                    )}
                  </button>
                  <a
                    href="https://labs.google/fx/tools/flow"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open Google Flow"
                    className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-teal-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Step 2: Upload Google Flow .mp4 to save permanently */}
              <div className="bg-[#041B1D] border border-teal-800/80 rounded-lg p-3 flex flex-col justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-emerald-400">
                    {t('Method A · Step 2 (Permanent Server Save)', '方式 A · 第 2 步 (上传 .mp4 永久保存)')}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {t(
                      'Upload the .mp4 file downloaded from Google Flow. It is saved permanently in /public/videos/.',
                      '将 Google Flow 生成下载的 .mp4 上传，系统将永久保存至服务器，所有学生打开即播。'
                    )}
                  </p>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleUploadFlowVideoFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingVideo}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {isUploadingVideo
                        ? t('Saving to Server...', '正在保存至服务器...')
                        : t('Upload Flow .mp4 & Save', '上传 Google Flow 视频并永久保存')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Method B: 1-Click Zero-Cost Local Video Synthesizer */}
              <div className="bg-[#041B1D] border border-teal-800/80 rounded-lg p-3 flex flex-col justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-amber-300">
                    {t('Method B · 1-Click Instant Video (.webm)', '方式 B · 免 API 一键合成并永久保存')}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {t(
                      'Synthesize a 720p documentary video with Ken Burns camera motion & subtitles right in your browser ($0 cost).',
                      '直接用内置纪实镜头合成带运镜与华文字幕的 .webm 视频文件，并永久保存到服务器。'
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSynthesizingVideo}
                  onClick={handleSynthesizeAndSaveWebm}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isSynthesizingVideo
                      ? t(`Synthesizing (${synthesizeProgress}%)...`, `正在合成视频 (${synthesizeProgress}%)...`)
                      : t('1-Click Synthesize & Save Video', '一键合成并永久保存短片')}
                  </span>
                </button>
              </div>
            </div>

            {studioStatusMsg && (
              <div className="px-3 py-2 rounded-lg bg-teal-950/90 border border-emerald-500/30 text-emerald-200 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{studioStatusMsg}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
