
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, MoreVertical, 
  ListPlus, Disc, User, AlignLeft, ChevronUp, ChevronDown,
  Volume2, Heart
} from 'lucide-react';
import { Song } from '../types';

interface CompactPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  progress: number;
  duration: number;
  onSeek: (value: number) => void;
  onShowLyrics?: () => void;
  onGoToArtist?: () => void;
  onGoToAlbum?: () => void;
}

const CompactPlayer: React.FC<CompactPlayerProps> = ({
  currentSong, isPlaying, onTogglePlay, onNext, onPrev,
  progress, duration, onSeek, onShowLyrics, onGoToArtist, onGoToAlbum
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, time: 0 });
  
  const progressBarRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    setTooltipPos({ x, time });
  };

  if (!currentSong) return (
    <div className="fixed bottom-0 left-0 right-0 h-14 mica border-t border-white/5 flex items-center justify-center text-zinc-600">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">No track is playing</p>
    </div>
  );

  return (
    <motion.div 
      initial={false}
      animate={{ height: isExpanded ? 96 : 56 }}
      className="fixed bottom-0 left-0 right-0 mica border-t border-white/5 z-[600] flex flex-col overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
    >
      {/* Main Player Row */}
      <div className="flex-1 flex items-center px-6 gap-6">
        
        {/* Left: Metadata */}
        <div className="flex items-center gap-4 w-1/4 min-w-[200px] cursor-pointer" onClick={onShowLyrics}>
          <div className="relative w-10 h-10 shrink-0 group">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentSong.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                src={currentSong.coverUrl} 
                className="w-full h-full rounded-lg object-cover shadow-lg border border-white/10"
              />
            </AnimatePresence>
          </div>
          
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm truncate text-white">{currentSong.title}</h4>
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex-1 flex items-center justify-center gap-8">
          <button onClick={onPrev} className="text-zinc-500 hover:text-white transition-all active:scale-90"><SkipBack size={18} fill="currentColor"/></button>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onTogglePlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xl ripple ${isPlaying ? 'bg-white text-black' : 'bg-[var(--accent-color)] text-white'}`}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Pause size={18} fill="currentColor" /></motion.div>
              ) : (
                <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Play size={18} fill="currentColor" className="ml-1" /></motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <button onClick={onNext} className="text-zinc-500 hover:text-white transition-all active:scale-90"><SkipForward size={18} fill="currentColor"/></button>
        </div>

        {/* Right: Actions */}
        <div className="w-1/4 flex items-center justify-end gap-4 relative">
          <button className="text-zinc-500 hover:text-pink-500 transition-colors">
            <Heart size={16} />
          </button>
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-xl transition-all ${isMenuOpen ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              <MoreVertical size={18} />
            </button>
            
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-12 right-0 w-48 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20"
                  >
                    {[
                      { icon: ListPlus, label: 'Add to Playlist', action: () => {} },
                      { icon: Disc, label: 'Go to Album', action: onGoToAlbum },
                      { icon: User, label: 'Go to Artist', action: onGoToArtist },
                      { icon: AlignLeft, label: 'Show Lyrics', action: onShowLyrics },
                    ].map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => { item.action?.(); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-left"
                      >
                        <item.icon size={14} /> {item.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress Bar (Always at bottom) */}
      <div 
        ref={progressBarRef}
        className="relative w-full cursor-pointer h-1.5 group/progress"
        onMouseEnter={() => setIsHoveringProgress(true)}
        onMouseLeave={() => setIsHoveringProgress(false)}
        onMouseMove={handleProgressHover}
        onClick={(e) => {
          const rect = progressBarRef.current!.getBoundingClientRect();
          const x = e.clientX - rect.left;
          onSeek((x / rect.width) * duration);
        }}
      >
        <div className="absolute inset-0 bg-white/10 transition-all group-hover/progress:h-2" />
        <motion.div 
          className="absolute inset-y-0 left-0 bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-glow)] transition-all group-hover/progress:h-2"
          style={{ width: `${(progress / duration) * 100}%` }}
        />
        
        {/* Tooltip */}
        <AnimatePresence>
          {isHoveringProgress && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: -25 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute pointer-events-none px-2 py-1 bg-black text-[9px] font-black text-white rounded-md border border-white/10"
              style={{ left: tooltipPos.x, transform: 'translateX(-50%)' }}
            >
              {formatTime(tooltipPos.time)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CompactPlayer;
