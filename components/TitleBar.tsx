
import React, { useEffect } from 'react';
import { Minus, Square, X, Zap, Search } from 'lucide-react';

interface TitleBarProps {
  onOpenSearch: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ onOpenSearch }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  return (
    <div className="h-10 flex items-center justify-between bg-transparent titlebar-drag px-6 select-none fixed top-0 left-0 right-0 z-[100] border-b border-white/5 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap size={12} fill="white" className="text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Melodix Engine</span>
        </div>
        
        <button 
          onClick={onOpenSearch}
          className="no-drag flex items-center gap-3 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all group"
        >
          <Search size={12} className="text-zinc-500 group-hover:text-blue-400" />
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300">Quick Search</span>
          <span className="text-[8px] font-black text-zinc-700 bg-black/40 px-1.5 rounded ml-2">CTRL+F</span>
        </button>
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
