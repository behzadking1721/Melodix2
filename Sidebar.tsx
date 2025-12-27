
import React from 'react';
import { 
  Library, Settings, Info, Home, ListMusic, Zap, LayoutGrid, Download, User, ShieldCheck, Activity, Puzzle, Brain, TerminalSquare, Cloud, Sliders, Eye, Mic2, Keyboard
} from 'lucide-react';
import { NavigationTab } from './types';

interface NavItemProps {
  icon: any;
  label: string;
  tab: NavigationTab;
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, tab, activeTab, onTabChange }) => (
  <button
    onClick={() => onTabChange(tab)}
    className={`relative w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
      activeTab === tab
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
        : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
    }`}
  >
    <Icon size={18} className={activeTab === tab ? 'text-white' : 'group-hover:text-blue-400'} />
    <span className="text-[13px] font-bold tracking-tight capitalize flex-1 text-left">{label}</span>
    {activeTab === tab && <div className="absolute right-4 w-1 h-1 bg-white rounded-full" />}
  </button>
);

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="w-[260px] h-full flex flex-col pt-16 p-6 z-40 bg-transparent border-r border-white/5 shrink-0">
      <div className="flex items-center gap-3 px-4 mb-10">
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Zap className="text-white" fill="white" size={16} />
        </div>
        <h1 className="text-xl font-black tracking-tighter text-white">Melodix</h1>
      </div>

      <div className="space-y-1 mb-10 overflow-y-auto custom-scrollbar pr-1">
        <NavItem icon={Home} label="Home" tab={NavigationTab.Home} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={User} label="Profile" tab={NavigationTab.Profile} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={LayoutGrid} label="Collections" tab={NavigationTab.Collections} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={Library} label="Library" tab={NavigationTab.AllSongs} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={ListMusic} label="Playlists" tab={NavigationTab.Playlists} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={Mic2} label="Lyrics VZ" tab={NavigationTab.LyricsVisualizer} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={Eye} label="Visualizer" tab={NavigationTab.Visualizer} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={Sliders} label="Audio Lab" tab={NavigationTab.AudioLab} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={Download} label="Downloads" tab={NavigationTab.Downloads} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={Cloud} label="Cloud Sync" tab={NavigationTab.CloudSync} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={ShieldCheck} label="SafeBox" tab={NavigationTab.Backup} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={Activity} label="Diagnostics" tab={NavigationTab.Diagnostics} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={Brain} label="Neural Hub" tab={NavigationTab.AISettings} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={TerminalSquare} label="Dev Console" tab={NavigationTab.Developer} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={Puzzle} label="Extensions" tab={NavigationTab.Extensions} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={Keyboard} label="Shortcuts" tab={NavigationTab.Shortcuts} activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      <div className="pt-6 border-t border-white/5 space-y-2 mt-auto">
        <NavItem icon={Settings} label="Settings" tab={NavigationTab.Settings} activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={Info} label="About" tab={NavigationTab.About} activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </aside>
  );
};

export default Sidebar;
