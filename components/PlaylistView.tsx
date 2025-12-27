
import React, { useMemo, useState } from 'react';
import { Playlist, Song, PlaylistViewMode } from '../types';
import { 
  Plus, Play, ListMusic, Music2, 
  Clock, Trash2, Sparkles, ChevronLeft,
  MoreVertical, Heart, Zap, Flame, Mic2, Disc, 
  History, Library, AlignLeft, LayoutList, LayoutGrid, Columns,
  ArrowRight, ChevronRight, Tags, Calendar, Image as ImageIcon,
  Wand2, Settings2, Edit3, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartPlaylistEngine } from '../services/smartPlaylistEngine';

const MotionDiv = motion.div as any;

interface PlaylistViewProps {
  playlists: Playlist[];
  songs: Song[];
  recentSongs: Song[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (id: string | null) => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  onDeletePlaylist: (id: string) => void;
  onCreatePlaylist: () => void;
  onEditSmartPlaylist?: (playlist: Playlist) => void;
  onSongSelect: (song: Song) => void;
  currentSongId?: string;
  isPlaying: boolean;
}

const PlaylistView: React.FC<PlaylistViewProps> = ({ 
  playlists, songs, recentSongs, selectedPlaylistId, onSelectPlaylist, 
  onPlayPlaylist, onDeletePlaylist, onCreatePlaylist, onSongSelect, currentSongId,
  isPlaying, onEditSmartPlaylist
}) => {
  const selectedPlaylist = useMemo(() => {
    if (!selectedPlaylistId) return null;
    if (selectedPlaylistId.startsWith('system-')) {
      const name = selectedPlaylistId.split('-').slice(1).join(' ').replace(/\b\w/g, l => l.toUpperCase());
      return { id: selectedPlaylistId, name, songIds: [], isSystem: true } as Playlist;
    }
    return playlists.find(p => p.id === selectedPlaylistId);
  }, [playlists, selectedPlaylistId]);

  const getSongsForPlaylist = (p: Playlist) => {
    if (p.isSmart && p.smartRules) {
      return SmartPlaylistEngine.filterLibrary(songs, p.smartRules);
    }
    
    const id = p.id;
    if (id === 'system-recent-added') return [...songs].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 30);
    if (id === 'system-recent-played') return recentSongs;
    if (id === 'system-top-played') return [...songs].sort((a, b) => b.playCount - a.playCount).slice(0, 30);
    if (id === 'system-liked') return songs.filter(s => s.isFavorite);
    if (id === 'system-with-lyrics') return songs.filter(s => s.hasLyrics);
    
    if (id.startsWith('genre-')) {
      const genre = id.replace('genre-', '');
      return songs.filter(s => s.genre === genre);
    }
    if (id.startsWith('decade-')) {
      const decade = parseInt(id.replace('decade-', ''));
      return songs.filter(s => s.year >= decade && s.year < decade + 10);
    }

    return p.songIds.map(sid => songs.find(s => s.id === sid)).filter((s): s is Song => !!s);
  };

  const playlistSongs = useMemo(() => {
    if (!selectedPlaylist) return [];
    return getSongsForPlaylist(selectedPlaylist);
  }, [selectedPlaylist, songs, recentSongs, playlists]);

  const totalDurationStr = useMemo(() => {
    const total = playlistSongs.reduce((acc, s) => acc + s.duration, 0);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m} minutes`;
  }, [playlistSongs]);

  const genres = useMemo(() => Array.from(new Set(songs.map(s => s.genre))), [songs]);
  const decades = useMemo(() => {
    const years = Array.from(new Set(songs.map(s => s.year)));
    return Array.from(new Set(years.map((y: number) => Math.floor(y / 10) * 10))).sort((a: number, b: number) => b - a);
  }, [songs]);

  const CategoryCard = ({ id, name, icon: Icon, color, isSmart = false }: { id: string, name: string, icon: any, color: string, isSmart?: boolean }) => {
    const p = playlists.find(pl => pl.id === id) || { id, name, songIds: [], isSmart };
    const count = getSongsForPlaylist(p as Playlist).length;
    return (
      <MotionDiv 
        whileHover={{ y: -8, scale: 1.02 }}
        onClick={() => onSelectPlaylist(id)}
        className="relative aspect-square p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] cursor-pointer hover:bg-white/[0.05] transition-all group overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 blur-[60px] rounded-full" style={{ backgroundColor: color }} />
        </div>
        
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6`} style={{ backgroundColor: color }}>
          <Icon size={24} />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-black text-white leading-tight truncate">{name}</h4>
            {isSmart && <Wand2 size={12} className="text-purple-400" />}
          </div>
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{count} TRACKS</p>
        </div>
        
        <div className="absolute bottom-6 right-6 p-3 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          <Play size={16} fill="white" className="text-white" />
        </div>
      </MotionDiv>
    );
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'full': return 'text-emerald-500';
      case 'partial': return 'text-amber-500';
      default: return 'text-zinc-800';
    }
  };

  if (!selectedPlaylistId) {
    return (
      <div className="h-full p-10 overflow-y-auto custom-scrollbar pb-60 space-y-16 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-7xl font-black tracking-tighter text-white">Collections</h2>
            <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">
              <span className="flex items-center gap-2"><Library size={12}/> {songs.length} Indexed Assets</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <span className="flex items-center gap-2"><Disc size={12}/> {playlists.length} User Lists</span>
            </div>
          </div>
          <button 
            onClick={onCreatePlaylist}
            className="px-8 py-4 bg-[var(--accent-color)] hover:brightness-110 text-white rounded-[2rem] font-black flex items-center gap-3 transition-all shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95"
          >
            <Sparkles size={18} /> Neural Smart List
          </button>
        </div>

        <section className="space-y-8">
          <h3 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.5em] px-2 flex items-center gap-3">
             <Zap size={14} className="text-[var(--accent-color)]" /> Neural Auto-Mixes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <CategoryCard id="system-recent-added" name="New Mix" icon={Zap} color="#3b82f6" />
            <CategoryCard id="system-recent-played" name="History" icon={History} color="#8b5cf6" />
            <CategoryCard id="system-top-played" name="Heavy Rotation" icon={Flame} color="#ef4444" />
            <CategoryCard id="system-liked" name="Favorites" icon={Heart} color="#ec4899" />
            <CategoryCard id="system-with-lyrics" name="Sing Along" icon={Mic2} color="#06b6d4" />
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.5em] flex items-center gap-3">
              <ListMusic size={14} /> Your Archives
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {playlists.filter(p => !p.isSystem).map(p => (
              <MotionDiv 
                key={p.id} 
                whileHover={{ scale: 1.05 }}
                onClick={() => onSelectPlaylist(p.id)}
                className="group cursor-pointer space-y-4"
              >
                <div className="aspect-square bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden relative shadow-2xl transition-all group-hover:shadow-[var(--accent-glow)]">
                  {p.coverUrl ? (
                    <img src={p.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-800 gap-4">
                      <Music2 size={48} className="opacity-10" />
                    </div>
                  )}
                  {p.isSmart && (
                    <div className="absolute top-4 left-4 p-2 bg-purple-600 rounded-xl text-white shadow-lg z-10">
                       <Wand2 size={14} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                    <Play size={32} fill="white" className="text-white scale-90 group-hover:scale-100 transition-transform" />
                  </div>
                </div>
                <div className="text-center px-2">
                  <h4 className="text-sm font-black text-white truncate mb-1">{p.name}</h4>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{getSongsForPlaylist(p).length} Tracks</p>
                </div>
              </MotionDiv>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
           <section className="space-y-8">
              <h3 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] px-2 flex items-center gap-3">
                <Tags size={14} /> Genre Vaults
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {genres.slice(0, 6).map((genre, i) => (
                  <CategoryCard key={genre} id={`genre-${genre}`} name={genre} icon={Disc} color={['#f59e0b', '#10b981', '#6366f1', '#f43f5e', '#a855f7', '#14b8a6'][i % 6]} />
                ))}
              </div>
           </section>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700 overflow-hidden pb-32">
      <div className="p-12 pb-8 flex items-center gap-12">
        <button 
          onClick={() => onSelectPlaylist(null)} 
          className="p-5 bg-white/5 hover:bg-white/10 rounded-[1.5rem] text-zinc-400 hover:text-white transition-all active:scale-90"
        >
          <ChevronLeft size={28} />
        </button>
        
        <div className="relative w-48 h-48 rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 shrink-0 group">
          <img src={selectedPlaylist?.coverUrl || playlistSongs[0]?.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s]" alt="" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="flex-1 min-0 space-y-4">
          <div className="space-y-2">
            <p className="text-[11px] font-black text-[var(--accent-color)] uppercase tracking-[0.4em] flex items-center gap-2">
               {selectedPlaylist?.isSmart ? <><Wand2 size={12}/> Smart Intelligence</> : 'Playlist Collection'}
            </p>
            <h1 className="text-7xl font-black text-white tracking-tighter truncate leading-tight">
              {selectedPlaylist?.name || "Neural Index"}
            </h1>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
            <span className="flex items-center gap-2"><Music2 size={12}/> {playlistSongs.length} ASSETS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <span className="flex items-center gap-2"><Clock size={12}/> {totalDurationStr} TOTAL</span>
          </div>
        </div>

        <div className="flex gap-4">
          {selectedPlaylist?.isSmart && (
            <button 
              onClick={() => onEditSmartPlaylist?.(selectedPlaylist)}
              className="p-5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 rounded-[1.5rem] transition-all"
            >
               <Settings2 size={24}/>
            </button>
          )}
          <button 
            onClick={() => onPlayPlaylist({ 
              ...selectedPlaylist,
              songIds: playlistSongs.map(s => s.id)
            } as Playlist)}
            className="px-12 py-5 bg-white text-black rounded-[2rem] font-black flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            <Play size={20} fill="currentColor" /> Play Sequence
          </button>
          {selectedPlaylist && !selectedPlaylist.isSystem && (
            <button onClick={() => onDeletePlaylist(selectedPlaylist.id)} className="p-5 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-[1.5rem] transition-all border border-red-500/10">
              <Trash2 size={24}/>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-12">
        <div className="space-y-2 bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-6 shadow-inner">
          <div className="flex items-center gap-6 px-8 py-4 border-b border-white/5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            <div className="w-8 text-center">#</div>
            <div className="flex-1">Track Info</div>
            <div className="w-32 text-right">Duration</div>
          </div>
          
          {playlistSongs.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-zinc-700 gap-4">
               {/* Fixed: Added Search to lucide-react imports */}
               <Search size={40} className="opacity-10" />
               <p className="text-xs font-black uppercase tracking-widest">No matching tracks found</p>
            </div>
          ) : (
            playlistSongs.map((song, i) => (
              <div 
                key={song.id + i} onClick={() => onSongSelect(song)}
                className={`group flex items-center gap-6 px-8 py-4 rounded-[2rem] hover:bg-white/[0.04] transition-all cursor-pointer relative h-20 ${currentSongId === song.id ? 'bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20' : 'border border-transparent'}`}
              >
                <div className="w-8 text-[11px] font-black text-zinc-700 text-center group-hover:text-[var(--accent-color)]">{i + 1}</div>
                <div className="relative w-12 h-12 shrink-0">
                  <img src={song.coverUrl} className="w-full h-full rounded-xl object-cover shadow-lg" alt="" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h4 className={`font-black text-sm truncate tracking-tight ${currentSongId === song.id ? 'text-[var(--accent-color)]' : 'text-white'}`}>{song.title}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest truncate max-w-[150px]">{song.artist}</p>
                    <div className="flex items-center gap-3">
                      <Mic2 size={10} className={`${getStatusColor(song.lyricsStatus)} transition-colors`} />
                      <Tags size={10} className={`${getStatusColor(song.tagStatus)} transition-colors`} />
                      <ImageIcon size={10} className={`${getStatusColor(song.coverStatus)} transition-colors`} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  {currentSongId === song.id && isPlaying && (
                    <div className="flex gap-0.5 items-end h-3">
                      {[1,2,3,4].map(b => (
                        <div key={b} className="w-0.5 bg-[var(--accent-color)] animate-music-bar" style={{ animationDelay: `${b * 0.1}s` }} />
                      ))}
                    </div>
                  )}
                  <div className="w-16 text-[11px] font-mono text-zinc-600 text-right group-hover:text-zinc-400">
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </div>
                  <button className="p-2 text-zinc-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <style>{`
        @keyframes music-bar { 0%, 100% { height: 4px; } 50% { height: 12px; } }
        .animate-music-bar { animation: music-bar 0.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default PlaylistView;
