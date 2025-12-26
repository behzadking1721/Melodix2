
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
      <div className="p-10 pb-32 animate-in fade-in duration-500">
        <div className="mb-12">
          <h2 className="text-5xl font-black mb-1 tracking-tighter text-white">Playlists</h2>
          <p className="text-zinc-500 font-black uppercase text-[9px] tracking-[0.3em]">AI-Engineered Collections</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {playlists.map(p => {
            const pSongs = songs.filter(s => p.songIds.includes(s.id));
            const topArtist = pSongs.length > 0 ? pSongs.reduce((prev, current) => (prev.playCount > current.playCount) ? prev : current).artist : 'System';

            return (
              <div key={p.id} onClick={() => onPlaylistSelect?.(p.id)} className="group cursor-pointer">
                <div className="aspect-square rounded-[2rem] overflow-hidden mb-5 relative shadow-2xl bg-zinc-900 border border-white/5 transition-all group-hover:-translate-y-2">
                  <img src={p.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-2xl">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="px-2 space-y-1">
                  <h3 className="font-bold text-base truncate text-white tracking-tight">{p.name}</h3>
                  <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-black uppercase tracking-wider">
                    <span className="truncate">{topArtist} Pulse</span>
                    <span>•</span>
                    <span>{pSongs.length} Files</span>
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
    <div className="p-10 pb-32 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-5xl font-black mb-1 tracking-tighter text-white">Music's</h2>
          <div className="flex items-center gap-3 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
            <span className="flex items-center gap-1"><FolderOpen size={12} className="text-blue-500" /> SYSTEM_STORAGE</span>
            <span>{songs.length} ASSETS FOUND</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setIsGridView(false)} 
              className={`p-2 rounded-lg transition-all ${!isGridView ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-300'}`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setIsGridView(true)} 
              className={`p-2 rounded-lg transition-all ${isGridView ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-300'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {isGridView ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {filteredSongs.map(song => (
            <div 
              key={song.id} onClick={() => onSongSelect(song)}
              className="group bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 p-4 rounded-3xl transition-all cursor-pointer relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative shadow-lg">
                <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Play size={24} fill="white" className="text-white" />
                </div>
              </div>
              <h4 className={`font-bold text-sm truncate mb-0.5 ${currentSongId === song.id ? 'text-blue-400' : 'text-white'}`}>{song.title}</h4>
              <p className="text-[10px] text-zinc-600 font-bold truncate uppercase">{song.artist}</p>
              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                <div className="flex gap-1">
                   {song.isSynced && <CheckCircle size={10} className="text-blue-500" />}
                   {song.hasLyrics && <FileText size={10} className="text-green-500" />}
                </div>
                <span className="text-[8px] text-zinc-700 font-black uppercase">{song.playCount} PLAYS</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredSongs.map((song, idx) => (
            <div 
              key={song.id} onClick={() => onSongSelect(song)}
              className={`group flex items-center gap-4 px-5 py-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer ${currentSongId === song.id ? 'bg-white/10' : ''}`}
            >
              <div className="w-6 text-[9px] font-black text-zinc-700">{idx + 1}</div>
              <div className="flex-1 flex items-center gap-4 min-w-0">
                <img src={song.coverUrl} className="w-10 h-10 rounded-lg shadow-md object-cover" alt="" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold text-sm truncate ${currentSongId === song.id ? 'text-blue-400' : 'text-white'}`}>{song.title}</h4>
                    {song.isSynced && <CheckCircle size={12} className="text-blue-500" />}
                  </div>
                  <p className="text-[10px] text-zinc-600 font-medium truncate">{song.artist}</p>
                </div>
              </div>
              <div className="w-1/4 text-[10px] font-semibold text-zinc-600 truncate">{song.album}</div>
              <div className="w-16 text-right text-[10px] font-mono text-zinc-600">
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
