import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft, Save, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import type { Quiz, Question } from '../types';

interface QuizEditorProps {
  onSave: (quiz: Partial<Quiz>) => Promise<void>;
  onCancel: () => void;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tổng hợp');
  const [icon, setIcon] = useState('🎯');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q-1',
      question: 'Thủ đô của nước Việt Nam là gì?',
      options: ['TP. Hồ Chí Minh', 'Đà Nẵng', 'Hà Nội', 'Huế'],
      correctIndex: 2,
      timeLimit: 20,
      explanation: 'Hà Nội là thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.',
    },
    {
      id: 'q-2',
      question: 'Phép tính nào sau đây cho kết quả bằng 100?',
      options: ['25 x 3', '10 x 10', '50 + 40', '200 / 3'],
      correctIndex: 1,
      timeLimit: 20,
      explanation: '10 x 10 = 100.',
    },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = () => {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      timeLimit: 20,
      explanation: '',
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: unknown) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    const options = [...updated[qIndex].options];
    options[optIndex] = value;
    updated[qIndex].options = options;
    setQuestions(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên bộ câu hỏi!');
      return;
    }

    // Validate that questions have content
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        alert(`Vui lòng nhập nội dung cho câu hỏi số ${i + 1}`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!questions[i].options[j].trim()) {
          alert(`Vui lòng điền đủ 4 đáp án cho câu hỏi số ${i + 1}`);
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || 'Bộ câu hỏi tự tạo',
        category,
        icon,
        questions,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-6 border-b border-[#2d1b54] mb-8">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-sm font-bold text-purple-300 hover:text-white px-3 py-2 rounded-xl bg-[#1c103d] border border-[#352069]"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        <h1 className="text-2xl font-black text-white">Tạo bộ câu hỏi mới</h1>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="quizizz-btn-3d flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm shadow-md border-b-4 border-purple-800 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Đang lưu...' : 'Lưu bộ đề'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info Card */}
        <div className="p-6 rounded-3xl bg-[#170e33] border border-[#341e69] space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Thông tin chung
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
                Tên bộ câu hỏi *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Kiểm tra Toán 15 phút, Đố vui tiếng Anh..."
                className="w-full px-4 py-3 rounded-xl bg-[#201347] border border-[#3c2378] text-white placeholder-purple-400/50 text-sm focus:outline-none focus:border-purple-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
                Biểu tượng (Emoji)
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#201347] border border-[#3c2378] text-white text-center text-xl focus:outline-none focus:border-purple-500"
                maxLength={4}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
                Chủ đề / Thể loại
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#201347] border border-[#3c2378] text-white text-sm focus:outline-none focus:border-purple-500 font-medium"
              >
                <option value="Toán học">Toán học</option>
                <option value="Khoa học">Khoa học</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Lịch sử & Địa lý">Lịch sử & Địa lý</option>
                <option value="Đố vui IQ">Đố vui IQ</option>
                <option value="Tổng hợp">Tổng hợp</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
                Mô tả ngắn
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả về đối tượng, nội dung bài thi..."
                className="w-full px-4 py-3 rounded-xl bg-[#201347] border border-[#3c2378] text-white placeholder-purple-400/50 text-sm focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Danh sách câu hỏi ({questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="quizizz-btn-3d flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md border-b-4 border-purple-800"
            >
              <Plus className="w-4 h-4" />
              Thêm câu hỏi
            </button>
          </div>

          {questions.map((q, qIndex) => (
            <div
              key={q.id || qIndex}
              className="p-6 rounded-3xl bg-[#170e33] border border-[#341e69] space-y-4 shadow-xl relative"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-black">
                  CÂU HỎI {qIndex + 1}
                </span>

                <div className="flex items-center gap-3">
                  {/* Time limit selector */}
                  <div className="flex items-center gap-1.5 text-xs text-purple-300 bg-[#201347] px-3 py-1.5 rounded-xl border border-[#3c2378]">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <select
                      value={q.timeLimit || 20}
                      onChange={(e) => updateQuestion(qIndex, 'timeLimit', Number(e.target.value))}
                      className="bg-transparent text-white font-bold focus:outline-none"
                    >
                      <option value={10} className="bg-[#1b103b]">10 giây</option>
                      <option value={15} className="bg-[#1b103b]">15 giây</option>
                      <option value={20} className="bg-[#1b103b]">20 giây</option>
                      <option value={30} className="bg-[#1b103b]">30 giây</option>
                      <option value={45} className="bg-[#1b103b]">45 giây</option>
                      <option value={60} className="bg-[#1b103b]">60 giây</option>
                    </select>
                  </div>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      title="Xóa câu hỏi này"
                      className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
                  Nội dung câu hỏi
                </label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  placeholder="Nhập nội dung câu hỏi tại đây..."
                  className="w-full px-4 py-3 rounded-xl bg-[#201347] border border-[#3c2378] text-white placeholder-purple-400/50 text-base focus:outline-none focus:border-purple-500 font-semibold"
                  required
                />
              </div>

              {/* Options Grid (Quizizz 4 colored styles) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
                  4 Lựa chọn (Bấm vào nút tròn để chọn đáp án ĐÚNG)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: 'A', bg: 'border-l-4 border-l-red-500' },
                    { label: 'B', bg: 'border-l-4 border-l-blue-500' },
                    { label: 'C', bg: 'border-l-4 border-l-amber-500' },
                    { label: 'D', bg: 'border-l-4 border-l-emerald-500' },
                  ].map((item, optIndex) => {
                    const isCorrect = q.correctIndex === optIndex;
                    return (
                      <div
                        key={optIndex}
                        onClick={() => updateQuestion(qIndex, 'correctIndex', optIndex)}
                        className={`flex items-center gap-3 p-3 rounded-2xl bg-[#201347] border cursor-pointer transition-all ${
                          isCorrect
                            ? 'border-emerald-500 shadow-md shadow-emerald-500/20 bg-emerald-950/20'
                            : 'border-[#3c2378] hover:border-purple-400'
                        } ${item.bg}`}
                      >
                        <button
                          type="button"
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                            isCorrect
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white/10 text-purple-300 hover:bg-white/20'
                          }`}
                        >
                          {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : item.label}
                        </button>
                        <input
                          type="text"
                          value={q.options[optIndex]}
                          onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                          placeholder={`Đáp án ${item.label}...`}
                          className="flex-1 bg-transparent text-sm text-white placeholder-purple-400/40 focus:outline-none font-medium"
                          required
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
                  Giải thích (Hiển thị khi học sinh trả lời xong)
                </label>
                <input
                  type="text"
                  value={q.explanation || ''}
                  onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                  placeholder="Giải thích vì sao đáp án này đúng..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#201347] border border-[#3c2378] text-white placeholder-purple-400/40 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-[#3c2378] hover:border-purple-500 text-purple-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors bg-[#170e33]/50"
          >
            <Plus className="w-5 h-5" />
            Thêm câu hỏi tiếp theo
          </button>
        </div>

        <div className="pt-6 border-t border-[#2d1b54] flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl bg-[#201347] hover:bg-[#2c1b61] text-purple-300 hover:text-white font-bold text-sm"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="quizizz-btn-3d px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-xl border-b-4 border-purple-800 disabled:opacity-50"
          >
            {isSaving ? 'Đang lưu bộ đề...' : 'LƯU VÀ HOÀN TẤT'}
          </button>
        </div>
      </form>
    </div>
  );
};
