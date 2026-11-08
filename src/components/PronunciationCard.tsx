import React, { useState, useMemo } from 'react';
import { PronunciationIssue, AcousticGopFluencyTelemetry } from '../types/oral';
import {
  Volume2,
  VolumeX,
  AlertCircle,
  BookmarkPlus,
  Check,
  Headphones,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

import { playNaturalSpeech, stopNaturalSpeech } from '../utils/naturalSpeech';
import { computeOnDeviceAcousticGopTelemetry } from '../utils/seabRubric';
import { useLanguage } from '../context/LanguageContext';
import { AcousticGopTelemetryCard } from './AcousticGopTelemetryCard';

interface PronunciationCardProps {
  issues: PronunciationIssue[];
  onSaveToNotebook?: (issue: PronunciationIssue) => void;
  savedWords?: string[];
  transcript?: string;
  durationSeconds?: number;
  acousticTelemetry?: AcousticGopFluencyTelemetry;
}

export const PronunciationCard: React.FC<PronunciationCardProps> = ({
  issues,
  onSaveToNotebook,
  savedWords = [],
  transcript,
  durationSeconds = 42,
  acousticTelemetry,
}) => {
  const { t } = useLanguage();
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  const effectiveTelemetry = useMemo(() => {
    if (acousticTelemetry) return acousticTelemetry;
    const sampleText =
      transcript ||
      issues.map((i) => i.word).join('，') ||
      '在新加坡日常生活中，每个乘客都扮演着重要角色，我们要提供帮助，减少塑料垃圾，潜移默化地体谅长辈。';
    return computeOnDeviceAcousticGopTelemetry(sampleText, durationSeconds);
  }, [acousticTelemetry, transcript, issues, durationSeconds]);

  // Play standard pronunciation with natural speech
  const playStandardAudio = async (word: string) => {
    if (playingWord === word) {
      stopNaturalSpeech();
      setPlayingWord(null);
      return;
    }

    setPlayingWord(word);
    await playNaturalSpeech(word, {
      voiceType: 'examiner',
      voiceName: 'Puck',
      rate: 0.85, // Deliberate and crystal clear for phonetic study
      onStart: () => setPlayingWord(word),
      onEnd: () => setPlayingWord(null),
      onError: () => setPlayingWord(null),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm shrink-0">
            {t('Tone', '音')}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">
              {t('Pronunciation & Tone Reference Tips', '多音字与声调读音参考建议')}
            </h3>
            <p className="text-xs text-gray-500">
              {t(
                'Highlights common polyphonic characters and Mandarin tone reminders for everyday practice',
                '提示回答中出现的常见多音字与声调读法，供日常练习参考'
              )}
            </p>
          </div>
        </div>

        <span className="text-xs bg-rose-50 text-rose-700 font-semibold px-2.5 py-1 rounded-full border border-rose-200">
          {t(`${issues.length} Phonetic Items Found`, `发现 ${issues.length} 处需纠偏词汇`)}
        </span>
      </div>

      {/* SG PDPA Pronunciation Privacy Assurance Bar */}
      <div className="mb-4 flex items-start sm:items-center gap-2 rounded-xl bg-teal-50/70 border border-teal-900/15 px-3 py-2 text-[11px] sm:text-xs text-teal-950">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
        <span>
          {t(
            'SG PDPA Privacy Protected: Phonetic & tone diagnostics are analyzed from local speech-to-text transcripts only. Zero voice recordings or biometric voiceprints are stored.',
            '新加坡 PDPA 隐私保护：发音与声调纠偏仅基于本地语音转写文稿分析，服务器绝不收集或存储您的原始录音与生物声纹。'
          )}
        </span>
      </div>

      {issues.length === 0 ? (
        <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl">
          <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">
            {t('No polyphonic or tone errors detected in this response!', '本次回答中未检测到明显多音字读音偏差！')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t('Clear articulation and accurate tones — keep it up!', '发音吐字清晰，声调控制良好，请继续保持！')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {issues.map((item, index) => {
            const isSaved = savedWords.includes(item.word);
            return (
              <div
                key={index}
                className="bg-rose-50/40 border border-rose-200/80 rounded-xl p-4 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-black text-gray-900 tracking-wide">
                      {item.word}
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                      {item.pinyin}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Audio Play button */}
                    <button
                      onClick={() => playStandardAudio(item.word)}
                      aria-label={t(`Listen to ${item.word} standard pronunciation`, `聆听 ${item.word} 标准读音`)}
                      className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition-all ${
                        playingWord === item.word
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                      }`}
                      title={t('Listen to standard pronunciation', '点击聆听标准发音示范')}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>
                        {playingWord === item.word
                          ? t('Playing', '发音中')
                          : t('Listen', '听示范')}
                      </span>
                    </button>

                    {/* Bookmark to notebook */}
                    {onSaveToNotebook && (
                      <button
                        onClick={() => onSaveToNotebook(item)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          isSaved
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-white text-gray-600 border-gray-200 hover:text-gray-900'
                        }`}
                        title={
                          isSaved
                            ? t('Saved to Notebook', '已收藏在易错本')
                            : t('Save to Notebook', '收藏到易错本')
                        }
                      >
                        {isSaved ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Tone tag */}
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="bg-amber-100/80 text-amber-900 font-semibold px-2 py-0.5 rounded">
                    {t('Tone: ', '调值：')}
                    {item.toneInfo}
                  </span>
                  {item.studentMistake && (
                    <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-mono">
                      {t('Common Error: ', '常见误读：')}
                      {item.studentMistake}
                    </span>
                  )}
                </div>

                {/* Pedagogical Explanation */}
                <p className="mt-2 text-xs text-gray-700 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-rose-100">
                  {item.explanation}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* On-Device Acoustic Forced Alignment & Phoneme GOP Confidence Panel (ported from proto-pron.html) */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <AcousticGopTelemetryCard telemetry={effectiveTelemetry} />
      </div>
    </div>
  );
};

