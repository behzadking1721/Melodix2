
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Trash2, Zap, Wind, Sparkles, 
  HardDrive, ShieldCheck, AlertCircle, RefreshCw,
  Clock, Filter, Search, Check, X,
  Maximize2, Activity, Layers, Server,
  ChevronRight, ArrowUpRight, Gauge,
  FileJson, FileImage, Mic2, Waves, 
  Settings2, Download, Eraser, Binary
} from 'lucide-react';
import { CacheCategoryStats, AppSettings } from '../types';

const MotionDiv = motion.div as any;

const MOCK_CATEGORIES: CacheCategoryStats[] = [
  { id: 'lyrics', name: 'Lyrics Cache', size: 124000000, itemCount: 4200, oldestFile: Date.now() - 86400000 * 30, health: 'optimal', description: 'AI-synced LRC files and metadata translations.' },
  { id: 'covers', name: 'Cover Art', size: 1850000000, itemCount: 12500, oldestFile: Date.now() - 86400000 * 120, health: 'bloated', description: 'High-resolution 4K album covers and artist portraits.' },
  { id: 'waveforms', name: 'Waveform Data', size: 450000000, itemCount: 3100, oldestFile: Date.now() - 86400000 * 45, health: 'optimal', description: 'Acoustic fingerprint maps for the player seekbar.' },
  { id: 'ai', name: 'Neural Cache', size: 85000000, itemCount: 850, oldestFile: Date.now() - 86400000 * 10, health: 'optimal', description: 'Gemini inference results for mood and genre analysis.' },
  { id: 'temp', name: 'Temp Buffer', size: 320000000, itemCount: 142, oldestFile: Date.now() - 3600000, health: 'optimal', description: 'Streaming chunks and decoded audio fragments.' },
  { id: 'db', name: 'Internal DB', size: 45000000, itemCount: 1, oldestFile: Date.now() - 86400000 * 365, health: 'optimal', description: 'Primary library index and playlist pointers.' }
];

const CacheManagerView: React.FC = () => {
  const [categories, setCategories] = useState<CacheCategoryStats[]>(MOCK_CATEGORIES);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaningProgress, setCleaningProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'optimize' | 'settings'>('overview');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const totalSize = useMemo(() => categories.reduce((acc, c) => acc + c.size, 0), [categories]);
  
  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleClean = (ids: string[]) => {
    setIsCleaning(true);
    setCleaningProgress(0);
    const interval = setInterval(() => {
      setCleaningProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setCategories(prev => prev.map(c => ids.includes(c.id) ? { ...c, size: 0, itemCount: 0, health: 'optimal' } : c));
          setIsCleaning(false);
          return 100;
        }
        return p + 5;
      });
    }, 100);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="h-full flex flex-col bg-transparent font-sans overflow-hidden p-12">
      
      {/* 1. HEADER & GLOBAL STATS */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-amber-500 rounded-[1.5rem] text-white shadow-xl shadow-amber-500/20">
               <HardDrive size={32} />
             </div>
             <div>
               <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Cache Custodian</h2>
               <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Data Integrity & Space Optimization</p>
             </div>
          </div>
        </div>

        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
           {['overview', 'optimize', 'settings'].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}
             >
               {tab}
             </button>
           ))}
        </div>
      </header>

      {/* 2. TOP METRICS STRIP */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center justify-between">
            <div className="space-y-1">
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Footprint</p>
               <h4 className="text-3xl font-black text-white">{formatSize(totalSize)}</h4>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><Gauge size={24}/></div>
         </div>
         <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center justify-between">
            <div className="space-y-1">
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Largest Slice</p>
               <h4 className="text-3xl font-black text-white">Covers</h4>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl"><FileImage size={24}/></div>
         </div>
         <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center justify-between">
            <div className="space-y-1">
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Health Index</p>
               <h4 className="text-3xl font-black text-emerald-500">94%</h4>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><ShieldCheck size={24}/></div>
         </div>
         <button 
           onClick={() => handleClean(categories.map(c => c.id))}
           className="p-8 bg-[var(--accent-color)] text-white rounded-[2.5rem] flex items-center justify-between shadow-2xl hover:scale-105 active:scale-95 transition-all"
         >
            <div className="text-left space-y-1">
               <p className="text-[9px] font-black opacity-60 uppercase tracking-widest">Action</p>
               <h4 className="text-2xl font-black">Smart Clean</h4>
            </div>
            <Eraser size={32} />
         </button>
      </section>

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 flex gap-10 overflow-hidden">
        
        {/* --- LEFT PANEL: CATEGORIES --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 pb-40">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <MotionDiv key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                 {categories.map(cat => (
                   <div 
                    key={cat.id} 
                    onClick={() => toggleSelect(cat.id)}
                    className={`p-6 rounded-[2.5rem] border transition-all flex items-center gap-8 cursor-pointer group ${selectedIds.has(cat.id) ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)] shadow-xl' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}
                   >
                      <div className={`p-5 rounded-3xl ${cat.health === 'bloated' ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-zinc-800 text-zinc-600'}`}>
                         {cat.id === 'lyrics' ? <Mic2 size={24}/> : cat.id === 'covers' ? <FileImage size={24}/> : cat.id === 'waveforms' ? <Waves size={24}/> : <Binary size={24}/>}
                      </div>
                      
                      <div className="flex-1">
                         <div className="flex items-center gap-3">
                            <h5 className="text-lg font-black text-white">{cat.name}</h5>
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${cat.health === 'optimal' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{cat.health}</span>
                         </div>
                         <p className="text-[10px] text-zinc-500 mt-1">{cat.description}</p>
                      </div>

                      <div className="text-right">
                         <h6 className="text-xl font-black text-white">{formatSize(cat.size)}</h6>
                         <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{cat.itemCount.toLocaleString()} items</p>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-all ml-4">
                         <button onClick={(e) => { e.stopPropagation(); handleClean([cat.id]); }} className="p-3 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                      </div>
                   </div>
                 ))}
              </MotionDiv>
            )}

            {activeTab === 'optimize' && (
              <MotionDiv key="optimize" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {[
                   { label: 'Defragment Database', desc: 'Rebuild internal indices for 2x faster searching.', icon: Binary, action: 'Run Vacuum' },
                   { label: 'Compress Covers', desc: 'Convert PNG art to high-efficiency WebP.', icon: FileImage, action: 'Recalculate' },
                   { label: 'Waveform Rebuild', desc: 'Analyze library and fill missing seekbar maps.', icon: Waves, action: 'Analyze All' },
                   { label: 'AI Cache Scrub', desc: 'Remove outdated inference models & logs.', icon: Sparkles, action: 'Neural Sweep' }
                 ].map(opt => (
                   <div key={opt.label} className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] space-y-6 group hover:bg-white/[0.04] transition-all">
                      <div className="flex items-start justify-between">
                         <div className="p-5 bg-zinc-900 rounded-3xl text-zinc-400 group-hover:text-white transition-colors">
                            <opt.icon size={32} />
                         </div>
                         <ArrowUpRight className="text-zinc-800 group-hover:text-white transition-all" size={24} />
                      </div>
                      <div>
                         <h4 className="text-2xl font-black text-white">{opt.label}</h4>
                         <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{opt.desc}</p>
                      </div>
                      <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">{opt.action}</button>
                   </div>
                 ))}
              </MotionDiv>
            )}

            {activeTab === 'settings' && (
              <MotionDiv key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 bg-white/[0.02] border border-white/5 rounded-[4rem] space-y-12">
                 <section className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xl font-black text-white flex items-center gap-3"><Clock size={20} className="text-blue-500" /> Retention Logic</h4>
                       <div className="flex gap-2">
                          {['Weekly', 'Monthly'].map(f => <button key={f} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${f === 'Weekly' ? 'bg-white text-black' : 'bg-black/40 text-zinc-500 border-white/5'}`}>{f}</button>)}
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                             <span>Hard Size Limit</span>
                             <span>10 GB</span>
                          </div>
                          <input type="range" min="1" max="50" defaultValue="10" className="w-full accent-blue-500" />
                       </div>
                       <div className="space-y-4">
                          <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                             <span>File Expiration</span>
                             <span>30 Days</span>
                          </div>
                          <input type="range" min="1" max="365" defaultValue="30" className="w-full accent-purple-500" />
                       </div>
                    </div>
                 </section>

                 <section className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className="p-4 bg-blue-600/10 text-blue-500 rounded-2xl"><Settings2 size={24}/></div>
                       <div>
                          <h5 className="font-black text-white">Auto-Purge Neural Guard</h5>
                          <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Automatic background cleanup</p>
                       </div>
                    </div>
                    <button className="w-14 h-7 rounded-full bg-[var(--accent-color)] relative">
                       <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-lg" />
                    </button>
                 </section>
              </MotionDiv>
            )}
          </AnimatePresence>
        </main>

        {/* --- RIGHT PANEL: AI ADVISOR --- */}
        <aside className="w-96 flex flex-col gap-8 shrink-0">
           <section className="p-8 bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-[3rem] space-y-6">
              <div className="flex items-center gap-3 text-purple-400">
                 <Sparkles size={20} className="animate-pulse" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Neural Cache Advisor</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                 I've detected <span className="text-white font-bold">1.2 GB</span> of cover art for tracks you haven't played in 60+ days. Compressing these could reduce disk usage by <span className="text-emerald-400 font-bold">45%</span> without visible quality loss.
              </p>
              <div className="space-y-3 pt-4">
                 <button className="w-full py-3 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all">Apply Recommendation</button>
                 <button className="w-full py-3 bg-white/5 text-zinc-500 rounded-xl text-[9px] font-black uppercase tracking-widest">Ignore for now</button>
              </div>
           </section>

           <section className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] flex-1 flex flex-col justify-center items-center text-center space-y-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle 
                      cx="64" cy="64" r="58" 
                      stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={364} 
                      strokeDashoffset={364 - (totalSize / 10000000000) * 364}
                      className="text-[var(--accent-color)]" 
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-white">{Math.round((totalSize / 10000000000) * 100)}%</span>
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">QUOTA</span>
                 </div>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold max-w-[200px] leading-relaxed uppercase">Disk Quota is set to 10GB. You are approaching the warning threshold.</p>
           </section>
        </aside>
      </div>

      {/* 4. CLEANING PROGRESS OVERLAY */}
      <AnimatePresence>
        {isCleaning && (
          <MotionDiv 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-12"
          >
             <div className="w-full max-w-xl space-y-12 text-center">
                <div className="relative mx-auto w-32 h-32">
                   <MotionDiv animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                      <RefreshCw size={128} className="text-[var(--accent-color)] opacity-20" />
                   </MotionDiv>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Wind size={48} className="text-white animate-bounce" />
                   </div>
                </div>
                <div className="space-y-4">
                   <h3 className="text-4xl font-black text-white tracking-tighter">Performing Neural Sweep...</h3>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <MotionDiv className="h-full bg-[var(--accent-color)]" animate={{ width: `${cleaningProgress}%` }} />
                   </div>
                   <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">
                      <span>PURGING ORPHANED FRAGMENTS</span>
                      <span>{cleaningProgress}% COMPLETE</span>
                   </div>
                </div>
             </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* 5. FOOTER */}
      <footer className="p-8 border-t border-white/5 flex items-center justify-between px-10 bg-black/20">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
              <Server size={14}/> IndexedDB: Synchronized
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
              <Gauge size={14} className="text-emerald-500"/> I/O Throughput: High
            </div>
         </div>
         <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <button 
                onClick={() => handleClean(Array.from(selectedIds))}
                className="px-6 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 animate-in slide-in-from-right-4"
              >
                 <Trash2 size={14}/> Purge Selected ({selectedIds.size})
              </button>
            )}
            <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-all flex items-center gap-2"><Maximize2 size={14}/> View Logs</button>
         </div>
      </footer>
    </div>
  );
};

export default CacheManagerView;
