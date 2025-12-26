
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Song } from '../types';
import { 
  Sparkles, Music, Mic2, Clock, 
  Play, Heart, Zap, Flame, 
  TrendingUp, Compass, Headphones,
  ChevronRight, AlignLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LrcParser, LrcLine } from '../services/lrcService';

interface HomeViewProps {
  currentSong: Song | null;
  lyrics: string;
  isLoadingLyrics: boolean;
  currentTime: number;
  onSongSelect: (song: Song) => void;
  recentSongs: Song[];
  library: Song[];
}

const HomeView: React.FC<HomeViewProps> = ({ 
  currentSong, lyrics, isLoadingLyrics, currentTime, onSongSelect, recentSongs, library 
}) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'lyrics'>('dashboard');

  const recommendations = useMemo(() => {
    return [...library].sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [library]);

  const moodAnalysis = useMemo(() => {
    const genres = library.map(s => s.genre);
    const topGenre = genres.sort((a,b) =>
      genres.filter(v => v===a).length - genres.filter(v => v===b).length
    ).pop();
    return {
      mood: topGenre === 'Ambient' ? 'Calm & Focused' : 'Energetic & Dynamic',
      percentage: Math.floor(Math.random() * 30) + 70
    };
  }, [library]);

  if (activeView === 'lyrics' && currentSong) {
    return (
      <div className="h-full flex flex-col p-12 animate-in fade-in zoom-in-95 duration-500">
        <button 
          onClick={() => setActiveView('dashboard')}
          className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <ChevronRight size={14} /> بازگشت به داشبورد
        </button>
        <LyricsContent currentSong={currentSong} lyrics={lyrics} isLoading={isLoadingLyrics} currentTime={currentTime} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-10 pb-40 space-y-16 animate-in fade-in duration-700">
      {/* Hero Header */}
      <section className="relative h-80 rounded-[3.5rem] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-purple-600/40 mix-blend-overlay z-10" />
        <img 
          src={currentSong?.coverUrl || library[0]?.coverUrl} 
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-50 group-hover:scale-100 group-hover:blur-none transition-all duration-1000" 
          alt="" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-20" />
        
        <div className="relative z-30 h-full flex flex-col justify-end p-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-tighter">AI RECOMMENDATION</span>
            <span className="text-zinc-400 text-xs font-bold">Based on your taste</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter mb-4 leading-[0.9]">Experience Music Intelligently</h1>
          <div className="flex gap-4">
            <button onClick={() => currentSong && onSongSelect(currentSong)} className="px-8 py-3.5 bg-white text-black rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-2xl">
              <Play size={18} fill="black" /> Play Now
            </button>
            <button onClick={() => setActiveView('lyrics')} className="px-8 py-3.5 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-black flex items-center gap-3 border border-white/10 hover:bg-white/20 transition-all">
              <Mic2 size={18} /> نمایش متن همگام
            </button>
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <Clock className="text-blue-500" /> Recently Played
            </h3>
            <button className="text-zinc-500 hover:text-white text-xs font-bold transition-all">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentSongs.slice(0, 4).map(song => (
              <motion.div 
                key={song.id} 
                whileHover={{ x: 10 }}
                onClick={() => onSongSelect(song)}
                className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-[2rem] cursor-pointer hover:bg-white/5 transition-all group"
              >
                <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden shadow-lg">
                  <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play size={16} fill="white" className="text-white" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">{song.title}</h4>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-wider truncate">{song.artist}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <Sparkles className="text-purple-500" /> AI Insights
          </h3>
          <div className="p-8 bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-white/10 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
            <TrendingUp className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform duration-1000" size={120} />
            <div className="space-y-2">
              <p className="text-xs text-purple-400 font-black uppercase tracking-widest">Mood Analysis</p>
              <h4 className="text-3xl font-black text-white">Current Vibe: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{moodAnalysis.mood}</span></h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                <span>Concentration Level</span>
                <span className="text-white">{moodAnalysis.percentage}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${moodAnalysis.percentage}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LyricsContent: React.FC<{ currentSong: Song, lyrics: string, isLoading: boolean, currentTime: number }> = ({ currentSong, lyrics, isLoading, currentTime }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Logic: Parse lyrics using the new LrcParser
  const isSyncMode = useMemo(() => LrcParser.isLrc(lyrics), [lyrics]);
  
  const lyricsData = useMemo(() => {
    if (isSyncMode) {
      return LrcParser.parse(lyrics);
    }
    // Fallback: Static lines
    return lyrics.split('\n').filter(l => l.trim().length > 0).map((text, i) => ({
      text: text.trim(),
      time: i * 5 // Mock time for static
    }));
  }, [lyrics, isSyncMode]);

  const activeIndex = useMemo(() => {
    if (!isSyncMode) return -1;
    for (let i = lyricsData.length - 1; i >= 0; i--) {
      if (currentTime >= lyricsData[i].time) return i;
    }
    return 0;
  }, [currentTime, lyricsData, isSyncMode]);

  // Effect: Smooth scrolling to active line
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

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-16 overflow-hidden">
      {/* Album Side */}
      <div className="w-full lg:w-1/3 space-y-10">
        <div className="aspect-square rounded-[3.5rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.9)] border border-white/10 relative group">
          <img src={currentSong.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="space-y-3" dir="rtl">
          <h2 className="text-4xl font-black text-white leading-tight tracking-tighter">{currentSong.title}</h2>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-blue-500">
                <Music size={14} />
             </div>
             <p className="text-xl text-zinc-500 font-bold">{currentSong.artist}</p>
          </div>
          <div className="pt-6 flex gap-3">
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${isSyncMode ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-zinc-500'}`}>
              {isSyncMode ? 'LRC Synced' : 'Static Text'}
            </span>
            <span className="px-4 py-1.5 rounded-xl bg-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest border border-white/5">
              AI Processed
            </span>
          </div>
        </div>
      </div>

      {/* Lyrics Side */}
      <div 
        ref={scrollRef}
        className={`flex-1 overflow-y-auto space-y-12 p-12 custom-scrollbar mask-fade-v2 ${!isSyncMode ? 'opacity-80' : ''}`}
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-8">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
              <Sparkles className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={24} />
            </div>
            <div className="text-center">
              <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Neural Syncing</p>
              <p className="text-zinc-600 text-[10px] mt-2 font-bold">در حال دریافت متادیتا و متون همگام...</p>
            </div>
          </div>
        ) : lyricsData.length > 0 ? (
          lyricsData.map((line, i) => (
            <motion.p 
              key={i} 
              initial={false}
              animate={{ 
                opacity: !isSyncMode || i === activeIndex ? 1 : (i < activeIndex ? 0.2 : 0.4), 
                scale: isSyncMode && i === activeIndex ? 1.05 : 1,
                filter: isSyncMode && i !== activeIndex ? 'blur(1px)' : 'blur(0px)',
                x: isSyncMode && i === activeIndex ? 20 : 0
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`font-black tracking-tighter leading-[1.1] cursor-default transition-all duration-700 ${i === activeIndex ? 'text-white' : 'text-zinc-700'} hover:text-blue-400/50`}
              style={{ fontSize: 'clamp(2rem, 4vw, 4rem)' }}
            >
              {line.text}
            </motion.p>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-800">
             <AlignLeft size={80} className="opacity-10 mb-6" />
             <p className="text-2xl font-black italic">No Lyrics Found</p>
             <button className="mt-6 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
               Retry AI Search
             </button>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .mask-fade-v2 { 
          mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent); 
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
      ` }} />
    </div>
  );
};

export default HomeView;
