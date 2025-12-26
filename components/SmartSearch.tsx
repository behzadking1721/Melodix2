
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Play, Plus, Zap, Music, 
  User, Disc, Layers, Clock, Sparkles, 
  SearchX, Command, TrendingUp, History
} from 'lucide-react';
import { Song } from '../types';
import { queueManager } from '../services/queueManager';
import { SearchEngine, SearchResultGroup } from '../services/searchEngine';

interface SmartSearchProps {
  songs: Song[];
  currentSong: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onSongSelect: (song: Song) => void;
}

const SmartSearch: React.FC<SmartSearchProps> = ({ songs, currentSong, isOpen, onClose, onSongSelect }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Debounced Search & Recommendation Trigger
  const data: SearchResultGroup = useMemo(() => {
    if (query.trim()) {
      return SearchEngine.search(songs, query);
    } else {
      return SearchEngine.recommend(songs, currentSong);
    }
  }, [query, songs, currentSong]);

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 200);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [query]);

  const ResultRow = ({ song, isTop = false }: { song: Song, isTop?: boolean }) => (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 8 }}
      className={`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all hover:bg-white/5 border border-transparent hover:border-white/10 ripple ${isTop ? 'bg-white/[0.03] p-5' : ''}`}
      onClick={() => { onSongSelect(song); onClose(); }}
    >
      <div className={`relative ${isTop ? 'w-24 h-24' : 'w-12 h-12'} rounded-xl overflow-hidden shadow-2xl shrink-0`}>
        <img src={song.coverUrl} className="w-full h-full object-cover" alt="" loading="lazy" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Play size={isTop ? 32 : 16} fill="white" className="text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold ${isTop ? 'text-xl' : 'text-sm'} text-white truncate`}>{song.title}</h4>
        <p className={`${isTop ? 'text-sm' : 'text-[10px]'} text-zinc-500 font-black uppercase tracking-widest truncate mt-0.5`}>
          {song.artist} • {song.album}
        </p>
      </div>
      <div className="opacity-0 group-hover:opacity-100 flex gap-1">
        <button 
          onClick={(e) => { e.stopPropagation(); queueManager.addNext(song); }}
          className="p-2 text-zinc-500 hover:text-[var(--accent-color)]"
        >
          <Zap size={14} />
        </button>
      </div>
    </motion.div>
  );

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] px-4 py-2 flex items-center gap-3 border-b border-white/5 mb-2">
      <Icon size={12} className="text-zinc-500" /> {title}
    </h3>
  );

  const SkeletonRow = () => (
    <div className="flex items-center gap-4 p-3 animate-pulse">
      <div className="w-12 h-12 bg-white/5 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-1/4" />
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 lg:p-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="relative w-full max-w-5xl h-[85vh] bg-[#0c0c0c]/90 border border-white/10 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
          >
            {/* Command Bar */}
            <div className="p-8 pb-4">
              <div className="relative group">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[var(--accent-color)] transition-colors" size={24} />
                <input 
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tracks, artists, genres..."
                  className="w-full bg-white/[0.03] border border-white/5 rounded-[2.5rem] py-6 pl-16 pr-24 text-2xl font-black focus:outline-none focus:border-[var(--accent-color)]/30 transition-all placeholder:text-zinc-800"
                />
                <div className="absolute right-7 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/5">
                    <Command size={10} className="text-zinc-500" />
                    <span className="text-[9px] font-black text-zinc-500">ESC</span>
                  </div>
                  <button onClick={onClose} className="p-2 text-zinc-600 hover:text-white transition-colors"><X size={24} /></button>
                </div>
              </div>
            </div>

            {/* Dynamic Results Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {[1,2,3,4,5,6,7,8].map(i => <SkeletonRow key={i} />)}
                </div>
              ) : !query && !currentSong ? (
                 <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-20">
                    <Search size={100} className="text-zinc-500" />
                    <p className="text-xl font-black uppercase tracking-[0.5em]">Neural Index Idle</p>
                 </div>
              ) : (
                <div className="space-y-16 pb-20">
                  {/* Top Match / Discovery Hero */}
                  {data.topResult && query && (
                    <section className="animate-in fade-in slide-in-from-bottom-4">
                      <SectionHeader icon={Sparkles} title="Neural Top Match" />
                      <ResultRow song={data.topResult} isTop={true} />
                    </section>
                  )}

                  {!query && currentSong && (
                    <section className="animate-in fade-in">
                       <div className="p-10 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
                          <TrendingUp className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-110 transition-transform duration-1000" size={250} />
                          <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden shadow-2xl shrink-0 z-10">
                            <img src={currentSong.coverUrl} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 space-y-4 z-10 text-center md:text-left">
                            <div className="space-y-1">
                              <p className="text-xs text-[var(--accent-color)] font-black uppercase tracking-widest">Discover Similar</p>
                              <h2 className="text-4xl font-black text-white tracking-tighter">Because you like <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{currentSong.title}</span></h2>
                            </div>
                            <p className="text-sm text-zinc-400 font-medium">Melodix Engine analyzed this track's metadata to find matches in your local library.</p>
                          </div>
                       </div>
                    </section>
                  )}

                  {/* Grouped Result Matrix */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
                    {data.similarTracks.length > 0 && (
                      <section className="space-y-4">
                        <SectionHeader icon={Music} title={query ? "Similar Matches" : "AI Suggested Mix"} />
                        <div className="space-y-1">
                          {data.similarTracks.map(s => <ResultRow key={s.id} song={s} />)}
                        </div>
                      </section>
                    )}

                    {data.fromSameArtist.length > 0 && (
                      <section className="space-y-4">
                        <SectionHeader icon={User} title={`From ${query ? data.topResult?.artist : currentSong?.artist}`} />
                        <div className="space-y-1">
                          {data.fromSameArtist.map(s => <ResultRow key={s.id} song={s} />)}
                        </div>
                      </section>
                    )}

                    {data.fromSameGenre.length > 0 && (
                      <section className="space-y-4">
                        <SectionHeader icon={Layers} title={`More ${query ? data.topResult?.genre : currentSong?.genre}`} />
                        <div className="space-y-1">
                          {data.fromSameGenre.map(s => <ResultRow key={s.id} song={s} />)}
                        </div>
                      </section>
                    )}

                    {data.recentlyAdded.length > 0 && (
                      <section className="space-y-4">
                        <SectionHeader icon={History} title="Recently Indexed" />
                        <div className="space-y-1">
                          {data.recentlyAdded.slice(0, 5).map(s => <ResultRow key={s.id} song={s} />)}
                        </div>
                      </section>
                    )}
                  </div>

                  {query && data.similarTracks.length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-500">
                      <SearchX size={64} className="text-red-500 opacity-20" />
                      <div className="text-center space-y-1">
                        <h3 className="text-xl font-black text-white">No Neural Matches</h3>
                        <p className="text-zinc-600 text-sm">Try broadening your search terms.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Intelligence Status Bar */}
            <div className="p-6 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 Neural Indexing Engine Active
               </div>
               <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2 text-[9px] font-black text-zinc-500 uppercase">
                    <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">Enter</span> Play Selection
                 </div>
                 <div className="flex items-center gap-2 text-[9px] font-black text-zinc-500 uppercase">
                    <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">Tab</span> Navigate Groups
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SmartSearch;
