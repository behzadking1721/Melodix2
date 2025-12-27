
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Disc, User, Calendar, Tags, 
  Sparkles, Play, Clock, ChevronRight, 
  ArrowLeft, LayoutGrid, Music2, Layers,
  Flame, Heart, Mic2, Star, History,
  PlusCircle, CheckCircle2, AlertCircle,
  TrendingUp, Activity, Filter, ListMusic,
  SearchX
} from 'lucide-react';
import { Song, NavigationTab } from '../types';

const MotionDiv = motion.div as any;

interface CollectionsViewProps {
  songs: Song[];
  onSongSelect: (song: Song) => void;
  currentSongId?: string;
  onPlayPlaylist: (songs: Song[], title: string) => void;
}

type CollectionTab = 'genres' | 'eras' | 'moods' | 'artists' | 'albums';

const CollectionsView: React.FC<CollectionsViewProps> = ({ 
  songs, onSongSelect, currentSongId, onPlayPlaylist 
}) => {
  const [activeTab, setActiveTab] = useState<CollectionTab>('genres');
  const [drillDown, setDrillDown] = useState<{ type: CollectionTab, id: string, label: string } | null>(null);

  // --- Neural Grouping & History Processing ---
  const data = useMemo(() => {
    const genresMap = new Map<string, { songs: Song[], duration: number }>();
    const erasMap = new Map<number, { songs: Song[], duration: number }>();
    const artistsMap = new Map<string, { songs: Song[], duration: number, albums: Set<string> }>();
    const albumsMap = new Map<string, { songs: Song[], artist: string, year: number, duration: number }>();

    songs.forEach(s => {
      // Genres
      if (!genresMap.has(s.genre)) genresMap.set(s.genre, { songs: [], duration: 0 });
      genresMap.get(s.genre)!.songs.push(s);
      genresMap.get(s.genre)!.duration += s.duration;

      // Eras
      const decade = Math.floor(s.year / 10) * 10;
      if (!erasMap.has(decade)) erasMap.set(decade, { songs: [], duration: 0 });
      erasMap.get(decade)!.songs.push(s);
      erasMap.get(decade)!.duration += s.duration;

      // Artists
      if (!artistsMap.has(s.artist)) artistsMap.set(s.artist, { songs: [], duration: 0, albums: new Set() });
      artistsMap.get(s.artist)!.songs.push(s);
      artistsMap.get(s.artist)!.duration += s.duration;
      artistsMap.get(s.artist)!.albums.add(s.album);

      // Albums
      const albumKey = `${s.album}-${s.artist}`;
      if (!albumsMap.has(albumKey)) albumsMap.set(albumKey, { songs: [], artist: s.artist, year: s.year, duration: 0 });
      albumsMap.get(albumKey)!.songs.push(s);
      albumsMap.get(albumKey)!.duration += s.duration;
    });

    // History Groups
    const recentlyPlayed = songs.filter(s => s.lastPlayed).sort((a,b) => (b.lastPlayed || 0) - (a.lastPlayed || 0)).slice(0, 15);
    const recentlyAdded = [...songs].sort((a,b) => b.dateAdded - a.dateAdded).slice(0, 10);
    const recentlyUpdated = songs.filter(s => s.lastUpdated).sort((a,b) => (b.lastUpdated || 0) - (a.lastUpdated || 0)).slice(0, 10);

    return {
      genres: Array.from(genresMap.entries()).map(([name, data]) => ({ name, ...data })),
      eras: Array.from(erasMap.entries()).sort((a,b) => b[0] - a[0]).map(([year, data]) => ({ year, ...data })),
      artists: Array.from(artistsMap.entries()).map(([name, data]) => ({ name, ...data, albumCount: data.albums.size })),
      albums: Array.from(albumsMap.entries()).map(([key, data]) => ({ name: data.songs[0].album, ...data })),
      history: {
        played: recentlyPlayed,
        added: recentlyAdded,
        updated: recentlyUpdated
      }
    };
  }, [songs]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  };

  const getRelativeTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status?: string) => {
    switch(status) {
      case 'full': return <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" title="Optimized" />;
      case 'partial': return <div className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Processing" />;
      default: return <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" title="Unprocessed" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (drillDown) {
    const drillDownSongs = songs.filter(s => {
      if (drillDown.type === 'genres') return s.genre === drillDown.id;
      if (drillDown.type === 'eras') return Math.floor(s.year / 10) * 10 === parseInt(drillDown.id);
      if (drillDown.type === 'artists') return s.artist === drillDown.id;
      if (drillDown.type === 'albums') return s.album === drillDown.id;
      return false;
    });

    return (
      <div className="h-full flex flex-col p-12 overflow-hidden animate-in fade-in slide-in-from-right-10 duration-500">
        <header className="flex items-center gap-8 mb-12">
          <button 
            onClick={() => setDrillDown(null)}
            className="p-5 bg-white/5 hover:bg-white/10 rounded-[1.5rem] text-zinc-400 hover:text-white transition-all active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <p className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.5em] mb-2">{drillDown.type.slice(0, -1)} Collection</p>
            <h2 className="text-6xl font-black text-white tracking-tighter">{drillDown.label}</h2>
          </div>
          <button 
            onClick={() => onPlayPlaylist(drillDownSongs, drillDown.label)}
            className="ml-auto px-10 py-4 bg-white text-black rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-2xl"
          >
            <Play size={20} fill="currentColor" /> Play All
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-2">
           {drillDownSongs.map((song, i) => (
             <div 
               key={song.id} 
               onClick={() => onSongSelect(song)}
               className={`flex items-center gap-6 px-8 py-4 rounded-[1.5rem] hover:bg-white/[0.04] transition-all cursor-pointer group ${currentSongId === song.id ? 'bg-[var(--accent-color)]/10' : ''}`}
             >
                <div className="w-8 text-[11px] font-black text-zinc-700 text-center">{i + 1}</div>
                <img src={song.coverUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-white">{song.title}</h4>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{song.artist} • {song.album}</p>
                </div>
                <div className="text-[11px] font-mono text-zinc-600">
                  {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">
      {/* Immersive Header */}
      <div className="p-12 space-y-8 z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-7xl font-black text-white tracking-tighter leading-tight">Collections</h2>
            <div className="flex items-center gap-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
              <span className="flex items-center gap-2"><Disc size={12}/> {data.genres.length} Genres</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <span className="flex items-center gap-2"><Calendar size={12}/> {data.eras.length} Eras</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <span className="flex items-center gap-2"><User size={12}/> {data.artists.length} Artists</span>
            </div>
          </div>
          <div className="p-6 bg-[var(--accent-color)]/10 rounded-[3rem] border border-[var(--accent-color)]/20">
            <Sparkles size={48} className="text-[var(--accent-color)] animate-pulse" />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4">
          {[
            { id: 'genres', label: 'Genres', icon: Tags },
            { id: 'eras', label: 'Eras', icon: Calendar },
            { id: 'moods', label: 'Moods', icon: Flame },
            { id: 'artists', label: 'Artists', icon: User },
            { id: 'albums', label: 'Albums', icon: Layers },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CollectionTab)}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-2xl scale-105' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content Grids */}
      <div className="px-12 mb-20">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
          >
            {/* GRID ITEMS RENDERER... (Same as before but integrated here) */}
            {activeTab === 'genres' && data.genres.map((genre) => (
              <MotionDiv key={genre.name} variants={itemVariants} whileHover={{ y: -10, scale: 1.02 }} onClick={() => setDrillDown({ type: 'genres', id: genre.name, label: genre.name })} className="relative aspect-square p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] group cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-[var(--accent-color)] transition-colors"><Music2 size={24} /></div>
                  <div className="space-y-1">
                    <h4 className="text-2xl font-black text-white tracking-tight leading-tight">{genre.name}</h4>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{genre.songs.length} Tracks • {formatDuration(genre.duration)}</p>
                  </div>
                </div>
              </MotionDiv>
            ))}
            {/* Eras, Artists, Albums... (truncated for brevity) */}
            {activeTab === 'eras' && data.eras.map(era => (
              <MotionDiv key={era.year} variants={itemVariants} whileHover={{ y: -10, scale: 1.02 }} onClick={() => setDrillDown({ type: 'eras', id: era.year.toString(), label: `${era.year}s` })} className="relative aspect-square p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] group cursor-pointer flex flex-col justify-center items-center text-center gap-4">
                <div className="w-20 h-20 rounded-full border-2 border-zinc-800 flex items-center justify-center group-hover:border-[var(--accent-color)] transition-colors"><h3 className="text-3xl font-black text-white">{era.year.toString().slice(2)}s</h3></div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-zinc-500 uppercase tracking-widest">{era.songs.length} Tracks</h4>
                  <p className="text-[9px] font-bold text-zinc-700">{formatDuration(era.duration)}</p>
                </div>
              </MotionDiv>
            ))}
            {activeTab === 'artists' && data.artists.map(artist => (
              <MotionDiv key={artist.name} variants={itemVariants} whileHover={{ y: -10, scale: 1.02 }} onClick={() => setDrillDown({ type: 'artists', id: artist.name, label: artist.name })} className="flex flex-col items-center gap-4 group cursor-pointer">
                <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-2xl border-4 border-transparent group-hover:border-[var(--accent-color)] transition-all">
                  <img src={artist.songs[0].coverUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                  <div className="absolute inset-0 bg-black/40 group-hover:opacity-0 transition-opacity" />
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-black text-white tracking-tight">{artist.name}</h4>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{artist.albumCount} Albums • {artist.songs.length} Tracks</p>
                </div>
              </MotionDiv>
            ))}
            {activeTab === 'albums' && data.albums.map(album => (
              <MotionDiv key={album.name} variants={itemVariants} whileHover={{ y: -10, scale: 1.02 }} onClick={() => setDrillDown({ type: 'albums', id: album.name, label: album.name })} className="space-y-4 group cursor-pointer">
                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10 group-hover:ring-[var(--accent-color)] transition-all">
                  <img src={album.songs[0].coverUrl} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110" alt="" />
                </div>
                <div className="px-2">
                  <h4 className="text-sm font-black text-white truncate mb-0.5">{album.name}</h4>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest truncate">{album.artist} • {album.year}</p>
                </div>
              </MotionDiv>
            ))}
          </MotionDiv>
        </AnimatePresence>
      </div>

      {/* --- INTEGRATED HISTORY SECTION --- */}
      <div className="border-t border-white/5 bg-black/20 pb-40">
        
        {/* Recently Played */}
        <section className="p-12 space-y-8">
           <div className="flex items-center justify-between">
             <div className="space-y-1">
               <h3 className="text-2xl font-black text-white flex items-center gap-3">
                 <History size={20} className="text-[var(--accent-color)]" /> Recently Played
               </h3>
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Your musical footsteps</p>
             </div>
             <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest border-b border-zinc-800 transition-colors">See full history</button>
           </div>

           <div className="space-y-2">
             {data.history.played.length > 0 ? (
               data.history.played.map((song, i) => (
                 <MotionDiv 
                   key={song.id} 
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.05 }}
                   viewport={{ once: true }}
                   onClick={() => onSongSelect(song)}
                   className={`flex items-center gap-6 px-8 py-3.5 rounded-[1.5rem] hover:bg-white/[0.04] transition-all cursor-pointer group ${currentSongId === song.id ? 'bg-[var(--accent-color)]/10 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]' : ''}`}
                 >
                    <div className="relative w-11 h-11 shrink-0">
                      <img src={song.coverUrl} className="w-full h-full rounded-xl object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                        <Play size={14} fill="white" className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-white truncate group-hover:text-[var(--accent-color)] transition-colors">{song.title}</h4>
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest truncate">{song.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{getRelativeTime(song.lastPlayed)}</p>
                      <p className="text-[9px] font-bold text-zinc-700">{formatDuration(song.duration)}</p>
                    </div>
                 </MotionDiv>
               ))
             ) : (
               <div className="p-12 text-center bg-white/[0.02] rounded-[3rem] border border-white/5 text-zinc-800 flex flex-col items-center gap-3">
                 <SearchX size={32} />
                 <p className="text-[10px] font-black uppercase tracking-widest">No recently played tracks found</p>
               </div>
             )}
           </div>
        </section>

        {/* Recently Added & Updated Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-12 pt-0">
          
          {/* Recently Added */}
          <section className="space-y-8">
            <div className="space-y-1">
               <h3 className="text-2xl font-black text-white flex items-center gap-3">
                 <PlusCircle size={20} className="text-emerald-500" /> Recently Added
               </h3>
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">New arrivals in your vault</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
               {data.history.added.map((song, i) => (
                 <MotionDiv 
                   key={song.id}
                   whileHover={{ y: -5, scale: 1.05 }}
                   onClick={() => onSongSelect(song)}
                   className="space-y-3 group cursor-pointer"
                 >
                   <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                     <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s]" alt="" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play size={24} fill="white" className="text-white" />
                     </div>
                   </div>
                   <div className="px-1 text-center">
                     <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
                     <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{new Date(song.dateAdded).toLocaleDateString()}</p>
                   </div>
                 </MotionDiv>
               ))}
            </div>
          </section>

          {/* Recently Updated (Neural Logs) */}
          <section className="space-y-8">
            <div className="space-y-1">
               <h3 className="text-2xl font-black text-white flex items-center gap-3">
                 <Zap size={20} className="text-purple-500" /> Neural Optimizations
               </h3>
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">AI-enhanced metadata stream</p>
            </div>

            <div className="space-y-2">
              {data.history.updated.length > 0 ? (
                data.history.updated.map((song, i) => (
                  <div key={song.id} className="flex items-center gap-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group">
                     <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                       <img src={song.coverUrl} className="w-full h-full object-cover" alt="" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
                       <div className="flex items-center gap-3 mt-1">
                         <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                           {getStatusBadge(song.tagStatus)} Tags
                         </span>
                         <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                           {getStatusBadge(song.lyricsStatus)} Lyrics
                         </span>
                       </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Enhanced</p>
                        <p className="text-[8px] font-bold text-zinc-700">{getRelativeTime(song.lastUpdated)}</p>
                     </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-white/[0.02] rounded-[3rem] border border-white/5 text-zinc-800 flex flex-col items-center gap-3">
                  <Activity size={32} className="opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Neural Engine is idle</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default CollectionsView;
