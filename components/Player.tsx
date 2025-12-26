
import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  Repeat, Shuffle, Maximize2, Heart, ListMusic, Activity 
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
  onNext: () => void;
  onPrev: () => void;
  onToggleQueue: () => void;
}

const Player: React.FC<PlayerProps> = ({ 
  currentSong, isPlaying, onTogglePlay, 
  progress, duration, onSeek,
  volume, onVolumeChange, onToggleEq, isEqOpen,
  onNext, onPrev, onToggleQueue
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Note: In a real environment, we'd connect the actual audio element to this analyzer.
  // For this demo, we simulate the visualization based on the actual playback state.
  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    let animationFrame: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = 2;
      const gap = 1;
      const count = 40;
      const centerX = canvas.width / 2;
      
      for (let i = 0; i < count; i++) {
        const factor = Math.sin(Date.now() * 0.01 + i) * 0.3 + 0.7;
        const h = (Math.random() * 0.3 + 0.7) * (canvas.height * 0.6) * factor;
        const x = i * (barWidth + gap);
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, 'var(--accent-color)');
        gradient.addColorStop(1, '#ffffff33');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - h, barWidth, h);
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
      <div className="flex items-center gap-5 w-1/4 min-w-[280px]">
        <img src={currentSong.coverUrl} className="w-16 h-16 rounded-2xl object-cover shadow-2xl border border-white/10" alt="" />
        <div className="min-w-0">
          <h4 className="font-bold text-base truncate text-white">{currentSong.title}</h4>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">{currentSong.artist}</p>
        </div>
        <button className="ml-auto text-zinc-600 hover:text-pink-500 transition-all">
          <Heart size={18} fill={currentSong.isFavorite ? "currentColor" : "none"} className={currentSong.isFavorite ? "text-pink-500" : ""} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 flex-1 max-w-2xl">
        <div className="flex items-center gap-8">
          <button className="text-zinc-600 hover:text-white transition-colors"><Shuffle size={16} /></button>
          <button onClick={onPrev} className="text-zinc-400 hover:text-white active:scale-90 transition-all"><SkipBack size={24} fill="currentColor" /></button>
          <button 
            onClick={onTogglePlay}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={onNext} className="text-zinc-400 hover:text-white active:scale-90 transition-all"><SkipForward size={24} fill="currentColor" /></button>
          <button className="text-zinc-600 hover:text-white transition-colors"><Repeat size={16} /></button>
        </div>
        
        <div className="w-full flex items-center gap-4">
          <span className="text-[10px] text-zinc-500 font-mono w-10 text-right">{formatTime(progress)}</span>
          <div className="flex-1 relative h-1 bg-white/5 rounded-full cursor-pointer group">
            <div 
              className="absolute h-full bg-[var(--accent-color)] rounded-full transition-all"
              style={{ width: `${(progress / duration) * 100}%` }}
            />
            <input 
              type="range" min="0" max={duration} value={progress}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono w-10">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-6 w-1/4">
        <div className="w-24 h-10 hidden xl:block">
           <canvas ref={canvasRef} width={100} height={30} className="w-full h-full opacity-40" />
        </div>

        <button onClick={onToggleQueue} className="p-2 text-zinc-500 hover:text-white transition-all"><ListMusic size={20}/></button>
        <button onClick={onToggleEq} className={`p-2 rounded-xl transition-all ${isEqOpen ? 'text-blue-500' : 'text-zinc-500 hover:text-white'}`}><Activity size={20}/></button>
        
        <div className="flex items-center gap-3 w-28 group">
          <Volume2 size={16} className="text-zinc-500 group-hover:text-white shrink-0" />
          <div className="flex-1 relative h-1 bg-white/10 rounded-full">
            <div className="absolute h-full bg-zinc-400 group-hover:bg-[var(--accent-color)] rounded-full" style={{ width: `${volume * 100}%` }} />
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => onVolumeChange(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
