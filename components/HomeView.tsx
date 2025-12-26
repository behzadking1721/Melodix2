
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Song } from '../types';
import { 
  Sparkles, Music, Mic2, Clock, 
  Play, Pause, Heart, Zap, Flame, 
  TrendingUp, Compass, Headphones,
  ChevronRight, AlignLeft, SearchX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LrcParser } from '../services/lrcService';

const MotionDiv = motion.div as any;
const MotionP = motion.p as any;

interface HomeViewProps {
  currentSong: Song | null;
  lyrics: string;
  isLoadingLyrics: boolean;
  currentTime: number;
  onSongSelect: (song: Song) => void;
  recentSongs: Song[];
  library: Song[];
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ 
  currentSong, lyrics, isLoadingLyrics, currentTime, onSongSelect, recentSongs, library, isPlaying, onTogglePlay 
}) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'lyrics'>('dashboard');

  const moodAnalysis = useMemo(() => {
    if (library.length === 0) return { mood: 'Unknown', percentage: 0 };
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
          className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-[var(--text-primary)] transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <ChevronRight size={14} className="rotate-180" /> Back to Dashboard
        </button>
        <LyricsContent currentSong={currentSong} lyrics={lyrics} isLoading={isLoadingLyrics} currentTime={currentTime} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-10 pb-40 space-y-16">
      {library.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
          <div className="p-8 mica rounded-full text-zinc-800">
            <SearchX size={64} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black">Your library is empty</h3>
            <p className="text-zinc-500 max-w-sm">Add your music files to start the Melodix experience.</p>
          </div>
          <button className="px-8 py-3 bg-[var(--accent-color)] text-white rounded-2xl font-bold accent-glow transition-all hover:scale-105">
            Select Music Folder
          </button>
        </div>
      ) : (
        <>
          <section className="relative h-80 rounded-[3.5rem] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-color)]/20 to-transparent z-10" />
            <img 
              src={currentSong?.coverUrl || library[0]?.coverUrl} 
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-30 group-hover:scale-100 group-hover:blur-none transition-all duration-1000" 
              alt="" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20" />
            
            <div className="relative z-30 h-full flex flex-col justify-end p-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-zinc-400 text-xs font-bold">Based on your taste</span>
                <span className="px-4 py-1.5 rounded-full bg-[var(--accent-color)] text-white text-[10px] font-black uppercase">Smart Suggestion</span>
              </div>
              <h1 className="text-6xl font-black text-white tracking-tighter mb-6 leading-[0.9]">Experience Music Intelligently</h1>
              <div className="flex gap-4">
                <button onClick={onTogglePlay} className="px-8 py-3.5 bg-white text-black rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-2xl">
                  {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" />}
                  {isPlaying ? "Pause Now" : "Play Now"}
                </button>
                <button onClick={() => setActiveView('lyrics')} className="px-8 py-3.5 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-black flex items-center gap-3 border border-white/10 hover:bg-white/20 transition-all">
                  <Mic2 size={18} /> View Lyrics
                </button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  Recently Played <Clock className="text-[var(--accent-color)]" />
                </h3>
                <button className="text-zinc-500 hover:text-[var(--text-primary)] text-xs font-bold transition-all">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentSongs.slice(0, 4).map(song => (
                  <MotionDiv 
                    key={song.id} 
                    whileHover={{ x: 10 }}
                    onClick={() => onSongSelect(song)}
                    className="flex items-center gap-4 p-4 mica rounded-[2rem] cursor-pointer hover:bg-[var(--surface-hover)] transition-all group ripple"
                  >
                    <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden shadow-lg border border-white/5">
                      <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={16} fill="white" className="text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[var(--text-primary)] truncate">{song.title}</h4>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-wider truncate">{song.artist}</p>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-black flex items-center gap-3">
                Smart Analysis <Sparkles className="text-purple-500" />
              </h3>
              <div className="p-8 bg-gradient-to-br from-purple-600/10 to-[var(--accent-color)]/10 border border-white/5 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
                <TrendingUp className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform duration-1000" size={120} />
                <div className="space-y-2">
                  <p className="text-xs text-purple-400 font-black uppercase tracking-widest">Mood Analysis</p>
                  <h4 className="text-3xl font-black text-[var(--text-primary)]">Current State: <span className="text-[var(--accent-color)]">{moodAnalysis.mood}</span></h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    <span>Concentration</span>
                    <span className="text-[var(--text-primary)]">{moodAnalysis.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <MotionDiv 
                      initial={{ width: 0 }}
                      animate={{ width: `${moodAnalysis.percentage}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-[var(--accent-color)]" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const LyricsContent: React.FC<{ currentSong: Song, lyrics: string, isLoading: boolean, currentTime: number }> = ({ currentSong, lyrics, isLoading, currentTime }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isSyncMode = useMemo(() => LrcParser.isLrc(lyrics), [lyrics]);
  
  const lyricsData = useMemo(() => {
    if (isSyncMode) return LrcParser.parse(lyrics);
    return lyrics.split('\n').filter(l => l.trim().length > 0).map((text, i) => ({ text: text.trim(), time: i * 5 }));
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

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-16 overflow-hidden">
      <div className="w-full lg:w-1/3 space-y-10">
        <div className="aspect-square rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/10 relative group mica">
          <img src={currentSong.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-[var(--text-primary)] leading-tight tracking-tighter">{currentSong.title}</h2>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--accent-color)]">
                <Music size={14} />
             </div>
             <p className="text-xl text-[var(--text-secondary)] font-bold">{currentSong.artist}</p>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-12 p-12 custom-scrollbar text-center lg:text-left"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-8">
            <Sparkles className="text-[var(--accent-color)] animate-pulse" size={64} />
            <p className="font-black uppercase tracking-widest text-xs animate-pulse">Neural Syncing...</p>
          </div>
        ) : lyricsData.length > 0 ? (
          lyricsData.map((line, i) => (
            <MotionP 
              key={i} 
              animate={{ 
                opacity: !isSyncMode || i === activeIndex ? 1 : 0.3,
                scale: isSyncMode && i === activeIndex ? 1.05 : 1,
                x: isSyncMode && i === activeIndex ? 20 : 0
              }}
              className={`font-black tracking-tighter leading-[1.1] transition-all duration-700 ${i === activeIndex ? 'text-[var(--text-primary)]' : 'text-zinc-800'}`}
              style={{ fontSize: 'clamp(2rem, 4vw, 4rem)' }}
            >
              {line.text}
            </MotionP>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-800 opacity-20">
             <AlignLeft size={80} className="mb-6" />
             <p className="text-2xl font-black italic">No lyrics found for this masterpiece</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;
