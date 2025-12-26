
import React from 'react';
import { Minus, Square, X } from 'lucide-react';

const TitleBar: React.FC = () => {
  return (
    <div className="h-8 flex items-center justify-between bg-transparent titlebar-drag px-4 select-none fixed top-0 left-0 right-0 z-[100]">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center text-[10px] font-bold">A</div>
        <span className="text-xs font-semibold text-zinc-400">Aurora Player</span>
      </div>
      <div className="flex h-full no-drag">
        <button className="px-4 h-full hover:bg-white/10 transition-colors flex items-center justify-center">
          <Minus size={14} />
        </button>
        <button className="px-4 h-full hover:bg-white/10 transition-colors flex items-center justify-center">
          <Square size={12} />
        </button>
        <button className="px-4 h-full hover:bg-red-600 transition-colors flex items-center justify-center">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
