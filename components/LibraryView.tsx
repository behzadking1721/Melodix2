
import React, { useState } from 'react';
import { Song, Playlist } from '../types';
import { Play, Search, Edit3, FolderOpen, CheckCircle, FileText, LayoutGrid, List, User, Music2 } from 'lucide-react';
import TagEditor from './TagEditor';

interface LibraryViewProps {
  songs: Song[];
  playlists?: Playlist[];
  onSongSelect: (song: Song) => void;
  currentSongId?: string;
  onUpdateSong: (updatedSong: Song) => void;
  isPlaylistView?: boolean;
  onPlaylistSelect?: (id: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ 
  songs, playlists = [], onSongSelect, currentSongId, onUpdateSong, isPlaylistView = false, onPlaylistSelect
}) => {
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGridView, setIsGridView] = useState(true);

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isPlaylistView) {
    return (
      <div className="p-8 pb-32 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-5xl font-black mb-2 tracking-tighter text-white">Collections</h2>
            <p className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.3em]">AI-Automated Local Mixes</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {playlists.map(p => {
            const pSongs = songs.filter(s => p.songIds.includes(s.id));
            const topArtist = pSongs.length > 0 ? pSongs.reduce((prev, current) => (prev.playCount > current.playCount) ? prev : current).artist : 'System';
            const topSong = pSongs.length > 0 ? pSongs.reduce((prev, current) => (prev.playCount > current.playCount) ? prev : current).title : 'Analysis...';

            return (
              <div key={p.id} onClick={() => onPlaylistSelect?.(p.id)} className="group cursor-pointer">
                <div className="aspect-square rounded-[2.5rem] overflow-hidden mb-5 relative shadow-2xl bg-zinc-900 border border-white/5 transition-all group-hover:-translate-y-2 group-hover:shadow-blue-500/10">
                  <img src={p.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play size={28} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="px-2 space-y-1.5">
                  <h3 className="font-bold text-lg truncate text-white tracking-tight">{p.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-black uppercase tracking-wider">
                    <User size={10} className="text-blue-500" />
                    <span className="truncate">{topArtist}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black text-zinc-600 uppercase tracking-widest pt-1 border-t border-white/5">
                    <span>{pSongs.length} Files</span>
                    <span className="text-blue-400">🔥 Top: {topSong}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-5xl font-black mb-2 tracking-tighter text-white">System Tracks</h2>
          <div className="flex items-center gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
            <span className="flex items-center gap-1.5"><FolderOpen size={14} className="text-blue-500" /> LOCAL_LIBRARY</span>
            <span className="text-zinc-800">•</span>
            <span>{songs.length} VALID ITEMS</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => setIsGridView(false)} 
              className={`p-2.5 rounded-xl transition-all ${!isGridView ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <List size={20} />
            </button>
            <button 
              onClick={() => setIsGridView(true)} 
              className={`p-2.5 rounded-xl transition-all ${isGridView ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" size={16} />
            <input 
              type="text" placeholder="Smart Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-72 transition-all"
            />
          </div>
        </div>
      </div>

      {isGridView ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {filteredSongs.map(song => (
            <div 
              key={song.id} onClick={() => onSongSelect(song)}
              className="group bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 p-4 rounded-3xl transition-all cursor-pointer relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative shadow-lg">
                <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Play size={32} fill="white" className="text-white drop-shadow-2xl" />
                </div>
              </div>
              <h4 className={`font-bold text-sm truncate mb-1 ${currentSongId === song.id ? 'text-blue-400' : 'text-white'}`}>{song.title}</h4>
              <p className="text-[10px] text-zinc-500 font-black uppercase truncate tracking-wider">{song.artist}</p>
              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                <div className="flex gap-1.5">
                   {song.isSynced && <CheckCircle size={12} className="text-blue-500" />}
                   {song.hasLyrics && <FileText size={12} className="text-green-500" />}
                </div>
                <span className="text-[9px] text-zinc-600 font-black uppercase">Plays: {song.playCount}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-4 px-6 py-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest border-b border-white/5 mb-4">
            <div className="w-8">#</div>
            <div className="flex-1">Title / Artist</div>
            <div className="w-1/4">Album</div>
            <div className="w-24 text-center">Plays</div>
            <div className="w-16 text-right">Dur.</div>
          </div>
          {filteredSongs.map((song, idx) => (
            <div 
              key={song.id} onClick={() => onSongSelect(song)}
              className={`group flex items-center gap-4 px-6 py-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer ${currentSongId === song.id ? 'bg-white/10 shadow-lg ring-1 ring-white/10' : ''}`}
            >
              <div className="w-8 text-[10px] font-black text-zinc-600">{idx + 1}</div>
              <div className="flex-1 flex items-center gap-4 min-w-0">
                <img src={song.coverUrl} className="w-11 h-11 rounded-xl shadow-md object-cover border border-white/5" alt="" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold text-sm truncate ${currentSongId === song.id ? 'text-blue-400' : 'text-white'}`}>{song.title}</h4>
                    {song.isSynced && <CheckCircle size={14} className="text-blue-500" />}
                    {song.hasLyrics && <FileText size={14} className="text-green-500" />}
                  </div>
                  <p className="text-xs text-zinc-500 font-medium truncate">{song.artist}</p>
                </div>
              </div>
              <div className="w-1/4 text-xs font-semibold text-zinc-500 truncate">{song.album}</div>
              <div className="w-24 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                {song.playCount}
              </div>
              <div className="w-16 text-right text-xs font-mono text-zinc-500">
                {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingSong && (
        <TagEditor 
          song={editingSong} onClose={() => setEditingSong(null)} 
          onSave={(updated) => { onUpdateSong(updated); setEditingSong(null); }} 
        />
      )}
    </div>
  );
};

export default LibraryView;
