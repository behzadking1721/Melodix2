
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, ShieldCheck, Cloud, History, 
  Download, Upload, RefreshCw, Trash2, 
  CheckCircle2, AlertTriangle, Calendar, 
  Shield, Lock, HardDrive, Share2, Info,
  Save, Trash, FileJson, Clock, Server,
  ChevronRight, ArrowRight, Smartphone
} from 'lucide-react';
import { backupService } from '../services/backupService';
import { BackupMetadata, CloudProvider } from '../types';

const MotionDiv = motion.div as any;

const BackupRestoreView: React.FC = () => {
  const [logs, setLogs] = useState<BackupMetadata[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>(['db', 'settings', 'playlists', 'stats']);
  
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([
    { id: 'onedrive', name: 'OneDrive', connected: false },
    { id: 'gdrive', name: 'Google Drive', connected: true, accountName: 'melodix.user@gmail.com', lastSync: Date.now() - 3600000 },
    { id: 'dropbox', name: 'Dropbox', connected: false }
  ]);

  useEffect(() => {
    setLogs(backupService.getBackupLogs());
  }, []);

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    setStatus("Bundling neural assets...");
    try {
      const json = await backupService.createBackup(selectedSections);
      
      // Auto-download file for user
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `melodix-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      setLogs(backupService.getBackupLogs());
      setStatus("Backup created successfully.");
    } catch (e) {
      setStatus("Backup failed.");
    } finally {
      setTimeout(() => {
        setIsBackingUp(false);
        setStatus(null);
      }, 2000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setIsRestoring(true);
      setStatus("Analyzing snapshot integrity...");
      
      const success = await backupService.restoreBackup(content, false);
      if (success) {
        setStatus("Restoration complete. Refreshing UI...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setStatus("Restoration failed.");
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  const toggleSection = (id: string) => {
    setSelectedSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-transparent p-12 pb-40">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* --- Header --- */}
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="p-4 bg-[var(--accent-color)] rounded-[1.5rem] text-white accent-glow">
                 <ShieldCheck size={32} />
               </div>
               <div>
                 <h2 className="text-5xl font-black text-white tracking-tighter leading-none">SafeBox</h2>
                 <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Neural Recovery & Cloud Sync</p>
               </div>
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center gap-6">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                   <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Library Status</p>
                   <p className="text-sm font-bold text-white">Fully Verified</p>
                </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* --- Local Backup Panel --- */}
          <div className="lg:col-span-2 space-y-8">
            <section className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white flex items-center gap-3">
                    <HardDrive size={22} className="text-blue-500" /> Snapshot Management
                  </h3>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Local state preservation</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'db', label: 'Neural DB', desc: 'Lyrics & Metadata', icon: Database },
                  { id: 'settings', label: 'Settings', desc: 'App Config', icon: Save },
                  { id: 'playlists', label: 'Playlists', desc: 'User Collections', icon: FileJson },
                  { id: 'stats', label: 'Analytics', desc: 'Listening Habits', icon: History }
                ].map(item => (
                  <button 
                    key={item.id}
                    onClick={() => toggleSection(item.id)}
                    className={`p-6 rounded-[2rem] border text-left transition-all ${selectedSections.includes(item.id) ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-600/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                  >
                    <item.icon size={20} className={selectedSections.includes(item.id) ? 'text-white' : 'text-zinc-600'} />
                    <h5 className={`font-black text-[11px] uppercase tracking-widest mt-4 ${selectedSections.includes(item.id) ? 'text-white' : 'text-zinc-400'}`}>{item.label}</h5>
                    <p className={`text-[9px] font-bold ${selectedSections.includes(item.id) ? 'text-blue-200' : 'text-zinc-600'}`}>{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleCreateBackup}
                  disabled={isBackingUp}
                  className="flex-1 py-5 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl"
                >
                  {isBackingUp ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                  Create Neural Snapshot
                </button>
                
                <label className="flex-1 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer transition-all">
                  <Upload size={18} /> Restore from File
                  <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
                </label>
              </div>

              {status && (
                <MotionDiv 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 rounded-2xl flex items-center justify-center gap-3"
                >
                  <Sparkles size={16} className="text-[var(--accent-color)] animate-pulse" />
                  <span className="text-xs font-bold text-[var(--accent-color)]">{status}</span>
                </MotionDiv>
              )}
            </section>

            {/* --- History --- */}
            <section className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] space-y-8">
              <h4 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-3 px-2">
                <Clock size={14} /> Recovery History
              </h4>
              
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-zinc-800 gap-4">
                    <History size={40} className="opacity-10" />
                    <p className="text-[9px] font-black uppercase tracking-widest">No previous backups found</p>
                  </div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] group hover:bg-white/[0.04] transition-all">
                      <div className="p-4 bg-zinc-900 rounded-2xl text-zinc-500">
                        <FileJson size={20} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-white text-sm">Full System Snapshot</h5>
                        <div className="flex items-center gap-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">
                          <span className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(log.timestamp).toLocaleDateString()}</span>
                          <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                          <span className="flex items-center gap-1.5"><HardDrive size={12}/> {formatSize(log.size)}</span>
                        </div>
                      </div>
                      <button className="p-3 text-zinc-700 hover:text-red-500 transition-colors">
                        <Trash size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* --- Cloud Sync Sidebar --- */}
          <div className="space-y-8">
            <section className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] space-y-8 h-full">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <Cloud size={22} className="text-purple-500" /> Cloud Sync
                </h3>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cross-device continuity</p>
              </div>

              <div className="space-y-4">
                {cloudProviders.map(provider => (
                  <div key={provider.id} className={`p-6 rounded-[2.5rem] border transition-all ${provider.connected ? 'bg-purple-600/10 border-purple-500/30 ring-1 ring-purple-500/20' : 'bg-white/[0.02] border-white/5 opacity-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-xl ${provider.connected ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-600'}`}>
                           <Server size={14} />
                         </div>
                         <h5 className="font-black text-xs text-white uppercase tracking-widest">{provider.name}</h5>
                      </div>
                      {provider.connected && <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                    </div>

                    {provider.connected ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-zinc-400 font-bold truncate">{provider.accountName}</p>
                          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Last synced: 1 hour ago</p>
                        </div>
                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all">
                          Force Sync Now
                        </button>
                      </div>
                    ) : (
                      <button className="w-full py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                        Connect Account
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] space-y-3">
                 <div className="flex items-center gap-3 text-amber-500">
                    <AlertTriangle size={18} />
                    <h5 className="font-black text-[10px] uppercase tracking-widest">Storage Warning</h5>
                 </div>
                 <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">Neural cache (covers) exceeding 500MB. Cloud sync for covers is currently throttled.</p>
              </div>
            </section>
          </div>

        </div>

        {/* --- Advanced Safety --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] flex items-center gap-8 group cursor-pointer hover:bg-white/[0.04] transition-all">
            <div className="p-6 bg-blue-500/10 rounded-[2.5rem] text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <Lock size={32} />
            </div>
            <div>
              <h4 className="text-xl font-black text-white">Neural Encryption</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">Secure your snapshots with AES-256 simulation. Requires a Master Key to restore data.</p>
            </div>
          </div>
          <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] flex items-center gap-8 group cursor-pointer hover:bg-white/[0.04] transition-all">
            <div className="p-6 bg-purple-500/10 rounded-[2.5rem] text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <RefreshCw size={32} />
            </div>
            <div>
              <h4 className="text-xl font-black text-white">Delta Rollback</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">Quickly revert the last 10 metadata changes if the AI engine makes a mistake.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

const Sparkles = (props: any) => <div {...props}><History /></div>;

export default BackupRestoreView;
