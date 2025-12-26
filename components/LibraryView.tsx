
import React, { useState, useMemo } from 'react';
import { Song, ArtistViewModel, AlbumViewModel } from '../types';
import { 
  Play, Search, LayoutGrid, List, PlusCircle, 
  Edit3, SearchX, Mic2, Disc, ArrowLeft, 
  MoreVertical, Music2, Clock, ChevronRight, Zap
} from 'lucide-react';
import TagEditor from './TagEditor';
import { motion, AnimatePresence } from 'framer-motion';

// Declare cast motion components to fix JSX errors
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
  const [isGridView, setIsGridView] = useState(true);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  // Grouping Logic - Artist -> Album -> Track
  const artists = useMemo(() => {
    const artistMap: Record<string, ArtistViewModel> = {};
    
    songs.forEach(song => {
      if (!artistMap[song.artist]) {
        artistMap[song.artist] = {
          name: song.artist,
          albums: [],
          songCount: 0,
          coverUrl: song.coverUrl
        };
      }
      artistMap[song.artist].songCount++;
      
      let album = artistMap[song.artist].albums.find(a => a.name === song.album);
      if (!album) {
        album = {
          name: song.album,
          artist: song.artist,
          year: song.year,
          coverUrl: song.coverUrl,
          songs: [],
          totalDuration: 0
        };
        artistMap[song.artist].albums.push(album);
      }
      album.songs.push(song);
      album.totalDuration += song.duration;
    });

    return Object.values(artistMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [songs]);

  // Search Logic
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return null;
    return songs.filter(s => 
      s.title.toLowerCase().includes(query) ||
      s.artist.toLowerCase().includes(query) ||
      s.album.toLowerCase().includes(query) ||
      s.genre.toLowerCase().includes(query)
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

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden">
      {/* Search & Breadcrumbs */}
      <div className="p-8 pb-4 flex items-center justify-between gap-6" dir="rtl">
        <div className="flex items-center gap-4">
          {path.type !== 'root' && (
            <button onClick={handleBack} className="p-2 hover:bg-white/5 rounded-xl transition-all">
              <ArrowLeft size={20} className="text-zinc-400" />
            </button>
          )}
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">
              {path.label}
            </h2>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">
              {path.type === 'root' ? `${artists.length} ARTISTS` : path.type === 'artist' ? `${currentArtist?.albums.length} ALBUMS` : `${currentAlbum?.songs.length} TRACKS`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search size={14} className="absolute right-4 top-3.5 text-zinc-500 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی هوشمند..."
              className="bg-white/5 border border-white/5 rounded-2xl py-3 pr-10 pl-4 text-xs font-bold focus:w-80 w-48 transition-all outline-none"
            />
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button onClick={() => setIsGridView(true)} className={`p-2 rounded-lg transition-all ${isGridView ? 'bg-white text-black' : 'text-zinc-500'}`}><LayoutGrid size={16}/></button>
            <button onClick={() => setIsGridView(false)} className={`p-2 rounded-lg transition-all ${!isGridView ? 'bg-white text-black' : 'text-zinc-500'}`}><List size={16}/></button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-40">
        <AnimatePresence mode="wait">
          {searchQuery ? (
            <MotionDiv key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
              {filteredData?.map(song => (
                <SongRow key={song.id} song={song} onSelect={() => onSongSelect(song)} isPlaying={song.id === currentSongId} onAddNext={() => onAddNext(song)} onAddToQueue={() => onAddToQueue(song)} />
              ))}
            </MotionDiv>
          ) : path.type === 'root' ? (
            <MotionDiv key="artists" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {artists.map(artist => (
                <div 
                  key={artist.name} 
                  onClick={() => setPath({ type: 'artist', id: artist.name, label: artist.name })}
                  className="group cursor-pointer space-y-3"
                >
                  <div className="aspect-square rounded-[2.5rem] overflow-hidden relative shadow-xl bg-zinc-900 border border-white/5">
                    <img src={artist.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Mic2 size={32} className="text-white" />
                    </div>
                  </div>
                  <div className="text-center" dir="rtl">
                    <h4 className="font-bold text-sm text-white truncate px-2">{artist.name}</h4>
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{artist.albums.length} آلبوم</p>
                  </div>
                </div>
              ))}
            </MotionDiv>
          ) : path.type === 'artist' ? (
            <MotionDiv key="albums" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentArtist?.albums.map(album => (
                <div 
                  key={album.name}
                  onClick={() => setPath({ type: 'album', id: album.name, label: album.name })}
                  className="p-6 bg-white/[0.03] border border-white/5 rounded-[2.5rem] flex gap-6 hover:bg-white/5 transition-all cursor-pointer group"
                  dir="rtl"
                >
                  <img src={album.coverUrl} className="w-24 h-24 rounded-2xl shadow-2xl object-cover" />
                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="text-lg font-black text-white truncate">{album.name}</h4>
                    <p className="text-xs text-zinc-500 font-bold">{album.year}</p>
                    <p className="text-[10px] text-blue-500 font-black uppercase mt-2">{album.songs.length} آهنگ</p>
                  </div>
                  <ChevronRight size={18} className="mr-auto self-center text-zinc-700 group-hover:text-white transition-colors" />
                </div>
              ))}
            </MotionDiv>
          ) : (
            <MotionDiv key="tracks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
               <div className="flex items-center gap-6 p-6 mb-8 bg-blue-600/10 rounded-[2.5rem] border border-blue-500/10" dir="rtl">
                 <img src={currentAlbum?.coverUrl} className="w-32 h-32 rounded-3xl shadow-2xl" />
                 <div>
                   <h3 className="text-3xl font-black text-white">{currentAlbum?.name}</h3>
                   <p className="text-blue-400 font-bold">{currentAlbum?.artist}</p>
                   <div className="flex items-center gap-4 mt-4">
                     <button onClick={() => currentAlbum && onSongSelect(currentAlbum.songs[0])} className="px-6 py-2 bg-white text-black rounded-xl font-black text-xs flex items-center gap-2 hover:scale-105 transition-all">
                       <Play size={14} fill="black"/> پخش آلبوم
                     </button>
                   </div>
                 </div>
               </div>
               {currentAlbum?.songs.map(song => (
                 <SongRow key={song.id} song={song} onSelect={() => onSongSelect(song)} isPlaying={song.id === currentSongId} onAddNext={() => onAddNext(song)} onAddToQueue={() => onAddToQueue(song)} />
               ))}
            </MotionDiv>
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
  <div 
    className={`group flex items-center gap-4 px-6 py-3 rounded-2xl transition-all cursor-pointer ${isPlaying ? 'bg-blue-600/10' : 'hover:bg-white/5'}`}
    dir="rtl"
    onClick={onSelect}
  >
    <div className="w-8 text-[10px] font-black text-zinc-700">{song.trackNumber || '•'}</div>
    <div className="flex-1 min-w-0">
      <h4 className={`font-bold text-sm truncate ${isPlaying ? 'text-blue-400' : 'text-white'}`}>{song.title}</h4>
      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest truncate">{song.artist}</p>
    </div>
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={(e) => { e.stopPropagation(); onAddNext(); }} className="p-2 text-zinc-500 hover:text-white" title="پخش بعدی"><Zap size={14}/></button>
      <button onClick={(e) => { e.stopPropagation(); onAddToQueue(); }} className="p-2 text-zinc-500 hover:text-white" title="افزودن به صف"><PlusCircle size={14}/></button>
    </div>
    <div className="w-12 text-left text-[10px] font-mono text-zinc-600">
      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
    </div>
  </div>
);

export default LibraryView;
