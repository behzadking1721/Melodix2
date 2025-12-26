
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Maximize2 } from 'lucide-react';
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xl z-[1000]">
      <motion.div 
        layoutId="player-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative w-80 h-80 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)] border border-white/10 group"
      >
        <motion.img 
          layoutId={`cover-${currentSong.id}`}
          src={currentSong.coverUrl} className="w-full h-full object-cover" alt="" 
        />
        
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-8 text-center">
          <button onClick={onRestore} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white transition-all">
            <Maximize2 size={18} />
          </button>
          
          <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="mb-6">
            <h4 className="font-black text-lg truncate w-56 text-white tracking-tighter">{currentSong.title}</h4>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-1">{currentSong.artist}</p>
          </motion.div>

          <div className="flex items-center gap-8">
            <button onClick={onPrev} className="text-zinc-400 hover:text-white hover:scale-125 transition-all"><SkipBack size={24} fill="currentColor"/></button>
            <button 
              onClick={onTogglePlay}
              className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={onNext} className="text-zinc-400 hover:text-white hover:scale-125 transition-all"><SkipForward size={24} fill="currentColor"/></button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MiniPlayer;
