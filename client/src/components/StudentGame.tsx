import React, { useState, useEffect } from 'react';
import { Flame, Clock, Award, CheckCircle2, XCircle } from 'lucide-react';
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

  // Reset timer on new question
  useEffect(() => {
    setTimeLeft(duration);
    setSelectedOption(null);

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

  // Set random cheer quote when correct feedback arrives
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
    }
  }, [feedback]);

  // Sound for countdown
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

  // 3. INSTANT FEEDBACK OVERLAY (QUIZIZZ SIGNATURE STYLE)
  if (feedback !== null) {
    return (
      <div className="fixed inset-0 z-40 bg-[#0b051b] flex flex-col items-center justify-between p-6 overflow-y-auto">
        <div className="w-full max-w-md my-auto space-y-6 text-center">
          {/* Result Card */}
          <div
            className={`p-8 rounded-3xl border-4 shadow-2xl relative overflow-hidden ${
              feedback.isCorrect
                ? 'bg-gradient-to-b from-emerald-900/90 to-emerald-950 border-emerald-400 shadow-emerald-500/30'
                : 'bg-gradient-to-b from-rose-950/90 to-red-950 border-rose-500 shadow-red-500/30'
            }`}
          >
            {/* Icon */}
            <div className="mb-4">
              {feedback.isCorrect ? (
                <div className="w-20 h-20 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-300 animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-red-500/30 border-2 border-red-400 flex items-center justify-center mx-auto text-red-300">
                  <XCircle className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Title / Cheer */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              {feedback.isCorrect ? cheerQuote : 'TIẾC QUÁ, SAI RỒI!'}
            </h2>

            {/* Points breakdown if correct */}
            {feedback.isCorrect ? (
              <div className="space-y-3">
                <div className="text-4xl font-black text-yellow-300 font-mono tracking-tight">
                  +{feedback.pointsEarned} ĐIỂM
                </div>

                <div className="flex items-center justify-center gap-3 text-xs font-bold text-emerald-200">
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
              <div className="space-y-3">
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

          <p className="text-xs text-purple-400/80 animate-pulse">
            Đang chờ giáo viên chuyển sang câu hỏi tiếp theo...
          </p>
        </div>
      </div>
    );
  }

  // 4. ACTIVE QUESTION GAMEPLAY SCREEN
  return (
    <div className="min-h-[calc(100vh-70px)] max-w-4xl mx-auto px-4 py-4 flex flex-col justify-between">
      {/* Top Status Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
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

          <div className="text-right flex items-center gap-3">
            <div className="text-xs font-bold text-purple-300">
              Hạng #{currentRank}
            </div>
            <div className="text-sm font-black text-white font-mono">
              {currentScore.toLocaleString()} đ
            </div>
          </div>
        </div>

        {/* Shrinking Countdown Bar */}
        <div className="w-full h-2.5 rounded-full bg-[#1b103e] overflow-hidden border border-[#331c63]">
          <div
            className={`h-full transition-all duration-1000 rounded-full ${
              timerPercent > 40 ? 'bg-emerald-400' : timerPercent > 20 ? 'bg-amber-400' : 'bg-red-500'
            }`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#170e33] border-2 border-[#381f6e] shadow-2xl my-auto text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-purple-400 mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>Thời gian còn: {timeLeft}s</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-relaxed">
          {question}
        </h2>
      </div>

      {/* 4 Quizizz 3D Answer Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6">
        {[
          { color: 'bg-[#e21b3c] hover:bg-[#c91835] border-b-4 border-[#8e1025]', icon: '▲', label: 'A' },
          { color: 'bg-[#1368ce] hover:bg-[#0f55aa] border-b-4 border-[#0b3c78]', icon: '◆', label: 'B' },
          { color: 'bg-[#d89e00] hover:bg-[#b88600] border-b-4 border-[#825f00]', icon: '●', label: 'C' },
          { color: 'bg-[#26890c] hover:bg-[#1f7009] border-b-4 border-[#144906]', icon: '■', label: 'D' },
        ].map((btn, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectOption(idx)}
            disabled={selectedOption !== null || timeLeft <= 0}
            className={`quizizz-btn-3d p-4 sm:p-5 rounded-2xl text-white font-extrabold text-sm sm:text-base flex items-center justify-between text-left shadow-lg transition-transform ${btn.color} ${
              selectedOption === idx ? 'ring-4 ring-white' : ''
            } disabled:opacity-70`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center text-sm font-black">
                {btn.icon}
              </span>
              <span className="leading-snug">{options[idx]}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
