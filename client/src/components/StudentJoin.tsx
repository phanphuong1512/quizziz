import React, { useState, useEffect } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { sounds } from '../utils/sound';

interface StudentJoinProps {
  initialPin?: string;
  onJoin: (pin: string, name: string, avatar: string) => void;
  error?: string | null;
  isLoading?: boolean;
}

const AVATARS = ['🦊', '🦁', '🐼', '🦉', '🚀', '⚡', '🦄', '🤖', '👾', '🐯', '🍕', '🏆'];

export const StudentJoin: React.FC<StudentJoinProps> = ({
  initialPin = '',
  onJoin,
  error,
  isLoading = false,
}) => {
  const [pin, setPin] = useState(initialPin);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  useEffect(() => {
    if (initialPin) {
      setPin(initialPin);
    }
  }, [initialPin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.replace(/\s+/g, '').trim();
    const cleanName = name.trim();

    if (!cleanPin) {
      alert('Vui lòng nhập mã PIN phòng!');
      return;
    }
    if (!cleanName) {
      alert('Vui lòng nhập tên của bạn!');
      return;
    }

    sounds.playClick();
    onJoin(cleanPin, cleanName, selectedAvatar);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#1b103e] via-[#160d33] to-[#110a28] border-2 border-[#3d2275] shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-600/40">
              <span className="text-3xl font-black text-white italic">Q</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Tham gia phòng thi
            </h1>
            <p className="text-xs text-purple-300 mt-1">
              Nhập mã PIN và tên để tranh tài trực tiếp!
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center gap-2 mb-6">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* PIN Input */}
            <div>
              <label className="block text-[11px] font-black text-purple-300 uppercase tracking-widest mb-1.5">
                MÃ PHÒNG (GAME PIN)
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="VD: 482910"
                maxLength={8}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#0e0724] border-2 border-purple-500/40 focus:border-purple-400 text-white font-mono text-center text-2xl font-black tracking-widest focus:outline-none"
                required
              />
            </div>

            {/* Nickname Input */}
            <div>
              <label className="block text-[11px] font-black text-purple-300 uppercase tracking-widest mb-1.5">
                TÊN CỦA BẠN (BIỆT DANH)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên hiển thị..."
                maxLength={20}
                className="w-full px-4 py-3 rounded-2xl bg-[#0e0724] border border-[#3b216d] focus:border-purple-400 text-white text-base font-bold text-center focus:outline-none"
                required
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-[11px] font-black text-purple-300 uppercase tracking-widest mb-2 text-center">
                CHỌN LINH VẬT CỦA BẠN
              </label>
              <div className="grid grid-cols-6 gap-2 p-3 rounded-2xl bg-[#0e0724] border border-[#301b5e]">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedAvatar(av);
                    }}
                    className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                      selectedAvatar === av
                        ? 'bg-purple-600 scale-110 shadow-lg shadow-purple-600/50 ring-2 ring-white'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="quizizz-btn-3d w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-base shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? 'ĐANG KẾT NỐI...' : 'VÀO PHÒNG NGAY'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
