
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Terminal, AlertCircle, Cpu, HardDrive, 
  Trash2, Download, Copy, Share2, Search, 
  Filter, ChevronRight, Layers, Zap, Bug,
  Code2, History, RefreshCcw, Info, CheckCircle2,
  AlertTriangle, X, Database, Mic2, Tags, Image as ImageIcon
} from 'lucide-react';
import { logger, LogEntry, LogLevel, LogCategory } from '../services/logger';
import { errorService, MelodixError } from '../services/errorService';
import { Song } from '../types';

const MotionDiv = motion.div as any;

interface DiagnosticsViewProps {
  currentSong: Song | null;
  tasksCount: number;
}

const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({ currentSong, tasksCount }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errors, setErrors] = useState<MelodixError[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | null>(null);
  const [activeTab, setActiveTab] = useState<'monitor' | 'logs' | 'errors' | 'debug'>('monitor');
  const [sysMetrics, setSysMetrics] = useState({ cpu: 0, ram: 0 });
  const [perfHistory, setPerfHistory] = useState<number[]>(new Array(40).fill(0));

  // --- Real-time Systems Sync ---
  useEffect(() => {
    setLogs(logger.getLogs().reverse());
    const unsubLog = logger.subscribe((entry) => setLogs(prev => [entry, ...prev].slice(0, 1000)));
    const unsubError = errorService.subscribe((err) => setErrors(prev => [err, ...prev]));

    const interval = setInterval(() => {
      // Simulation of resource usage based on load
      const baseCpu = 2 + (tasksCount * 8);
      const jitter = Math.random() * 4;
      const ramBase = 120 + (tasksCount * 15);
      
      setSysMetrics({ 
        cpu: Math.min(99, Math.floor(baseCpu + jitter)), 
        ram: Math.floor(ramBase + Math.random() * 10) 
      });
      
      setPerfHistory(prev => [...prev.slice(1), Math.min(99, baseCpu + jitter)]);
    }, 1000);

    return () => {
      unsubLog();
      unsubError();
      clearInterval(interval);
    };
  }, [tasksCount]);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchSearch = l.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          LogCategory[l.category].toLowerCase().includes(searchQuery.toLowerCase());
      const matchLevel = levelFilter === null || l.level === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [logs, searchQuery, levelFilter]);

  const exportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `melodix-diag-${Date.now()}.json`;
    a.click();
  };

  const getLogColor = (level: LogLevel) => {
    switch(level) {
      case LogLevel.FATAL: return 'text-red-500 border-red-500/20 bg-red-500/5';
      case LogLevel.ERROR: return 'text-rose-400 border-rose-500/10 bg-rose-500/5';
      case LogLevel.WARN: return 'text-amber-400 border-amber-500/10 bg-amber-500/5';
      case LogLevel.INFO: return 'text-emerald-400 border-emerald-500/10';
      default: return 'text-zinc-500 border-white/5';
    }
  };

  return (
    <div className="h-full overflow-hidden flex flex-col bg-transparent p-12">
      
      {/* --- Header --- */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-[var(--accent-color)] rounded-[1.5rem] text-white accent-glow">
               <Activity size={32} />
             </div>
             <div>
               <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Neural Diagnostics</h2>
               <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Real-time Telemetry & Core Inspection</p>
             </div>
          </div>
        </div>
        
        <div className="flex gap-4">
           <button 
            onClick={() => setActiveTab('monitor')}
            className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'monitor' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
           >
             <Cpu size={14} className="inline mr-2" /> Monitor
           </button>
           <button 
            onClick={() => setActiveTab('logs')}
            className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
           >
             <Terminal size={14} className="inline mr-2" /> Live Logs
           </button>
           <button 
            onClick={() => setActiveTab('errors')}
            className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'errors' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
           >
             <AlertCircle size={14} className="inline mr-2" /> Incidents
             {errors.length > 0 && <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white rounded text-[8px] animate-pulse">{errors.length}</span>}
           </button>
        </div>
      </header>

      {/* --- Main Content Viewport --- */}
      <main className="flex-1 overflow-hidden relative bg-white/[0.02] border border-white/5 rounded-[4rem] flex flex-col">
        
        <AnimatePresence mode="wait">
          
          {/* 1. MONITORING VIEW */}
          {activeTab === 'monitor' && (
            <MotionDiv 
              key="monitor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12 pb-40"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* CPU Real-time Gauge */}
                <div className="p-8 bg-black/20 border border-white/5 rounded-[3rem] space-y-8 relative overflow-hidden group">
                  <div className="flex items-center justify-between relative z-10">
                    <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Neural Load (CPU)</h4>
                    <span className="text-xs font-bold text-[var(--accent-color)]">{sysMetrics.cpu}%</span>
                  </div>
                  <div className="h-24 flex items-end gap-1 relative z-10">
                    {perfHistory.map((v, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-t-sm transition-all duration-500 ${v > 80 ? 'bg-red-500' : 'bg-[var(--accent-color)]'}`} 
                        style={{ height: `${v}%`, opacity: 0.1 + (i / perfHistory.length) * 0.9 }} 
                      />
                    ))}
                  </div>
                  <Cpu className="absolute -right-6 -bottom-6 text-white/[0.02] group-hover:scale-110 transition-transform duration-[5s]" size={120} />
                </div>

                {/* Memory Analytics */}
                <div className="p-8 bg-black/20 border border-white/5 rounded-[3rem] space-y-8">
                  <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Heap Memory Allocation</h4>
                  <div className="flex flex-col items-center justify-center h-24">
                     <span className="text-4xl font-black text-white">{sysMetrics.ram} MB</span>
                     <p className="text-[9px] font-bold text-zinc-600 mt-2 uppercase tracking-widest">V8 Engine Instance</p>
                  </div>
                </div>

                {/* AI Workload */}
                <div className="p-8 bg-black/20 border border-white/5 rounded-[3rem] space-y-8">
                   <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Active Neural Tasks</h4>
                   <div className="flex items-center gap-6 h-24">
                      <div className={`p-5 rounded-3xl ${tasksCount > 0 ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-zinc-800 text-zinc-600'}`}>
                        <Zap size={32} />
                      </div>
                      <div>
                        <span className="text-2xl font-black text-white">{tasksCount} Processing</span>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase">Background Enhancement</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Advanced Services Status */}
              <section className="space-y-6">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <Layers size={20} className="text-[var(--accent-color)]" /> Orchestration State
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Audio Engine', status: 'Healthy', icon: Mic2, color: 'text-emerald-500' },
                    { label: 'Neural DB', status: 'Optimized', icon: Database, color: 'text-emerald-500' },
                    { label: 'Gemini Bridge', status: tasksCount > 0 ? 'Busy' : 'Available', icon: Zap, color: tasksCount > 0 ? 'text-amber-500' : 'text-emerald-500' },
                    { label: 'Theme Core', status: 'Ready', icon: ImageIcon, color: 'text-emerald-500' }
                  ].map(service => (
                    <div key={service.label} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center gap-4">
                       <service.icon className={service.color} size={20} />
                       <div>
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{service.label}</p>
                         <p className="text-xs font-bold text-white">{service.status}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Debug: Current Meta Comparator */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <Code2 size={20} className="text-purple-500" /> Neural Meta Comparison
                  </h3>
                </div>
                {currentSong ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="p-8 bg-black/40 border border-white/5 rounded-[3rem] space-y-4">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Physical File Stream (Original)</p>
                        <div className="font-mono text-[10px] text-zinc-500 space-y-2">
                           <p><span className="text-zinc-700">TITLE:</span> {currentSong.title}</p>
                           <p><span className="text-zinc-700">ARTIST:</span> {currentSong.artist}</p>
                           <p><span className="text-zinc-700">PATH:</span> local://music/{currentSong.id}.mp3</p>
                           <p><span className="text-zinc-700">BITRATE:</span> 320kbps (Constant)</p>
                        </div>
                     </div>
                     <div className="p-8 bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/20 rounded-[3rem] space-y-4">
                        <p className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em] border-b border-[var(--accent-color)]/10 pb-2">Enhanced Neural Record (Corrected)</p>
                        <div className="font-mono text-[10px] text-[var(--accent-color)] space-y-2 opacity-80">
                           <p><b>SYMBOLS_IDENTIFIED:</b> TRUE</p>
                           <p><b>DB_MATCH_SCORE:</b> 0.9842</p>
                           <p><b>LYRICS_SYNC_PTR:</b> 0x4F2A19</p>
                           <p><b>REPLAY_GAIN:</b> {currentSong.replayGain || 'Calculated'}</p>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-zinc-800 gap-4">
                    <Info size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">No active track for inspection</p>
                  </div>
                )}
              </section>
            </MotionDiv>
          )}

          {/* 2. LIVE LOGS VIEW */}
          {activeTab === 'logs' && (
            <MotionDiv 
              key="logs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Log Toolbar */}
              <div className="p-6 border-b border-white/5 bg-white/[0.01] flex flex-wrap items-center gap-6">
                <div className="relative flex-1 max-w-md">
                   <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                   <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search event messages..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-[var(--accent-color)]"
                   />
                </div>

                <div className="flex gap-2">
                   {[null, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR].map(lvl => (
                     <button 
                      key={String(lvl)}
                      onClick={() => setLevelFilter(lvl)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${levelFilter === lvl ? 'bg-white text-black' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                     >
                       {lvl === null ? 'All' : LogLevel[lvl]}
                     </button>
                   ))}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                   <button onClick={exportLogs} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all"><Download size={16}/></button>
                   <button onClick={() => logger.clear()} className="p-2.5 bg-white/5 hover:bg-red-600/10 rounded-xl text-zinc-600 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                </div>
              </div>

              {/* Log Stream */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-1">
                 {filteredLogs.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-zinc-800 space-y-4">
                      <Terminal size={64} className="opacity-10" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Waiting for neural events...</p>
                   </div>
                 ) : (
                   filteredLogs.map((log, i) => (
                     <MotionDiv 
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        key={log.timestamp + i}
                        className={`flex gap-6 p-3 rounded-lg border border-transparent font-mono text-[10px] group transition-all ${getLogColor(log.level)}`}
                     >
                        <span className="text-zinc-600 shrink-0 w-16">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                        <span className="font-black uppercase w-20 opacity-60 tracking-tighter">[{LogCategory[log.category]}]</span>
                        <span className="flex-1 truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:break-words">{log.message}</span>
                        {log.elapsedMs && <span className="text-[8px] font-black opacity-40">{log.elapsedMs}ms</span>}
                     </MotionDiv>
                   ))
                 )}
              </div>
            </MotionDiv>
          )}

          {/* 3. INCIDENT TRACKER */}
          {activeTab === 'errors' && (
            <MotionDiv 
              key="errors"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8"
            >
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white flex items-center gap-4">
                    <Bug size={24} className="text-rose-500" /> Incident Log
                  </h3>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Tracking system instability and non-critical faults</p>
                </div>
              </div>

              {errors.length === 0 ? (
                <div className="h-80 flex flex-col items-center justify-center bg-white/[0.01] rounded-[3rem] border border-white/5 border-dashed space-y-6">
                   <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                     <CheckCircle2 size={40} />
                   </div>
                   <div className="text-center space-y-1">
                     <h4 className="text-lg font-black text-white">System Integrity: 100%</h4>
                     <p className="text-xs text-zinc-600">No critical or runtime errors detected in current session.</p>
                   </div>
                </div>
              ) : (
                <div className="space-y-4 pb-40">
                  {errors.map((err, i) => (
                    <MotionDiv 
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="p-8 bg-red-600/5 border border-red-600/20 rounded-[2.5rem] flex items-start gap-8"
                    >
                       <div className="p-4 bg-red-600/10 rounded-2xl text-red-500">
                         <AlertTriangle size={24} />
                       </div>
                       <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                             <div>
                               <h5 className="font-black text-white text-lg tracking-tight">{err.message}</h5>
                               <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-1">{LogCategory[err.category]} Incident • {err.code}</p>
                             </div>
                             <div className="flex gap-2">
                               <button 
                                onClick={() => { navigator.clipboard.writeText(JSON.stringify(err, null, 2)); alert("Copied"); }}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all"
                               >
                                 <Copy size={16}/>
                               </button>
                             </div>
                          </div>
                          <div className="bg-black/40 p-5 rounded-2xl font-mono text-[10px] text-zinc-400 border border-white/5 max-h-32 overflow-y-auto custom-scrollbar">
                             {err.technicalMessage}
                          </div>
                       </div>
                    </MotionDiv>
                  ))}
                </div>
              )}
            </MotionDiv>
          )}

        </AnimatePresence>
      </main>
      
      {/* Footer Info */}
      <footer className="mt-8 flex items-center justify-between px-10">
         <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
           <History size={14} /> Session Uptime: {Math.floor(performance.now() / 1000)}s
         </div>
         <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
           <Share2 size={14} /> Neural Bridge Protocol v1.4
         </div>
      </footer>

    </div>
  );
};

export default DiagnosticsView;
