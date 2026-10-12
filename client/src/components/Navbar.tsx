import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, PlusCircle, LogIn, BookOpen } from 'lucide-react';
import { sounds } from '../utils/sound';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isInGame?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, isInGame = false }) => {
  const [isMuted, setIsMuted] = useState(sounds.isMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#130b2b]/95 backdrop-blur-md border-b border-[#2d1b54] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <span className="text-2xl font-black text-white italic">Q</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
              quizizz
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-600/40 text-violet-300 font-semibold border border-violet-500/30">
                PRO
              </span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs (if not actively in game) */}
        {!isInGame && (
          <nav className="hidden md:flex items-center gap-1.5 bg-[#1f1242]/80 p-1.5 rounded-2xl border border-[#3b236d]">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                currentView === 'home'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-purple-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Thư viện đề
            </button>

            <button
              onClick={() => onNavigate('create')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                currentView === 'create'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-purple-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Tạo đề thi
            </button>

            <button
              onClick={() => onNavigate('join')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                currentView === 'join'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'text-emerald-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Vào phòng thi (PIN)
            </button>
          </nav>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="p-2.5 rounded-xl bg-[#24154e] hover:bg-[#341e70] border border-[#3f257a] text-purple-200 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toàn màn hình"
            className="p-2.5 rounded-xl bg-[#24154e] hover:bg-[#341e70] border border-[#3f257a] text-purple-200 hover:text-white transition-colors hidden sm:block"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {!isInGame && (
            <button
              onClick={() => onNavigate('join')}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-md"
            >
              <LogIn className="w-4 h-4" />
              Nhập PIN
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
