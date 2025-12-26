
import React from 'react';
import { Song } from '../types';
import { RefreshCw, Music, Sparkles, Languages } from 'lucide-react';

interface LyricsViewProps {
  currentSong: Song | null;
  lyrics: string;
  isLoading: boolean;
  onRefresh: () => void;
}

const LyricsView: React.FC<LyricsViewProps> = ({ currentSong, lyrics, isLoading, onRefresh }) => {
  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
        <Music size={48} className="opacity-20" />
        <p>Start playing a song to view lyrics</p>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-12 z-10">
        <div className="flex items-center gap-6">
          <img src={currentSong.coverUrl} className="w-24 h-24 rounded-2xl shadow-2xl animate-in zoom-in-75 duration-500" alt="" />
          <div>
            <h2 className="text-3xl font-bold mb-1">{currentSong.title}</h2>
            <div className="flex items-center gap-2 text-zinc-400">
               <span className="font-medium">{currentSong.artist}</span>
               <span>•</span>
               <span className="text-sm italic">{currentSong.album}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white" title="Translate">
            <Languages size={20} />
          </button>
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 text-zinc-400 hover:text-white"
            title="Refresh Lyrics"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 space-y-8 z-10 custom-scrollbar mask-fade">
        {isLoading && !lyrics ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-400">
            <Sparkles size={40} className="animate-pulse text-blue-400" />
            <p className="animate-pulse font-medium tracking-wide">Syncing AI lyrics database...</p>
          </div>
        ) : (
          <div className="font-sans text-3xl md:text-5xl font-bold leading-tight tracking-tight text-zinc-500 max-w-4xl">
            {lyrics ? lyrics.split('\n').map((line, i) => (
              <span key={i} className="block hover:text-white transition-all duration-300 cursor-default mb-6 hover:translate-x-2">
                {line.trim() || <br />}
              </span>
            )) : (
              <div className="text-center py-20 opacity-30 text-2xl italic">
                {isLoading ? "Fetching lyrics..." : "Lyrics not available for this track."}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full aurora-gradient rounded-full blur-[150px]" />
      </div>
      
      <style>{`
        .mask-fade {
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
      `}</style>
    </div>
  );
};

export default LyricsView;
