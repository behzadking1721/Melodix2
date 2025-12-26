
import React, { useMemo, useState } from 'react';
import { Playlist, Song, PlaylistViewMode } from '../types';
import { 
  Plus, Play, ListMusic, Music2, 
  Clock, Trash2, Sparkles, ChevronLeft,
  MoreVertical, Share2, Heart, Zap, Flame, Mic2, Disc, 
  History, Library, AlignLeft, LayoutList, LayoutGrid, Columns
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
    
    if (id.startsWith('artist:')) {
      const artist = id.replace('artist:', '');
      return songs.filter(s => s.artist === artist);
    }
    if (id.startsWith('genre:')) {
      const genre = id.replace('genre:', '');
      return songs.filter(s => s.genre === genre);
    }

    const p = playlists.find(pl => pl.id === id);
    return p ? p.songIds.map(sid => songs.find(s => s.id === sid)).filter((s): s is Song => !!s) : [];
  };

  const playlistSongs = useMemo(() => {
    if (!selectedPlaylistId) return [];
    return getSongsForPlaylistId(selectedPlaylistId);
  }, [selectedPlaylistId, songs, recentSongs, playlists]);

  const artists = useMemo(() => Array.from(new Set(songs.map(s => s.artist))), [songs]);
  const genres = useMemo(() => Array.from(new Set(songs.map(s => s.genre))), [songs]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m ${seconds % 60}s`;
  };

  const totalDuration = useMemo(() => formatDuration(playlistSongs.reduce((acc, s) => acc + s.duration, 0)), [playlistSongs]);

  const CategoryCard = ({ id, name, icon: Icon, color, subText }: { id: string, name: string, icon: any, color: string, subText: string }) => {
    const categorySongs = getSongsForPlaylistId(id);
    const count = categorySongs.length;
    const dur = formatDuration(categorySongs.reduce((acc, s) => acc + s.duration, 0));
    
    return (
      <motion.div 
        whileHover={{ y: -4 }}
        onClick={() => onSelectPlaylist(id)}
        className="flex flex-col p-4 bg-white/[0.02] border border-white/5 rounded-[2rem] cursor-pointer hover:bg-white/[0.05] transition-all group relative overflow-hidden h-[230px]"
      >
        <div className="absolute top-3 right-3 px-2 py-1 bg-red-600/90 text-white rounded-lg text-[9px] font-black shadow-lg z-20 backdrop-blur-md">
          {count} TRKS
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg`} style={{ backgroundColor: color }}>
            <Icon size={16} />
          </div>
          <div className="min-w-0 text-left">
            <h4 className="font-bold text-white text-[12px] truncate leading-tight">{name}</h4>
            <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">{dur}</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="aspect-square bg-zinc-800/50 rounded-lg overflow-hidden border border-white/5">
              {categorySongs[idx] ? (
                <img src={categorySongs[idx].coverUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  <Music2 size={12} className="opacity-10" />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  if (!selectedPlaylistId) {
    return (
      <div className="h-full p-10 overflow-y-auto custom-scrollbar pb-40 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-white leading-none">Collections</h2>
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Personalized Audio Architect</p>
          </div>
          <button 
            onClick={onCreatePlaylist}
            className="w-9 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center transition-all shadow-xl hover:scale-105"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="space-y-4 mb-10">
          <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em] px-1 flex items-center gap-2">
            <Library size={10} /> Priority Access
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            <CategoryCard id="system-recent-added" name="New Arrivals" icon={Zap} color="#3b82f6" subText="New" />
            <CategoryCard id="system-recent-played" name="Heavy Rotation" icon={History} color="#8b5cf6" subText="History" />
            <CategoryCard id="system-top-played" name="Global Top" icon={Flame} color="#ef4444" subText="Hot" />
            <CategoryCard id="system-liked" name="Favorites" icon={Heart} color="#ec4899" subText="Loved" />
            <CategoryCard id="system-with-lyrics" name="Lyrics Vault" icon={AlignLeft} color="#06b6d4" subText="LRC Stream" />
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em] px-1">Semantic Groups</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {artists.slice(0, 5).map(artist => (
              <CategoryCard key={artist} id={`artist:${artist}`} name={artist} icon={Mic2} color="#10b981" subText="Artist" />
            ))}
            {genres.slice(0, 5).map(genre => (
              <CategoryCard key={genre} id={`genre:${genre}`} name={genre} icon={Disc} color="#f59e0b" subText="Genre" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 overflow-hidden pb-32">
      <div className="relative h-[180px] shrink-0 p-8 flex items-center gap-8 overflow-hidden border-b border-white/5 bg-black/40">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent pointer-events-none" />
        <img src={selectedPlaylist?.coverUrl || playlistSongs[0]?.coverUrl} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-10 scale-150" alt="" />
        
        <button 
          onClick={() => onSelectPlaylist(null)}
          className="relative z-20 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all border border-white/5"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="relative z-20 w-28 h-28 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          {selectedPlaylist?.coverUrl || playlistSongs[0]?.coverUrl ? (
             <img src={selectedPlaylist?.coverUrl || playlistSongs[0]?.coverUrl} className="w-full h-full object-cover" alt="" />
          ) : (
             <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700"><ListMusic size={32}/></div>
          )}
        </div>

        <div className="relative z-20 flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500">Collection Node</p>
            {/* View Switcher */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setViewMode(PlaylistViewMode.Detailed)} 
                className={`p-1.5 rounded-lg transition-all ${viewMode === PlaylistViewMode.Detailed ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                <LayoutList size={14} />
              </button>
              <button 
                onClick={() => setViewMode(PlaylistViewMode.Compact)} 
                className={`p-1.5 rounded-lg transition-all ${viewMode === PlaylistViewMode.Compact ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                <Columns size={14} />
              </button>
              <button 
                onClick={() => setViewMode(PlaylistViewMode.Grid)} 
                className={`p-1.5 rounded-lg transition-all ${viewMode === PlaylistViewMode.Grid ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
          
          <h1 className="text-3xl font-black text-white tracking-tighter truncate leading-none mb-3">
            {selectedPlaylist?.name || selectedPlaylistId.split(':')[1] || "Selected Stream"}
          </h1>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
               <span className="flex items-center gap-2"><Music2 size={12}/> {playlistSongs.length} Tracks</span>
               <span className="flex items-center gap-2"><Clock size={12}/> {totalDuration}</span>
             </div>
             <div className="flex items-center gap-3">
               <button 
                onClick={() => onPlayPlaylist({ id: selectedPlaylistId, name: selectedPlaylist?.name || 'Collection', songIds: playlistSongs.map(s => s.id) })}
                className="px-4 py-2 bg-white text-black rounded-lg font-black text-[10px] uppercase flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
               >
                 <Play size={12} fill="currentColor" /> Play
               </button>
               {selectedPlaylist && !selectedPlaylist.isSystem && (
                 <button onClick={() => onDeletePlaylist(selectedPlaylist.id)} className="p-2 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-white/5">
                   <Trash2 size={14}/>
                 </button>
               )}
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pt-6">
        <AnimatePresence mode="wait">
          {viewMode === PlaylistViewMode.Detailed && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-1">
              {playlistSongs.map((song, i) => (
                <div 
                  key={song.id + i} 
                  onClick={() => onSongSelect(song)}
                  className={`group flex items-center gap-6 px-6 py-2 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer border border-transparent ${currentSongId === song.id ? 'bg-blue-600/10 border-blue-500/10' : ''}`}
                >
                  <div className="w-6 text-[9px] font-black text-zinc-700 group-hover:text-blue-500">{i + 1}</div>
                  <img src={song.coverUrl} className="w-10 h-10 rounded-lg object-cover shadow-md" alt="" />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-[13px] truncate ${currentSongId === song.id ? 'text-blue-500' : 'text-white'}`}>{song.title}</h4>
                    <p className="text-[9px] text-zinc-600 font-black uppercase truncate">{song.artist}</p>
                  </div>
                  <div className="hidden md:block w-32 text-[10px] text-zinc-500 truncate">{song.album}</div>
                  <div className="text-[10px] font-mono text-zinc-600">
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-white transition-all"><MoreVertical size={14}/></button>
                </div>
              ))}
            </motion.div>
          )}

          {viewMode === PlaylistViewMode.Compact && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
              {playlistSongs.map((song, i) => (
                <div 
                  key={song.id + i} 
                  onClick={() => onSongSelect(song)}
                  className={`group flex items-center gap-4 px-4 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all cursor-pointer border border-transparent ${currentSongId === song.id ? 'bg-blue-600/10 border-blue-500/10' : ''}`}
                >
                  <div className="w-5 text-[9px] font-black text-zinc-700 group-hover:text-blue-500">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-[12px] truncate ${currentSongId === song.id ? 'text-blue-500' : 'text-white'}`}>{song.title}</h4>
                    <p className="text-[8px] text-zinc-600 font-black uppercase truncate">{song.artist}</p>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-600">
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {viewMode === PlaylistViewMode.Grid && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {playlistSongs.map((song) => (
                <div 
                  key={song.id} 
                  onClick={() => onSongSelect(song)}
                  className="group cursor-pointer space-y-2 text-center"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden relative shadow-lg border border-white/5 bg-zinc-900">
                    <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${currentSongId === song.id ? 'opacity-100' : ''}`}>
                      <Play size={20} fill="white" className="text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 px-1">
                    <h4 className={`font-bold text-[11px] truncate leading-tight ${currentSongId === song.id ? 'text-blue-500' : 'text-white'}`}>{song.title}</h4>
                    <p className="text-[8px] text-zinc-600 font-black uppercase truncate">{song.artist}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlaylistView;
