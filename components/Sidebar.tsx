
import React from 'react';
import { 
  Library, ListMusic, Settings, Info, Home, LayoutGrid, Zap 
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
      className={`relative w-full flex items-center gap-5 px-6 py-4 rounded-3xl transition-all duration-500 group ${
        activeTab === tab 
          ? 'bg-blue-600 text-white shadow-[0_15px_30px_rgba(37,99,235,0.2)]' 
          : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
      }`}
    >
      <Icon size={20} className={activeTab === tab ? 'text-white' : 'group-hover:text-blue-400'} />
      <span className="text-[14px] font-black tracking-tight">{label}</span>
      {activeTab === tab && <div className="absolute right-6 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />}
    </button>
  );

  return (
    <aside className="w-[340px] h-full flex flex-col pt-20 p-8 z-40 bg-transparent border-r border-white/5">
      <div className="flex items-center gap-4 px-6 mb-12">
        <Zap className="text-blue-500" fill="currentColor" size={24} />
        <h1 className="text-2xl font-black tracking-tighter text-white">Melodix</h1>
      </div>

      <div className="space-y-3 mb-12">
        <NavItem icon={Home} label="Auditorium" tab={NavigationTab.Home} />
        <NavItem icon={LayoutGrid} label="Pulse Hub" tab={NavigationTab.Playlists} />
        <NavItem icon={Library} label="Core Library" tab={NavigationTab.AllSongs} />
      </div>

      <div className="px-6 mb-6 flex items-center justify-between">
        <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">Smart Core</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
        {playlists.filter(p => p.isSystem).map(p => (
          <button 
            key={p.id} 
            onClick={() => onTabChange(NavigationTab.Playlists)}
            className="w-full text-left px-6 py-4 text-zinc-500 hover:text-white text-xs font-bold truncate rounded-3xl hover:bg-white/5 flex items-center gap-4 transition-all group"
          >
            <div className="w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-blue-500 transition-colors shadow-sm" />
            <span className="truncate uppercase tracking-[0.1em]">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="pt-8 border-t border-white/5 space-y-3 mt-auto">
        <NavItem icon={Settings} label="Engine Config" tab={NavigationTab.Settings} />
        <NavItem icon={Info} label="Melodix Info" tab={NavigationTab.About} />
      </div>
    </aside>
  );
};

export default Sidebar;
