
import React, { useState, useEffect } from 'react';
import { 
  Library, Settings, Info, Home, ListMusic, Zap, LayoutGrid, Download, User, ShieldCheck, Activity, Puzzle, Brain, TerminalSquare, Cloud, Sliders, Eye, Mic2
} from 'lucide-react';
import { NavigationTab, Playlist, DownloadTask } from '../types';
import { enhancementEngine } from '../services/enhancementEngine';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  playlists: Playlist[];
  activePlaylistId: string | null;
  onSelectPlaylist: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, onTabChange, playlists, activePlaylistId, onSelectPlaylist 
}) => {
  const [activeTaskCount, setActiveTaskCount] = useState(0);

  useEffect(() => {
    return enhancementEngine.subscribe(tasks => {
      const active = tasks.filter(t => t.status === 'processing' || t.status === 'pending').length;
      setActiveTaskCount(active);
    });
  }, []);

  const NavItem = ({ icon: Icon, label, tab }: { icon: any, label: string, tab: NavigationTab }) => (
    <button
      onClick={() => onTabChange(tab)}
      className={`relative w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
        activeTab === tab && activePlaylistId === null
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
          : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
      }`}
    >
      <Icon size={18} className={activeTab === tab && activePlaylistId === null ? 'text-white' : 'group-hover:text-blue-400'} />
      <span className="text-[13px] font-bold tracking-tight capitalize flex-1 text-left">{label}</span>
      {tab === NavigationTab.Downloads && activeTaskCount > 0 && (
        <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md min-w-[18px] text-center">
          {activeTaskCount}
        </span>
      )}
      {activeTab === tab && activePlaylistId === null && <div className="absolute right-4 w-1 h-1 bg-white rounded-full" />}
    </button>
  );

  return (
    <aside className="w-[260px] h-full flex flex-col pt-16 p-6 z-40 bg-transparent border-r border-white/5 shrink-0">
      <div className="flex items-center gap-3 px-4 mb-10">
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Zap className="text-white" fill="white" size={16} />
        </div>
        <h1 className="text-xl font-black tracking-tighter text-white">Melodix</h1>
      </div>

      <div className="space-y-1 mb-10 overflow-y-auto custom-scrollbar pr-1">
        <NavItem icon={Home} label="Home" tab={NavigationTab.Home} />
        <NavItem icon={User} label="Profile" tab={NavigationTab.Profile} />
        <NavItem icon={LayoutGrid} label="Collections" tab={NavigationTab.Collections} />
        <NavItem icon={Library} label="Library" tab={NavigationTab.AllSongs} />
        <NavItem icon={ListMusic} label="Playlists" tab={NavigationTab.Playlists} />
        <NavItem icon={Mic2} label="Lyrics VZ" tab={NavigationTab.LyricsVisualizer} />
        <NavItem icon={Eye} label="Visualizer" tab={NavigationTab.Visualizer} />
        <NavItem icon={Sliders} label="Audio Lab" tab={NavigationTab.AudioLab} />
        <NavItem icon={Download} label="Downloads" tab={NavigationTab.Downloads} />
        <NavItem icon={Cloud} label="Cloud Sync" tab={NavigationTab.CloudSync} />
        <NavItem icon={ShieldCheck} label="SafeBox" tab={NavigationTab.Backup} />
        <NavItem icon={Activity} label="Diagnostics" tab={NavigationTab.Diagnostics} />
        <NavItem icon={Brain} label="Neural Hub" tab={NavigationTab.AISettings} />
        <NavItem icon={TerminalSquare} label="Dev Console" tab={NavigationTab.Developer} />
        <NavItem icon={Puzzle} label="Extensions" tab={NavigationTab.Extensions} />
      </div>

      <div className="px-4 mb-4">
        <h3 className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">Collections</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
        {playlists.map(p => (
          <button 
            key={p.id} 
            onClick={() => onSelectPlaylist(p.id)}
            className={`w-full text-left px-4 py-3 text-[11px] font-bold truncate rounded-xl flex items-center gap-3 transition-all group ${
              activePlaylistId === p.id 
                ? 'bg-white/10 text-white border border-white/5' 
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
              activePlaylistId === p.id ? 'bg-blue-500' : 'bg-zinc-800 group-hover:bg-blue-500'
            }`} />
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
