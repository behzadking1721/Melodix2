
import React, { useMemo, useState } from 'react';
import { Playlist, Song, PlaylistViewMode } from '../types';
import { 
  Plus, Play, ListMusic, Music2, 
  Clock, Trash2, Sparkles, ChevronLeft,
  MoreVertical, Heart, Zap, Flame, Mic2, Disc, 
  History, Library, AlignLeft, LayoutList, LayoutGrid, Columns,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlaylistViewProps {
  playlists: Playlist[];
  songs: Song[];
  recentSongs: Song[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (id: string | null) => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  onDeletePlaylist: (id: string) => void;
  onCreatePlaylist: () => void;
  onSongSelect: (song: Song) => void;
  currentSongId?: string;
}

const PlaylistView: React.FC<PlaylistViewProps> = ({ 
  playlists, songs, recentSongs, selectedPlaylistId, onSelectPlaylist, 
  onPlayPlaylist, onDeletePlaylist, onCreatePlaylist, onSongSelect, currentSongId
}) => {
  const [viewMode, setViewMode] = useState<PlaylistViewMode>(PlaylistViewMode.Detailed);

  const selectedPlaylist = useMemo(() => 
    playlists.find(p => p.id === selectedPlaylistId), 
    [playlists, selectedPlaylistId]
  );

  const getSongsForPlaylistId = (id: string) => {
    if (id === 'system-recent-added') return [...songs].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 20);
    if (id === 'system-recent-played') return recentSongs;
    if (id === 'system-top-played') return [...songs].sort((a, b) => b.playCount - a.playCount).slice(0, 20);
    if (id === 'system-liked') return songs.filter(s => s.isFavorite);
    if (id === 'system-with-lyrics') return songs.filter(s => s.hasLyrics);
    
    const p = playlists.find(pl => pl.id === id);
    return p ? p.songIds.map(sid => songs.find(s => s.id === sid)).filter((s): s is Song => !!s) : [];
  };

  const playlistSongs = useMemo(() => {
    if (!selectedPlaylistId) return [];
    return getSongsForPlaylistId(selectedPlaylistId);
  }, [selectedPlaylistId, songs, recentSongs, playlists]);

  const totalDuration = useMemo(() => {
    const total = playlistSongs.reduce((acc, s) => acc + s.duration, 0);
    const m = Math.floor(total / 60);
    return `${m} minutes`;
  }, [playlistSongs]);

  const CategoryCard = ({ id, name, icon: Icon, color }: { id: string, name: string, icon: any, color: string }) => {
    const categorySongs = getSongsForPlaylistId(id);
    return (
      <motion.div 
        whileHover={{ y: -5, scale: 1.02 }}
        onClick={() => onSelectPlaylist(id)}
        className="relative aspect-[4/5] p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] cursor-pointer hover:bg-white/[0.05] transition-all group overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full" style={{ backgroundColor: color }} />
        </div>
        
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6`} style={{ backgroundColor: color }}>
          <Icon size={24} />
        </div>
        
        <h4 className="text-xl font-black text-white leading-tight mb-2">{name}</h4>
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{categorySongs.length} TRACKS</p>
        
        <div className="absolute bottom-6 right-6 p-3 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          <ArrowRight size={16} className="text-white" />
        </div>
      </motion.div>
    );
  };

  if (!selectedPlaylistId) {
    return (
      <div className="h-full p-10 overflow-y-auto custom-scrollbar pb-40 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-12" dir="rtl">
          <div>
            <h2 className="text-6xl font-black tracking-tighter text-white">پلی‌لیست‌ها</h2>
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Personal Audio Collections</p>
          </div>
          <button 
            onClick={onCreatePlaylist}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center gap-3 transition-all shadow-2xl hover:scale-105"
          >
            <Plus size={20} /> پلی‌لیست هوشمند
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          <CategoryCard id="system-recent-added" name="New Mix" icon={Zap} color="#3b82f6" />
          <CategoryCard id="system-recent-played" name="History" icon={History} color="#8b5cf6" />
          <CategoryCard id="system-top-played" name="Heavy Rotation" icon={Flame} color="#ef4444" />
          <CategoryCard id="system-liked" name="Favorites" icon={Heart} color="#ec4899" />
          <CategoryCard id="system-with-lyrics" name="Sing Along" icon={AlignLeft} color="#06b6d4" />
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] px-2 flex items-center gap-2">
            <ListMusic size={12} /> User Collections
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {playlists.filter(p => !p.isSystem).map(p => (
              <div 
                key={p.id} onClick={() => onSelectPlaylist(p.id)}
                className="group cursor-pointer space-y-3"
              >
                <div className="aspect-square bg-white/[0.03] border border-white/5 rounded-[2rem] overflow-hidden relative shadow-xl">
                  {p.coverUrl ? (
                    <img src={p.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800">
                      <Music2 size={40} className="opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play size={24} fill="white" className="text-white" />
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white text-center truncate">{p.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 overflow-hidden pb-32">
      <div className="p-10 flex items-center gap-10">
        <button onClick={() => onSelectPlaylist(null)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all">
          <ChevronLeft size={24} />
        </button>
        
        <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 shrink-0">
          <img src={selectedPlaylist?.coverUrl || playlistSongs[0]?.coverUrl} className="w-full h-full object-cover" alt="" />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-5xl font-black text-white tracking-tighter truncate mb-2">
            {selectedPlaylist?.name || "Collection"}
          </h1>
          <div className="flex items-center gap-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
            <span>{playlistSongs.length} ASSETS</span>
            <span>{totalDuration} TOTAL</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            // Fix: Added missing dateCreated and lastModified properties to comply with Playlist interface
            onClick={() => onPlayPlaylist({ 
              id: selectedPlaylistId, 
              name: selectedPlaylist?.name || 'Collection', 
              songIds: playlistSongs.map(s => s.id),
              dateCreated: selectedPlaylist?.dateCreated || Date.now(),
              lastModified: selectedPlaylist?.lastModified || Date.now()
            })}
            className="px-8 py-4 bg-white text-black rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-2xl"
          >
            <Play size={18} fill="currentColor" /> Play All
          </button>
          {selectedPlaylist && !selectedPlaylist.isSystem && (
            <button onClick={() => onDeletePlaylist(selectedPlaylist.id)} className="p-4 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all border border-white/5">
              <Trash2 size={20}/>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-10">
        <div className="space-y-1 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-4">
          {playlistSongs.map((song, i) => (
            <div 
              key={song.id + i} onClick={() => onSongSelect(song)}
              className={`group flex items-center gap-6 px-6 py-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer ${currentSongId === song.id ? 'bg-blue-600/10' : ''}`}
              dir="rtl"
            >
              <div className="w-6 text-[10px] font-black text-zinc-700">{i + 1}</div>
              <img src={song.coverUrl} className="w-10 h-10 rounded-xl object-cover" alt="" />
              <div className="flex-1 text-right">
                <h4 className={`font-bold text-sm ${currentSongId === song.id ? 'text-blue-500' : 'text-white'}`}>{song.title}</h4>
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{song.artist}</p>
              </div>
              <div className="text-[10px] font-mono text-zinc-600">
                {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistView;
