import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  RotateCcw,
  Volume2,
  Award,
  ArrowRight,
} from 'lucide-react';
import {
  PRONUNCIATION_AND_POLICY_QUIZ_BANK,
  FlashcardQuizItem,
} from '../utils/seabRubric';
import { playNaturalSpeech } from '../utils/naturalSpeech';
import { useLanguage } from '../context/LanguageContext';

export const PronunciationPolicyQuizCard: React.FC = () => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [answeredCount, setAnsweredCount] = useState<number>(0);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);

  const questions: FlashcardQuizItem[] = PRONUNCIATION_AND_POLICY_QUIZ_BANK;
  const currentQ = questions[currentIndex];

  const handleSelectOption = (optionIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    setAnsweredCount((prev) => prev + 1);
    if (optionIdx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setIsQuizFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setAnsweredCount(0);
    setIsQuizFinished(false);
  };

  return (
    <div
      data-testid="pronunciation-policy-quiz-card"
      className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-900 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
            QUIZ
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t(
                '1-Minute Polyphonic & Everyday Singapore Vocabulary Flashcard Drill',
                '1分钟常见多音字与新加坡本地常用词汇快问快答'
              )}
            </h3>
            <p className="text-xs text-slate-500">
              {t(
                'Practice common Mandarin polyphonic words and everyday Singapore community vocabulary',
                '轻松自测常见多音字读音与新加坡社区生活常用华语表达'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
          <span className="text-slate-600">
            {t('Score:', '得分：')}{' '}
            <strong className="text-teal-900">
              {score}/{questions.length}
            </strong>
          </span>
          <button
            type="button"
            onClick={handleRestartQuiz}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('Restart', '重新测验')}</span>
          </button>
        </div>
      </div>

      {isQuizFinished ? (
        <div className="p-6 rounded-xl bg-teal-50/60 border border-teal-900/15 text-center space-y-3">
          <Award className="w-10 h-10 text-teal-800 mx-auto" />
          <h4 className="text-lg font-bold text-slate-900">
            {t(
              `Drill Complete! You scored ${score} / ${questions.length}`,
              `闯关完成！您的最终得分为 ${score} / ${questions.length}`
            )}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {score >= 5
              ? t(
                  'Great job! Your polyphonic tone accuracy and Singapore community vocabulary are very solid.',
                  '表现很棒！您对常见多音字声调与新加坡本地常用词汇掌握得非常扎实。'
                )
              : t(
                  'Good effort! Review the reference notes and click Restart to practice these common polyphonic words again.',
                  '继续加油！建议查看下方读音参考解析并点击“重新测验”，巩固常见易错词。'
                )}
          </p>
          <button
            type="button"
            onClick={handleRestartQuiz}
            className="inline-flex items-center gap-1.5 bg-[#0B3B3C] hover:bg-teal-900 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('Practice Flashcards Again', '再练一轮快问快答')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span className="font-mono font-semibold text-teal-800">
              {t(
                `Question ${currentIndex + 1} of ${questions.length}`,
                `第 ${currentIndex + 1} / ${questions.length} 题`
              )}
              {' · '}
              {currentQ.category === 'polyphone'
                ? t('Polyphonic Character Practice', '常见多音字读音参考')
                : t('Singapore Everyday Vocabulary', '新加坡本地常用词汇')}
            </span>

            <button
              type="button"
              onClick={() =>
                playNaturalSpeech(currentQ.targetWord, {
                  voiceType: 'examiner',
                  rate: 0.85,
                })
              }
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-900 hover:underline cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t(`Listen "${currentQ.targetWord}"`, `收听“${currentQ.targetWord}”示范发音`)}</span>
            </button>
          </div>

          <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
            {t(currentQ.promptEn, currentQ.promptZh)}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;
              let btnClass =
                'bg-slate-50 hover:bg-teal-50/50 text-slate-800 border-slate-200';
              if (selectedOption !== null) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-50 text-emerald-950 border-emerald-400 font-bold';
                } else if (isSelected) {
                  btnClass = 'bg-rose-50 text-rose-900 border-rose-300';
                } else {
                  btnClass = 'bg-slate-50 text-slate-400 border-slate-200 opacity-70';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  data-testid={`quiz-option-${idx}`}
                  onClick={() => handleSelectOption(idx)}
                  disabled={selectedOption !== null}
                  className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-mono transition-colors flex items-center justify-between gap-2 cursor-pointer ${btnClass}`}
                >
                  <span>
                    {String.fromCharCode(65 + idx)}. {opt}
                  </span>
                  {selectedOption !== null && isCorrect && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-900/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-800 space-y-0.5">
                <div className="font-bold text-teal-950">
                  {selectedOption === currentQ.correctIndex
                    ? t('✓ Correct!', '✓ 回答正确！')
                    : t('✗ Reference Note:', '✗ 读音与词汇参考解析：')}
                </div>
                <p>{t(currentQ.explanationEn, currentQ.explanationZh)}</p>
              </div>

              <button
                type="button"
                data-testid="btn-next-quiz-question"
                onClick={handleNextQuestion}
                className="inline-flex items-center justify-center gap-1.5 bg-[#0B3B3C] hover:bg-teal-900 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>
                  {currentIndex + 1 >= questions.length
                    ? t('View Final Score', '查看测验总分')
                    : t('Next Question', '下一题')}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
