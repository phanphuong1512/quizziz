import React, { useState, useEffect } from 'react';
import { ArrowRight, Trophy, Flame, CheckCircle, Clock, StopCircle, Award, FastForward } from 'lucide-react';
import type { LeaderboardEntry } from '../types';
import { sounds } from '../utils/sound';

interface HostLiveGameProps {
  pin: string;
  questionIndex: number;
  totalQuestions: number;
  question: string;
  options: string[];
  duration: number;
  correctIndex?: number;
  explanation?: string;
  leaderboard: LeaderboardEntry[];
  answeredCount: number;
  totalPlayers: number;
  isRevealed?: boolean;
  onNextQuestion: () => void;
  onEndGame: () => void;
}

export const HostLiveGame: React.FC<HostLiveGameProps> = ({
  pin,
  questionIndex,
  totalQuestions,
  question,
  options,
  duration,
  correctIndex,
  explanation,
  leaderboard,
  answeredCount,
  totalPlayers,
  isRevealed = false,
  onNextQuestion,
  onEndGame,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
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
  }, [questionIndex, duration]);

  const handleNext = () => {
    sounds.playClick();
    onNextQuestion();
  };

  const handleEnd = () => {
    if (confirm('Bạn có chắc chắn muốn kết thúc bài kiểm tra sớm không?')) {
      onEndGame();
    }
  };

  const timerPercent = duration > 0 ? (timeLeft / duration) * 100 : 0;
  const answeredPercent = totalPlayers > 0 ? (answeredCount / totalPlayers) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-6 min-h-[calc(100vh-70px)] flex flex-col justify-between relative">
      {/* FULL-WIDTH FIXED HORIZONTAL COUNTDOWN BAR AT TOP */}
      <div className="fixed top-0 left-0 right-0 h-2 sm:h-2.5 bg-[#170e33] z-50 overflow-hidden shadow-md">
        <div
          className={`h-full transition-all duration-300 ${
            timerPercent > 45 ? 'bg-emerald-400' : timerPercent > 20 ? 'bg-amber-400' : 'bg-rose-500'
          }`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2d1b54]">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-purple-600/40 text-purple-200 border border-purple-500/30 text-xs font-black tracking-wider uppercase">
            CÂU {questionIndex + 1} / {totalQuestions}
          </span>
          <span className="text-xs text-purple-400 font-mono">PHÒNG: {pin}</span>
          {isRevealed && (
            <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
              ⏳ Tự động chuyển câu sau 4s...
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleEnd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 font-bold text-xs border border-red-800/40 transition-colors"
          >
            <StopCircle className="w-3.5 h-3.5" />
            Kết thúc sớm
          </button>

          <button
            onClick={handleNext}
            className="quizizz-btn-3d flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md border-b-4 border-purple-800"
          >
            {isRevealed ? (
              <>
                <FastForward className="w-4 h-4" />
                Chuyển câu ngay
              </>
            ) : questionIndex + 1 >= totalQuestions ? (
              'Xem kết quả chung cuộc'
            ) : (
              <>
                Câu tiếp theo
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 flex-1 items-start">
        {/* Left: Active Question Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Question Box */}
          <div className="p-7 rounded-3xl bg-[#170e33] border-2 border-[#381f6e] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-purple-300 mb-3">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                Thời gian còn lại:
              </span>
              <span className={`text-base font-black font-mono ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-white leading-snug mb-6">
              {question}
            </h2>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((opt, idx) => {
                const isCorrect = correctIndex !== undefined && idx === correctIndex;
                const colors = [
                  'bg-red-500/15 border-red-500/40 text-red-200',
                  'bg-blue-500/15 border-blue-500/40 text-blue-200',
                  'bg-amber-500/15 border-amber-500/40 text-amber-200',
                  'bg-emerald-500/15 border-emerald-500/40 text-emerald-200',
                ];

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                      isCorrect && isRevealed
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-100 shadow-md ring-2 ring-emerald-500/50'
                        : colors[idx % colors.length]
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-black text-xs">
                        {['A', 'B', 'C', 'D'][idx]}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isCorrect && (
                      <span className="flex items-center gap-1 text-[11px] font-black text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Đáp án đúng
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {explanation && isRevealed && (
              <div className="mt-4 p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-300">
                💡 <span className="font-bold text-purple-200">Giải thích:</span> {explanation}
              </div>
            )}
          </div>

          {/* Submission status bar */}
          <div className="p-4 rounded-2xl bg-[#170e33] border border-[#341e69] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-200">
              <Award className="w-4 h-4 text-purple-400" />
              <span>
                Tiến độ nộp bài: <span className="text-white font-black">{answeredCount}</span> / {totalPlayers} học sinh
              </span>
            </div>

            <div className="w-32 bg-[#0e0722] h-2.5 rounded-full overflow-hidden border border-[#301b5e]">
              <div
                className="bg-purple-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${answeredPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Real-time Leaderboard */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl bg-[#170e33] border border-[#341e69] shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2b1859] mb-4">
              <div className="flex items-center gap-2 font-black text-white text-base">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>BẢNG XẾP HẠNG</span>
              </div>
              <span className="text-xs font-bold text-purple-400">
                {leaderboard.length} người chơi
              </span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {leaderboard.map((player, idx) => {
                const isTop3 = idx < 3;
                const medalColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600'];

                return (
                  <div
                    key={player.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      idx === 0
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : idx === 1
                        ? 'bg-slate-500/10 border-slate-400/40'
                        : idx === 2
                        ? 'bg-amber-700/10 border-amber-600/40'
                        : 'bg-[#1e133d] border-[#372166]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center font-black text-sm ${isTop3 ? medalColors[idx] : 'text-purple-400'}`}>
                        #{player.rank || idx + 1}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-purple-600/30 flex items-center justify-center text-lg border border-purple-500/30">
                        {player.avatar || '🦊'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[130px]">
                          {player.name}
                        </p>
                        {player.streak > 1 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                            <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
                            Streak x{player.streak}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-white font-mono">
                        {player.score.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-purple-400 font-medium">điểm</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
