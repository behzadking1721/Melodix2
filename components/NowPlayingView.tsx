
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, MoreVertical, Play, Pause, SkipBack, 
  SkipForward, Shuffle, Repeat, Mic2, Tags, Image as ImageIcon,
  Heart, ListPlus, Disc, User, Download, Edit3, Share2, Sparkles,
  AlignLeft
} from 'lucide-react';
import { Song, EQSettings } from '../types';
import { LrcParser } from '../services/lrcService';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Logic: Synced Lyrics
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
        <button 
          onClick={onBack}
          className="p-5 bg-white/5 hover:bg-white/10 rounded-[1.5rem] text-zinc-400 hover:text-white transition-all active:scale-90"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="flex flex-col items-center">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] mb-1">Now Playing</p>
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-[var(--accent-color)]" />
            <span className="text-xs font-bold text-white/80">{currentSong.album}</span>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-5 bg-white/5 hover:bg-white/10 rounded-[1.5rem] text-zinc-400 hover:text-white transition-all"
          >
            <MoreVertical size={28} />
          </button>
          
          <AnimatePresence>
            {isMenuOpen && (
              <MotionDiv 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute right-0 mt-4 w-64 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden z-20"
              >
                {[
                  { icon: ListPlus, label: 'Add to Playlist' },
                  { icon: Disc, label: 'Go to Album' },
                  { icon: User, label: 'Go to Artist' },
                  { icon: Edit3, label: 'Edit Metadata' },
                  { icon: Download, label: 'Download HD Cover' },
                  { icon: Share2, label: 'Share Experience' },
                ].map((item, i) => (
                  <button 
                    key={i}
                    className="w-full flex items-center gap-4 px-6 py-4 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-left"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon size={18} /> {item.label}
                  </button>
                ))}
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-20 px-12 lg:px-24">
        
        {/* Left Pane: Visual & Info */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start space-y-12 max-w-xl">
          {/* Cover Art */}
          <MotionDiv 
            key={currentSong.id}
            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              rotate: 0,
              y: isPlaying ? [0, -10, 0] : 0
            }}
            transition={{ 
              duration: 0.8, 
              y: { repeat: Infinity, duration: 4, ease: "easeInOut" } 
            }}
            className="relative w-80 h-80 lg:w-[420px] lg:h-[420px] rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 group"
          >
            <img src={currentSong.coverUrl} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </MotionDiv>

          {/* Info & Status */}
          <div className="space-y-6 text-center lg:text-left w-full">
            <div className="space-y-2">
              <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-tight truncate">
                {currentSong.title}
              </h2>
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <p className="text-xl lg:text-3xl text-zinc-400 font-bold">{currentSong.artist}</p>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                   {/* Wrapping icons to support tooltips correctly without type errors */}
                   <span title="Lyrics Status"><Mic2 size={12} className={`${getStatusColor(currentSong.lyricsStatus)} transition-colors`} /></span>
                   <span title="Tag Status"><Tags size={12} className={`${getStatusColor(currentSong.tagStatus)} transition-colors`} /></span>
                   <span title="Cover Status"><ImageIcon size={12} className={`${getStatusColor(currentSong.coverStatus)} transition-colors`} /></span>
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="space-y-8 pt-6">
              {/* Progress */}
              <div className="space-y-3">
                <div className="relative h-2 w-full bg-white/10 rounded-full group cursor-pointer" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  onSeek(((e.clientX - rect.left) / rect.width) * duration);
                }}>
                  <MotionDiv 
                    layoutId="progress-bar"
                    className="absolute inset-y-0 left-0 bg-[var(--accent-color)] rounded-full accent-glow"
                    style={{ width: `${(progress / duration) * 100}%` }}
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${(progress / duration) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[11px] font-black font-mono text-zinc-500 uppercase tracking-widest">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main Buttons */}
              <div className="flex items-center justify-center lg:justify-start gap-10">
                <button className="text-zinc-500 hover:text-white transition-all"><Shuffle size={20} /></button>
                <button onClick={onPrev} className="text-zinc-300 hover:text-white transition-all active:scale-90"><SkipBack size={32} fill="currentColor" /></button>
                
                <button 
                  onClick={onTogglePlay}
                  className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all"
                >
                  {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
                </button>

                <button onClick={onNext} className="text-zinc-300 hover:text-white transition-all active:scale-90"><SkipForward size={32} fill="currentColor" /></button>
                <button className="text-zinc-500 hover:text-white transition-all"><Repeat size={20} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Neural Lyrics */}
        <div className="hidden lg:flex w-1/2 h-full max-h-[70vh] flex-col relative">
           <div className="flex items-center gap-4 mb-8 text-zinc-500">
             {/* Fixed: Added missing AlignLeft import */}
             <AlignLeft size={20} />
             <h3 className="text-[11px] font-black uppercase tracking-[0.5em]">Neural Transcription</h3>
           </div>
           
           <div 
             ref={scrollRef}
             className="flex-1 overflow-y-auto custom-scrollbar space-y-12 pr-10"
             style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
           >
             {lyricsData.length > 0 ? (
               lyricsData.map((line, i) => (
                 <MotionP 
                   key={i} 
                   animate={{ 
                     opacity: !isSyncMode || i === activeIndex ? 1 : 0.2,
                     scale: isSyncMode && i === activeIndex ? 1.05 : 1,
                     x: isSyncMode && i === activeIndex ? 20 : 0,
                     filter: isSyncMode && i !== activeIndex ? 'blur(2px)' : 'blur(0px)',
                   }}
                   className={`font-black tracking-tighter leading-[1.1] transition-all duration-700 cursor-pointer ${i === activeIndex ? 'text-white' : 'text-zinc-800'}`}
                   style={{ fontSize: 'clamp(2.5rem, 5vw, 5.5rem)' }}
                   onClick={() => onSeek(line.time)}
                 >
                   {line.text}
                 </MotionP>
               ))
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-zinc-800 opacity-20">
                  <Mic2 size={120} className="mb-8" />
                  <p className="text-3xl font-black italic">Seeking lyrics in the void...</p>
               </div>
             )}
           </div>

           {/* Waveform Visualization Overlay */}
           <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end gap-1.5 opacity-20 pointer-events-none">
              {Array.from({ length: 40 }).map((_, i) => (
                <MotionDiv 
                  key={i}
                  animate={{ 
                    height: isPlaying ? [10, Math.random() * 60 + 20, 10] : 10 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.5 + Math.random(), 
                    ease: "easeInOut" 
                  }}
                  className="flex-1 bg-[var(--accent-color)] rounded-full"
                />
              ))}
           </div>
        </div>
      </main>

      {/* Footer / Context */}
      <footer className="relative z-10 p-12 flex justify-center">
         <div className="flex items-center gap-3 text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
           <Heart size={14} className="text-pink-600" /> High-Fidelity Lossless Stream
         </div>
      </footer>
    </MotionDiv>
  );
};

export default NowPlayingView;
