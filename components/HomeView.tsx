
import React, { useState, useEffect, useMemo } from 'react';
import { Song } from '../types';
import { Sparkles, CheckCircle, FileText, Music, Info, Mic2 } from 'lucide-react';

interface HomeViewProps {
  currentSong: Song | null;
  lyrics: string;
  isLoadingLyrics: boolean;
  currentTime: number;
}

const HomeView: React.FC<HomeViewProps> = ({ currentSong, lyrics, isLoadingLyrics, currentTime }) => {
  const syncedLines = useMemo(() => {
    if (!lyrics) return [];
    return lyrics.split('\n').map((line, i) => {
      const timeMatch = line.match(/\[(\d+):(\d+\.?\d*)\]/);
      let time = i * 4; // Fallback simulation
      let text = line;
      if (timeMatch) {
        time = parseInt(timeMatch[1]) * 60 + parseFloat(timeMatch[2]);
        text = line.replace(/\[.*?\]/g, '').trim();
      }
      return { text: text || line.trim(), time };
    }).filter(l => l.text.length > 0);
  }, [lyrics]);

  const activeIndex = useMemo(() => {
    for (let i = syncedLines.length - 1; i >= 0; i--) {
      if (currentTime >= syncedLines[i].time) return i;
    }
    return 0;
  }, [currentTime, syncedLines]);

  if (!currentSong) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-6">
        <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center animate-pulse border border-white/5">
          <Music size={48} />
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-zinc-400">Aurora AI Ready</p>
          <p className="text-sm text-zinc-600">Select a local track to sync metadata</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row p-8 lg:p-12 gap-8 lg:gap-16 animate-in fade-in duration-700 overflow-hidden">
      {/* Left Side: Art & Info */}
      <div className="w-full lg:w-2/5 flex flex-col gap-8 shrink-0">
        <div className="relative group max-w-[450px] mx-auto lg:mx-0">
          <img 
            src={currentSong.coverUrl} 
            className="w-full aspect-square rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] object-cover border border-white/10 transition-transform duration-700 group-hover:scale-[1.02]"
            alt={currentSong.title} 
          />
          {currentSong.isSynced && (
            <div className="absolute top-6 right-6 bg-blue-500/90 backdrop-blur-md text-white p-2 rounded-2xl shadow-2xl flex items-center gap-2 px-4 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-4">
              <Sparkles size={14} /> AI Verified
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h1 className="text-white font-black tracking-tighter leading-[0.9] overflow-visible" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
            {currentSong.title}
          </h1>
          <p className="text-zinc-400 font-bold tracking-tight" style={{ fontSize: 'clamp(1rem, 2vw, 1.8rem)' }}>{currentSong.artist}</p>
          <div className="flex items-center gap-3 pt-4 flex-wrap">
            <div className="px-5 py-2 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              {currentSong.genre}
            </div>
            <div className="px-5 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase">
              {currentSong.playCount} Plays
            </div>
            {currentSong.hasLyrics && (
               <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-green-500/10 border border-green-500/20 text-[10px] font-black text-green-400 uppercase">
                 <Mic2 size={12} /> Musixmatch Sync
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Lyrics Dashboard */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/[0.02] rounded-[3rem] p-8 lg:p-12 border border-white/5 relative backdrop-blur-md">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
            <FileText size={14} className="text-blue-400" /> Synced Stream
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto space-y-12 pr-4 custom-scrollbar mask-fade scroll-smooth">
          {isLoadingLyrics ? (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="w-14 h-14 border-[3px] border-blue-500/10 border-t-blue-400 rounded-full animate-spin" />
              <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">Updating Local Cache...</p>
            </div>
          ) : syncedLines.length > 0 ? (
            syncedLines.map((line, i) => (
              <p 
                key={i} 
                className={`font-black tracking-tighter transition-all duration-700 cursor-default ${i === activeIndex ? 'text-white scale-105 origin-left' : 'text-zinc-700 hover:text-zinc-500'}`}
                style={{ fontSize: 'clamp(1.5rem, 4vw, 3.5rem)', lineHeight: 1.1 }}
              >
                {line.text}
              </p>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-700 italic gap-4">
               <Info size={40} className="opacity-10" />
               <p className="text-lg font-medium opacity-40">No lyrics synced for this file.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
