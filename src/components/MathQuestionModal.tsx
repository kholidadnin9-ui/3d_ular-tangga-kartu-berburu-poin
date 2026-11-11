import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, XCircle, HelpCircle, Star } from 'lucide-react';
import { MathQuestion, Player } from '../types/game';
import { RobotAvatar } from './RobotAvatar';
import { AudioManager } from '../managers/AudioManager';

interface MathQuestionModalProps {
  player: Player;
  tileNumber: number;
  question: MathQuestion;
  onComplete: (isCorrect: boolean) => void;
}

export const MathQuestionModal: React.FC<MathQuestionModalProps> = ({
  player,
  tileNumber,
  question,
  onComplete,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selectedOption === question.correctAnswer;

  const handleChoose = (optValue: number) => {
    if (submitted) return;
    AudioManager.playButtonClick();
    setSelectedOption(optValue);
    setSubmitted(true);

    const correct = optValue === question.correctAnswer;
    if (correct) {
      AudioManager.playCorrectAnswer();
    } else {
      AudioManager.playWrongAnswer();
    }

    setTimeout(() => {
      onComplete(correct);
    }, 2000);
  };

  // If the current player is AI, automatically pick an answer after a brief thinking pause
  useEffect(() => {
    if (!player.isAI || submitted) return;
    const timer = setTimeout(() => {
      // Friendly AI has a 75% chance of answering right
      const pickCorrect = Math.random() < 0.75;
      if (pickCorrect) {
        handleChoose(question.correctAnswer);
      } else {
        const wrongOpts = question.options.filter((o) => o !== question.correctAnswer);
        handleChoose(wrongOpts[0] ?? question.options[0]);
      }
    }, 1300);
    return () => clearTimeout(timer);
  }, [player.isAI, submitted, question]);

  const optionLabels = ['A', 'B', 'C'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#0b1a6b]/55 backdrop-blur-sm animate-fadeIn">
      <div className="hologram-panel rounded-3xl max-w-xl w-full max-h-[calc(100dvh-1rem)] p-4 sm:p-8 text-white relative overflow-y-auto overflow-x-hidden">
        <div className="hologram-scanline absolute inset-0" />

        {/* Top Hologram Badge */}
        <div className="relative z-10 flex items-center justify-between gap-2 pb-4 border-b border-cyan-400/25">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/25 border border-purple-400 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-300 block">
                PETAK SOAL #{tileNumber} • {question.category}
              </span>
              <h3 className="font-display font-bold text-lg text-white">
                Tantangan Matematika Galaksi
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-amber-400/15 border border-amber-300/40 px-3 py-1.5 rounded-2xl">
            <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span className="font-mono-num text-xs font-extrabold text-amber-200">+5 POIN</span>
          </div>
        </div>

        {/* Question Equation Box */}
        <div className="relative z-10 my-4 sm:my-6 py-5 sm:py-6 px-3 sm:px-4 rounded-3xl bg-[#0f2a85]/80 border-2 border-cyan-400/40 text-center shadow-[inset_0_0_30px_rgba(0,242,254,0.12)]">
          <div className="text-xs font-bold uppercase tracking-widest text-cyan-300/80 mb-2">
            BERAPA HASIL DARI:
          </div>
          <div className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-wider drop-shadow-[0_4px_16px_rgba(0,242,254,0.45)]">
            {question.question}
          </div>
        </div>

        {/* Three Large Answer Buttons (A, B, C) */}
        <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-4">
          {question.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isRightAnswer = opt === question.correctAnswer;

            let btnStyle =
              'bg-[#173a9e]/90 border-2 border-cyan-400/50 hover:border-amber-300 hover:-translate-y-1 text-white';
            if (submitted) {
              if (isRightAnswer) {
                btnStyle =
                  'bg-emerald-500/30 border-2 border-emerald-400 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-105';
              } else if (isSelected && !isRightAnswer) {
                btnStyle =
                  'bg-rose-500/30 border-2 border-rose-400 text-rose-200 opacity-90';
              } else {
                btnStyle = 'bg-[#173a9e]/40 border border-slate-700 text-slate-400 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={submitted || player.isAI}
                onClick={() => handleChoose(opt)}
                className={`rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center transition-all cursor-pointer ${btnStyle}`}
              >
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-200 mb-1.5">
                  PILIHAN {optionLabels[idx]}
                </span>
                <span className="font-mono-num font-extrabold text-2xl sm:text-4xl">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Banner after choosing */}
        {submitted && (
          <div
            className={`relative z-10 mt-6 p-4 rounded-2xl border-2 flex items-center gap-4 animate-bounce ${
              isCorrect
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
                : 'bg-rose-500/20 border-rose-400 text-rose-100'
            }`}
          >
            <RobotAvatar
              color={player.robotColor}
              size="md"
              mood={isCorrect ? 'victory' : 'sad'}
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 font-display font-extrabold text-base sm:text-xl">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                    <span>CORRECT! HEBAT SEKALI! (+5 POIN)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-rose-300" />
                    <span>WRONG! JANGAN MENYERAH! (+0 POIN)</span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm font-medium mt-0.5 opacity-95">
                {question.explanation}
              </p>
            </div>
          </div>
        )}

        {/* AI Thinking Indicator */}
        {!submitted && player.isAI && (
          <div className="relative z-10 mt-5 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-cyan-200 bg-cyan-500/10 py-2.5 px-4 rounded-2xl border border-cyan-400/30">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>Robot AI {player.name} sedang menghitung jawaban...</span>
          </div>
        )}
      </div>
    </div>
  );
};
