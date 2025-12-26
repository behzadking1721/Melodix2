
import React from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  Repeat, Shuffle, Maximize2, Heart, SlidersHorizontal 
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
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const newVol = Math.max(0, Math.min(1, volume + delta));
    onVolumeChange(newVol);
  };

  if (!currentSong) return null;

  return (
    <div className="h-24 mica border-t border-white/5 px-8 flex items-center justify-between gap-6 fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom-full duration-700">
      {/* Song Info */}
      <div className="flex items-center gap-4 w-1/4 min-w-[250px]">
        <img src={currentSong.coverUrl} className="w-14 h-14 rounded-xl object-cover shadow-2xl border border-white/10" alt="" />
        <div className="min-w-0">
          <h4 className="font-bold text-sm truncate text-white tracking-tight">{currentSong.title}</h4>
          <p className="text-[10px] text-zinc-500 truncate font-black uppercase tracking-wider">{currentSong.artist}</p>
        </div>
        <button className="ml-2 text-zinc-600 hover:text-pink-500 transition-all active:scale-90">
          <Heart size={18} fill={currentSong.isFavorite ? "currentColor" : "none"} className={currentSong.isFavorite ? "text-pink-500" : ""} />
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
        <div className="flex items-center gap-8">
          <button className="text-zinc-600 hover:text-white transition-colors"><Shuffle size={16} /></button>
          <button className="text-zinc-400 hover:text-white transition-colors active:scale-90"><SkipBack size={24} fill="currentColor" /></button>
          <button 
            onClick={onTogglePlay}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-xl"
          >
            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors active:scale-90"><SkipForward size={24} fill="currentColor" /></button>
          <button className="text-zinc-600 hover:text-white transition-colors"><Repeat size={16} /></button>
        </div>
        
        <div className="w-full flex items-center gap-4 px-2">
          <span className="text-[10px] text-zinc-500 font-mono w-10 text-right tabular-nums">{formatTime(progress)}</span>
          <div className="flex-1 relative group h-1 bg-white/10 rounded-full cursor-pointer">
            <div 
              className="absolute h-full bg-blue-500 rounded-full group-hover:bg-blue-400 transition-all shadow-[0_0_15px_rgba(96,205,255,0.4)]"
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

      {/* Right Side: Volume & EQ */}
      <div className="flex items-center justify-end gap-6 w-1/4">
        <button 
          onClick={onToggleEq} 
          className={`p-2 rounded-lg transition-all ${isEqOpen ? 'bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10' : 'text-zinc-500 hover:text-blue-400 hover:bg-white/5'}`}
        >
          <SlidersHorizontal size={20} />
        </button>
        
        <div 
          className="flex items-center gap-3 group w-32 cursor-ns-resize"
          onWheel={handleWheel}
        >
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
        
        <button className="text-zinc-500 hover:text-white transition-colors active:scale-90"><Maximize2 size={18} /></button>
      </div>
    </div>
  );
};

export default Player;
