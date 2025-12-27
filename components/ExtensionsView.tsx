
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Puzzle, Globe, Shield, Zap, Settings, 
  Trash2, Plus, ShoppingBag, ExternalLink, 
  CheckCircle2, AlertTriangle, Search, Filter,
  MoreVertical, Power, Info, Package, Code2,
  Cpu, Mic2, Palette, Activity, Layers, Download
} from 'lucide-react';
import { extensionManager } from '../services/extensionManager';
import { MelodixExtension, ExtensionType } from '../types';

const MotionDiv = motion.div as any;

const STORE_EXTENSIONS: Partial<MelodixExtension>[] = [
  {
    id: 'store-musixmatch',
    name: 'Musixmatch Bridge',
    version: '4.1.0',
    author: 'Community Contrib',
    description: 'Access the worlds largest lyrics database. High-quality synced LRC streams.',
    type: 'lyrics-provider',
    permissions: ['network'],
    hasSettings: true
  },
  {
    id: 'store-reverb-pro',
    name: 'Neural Reverb DSP',
    version: '1.2.0',
    author: 'AudioPhile Labs',
    description: 'Advanced convolution reverb with AI room modeling.',
    type: 'audio-effect',
    permissions: ['audio-access'],
    hasSettings: true
  },
  {
    id: 'store-spectrum-3d',
    name: 'Prism 3D Visuals',
    version: '0.9.5',
    author: 'Melodix Visuals',
    description: 'Hyper-dynamic 3D spectrum analyzer using Three.js.',
    type: 'visualization',
    permissions: ['ui-access', 'audio-access'],
    hasSettings: false
  },
  {
    id: 'store-discord-rpc',
    name: 'Discord Rich Presence',
    version: '2.0.1',
    author: 'Discord Devs',
    description: 'Show what you are listening to on your Discord profile.',
    type: 'automation',
    permissions: ['network'],
    hasSettings: true
  }
];

const ExtensionsView: React.FC = () => {
  const [installed, setInstalled] = useState<MelodixExtension[]>([]);
  const [activeTab, setActiveTab] = useState<'installed' | 'store'>('installed');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ExtensionType | 'all'>('all');

  useEffect(() => {
    return extensionManager.subscribe(setInstalled);
  }, []);

  const handleToggle = (id: string) => extensionManager.toggleExtension(id);
  const handleUninstall = (id: string) => extensionManager.uninstallExtension(id);
  const handleInstall = (ext: any) => {
    extensionManager.installExtension({
      ...ext,
      status: 'enabled',
    } as MelodixExtension);
    setActiveTab('installed');
  };

  const filteredInstalled = installed.filter(ext => {
    const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || ext.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: ExtensionType) => {
    switch (type) {
      case 'lyrics-provider': return <Mic2 size={16} />;
      case 'audio-effect': return <Activity size={16} />;
      case 'visualization': return <Palette size={16} />;
      case 'automation': return <Cpu size={16} />;
      case 'ui-mod': return <Layers size={16} />;
      case 'tag-provider': return <Package size={16} />;
      default: return <Puzzle size={16} />;
    }
  };

  return (
    <div className="h-full overflow-hidden flex flex-col bg-transparent p-12">
      
      {/* --- Header --- */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-[var(--accent-color)] rounded-[1.5rem] text-white accent-glow">
               <Puzzle size={32} />
             </div>
             <div>
               <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Modular Extensions</h2>
               <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Plugin Management & Neural Hooks</p>
             </div>
          </div>
        </div>
        
        <div className="flex gap-4">
           <button 
            onClick={() => setActiveTab('installed')}
            className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'installed' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
           >
             Installed ({installed.length})
           </button>
           <button 
            onClick={() => setActiveTab('store')}
            className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'store' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
           >
             <ShoppingBag size={14} className="inline mr-2" /> Extension Store
           </button>
        </div>
      </header>

      {/* --- Toolbar --- */}
      <div className="flex flex-wrap items-center gap-6 mb-8 px-2">
        <div className="relative flex-1 max-w-md">
           <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
           <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plugins..."
            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-[var(--accent-color)]"
           />
        </div>
        <div className="flex gap-2">
           {['all', 'lyrics-provider', 'audio-effect', 'visualization', 'automation'].map(type => (
             <button 
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-[var(--accent-color)] text-white' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
             >
               {type.replace('-', ' ')}
             </button>
           ))}
        </div>
      </div>

      {/* --- Grid View --- */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-40">
        <AnimatePresence mode="wait">
          
          {activeTab === 'installed' ? (
            <MotionDiv 
              key="installed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredInstalled.length === 0 ? (
                <div className="col-span-full h-80 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                  <Puzzle size={64} />
                  <p className="text-sm font-black uppercase tracking-widest">No matching extensions installed</p>
                </div>
              ) : (
                filteredInstalled.map(ext => (
                  <div key={ext.id} className={`p-8 rounded-[2.5rem] border transition-all flex flex-col justify-between group ${ext.status === 'enabled' ? 'bg-white/[0.03] border-white/10' : 'bg-black/40 border-white/5 grayscale opacity-60'}`}>
                    <div className="space-y-6">
                       <div className="flex items-start justify-between">
                         <div className={`p-4 rounded-2xl ${ext.status === 'enabled' ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]' : 'bg-zinc-800 text-zinc-600'}`}>
                           {getTypeIcon(ext.type)}
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => handleToggle(ext.id)} className={`p-2.5 rounded-xl transition-all ${ext.status === 'enabled' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-zinc-600'}`}>
                              <Power size={16} />
                            </button>
                            <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all">
                              <Settings size={16} />
                            </button>
                         </div>
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-xl font-black text-white flex items-center gap-2">
                            {ext.name}
                            {ext.status === 'enabled' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                          </h4>
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">v{ext.version} • {ext.author}</p>
                          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{ext.description}</p>
                       </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                       <div className="flex gap-1">
                          {ext.permissions.map(p => (
                            <span key={p} className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase text-zinc-500">{p}</span>
                          ))}
                       </div>
                       <button onClick={() => handleUninstall(ext.id)} className="text-zinc-700 hover:text-red-500 transition-colors">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))
              )}
            </MotionDiv>
          ) : (
            <MotionDiv 
              key="store"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {STORE_EXTENSIONS.map(ext => (
                <div key={ext.id} className="p-8 bg-black/40 hover:bg-white/[0.02] border border-white/5 rounded-[2.5rem] transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={16} className="text-zinc-600" />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-4 w-fit bg-zinc-900 rounded-2xl text-zinc-500 group-hover:text-[var(--accent-color)] group-hover:bg-[var(--accent-color)]/10 transition-all">
                      {getTypeIcon(ext.type as ExtensionType)}
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-xl font-black text-white">{ext.name}</h4>
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Available v{ext.version} • {ext.author}</p>
                       <p className="text-xs text-zinc-500 leading-relaxed">{ext.description}</p>
                    </div>
                    <button 
                      onClick={() => handleInstall(ext)}
                      className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                    >
                      <Download size={14} /> Install Plugin
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="p-8 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 group hover:border-[var(--accent-color)]/20 transition-all cursor-pointer">
                 <Code2 size={40} className="text-zinc-800 group-hover:text-[var(--accent-color)] transition-all" />
                 <div className="space-y-1">
                   <h5 className="font-black text-white text-sm">Develop a Plugin</h5>
                   <p className="text-[10px] text-zinc-600 leading-tight">Access the Melodix SDK and build your own neural providers.</p>
                 </div>
              </div>
            </MotionDiv>
          )}

        </AnimatePresence>
      </main>

      {/* --- Footer Status --- */}
      <footer className="mt-8 flex items-center justify-between px-10">
         <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
           <Shield size={14} className="text-emerald-500" /> Verified Environment Hooked
         </div>
         <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
           <Zap size={14} className="text-amber-500" /> Neural Provider API: 6.0 Stable
         </div>
      </footer>

    </div>
  );
};

export default ExtensionsView;
