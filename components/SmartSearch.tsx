
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
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Offline Engine Call
  const data: SearchResultGroup = useMemo(() => {
    if (query.trim()) {
      return SearchEngine.search(songs, query);
    } else {
      return SearchEngine.recommend(songs, currentSong);
    }
  }, [query, songs, currentSong]);

  // Loading Simulation for high-end feel
  useEffect(() => {
    if (query) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 250);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [query]);

  const ResultRow = ({ song, isTop = false }: { song: Song, isTop?: boolean }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, x: 5 }}
      className={`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all hover:bg-white/5 border border-transparent hover:border-white/10 ripple ${isTop ? 'bg-white/[0.04] p-6 shadow-2xl' : ''}`}
      onClick={() => { onSongSelect(song); onClose(); }}
    >
      <div className={`relative ${isTop ? 'w-28 h-28' : 'w-12 h-12'} rounded-xl overflow-hidden shadow-2xl shrink-0`}>
        <img src={song.coverUrl} className="w-full h-full object-cover" alt="" loading="lazy" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Play size={isTop ? 40 : 16} fill="white" className="text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0 text-left">
        <h4 className={`font-black ${isTop ? 'text-2xl' : 'text-sm'} text-white truncate tracking-tight`}>{song.title}</h4>
        <p className={`${isTop ? 'text-sm' : 'text-[10px]'} text-zinc-500 font-black uppercase tracking-widest truncate mt-0.5`}>
          {song.artist} • {song.album}
        </p>
        {isTop && (
          <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 bg-[var(--accent-color)] text-white text-[9px] font-black rounded-full uppercase">Top Match</span>
            <span className="px-3 py-1 bg-white/5 text-zinc-400 text-[9px] font-black rounded-full uppercase">{song.genre}</span>
          </div>
        )}
      </div>
      <div className="opacity-0 group-hover:opacity-100 flex gap-1">
        <button 
          onClick={(e) => { e.stopPropagation(); queueManager.addNext(song); }}
          className="p-2 text-zinc-500 hover:text-[var(--accent-color)] transition-colors"
        >
          <Zap size={16} />
        </button>
      </div>
    </motion.div>
  );

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center justify-between px-4 mb-4">
      <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-3">
        <Icon size={12} className="text-[var(--accent-color)]" /> {title}
      </h3>
    </div>
  );

  const SkeletonRow = () => (
    <div className="flex items-center gap-4 p-3 animate-pulse">
      <div className="w-12 h-12 bg-white/5 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-1/3" />
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 lg:p-12 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-3xl"
          />
          
          <motion.div 
            initial={{ scale: 0.96, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 40 }}
            className="relative w-full max-w-5xl h-[85vh] bg-[#0c0c0c]/90 border border-white/10 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col"
          >
            {/* Header / Input */}
            <div className="p-10 pb-6 border-b border-white/5">
              <div className="relative group">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[var(--accent-color)] transition-colors" size={28} />
                <input 
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tracks, artists, albums..."
                  className="w-full bg-white/[0.03] border border-white/5 rounded-[2.5rem] py-7 pl-20 pr-32 text-2xl font-black focus:outline-none focus:border-[var(--accent-color)]/20 transition-all placeholder:text-zinc-800 text-white"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/5">
                    <Command size={10} className="text-zinc-500" />
                    <span className="text-[9px] font-black text-zinc-500">ESC</span>
                  </div>
                  <button onClick={onClose} className="p-3 text-zinc-600 hover:text-white transition-colors bg-white/5 rounded-full"><X size={24} /></button>
                </div>
              </div>
            </div>

            {/* Scrollable Results */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-8">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {[1,2,3,4,5,6,7,8].map(i => <SkeletonRow key={i} />)}
                </div>
              ) : !query && !currentSong ? (
                 <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-10">
                    <Search size={120} className="text-white" />
                    <p className="text-2xl font-black uppercase tracking-[0.6em]">Neural Index Idle</p>
                 </div>
              ) : (
                <div className="space-y-16 pb-32">
                  {/* Top Match Section */}
                  {data.topResult && query && (
                    <section className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                      <SectionHeader icon={Sparkles} title="Best Match" />
                      <ResultRow song={data.topResult} isTop={true} />
                    </section>
                  )}

                  {/* Discovery Mode (Empty Query) */}
                  {!query && currentSong && (
                    <section className="animate-in fade-in duration-700">
                       <div className="p-12 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5 rounded-[4rem] flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group">
                          <TrendingUp className="absolute -right-12 -bottom-12 text-white/5 group-hover:scale-110 transition-transform duration-[3s]" size={300} />
                          <div className="w-56 h-56 rounded-[3rem] overflow-hidden shadow-2xl shrink-0 z-10 border-4 border-white/5">
                            <img src={currentSong.coverUrl} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="flex-1 space-y-6 z-10 text-center md:text-left">
                            <div className="space-y-2">
                              <p className="text-xs text-[var(--accent-color)] font-black uppercase tracking-[0.3em]">AI Suggested Discovery</p>
                              <h2 className="text-5xl font-black text-white tracking-tighter leading-tight">Similar to <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{currentSong.title}</span></h2>
                            </div>
                            <p className="text-base text-zinc-500 font-medium max-w-lg">We've analyzed your local neural index to find matches based on genre, artist style, and release era.</p>
                          </div>
                       </div>
                    </section>
                  )}

                  {/* Grouped Results Matrix */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-16">
                    {data.similarTracks.length > 0 && (
                      <section className="space-y-6">
                        <SectionHeader icon={Music} title={query ? "Similar Tracks" : "Personalized Mix"} />
                        <div className="space-y-2">
                          {data.similarTracks.map(s => <ResultRow key={s.id} song={s} />)}
                        </div>
                      </section>
                    )}

                    {data.fromSameArtist.length > 0 && (
                      <section className="space-y-6">
                        <SectionHeader icon={User} title={`From ${query ? data.topResult?.artist : currentSong?.artist}`} />
                        <div className="space-y-2">
                          {data.fromSameArtist.map(s => <ResultRow key={s.id} song={s} />)}
                        </div>
                      </section>
                    )}

                    {data.fromSameGenre.length > 0 && (
                      <section className="space-y-6">
                        <SectionHeader icon={Layers} title={`More ${query ? data.topResult?.genre : currentSong?.genre}`} />
                        <div className="space-y-2">
                          {data.fromSameGenre.map(s => <ResultRow key={s.id} song={s} />)}
                        </div>
                      </section>
                    )}

                    {data.recentlyAdded.length > 0 && (
                      <section className="space-y-6">
                        <SectionHeader icon={History} title="Recently Added" />
                        <div className="space-y-2">
                          {data.recentlyAdded.slice(0, 5).map(s => <ResultRow key={s.id} song={s} />)}
                        </div>
                      </section>
                    )}
                  </div>

                  {query && data.similarTracks.length === 0 && !data.topResult && (
                    <div className="h-80 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500">
                      <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center text-zinc-700">
                        <SearchX size={64} />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-white">No results found</h3>
                        <p className="text-zinc-500 font-bold max-w-xs mx-auto leading-relaxed">Try searching by title, artist, or album. Ensure your files are indexed.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Smart Status Bar */}
            <div className="p-8 bg-black/50 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                 <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
                 Local Neural Engine Active
               </div>
               <div className="flex items-center gap-10">
                 <div className="flex items-center gap-3 text-[9px] font-black text-zinc-600 uppercase">
                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-zinc-400">Enter</span> Play Selection
                 </div>
                 <div className="flex items-center gap-3 text-[9px] font-black text-zinc-600 uppercase">
                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-zinc-400">Esc</span> Close Modal
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
