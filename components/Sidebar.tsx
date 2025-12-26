
import React from 'react';
import { 
  Library, ListMusic, Settings, Info, Home, LayoutGrid 
} from 'lucide-react';
import { NavigationTab, Playlist } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  playlists: Playlist[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, playlists }) => {
  const NavItem = ({ icon: Icon, label, tab }: { icon: any, label: string, tab: NavigationTab }) => (
    <button
      onClick={() => onTabChange(tab)}
      className={`relative w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 group ${
        activeTab === tab 
          ? 'bg-white/10 text-white shadow-2xl ring-1 ring-white/10' 
          : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
      }`}
    >
      <Icon size={18} className={activeTab === tab ? 'text-blue-400' : ''} />
      <span className="text-[14px] font-black tracking-tight">{label}</span>
      {activeTab === tab && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-500 rounded-full" />}
    </button>
  );

  return (
    <aside className="w-[320px] h-full flex flex-col pt-16 p-6 z-40 bg-transparent border-r border-white/5">
      <div className="space-y-2 mb-10">
        <NavItem icon={Home} label="Now Playing" tab={NavigationTab.Home} />
        <NavItem icon={LayoutGrid} label="Collections" tab={NavigationTab.Playlists} />
        <NavItem icon={Library} label="All System Tracks" tab={NavigationTab.AllSongs} />
      </div>

      <div className="px-5 mb-5 flex items-center justify-between">
        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">AI Mixes</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
        {playlists.filter(p => p.isSystem).map(p => (
          <button 
            key={p.id} 
            onClick={() => onTabChange(NavigationTab.Playlists)}
            className="w-full text-left px-5 py-3 text-zinc-500 hover:text-white text-xs font-bold truncate rounded-2xl hover:bg-white/5 flex items-center gap-4 transition-all"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500/40" />
            <span className="truncate uppercase tracking-tight">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="pt-6 border-t border-white/5 space-y-2">
        <NavItem icon={Settings} label="Preferences" tab={NavigationTab.Settings} />
        <NavItem icon={Info} label="About Aurora" tab={NavigationTab.About} />
      </div>
    </aside>
  );
};

export default Sidebar;
