
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Play, Plus, Zap, Music, 
  User, Disc, Layers, Clock, Sparkles, 
  SearchX, SlidersHorizontal, ArrowUpDown,
  Calendar, Mic2, Image as ImageIcon, Tags,
  Filter, ChevronRight, ListMusic, MoreVertical
} from 'lucide-react';
import { Song, Playlist } from '../types';

const MotionDiv = motion.div as any;

interface SearchResultsViewProps {
  query: string;
  songs: Song[];
  playlists: Playlist[];
  onSongSelect: (song: Song) => void;
  onClear: () => void;
  currentSongId?: string;
}

type SortMethod = 'relevance' | 'title' | 'artist' | 'album' | 'duration' | 'year' | 'recent';

interface FilterState {
  genres: string[];
  eras: number[];
  durations: string[];
  hasLyrics: boolean | null;
}

const SearchResultsView: React.FC<SearchResultsViewProps> = ({ 
  query, songs, playlists, onSongSelect, onClear, currentSongId 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sortMethod, setSortMethod] = useState<SortMethod>('relevance');
  const [filters, setFilters] = useState<FilterState>({
    genres: [],
    eras: [],
    durations: [],
    hasLyrics: null
  });

  // Simulated Neural Pulse Loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, [query]);

  // Dynamic Metadata for Filters
  const availableFilters = useMemo(() => {
    const rawResults = songs.filter(s => 
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.artist.toLowerCase().includes(query.toLowerCase()) ||
      s.album.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      genres: Array.from(new Set(rawResults.map(s => s.genre))).sort(),
      eras: Array.from(new Set(rawResults.map(s => Math.floor(s.year / 10) * 10))).sort((a,b) => b-a)
    };
  }, [songs, query]);

  // Main Processing Loop
  const filteredAndSorted = useMemo(() => {
    // 1. Filtering
    let results = songs.filter(s => {
      const matchesQuery = s.title.toLowerCase().includes(query.toLowerCase()) ||
                           s.artist.toLowerCase().includes(query.toLowerCase()) ||
                           s.album.toLowerCase().includes(query.toLowerCase());
      
      if (!matchesQuery) return false;

      if (filters.genres.length > 0 && !filters.genres.includes(s.genre)) return false;
      
      // Fixed: Explicitly typed arithmetic operation to avoid TypeScript errors
      const decade = Math.floor((s.year as number) / 10) * 10;
      if (filters.eras.length > 0 && !filters.eras.includes(decade)) return false;

      if (filters.durations.length > 0) {
        const m = s.duration / 60;
        const matchesDuration = filters.durations.some(d => {
          if (d === '<2m') return m < 2;
          if (d === '2-4m') return m >= 2 && m < 4;
          if (d === '4-6m') return m >= 4 && m < 6;
          if (d === '>6m') return m >= 6;
          return false;
        });
        if (!matchesDuration) return false;
      }

      if (filters.hasLyrics === true && !s.hasLyrics) return false;
      if (filters.hasLyrics === false && s.hasLyrics) return false;

      return true;
    });

    // 2. Sorting
    results.sort((a, b) => {
      switch(sortMethod) {
        case 'title': return a.title.localeCompare(b.title);
        case 'artist': return a.artist.localeCompare(b.artist);
        case 'album': return a.album.localeCompare(b.album);
        case 'duration': return b.duration - a.duration;
        case 'year': return b.year - a.year;
        case 'recent': return b.dateAdded - a.dateAdded;
        default: return 0; // Relevance is handled by default filter order
      }
    });

    return results;
  }, [songs, query, filters, sortMethod]);

  const topResult = filteredAndSorted[0] || null;

  const toggleFilter = (type: keyof FilterState, value: any) => {
    setFilters(prev => {
      const current = prev[type] as any[];
      if (Array.isArray(current)) {
        return {
          ...prev,
          [type]: current.includes(value) ? current.filter(v => v !== value) : [...current, value]
        };
      }
      return { ...prev, [type]: prev[type] === value ? null : value };
    });
  };

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'full': return 'text-emerald-500';
      case 'partial': return 'text-amber-500';
      default: return 'text-zinc-800';
    }
  };

  if (!query) return null;

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden">
      {/* Search Header */}
      <header className="p-10 pb-6 flex items-center justify-between z-20">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h2 className="text-4xl font-black text-white tracking-tighter">Search Results</h2>
             <button onClick={onClear} className="p-2 hover:bg-white/5 rounded-xl text-zinc-600 hover:text-white transition-all">
               <X size={20} />
             </button>
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
            Found {filteredAndSorted.length} matches for "{query}"
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5">
            <ArrowUpDown size={14} className="text-zinc-500" />
            <select 
              value={sortMethod}
              onChange={(e) => setSortMethod(e.target.value as SortMethod)}
              className="bg-transparent text-[11px] font-black uppercase tracking-widest text-zinc-300 outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="title">Title (A-Z)</option>
              <option value="artist">Artist (A-Z)</option>
              <option value="duration">Duration</option>
              <option value="year">Release Year</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Filter Sidebar */}
        <aside className="w-72 h-full border-r border-white/5 p-10 overflow-y-auto custom-scrollbar space-y-10 shrink-0">
          <div className="space-y-6">
            <h4 className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] flex items-center gap-3">
              <Filter size={12} /> Metadata Filters
            </h4>
            
            {/* Genre Filter */}
            <div className="space-y-3">
               <p className="text-[10px] font-bold text-zinc-500">Genres</p>
               <div className="flex flex-wrap gap-2">
                 {availableFilters.genres.map(g => (
                   <button 
                    key={g} 
                    onClick={() => toggleFilter('genres', g)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filters.genres.includes(g) ? 'bg-[var(--accent-color)] text-white' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                   >
                     {g}
                   </button>
                 ))}
               </div>
            </div>

            {/* Decade Filter */}
            <div className="space-y-3">
               <p className="text-[10px] font-bold text-zinc-500">Era</p>
               <div className="grid grid-cols-2 gap-2">
                 {availableFilters.eras.map(e => (
                   <button 
                    key={e} 
                    onClick={() => toggleFilter('eras', e)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filters.eras.includes(e) ? 'bg-[var(--accent-color)] text-white' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                   >
                     {e}s
                   </button>
                 ))}
               </div>
            </div>

            {/* Duration Filter */}
            <div className="space-y-3">
               <p className="text-[10px] font-bold text-zinc-500">Length</p>
               <div className="grid grid-cols-2 gap-2">
                 {['<2m', '2-4m', '4-6m', '>6m'].map(d => (
                   <button 
                    key={d} 
                    onClick={() => toggleFilter('durations', d)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filters.durations.includes(d) ? 'bg-[var(--accent-color)] text-white' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                   >
                     {d}
                   </button>
                 ))}
               </div>
            </div>

            {/* Toggle Filters */}
            <div className="pt-4 space-y-4">
               <div 
                onClick={() => setFilters(f => ({ ...f, hasLyrics: f.hasLyrics === true ? null : true }))}
                className="flex items-center justify-between cursor-pointer group"
               >
                  <span className={`text-[10px] font-black uppercase tracking-widest ${filters.hasLyrics === true ? 'text-[var(--accent-color)]' : 'text-zinc-600 group-hover:text-zinc-400'}`}>Has Synced Lyrics</span>
                  <div className={`w-3 h-3 rounded-full border-2 ${filters.hasLyrics === true ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'border-zinc-800'}`} />
               </div>
               <button 
                onClick={() => setFilters({ genres: [], eras: [], durations: [], hasLyrics: null })}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-xl border border-white/5 transition-all"
               >
                 Clear All Filters
               </button>
            </div>
          </div>
        </aside>

        {/* Results Main Canvas */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-10 pb-40">
           <AnimatePresence mode="wait">
             {isLoading ? (
               <MotionDiv 
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
               >
                 <div className="w-full h-48 bg-white/5 rounded-[3rem] animate-pulse" />
                 <div className="space-y-4">
                   {[1,2,3,4,5].map(i => (
                     <div key={i} className="w-full h-20 bg-white/5 rounded-2xl animate-pulse" />
                   ))}
                 </div>
               </MotionDiv>
             ) : filteredAndSorted.length === 0 ? (
               <MotionDiv 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6"
               >
                  <div className="p-10 bg-white/5 rounded-full text-zinc-800">
                    <SearchX size={80} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">No results found</h3>
                    <p className="text-zinc-500 max-w-sm">Try adjusting your filters or checking your spelling. Melodix only searches your local indexed vault.</p>
                  </div>
               </MotionDiv>
             ) : (
               <MotionDiv 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-16"
               >
                 {/* Top Match */}
                 {topResult && (
                   <section>
                     <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                       <Sparkles size={12} className="text-[var(--accent-color)]" /> Best Match
                     </h4>
                     <div 
                      onClick={() => onSongSelect(topResult)}
                      className="group relative flex items-center gap-10 p-10 bg-white/[0.03] border border-white/5 rounded-[4rem] hover:bg-white/[0.05] transition-all cursor-pointer overflow-hidden shadow-2xl"
                     >
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative w-48 h-48 shrink-0 rounded-[2.5rem] overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-700">
                          <img src={topResult.coverUrl} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play size={40} fill="white" className="text-white" />
                          </div>
                        </div>

                        <div className="relative z-10 flex-1 space-y-6">
                           <div className="space-y-2">
                             <h3 className="text-5xl font-black text-white tracking-tighter leading-none">{topResult.title}</h3>
                             <p className="text-2xl text-zinc-400 font-bold">{topResult.artist} • {topResult.album}</p>
                           </div>
                           <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full border border-white/5">
                                <span title="Lyrics Status"><Mic2 size={12} className={`${getStatusColor(topResult.lyricsStatus)}`} /></span>
                                <span title="Tag Status"><Tags size={12} className={`${getStatusColor(topResult.tagStatus)}`} /></span>
                                <span title="Cover Status"><ImageIcon size={12} className={`${getStatusColor(topResult.coverStatus)}`} /></span>
                              </div>
                              <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{formatDuration(topResult.duration)} Duration</span>
                              <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{topResult.year} Year</span>
                           </div>
                        </div>

                        <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0">
                           <button className="p-5 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
                             <Play size={24} fill="currentColor" />
                           </button>
                        </div>
                     </div>
                   </section>
                 )}

                 {/* Categorical Results */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Tracks Column */}
                    <section className="space-y-8">
                       <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] px-2 flex items-center gap-3">
                         <Music size={12} /> Tracks found
                       </h4>
                       <div className="space-y-2 bg-white/[0.01] border border-white/5 rounded-[3rem] p-4">
                          {filteredAndSorted.slice(0, 10).map((s, i) => (
                            <div 
                              key={s.id} 
                              onClick={() => onSongSelect(s)}
                              className={`flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group ${currentSongId === s.id ? 'bg-[var(--accent-color)]/10' : ''}`}
                            >
                               <div className="w-8 text-[11px] font-black text-zinc-800 text-center">{i + 1}</div>
                               <img src={s.coverUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                               <div className="flex-1 min-w-0">
                                 <h5 className="text-sm font-bold text-white truncate">{s.title}</h5>
                                 <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest truncate">{s.artist}</p>
                               </div>
                               <div className="text-[11px] font-mono text-zinc-700">{formatDuration(s.duration)}</div>
                            </div>
                          ))}
                       </div>
                    </section>

                    {/* Artist/Album Column */}
                    <div className="space-y-16">
                       {/* Artists */}
                       <section className="space-y-8">
                          <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] px-2 flex items-center gap-3">
                            <User size={12} /> Artists
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            {Array.from(new Set(filteredAndSorted.map(s => s.artist))).slice(0, 4).map(artistName => {
                               const artistSongs = filteredAndSorted.filter(s => s.artist === artistName);
                               return (
                                 <div key={artistName} className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 cursor-pointer transition-all group">
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-900 border-2 border-transparent group-hover:border-[var(--accent-color)] transition-all">
                                      <img src={artistSongs[0].coverUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className="text-xs font-black text-white truncate">{artistName}</h5>
                                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{artistSongs.length} Related Tracks</p>
                                    </div>
                                 </div>
                               );
                            })}
                          </div>
                       </section>

                       {/* Albums */}
                       <section className="space-y-8">
                          <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] px-2 flex items-center gap-3">
                            <Disc size={12} /> Albums
                          </h4>
                          <div className="grid grid-cols-2 gap-6">
                            {Array.from(new Set(filteredAndSorted.map(s => s.album))).slice(0, 4).map(albumName => {
                               const albumSongs = filteredAndSorted.filter(s => s.album === albumName);
                               return (
                                 <div key={albumName} className="space-y-3 group cursor-pointer">
                                    <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl border border-white/5 ring-1 ring-white/10 group-hover:ring-[var(--accent-color)] transition-all">
                                      <img src={albumSongs[0].coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Play size={24} fill="white" className="text-white" />
                                      </div>
                                    </div>
                                    <div>
                                      <h5 className="text-xs font-black text-white truncate">{albumName}</h5>
                                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{albumSongs[0].artist}</p>
                                    </div>
                                 </div>
                               );
                            })}
                          </div>
                       </section>
                    </div>
                 </div>
               </MotionDiv>
             )}
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default SearchResultsView;
