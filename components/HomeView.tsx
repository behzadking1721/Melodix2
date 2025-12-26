
import React, { useState, useMemo } from 'react';
import { Song } from '../types';
import { 
  Sparkles, Music, Mic2, Clock, 
  Play, Heart, Zap, Flame, 
  TrendingUp, Compass, Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
          className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
        >
          <Zap size={14} /> Back to Dashboard
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
              <Mic2 size={18} /> View Lyrics
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
            <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">
              Melodix AI suggests listening to tracks with slower tempos to maintain this flow state.
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <Compass className="text-green-500" /> Discover New Sounds
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {recommendations.map(song => (
            <motion.div 
              key={song.id} 
              whileHover={{ y: -10 }}
              onClick={() => onSongSelect(song)}
              className="group cursor-pointer"
            >
              <div className="aspect-square rounded-[2.5rem] overflow-hidden mb-5 relative shadow-2xl bg-zinc-900 border border-white/5">
                <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl">
                    <Play size={24} fill="currentColor" />
                  </div>
                </div>
              </div>
              <h4 className="font-bold text-white text-center truncate px-2">{song.title}</h4>
              <p className="text-[10px] text-zinc-500 font-black uppercase text-center tracking-widest">{song.artist}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const LyricsContent: React.FC<{ currentSong: Song, lyrics: string, isLoading: boolean, currentTime: number }> = ({ currentSong, lyrics, isLoading, currentTime }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const syncedLines = useMemo(() => {
    if (!lyrics) return [];
    return lyrics.split('\n').map((line, i) => {
      const timeMatch = line.match(/\[(\d+):(\d+\.?\d*)\]/);
      let time = i * 4;
      let text = line;
      if (timeMatch) {
        time = parseInt(timeMatch[1]) * 60 + parseFloat(timeMatch[2]);
        text = line.replace(/\[.*?\]/g, '').trim();
      }
      return { text: text || line.trim(), time };
    }).filter(l => l.text.length > 0);
  }, [lyrics]);

  const activeIndex = useMemo(() => {
    for (let i = syncedLines.length - 1; i >= 0; i--) {
      if (currentTime >= syncedLines[i].time) return i;
    }
    return 0;
  }, [currentTime, syncedLines]);

  React.useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        scrollRef.current.scrollTo({
          top: activeElement.offsetTop - scrollRef.current.clientHeight / 2 + activeElement.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-12 overflow-hidden">
      <div className="w-full lg:w-1/3 space-y-8">
        <div className="aspect-square rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10">
          <img src={currentSong.coverUrl} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white leading-none">{currentSong.title}</h2>
          <p className="text-xl text-zinc-500 font-bold">{currentSong.artist}</p>
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-12 p-12 custom-scrollbar mask-fade-v2"
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">Processing Stream...</p>
          </div>
        ) : syncedLines.length > 0 ? (
          syncedLines.map((line, i) => (
            <motion.p 
              key={i} 
              animate={{ 
                opacity: i === activeIndex ? 1 : 0.2, 
                scale: i === activeIndex ? 1.1 : 1,
                x: i === activeIndex ? 20 : 0
              }}
              className={`font-black tracking-tighter leading-[1.1] transition-all duration-500 ${i === activeIndex ? 'text-white' : 'text-zinc-600'}`}
              style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
            >
              {line.text}
            </motion.p>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-700 opacity-30">
             <Music size={80} />
             <p className="text-3xl font-black italic mt-4">No Meta-Stream Available</p>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.mask-fade-v2 { mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent); }` }} />
    </div>
  );
};

export default HomeView;
