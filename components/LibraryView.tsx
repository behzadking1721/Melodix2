
import React, { useState, useMemo } from 'react';
import { Song, Playlist } from '../types';
import { Play, FolderOpen, CheckCircle, FileText, LayoutGrid, List, PlusCircle, MoreVertical, Edit3, SearchX, Zap } from 'lucide-react';
import TagEditor from './TagEditor';
import { motion, AnimatePresence } from 'framer-motion';

interface LibraryViewProps {
  songs: Song[];
  playlists?: Playlist[];
  onSongSelect: (song: Song) => void;
  onAddToQueue?: (song: Song) => void;
  currentSongId?: string;
  onUpdateSong: (updatedSong: Song) => void;
  isPlaylistView?: boolean;
  onPlaylistSelect?: (id: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ 
  songs, playlists = [], onSongSelect, onAddToQueue, currentSongId, onUpdateSong, isPlaylistView = false, onPlaylistSelect
}) => {
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isGridView, setIsGridView] = useState(true);
  const [visibleCount, setVisibleCount] = useState(50);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
      setVisibleCount(prev => Math.min(prev + 50, songs.length));
    }
  };

  const displayedSongs = useMemo(() => songs.slice(0, visibleCount), [songs, visibleCount]);

  if (songs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-1000">
        <div className="relative">
          <SearchX size={120} className="text-zinc-800" />
          <div className="absolute inset-0 flex items-center justify-center text-blue-500 animate-pulse">
             <Zap size={40} fill="currentColor" />
          </div>
        </div>
        <div className="text-center space-y-2" dir="rtl">
           <h2 className="text-3xl font-black text-white">کتابخانه شما خالیست</h2>
           <p className="text-zinc-500 font-bold max-w-sm">برای شروع، پوشه حاوی فایل‌های موسیقی خود را انتخاب کنید تا ایندکس‌گذاری هوشمند آغاز شود.</p>
        </div>
        <button className="px-10 py-4 bg-blue-600 text-white rounded-3xl font-black shadow-2xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all">
          اسکن و افزودن موسیقی
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar" onScroll={handleScroll}>
      <div className="p-10 pb-32">
        <div className="flex items-center justify-between mb-12" dir="rtl">
          <div>
            <h2 className="text-6xl font-black mb-2 tracking-tighter text-white">کتابخانه موسیقی</h2>
            <div className="flex items-center gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><FolderOpen size={14} className="text-blue-500" /> Assets Managed</span>
              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg">{songs.length} Tracks Indexed</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 no-drag">
             <button className="px-6 py-2.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600/20 transition-all">
               Scan Folders
             </button>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
              <button onClick={() => setIsGridView(false)} className={`p-2.5 rounded-xl transition-all ${!isGridView ? 'bg-white text-black shadow-2xl scale-110' : 'text-zinc-500 hover:text-white'}`}><List size={18} /></button>
              <button onClick={() => setIsGridView(true)} className={`p-2.5 rounded-xl transition-all ${isGridView ? 'bg-white text-black shadow-2xl scale-110' : 'text-zinc-500 hover:text-white'}`}><LayoutGrid size={18} /></button>
            </div>
          </div>
        </div>

        {isGridView ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
            {displayedSongs.map(song => (
              <motion.div 
                key={song.id} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative"
              >
                <div 
                  className="aspect-square rounded-[2.5rem] overflow-hidden mb-5 relative shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/5 bg-zinc-900 cursor-pointer" 
                  onClick={() => onSongSelect(song)}
                >
                  <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${currentSongId === song.id ? 'opacity-100' : ''}`}>
                    <div className={`w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all ${currentSongId === song.id ? 'bg-blue-600 text-white' : ''}`}>
                      {currentSongId === song.id ? <Zap size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                    </div>
                  </div>
                </div>
                
                <div className="px-2 space-y-1 text-center" dir="rtl">
                  <h4 className={`font-bold text-sm truncate ${currentSongId === song.id ? 'text-blue-500' : 'text-white'}`}>{song.title}</h4>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-wider truncate">{song.artist}</p>
                </div>

                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => setEditingSong(song)} className="p-3 bg-black/60 backdrop-blur-xl border border-white/10 text-white rounded-2xl hover:bg-blue-600 transition-all"><Edit3 size={14}/></button>
                   <button onClick={() => onAddToQueue?.(song)} className="p-3 bg-black/60 backdrop-blur-xl border border-white/10 text-white rounded-2xl hover:bg-purple-600 transition-all"><PlusCircle size={14} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 bg-white/[0.02] border border-white/5 rounded-[3rem] p-4">
            {displayedSongs.map((song, idx) => (
              <div 
                key={song.id} 
                className={`group flex items-center gap-6 px-6 py-4 rounded-3xl hover:bg-white/5 transition-all cursor-pointer ${currentSongId === song.id ? 'bg-blue-600/10 border border-blue-500/10' : 'border border-transparent'}`}
                dir="rtl"
              >
                <div className="w-8 text-[10px] font-black text-zinc-700" onClick={() => onSongSelect(song)}>{idx + 1}</div>
                <div className="flex-1 flex items-center gap-5 min-w-0" onClick={() => onSongSelect(song)}>
                  <div className="relative w-12 h-12 shrink-0 rounded-2xl overflow-hidden shadow-lg border border-white/5">
                     <img src={song.coverUrl} className="w-full h-full object-cover" alt="" />
                     {currentSongId === song.id && <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center"><Zap size={16} fill="white" /></div>}
                  </div>
                  <div className="min-w-0 text-right">
                    <h4 className={`font-bold text-base truncate ${currentSongId === song.id ? 'text-blue-400' : 'text-white'}`}>{song.title}</h4>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest truncate">{song.artist}</p>
                  </div>
                </div>
                <div className="w-1/4 text-xs font-bold text-zinc-600 truncate hidden lg:block text-right">{song.album}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingSong(song)} className="opacity-0 group-hover:opacity-100 p-3 text-zinc-500 hover:text-white transition-all"><Edit3 size={16}/></button>
                  <button onClick={() => onAddToQueue?.(song)} className="opacity-0 group-hover:opacity-100 p-3 text-zinc-500 hover:text-blue-500 transition-all"><PlusCircle size={20} /></button>
                  <div className="w-16 text-left text-xs font-mono text-zinc-600 px-4">
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingSong && (
          <TagEditor 
            song={editingSong} onClose={() => setEditingSong(null)} 
            onSave={(updated) => { onUpdateSong(updated); setEditingSong(null); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LibraryView;
