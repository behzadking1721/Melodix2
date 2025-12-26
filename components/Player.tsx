
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  Repeat, Shuffle, Heart, ListMusic, Activity 
} from 'lucide-react';
import { Song } from '../types';
import { AudioEngine } from '../services/audioEngine';

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
  waveformEnabled?: boolean;
}

const Player: React.FC<PlayerProps> = ({ 
  currentSong, isPlaying, onTogglePlay, 
  progress, duration, onSeek,
  volume, onVolumeChange, onToggleEq, isEqOpen,
  onNext, onPrev, onToggleQueue, 
  visualizationEnabled = true,
  waveformEnabled = true
}) => {
  const spectrumRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const engine = AudioEngine.getInstance();
  const [wavePeaks, setWavePeaks] = useState<number[]>([]);
  
  // Performance Profiling: 30 FPS Throttling
  const lastUpdateRef = useRef<number>(0);
  const FPS_LIMIT = 30; 
  const FRAME_INTERVAL = 1000 / FPS_LIMIT;

  // Optimized Spectrum Visualizer
  useEffect(() => {
    if (!isPlaying || !spectrumRef.current || !visualizationEnabled) return;
    
    const canvas = spectrumRef.current;
    const ctx = canvas.getContext('2d', { alpha: false })!; // Alpha: false for GPU performance
    let animationFrame: number;

    const render = (time: number) => {
      if (time - lastUpdateRef.current < FRAME_INTERVAL) {
        animationFrame = requestAnimationFrame(render);
        return;
      }
      lastUpdateRef.current = time;

      const dataArray = engine.getFrequencyData();
      
      // Draw background manually since alpha is false
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const bars = 25;
      const barWidth = canvas.width / bars;
      
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');

      for (let i = 0; i < bars; i++) {
        const index = Math.floor(i * (dataArray.length / bars));
        const val = dataArray[index] / 255;
        const h = val * canvas.height;
        
        ctx.globalAlpha = 0.3 + val * 0.7;
        ctx.fillRect(i * barWidth, canvas.height - h, barWidth - 2, h);
      }
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, visualizationEnabled]);

  // Efficient Waveform Loading
  useEffect(() => {
    if (currentSong && waveformEnabled) {
      // Use requestIdleCallback to decode without blocking UI
      const task = (window as any).requestIdleCallback(() => {
        engine.getWaveformData(currentSong.url, 80).then(setWavePeaks);
      });
      return () => (window as any).cancelIdleCallback(task);
    } else {
      setWavePeaks([]);
    }
  }, [currentSong?.id, waveformEnabled]);

  // Optimized Waveform Canvas (Render only on progress change)
  useEffect(() => {
    if (!waveformRef.current || !waveformEnabled || wavePeaks.length === 0) return;
    
    const canvas = waveformRef.current;
    const ctx = canvas.getContext('2d')!;
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / wavePeaks.length;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < wavePeaks.length; i++) {
      const peak = wavePeaks[i];
      const h = peak * (canvas.height / 2) * 0.8;
      const isPlayed = (i / wavePeaks.length) < (progress / duration);
      
      ctx.fillStyle = isPlayed ? accent : 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(i * barWidth, centerY - h, barWidth - 1, h * 2);
    }
  }, [wavePeaks, progress, duration, waveformEnabled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <div className="h-24 mica border-t border-white/5 px-10 flex items-center justify-between gap-8 fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom-full duration-700">
      <div className="flex items-center gap-4 w-1/4 min-w-[250px]" dir="rtl">
        <img src={currentSong.coverUrl} className="w-14 h-14 rounded-xl object-cover shadow-xl border border-white/10" alt="" loading="lazy" />
        <div className="min-w-0 text-right">
          <h4 className="font-bold text-sm truncate text-white tracking-tight">{currentSong.title}</h4>
          <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">{currentSong.artist}</p>
        </div>
        <button className="mr-auto text-zinc-600 hover:text-pink-500 transition-all">
          <Heart size={16} fill={currentSong.isFavorite ? "currentColor" : "none"} className={currentSong.isFavorite ? "text-pink-500" : ""} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 flex-1 max-w-xl">
        <div className="flex items-center gap-6">
          <button className="text-zinc-600 hover:text-white transition-colors"><Shuffle size={14} /></button>
          <button onClick={onPrev} className="text-zinc-400 hover:text-white active:scale-90 transition-all"><SkipBack size={20} fill="currentColor" /></button>
          <button 
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg ripple"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>
          <button onClick={onNext} className="text-zinc-400 hover:text-white active:scale-90 transition-all"><SkipForward size={20} fill="currentColor" /></button>
          <button className="text-zinc-600 hover:text-white transition-colors"><Repeat size={14} /></button>
        </div>
        
        <div className="w-full flex items-center gap-3 group relative">
          <span className="text-[9px] text-zinc-500 font-mono w-8 text-right">{formatTime(progress)}</span>
          <div className="flex-1 relative h-10 flex items-center">
            <canvas ref={waveformRef} width={600} height={40} className="absolute inset-0 w-full h-full pointer-events-none" />
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
          <div className="w-24 h-10 hidden xl:block">
             <canvas ref={spectrumRef} width={100} height={40} className="w-full h-full opacity-80" />
          </div>
        )}
        <button onClick={onToggleQueue} className="p-2 text-zinc-500 hover:text-white transition-all"><ListMusic size={18}/></button>
        <button onClick={onToggleEq} className={`p-2 rounded-xl transition-all ${isEqOpen ? 'text-[var(--accent-color)]' : 'text-zinc-500 hover:text-white'}`}><Activity size={18}/></button>
        <div className="flex items-center gap-2 w-24 group">
          <Volume2 size={14} className="text-zinc-500 group-hover:text-white shrink-0" />
          <div className="flex-1 relative h-1 bg-white/10 rounded-full">
            <div className="absolute h-full bg-[var(--accent-color)] rounded-full" style={{ width: `${volume * 100}%` }} />
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => onVolumeChange(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
