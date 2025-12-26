
import React, { useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  Repeat, Shuffle, Maximize2, Heart, SlidersHorizontal, Activity 
} from 'lucide-react';
import { Song } from '../types';

interface PlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  progress: number;
  duration: number;
  onSeek: (value: number) => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  onToggleEq: () => void;
  isEqOpen: boolean;
}

const Player: React.FC<PlayerProps> = ({ 
  currentSong, isPlaying, onTogglePlay, 
  progress, duration, onSeek,
  volume, onVolumeChange, onToggleEq, isEqOpen
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    let animationFrame: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#3b82f633';
      
      const barWidth = 3;
      const gap = 2;
      const count = 40;
      
      for (let i = 0; i < count; i++) {
        const h = Math.random() * canvas.height * 0.8;
        ctx.fillRect(i * (barWidth + gap), canvas.height - h, barWidth, h);
      }
      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <div className="h-28 mica border-t border-white/5 px-10 flex items-center justify-between gap-8 fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom-full duration-700">
      {/* Song Info */}
      <div className="flex items-center gap-5 w-1/4 min-w-[280px]">
        <div className="relative group">
          <img src={currentSong.coverUrl} className="w-16 h-16 rounded-2xl object-cover shadow-2xl border border-white/10 group-hover:scale-105 transition-transform" alt="" />
          <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex items-center justify-center">
            <Maximize2 size={16} className="text-white" />
          </div>
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-base truncate text-white tracking-tight">{currentSong.title}</h4>
          <p className="text-[10px] text-zinc-500 truncate font-black uppercase tracking-[0.2em] mt-1">{currentSong.artist}</p>
        </div>
        <button className="ml-auto text-zinc-600 hover:text-pink-500 transition-all active:scale-90">
          <Heart size={20} fill={currentSong.isFavorite ? "currentColor" : "none"} className={currentSong.isFavorite ? "text-pink-500" : ""} />
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col items-center gap-3 flex-1 max-w-3xl">
        <div className="flex items-center gap-10">
          <button className="text-zinc-600 hover:text-white transition-colors"><Shuffle size={18} /></button>
          <button className="text-zinc-400 hover:text-white transition-colors active:scale-90"><SkipBack size={26} fill="currentColor" /></button>
          <button 
            onClick={onTogglePlay}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors active:scale-90"><SkipForward size={26} fill="currentColor" /></button>
          <button className="text-zinc-600 hover:text-white transition-colors"><Repeat size={18} /></button>
        </div>
        
        <div className="w-full flex items-center gap-4 px-2">
          <span className="text-[10px] text-zinc-500 font-mono w-10 text-right tabular-nums">{formatTime(progress)}</span>
          <div className="flex-1 relative group h-1.5 bg-white/5 rounded-full cursor-pointer">
            <div 
              className="absolute h-full bg-blue-500 rounded-full group-hover:bg-blue-400 transition-all shadow-[0_0_15px_rgba(59,130,246,0.6)]"
              style={{ width: `${(progress / duration) * 100}%` }}
            />
            <input 
              type="range" min="0" max={duration} value={progress}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono w-10 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Side: Visualizer & Volume */}
      <div className="flex items-center justify-end gap-6 w-1/4">
        <div className="w-32 h-12 relative overflow-hidden hidden xl:block">
           <canvas ref={canvasRef} width={120} height={40} className="w-full h-full opacity-60" />
        </div>

        <button 
          onClick={onToggleEq} 
          className={`p-2.5 rounded-xl transition-all ${isEqOpen ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/20' : 'text-zinc-500 hover:text-blue-400 hover:bg-white/5'}`}
        >
          <Activity size={20} />
        </button>
        
        <div className="flex items-center gap-3 group w-32">
          <Volume2 size={18} className="text-zinc-500 group-hover:text-white shrink-0" />
          <div className="flex-1 relative h-1 bg-white/10 rounded-full">
            <div 
              className="absolute h-full bg-zinc-400 group-hover:bg-blue-500 transition-all rounded-full"
              style={{ width: `${volume * 100}%` }}
            />
            <input 
              type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
