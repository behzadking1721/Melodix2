
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Terminal, AlertCircle, Cpu, HardDrive, 
  Trash2, Download, Copy, Share2, Search, 
  Filter, ChevronRight, Layers, Zap, Bug,
  Code2, History, RefreshCw, Info, CheckCircle2,
  AlertTriangle, X, Database, Mic2, Tags, 
  Waves, Gauge, Network, ShieldCheck, Box,
  Speaker, Binary, Activity as PulseIcon, BarChart3
} from 'lucide-react';
import { SystemMetrics, AudioEngineHealth, CrashReport, DiagnosticLog, Song } from '../types';

const MotionDiv = motion.div as any;

const MOCK_CRASHES: CrashReport[] = [
  {
    id: 'crash-99',
    timestamp: Date.now() - 3600000,
    module: 'AudioRenderer.cpp',
    exception: 'BUFFER_UNDERRUN',
    stackTrace: 'at Melodix.Audio.Engine.Render(0x004F2)\nat Melodix.Main.EventLoop(0x12A0)',
    aiAnalysis: "The system's CPU priority was too low during a heavy AI metadata scan, causing the audio buffer to empty before the next frame was ready.",
    suggestedFix: "Enable 'Exclusive Mode' or increase buffer size to 200ms."
  }
];

const MOCK_LOGS: DiagnosticLog[] = [
  { id: '1', timestamp: Date.now() - 5000, category: 'ai', level: 'info', message: 'Gemini Pro: Metadata match found for track "Aurora".' },
  { id: '2', timestamp: Date.now() - 15000, category: 'playback', level: 'warn', message: 'High Jitter detected in network stream buffer.' },
  { id: '3', timestamp: Date.now() - 25000, category: 'extension', level: 'error', message: 'Extension "DSP_Pro" failed to initialize: Invalid License.' }
];

interface DiagnosticsViewProps {
  currentSong: Song | null;
  tasksCount: number;
}

const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({ currentSong, tasksCount }) => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'audio' | 'logs' | 'crashes'>('monitor');
  const [metrics, setMetrics] = useState<SystemMetrics>({ cpu: 0, gpu: 0, ram: 0, disk: 0, network: 0, audioLatency: 12 });
  const [metricsHistory, setMetricsHistory] = useState<number[]>(new Array(50).fill(0));
  const [logs, setLogs] = useState<DiagnosticLog[]>(MOCK_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrash, setSelectedCrash] = useState<CrashReport | null>(null);

  // Simulated Telemetry Feed
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.floor(5 + Math.random() * 15),
        gpu: Math.floor(2 + Math.random() * 8),
        ram: 450 + Math.floor(Math.random() * 20),
        disk: Math.random() * 2,
        network: Math.random() * 5,
        audioLatency: 10 + Math.floor(Math.random() * 4)
      }));
      setMetricsHistory(h => [...h.slice(1), Math.floor(5 + Math.random() * 25)]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => 
      l.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.category.includes(searchQuery.toLowerCase())
    );
  }, [logs, searchQuery]);

  const MetricCard = ({ label, value, icon: Icon, color, unit }: any) => (
    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/[0.04] transition-all">
       <div className="space-y-1">
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{label}</p>
          <h4 className="text-2xl font-black text-white">{value}<span className="text-xs text-zinc-600 ml-1 font-bold">{unit}</span></h4>
       </div>
       <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
          <Icon size={20} className={color.replace('bg-', 'text-')} />
       </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-transparent font-sans overflow-hidden p-12">
      
      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-[var(--accent-color)] rounded-[1.5rem] text-white shadow-xl shadow-blue-500/20">
               <Activity size={32} />
             </div>
             <div>
               <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Telemetry Lab</h2>
               <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Core Telemetry & Incident Analysis</p>
             </div>
          </div>
        </div>

        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
           {['monitor', 'audio', 'logs', 'crashes'].map(tab => (
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

      {/* 2. MAIN VIEWPORT */}
      <div className="flex-1 flex gap-10 overflow-hidden">
        
        {/* --- LEFT PANEL: LIVE MONITORING --- */}
        <main className="flex-1 bg-white/[0.01] border border-white/5 rounded-[4rem] overflow-hidden flex flex-col">
           <AnimatePresence mode="wait">
              {activeTab === 'monitor' && (
                <MotionDiv key="monitor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <MetricCard label="Neural Load" value={metrics.cpu} icon={Cpu} color="bg-blue-500" unit="%" />
                      <MetricCard label="Allocated RAM" value={metrics.ram} icon={Database} color="bg-purple-500" unit="MB" />
                      <MetricCard label="Audio Delay" value={metrics.audioLatency} icon={Waves} color="bg-emerald-500" unit="ms" />
                   </div>

                   {/* Main Telemetry Chart */}
                   <section className="p-8 bg-black/40 border border-white/5 rounded-[3rem] space-y-6">
                      <div className="flex items-center justify-between">
                         <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                           <PulseIcon size={12} className="text-blue-500" /> Neural Pipeline Throughput
                         </h4>
                         <span className="text-[10px] font-black text-blue-500">STABLE</span>
                      </div>
                      <div className="h-48 flex items-end gap-1 px-2">
                         {metricsHistory.map((v, i) => (
                           <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/10 to-blue-500 rounded-t-sm" style={{ height: `${v}%`, opacity: 0.2 + (i / metricsHistory.length) * 0.8 }} />
                         ))}
                      </div>
                      <div className="flex justify-between text-[8px] font-black text-zinc-700 uppercase tracking-tighter">
                         <span>-60 SECONDS</span>
                         <span>REAL-TIME FEED</span>
                      </div>
                   </section>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
                         <h5 className="text-[10px] font-black text-zinc-600 uppercase">Hardware Handshake</h5>
                         <div className="space-y-4">
                            {[
                              { label: 'WASAPI Status', val: 'Connected', icon: CheckCircle2, color: 'text-emerald-500' },
                              { label: 'GPU Acceleration', val: 'Active (DirectX)', icon: CheckCircle2, color: 'text-emerald-500' },
                              { label: 'I/O Latency', val: '0.4ms', icon: Gauge, color: 'text-blue-500' }
                            ].map(item => (
                              <div key={item.label} className="flex items-center justify-between">
                                 <span className="text-xs font-bold text-zinc-400">{item.label}</span>
                                 <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${item.color}`}>
                                    <item.icon size={12} /> {item.val}
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                      <button className="h-full p-8 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4 group hover:border-[var(--accent-color)]/30 transition-all">
                         <RefreshCw size={40} className="text-zinc-800 group-hover:text-[var(--accent-color)] group-hover:rotate-180 transition-all duration-700" />
                         <div>
                            <h5 className="text-white font-black text-sm uppercase">Full Diagnostic Scan</h5>
                            <p className="text-[10px] text-zinc-600 tracking-tight">Run 42-point system health check</p>
                         </div>
                      </button>
                   </div>
                </MotionDiv>
              )}

              {activeTab === 'audio' && (
                <MotionDiv key="audio" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-10 space-y-12">
                   <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-8">
                         <h3 className="text-2xl font-black text-white flex items-center gap-3"><Speaker size={24} className="text-blue-500" /> Output Stream Info</h3>
                         <div className="space-y-3">
                            {[
                              { label: 'Primary Device', val: 'Realtek ASIO Driver' },
                              { label: 'Sample Rate', val: '192,000 Hz' },
                              { label: 'Bit Depth', val: '32-bit Float' },
                              { label: 'Buffer Size', val: '512 Samples (2.7ms)' },
                              { label: 'Exclusive Mode', val: 'Enabled' }
                            ].map(row => (
                              <div key={row.label} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between">
                                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{row.label}</span>
                                 <span className="text-xs font-bold text-white font-mono">{row.val}</span>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-8">
                         <h3 className="text-2xl font-black text-white flex items-center gap-3"><Gauge size={24} className="text-amber-500" /> Audio Thread Stability</h3>
                         <div className="p-8 bg-black/40 border border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                               <div className="absolute inset-0 rounded-full border-8 border-white/5" />
                               <div className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent animate-spin-slow" />
                               <span className="text-4xl font-black text-white">0</span>
                            </div>
                            <div className="space-y-1">
                               <h5 className="font-black text-white uppercase tracking-widest">Buffer Dropouts</h5>
                               <p className="text-[10px] text-zinc-600">Zero glitches detected in current session.</p>
                            </div>
                            <button className="px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Stress Test Thread</button>
                         </div>
                      </div>
                   </section>
                </MotionDiv>
              )}

              {activeTab === 'logs' && (
                <MotionDiv key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col h-full">
                   <div className="p-8 border-b border-white/5 bg-black/20 flex items-center justify-between">
                      <div className="relative w-96">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                         <input 
                           type="text" 
                           placeholder="Filter registry..." 
                           value={searchQuery}
                           onChange={e => setSearchQuery(e.target.value)}
                           className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-bold focus:outline-none focus:border-[var(--accent-color)]"
                         />
                      </div>
                      <div className="flex gap-2">
                         <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all"><Download size={18}/></button>
                         <button className="p-3 bg-white/5 hover:bg-red-600/10 rounded-xl text-zinc-500 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                      </div>
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-1 font-mono text-[10px]">
                      {filteredLogs.map(log => (
                        <div key={log.id} className={`flex gap-6 p-2 rounded hover:bg-white/5 transition-all group ${log.level === 'error' ? 'text-red-400 bg-red-400/5 border-l-2 border-red-500' : log.level === 'warn' ? 'text-amber-400' : 'text-zinc-500'}`}>
                           <span className="w-20 opacity-40 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                           <span className="w-20 font-black uppercase opacity-60">[{log.category}]</span>
                           <span className="flex-1 truncate group-hover:whitespace-normal">{log.message}</span>
                        </div>
                      ))}
                   </div>
                </MotionDiv>
              )}

              {activeTab === 'crashes' && (
                <MotionDiv key="crashes" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-10 space-y-8 overflow-y-auto custom-scrollbar h-full">
                   {MOCK_CRASHES.map(crash => (
                     <div 
                       key={crash.id} 
                       onClick={() => setSelectedCrash(crash)}
                       className="p-8 bg-red-600/5 border border-red-600/20 rounded-[3rem] flex items-start gap-8 cursor-pointer hover:bg-red-600/10 transition-all group"
                     >
                        <div className="p-5 bg-red-600 rounded-3xl text-white shadow-xl shadow-red-600/20 group-hover:scale-110 transition-transform">
                           <Bug size={32} />
                        </div>
                        <div className="flex-1 space-y-4">
                           <div className="flex justify-between items-start">
                              <div>
                                 <h4 className="text-2xl font-black text-white tracking-tighter">{crash.exception}</h4>
                                 <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mt-1">{crash.module} • {new Date(crash.timestamp).toLocaleString()}</p>
                              </div>
                              <span className="px-3 py-1 bg-red-600 text-white text-[9px] font-black rounded-lg uppercase">Incident Logged</span>
                           </div>
                           <div className="bg-black/40 p-5 rounded-2xl font-mono text-[10px] text-red-300/60 border border-red-950/20 max-h-32 overflow-hidden">
                              {crash.stackTrace}
                           </div>
                           <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-start gap-4">
                              <Zap size={18} className="text-blue-500 shrink-0 mt-1" />
                              <div className="space-y-1">
                                 <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Neural Crash Analysis</h5>
                                 <p className="text-xs text-zinc-400 leading-relaxed font-medium">{crash.aiAnalysis}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                   ))}
                </MotionDiv>
              )}
           </AnimatePresence>
        </main>

        {/* --- RIGHT PANEL: AI DIAGNOSTICS ADVISOR --- */}
        <aside className="w-96 flex flex-col gap-8 shrink-0">
           <section className="p-8 bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-[3rem] space-y-6">
              <div className="flex items-center gap-3 text-purple-400">
                 <ShieldCheck size={20} className="animate-pulse" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Diagnostics Advisor</h4>
              </div>
              <div className="space-y-4">
                 <div className="flex items-start gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_8px_#10b981]" />
                    <p className="text-xs text-zinc-400 leading-relaxed">
                       I've performed a neural sweep of your hardware stack. <span className="text-white font-bold">Latency is optimal (12ms)</span>. 
                    </p>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shadow-[0_0_8px_#f59e0b]" />
                    <p className="text-xs text-zinc-400 leading-relaxed">
                       Your network jitter is high. I recommend <span className="text-white font-bold">increasing the stream buffer to 5000ms</span> for stable cloud playback.
                    </p>
                 </div>
              </div>
              <button className="w-full py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 shadow-xl transition-all">Optimize Entire Environment</button>
           </section>

           {/* Hardware Test Hub */}
           <section className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] flex-1 space-y-6">
              <h5 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em]">Validation Modules</h5>
              <div className="space-y-3">
                 {[
                   { label: 'Audio Latency Test', icon: Mic2, desc: 'Loopback delay' },
                   { label: 'Neural API Ping', icon: Network, desc: 'Gemini connectivity' },
                   { label: 'Database I/O Speed', icon: HardDrive, desc: 'Search response time' },
                   { label: 'Memory Leak Audit', icon: Box, desc: 'V8 heap inspection' }
                 ].map(test => (
                   <button key={test.label} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-left transition-all flex items-center gap-4 group">
                      <div className="p-2.5 bg-zinc-900 rounded-xl text-zinc-500 group-hover:text-[var(--accent-color)] transition-colors"><test.icon size={16}/></div>
                      <div>
                         <h6 className="text-[11px] font-bold text-white uppercase tracking-tight">{test.label}</h6>
                         <p className="text-[8px] font-black text-zinc-700 uppercase">{test.desc}</p>
                      </div>
                   </button>
                 ))}
              </div>
           </section>
        </aside>
      </div>

      {/* 3. GLOBAL FOOTER INFO */}
      <footer className="p-8 border-t border-white/5 flex items-center justify-between px-10 bg-black/20 mt-4 rounded-b-[4rem]">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
              <Binary size={14}/> Build: Melodix_Core_v6.0.42
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
              <History size={14}/> Uptime: 04:12:45
            </div>
         </div>
         <div className="flex gap-4">
            <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-all flex items-center gap-2"><Share2 size={14}/> Share Debug Bundle</button>
            <button className="px-6 py-2 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"><Database size={14}/> Clear Session Cache</button>
         </div>
      </footer>
    </div>
  );
};

export default DiagnosticsView;
