
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, Smartphone, Laptop, Tablet, 
  RefreshCcw, Link2, Unlink, QrCode, 
  ShieldCheck, AlertCircle, History,
  Plus, ChevronRight, CheckCircle2,
  Settings2, Database, Zap, Lock,
  Globe, Server, HardDrive, Smartphone as PhoneIcon,
  Monitor, Cpu, Share2, MoreVertical, Edit3
} from 'lucide-react';
import { syncService } from '../services/syncService';
import { AppSettings, CloudDevice, SyncEvent, SyncConflict } from '../types';

const MotionDiv = motion.div as any;

interface MultiDeviceSyncViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const MultiDeviceSyncView: React.FC<MultiDeviceSyncViewProps> = ({ settings, onUpdate }) => {
  const [devices, setDevices] = useState<CloudDevice[]>([]);
  const [history, setHistory] = useState<SyncEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'devices' | 'activity' | 'settings'>('devices');
  const [showPairing, setShowPairing] = useState(false);

  useEffect(() => {
    const unsub = syncService.subscribe(() => {
      setDevices(syncService.getDevices());
      setHistory(syncService.getHistory());
      setIsSyncing(syncService.getIsSyncing());
    });
    setDevices(syncService.getDevices());
    setHistory(syncService.getHistory());
    setIsSyncing(syncService.getIsSyncing());
    return unsub;
  }, []);

  const updateSyncSetting = (field: string, value: any) => {
    const newSync = { ...settings.sync, [field]: value };
    onUpdate({ ...settings, sync: newSync });
  };

  const toggleSyncType = (type: keyof typeof settings.sync.syncTypes) => {
    const newTypes = { ...settings.sync.syncTypes, [type]: !settings.sync.syncTypes[type] };
    onUpdate({ ...settings, sync: { ...settings.sync, syncTypes: newTypes } });
  };

  const DeviceIcon = ({ type }: { type: CloudDevice['type'] }) => {
    switch (type) {
      case 'desktop': return <Monitor size={24} />;
      case 'mobile': return <PhoneIcon size={24} />;
      case 'tablet': return <Tablet size={24} />;
      default: return <Smartphone size={24} />;
    }
  };

  return (
    <div className="h-full overflow-hidden flex flex-col bg-transparent p-12">
      
      {/* --- Header --- */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-purple-600 rounded-[1.5rem] text-white accent-glow">
               <Cloud size={32} />
             </div>
             <div>
               <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Cloud Sync</h2>
               <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Cross-Device Neural Continuity</p>
             </div>
          </div>
        </div>
        
        <div className="flex gap-4">
           <button onClick={() => setActiveTab('devices')} className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'devices' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>Devices</button>
           <button onClick={() => setActiveTab('activity')} className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'activity' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>Activity</button>
           <button onClick={() => setActiveTab('settings')} className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>Config</button>
           <div className="w-px h-10 bg-white/5 mx-2" />
           <button 
             onClick={() => syncService.triggerSync()}
             disabled={isSyncing}
             className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all ${isSyncing ? 'bg-purple-600/20 text-purple-400' : 'bg-white text-black hover:scale-105 active:scale-95 shadow-2xl'}`}
           >
             <RefreshCcw size={14} className={isSyncing ? 'animate-spin' : ''} />
             {isSyncing ? 'Syncing...' : 'Sync Now'}
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          
          {/* --- DEVICES VIEW --- */}
          {activeTab === 'devices' && (
            <MotionDiv key="devices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col gap-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {devices.map(device => (
                   <div key={device.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] hover:bg-white/[0.04] transition-all group relative">
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 text-zinc-600 hover:text-white"><MoreVertical size={16}/></button>
                      </div>
                      
                      <div className="flex items-start gap-6 mb-8">
                         <div className={`p-5 rounded-3xl ${device.status === 'online' ? 'bg-purple-600/10 text-purple-500' : 'bg-zinc-800 text-zinc-600'}`}>
                           <DeviceIcon type={device.type} />
                         </div>
                         <div className="space-y-1">
                           <h4 className="text-xl font-black text-white">{device.name}</h4>
                           <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
                             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{device.os} • {device.status}</span>
                           </div>
                         </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                         <div className="flex justify-between items-center text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                           <span>Last Handshake</span>
                           <span className="text-zinc-400">{new Date(device.lastSync).toLocaleTimeString()}</span>
                         </div>
                         <div className="flex gap-2">
                            <button className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black text-zinc-400 uppercase tracking-widest transition-all">Ping</button>
                            <button onClick={() => syncService.unlinkDevice(device.id)} className="px-4 py-2.5 bg-red-600/5 hover:bg-red-600/10 rounded-xl text-[9px] font-black text-red-500 uppercase tracking-widest transition-all">Unlink</button>
                         </div>
                      </div>
                   </div>
                 ))}

                 {/* Link New Device Card */}
                 <button 
                  onClick={() => setShowPairing(true)}
                  className="p-8 border-2 border-dashed border-white/5 hover:border-purple-600/40 rounded-[3rem] transition-all flex flex-col items-center justify-center text-center space-y-4 group"
                 >
                    <div className="p-6 bg-white/5 rounded-full text-zinc-700 group-hover:text-purple-500 group-hover:bg-purple-600/10 transition-all">
                       <Plus size={40} />
                    </div>
                    <div>
                      <h5 className="font-black text-white text-sm">Link New Device</h5>
                      <p className="text-[10px] text-zinc-600 tracking-tight">Sync Melodix across all your hardware.</p>
                    </div>
                 </button>
               </div>
               
               {/* Pair Device Modal Simulation */}
               <AnimatePresence>
                 {showPairing && (
                   <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[500] flex items-center justify-center p-8 bg-black/60 backdrop-blur-md">
                      <div className="w-full max-w-xl bg-[#0c0c0c] border border-white/10 rounded-[4rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative">
                         <button onClick={() => setShowPairing(false)} className="absolute top-10 right-10 text-zinc-500 hover:text-white"><Unlink size={24}/></button>
                         
                         <div className="flex flex-col items-center text-center space-y-8">
                            <div className="p-8 bg-white/5 rounded-[3rem]">
                               <QrCode size={160} className="text-white" />
                            </div>
                            <div className="space-y-2">
                               <h3 className="text-3xl font-black text-white tracking-tighter">Connect with Mobile</h3>
                               <p className="text-sm text-zinc-500 max-w-xs">Scan this code with the Melodix Mobile app to authorize this desktop instance.</p>
                            </div>
                            <div className="w-full flex items-center gap-4">
                               <div className="flex-1 h-px bg-white/5" />
                               <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">or use code</span>
                               <div className="flex-1 h-px bg-white/5" />
                            </div>
                            <div className="flex gap-3">
                               {['A','7','X','9','2','K'].map((char, i) => (
                                 <div key={i} className="w-12 h-14 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center text-2xl font-black text-purple-500">{char}</div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </MotionDiv>
                 )}
               </AnimatePresence>
            </MotionDiv>
          )}

          {/* --- ACTIVITY LOG VIEW --- */}
          {activeTab === 'activity' && (
            <MotionDiv key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full bg-black/40 border border-white/5 rounded-[3.5rem] overflow-hidden flex flex-col">
               <div className="p-6 border-b border-white/5 flex items-center justify-between px-10">
                  <div className="flex items-center gap-3">
                    <History className="text-purple-500" size={18} />
                    <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Global Sync Events</h4>
                  </div>
                  <div className="flex gap-4 text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                    <span>Uploaded: 142 MB</span>
                    <span>Downloaded: 12 MB</span>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-2">
                  {history.map((event, i) => (
                    <div key={event.id} className="flex items-center gap-6 p-5 bg-white/[0.02] hover:bg-white/[0.04] rounded-[2rem] transition-all group">
                       <div className={`p-3 rounded-xl ${event.type === 'upload' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                         {event.type === 'upload' ? <RefreshCcw size={16} /> : <Database size={16} />}
                       </div>
                       <div className="flex-1">
                         <div className="flex items-center gap-3">
                            <h5 className="text-sm font-bold text-white tracking-tight">{event.type === 'merge' ? 'Intelligent Merge' : `Neural ${event.type}`}</h5>
                            <span className="text-[10px] font-black text-zinc-600 uppercase">{event.dataType}</span>
                         </div>
                         <p className="text-[10px] text-zinc-500 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{event.itemCount} items</p>
                          <div className="flex items-center gap-1.5 justify-end text-[9px] font-black text-emerald-500 uppercase mt-1">
                             <CheckCircle2 size={10} /> {event.status}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </MotionDiv>
          )}

          {/* --- CONFIGURATION VIEW --- */}
          {activeTab === 'settings' && (
            <MotionDiv key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full overflow-y-auto custom-scrollbar pr-4 space-y-12 pb-40">
               <section className="space-y-8">
                  <h3 className="text-xl font-black text-white flex items-center gap-3 px-2">
                    <Settings2 size={20} className="text-zinc-500" /> Sync Policy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
                       <div className="flex items-center justify-between">
                         <div>
                            <h4 className="font-bold text-white text-sm">Background Sync</h4>
                            <p className="text-[10px] text-zinc-500 max-w-[200px]">Keep data updated automatically without manual intervention.</p>
                         </div>
                         <div onClick={() => updateSyncSetting('autoSync', !settings.sync.autoSync)} className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${settings.sync.autoSync ? 'bg-purple-600' : 'bg-zinc-800'}`}>
                            <MotionDiv animate={{ x: settings.sync.autoSync ? 24 : 4 }} className="absolute top-1 w-4 h-4 rounded-full bg-white" />
                         </div>
                       </div>
                       <div className="flex items-center justify-between pt-4 border-t border-white/5">
                         <div>
                            <h4 className="font-bold text-white text-sm">Sync on Exit</h4>
                            <p className="text-[10px] text-zinc-500 max-w-[200px]">Perform a final delta merge when the application closes.</p>
                         </div>
                         <div onClick={() => updateSyncSetting('syncOnExit', !settings.sync.syncOnExit)} className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${settings.sync.syncOnExit ? 'bg-purple-600' : 'bg-zinc-800'}`}>
                            <MotionDiv animate={{ x: settings.sync.syncOnExit ? 24 : 4 }} className="absolute top-1 w-4 h-4 rounded-full bg-white" />
                         </div>
                       </div>
                    </div>

                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Conflict Strategy</p>
                       <div className="grid grid-cols-1 gap-3">
                          {[
                            { id: 'smart-merge', label: 'Smart Merge', desc: 'AI-driven heuristic alignment' },
                            { id: 'keep-local', label: 'Keep Local', desc: 'Prioritize this machine' },
                            { id: 'keep-cloud', label: 'Cloud Priority', desc: 'Prioritize the master copy' }
                          ].map(strategy => (
                            <button 
                              key={strategy.id}
                              onClick={() => updateSyncSetting('conflictStrategy', strategy.id)}
                              className={`p-4 rounded-2xl border text-left transition-all ${settings.sync.conflictStrategy === strategy.id ? 'bg-purple-600/10 border-purple-500/40 ring-1 ring-purple-500/20' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                            >
                               <h5 className="text-[11px] font-black text-white uppercase">{strategy.label}</h5>
                               <p className="text-[9px] font-bold text-zinc-500">{strategy.desc}</p>
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
               </section>

               <section className="space-y-8">
                  <h3 className="text-xl font-black text-white flex items-center gap-3 px-2">
                    <Database size={20} className="text-zinc-500" /> Synced DNA
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { id: 'playlists', label: 'Playlists', icon: Database },
                      { id: 'settings', label: 'Settings', icon: Settings2 },
                      { id: 'metadata', label: 'Metadata', icon: Zap },
                      { id: 'history', label: 'History', icon: History },
                      { id: 'stats', label: 'Stats', icon: BarChart3 }
                    ].map(type => (
                      <button 
                        key={type.id}
                        onClick={() => toggleSyncType(type.id as any)}
                        className={`p-6 rounded-[2.5rem] border flex flex-col items-center gap-4 transition-all ${settings.sync.syncTypes[type.id as keyof typeof settings.sync.syncTypes] ? 'bg-white text-black shadow-xl' : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10'}`}
                      >
                         <type.icon size={20} />
                         <span className="text-[9px] font-black uppercase tracking-widest">{type.label}</span>
                      </button>
                    ))}
                  </div>
               </section>
            </MotionDiv>
          )}

        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="mt-8 flex items-center justify-between px-10">
         <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
           <Server size={14} className="text-purple-500" /> Provider: OneDrive Business
         </div>
         <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
           <ShieldCheck size={14} className="text-emerald-500" /> End-to-End Encryption Active (v3.1)
         </div>
      </footer>

    </div>
  );
};

const BarChart3 = (props: any) => <div {...props}><History /></div>;

export default MultiDeviceSyncView;
