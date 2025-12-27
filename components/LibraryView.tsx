
import React, { useState, useMemo, useCallback } from 'react';
import { Song, ArtistViewModel, AlbumViewModel } from '../types';
import { 
  Play, Search, LayoutGrid, List, PlusCircle, 
  SearchX, Mic2, ArrowLeft, ChevronRight, Zap,
  Heart, Shuffle, Music2, Clock, Disc, User, 
  Calendar, Layers, MoreVertical, Tags, Image as ImageIcon
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

  // Advanced Library Aggregator
  const artists = useMemo(() => {
    const artistMap = new Map<string, ArtistViewModel>();
    
    for (const song of songs) {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  };

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden">
      {/* Dynamic Header */}
      <div className="p-8 pb-4 flex items-center justify-between gap-6 z-10">
        <div className="flex items-center gap-6">
          {path.type !== 'root' && (
            <button onClick={handleBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90 text-zinc-400 hover:text-white">
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="space-y-1">
            <h2 className="text-5xl font-black text-white tracking-tighter leading-tight">
              {path.type === 'root' ? 'Local Vault' : path.label}
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
               {path.type === 'root' ? (
                 <>
                   <span className="flex items-center gap-1.5"><User size={12}/> {artists.length} Artists</span>
                   <span className="w-1 h-1 rounded-full bg-zinc-800" />
                   <span className="flex items-center gap-1.5"><Music2 size={12}/> {songs.length} Tracks</span>
                 </>
               ) : path.type === 'artist' ? (
                 <>
                   <span className="flex items-center gap-1.5"><Disc size={12}/> {currentArtist?.albums.length} Albums</span>
                   <span className="w-1 h-1 rounded-full bg-zinc-800" />
                   <span className="flex items-center gap-1.5"><Clock size={12}/> {formatDuration(currentArtist?.albums.reduce((acc, a) => acc + a.totalDuration, 0) || 0)} Total</span>
                 </>
               ) : (
                 <>
                   <span className="flex items-center gap-1.5"><Calendar size={12}/> {currentAlbum?.year}</span>
                   <span className="w-1 h-1 rounded-full bg-zinc-800" />
                   <span className="flex items-center gap-1.5"><Music2 size={12}/> {currentAlbum?.songs.length} Tracks</span>
                 </>
               )}
            </div>
          </div>
        </div>

        <div className="relative group">
          <Search size={16} className="absolute left-5 top-4 text-zinc-500 group-focus-within:text-[var(--accent-color)] transition-colors" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within vault..."
            className="bg-white/5 border border-white/5 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold focus:w-96 w-64 transition-all outline-none placeholder:text-zinc-700"
          />
        </div>
      </div>

      <div className="flex-1 px-8 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {searchQuery ? (
            <MotionDiv key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
               <VirtualList 
                 items={filteredData || []} 
                 itemHeight={80} 
                 containerHeight={window.innerHeight - 250} 
                 renderItem={(song) => (
                    <SongRow 
                      key={song.id} 
                      song={song} 
                      onSelect={() => onSongSelect(song)} 
                      isPlaying={song.id === currentSongId} 
                      onAddNext={() => onAddNext(song)} 
                      onAddToQueue={() => onAddToQueue(song)} 
                    />
                 )} 
               />
            </MotionDiv>
          ) : path.type === 'root' ? (
            <MotionDiv 
              key="artists" 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 pb-40 pt-4"
            >
              {artists.map(artist => (
                <MotionDiv 
                  key={artist.name} 
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => setPath({ type: 'artist', id: artist.name, label: artist.name })} 
                  className="group cursor-pointer space-y-4"
                >
                  <div className="aspect-square rounded-[3rem] overflow-hidden relative shadow-2xl bg-zinc-900 border border-white/5 ring-1 ring-white/10 group-hover:ring-[var(--accent-color)]/50 transition-all duration-500">
                    <img src={artist.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-black shadow-2xl">
                        <User size={28} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center px-2">
                    <h4 className="font-black text-sm text-white truncate mb-1">{artist.name}</h4>
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{artist.albums.length} Albums • {artist.songCount} Tracks</p>
                  </div>
                </MotionDiv>
              ))}
            </MotionDiv>
          ) : path.type === 'artist' ? (
            <MotionDiv key="artist-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 pb-40">
              {/* Artist Action Bar */}
              <div className="flex gap-4 px-2">
                <button onClick={() => currentArtist && onSongSelect(currentArtist.albums[0].songs[0])} className="px-8 py-3.5 bg-white text-black rounded-2xl font-black text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-xl">
                  <Play size={16} fill="currentColor" /> Play All
                </button>
                <button className="px-8 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs flex items-center gap-3 hover:bg-white/10 transition-all">
                  <Shuffle size={16} /> Shuffle Artist
                </button>
                <button className="p-3.5 bg-white/5 border border-white/10 text-white rounded-2xl hover:text-pink-500 transition-all">
                  <Heart size={18} />
                </button>
              </div>

              {/* Album Discography */}
              <section className="space-y-8">
                <h3 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-3 px-2">
                   <Layers size={14} /> Discography
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentArtist?.albums.map(album => (
                    <MotionDiv 
                      key={album.name} 
                      whileHover={{ y: -5, scale: 1.02 }}
                      onClick={() => setPath({ type: 'album', id: album.name, label: album.name })} 
                      className="p-6 bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-[2.5rem] flex gap-6 cursor-pointer group transition-all"
                    >
                      <div className="relative w-28 h-28 shrink-0">
                        <img src={album.coverUrl} className="w-full h-full rounded-2xl shadow-2xl object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                          <Play size={24} fill="white" className="text-white" />
                        </div>
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="text-lg font-black text-white truncate leading-tight mb-1">{album.name}</h4>
                        <p className="text-xs text-zinc-500 font-bold mb-3">{album.year}</p>
                        <div className="flex items-center gap-3 text-[9px] font-black text-[var(--accent-color)] uppercase tracking-widest">
                          <span>{album.songs.length} Tracks</span>
                          <span className="w-1 h-1 rounded-full bg-[var(--accent-color)]/30" />
                          <span>{formatDuration(album.totalDuration)}</span>
                        </div>
                      </div>
                    </MotionDiv>
                  ))}
                </div>
              </section>

              {/* Top Tracks for Artist */}
              <section className="space-y-8">
                <h3 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-3 px-2">
                   <Zap size={14} className="text-[var(--accent-color)]" /> Top Performances
                </h3>
                <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-4">
                  {currentArtist?.albums.flatMap(a => a.songs).sort((a,b) => b.playCount - a.playCount).slice(0, 5).map((song, i) => (
                    <SongRow 
                      key={song.id} 
                      song={song} 
                      onSelect={() => onSongSelect(song)} 
                      isPlaying={song.id === currentSongId} 
                      onAddNext={() => onAddNext(song)} 
                      onAddToQueue={() => onAddToQueue(song)} 
                      index={i + 1}
                    />
                  ))}
                </div>
              </section>
            </MotionDiv>
          ) : (
            <MotionDiv key="album-detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-40 space-y-12">
               {/* Album Hero Header */}
               <div className="flex flex-col md:flex-row items-center gap-12 p-8 bg-white/[0.02] border border-white/5 rounded-[4rem]">
                 <div className="relative w-64 h-64 shadow-[0_40px_80px_rgba(0,0,0,0.6)] rounded-[3rem] overflow-hidden group border border-white/10 shrink-0">
                   <img src={currentAlbum?.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s]" />
                   <div className="absolute inset-0 bg-black/20" />
                 </div>
                 <div className="flex-1 space-y-6 text-center md:text-left min-w-0">
                   <div className="space-y-2">
                     <p className="text-[11px] font-black text-[var(--accent-color)] uppercase tracking-[0.5em]">Album Sequence</p>
                     <h3 className="text-6xl font-black text-white tracking-tighter leading-tight truncate">{currentAlbum?.name}</h3>
                     <p className="text-2xl text-zinc-500 font-bold">{currentAlbum?.artist}</p>
                   </div>
                   <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                     <button onClick={() => currentAlbum && onSongSelect(currentAlbum.songs[0])} className="px-10 py-4 bg-white text-black rounded-2xl font-black text-xs flex items-center gap-4 hover:scale-105 transition-all shadow-2xl">
                        <Play size={20} fill="currentColor" /> Play Album
                     </button>
                     <button className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs flex items-center gap-4 hover:bg-white/10 transition-all">
                        <Shuffle size={20} /> Shuffle
                     </button>
                     <button className="p-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:text-[var(--accent-color)] transition-all">
                        <PlusCircle size={24} />
                     </button>
                   </div>
                 </div>
               </div>

               {/* Track List */}
               <div className="space-y-1 bg-white/[0.01] border border-white/5 rounded-[3rem] p-4">
                  <div className="flex items-center gap-6 px-8 py-4 text-[9px] font-black text-zinc-700 uppercase tracking-widest border-b border-white/5 mb-4">
                    <div className="w-8 text-center">#</div>
                    <div className="flex-1">Track Information</div>
                    <div className="w-32 text-right">Playback Time</div>
                  </div>
                  {currentAlbum?.songs.map((song, i) => (
                    <SongRow 
                      key={song.id} 
                      song={song} 
                      onSelect={() => onSongSelect(song)} 
                      isPlaying={song.id === currentSongId} 
                      onAddNext={() => onAddNext(song)} 
                      onAddToQueue={() => onAddToQueue(song)} 
                      index={i + 1}
                    />
                  ))}
               </div>
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

interface SongRowProps {
  song: Song;
  onSelect: () => void;
  isPlaying: boolean;
  onAddNext: () => void;
  onAddToQueue: () => void;
  index?: number;
}

const SongRow = ({ song, onSelect, isPlaying, onAddNext, onAddToQueue, index }: SongRowProps) => {
  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'full': return 'text-emerald-500';
      case 'partial': return 'text-amber-500';
      default: return 'text-zinc-800';
    }
  };

  return (
    <MotionDiv 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 5 }}
      className={`group flex items-center gap-6 px-8 h-20 rounded-[1.5rem] transition-all cursor-pointer relative ${isPlaying ? 'bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 shadow-[0_10px_30px_rgba(59,130,246,0.1)]' : 'hover:bg-white/[0.04] border border-transparent'}`} 
      onClick={onSelect}
    >
      <div className="w-8 text-[11px] font-black text-zinc-700 text-center group-hover:text-[var(--accent-color)] transition-colors">
        {isPlaying ? (
          <div className="flex gap-0.5 items-end justify-center h-3">
            {[1,2,3].map(b => (
              <div key={b} className="w-0.5 bg-[var(--accent-color)] animate-music-bar-small" style={{ animationDelay: `${b * 0.1}s` }} />
            ))}
          </div>
        ) : (
          index || song.trackNumber || '•'
        )}
      </div>
      
      <div className="relative w-12 h-12 shrink-0">
        <img src={song.coverUrl} className="w-full h-full rounded-xl object-cover shadow-lg" alt="" />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-3">
          <h4 className={`font-black text-sm truncate tracking-tight transition-colors ${isPlaying ? 'text-[var(--accent-color)]' : 'text-white group-hover:text-[var(--accent-color)]'}`}>
            {song.title}
          </h4>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest truncate max-w-[150px]">{song.artist}</p>
          <div className="flex items-center gap-3">
            <Mic2 size={10} className={`${getStatusColor(song.lyricsStatus)} transition-colors`} />
            <Tags size={10} className={`${getStatusColor(song.tagStatus)} transition-colors`} />
            <ImageIcon size={10} className={`${getStatusColor(song.coverStatus)} transition-colors`} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
        <button onClick={(e) => { e.stopPropagation(); onAddNext(); }} className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white rounded-xl transition-all" title="Play Next">
          <Zap size={14}/>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onAddToQueue(); }} className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white rounded-xl transition-all" title="Add to Queue">
          <PlusCircle size={14}/>
        </button>
        <button className="p-2.5 text-zinc-600 hover:text-white transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="w-16 text-right text-[11px] font-mono text-zinc-600 group-hover:text-white transition-colors">
        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
      </div>

      <style>{`
        @keyframes music-bar-small {
          0%, 100% { height: 3px; }
          50% { height: 10px; }
        }
        .animate-music-bar-small {
          animation: music-bar-small 0.6s ease-in-out infinite;
        }
      `}</style>
    </MotionDiv>
  );
};

export default LibraryView;
