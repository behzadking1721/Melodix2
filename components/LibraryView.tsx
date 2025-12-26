
import React, { useState, useMemo, useCallback } from 'react';
import { Song, ArtistViewModel, AlbumViewModel } from '../types';
import { 
  Play, Search, LayoutGrid, List, PlusCircle, 
  SearchX, Mic2, ArrowLeft, ChevronRight, Zap
} from 'lucide-react';
import TagEditor from './TagEditor';
import { VirtualList } from './VirtualList';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

interface LibraryViewProps {
  songs: Song[];
  onSongSelect: (song: Song) => void;
  onAddNext: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  currentSongId?: string;
  onUpdateSong: (updatedSong: Song) => void;
}

type DrillDownPath = {
  type: 'root' | 'artist' | 'album';
  id: string | null;
  label: string;
};

const LibraryView: React.FC<LibraryViewProps> = ({ 
  songs, onSongSelect, onAddNext, onAddToQueue, currentSongId, onUpdateSong
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [path, setPath] = useState<DrillDownPath>({ type: 'root', id: null, label: 'Library' });
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  const artists = useMemo(() => {
    const artistMap = new Map<string, ArtistViewModel>();
    
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      if (!artistMap.has(song.artist)) {
        artistMap.set(song.artist, {
          name: song.artist,
          albums: [],
          songCount: 0,
          coverUrl: song.coverUrl
        });
      }
      const artist = artistMap.get(song.artist)!;
      artist.songCount++;
      
      let album = artist.albums.find(a => a.name === song.album);
      if (!album) {
        album = {
          name: song.album,
          artist: song.artist,
          year: song.year,
          coverUrl: song.coverUrl,
          songs: [],
          totalDuration: 0
        };
        artist.albums.push(album);
      }
      album.songs.push(song);
      album.totalDuration += song.duration;
    }

    return Array.from(artistMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [songs]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return null;
    return songs.filter(s => 
      s.title.toLowerCase().includes(query) ||
      s.artist.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  const currentArtist = useMemo(() => 
    path.type !== 'root' ? artists.find(a => a.name === path.id) : null
  , [artists, path]);

  const currentAlbum = useMemo(() => 
    path.type === 'album' ? currentArtist?.albums.find(a => a.name === path.id) : null
  , [currentArtist, path]);

  const handleBack = () => {
    if (path.type === 'album') {
      setPath({ type: 'artist', id: currentArtist?.name || null, label: currentArtist?.name || '' });
    } else {
      setPath({ type: 'root', id: null, label: 'Library' });
    }
  };

  const renderSongRow = useCallback((song: Song) => (
    <SongRow 
      key={song.id} 
      song={song} 
      onSelect={() => onSongSelect(song)} 
      isPlaying={song.id === currentSongId} 
      onAddNext={() => onAddNext(song)} 
      onAddToQueue={() => onAddToQueue(song)} 
    />
  ), [currentSongId, onSongSelect, onAddNext, onAddToQueue]);

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden">
      <div className="p-8 pb-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {path.type !== 'root' && (
            <button onClick={handleBack} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
              <ArrowLeft size={18} className="text-zinc-400" />
            </button>
          )}
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">{path.label}</h2>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">
              {path.type === 'root' ? `${artists.length} Artists` : path.type === 'artist' ? `${currentArtist?.albums.length} Albums` : `${currentAlbum?.songs.length} Tracks`}
            </p>
          </div>
        </div>

        <div className="relative group">
          <Search size={14} className="absolute left-4 top-3.5 text-zinc-500 pointer-events-none group-focus-within:text-[var(--accent-color)] transition-colors" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search..."
            className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold focus:w-80 w-48 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex-1 px-8">
        <AnimatePresence mode="wait">
          {searchQuery ? (
            <div className="h-full">
               <VirtualList 
                 items={filteredData || []} 
                 itemHeight={64} 
                 containerHeight={window.innerHeight - 250} 
                 renderItem={renderSongRow} 
               />
            </div>
          ) : path.type === 'root' ? (
            <MotionDiv key="artists" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 pb-40 overflow-y-auto h-full custom-scrollbar">
              {artists.map(artist => (
                <div key={artist.name} onClick={() => setPath({ type: 'artist', id: artist.name, label: artist.name })} className="group cursor-pointer space-y-3">
                  <div className="aspect-square rounded-[2.5rem] overflow-hidden relative shadow-xl bg-zinc-900 border border-white/5">
                    <img src={artist.coverUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" loading="lazy" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Mic2 size={32} /></div>
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-sm text-white truncate px-2">{artist.name}</h4>
                    <p className="text-[9px] text-zinc-500 font-black uppercase">{artist.albums.length} Albums</p>
                  </div>
                </div>
              ))}
            </MotionDiv>
          ) : path.type === 'artist' ? (
            <MotionDiv key="albums" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-40 overflow-y-auto h-full custom-scrollbar">
              {currentArtist?.albums.map(album => (
                <div key={album.name} onClick={() => setPath({ type: 'album', id: album.name, label: album.name })} className="p-6 mica rounded-[2.5rem] flex gap-6 hover:bg-white/5 transition-all cursor-pointer group">
                  <img src={album.coverUrl} className="w-24 h-24 rounded-2xl shadow-lg object-cover" loading="lazy" />
                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="text-lg font-black text-white truncate">{album.name}</h4>
                    <p className="text-xs text-zinc-500 font-bold">{album.year}</p>
                    <p className="text-[10px] text-[var(--accent-color)] font-black uppercase mt-2">{album.songs.length} Tracks</p>
                  </div>
                </div>
              ))}
            </MotionDiv>
          ) : (
            <div className="h-full">
               <div className="flex items-center gap-6 p-8 mb-8 bg-[var(--accent-color)]/10 rounded-[3rem] border border-[var(--accent-color)]/10">
                 <img src={currentAlbum?.coverUrl} className="w-40 h-40 rounded-[2rem] shadow-2xl" />
                 <div className="space-y-2 text-left">
                   <h3 className="text-4xl font-black text-white">{currentAlbum?.name}</h3>
                   <p className="text-xl text-[var(--accent-color)] font-bold">{currentAlbum?.artist}</p>
                   <button onClick={() => currentAlbum && onSongSelect(currentAlbum.songs[0])} className="mt-4 px-8 py-3 bg-white text-black rounded-2xl font-black text-xs hover:scale-105 transition-all shadow-xl">Play Entire Album</button>
                 </div>
               </div>
               <VirtualList 
                 items={currentAlbum?.songs || []} 
                 itemHeight={64} 
                 containerHeight={window.innerHeight - 450} 
                 renderItem={renderSongRow} 
               />
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editingSong && <TagEditor song={editingSong} onClose={() => setEditingSong(null)} onSave={(u) => { onUpdateSong(u); setEditingSong(null); }} />}
      </AnimatePresence>
    </div>
  );
};

const SongRow = ({ song, onSelect, isPlaying, onAddNext, onAddToQueue }: { song: Song, onSelect: () => void, isPlaying: boolean, onAddNext: () => void, onAddToQueue: () => void }) => (
  <div className={`group flex items-center gap-4 px-6 h-14 rounded-2xl transition-all cursor-pointer ${isPlaying ? 'bg-[var(--accent-color)]/10' : 'hover:bg-white/5'}`} onClick={onSelect}>
    <div className="w-8 text-[10px] font-black text-zinc-700">{song.trackNumber || '•'}</div>
    <div className="flex-1 min-w-0 text-left">
      <h4 className={`font-bold text-sm truncate ${isPlaying ? 'text-[var(--accent-color)]' : 'text-white'}`}>{song.title}</h4>
      <p className="text-[10px] text-zinc-500 font-black uppercase truncate">{song.artist}</p>
    </div>
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={(e) => { e.stopPropagation(); onAddNext(); }} className="p-2 text-zinc-500 hover:text-white"><Zap size={14}/></button>
      <button onClick={(e) => { e.stopPropagation(); onAddToQueue(); }} className="p-2 text-zinc-500 hover:text-white"><PlusCircle size={14}/></button>
    </div>
    <div className="w-12 text-right text-[10px] font-mono text-zinc-600">
      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
    </div>
  </div>
);

export default LibraryView;
