// Natural Speech Utility for Singapore O-Level Oral Examiner & Video Narration
// Priority 1: High-fidelity natural AI audio from server-side Gemini TTS (gemini-3.8-flash-lite-tts)
// Priority 2: High-quality Neural/Natural Chinese Voice from browser SpeechSynthesis

let currentAudioElement: HTMLAudioElement | null = null;

// Find best natural Chinese voice available in the browser
export function getBestChineseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Filter Chinese voices (zh-CN, zh-SG, zh-TW, zh-HK)
  const chineseVoices = voices.filter(
    (v) =>
      v.lang.startsWith('zh') ||
      v.lang.includes('CN') ||
      v.lang.includes('SG') ||
      v.name.includes('Chinese') ||
      v.name.includes('Mandarin')
  );

  if (chineseVoices.length === 0) return null;

  // Prioritize modern natural/neural voices
  const naturalKeywords = [
    'natural',
    'online',
    'xiaoxiao',
    'yunxi',
    'yunjian',
    'xiaoyi',
    'tingting',
    'sinji',
    'google 普通话',
    'google 國語',
    'premium',
    'neural',
  ];

  for (const kw of naturalKeywords) {
    const match = chineseVoices.find((v) => v.name.toLowerCase().includes(kw));
    if (match) return match;
  }

  // Fallback to mainland/Singapore Chinese
  const mainlandOrSG = chineseVoices.find(
    (v) => v.lang === 'zh-CN' || v.lang === 'zh-SG' || v.lang.replace('_', '-') === 'zh-CN'
  );

  return mainlandOrSG || chineseVoices[0];
}

// Clean dialogue / caption brackets for natural read-aloud
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/【.*?】/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/（.*?）/g, '')
    .replace(/\(.*?\)/g, '')
    .trim();
}

export interface PlaySpeechOptions {
  voiceType?: 'examiner' | 'narration';
  voiceName?: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  cacheKey?: string;
  savedAudioUrl?: string;
  rate?: number; // 0.85 - 1.0 for measured natural cadence
  pitch?: number;
  onStart?: () => void;
  onProgress?: (percent: number) => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

// Client-side memory cache mapping cacheKey or text -> resolved static audio URL
const clientAudioUrlCache = new Map<string, string>();

export async function preloadTopicNarrations(topicId: string): Promise<Record<string, string>> {
  try {
    const res = await fetch(`/api/oral/topic-narrations/${encodeURIComponent(topicId)}`);
    if (res.ok) {
      const data = await res.json();
      const map: Record<string, string> = data.sceneAudioMap || {};
      Object.entries(map).forEach(([sceneId, url]) => {
        clientAudioUrlCache.set(`${topicId}_${sceneId}`, url);
        // Warm browser HTTP cache for instant zero-latency playback
        const preloadAudio = new Audio();
        preloadAudio.preload = 'auto';
        preloadAudio.src = url;
      });
      return map;
    }
  } catch (e) {
    console.warn('Preload topic narrations warning:', e);
  }
  return {};
}

export async function playNaturalSpeech(
  rawText: string,
  options: PlaySpeechOptions = {}
): Promise<() => void> {
  const {
    voiceType = 'examiner',
    voiceName = voiceType === 'examiner' ? 'Puck' : 'Kore',
    cacheKey,
    savedAudioUrl,
    rate = 0.92,
    pitch = 1.0,
    onStart,
    onProgress,
    onEnd,
    onError,
  } = options;

  const textToSpeak = cleanTextForSpeech(rawText);
  if (!textToSpeak) return () => {};

  // Stop any ongoing audio or speech synthesis
  stopAllSpeech();

  let isCancelled = false;
  let hasEnded = false;
  const finish = () => {
    if (!hasEnded) {
      hasEnded = true;
      if (onEnd && !isCancelled) onEnd();
    }
  };

  const memoryKey = cacheKey || `${voiceName}:${textToSpeak}`;
  let resolvedAudioUrl = savedAudioUrl || clientAudioUrlCache.get(memoryKey) || null;

  // Try 1: Resolve or fetch saved audio file from server
  if (!resolvedAudioUrl) {
    try {
      const res = await fetch('/api/oral/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          voiceType,
          voiceName,
          cacheKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          resolvedAudioUrl = data.audioUrl;
          clientAudioUrlCache.set(memoryKey, data.audioUrl);
        } else if (data.audioBase64) {
          resolvedAudioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
          clientAudioUrlCache.set(memoryKey, resolvedAudioUrl);
        }
      }
    } catch (err) {
      console.warn('Server TTS fetch unavailable, falling back to browser voice:', err);
    }
  }

  if (isCancelled) {
    return () => {};
  }

  if (resolvedAudioUrl) {
    try {
      const audio = new Audio(resolvedAudioUrl);
      audio.preload = 'auto';
      currentAudioElement = audio;

      audio.onplay = () => {
        if (!isCancelled && onStart) onStart();
      };

      audio.ontimeupdate = () => {
        if (!isCancelled && onProgress && audio.duration && isFinite(audio.duration) && audio.duration > 0) {
          const pct = Math.min(100, Math.round((audio.currentTime / audio.duration) * 100));
          onProgress(pct);
        }
      };

      audio.onended = () => {
        if (currentAudioElement === audio) {
          currentAudioElement = null;
        }
        if (!isCancelled && onProgress) onProgress(100);
        finish();
      };

      audio.onerror = (e) => {
        console.warn('Saved audio playback error, falling back to neural browser voice:', e);
        if (currentAudioElement === audio) {
          currentAudioElement = null;
        }
        if (!isCancelled) {
          playBrowserSpeech(textToSpeak, rate, pitch, onStart, finish, onError);
        }
      };

      await audio.play();
      return () => {
        isCancelled = true;
        audio.pause();
        audio.currentTime = 0;
        if (currentAudioElement === audio) {
          currentAudioElement = null;
        }
      };
    } catch (playErr) {
      console.warn('Audio element play() rejected or failed, using fallback:', playErr);
    }
  }

  if (isCancelled) {
    return () => {};
  }

  // Try 2: Browser Web Speech with Natural Voice selection
  playBrowserSpeech(textToSpeak, rate, pitch, onStart, finish, onError);

  return () => {
    isCancelled = true;
    stopAllSpeech();
  };
}

function playBrowserSpeech(
  text: string,
  rate: number,
  pitch: number,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();

  // Natural pause preprocessing: add slight spacing for commas to sound less mechanical
  const naturalText = text
    .replace(/，/g, '， ')
    .replace(/。/g, '。  ')
    .replace(/？/g, '？  ')
    .replace(/！/g, '！  ');

  const utterance = new SpeechSynthesisUtterance(naturalText);
  utterance.lang = 'zh-CN';
  utterance.rate = rate; // 0.92 gives natural measured articulation
  utterance.pitch = pitch;

  const bestVoice = getBestChineseVoice();
  if (bestVoice) {
    utterance.voice = bestVoice;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
    if (onError) onError(e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopAllSpeech() {
  if (typeof window !== 'undefined') {
    if (currentAudioElement) {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
      currentAudioElement = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

// Convenient alias for components
export const stopNaturalSpeech = stopAllSpeech;

