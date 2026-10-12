import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  RotateCcw, 
  Home, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import type { GameStats } from '../types';
import { sounds } from '../utils/sound';

interface HostResultsProps {
  stats: GameStats;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const HostResults: React.FC<HostResultsProps> = ({
  stats,
  onPlayAgain,
  onGoHome,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'questions' | 'students'>('leaderboard');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Trigger confetti and victory fanfare on mount
  useEffect(() => {
    sounds.playVictoryFanfare();

    // Confetti cannon
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#8854c0', '#00c985', '#e21b3c', '#1368ce', '#ffa602'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const top3 = stats.finalLeaderboard.slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  // Export full detailed report to CSV (with UTF-8 BOM so Vietnamese characters display properly)
  const exportToCsv = () => {
    const headers = ['Hạng', 'Họ và tên', 'Điểm số', 'Độ chính xác (%)', 'Số câu đúng', 'Số câu sai', 'Tổng thời gian (s)'];
    const rows = stats.studentReports.map((st, idx) => [
      idx + 1,
      `"${st.name}"`,
      st.score,
      `${st.accuracy}%`,
      st.correctCount,
      st.incorrectCount,
      st.totalTime,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Ket_qua_${stats.quizTitle.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Title & Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2d1b54]">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            TỔNG KẾT & THỐNG KÊ CHI TIẾT
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            {stats.quizTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22134a] hover:bg-[#321c6b] text-purple-200 hover:text-white font-bold text-xs border border-[#3f2479] transition-colors"
          >
            <Download className="w-4 h-4 text-purple-400" />
            Xuất file Excel / CSV
          </button>

          <button
            onClick={onPlayAgain}
            className="quizizz-btn-3d flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md border-b-4 border-purple-800"
          >
            <RotateCcw className="w-4 h-4" />
            Chơi lại
          </button>

          <button
            onClick={onGoHome}
            className="p-2.5 rounded-xl bg-[#1b103b] hover:bg-[#281854] text-purple-200 hover:text-white border border-[#341e69]"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Iconic 3-Tier Podium (Bục Vinh Quang Quizizz) */}
      <div className="p-8 rounded-3xl bg-gradient-to-b from-[#1b0f3b] via-[#140b2f] to-[#0d0720] border-2 border-[#3d2173] shadow-2xl relative overflow-hidden">
        <h2 className="text-center text-sm font-black text-purple-300 uppercase tracking-widest mb-10">
          🏆 BỤC VINH QUANG QUIZIZZ 🏆
        </h2>

        <div className="flex items-end justify-center gap-3 sm:gap-6 max-w-2xl mx-auto pt-6 pb-2">
          {/* 2nd Place (Silver) */}
          {second && (
            <div className="flex-1 flex flex-col items-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-slate-700/50 border-2 border-slate-300 flex items-center justify-center text-2xl sm:text-3xl mb-2 shadow-lg float-avatar">
                {second.avatar || '🥈'}
              </div>
              <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[100px] text-center mb-1">
                {second.name}
              </span>
              <span className="text-[11px] font-black text-purple-300 font-mono mb-2">
                {second.score.toLocaleString()} đ
              </span>
              <div className="w-full h-32 sm:h-36 rounded-t-2xl bg-gradient-to-t from-slate-800 to-slate-700 border-t-4 border-slate-300 flex flex-col items-center justify-start pt-3 shadow-xl">
                <span className="text-3xl sm:text-4xl font-black text-slate-300">2</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HẠNG NHÌ</span>
              </div>
            </div>
          )}

          {/* 1st Place (Gold / Champion) */}
          {first && (
            <div className="flex-1 flex flex-col items-center -mt-6">
              <div className="relative">
                <div className="w-18 sm:w-20 h-18 sm:h-20 rounded-2xl bg-amber-600/40 border-4 border-yellow-400 flex items-center justify-center text-3xl sm:text-4xl mb-2 shadow-2xl float-avatar ring-4 ring-yellow-400/30">
                  {first.avatar || '👑'}
                </div>
                <div className="absolute -top-4 -right-2 text-2xl animate-bounce">👑</div>
              </div>
              <span className="text-sm sm:text-base font-black text-white truncate max-w-[120px] text-center mb-1">
                {first.name}
              </span>
              <span className="text-xs font-black text-yellow-300 font-mono mb-2">
                {first.score.toLocaleString()} đ
              </span>
              <div className="w-full h-44 sm:h-48 rounded-t-2xl bg-gradient-to-t from-amber-900 via-amber-800 to-yellow-600 border-t-4 border-yellow-300 flex flex-col items-center justify-start pt-3 shadow-2xl">
                <span className="text-4xl sm:text-5xl font-black text-yellow-200">1</span>
                <span className="text-[11px] font-black text-yellow-100 uppercase tracking-wider">QUÁN QUÂN</span>
              </div>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {third && (
            <div className="flex-1 flex flex-col items-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-amber-950/60 border-2 border-amber-600 flex items-center justify-center text-2xl sm:text-3xl mb-2 shadow-lg float-avatar">
                {third.avatar || '🥉'}
              </div>
              <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[100px] text-center mb-1">
                {third.name}
              </span>
              <span className="text-[11px] font-black text-purple-300 font-mono mb-2">
                {third.score.toLocaleString()} đ
              </span>
              <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-t from-amber-950 to-amber-900 border-t-4 border-amber-600 flex flex-col items-center justify-start pt-3 shadow-xl">
                <span className="text-3xl sm:text-4xl font-black text-amber-500">3</span>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">HẠNG BA</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Class Accuracy & Highlight Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Accuracy */}
        <div className="p-5 rounded-2xl bg-[#170e33] border border-[#341e69] flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl font-black text-emerald-400">
            {stats.overallAccuracy}%
          </div>
          <div>
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Độ chính xác chung</span>
            <p className="text-sm font-bold text-white mt-0.5">
              {stats.overallAccuracy >= 75 ? 'Rất xuất sắc! 🌟' : stats.overallAccuracy >= 50 ? 'Khá tốt 👍' : 'Cần ôn luyện thêm 📚'}
            </p>
          </div>
        </div>

        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-[#170e33] border border-[#341e69] flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-2xl font-black text-purple-300">
            {stats.totalPlayers}
          </div>
          <div>
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Tổng học sinh</span>
            <p className="text-sm font-bold text-white mt-0.5">Đã hoàn thành bài thi</p>
          </div>
        </div>

        {/* Toughest Question */}
        <div className="p-5 rounded-2xl bg-[#170e33] border border-[#341e69] flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-xl font-black text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Câu khó nhất</span>
            <p className="text-xs font-bold text-white truncate mt-0.5">
              {stats.toughestQuestion ? `Câu ${stats.toughestQuestion.questionIndex + 1} (${stats.toughestQuestion.accuracy}%)` : 'Không có'}
            </p>
          </div>
        </div>

        {/* Easiest Question */}
        <div className="p-5 rounded-2xl bg-[#170e33] border border-[#341e69] flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl font-black text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Câu dễ nhất</span>
            <p className="text-xs font-bold text-white truncate mt-0.5">
              {stats.easiestQuestion ? `Câu ${stats.easiestQuestion.questionIndex + 1} (${stats.easiestQuestion.accuracy}%)` : 'Không có'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[#2d1b54] flex items-center gap-4">
        {[
          { id: 'leaderboard', label: 'Bảng xếp hạng đầy đủ' },
          { id: 'questions', label: 'Phân tích từng câu hỏi' },
          { id: 'students', label: 'Báo cáo chi tiết từng học sinh' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-purple-500 text-white'
                : 'border-transparent text-purple-300 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BẢNG XẾP HẠNG ĐẦY ĐỦ */}
      {activeTab === 'leaderboard' && (
        <div className="rounded-3xl bg-[#170e33] border border-[#341e69] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#120a2a] text-purple-300 font-extrabold uppercase border-b border-[#2b1859]">
                <tr>
                  <th className="py-3.5 px-4">Hạng</th>
                  <th className="py-3.5 px-4">Học sinh</th>
                  <th className="py-3.5 px-4 text-right">Điểm số</th>
                  <th className="py-3.5 px-4 text-center">Độ chính xác</th>
                  <th className="py-3.5 px-4 text-center">Đúng / Sai</th>
                  <th className="py-3.5 px-4 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#271550]">
                {stats.studentReports.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-black text-sm text-purple-200">
                      #{idx + 1}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{st.avatar || '🦊'}</span>
                        <span className="font-bold text-white text-sm">{st.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-black text-sm text-purple-200">
                      {st.score.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        st.accuracy >= 75
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : st.accuracy >= 50
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {st.accuracy}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold">
                      <span className="text-emerald-400">{st.correctCount}</span> / <span className="text-red-400">{st.incorrectCount}</span>
                    </td>
                    <td className="py-4 px-4 text-right text-purple-300 font-mono">
                      {st.totalTime}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PHÂN TÍCH TỪNG CÂU HỎI */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {stats.questionBreakdown.map((q) => (
            <div
              key={q.questionIndex}
              className="p-6 rounded-3xl bg-[#170e33] border border-[#341e69] shadow-xl space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-black">
                  CÂU HỎI {q.questionIndex + 1}
                </span>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-purple-300">
                    Độ chính xác: <span className="text-emerald-400 font-black">{q.accuracy}%</span>
                  </span>
                  <span className="text-purple-300">
                    Thời gian TB: <span className="text-white font-mono">{q.avgTime}s</span>
                  </span>
                </div>
              </div>

              <h3 className="text-base font-extrabold text-white">{q.question}</h3>

              {/* Options Breakdown Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctIndex;
                  const count = q.optionCounts[optIdx] || 0;
                  const percent = q.totalResponses > 0 ? Math.round((count / q.totalResponses) * 100) : 0;

                  return (
                    <div
                      key={optIdx}
                      className={`p-3.5 rounded-2xl border text-xs font-semibold relative overflow-hidden ${
                        isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                          : 'bg-[#1b103e] border-[#372166] text-purple-200'
                      }`}
                    >
                      {/* Percent Fill */}
                      <div
                        className={`absolute top-0 bottom-0 left-0 opacity-20 ${
                          isCorrect ? 'bg-emerald-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                            isCorrect ? 'bg-emerald-500 text-white' : 'bg-white/10 text-purple-300'
                          }`}>
                            {['A', 'B', 'C', 'D'][optIdx]}
                          </span>
                          <span>{opt}</span>
                        </div>

                        <span className="font-mono font-bold">
                          {count} học sinh ({percent}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/30 text-xs text-purple-300">
                  💡 <span className="font-bold text-purple-200">Giải thích:</span> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: BÁO CÁO CHI TIẾT TỪNG HỌC SINH */}
      {activeTab === 'students' && (
        <div className="space-y-3">
          {stats.studentReports.map((st) => {
            const isExpanded = expandedStudentId === st.id;

            return (
              <div
                key={st.id}
                className="p-5 rounded-2xl bg-[#170e33] border border-[#341e69] shadow-md transition-all"
              >
                <div
                  onClick={() => setExpandedStudentId(isExpanded ? null : st.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{st.avatar || '🦊'}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{st.name}</h4>
                      <p className="text-xs text-purple-300 font-mono mt-0.5">
                        {st.score.toLocaleString()} điểm • Độ chính xác: {st.accuracy}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-xs font-bold hidden sm:flex items-center gap-3">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> {st.correctCount} đúng
                      </span>
                      <span className="text-red-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> {st.incorrectCount} sai
                      </span>
                    </div>

                    <button className="text-purple-300 hover:text-white p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Answer Sheet */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#2a1752] space-y-2">
                    <p className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                      Chi tiết bài làm:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {st.answers.map((ans, aIdx) => (
                        <div
                          key={aIdx}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                            ans.isCorrect
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                              : 'bg-red-950/30 border-red-500/40 text-red-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {ans.isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="font-bold">Câu {ans.questionIndex + 1}</span>
                          </div>
                          <span className="font-mono text-[11px] font-semibold">
                            +{ans.points} đ ({ans.timeTaken}s)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
