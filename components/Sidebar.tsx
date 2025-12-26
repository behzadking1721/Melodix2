
import React from 'react';
import { 
  Library, Settings, Info, Home, LayoutGrid, Zap 
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
      className={`relative w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
        activeTab === tab 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
      }`}
    >
      <Icon size={18} className={activeTab === tab ? 'text-white' : 'group-hover:text-blue-400'} />
      <span className="text-[13px] font-bold tracking-tight capitalize">{label}</span>
      {activeTab === tab && <div className="absolute right-4 w-1 h-1 bg-white rounded-full" />}
    </button>
  );

  return (
    <aside className="w-[260px] h-full flex flex-col pt-16 p-6 z-40 bg-transparent border-r border-white/5 shrink-0">
      <div className="flex items-center gap-3 px-4 mb-10">
        <Zap className="text-blue-500" fill="currentColor" size={20} />
        <h1 className="text-xl font-black tracking-tighter text-white">Melodix</h1>
      </div>

      <div className="space-y-2 mb-10">
        <NavItem icon={Home} label="Main" tab={NavigationTab.Home} />
        <NavItem icon={LayoutGrid} label="Playlist" tab={NavigationTab.Playlists} />
        <NavItem icon={Library} label="Music's" tab={NavigationTab.AllSongs} />
      </div>

      <div className="px-4 mb-4">
        <h3 className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">Collections</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
        {playlists.filter(p => p.isSystem).map(p => (
          <button 
            key={p.id} 
            onClick={() => onTabChange(NavigationTab.Playlists)}
            className="w-full text-left px-4 py-3 text-zinc-500 hover:text-white text-[11px] font-bold truncate rounded-xl hover:bg-white/5 flex items-center gap-3 transition-all group"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-blue-500 transition-colors" />
            <span className="truncate uppercase tracking-wider">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="pt-6 border-t border-white/5 space-y-2 mt-auto">
        <NavItem icon={Settings} label="Settings" tab={NavigationTab.Settings} />
        <NavItem icon={Info} label="About" tab={NavigationTab.About} />
      </div>
    </aside>
  );
};

export default Sidebar;
