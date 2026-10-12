import React, { useState, useEffect } from 'react';
import { Flame, Clock, Award, CheckCircle2, XCircle, Lock } from 'lucide-react';
import type { AnswerFeedback } from '../types';
import { sounds } from '../utils/sound';

interface StudentGameProps {
  pin: string;
  quizTitle: string;
  playerName: string;
  playerAvatar: string;
  countdown: number | null; // 3, 2, 1, 0 or null
  questionIndex: number;
  totalQuestions: number;
  question: string;
  options: string[];
  duration: number;
  feedback: AnswerFeedback | null;
  currentScore: number;
  currentRank: number;
  streak: number;
  onSubmitAnswer: (selectedOption: number, timeRemaining: number) => void;
}

const CHEER_QUOTES = [
  'ĐỈNH NÓC KỊCH TRẦN! 🔥',
  'QUÁ XUẤT SẮC! 🌟',
  'BÁCH PHÁT BÁCH TRÚNG! 🎯',
  'KHÔNG THỂ CẢN PHÁ! ⚡',
  'CHUỖI THẮNG BẤT BẠI! 🚀',
  'TUYỆT VỜI ÔNG MẶT TRỜI! ☀️',
];

export const StudentGame: React.FC<StudentGameProps> = ({
  pin,
  quizTitle,
  playerName,
  playerAvatar,
  countdown,
  questionIndex,
  totalQuestions,
  question,
  options,
  duration,
  feedback,
  currentScore,
  currentRank,
  streak,
  onSubmitAnswer,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [cheerQuote, setCheerQuote] = useState('');
  const [revealCountdown, setRevealCountdown] = useState(4);

  // Reset timer on new question
  useEffect(() => {
    setTimeLeft(duration);
    setSelectedOption(null);
    setRevealCountdown(4);

    if (duration > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [questionIndex, duration]);

  // Set random cheer quote & play audio when synchronized feedback arrives
  useEffect(() => {
    if (feedback) {
      if (feedback.isCorrect) {
        sounds.playCorrect();
        if (feedback.streak > 1) {
          setTimeout(() => sounds.playStreak(), 200);
        }
        setCheerQuote(CHEER_QUOTES[Math.floor(Math.random() * CHEER_QUOTES.length)]);
      } else {
        sounds.playIncorrect();
      }

      // Countdown for auto next question
      setRevealCountdown(4);
      const countdownTimer = setInterval(() => {
        setRevealCountdown((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [feedback]);

  // Sound for countdown 3, 2, 1
  useEffect(() => {
    if (countdown !== null) {
      sounds.playCountdownTick(countdown);
    }
  }, [countdown]);

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null || feedback !== null || timeLeft <= 0) return;
    sounds.playClick();
    setSelectedOption(idx);
    onSubmitAnswer(idx, timeLeft);
  };

  const timerPercent = duration > 0 ? (timeLeft / duration) * 100 : 0;

  // 1. COUNTDOWN SCREEN (3, 2, 1)
  if (countdown !== null) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0d0620] flex flex-col items-center justify-center p-4">
        <div className="text-center animate-bounce">
          <span className="text-sm font-extrabold text-purple-400 uppercase tracking-widest block mb-4">
            {quizTitle}
          </span>
          <div className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
            {countdown === 0 ? 'BẮT ĐẦU!' : countdown}
          </div>
        </div>
      </div>
    );
  }

  // 2. WAITING LOBBY (BEFORE GAME STARTS)
  if (questionIndex < 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="p-8 rounded-3xl bg-[#170e33] border-2 border-[#371f6e] max-w-sm w-full shadow-2xl space-y-6">
          <div className="w-24 h-24 rounded-3xl bg-purple-600/30 border-2 border-purple-500/50 flex items-center justify-center text-5xl mx-auto float-avatar shadow-lg shadow-purple-600/20">
            {playerAvatar}
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">{playerName}</h2>
            <p className="text-xs text-purple-300 font-mono mt-1">Phòng thi: {pin}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e0724] border border-[#2e1957] space-y-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping mx-auto" />
            <p className="text-xs font-bold text-white">Bạn đã vào phòng thành công!</p>
            <p className="text-[11px] text-purple-300/80">
              Hãy đợi giáo viên bấm "Bắt đầu trò chơi" trên màn hình chính...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. SYNCHRONIZED REVEAL OVERLAY (APPEARS ONLY AFTER TIME RUNS OUT / REVEAL)
  if (feedback !== null) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0b051b]/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-md my-auto space-y-5 text-center">
          {/* Auto Next Countdown Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-600/40 border border-purple-400/30 text-purple-200 text-xs font-black animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Tự động chuyển câu tiếp theo sau {revealCountdown}s...</span>
          </div>

          {/* Result Card */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border-4 shadow-2xl relative overflow-hidden ${
              feedback.isCorrect
                ? 'bg-gradient-to-b from-emerald-900/90 to-emerald-950 border-emerald-400 shadow-emerald-500/30'
                : 'bg-gradient-to-b from-rose-950/90 to-red-950 border-rose-500 shadow-red-500/30'
            }`}
          >
            {/* Icon */}
            <div className="mb-3">
              {feedback.isCorrect ? (
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-300 animate-bounce">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
              ) : (
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-red-500/30 border-2 border-red-400 flex items-center justify-center mx-auto text-red-300">
                  <XCircle className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
              )}
            </div>

            {/* Title / Cheer */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              {feedback.isCorrect
                ? cheerQuote
                : feedback.timedOut
                ? 'HẾT THỜI GIAN!'
                : 'TIẾC QUÁ, SAI RỒI!'}
            </h2>

            {/* Points breakdown if correct */}
            {feedback.isCorrect ? (
              <div className="space-y-2.5">
                <div className="text-4xl font-black text-yellow-300 font-mono tracking-tight">
                  +{feedback.pointsEarned} ĐIỂM
                </div>

                <div className="flex items-center justify-center gap-2.5 text-xs font-bold text-emerald-200">
                  <span>Cơ bản: +500</span>
                  <span>•</span>
                  <span>Tốc độ: +{feedback.speedBonus}</span>
                  {feedback.streakBonus > 0 && (
                    <>
                      <span>•</span>
                      <span>Streak: +{feedback.streakBonus}</span>
                    </>
                  )}
                </div>

                {feedback.streak > 1 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/30 border border-amber-400 text-amber-200 text-xs font-black">
                    <Flame className="w-4 h-4 fill-current text-amber-400" />
                    CHUỖI ĐÚNG x{feedback.streak}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs text-rose-200">
                  Đáp án chính xác là:
                </p>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/20 text-sm font-black text-white">
                  {options[feedback.correctIndex]}
                </div>
              </div>
            )}

            {/* Explanation */}
            {feedback.explanation && (
              <div className="mt-4 p-3 rounded-xl bg-black/30 border border-white/10 text-xs text-white/90 text-left">
                💡 <span className="font-bold">Giải thích:</span> {feedback.explanation}
              </div>
            )}
          </div>

          {/* Current Rank Banner */}
          <div className="p-4 rounded-2xl bg-[#1b103e] border border-[#3b236d] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-200">
              <Award className="w-4 h-4 text-amber-400" />
              <span>HẠNG HIỆN TẠI</span>
            </div>
            <div className="text-base font-black text-white">
              #{feedback.currentRank} • {feedback.currentScore.toLocaleString()} điểm
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. ACTIVE QUESTION GAMEPLAY SCREEN (WITH TOP PROGRESS BAR & SECRET LOCKED SELECTION)
  return (
    <div className="min-h-[calc(100vh-70px)] max-w-4xl mx-auto px-4 pt-6 pb-6 flex flex-col justify-between relative">
      {/* FULL-WIDTH FIXED HORIZONTAL COUNTDOWN BAR AT TOP */}
      <div className="fixed top-0 left-0 right-0 h-2 sm:h-2.5 bg-[#170e33] z-50 overflow-hidden shadow-md">
        <div
          className={`h-full transition-all duration-300 ${
            timerPercent > 45 ? 'bg-emerald-400' : timerPercent > 20 ? 'bg-amber-400' : 'bg-rose-500'
          }`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>

      {/* Top Status Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-black">
            CÂU {questionIndex + 1} / {totalQuestions}
          </span>
          {streak > 1 && (
            <span className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/40">
              <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
              x{streak}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 bg-[#1b103e] px-3 py-1 rounded-xl border border-[#3b216d]">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span className={`font-mono font-black ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>

          <div className="text-sm font-black text-white font-mono hidden sm:block">
            #{currentRank} • {currentScore.toLocaleString()} đ
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#170e33] border-2 border-[#381f6e] shadow-2xl my-auto text-center space-y-3">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-relaxed">
          {question}
        </h2>

        {/* Secret Locked-in Badge when option has been selected (NO PEAKING / NO SPOILER) */}
        {selectedOption !== null && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600/30 border border-purple-500/50 text-purple-200 text-xs font-bold animate-pulse">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Đã ghi nhận đáp án! Giữ bí mật và chờ hết giờ nhé 🤫</span>
          </div>
        )}
      </div>

      {/* 4 Quizizz 3D Answer Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
        {[
          { color: 'bg-[#e21b3c] hover:bg-[#c91835] border-b-4 border-[#8e1025]', icon: '▲', label: 'A' },
          { color: 'bg-[#1368ce] hover:bg-[#0f55aa] border-b-4 border-[#0b3c78]', icon: '◆', label: 'B' },
          { color: 'bg-[#d89e00] hover:bg-[#b88600] border-b-4 border-[#825f00]', icon: '●', label: 'C' },
          { color: 'bg-[#26890c] hover:bg-[#1f7009] border-b-4 border-[#144906]', icon: '■', label: 'D' },
        ].map((btn, idx) => {
          const isSelected = selectedOption === idx;
          const isAnySelected = selectedOption !== null;

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnySelected || timeLeft <= 0}
              className={`quizizz-btn-3d p-4 sm:p-5 rounded-2xl text-white font-extrabold text-sm sm:text-base flex items-center justify-between text-left shadow-lg transition-all ${
                isSelected
                  ? `${btn.color} ring-4 ring-white scale-[1.02] shadow-2xl`
                  : isAnySelected
                  ? `${btn.color} opacity-40 cursor-not-allowed`
                  : btn.color
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center text-sm font-black">
                  {btn.icon}
                </span>
                <span className="leading-snug">{options[idx]}</span>
              </div>

              {isSelected && (
                <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-xl">
                  ✓ Đã chọn
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
