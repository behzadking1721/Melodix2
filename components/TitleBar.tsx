
import React from 'react';
import { Minus, Square, X, Zap } from 'lucide-react';

const TitleBar: React.FC = () => {
  return (
    <div className="h-10 flex items-center justify-between bg-transparent titlebar-drag px-6 select-none fixed top-0 left-0 right-0 z-[100] border-b border-white/5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Zap size={12} fill="white" className="text-white" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Melodix Engine</span>
      </div>
      <div className="flex h-full no-drag">
        <button className="px-5 h-full hover:bg-white/5 transition-colors flex items-center justify-center text-zinc-500 hover:text-white">
          <Minus size={14} />
        </button>
        <button className="px-5 h-full hover:bg-white/5 transition-colors flex items-center justify-center text-zinc-500 hover:text-white">
          <Square size={11} />
        </button>
        <button className="px-5 h-full hover:bg-red-500 transition-colors flex items-center justify-center text-zinc-500 hover:text-white">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
