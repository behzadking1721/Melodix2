
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Database, Cloud, History, 
  Download, Upload, RefreshCw, Trash2, 
  CheckCircle2, AlertCircle, Calendar, 
  Shield, Lock, HardDrive, Share2, Info,
  Save, Trash, FileJson, Clock, Server,
  ChevronRight, ArrowRight, Smartphone,
  Sparkles, Wand2, Search, Filter,
  Check, X, Activity, Eye, FileCode,
  Globe, CloudRain, CloudOff, ShieldAlert,
  /* Added missing Plus, Zap, Settings2 icons to imports */
  Plus, Zap, Settings2
} from 'lucide-react';
import { BackupSnapshot, CloudProvider, BackupScheduler, AppSettings } from '../types';

const MotionDiv = motion.div as any;

const MOCK_BACKUPS: BackupSnapshot[] = [
  {
    id: 'snap-001',
    label: 'Post-Migration Stable',
    timestamp: Date.now() - 86400000 * 2,
    type: 'hybrid',
    size: 45200000,
    version: '6.0.42',
    checksum: 'sha256-8a2f...91c0',
    integrityScore: 99,
    contents: { library: true, metadata: true, settings: true, extensions: true },
    provider: 'gdrive'
  },
  {
    id: 'snap-002',
    label: 'Pre-AI Enhancement',
    timestamp: Date.now() - 86400000 * 5,
    type: 'local',
    size: 12400000,
    version: '6.0.40',
    checksum: 'sha256-4b11...e2f4',
    integrityScore: 100,
    contents: { library: true, metadata: false, settings: true, extensions: false }
  }
];

const BackupRestoreView: React.FC = () => {
  const [backups, setBackups] = useState<BackupSnapshot[]>(MOCK_BACKUPS);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [activeTab, setActiveTab] = useState<'vault' | 'scheduler' | 'cloud'>('vault');
  const [selectedSnapshot, setSelectedSnapshot] = useState<BackupSnapshot | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  
  const [scheduler, setScheduler] = useState<BackupScheduler>({
    enabled: true,
    frequency: 'daily',
    time: '03:00',
    retentionLimit: 10,
    autoDeleteOld: true
  });

  const [contentToggles, setContentToggles] = useState({
    library: true,
    metadata: true,
    settings: true,
    extensions: false
  });

  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([
    { id: 'onedrive', name: 'OneDrive', connected: false },
    { id: 'gdrive', name: 'Google Drive', connected: true, accountName: 'melodix.hq@gmail.com', lastSync: Date.now() - 3600000, storageUsed: 45000000, storageTotal: 15000000000 },
    { id: 'dropbox', name: 'Dropbox', connected: false }
  ]);

  const handleCreateSnapshot = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      const newSnap: BackupSnapshot = {
        id: `snap-${Math.random().toString(36).substr(2, 5)}`,
        label: 'Manual Snapshot',
        timestamp: Date.now(),
        type: 'local',
        size: 15600000,
        version: '6.0.42',
        checksum: 'sha256-new-hash',
        integrityScore: 100,
        contents: contentToggles
      };
      setBackups([newSnap, ...backups]);
      setIsBackingUp(false);
    }, 2000);
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const StatusBadge = ({ score }: { score: number }) => (
    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 ${score > 95 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
      <CheckCircle2 size={10} /> {score}% Healthy
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-transparent font-sans overflow-hidden p-12">
      
      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-[var(--accent-color)] rounded-[1.5rem] text-white shadow-xl shadow-blue-500/20">
               <ShieldCheck size={32} />
             </div>
             <div>
               <h2 className="text-5xl font-black text-white tracking-tighter leading-none">SafeBox Vault</h2>
               <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Neural Data Preservation & Recovery</p>
             </div>
          </div>
        </div>

        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
           {['vault', 'scheduler', 'cloud'].map(tab => (
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

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex gap-10 overflow-hidden">
        
        {/* --- LEFT PANEL: CONFIGURATION --- */}
        <aside className="w-96 flex flex-col gap-8 shrink-0 overflow-y-auto custom-scrollbar pr-2">
           
           {/* Snapshot Creator */}
           <section className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8">
              <h4 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-2">
                 <Plus size={14} /> New Snapshot
              </h4>
              <div className="space-y-4">
                 {Object.entries(contentToggles).map(([key, val]) => (
                   <div key={key} onClick={() => setContentToggles({...contentToggles, [key]: !val})} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${val ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5 opacity-40'}`}>
                      <div className="flex items-center gap-3">
                         {key === 'library' ? <Database size={16}/> : key === 'metadata' ? <Zap size={16}/> : key === 'settings' ? <Settings2 size={16}/> : <FileCode size={16}/>}
                         <span className="text-xs font-bold text-white capitalize">{key}</span>
                      </div>
                      {val && <Check size={14} className="text-[var(--accent-color)]" />}
                   </div>
                 ))}
              </div>
              <button 
                onClick={handleCreateSnapshot}
                disabled={isBackingUp}
                className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50"
              >
                {isBackingUp ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                Create Snapshot
              </button>
           </section>

           {/* AI Advisor Card */}
           <section className="p-8 bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-[3rem] space-y-6">
              <div className="flex items-center gap-3 text-purple-400">
                 <Sparkles size={20} className="animate-pulse" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Neural Advisor</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                 I've analyzed your local vault. <span className="text-white font-bold">Snapshot #1</span> is currently your best restoration point; it contains 100% of your AI-synced lyrics which are missing from your current state.
              </p>
              <button className="w-full py-3 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all">Recommended Restore</button>
           </section>
        </aside>

        {/* --- RIGHT PANEL: CONTENT --- */}
        <main className="flex-1 bg-white/[0.01] border border-white/5 rounded-[4rem] overflow-hidden flex flex-col">
           
           <AnimatePresence mode="wait">
              {activeTab === 'vault' && (
                <MotionDiv key="vault" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col h-full">
                   <div className="p-8 border-b border-white/5 bg-black/20 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <History size={20} className="text-zinc-600" />
                         <h4 className="text-sm font-black text-white uppercase tracking-widest">Snapshot Registry</h4>
                      </div>
                      <div className="flex gap-2">
                         <button className="p-2.5 bg-white/5 rounded-xl text-zinc-500 hover:text-white"><Filter size={16}/></button>
                         <button className="p-2.5 bg-white/5 rounded-xl text-zinc-500 hover:text-white"><Search size={16}/></button>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-4 pb-40">
                      {backups.map(snap => (
                        <div 
                          key={snap.id} 
                          onClick={() => setSelectedSnapshot(snap)}
                          className={`flex items-center gap-8 p-6 rounded-[2.5rem] border transition-all cursor-pointer group ${selectedSnapshot?.id === snap.id ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)] shadow-xl' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}
                        >
                           <div className={`p-5 rounded-3xl ${snap.type === 'hybrid' ? 'bg-purple-600/10 text-purple-400' : 'bg-zinc-800 text-zinc-600'}`}>
                             {snap.type === 'hybrid' ? <Globe size={24}/> : <HardDrive size={24}/>}
                           </div>
                           
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                 <h5 className="font-bold text-white text-lg tracking-tight truncate">{snap.label}</h5>
                                 <StatusBadge score={snap.integrityScore} />
                              </div>
                              <div className="flex items-center gap-6 mt-1 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                 <span>{new Date(snap.timestamp).toLocaleString()}</span>
                                 <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                 <span>{formatSize(snap.size)}</span>
                                 <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                 <span>v{snap.version}</span>
                              </div>
                           </div>

                           <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <button onClick={(e) => { e.stopPropagation(); setShowCompare(true); }} className="p-3.5 bg-white/5 rounded-2xl text-zinc-400 hover:text-white transition-all"><RefreshCw size={18}/></button>
                              <button className="p-3.5 bg-white/5 rounded-2xl text-zinc-400 hover:text-white transition-all"><ArrowRight size={18}/></button>
                              <button className="p-3.5 bg-red-600/10 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                           </div>
                        </div>
                      ))}
                   </div>
                </MotionDiv>
              )}

              {activeTab === 'scheduler' && (
                <MotionDiv key="scheduler" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-12 space-y-12 h-full overflow-y-auto">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <section className="space-y-8">
                         <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                               <Clock size={24} className="text-blue-500" /> Auto-Backup Pulse
                            </h3>
                            <button 
                              onClick={() => setScheduler({...scheduler, enabled: !scheduler.enabled})}
                              className={`w-14 h-7 rounded-full transition-all relative ${scheduler.enabled ? 'bg-[var(--accent-color)]' : 'bg-zinc-800'}`}
                            >
                               <MotionDiv animate={{ x: scheduler.enabled ? 32 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg" />
                            </button>
                         </div>
                         
                         <div className="space-y-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Backup Frequency</label>
                               <div className="grid grid-cols-3 gap-3">
                                  {['daily', 'weekly', 'monthly'].map(f => (
                                    <button key={f} onClick={() => setScheduler({...scheduler, frequency: f as any})} className={`py-4 rounded-2xl text-xs font-bold transition-all border ${scheduler.frequency === f ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-zinc-400 border-white/5'}`}>{f}</button>
                                  ))}
                               </div>
                            </div>
                            
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Preferred Execution Time</label>
                               <input type="time" value={scheduler.time} onChange={e => setScheduler({...scheduler, time: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-xl font-black text-white focus:border-[var(--accent-color)] outline-none" />
                            </div>
                         </div>
                      </section>

                      <section className="space-y-8">
                         <h3 className="text-2xl font-black text-white flex items-center gap-3">
                            <Trash2 size={24} className="text-red-500" /> Retention Engine
                         </h3>
                         <div className="space-y-6 p-8 bg-white/[0.02] border border-white/5 rounded-[3rem]">
                            <div className="space-y-4">
                               <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                  <span>History Depth</span>
                                  <span>{scheduler.retentionLimit} Snapshots</span>
                               </div>
                               <input type="range" min="1" max="50" value={scheduler.retentionLimit} onChange={e => setScheduler({...scheduler, retentionLimit: parseInt(e.target.value)})} className="w-full accent-[var(--accent-color)]" />
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                               <span className="text-xs font-bold text-zinc-400">Prune Legacy Backups</span>
                               <button onClick={() => setScheduler({...scheduler, autoDeleteOld: !scheduler.autoDeleteOld})} className={`w-10 h-5 rounded-full relative transition-all ${scheduler.autoDeleteOld ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                                  <MotionDiv animate={{ x: scheduler.autoDeleteOld ? 22 : 2 }} className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-lg" />
                                </button>
                            </div>
                         </div>
                      </section>
                   </div>
                </MotionDiv>
              )}

              {activeTab === 'cloud' && (
                <MotionDiv key="cloud" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-12 space-y-12">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {cloudProviders.map(p => (
                        <div key={p.id} className={`p-8 rounded-[3.5rem] border transition-all flex flex-col justify-between h-80 relative overflow-hidden group ${p.connected ? 'bg-purple-600/10 border-purple-500/20 ring-1 ring-purple-500/10' : 'bg-white/[0.02] border-white/5 opacity-50'}`}>
                           <div className="flex items-start justify-between">
                              <div className={`p-5 rounded-3xl ${p.connected ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-600'}`}>
                                 <Server size={28} />
                              </div>
                              {p.connected && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />}
                           </div>
                           
                           <div>
                              <h4 className="text-2xl font-black text-white tracking-tight">{p.name}</h4>
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">{p.connected ? p.accountName : 'Not Connected'}</p>
                           </div>

                           {p.connected ? (
                             <div className="space-y-4">
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-purple-500" style={{ width: `${(p.storageUsed! / p.storageTotal!) * 100}%` }} />
                                </div>
                                <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-tighter">
                                   <span>{formatSize(p.storageUsed!)} Used</span>
                                   <span>Last Sync: 1h ago</span>
                                </div>
                                <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Disconnect</button>
                             </div>
                           ) : (
                             <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Authorize Access</button>
                           )}
                           
                           <Cloud className="absolute -right-8 -bottom-8 text-white/[0.02] group-hover:scale-110 transition-transform duration-[5s]" size={150} />
                        </div>
                      ))}
                   </div>
                </MotionDiv>
              )}
           </AnimatePresence>
        </main>
      </div>

      {/* 3. DIFF/RESTORE MODAL OVERLAY */}
      <AnimatePresence>
         {showCompare && selectedSnapshot && (
           <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-black/60 backdrop-blur-md">
              <MotionDiv 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="w-full max-w-4xl bg-[#0c0c0c] border border-white/10 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh]"
              >
                 <header className="p-10 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className="p-4 bg-blue-600 rounded-[1.5rem] text-white shadow-2xl">
                          <RefreshCw size={24} />
                       </div>
                       <div className="space-y-1">
                          <h3 className="text-3xl font-black text-white tracking-tighter">Compare Snapshot</h3>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Delta Audit: Snapshot vs Live State</p>
                       </div>
                    </div>
                    <button onClick={() => setShowCompare(false)} className="text-zinc-600 hover:text-white transition-all"><X size={24}/></button>
                 </header>

                 <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
                    <div className="grid grid-cols-2 gap-10">
                       {[
                         { label: 'Library Tracks', live: '12,452', snapshot: '12,456', delta: '+4', color: 'text-emerald-500' },
                         { label: 'Metadata Links', live: '8,210', snapshot: '11,402', delta: '+3,192', color: 'text-emerald-500' },
                         { label: 'EQ Profiles', live: '14', snapshot: '14', delta: '0', color: 'text-zinc-600' },
                         { label: 'Active Extensions', live: '6', snapshot: '4', delta: '-2', color: 'text-rose-500' }
                       ].map(row => (
                         <div key={row.label} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                            <h5 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{row.label}</h5>
                            <div className="flex items-center justify-between">
                               <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-zinc-500 block uppercase">Live State</span>
                                  <span className="text-xl font-black text-zinc-400">{row.live}</span>
                               </div>
                               <ArrowRight size={20} className="text-zinc-800" />
                               <div className="space-y-1 text-right">
                                  <span className="text-[9px] font-bold text-zinc-500 block uppercase">Snapshot</span>
                                  <span className="text-xl font-black text-white">{row.snapshot}</span>
                               </div>
                            </div>
                            <div className={`text-center text-[11px] font-black uppercase tracking-tighter ${row.color}`}>{row.delta} Impact</div>
                         </div>
                       ))}
                    </div>

                    <div className="p-8 bg-amber-600/5 border border-amber-600/20 rounded-[2.5rem] flex items-start gap-6">
                       <ShieldAlert size={28} className="text-amber-500 shrink-0 mt-1" />
                       <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                          Restoring this snapshot will overwrite your current extension configurations. Tracks themselves will not be deleted, but your smart playlist logic will be rolled back to v6.0.40.
                       </p>
                    </div>
                 </div>

                 <footer className="p-8 bg-white/[0.01] border-t border-white/5 flex gap-4">
                    <button onClick={() => setShowCompare(false)} className="flex-1 py-5 bg-white/5 text-zinc-500 hover:text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all">Abort Recovery</button>
                    <button className="flex-[2] py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">Confirm Partial Restore (Metadata Only)</button>
                    <button className="flex-[2] py-5 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">Full Atomic Restore</button>
                 </footer>
              </MotionDiv>
           </div>
         )}
      </AnimatePresence>

      {/* 4. GLOBAL FOOTER STATS */}
      <footer className="p-8 border-t border-white/5 flex items-center justify-between px-10 bg-black/20">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
              <Database size={14}/> Vault Integrity: Verified
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
              <Activity size={14}/> Cloud Latency: 42ms
            </div>
         </div>
         <div className="flex gap-4">
            <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-all flex items-center gap-2"><Lock size={14}/> Encrypt Vault</button>
            <button className="px-6 py-2 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"><Save size={14}/> Export Registry</button>
         </div>
      </footer>
    </div>
  );
};

export default BackupRestoreView;
