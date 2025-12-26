
import React, { useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  Repeat, Shuffle, Heart, ListMusic, Activity 
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
  visualizationEnabled?: boolean;
}

const Player: React.FC<PlayerProps> = ({ 
  currentSong, isPlaying, onTogglePlay, 
  progress, duration, onSeek,
  volume, onVolumeChange, onToggleEq, isEqOpen,
  onNext, onPrev, onToggleQueue, visualizationEnabled = true
}) => {
  const spectrumRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);

  // Advanced Spectrum Visualizer (FFT Simulation)
  useEffect(() => {
    if (!isPlaying || !spectrumRef.current || !visualizationEnabled) return;
    const canvas = spectrumRef.current;
    const ctx = canvas.getContext('2d')!;
    let animationFrame: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 40;
      const barWidth = canvas.width / bars;
      
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#8b5cf6');

      for (let i = 0; i < bars; i++) {
        // Frequency simulation with intelligent noise
        const factor = Math.sin(Date.now() * 0.008 + i * 0.2) * 0.4 + 0.6;
        const h = factor * canvas.height * 0.9;
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3 + factor * 0.7;
        
        // Dynamic bar rendering with rounded tops
        ctx.beginPath();
        const x = i * barWidth;
        const y = canvas.height - h;
        const w = barWidth - 1.5;
        const r = 3;
        
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, canvas.height);
        ctx.lineTo(x, canvas.height);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.fill();
      }
      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, visualizationEnabled]);

  // Waveform Seekbar Generation
  useEffect(() => {
    if (!waveformRef.current || !currentSong) return;
    const canvas = waveformRef.current;
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    const bars = 150;
    const barWidth = width / bars;
    
    for (let i = 0; i < bars; i++) {
      const seed = (parseInt(currentSong.id.slice(-4), 16) || 1) * i;
      const h = (Math.abs(Math.sin(seed * 0.05) * 0.6) + 0.1) * height;
      
      const isPlayed = (i / bars) < (progress / duration);
      ctx.fillStyle = isPlayed ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255, 255, 255, 0.15)';
      
      const x = i * barWidth;
      const y = (height - h) / 2;
      ctx.fillRect(x, y, barWidth - 1, h);
    }
  }, [currentSong?.id, progress, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <div className="h-24 mica border-t border-white/5 px-10 flex items-center justify-between gap-8 fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom-full duration-700">
      <div className="flex items-center gap-4 w-1/4 min-w-[250px]">
        <img src={currentSong.coverUrl} className="w-14 h-14 rounded-xl object-cover shadow-xl border border-white/10" alt="" />
        <div className="min-w-0">
          <h4 className="font-bold text-sm truncate text-white tracking-tight">{currentSong.title}</h4>
          <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">{currentSong.artist}</p>
        </div>
        <button className="ml-auto text-zinc-600 hover:text-pink-500 transition-all">
          <Heart size={16} fill={currentSong.isFavorite ? "currentColor" : "none"} className={currentSong.isFavorite ? "text-pink-500" : ""} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 flex-1 max-w-xl">
        <div className="flex items-center gap-6">
          <button className="text-zinc-600 hover:text-white transition-colors"><Shuffle size={14} /></button>
          <button onClick={onPrev} className="text-zinc-400 hover:text-white active:scale-90 transition-all"><SkipBack size={20} fill="currentColor" /></button>
          <button 
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>
          <button onClick={onNext} className="text-zinc-400 hover:text-white active:scale-90 transition-all"><SkipForward size={20} fill="currentColor" /></button>
          <button className="text-zinc-600 hover:text-white transition-colors"><Repeat size={14} /></button>
        </div>
        
        <div className="w-full flex items-center gap-3 group relative">
          <span className="text-[9px] text-zinc-500 font-mono w-8 text-right">{formatTime(progress)}</span>
          
          <div className="flex-1 relative h-6 flex items-center">
            <canvas ref={waveformRef} width={600} height={20} className="absolute inset-0 w-full h-full pointer-events-none" />
            <input 
              type="range" min="0" max={duration} value={progress}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>

          <span className="text-[9px] text-zinc-500 font-mono w-8">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-5 w-1/4">
        {visualizationEnabled && (
          <div className="w-20 h-8 hidden xl:block">
             <canvas ref={spectrumRef} width={80} height={32} className="w-full h-full opacity-70" />
          </div>
        )}

        <button onClick={onToggleQueue} className="p-2 text-zinc-500 hover:text-white transition-all"><ListMusic size={18}/></button>
        <button onClick={onToggleEq} className={`p-2 rounded-xl transition-all ${isEqOpen ? 'text-blue-500' : 'text-zinc-500 hover:text-white'}`}><Activity size={18}/></button>
        
        <div className="flex items-center gap-2 w-24 group">
          <Volume2 size={14} className="text-zinc-500 group-hover:text-white shrink-0" />
          <div className="flex-1 relative h-1 bg-white/10 rounded-full">
            <div className="absolute h-full bg-zinc-400 group-hover:bg-blue-500 rounded-full" style={{ width: `${volume * 100}%` }} />
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => onVolumeChange(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
