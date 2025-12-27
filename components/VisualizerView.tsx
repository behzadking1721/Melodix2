
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Maximize2, Settings2, Activity, 
  Waves, BarChart3, Box, Sparkles, 
  Wind, Flame, Sun, Moon, Cpu, 
  Layers, Palette, Play, Info, 
  RefreshCw, MousePointer2, Layout,
  Eye, Monitor, SlidersHorizontal,
  ChevronRight, Gauge, Camera
} from 'lucide-react';
import { AudioEngine } from '../services/audioEngine';
import { Song } from '../types';

const MotionDiv = motion.div as any;

type VisualMode = 'waveform' | 'spectrum' | 'particles' | 'nebula' | 'tunnel';
type WaveformType = 'linear' | 'circular' | 'dual' | 'filled';
type SpectrumType = 'bars' | 'mountain' | 'center' | 'particles';

const VisualizerView: React.FC<{ currentSong: Song | null, isPlaying: boolean }> = ({ currentSong, isPlaying }) => {
  const [activeMode, setActiveMode] = useState<VisualMode>('particles');
  const [config, setConfig] = useState({
    sensitivity: 1.5,
    smoothness: 0.8,
    thickness: 3,
    colorMode: 'gradient',
    particleCount: 150,
    showPeaks: true,
    aiReactive: true,
    performance: 'high' // high, low
  });

  const [showUI, setShowUI] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = AudioEngine.getInstance();
  // Fix: Initialize requestRef with 0 to satisfy TypeScript's requirement for initial value in useRef
  const requestRef = useRef<number>(0);
  // Fix: Initialize uiTimeoutRef with 0 to satisfy TypeScript's requirement for initial value in useRef
  const uiTimeoutRef = useRef<number>(0);

  // --- RENDERING LOGIC ---
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false })!;
    
    // Resize handler
    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    window.addEventListener('resize', resize);
    resize();

    // Particle state for 'particles' mode
    const particles = Array.from({ length: 300 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.1,
      angle: Math.random() * Math.PI * 2
    }));

    const render = () => {
      const data = engine.getFrequencyData();
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Clear with slight trail for motion blur
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // 1. WAVEFORM LINEAR
      if (activeMode === 'waveform') {
        ctx.beginPath();
        ctx.lineWidth = config.thickness;
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
        
        const sliceWidth = width / data.length;
        let x = 0;

        for (let i = 0; i < data.length; i++) {
          const v = (data[i] / 128.0) * config.sensitivity;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      }

      // 2. SPECTRUM BARS
      if (activeMode === 'spectrum') {
        const barWidth = (width / 64);
        let x = 0;
        for (let i = 0; i < 64; i++) {
          const barHeight = (data[i * 2] / 255) * height * 0.6 * config.sensitivity;
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#3b82f6');
          gradient.addColorStop(1, '#8b5cf6');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth - 4, barHeight);
          
          if (config.showPeaks) {
             ctx.fillStyle = 'rgba(255,255,255,0.3)';
             ctx.fillRect(x, height - barHeight - 10, barWidth - 4, 2);
          }
          x += barWidth;
        }
      }

      // 3. PARTICLES GALAXY
      if (activeMode === 'particles') {
        const energy = data.slice(0, 10).reduce((a, b) => a + b, 0) / 10; // Low frequency energy
        const intensity = (energy / 255) * config.sensitivity;

        particles.forEach((p, i) => {
          const freqIndex = i % 32;
          const freqVal = data[freqIndex] / 255;
          
          p.x += Math.cos(p.angle) * p.speed * (1 + intensity * 5);
          p.y += Math.sin(p.angle) * p.speed * (1 + intensity * 5);
          
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const size = p.size * (1 + freqVal * 2);
          ctx.fillStyle = `hsla(${200 + freqVal * 60}, 70%, 60%, ${0.2 + freqVal})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
          
          // Glow effect
          if (intensity > 0.6) {
             ctx.shadowBlur = 15;
             ctx.shadowColor = '#3b82f6';
          } else {
             ctx.shadowBlur = 0;
          }
        });
      }

      // 4. CIRCULAR TUNNEL
      if (activeMode === 'tunnel') {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.2;

        for (let j = 0; j < 4; j++) { // 4 Rings
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 + j * 0.2})`;
          
          for (let i = 0; i < data.length; i++) {
            const angle = (i / data.length) * Math.PI * 2;
            const amp = (data[i] / 255) * 100 * config.sensitivity;
            const x = centerX + Math.cos(angle) * (radius + j * 50 + amp);
            const y = centerY + Math.sin(angle) * (radius + j * 50 + amp);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      requestRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [activeMode, config]);

  // UI Autohide logic
  const handleMouseMove = () => {
    setShowUI(true);
    if (uiTimeoutRef.current) window.clearTimeout(uiTimeoutRef.current);
    uiTimeoutRef.current = window.setTimeout(() => setShowUI(false), 3000);
  };

  return (
    <div 
      className="h-full w-full relative overflow-hidden bg-black cursor-none"
      onMouseMove={handleMouseMove}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Dynamic Background Overlays */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)] opacity-60" />

      {/* AI Pulse Effect */}
      {config.aiReactive && isPlaying && (
        <MotionDiv 
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-blue-500/10 pointer-events-none"
        />
      )}

      {/* EMPTY STATE */}
      {!currentSong && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-800 gap-6">
           <RefreshCw size={64} className="animate-spin-slow opacity-10" />
           <p className="text-[10px] font-black uppercase tracking-[0.6em]">Neural Stream Idle</p>
        </div>
      )}

      {/* UI LAYERS */}
      <AnimatePresence>
        {showUI && (
          <>
            {/* Top Toolbar */}
            <MotionDiv 
              initial={{ y: -40, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: -40, opacity: 0 }}
              className="absolute top-0 left-0 right-0 p-10 flex justify-between items-start z-[100] cursor-default"
            >
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white">
                       <Zap size={24} fill="white" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-white tracking-tighter leading-none">Synesthesia Core</h3>
                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-1">Reactive Environment v4.2</p>
                    </div>
                 </div>
                 {currentSong && (
                   <div className="px-5 py-2 bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{currentSong.title} — {currentSong.artist}</span>
                   </div>
                 )}
              </div>

              <div className="flex gap-3">
                 <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl transition-all"><Maximize2 size={20}/></button>
                 <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl transition-all"><Camera size={20}/></button>
              </div>
            </MotionDiv>

            {/* Mode Switcher (Bottom Center) */}
            <MotionDiv 
              initial={{ y: 40, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 40, opacity: 0 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center bg-black/60 backdrop-blur-2xl p-1.5 rounded-[2.5rem] border border-white/10 shadow-2xl z-[100] cursor-default"
            >
              {[
                { id: 'waveform', icon: Activity, label: 'Oscillator' },
                { id: 'spectrum', icon: BarChart3, label: 'Frequencies' },
                { id: 'particles', icon: Sparkles, label: 'Neural Dust' },
                { id: 'tunnel', icon: Wind, label: 'Vortex' },
              ].map(mode => (
                <button 
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id as any)}
                  className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${activeMode === mode.id ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                >
                  <mode.icon size={16} /> {mode.label}
                </button>
              ))}
            </MotionDiv>

            {/* Customization Panel (Right Sidebar) */}
            <MotionDiv 
              initial={{ x: 40, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: 40, opacity: 0 }}
              className="absolute top-40 right-10 bottom-40 w-80 bg-black/60 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 p-8 flex flex-col gap-8 z-[100] cursor-default overflow-y-auto custom-scrollbar"
            >
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                   <Settings2 size={18} className="text-zinc-500" />
                   <h4 className="text-xs font-black text-white uppercase tracking-widest">Environment Engine</h4>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[9px] font-black uppercase text-zinc-500"><span>Sensitivity</span><span>{Math.round(config.sensitivity * 100)}%</span></div>
                       <input type="range" min="0.5" max="3" step="0.1" value={config.sensitivity} onChange={e=>setConfig({...config, sensitivity: parseFloat(e.target.value)})} className="w-full accent-blue-500" />
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[9px] font-black uppercase text-zinc-500"><span>Motion Smoothness</span><span>{Math.round(config.smoothness * 100)}%</span></div>
                       <input type="range" min="0" max="0.95" step="0.05" value={config.smoothness} onChange={e=>setConfig({...config, smoothness: parseFloat(e.target.value)})} className="w-full accent-purple-500" />
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                   <Sparkles size={18} className="text-zinc-500" />
                   <h4 className="text-xs font-black text-white uppercase tracking-widest">Neural Hooks</h4>
                 </div>
                 <div className="space-y-3">
                    <button 
                      onClick={() => setConfig({...config, aiReactive: !config.aiReactive})}
                      className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${config.aiReactive ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/5 border-white/5 opacity-50'}`}
                    >
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Reactive Physics</span>
                       <div className={`w-2 h-2 rounded-full ${config.aiReactive ? 'bg-blue-500 animate-pulse' : 'bg-zinc-800'}`} />
                    </button>
                    <button className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                       <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300">Sync with Mood</span>
                       <Palette size={12} className="text-zinc-600" />
                    </button>
                 </div>
              </div>

              <div className="mt-auto space-y-6">
                 <div className="p-5 bg-white/5 rounded-3xl space-y-3">
                    <div className="flex items-center gap-3 text-zinc-500">
                       <Cpu size={14}/>
                       <span className="text-[9px] font-black uppercase tracking-widest">Perf Matrix</span>
                    </div>
                    <div className="flex gap-2">
                       {['high', 'low'].map(p => (
                         <button 
                          key={p} 
                          onClick={() => setConfig({...config, performance: p})}
                          className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${config.performance === p ? 'bg-white text-black' : 'bg-black/40 text-zinc-600 border border-white/5'}`}
                         >
                           {p} FPS
                         </button>
                       ))}
                    </div>
                 </div>
                 
                 <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                   <RefreshCw size={14} /> Reset Vitals
                 </button>
              </div>
            </MotionDiv>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default VisualizerView;
