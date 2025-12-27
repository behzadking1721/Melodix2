
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, MoreVertical, Play, Pause, SkipBack, 
  SkipForward, Shuffle, Repeat, Mic2, Tags, Image as ImageIcon,
  Heart, ListPlus, Disc, User, Download, Edit3, Share2, Sparkles,
  AlignLeft, Wand2
} from 'lucide-react';
import { Song } from '../types';
import { LrcParser } from '../services/lrcService';
import LyricsEditor from './LyricsEditor'; // New

const MotionDiv = motion.div as any;
const MotionP = motion.p as any;

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

const NowPlayingView: React.FC<NowPlayingViewProps> = ({
  currentSong, isPlaying, progress, duration, 
  onTogglePlay, onNext, onPrev, onSeek, onBack, onUpdateSong
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const lyrics = currentSong?.lrcContent || "";
  const isSyncMode = useMemo(() => LrcParser.isLrc(lyrics), [lyrics]);
  const lyricsData = useMemo(() => {
    if (isSyncMode) return LrcParser.parse(lyrics);
    return lyrics.split('\n').filter(l => l.trim().length > 0).map((text, i) => ({ text: text.trim(), time: i * 5 }));
  }, [lyrics, isSyncMode]);

  const activeIndex = useMemo(() => {
    if (!isSyncMode) return -1;
    for (let i = lyricsData.length - 1; i >= 0; i--) {
      if (progress >= lyricsData[i].time) return i;
    }
    return 0;
  }, [progress, lyricsData, isSyncMode]);

  useEffect(() => {
    if (isSyncMode && scrollRef.current && activeIndex !== -1) {
      const activeElement = scrollRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        scrollRef.current.scrollTo({
          top: activeElement.offsetTop - scrollRef.current.clientHeight / 2 + activeElement.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex, isSyncMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'full': return 'text-emerald-500';
      case 'partial': return 'text-amber-500';
      default: return 'text-zinc-800';
    }
  };

  if (!currentSong) return null;

  return (
    <MotionDiv 
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="fixed inset-0 z-[800] bg-black overflow-hidden flex flex-col"
    >
      {/* Background Aura */}
      <div className="absolute inset-0 z-0">
        <img src={currentSong.coverUrl} className="w-full h-full object-cover blur-[120px] opacity-30 scale-150" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-12 flex items-center justify-between">
        <button onClick={onBack} className="p-5 bg-white/5 hover:bg-white/10 rounded-[1.5rem] text-zinc-400 hover:text-white transition-all active:scale-90">
          <ChevronLeft size={28} />
        </button>

        <div className="flex flex-col items-center">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] mb-1">Now Playing</p>
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-[var(--accent-color)]" />
            <span className="text-xs font-bold text-white/80">{currentSong.album}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={() => setIsEditorOpen(true)}
             className="p-5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/10 rounded-[1.5rem] transition-all flex items-center gap-3"
           >
             <Edit3 size={20} />
             <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Orchestrate Lyrics</span>
           </button>
           <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-5 bg-white/5 hover:bg-white/10 rounded-[1.5rem] text-zinc-400 hover:text-white transition-all">
             <MoreVertical size={28} />
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-20 px-12 lg:px-24 pb-20">
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start space-y-12 max-w-xl">
          <MotionDiv 
            key={currentSong.id}
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="relative w-80 h-80 lg:w-[420px] lg:h-[420px] rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10"
          >
            <img src={currentSong.coverUrl} className="w-full h-full object-cover transition-transform duration-[10s]" alt="" />
          </MotionDiv>

          <div className="space-y-6 text-center lg:text-left w-full">
            <div className="space-y-2">
              <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-tight truncate">{currentSong.title}</h2>
              <p className="text-xl lg:text-3xl text-zinc-400 font-bold">{currentSong.artist}</p>
            </div>

            <div className="space-y-8 pt-6">
              <div className="space-y-3">
                <div className="relative h-2 w-full bg-white/10 rounded-full cursor-pointer" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  onSeek(((e.clientX - rect.left) / rect.width) * duration);
                }}>
                  <MotionDiv className="absolute inset-y-0 left-0 bg-[var(--accent-color)] rounded-full" style={{ width: `${(progress / duration) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[11px] font-black text-zinc-500 uppercase tracking-widest font-mono">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-10">
                <button onClick={onPrev} className="text-zinc-300 hover:text-white transition-all"><SkipBack size={32} fill="currentColor" /></button>
                <button onClick={onTogglePlay} className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 transition-all">
                  {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
                </button>
                <button onClick={onNext} className="text-zinc-300 hover:text-white transition-all"><SkipForward size={32} fill="currentColor" /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex w-1/2 h-full max-h-[70vh] flex-col">
           <div 
             ref={scrollRef}
             className="flex-1 overflow-y-auto custom-scrollbar space-y-12 pr-10"
             style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
           >
             {lyricsData.length > 0 ? (
               lyricsData.map((line, i) => (
                 <MotionP 
                   key={i} 
                   animate={{ opacity: !isSyncMode || i === activeIndex ? 1 : 0.2, scale: isSyncMode && i === activeIndex ? 1.05 : 1 }}
                   className={`font-black tracking-tighter leading-[1.1] transition-all duration-700 ${i === activeIndex ? 'text-white' : 'text-zinc-800'}`}
                   style={{ fontSize: 'clamp(2.5rem, 5vw, 5.5rem)' }}
                 >
                   {line.text}
                 </MotionP>
               ))
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-zinc-800 opacity-20 text-center">
                  <Mic2 size={120} className="mb-8 mx-auto" />
                  <p className="text-3xl font-black italic">Seeking lyrics...</p>
                  <button onClick={() => setIsEditorOpen(true)} className="mt-8 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs uppercase tracking-widest transition-all">Manual Entry</button>
               </div>
             )}
           </div>
        </div>
      </main>

      <AnimatePresence>
        {isEditorOpen && (
          <LyricsEditor 
            song={currentSong} 
            currentProgress={progress}
            onClose={() => setIsEditorOpen(false)} 
            onSave={onUpdateSong} 
          />
        )}
      </AnimatePresence>
    </MotionDiv>
  );
};

export default NowPlayingView;
