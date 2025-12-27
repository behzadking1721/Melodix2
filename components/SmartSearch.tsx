
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Play, Plus, Zap, Music, 
  User, Disc, Layers, Clock, Sparkles, 
  SearchX, Command, TrendingUp, History,
  ArrowRight
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
  onSeeAll?: (query: string) => void;
}

const SmartSearch: React.FC<SmartSearchProps> = ({ songs, currentSong, isOpen, onClose, onSongSelect, onSeeAll }) => {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query && onSeeAll) {
      onSeeAll(query);
      onClose();
    }
  };

  // Added key prop to fix TypeScript errors when component is used in a map
  const ResultRow = ({ song, isTop = false }: { song: Song, isTop?: boolean, key?: React.Key }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, x: 5 }}
      className={`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all hover:bg-white/5 border border-transparent hover:border-white/10 ripple ${isTop ? 'bg-white/[0.04] p-6 shadow-2xl' : ''}`}
      onClick={() => { onSongSelect(song); }}
    >
      {/* ... Row Content ... */}
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
      </div>
    </motion.div>
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
                  onKeyDown={handleKeyDown}
                  placeholder="Search tracks, artists, albums..."
                  className="w-full bg-white/[0.03] border border-white/5 rounded-[2.5rem] py-7 pl-20 pr-32 text-2xl font-black focus:outline-none focus:border-[var(--accent-color)]/20 transition-all placeholder:text-zinc-800 text-white"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  {query && (
                    <button 
                      onClick={() => { onSeeAll?.(query); onClose(); }}
                      className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-color)] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all"
                    >
                      See All <ArrowRight size={14} />
                    </button>
                  )}
                  <button onClick={onClose} className="p-3 text-zinc-600 hover:text-white transition-colors bg-white/5 rounded-full"><X size={24} /></button>
                </div>
              </div>
            </div>

            {/* ... Results Content (Similar to previous, but showing a subset) ... */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-8">
               {/* Use existing result grouping logic here, but with a "Show All" trigger */}
               {!query ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-10">
                    <Search size={120} className="text-white" />
                    <p className="text-2xl font-black uppercase tracking-[0.6em]">Neural Index Idle</p>
                 </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {data.similarTracks.slice(0, 6).map(s => <ResultRow key={s.id} song={s} />)}
                  </div>
               )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SmartSearch;
