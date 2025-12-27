
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Play, Pause, SkipBack, SkipForward, 
  Shuffle, Repeat, Mic2, Heart, ListPlus, 
  Share2, Sparkles, Zap, Info, Settings2,
  Activity, BarChart3, ListMusic, Layers,
  Wand2, Download, Edit3, Trash2, Maximize2,
  Volume2, Monitor, Flame, Wind
} from 'lucide-react';
import { Song, QueueState } from '../types';
import { LrcParser } from '../services/lrcService';
import { AudioEngine } from '../services/audioEngine';
import { queueManager } from '../services/queueManager';
import VisualizerView from './VisualizerView';
import LyricsVisualizer from './LyricsVisualizer';

const MotionDiv = motion.div as any;

interface NowPlayingViewProps {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (val: number) => void;
  onBack: () => void;
  onUpdateSong: (song: Song) => void;
}

type PanelTab = 'lyrics' | 'visualizer' | 'queue';

const NowPlayingView: React.FC<NowPlayingViewProps> = ({
  currentSong, isPlaying, progress, duration, 
  onTogglePlay, onNext, onPrev, onSeek, onBack, onUpdateSong
}) => {
  const [activeTab, setActiveTab] = useState<PanelTab>('lyrics');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isFavorite, setIsFavorite] = useState(currentSong?.isFavorite || false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Calculation
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX - innerWidth / 2) / 25;
    const y = (clientY - innerHeight / 2) / 25;
    setMousePos({ x, y });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <MotionDiv 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[800] bg-black overflow-hidden flex flex-col font-sans"
    >
      {/* 1. DYNAMIC MESH BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <MotionDiv 
          animate={{ scale: isPlaying ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-full h-full"
        >
          <img src={currentSong.coverUrl} className="w-full h-full object-cover blur-[140px] opacity-40 scale-125" alt="" />
        </MotionDiv>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--accent-color)_0%,_transparent_70%)] opacity-10" />
      </div>

      {/* 2. HEADER TOP BAR */}
      <header className="relative z-10 p-10 flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all backdrop-blur-xl border border-white/5"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 px-6 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-2xl">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Neural Stream Active</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all backdrop-blur-xl border border-white/5">
              <Share2 size={20} />
           </button>
           <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all backdrop-blur-xl border border-white/5">
              <Settings2 size={20} />
           </button>
        </div>
      </header>

      {/* 3. MAIN CONTENT (GRID) */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 px-10 pb-10 overflow-hidden">
        
        {/* --- LEFT COLUMN: ART & CONTROLS (5 Cols) --- */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-12">
           
           {/* Immersive Parallax Art */}
           <MotionDiv 
             style={{ x: mousePos.x, y: mousePos.y, rotateX: mousePos.y * -0.1, rotateY: mousePos.x * 0.1 }}
             className="relative aspect-square w-full max-w-[450px] mx-auto group shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-[4rem] overflow-hidden border border-white/10 cursor-pointer"
           >
              <img src={currentSong.coverUrl} className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              {/* Dynamic Overlay Info */}
              <div className="absolute bottom-8 left-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                 <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/10">320 KBPS</span>
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/10">HI-RES AUDIO</span>
                 </div>
              </div>
           </MotionDiv>

           {/* Metadata & Controls Container */}
           <div className="space-y-10">
              <div className="space-y-4 text-center lg:text-left">
                 <div className="space-y-1">
                    <h2 className="text-6xl font-black text-white tracking-tighter leading-[0.9] truncate">{currentSong.title}</h2>
                    <p className="text-2xl text-zinc-400 font-bold tracking-tight">{currentSong.artist}</p>
                 </div>
                 <div className="flex items-center justify-center lg:justify-start gap-4 text-zinc-500">
                    <p className="text-xs font-bold uppercase tracking-widest">{currentSong.album} • {currentSong.year}</p>
                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                    <span className="text-xs font-bold text-[var(--accent-color)]">{currentSong.genre}</span>
                 </div>
              </div>

              {/* Advanced Seekbar */}
              <div className="space-y-4">
                 <div className="relative h-2 w-full bg-white/5 rounded-full cursor-pointer group" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    onSeek(((e.clientX - rect.left) / rect.width) * duration);
                 }}>
                    <MotionDiv 
                      className="absolute inset-y-0 left-0 bg-white rounded-full z-10 shadow-[0_0_20px_rgba(255,255,255,0.4)]" 
                      style={{ width: `${(progress / duration) * 100}%` }} 
                    />
                    
                    {/* Beat Markers (Visual simulation) */}
                    {[10, 25, 45, 70, 85].map(pos => (
                      <div key={pos} className="absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-white/20 rounded-full" style={{ left: `${pos}%` }} />
                    ))}
                 </div>
                 <div className="flex justify-between text-[11px] font-black text-zinc-500 tracking-widest font-mono">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                 </div>
              </div>

              {/* Playback Grid */}
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-6">
                    <button className="text-zinc-500 hover:text-white transition-all"><Shuffle size={20}/></button>
                    <button onClick={onPrev} className="text-zinc-300 hover:text-white active:scale-90 transition-all"><SkipBack size={32} fill="currentColor"/></button>
                    <button 
                      onClick={onTogglePlay} 
                      className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                      {isPlaying ? <Pause size={40} fill="currentColor"/> : <Play size={40} fill="currentColor" className="ml-2"/>}
                    </button>
                    <button onClick={onNext} className="text-zinc-300 hover:text-white active:scale-90 transition-all"><SkipForward size={32} fill="currentColor"/></button>
                    <button className="text-zinc-500 hover:text-white transition-all"><Repeat size={20}/></button>
                 </div>

                 <div className="flex items-center gap-3">
                    <button onClick={() => setIsFavorite(!isFavorite)} className={`p-4 rounded-2xl border border-white/5 transition-all ${isFavorite ? 'bg-pink-500/10 text-pink-500' : 'bg-white/5 text-zinc-400'}`}>
                       <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button className="p-4 bg-white/5 border border-white/5 text-zinc-400 rounded-2xl hover:text-white transition-all">
                       <ListPlus size={24} />
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* --- RIGHT COLUMN: TABBED PANELS (7 Cols) --- */}
        <div className="lg:col-span-7 flex flex-col bg-white/[0.02] border border-white/5 rounded-[3.5rem] overflow-hidden backdrop-blur-md">
           
           {/* Tab Switcher */}
           <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex gap-4">
                 {[
                   { id: 'lyrics', label: 'Lyrics', icon: Mic2 },
                   { id: 'visualizer', label: 'Visualizer', icon: Activity },
                   { id: 'queue', label: 'Queue', icon: ListMusic },
                 ].map(tab => (
                   <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                   >
                     <tab.icon size={14} /> {tab.label}
                   </button>
                 ))}
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    <Flame size={12} className="text-orange-500" /> Energy: 84%
                 </div>
                 <button className="p-2.5 bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all"><Maximize2 size={16}/></button>
              </div>
           </div>

           {/* Panel Content */}
           <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                 {activeTab === 'lyrics' && (
                   <MotionDiv key="lyrics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                      <LyricsVisualizer currentSong={currentSong} currentTime={progress} isPlaying={isPlaying} />
                   </MotionDiv>
                 )}

                 {activeTab === 'visualizer' && (
                   <MotionDiv key="viz" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full">
                      <VisualizerView currentSong={currentSong} isPlaying={isPlaying} />
                   </MotionDiv>
                 )}

                 {activeTab === 'queue' && (
                   <MotionDiv key="queue" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] px-2 flex items-center gap-2">
                           <Zap size={14} className="text-amber-500" /> Predicted Next Up
                         </h4>
                         {/* Sample Queue Simulation */}
                         {[1,2,3,4,5].map(i => (
                           <div key={i} className="flex items-center gap-6 p-4 rounded-3xl bg-white/[0.02] border border-transparent hover:border-white/5 hover:bg-white/[0.04] cursor-pointer group transition-all">
                              <img src={`https://picsum.photos/seed/${i+10}/80/80`} className="w-12 h-12 rounded-xl object-cover" alt="" />
                              <div className="flex-1">
                                 <h5 className="font-bold text-white text-sm">Suggested Echo {i}</h5>
                                 <p className="text-[10px] text-zinc-500 font-bold uppercase">Melodix AI Recommendation</p>
                              </div>
                              <button className="p-3 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-white"><Play size={14} fill="white"/></button>
                           </div>
                         ))}
                      </div>
                      
                      <div className="mt-auto p-6 bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-white/5 rounded-[2.5rem] flex items-center gap-6">
                         <div className="p-4 bg-purple-600 rounded-2xl text-white shadow-xl shadow-purple-600/20">
                            <Wand2 size={24} />
                         </div>
                         <div>
                            <h5 className="text-sm font-black text-white">Mood Orchestration</h5>
                            <p className="text-xs text-zinc-500">AI is selecting similar high-energy ambient tracks.</p>
                         </div>
                      </div>
                   </MotionDiv>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </main>

      {/* 4. BOTTOM ACTION BAR (DOCK) */}
      <footer className="relative z-10 px-10 pb-10 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center gap-10">
               <div className="flex flex-col items-center gap-1">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Tempo</span>
                  <span className="text-sm font-black text-white">124 BPM</span>
               </div>
               <div className="w-px h-8 bg-white/5" />
               <div className="flex flex-col items-center gap-1">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Key</span>
                  <span className="text-sm font-black text-white">Cm</span>
               </div>
               <div className="w-px h-8 bg-white/5" />
               <div className="flex flex-col items-center gap-1">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Energy</span>
                  <Activity size={16} className="text-orange-500 mt-1" />
               </div>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <button className="px-10 py-5 bg-[var(--accent-color)] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all">
               <Sparkles size={16} /> Neural Enhance
            </button>
            <div className="w-px h-10 bg-white/10 mx-2" />
            <button className="p-5 bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/5 text-zinc-500 hover:text-white transition-all"><Edit3 size={20}/></button>
            <button className="p-5 bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/5 text-zinc-500 hover:text-white transition-all"><Download size={20}/></button>
         </div>
      </footer>
    </MotionDiv>
  );
};

export default NowPlayingView;
