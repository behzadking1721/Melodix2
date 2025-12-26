
import React, { useMemo } from 'react';
import { Playlist, Song } from '../types';
import { 
  Plus, Play, ListMusic, Music2, 
  Clock, Trash2, Sparkles, ChevronLeft,
  MoreVertical, Share2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PlaylistViewProps {
  playlists: Playlist[];
  songs: Song[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (id: string | null) => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  onDeletePlaylist: (id: string) => void;
  onCreatePlaylist: () => void;
  onSongSelect: (song: Song) => void;
  currentSongId?: string;
}

const PlaylistView: React.FC<PlaylistViewProps> = ({ 
  playlists, songs, selectedPlaylistId, onSelectPlaylist, 
  onPlayPlaylist, onDeletePlaylist, onCreatePlaylist, onSongSelect, currentSongId
}) => {
  const selectedPlaylist = useMemo(() => 
    playlists.find(p => p.id === selectedPlaylistId), 
    [playlists, selectedPlaylistId]
  );

  const playlistSongs = useMemo(() => {
    if (!selectedPlaylist) return [];
    return selectedPlaylist.songIds
      .map(id => songs.find(s => s.id === id))
      .filter((s): s is Song => !!s);
  }, [selectedPlaylist, songs]);

  const totalDuration = useMemo(() => {
    const seconds = playlistSongs.reduce((acc, s) => acc + s.duration, 0);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m ${seconds % 60}s`;
  }, [playlistSongs]);

  if (!selectedPlaylistId) {
    return (
      <div className="h-full p-10 overflow-y-auto custom-scrollbar pb-40 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-5xl font-black tracking-tighter text-white">Your Collections</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Manage your musical legacy</p>
          </div>
          <button 
            onClick={onCreatePlaylist}
            className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black transition-all shadow-2xl shadow-blue-600/20"
          >
            <Sparkles size={18} /> New Smart Playlist
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {playlists.map(playlist => (
            <motion.div 
              key={playlist.id} 
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
              onClick={() => onSelectPlaylist(playlist.id)}
            >
              <div className="aspect-square rounded-[2.5rem] overflow-hidden mb-5 relative shadow-2xl bg-zinc-900 border border-white/5">
                {playlist.coverUrl ? (
                  <img src={playlist.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 text-zinc-700">
                    <ListMusic size={64} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <button 
                    onClick={(e) => { e.stopPropagation(); onPlayPlaylist(playlist); }}
                    className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
                   >
                     <Play size={24} fill="currentColor" />
                   </button>
                </div>
              </div>
              <h4 className="font-bold text-white text-center truncate px-2">{playlist.name}</h4>
              <p className="text-[10px] text-zinc-500 font-black uppercase text-center tracking-widest mt-1">{playlist.songIds.length} Tracks</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 overflow-hidden pb-32">
      {/* Header Detail */}
      <div className="relative h-[400px] shrink-0 p-12 flex items-end gap-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10" />
        <img src={selectedPlaylist?.coverUrl || songs[0]?.coverUrl} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-125" alt="" />
        
        <button 
          onClick={() => onSelectPlaylist(null)}
          className="absolute top-10 left-10 z-20 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all border border-white/5"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="relative z-20 w-64 h-64 shrink-0 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10">
          {selectedPlaylist?.coverUrl ? (
             <img src={selectedPlaylist.coverUrl} className="w-full h-full object-cover" alt="" />
          ) : (
             <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700"><ListMusic size={80}/></div>
          )}
        </div>

        <div className="relative z-20 flex-1 space-y-4 pb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Playlist Collection</p>
          <h1 className="text-7xl font-black text-white tracking-tighter leading-none">{selectedPlaylist?.name}</h1>
          <div className="flex items-center gap-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">
            <span className="flex items-center gap-2"><Music2 size={14}/> {playlistSongs.length} Tracks</span>
            <span className="flex items-center gap-2"><Clock size={14}/> {totalDuration}</span>
          </div>
          
          <div className="flex items-center gap-4 pt-4">
             <button 
              onClick={() => selectedPlaylist && onPlayPlaylist(selectedPlaylist)}
              className="px-8 py-3.5 bg-white text-black rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-2xl"
             >
               <Play size={18} fill="currentColor" /> Play All
             </button>
             <button className="p-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/5"><Share2 size={20}/></button>
             <button 
              onClick={() => selectedPlaylist && onDeletePlaylist(selectedPlaylist.id)}
              className="p-3.5 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all border border-white/5"
             >
               <Trash2 size={20}/>
             </button>
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-10">
        <div className="space-y-2">
           {playlistSongs.map((song, i) => (
             <div 
              key={song.id} 
              onClick={() => onSongSelect(song)}
              className={`group flex items-center gap-6 px-6 py-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer border border-transparent ${currentSongId === song.id ? 'bg-blue-600/10 border-blue-500/20' : ''}`}
             >
               <div className="w-8 text-[10px] font-black text-zinc-700 group-hover:text-blue-500 transition-colors">{i + 1}</div>
               <div className="flex-1 min-w-0">
                 <h4 className={`font-bold text-sm truncate ${currentSongId === song.id ? 'text-blue-500' : 'text-white'}`}>{song.title}</h4>
                 <p className="text-[10px] text-zinc-500 font-black uppercase truncate">{song.artist}</p>
               </div>
               <div className="text-[10px] font-mono text-zinc-600">
                {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
               </div>
               <button className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-white transition-all"><MoreVertical size={16}/></button>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistView;
