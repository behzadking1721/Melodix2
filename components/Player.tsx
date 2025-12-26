
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

  // Stage 4: Waveform Seekbar Visualizer
  useEffect(() => {
    if (!waveformRef.current || !currentSong) return;
    const canvas = waveformRef.current;
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;
    
    // Static Waveform Generation based on Song ID (Simulation of pre-scanned data)
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    
    const bars = 100;
    const barWidth = width / bars;
    
    for (let i = 0; i < bars; i++) {
      // Deterministic noise based on song ID for consistent waveform
      const seed = (parseInt(currentSong.id) || 1) * i;
      const h = (Math.abs(Math.sin(seed) * 0.5) + 0.2) * height;
      ctx.fillRect(i * barWidth, (height - h) / 2, barWidth - 1, h);
    }
  }, [currentSong?.id]);

  // Stage 4: Spectrum Analyzer (FFT simulation)
  useEffect(() => {
    if (!isPlaying || !spectrumRef.current || !visualizationEnabled) return;
    const canvas = spectrumRef.current;
    const ctx = canvas.getContext('2d')!;
    let animationFrame: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const count = 30;
      const barWidth = canvas.width / count;
      
      for (let i = 0; i < count; i++) {
        const factor = Math.sin(Date.now() * 0.01 + i * 0.3) * 0.5 + 0.5;
        const h = factor * canvas.height * 0.8;
        ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + factor * 0.7})`;
        ctx.beginPath();
        ctx.roundRect(i * barWidth, canvas.height - h, barWidth - 2, h, 2);
        ctx.fill();
      }
      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, visualizationEnabled]);

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
          <h4 className="font-bold text-base truncate text-white tracking-tight">{currentSong.title}</h4>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">{currentSong.artist}</p>
        </div>
        <button className="ml-auto text-zinc-600 hover:text-pink-500 transition-all">
          <Heart size={18} fill={currentSong.isFavorite ? "currentColor" : "none"} className={currentSong.isFavorite ? "text-pink-500" : ""} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
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
        
        <div className="w-full flex items-center gap-4 group relative">
          <span className="text-[10px] text-zinc-500 font-mono w-10 text-right">{formatTime(progress)}</span>
          
          <div className="flex-1 relative h-6 flex items-center">
            {/* Waveform Background */}
            <canvas ref={waveformRef} width={400} height={24} className="absolute inset-0 w-full h-full pointer-events-none opacity-40" />
            
            {/* Progress Bar Overlay */}
            <div className="absolute inset-y-0 left-0 bg-blue-500/20 pointer-events-none border-r border-blue-400/50" style={{ width: `${(progress / duration) * 100}%` }} />
            
            <input 
              type="range" min="0" max={duration} value={progress}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            
            {/* Minimal Seek Indicator */}
            <div className="absolute h-full w-1 bg-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ left: `${(progress / duration) * 100}%` }} />
          </div>

          <span className="text-[10px] text-zinc-500 font-mono w-10">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-6 w-1/4">
        {visualizationEnabled && (
          <div className="w-24 h-10 hidden xl:block">
             <canvas ref={spectrumRef} width={100} height={40} className="w-full h-full opacity-60" />
          </div>
        )}

        <button onClick={onToggleQueue} className="p-2 text-zinc-500 hover:text-white transition-all"><ListMusic size={20}/></button>
        <button onClick={onToggleEq} className={`p-2 rounded-xl transition-all ${isEqOpen ? 'text-blue-500' : 'text-zinc-500 hover:text-white'}`}><Activity size={20}/></button>
        
        <div className="flex items-center gap-3 w-28 group">
          <Volume2 size={16} className="text-zinc-500 group-hover:text-white shrink-0" />
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
