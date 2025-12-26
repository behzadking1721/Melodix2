
import React, { useMemo, useRef, useEffect } from 'react';
import { Song } from '../types';
import { RefreshCw, Music, Sparkles, Languages, AlignLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { LrcParser } from '../services/lrcService';

const MotionImg = motion.img as any;
const MotionP = motion.p as any;

interface LyricsViewProps {
  currentSong: Song | null;
  lyrics: string;
  isLoading: boolean;
  currentTime: number;
  onRefresh: () => void;
}

const LyricsView: React.FC<LyricsViewProps> = ({ currentSong, lyrics, isLoading, currentTime, onRefresh }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const isSyncMode = useMemo(() => LrcParser.isLrc(lyrics), [lyrics]);
  
  const lyricsData = useMemo(() => {
    if (isSyncMode) return LrcParser.parse(lyrics);
    return lyrics.split('\n').filter(l => l.trim().length > 0).map((text, i) => ({
      text: text.trim(),
      time: i * 5
    }));
  }, [lyrics, isSyncMode]);

  const activeIndex = useMemo(() => {
    if (!isSyncMode) return -1;
    for (let i = lyricsData.length - 1; i >= 0; i--) {
      if (currentTime >= lyricsData[i].time) return i;
    }
    return 0;
  }, [currentTime, lyricsData, isSyncMode]);

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

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
        <Music size={48} className="opacity-20" />
        <p>Start playing a song to view lyrics</p>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col p-12 overflow-hidden bg-black">
      <div className="flex items-center justify-between mb-12 z-20">
        <div className="flex items-center gap-6">
          <MotionImg 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={currentSong.coverUrl} 
            className="w-24 h-24 rounded-[2rem] shadow-2xl border border-white/10" 
            alt="" 
          />
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-1">{currentSong.title}</h2>
            <div className="flex items-center gap-3 text-zinc-500 font-bold">
               <span>{currentSong.artist}</span>
               <span className="w-1 h-1 bg-zinc-800 rounded-full" />
               <span className="text-xs uppercase tracking-widest text-blue-500/80">{isSyncMode ? 'Synced LRC' : 'Static Lyrics'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onRefresh} disabled={isLoading} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-zinc-400 hover:text-white border border-white/5">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-4 space-y-10 z-10 custom-scrollbar mask-fade-lyrics"
      >
        {isLoading && !lyrics ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-400">
            <Sparkles size={40} className="animate-pulse text-blue-500" />
            <p className="animate-pulse font-black uppercase tracking-[0.3em] text-xs">Neural Syncing...</p>
          </div>
        ) : lyricsData.length > 0 ? (
          lyricsData.map((line, i) => (
            <MotionP 
              key={i} 
              animate={{ 
                opacity: !isSyncMode || i === activeIndex ? 1 : (i < activeIndex ? 0.2 : 0.4),
                scale: isSyncMode && i === activeIndex ? 1.05 : 1,
                filter: isSyncMode && i !== activeIndex ? 'blur(2px)' : 'blur(0px)',
              }}
              className={`font-black tracking-tighter leading-tight transition-all duration-700 ${i === activeIndex ? 'text-white' : 'text-zinc-800'}`}
              style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
            >
              {line.text}
            </MotionP>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-800">
             <AlignLeft size={64} className="opacity-10 mb-6" />
             <p className="text-xl font-black italic">No lyrics found for this masterpiece.</p>
          </div>
        )}
      </div>

      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full aurora-gradient rounded-full blur-[150px]" />
      </div>
      
      <style>{`
        .mask-fade-lyrics {
          mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
      `}</style>
    </div>
  );
};

export default LyricsView;
