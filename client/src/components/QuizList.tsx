import React, { useState } from 'react';
import { Play, Eye, Plus, Sparkles, HelpCircle, Clock, Trash2, Award } from 'lucide-react';
import type { Quiz } from '../types';
import { sounds } from '../utils/sound';

interface QuizListProps {
  quizzes: Quiz[];
  onHostQuiz: (quizId: string) => void;
  onCreateNew: () => void;
  onDeleteQuiz?: (quizId: string) => void;
}

export const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  onHostQuiz,
  onCreateNew,
  onDeleteQuiz,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);

  const categories = ['all', ...Array.from(new Set(quizzes.map((q) => q.category)))];

  const filteredQuizzes =
    selectedCategory === 'all'
      ? quizzes
      : quizzes.filter((q) => q.category === selectedCategory);

  const handleHost = (quizId: string) => {
    sounds.playClick();
    onHostQuiz(quizId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-purple-950/90 border border-purple-700/40 p-8 mb-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Trải nghiệm thi đấu trực tiếp Quizizz
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            Tạo phòng thi, Quét mã QR & Đua top bảng xếp hạng!
          </h1>
          <p className="text-purple-200/90 text-sm md:text-base leading-relaxed mb-6">
            Chọn một bộ đề bên dưới để tạo phòng, học sinh chỉ cần quét mã QR bằng điện thoại hoặc nhập mã PIN là vào ngay. Thống kê điểm số và phân tích từng câu hỏi tức thì!
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onCreateNew}
              className="quizizz-btn-3d flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-lg shadow-purple-900/50 border-b-4 border-purple-800"
            >
              <Plus className="w-4 h-4" />
              Tạo bộ câu hỏi mới
            </button>
            <div className="flex items-center gap-2 text-xs text-purple-300/80 bg-purple-950/60 px-3.5 py-2.5 rounded-xl border border-purple-800/40">
              <Award className="w-4 h-4 text-amber-400" />
              Hỗ trợ bot tự động giả lập người chơi để test
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-6 -bottom-6 text-9xl opacity-15 select-none pointer-events-none hidden lg:block">
          ⚡🎮🏆
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-[#1b103b] text-purple-300 hover:bg-[#281854] hover:text-white border border-[#352069]'
            }`}
          >
            {cat === 'all' ? 'Tất cả chủ đề' : cat}
          </button>
        ))}
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="group relative bg-[#170e33] hover:bg-[#1d1240] rounded-2xl border border-[#341e69] hover:border-purple-500/50 transition-all duration-200 overflow-hidden shadow-lg flex flex-col justify-between"
          >
            {/* Card Header with Banner Color */}
            <div className={`h-24 bg-gradient-to-r ${quiz.bannerColor || 'from-indigo-600 to-purple-800'} p-4 relative flex items-center justify-between`}>
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/20">
                {quiz.icon || '📝'}
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white/90 border border-white/10">
                {quiz.category}
              </span>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-1.5">
                  {quiz.title}
                </h3>
                <p className="text-xs text-purple-300/80 line-clamp-2 leading-relaxed mb-4">
                  {quiz.description}
                </p>
              </div>

              {/* Meta stats */}
              <div className="flex items-center gap-4 text-xs text-purple-300/70 border-t border-[#291754] pt-3 mb-4">
                <div className="flex items-center gap-1.5 font-medium">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>{quiz.questions.length} câu hỏi</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>~{Math.round(quiz.questions.length * 0.5)} phút</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleHost(quiz.id)}
                  className="quizizz-btn-3d flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md border-b-4 border-purple-800"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  TẠO PHÒNG THI
                </button>

                <button
                  onClick={() => setPreviewQuiz(quiz)}
                  title="Xem trước câu hỏi"
                  className="p-2.5 rounded-xl bg-[#25154d] hover:bg-[#341d6d] text-purple-200 hover:text-white border border-[#3e237a] transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {onDeleteQuiz && !quiz.id.startsWith('quiz-') && (
                  <button
                    onClick={() => onDeleteQuiz(quiz.id)}
                    title="Xóa đề này"
                    className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Create New Card */}
        <div
          onClick={onCreateNew}
          className="cursor-pointer min-h-[260px] rounded-2xl border-2 border-dashed border-[#3c2378] hover:border-purple-500 bg-[#160d33]/50 hover:bg-[#1b103e] p-6 flex flex-col items-center justify-center text-center transition-all group"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 group-hover:bg-purple-600 text-purple-400 group-hover:text-white flex items-center justify-center mb-4 transition-all shadow-inner">
            <Plus className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-white mb-1 group-hover:text-purple-300">
            Tự tạo bộ câu hỏi
          </h4>
          <p className="text-xs text-purple-300/70 max-w-xs">
            Thêm câu hỏi trắc nghiệm của riêng bạn với thời gian, đáp án và hình minh họa.
          </p>
        </div>
      </div>

      {/* Preview Modal */}
      {previewQuiz && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#180f36] border border-[#392173] w-full max-w-2xl rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#2d1b5a] mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{previewQuiz.icon || '📝'}</span>
                  {previewQuiz.title}
                </h3>
                <p className="text-xs text-purple-300 mt-1">{previewQuiz.questions.length} câu hỏi • Chủ đề: {previewQuiz.category}</p>
              </div>
              <button
                onClick={() => setPreviewQuiz(null)}
                className="text-purple-300 hover:text-white text-sm font-bold px-3 py-1.5 rounded-lg bg-white/5"
              >
                Đóng
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {previewQuiz.questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 rounded-xl bg-[#201347] border border-[#341d6d]">
                  <p className="text-sm font-bold text-white mb-3">
                    <span className="text-purple-400 font-extrabold mr-2">Câu {idx + 1}:</span>
                    {q.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                          oIdx === q.correctIndex
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-[#150c30] text-purple-200 border border-[#2b1859]'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-bold text-[10px]">
                          {['A', 'B', 'C', 'D'][oIdx]}
                        </span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="text-[11px] text-purple-300/80 bg-purple-950/40 p-2 rounded-lg border border-purple-900/30">
                      💡 <span className="font-semibold text-purple-200">Giải thích:</span> {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#2d1b5a] flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  const id = previewQuiz.id;
                  setPreviewQuiz(null);
                  handleHost(id);
                }}
                className="quizizz-btn-3d px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-lg border-b-4 border-purple-800"
              >
                Tạo phòng thi với bộ đề này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
