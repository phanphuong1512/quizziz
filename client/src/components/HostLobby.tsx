import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Users, Play, Bot, UserX, Maximize2, Sparkles, Wifi } from 'lucide-react';
import type { Player } from '../types';
import { sounds } from '../utils/sound';

interface HostLobbyProps {
  pin: string;
  quizTitle: string;
  totalQuestions: number;
  players: Player[];
  onStartGame: () => void;
  onAddBot: () => void;
  onKickPlayer: (playerId: string) => void;
  onExit: () => void;
}

export const HostLobby: React.FC<HostLobbyProps> = ({
  pin,
  quizTitle,
  totalQuestions,
  players,
  onStartGame,
  onAddBot,
  onKickPlayer,
  onExit,
}) => {
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isQrZoomed, setIsQrZoomed] = useState(false);
  const [networkUrl, setNetworkUrl] = useState<string>('');

  // Detect public domain vs local IP for QR code generation
  useEffect(() => {
    const isLocalhost = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';

    if (!isLocalhost) {
      // Deployed on public internet (e.g. Render, Vercel) -> Use public HTTPS origin
      setNetworkUrl(window.location.origin);
      return;
    }

    // Local development -> Use local Wi-Fi IP for phone camera QR scanning
    fetch('/api/network-ip')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.localIp && data.localIp !== 'localhost') {
          const clientPort = window.location.port ? `:${window.location.port}` : '';
          setNetworkUrl(`http://${data.localIp}${clientPort}`);
        } else {
          setNetworkUrl(window.location.origin);
        }
      })
      .catch(() => {
        setNetworkUrl(window.location.origin);
      });
  }, []);

  const joinUrl = `${networkUrl || window.location.origin}/join?pin=${pin}`;

  const copyPin = () => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStart = () => {
    sounds.playCountdownTick(3);
    onStartGame();
  };

  // Format PIN for readability: "123 456"
  const formattedPin = pin.length === 6 ? `${pin.slice(0, 3)} ${pin.slice(3)}` : pin;

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col justify-between max-w-7xl mx-auto px-4 py-6">
      {/* Top Bar with Quiz Title & End button */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2d1b54] mb-6">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
            PHÒNG THI TRỰC TIẾP
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            {quizTitle}
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/40">
              {totalQuestions} câu
            </span>
          </h2>
        </div>

        <button
          onClick={onExit}
          className="text-xs font-bold text-purple-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-purple-800/40"
        >
          Hủy phòng
        </button>
      </div>

      {/* Centerpiece: Join Info & QR Code Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        {/* Left Side: Direct QR Code with Projector Zoom */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div
            onClick={() => setIsQrZoomed(true)}
            className="cursor-pointer group relative p-5 rounded-3xl bg-white text-gray-900 shadow-2xl transition-transform hover:scale-105 border-4 border-purple-500/40"
          >
            <QRCodeSVG
              value={joinUrl}
              size={230}
              level="H"
              includeMargin={false}
              className="rounded-xl"
            />
            <div className="absolute inset-0 bg-purple-900/70 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs text-white">
              <Maximize2 className="w-8 h-8 mb-2" />
              <span className="font-bold text-xs uppercase tracking-wider">Phóng to toàn màn hình</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-purple-300 bg-[#1e1240] px-4 py-2 rounded-xl border border-[#3b236d]">
            <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Quét bằng Camera điện thoại để vào ngay</span>
          </div>
        </div>

        {/* Right Side: Big PIN & Instructions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-7 rounded-3xl bg-gradient-to-br from-[#1c103e] via-[#241352] to-[#1a0f39] border-2 border-[#43267f] shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-widest mb-3">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Cách tham gia trò chơi
            </div>

            <div className="text-sm text-purple-200 mb-6 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600/40 text-purple-200 font-black text-xs flex items-center justify-center">1</span>
                <span>Mở máy ảnh điện thoại quét mã QR bên cạnh</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600/40 text-purple-200 font-black text-xs flex items-center justify-center">2</span>
                <span>Hoặc vào website và nhập mã phòng sau:</span>
              </div>
            </div>

            {/* Giant Game PIN Display */}
            <div className="p-5 rounded-2xl bg-[#0e0724] border-2 border-purple-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 mb-5 shadow-inner">
              <div className="text-center sm:text-left">
                <span className="text-[11px] font-extrabold text-purple-400 uppercase tracking-wider">MÃ PHÒNG (GAME PIN)</span>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-widest font-mono">
                  {formattedPin}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={copyPin}
                  className="quizizz-btn-3d flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md border-b-4 border-purple-800"
                >
                  {copiedPin ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copiedPin ? 'Đã sao chép!' : 'Chép PIN'}
                </button>

                <button
                  onClick={copyLink}
                  className="quizizz-btn-3d flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#281754] hover:bg-[#382075] text-purple-200 hover:text-white font-bold text-xs border border-purple-500/40"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Đã chép link!' : 'Chép link'}
                </button>
              </div>
            </div>

            {/* Direct Join Link */}
            <p className="text-xs text-purple-300/70 truncate bg-black/20 p-2.5 rounded-xl border border-purple-900/30">
              🔗 Link tham gia: <span className="font-mono text-purple-200 select-all">{joinUrl}</span>
            </p>
          </div>

          {/* Quick Actions (Add Bot, Start) */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={onAddBot}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#201247] hover:bg-[#2c1961] text-purple-200 hover:text-white font-bold text-xs border border-[#3b216d] transition-colors"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              + Thêm người chơi ảo (Bot)
            </button>

            <button
              onClick={handleStart}
              disabled={players.length === 0}
              className={`quizizz-btn-3d flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-base shadow-2xl transition-all ${
                players.length > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white border-b-4 border-emerald-700 shadow-emerald-500/30 cursor-pointer pulse-glow'
                  : 'bg-gray-800 text-gray-500 border-b-4 border-gray-900 cursor-not-allowed opacity-50'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              BẮT ĐẦU TRÒ CHƠI ({players.length})
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Area: Real-time Players in Lobby */}
      <div className="mt-8 pt-6 border-t border-[#2d1b54]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Người chơi trong phòng ({players.length})</span>
          </div>

          {players.length === 0 && (
            <span className="text-xs text-purple-400/80 animate-pulse">
              Đang đợi người chơi quét mã hoặc nhập mã PIN...
            </span>
          )}
        </div>

        {players.length === 0 ? (
          <div className="p-8 rounded-2xl border-2 border-dashed border-[#341d66] bg-[#140b2e]/60 flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-2 float-avatar">📱</div>
            <p className="text-sm font-semibold text-purple-200">Chưa có ai vào phòng</p>
            <p className="text-xs text-purple-400/70 mt-1 max-w-sm">
              Hãy dùng điện thoại quét mã QR ở trên hoặc bấm nút <span className="font-bold text-purple-300">"+ Thêm người chơi ảo (Bot)"</span> để thử ngay!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="group relative p-3 rounded-2xl bg-[#1b103e] border border-[#3b216d] hover:border-purple-400 flex items-center gap-2.5 transition-all shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center text-xl float-avatar border border-purple-500/30">
                  {player.avatar || '🦊'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{player.name}</p>
                  {player.isBot && (
                    <span className="text-[10px] text-purple-400 font-semibold">Bot</span>
                  )}
                </div>

                {/* Kick Button */}
                <button
                  onClick={() => onKickPlayer(player.id)}
                  title="Mời ra khỏi phòng"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-300 transition-opacity"
                >
                  <UserX className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Projector QR Modal */}
      {isQrZoomed && (
        <div
          onClick={() => setIsQrZoomed(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#180e38] border-2 border-purple-500/60 rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative"
          >
            <span className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-1">
              CHẾ ĐỘ MÁY CHIẾU LỚP HỌC
            </span>
            <h3 className="text-2xl font-black text-white mb-2">{quizTitle}</h3>
            <p className="text-xs text-purple-200/80 mb-6">
              Học sinh dùng điện thoại mở Camera quét mã này để tham gia
            </p>

            <div className="p-6 bg-white rounded-3xl shadow-2xl border-4 border-purple-500 mb-6">
              <QRCodeSVG value={joinUrl} size={280} level="H" includeMargin={false} />
            </div>

            <div className="w-full p-4 rounded-2xl bg-[#0e0724] border border-purple-500/40 mb-6">
              <span className="text-[11px] font-bold text-purple-400 block mb-1">HOẶC NHẬP MÃ PIN</span>
              <div className="text-4xl font-black text-white font-mono tracking-widest">
                {formattedPin}
              </div>
            </div>

            <button
              onClick={() => setIsQrZoomed(false)}
              className="quizizz-btn-3d w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm border-b-4 border-purple-800"
            >
              Thu nhỏ màn hình
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
