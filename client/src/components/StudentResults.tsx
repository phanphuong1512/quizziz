import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, Home, Sparkles } from 'lucide-react';
import type { GameStats } from '../types';
import { sounds } from '../utils/sound';

interface StudentResultsProps {
  stats: GameStats;
  playerId: string;
  onGoHome: () => void;
}

export const StudentResults: React.FC<StudentResultsProps> = ({
  stats,
  playerId,
  onGoHome,
}) => {
  const myReport = stats.studentReports.find((st) => st.id === playerId);
  const myRank = stats.finalLeaderboard.findIndex((p) => p.id === playerId) + 1;
  const isTop3 = myRank > 0 && myRank <= 3;

  useEffect(() => {
    sounds.playVictoryFanfare();
    if (isTop3) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isTop3]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Celebration Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-b from-[#1b103e] via-[#160d33] to-[#100927] border-2 border-[#3d2275] shadow-2xl text-center space-y-4">
        <div className="text-5xl float-avatar mx-auto mb-2">
          {myRank === 1 ? '👑' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎓'}
        </div>

        <div>
          <span className="text-xs font-black text-purple-300 uppercase tracking-widest">
            BÀI KIỂM TRA ĐÃ HOÀN TẤT
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {stats.quizTitle}
          </h1>
        </div>

        {/* Rank & Score Box */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#0e0724] border border-[#2f195c]">
          <div>
            <span className="text-[11px] font-bold text-purple-400 uppercase">THỨ HẠNG</span>
            <div className="text-3xl font-black text-white font-mono mt-0.5">
              #{myRank || 1}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-bold text-purple-400 uppercase">TỔNG ĐIỂM</span>
            <div className="text-3xl font-black text-yellow-300 font-mono mt-0.5">
              {(myReport?.score || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Accuracy and stats */}
        <div className="flex items-center justify-around text-xs font-bold text-purple-200 border-t border-[#26154b] pt-4">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{myReport?.correctCount || 0} câu đúng</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-400">
            <XCircle className="w-4 h-4" />
            <span>{myReport?.incorrectCount || 0} câu sai</span>
          </div>
          <div className="text-purple-300">
            Độ chính xác: <span className="text-white font-black">{myReport?.accuracy || 0}%</span>
          </div>
        </div>
      </div>

      {/* Answer Breakdown Review */}
      {myReport && myReport.answers.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#170e33] border border-[#341e69] shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Xem lại các câu hỏi đã làm
          </h3>

          <div className="space-y-2.5">
            {myReport.answers.map((ans, idx) => {
              const qData = stats.questionBreakdown[ans.questionIndex];
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
                    ans.isCorrect
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-red-950/30 border-red-500/40 text-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {ans.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-white block">
                        Câu {ans.questionIndex + 1}: {qData?.question}
                      </span>
                      <span className="text-[11px] opacity-80 mt-0.5 block">
                        Bạn chọn: {qData?.options[ans.selectedOption]}
                        {!ans.isCorrect && (
                          <span className="text-emerald-300 font-bold ml-2">
                            (Đáp án đúng: {qData?.options[qData.correctIndex]})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-white shrink-0 ml-2">
                    +{ans.points} đ
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Return Home Button */}
      <button
        onClick={onGoHome}
        className="quizizz-btn-3d w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-xl border-b-4 border-purple-800 flex items-center justify-center gap-2"
      >
        <Home className="w-4 h-4" />
        VỀ TRANG CHỦ
      </button>
    </div>
  );
};
