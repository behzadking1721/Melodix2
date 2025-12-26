
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize2, X } from 'lucide-react';
import { Song } from '../types';

interface MiniPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRestore: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ 
  currentSong, isPlaying, onTogglePlay, onNext, onPrev, onRestore 
}) => {
  if (!currentSong) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-[1000] p-4">
      <div className="relative w-72 h-72 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
        <img src={currentSong.coverUrl} className="w-full h-full object-cover" alt="" />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
          <button onClick={onRestore} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-all">
            <Maximize2 size={16} />
          </button>
          
          <div className="mb-4">
            <h4 className="font-bold text-sm truncate w-48 text-white">{currentSong.title}</h4>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{currentSong.artist}</p>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onPrev} className="text-white hover:scale-110 transition-transform"><SkipBack size={20} fill="currentColor"/></button>
            <button 
              onClick={onTogglePlay}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={onNext} className="text-white hover:scale-110 transition-transform"><SkipForward size={20} fill="currentColor"/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
