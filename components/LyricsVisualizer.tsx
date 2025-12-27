
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize2, Settings2, Sparkles, 
  Mic2, Music, AlignLeft, AlignCenter,
  Type, Palette, Play, Eye, EyeOff,
  Cpu, Zap, Wind, Monitor, Layout,
  Layers, Volume2, Move, Ghost,
  ChevronDown, ZoomIn, Flame, Waves
} from 'lucide-react';
import { LrcParser, LrcLine } from '../services/lrcService';
import { AudioEngine } from '../services/audioEngine';
import { Song } from '../types';

const MotionDiv = motion.div as any;
const MotionP = motion.p as any;

interface VisualizerConfig {
  fontSize: number;
  alignment: 'left' | 'center';
  mode: 'focus' | 'scroll' | 'karaoke';
  glowEnabled: boolean;
  particlesEnabled: boolean;
  performanceMode: boolean;
  fontFamily: 'sans' | 'serif' | 'mono';
  aiReactive: boolean;
}

const LyricsVisualizer: React.FC<{ currentSong: Song | null, currentTime: number, isPlaying: boolean }> = ({ 
  currentSong, 
  currentTime,
  isPlaying 
}) => {
  const [config, setConfig] = useState<VisualizerConfig>({
    fontSize: 42,
    alignment: 'center',
    mode: 'karaoke',
    glowEnabled: true,
    particlesEnabled: true,
    performanceMode: false,
    fontFamily: 'sans',
    aiReactive: true
  });

  const [showUI, setShowUI] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const engine = AudioEngine.getInstance();
  const uiTimeoutRef = useRef<number>(0);

  const lyricsData = useMemo(() => {
    return currentSong?.lrcContent ? LrcParser.parse(currentSong.lrcContent) : [];
  }, [currentSong?.lrcContent]);

  const activeIndex = useMemo(() => {
    for (let i = lyricsData.length - 1; i >= 0; i--) {
      if (currentTime >= lyricsData[i].time) return i;
    }
    return 0;
  }, [currentTime, lyricsData]);

  // Handle Auto-Scroll with Physics
  useEffect(() => {
    if (scrollContainerRef.current && activeIndex !== -1) {
      const activeElement = scrollContainerRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        scrollContainerRef.current.scrollTo({
          top: activeElement.offsetTop - scrollContainerRef.current.clientHeight / 2 + activeElement.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  // UI Autohide logic
  const handleMouseMove = () => {
    setShowUI(true);
    if (uiTimeoutRef.current) window.clearTimeout(uiTimeoutRef.current);
    uiTimeoutRef.current = window.setTimeout(() => setShowUI(false), 3000);
  };

  const getFontClass = () => {
    switch(config.fontFamily) {
      case 'serif': return 'font-serif italic';
      case 'mono': return 'font-mono';
      default: return 'font-black';
    }
  };

  if (!currentSong) return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-black text-zinc-800 gap-6">
       <Music size={64} className="opacity-10 animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.6em]">Awaiting Audio Stream</p>
    </div>
  );

  return (
    <div 
      className="h-full w-full relative overflow-hidden bg-black cursor-none"
      onMouseMove={handleMouseMove}
    >
      {/* Background Aura Layers */}
      <div className="absolute inset-0 z-0">
         <img src={currentSong.coverUrl} className="w-full h-full object-cover blur-[120px] opacity-30 scale-150" alt="" />
         <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black" />
         
         {/* AI-Reactive Wave Overlay */}
         {config.aiReactive && isPlaying && (
           <MotionDiv 
             animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1]
             }}
             transition={{ duration: 4, repeat: Infinity }}
             className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--accent-color)_0%,_transparent_70%)]"
           />
         )}
      </div>

      {/* Main Content Area */}
      <div 
        ref={scrollContainerRef}
        className={`relative z-10 h-full w-full overflow-y-auto custom-scrollbar-none px-12 lg:px-40 py-[45vh] space-y-16 transition-all duration-1000 ${config.alignment === 'center' ? 'text-center' : 'text-left'}`}
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)' }}
      >
        {lyricsData.length > 0 ? (
          lyricsData.map((line, i) => {
            const isActive = i === activeIndex;
            const isPast = i < activeIndex;
            const isFuture = i > activeIndex;

            return (
              <MotionDiv 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isActive ? 1 : (isPast ? 0.2 : 0.4),
                  scale: isActive ? 1.1 : 0.95,
                  filter: !isActive && !config.performanceMode ? 'blur(4px)' : 'blur(0px)',
                  x: isActive ? (config.alignment === 'center' ? 0 : 20) : 0
                }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className={`relative py-4 transition-all duration-700 ${getFontClass()}`}
                style={{ fontSize: `${config.fontSize}px` }}
              >
                {/* Neon Glow Layer */}
                {isActive && config.glowEnabled && (
                  <div className="absolute inset-0 blur-2xl opacity-40 text-[var(--accent-color)] select-none pointer-events-none">
                    {line.text}
                  </div>
                )}

                <span className={`tracking-tighter leading-tight inline-block ${isActive ? 'text-white' : 'text-zinc-800'}`}>
                  {line.text}
                </span>

                {/* Focus Progress Bar (Underline style) */}
                {isActive && (
                  <motion.div 
                    layoutId="focus-bar"
                    className="h-1 bg-[var(--accent-color)] mt-4 mx-auto rounded-full shadow-[0_0_15px_var(--accent-color)]"
                    style={{ width: '40px' }}
                  />
                )}
              </MotionDiv>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-800 gap-8">
             <Ghost size={80} className="opacity-10 mb-4" />
             <h3 className="text-4xl font-black italic tracking-tighter opacity-20">Static Masterpiece</h3>
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">No synchronization tags detected in local cache</p>
          </div>
        )}
      </div>

      {/* UI LAYERS (Autohide) */}
      <AnimatePresence>
        {showUI && (
          <>
            {/* Top Bar */}
            <MotionDiv 
              initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
              className="absolute top-0 left-0 right-0 p-10 flex justify-between items-start z-[100] cursor-default bg-gradient-to-b from-black/80 to-transparent"
            >
              <div className="flex items-center gap-6">
                 <div className="p-4 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/10 text-white">
                   <Mic2 size={24} fill="white" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter leading-none">Neural Lyrics</h2>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-1">{currentSong.title} — {currentSong.artist}</p>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl transition-all"><Maximize2 size={20}/></button>
              </div>
            </MotionDiv>

            {/* Bottom Controls */}
            <MotionDiv 
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-3xl p-1.5 rounded-[2.5rem] border border-white/10 shadow-2xl z-[100] cursor-default"
            >
               {[
                 { id: 'karaoke', icon: Zap, label: 'Stage' },
                 { id: 'focus', icon: ZoomIn, label: 'Cinema' },
                 { id: 'scroll', icon: Layout, label: 'Reader' },
               ].map(m => (
                 <button 
                  key={m.id}
                  onClick={() => setConfig({...config, mode: m.id as any})}
                  className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${config.mode === m.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                 >
                   <m.icon size={16} /> {m.label}
                 </button>
               ))}
            </MotionDiv>

            {/* Configuration Panel (Right) */}
            <MotionDiv 
              initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
              className="absolute top-32 right-10 bottom-32 w-80 bg-black/60 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-8 flex flex-col gap-10 z-[100] cursor-default overflow-y-auto custom-scrollbar"
            >
              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-zinc-500">
                    <Settings2 size={18} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Viewport Engine</h4>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[9px] font-black uppercase text-zinc-600"><span>Scale</span><span>{config.fontSize}px</span></div>
                       <input type="range" min="20" max="80" value={config.fontSize} onChange={e=>setConfig({...config, fontSize: Number(e.target.value)})} className="w-full accent-[var(--accent-color)]" />
                    </div>

                    <div className="flex gap-2">
                       <button onClick={() => setConfig({...config, alignment: 'left'})} className={`flex-1 py-3 rounded-xl border flex items-center justify-center transition-all ${config.alignment === 'left' ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-600 border-white/5'}`}><AlignLeft size={16}/></button>
                       <button onClick={() => setConfig({...config, alignment: 'center'})} className={`flex-1 py-3 rounded-xl border flex items-center justify-center transition-all ${config.alignment === 'center' ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-600 border-white/5'}`}><AlignCenter size={16}/></button>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-zinc-500">
                    <Type size={18} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Acoustic Logic</h4>
                 </div>
                 <div className="space-y-3">
                    <button 
                      onClick={() => setConfig({...config, aiReactive: !config.aiReactive})}
                      className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${config.aiReactive ? 'bg-purple-600/10 border-purple-500/40' : 'bg-white/5 border-white/5 opacity-50'}`}
                    >
                       <span className="text-[10px] font-black text-white uppercase">AI Sentiment Color</span>
                       <Sparkles size={14} className={config.aiReactive ? 'text-purple-400' : 'text-zinc-700'} />
                    </button>
                    <button 
                      onClick={() => setConfig({...config, glowEnabled: !config.glowEnabled})}
                      className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${config.glowEnabled ? 'bg-blue-600/10 border-blue-500/40' : 'bg-white/5 border-white/5 opacity-50'}`}
                    >
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Neon Overdrive</span>
                       <Flame size={14} className={config.glowEnabled ? 'text-blue-400' : 'text-zinc-700'} />
                    </button>
                 </div>
              </div>

              <div className="mt-auto space-y-4">
                 <div className="p-5 bg-white/5 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3 text-zinc-500">
                       <Cpu size={14}/>
                       <span className="text-[9px] font-black uppercase tracking-widest">Neural Vitals</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-zinc-400">FPS Matrix</span>
                       <span className="text-[10px] font-black text-emerald-500">STABLE 120</span>
                    </div>
                 </div>
                 <button onClick={() => setConfig({...config, performanceMode: !config.performanceMode})} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${config.performanceMode ? 'bg-amber-600 border-amber-500 text-white' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
                    {config.performanceMode ? 'Vitals Optimized' : 'Ultra Graphics'}
                 </button>
              </div>
            </MotionDiv>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar-none::-webkit-scrollbar { display: none; }
        .custom-scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default LyricsVisualizer;
