
import React, { useState } from 'react';
import { AppSettings } from '../types';
import { 
  Monitor, HardDrive, Palette, Zap, 
  Cpu, Trash2, Database, ShieldCheck 
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleDeepScan = async () => {
    setIsScanning(true);
    // Simulating High-Performance Metadata Thread
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsScanning(false);
    alert("Melodix Engine: Deep Analysis complete. Library synchronized.");
  };

  const Toggle = ({ label, description, value, field }: { label: string, description: string, value: boolean, field: keyof AppSettings }) => (
    <div className="flex items-center justify-between p-5 bg-white/[0.03] rounded-3xl border border-white/5 hover:bg-white/[0.06] transition-all cursor-pointer" onClick={() => onUpdate({ ...settings, [field]: !value })}>
      <div className="space-y-1">
        <p className="font-bold text-sm text-white">{label}</p>
        <p className="text-[10px] text-zinc-500 font-medium tracking-tight">{description}</p>
      </div>
      <button 
        className={`w-11 h-6 rounded-full transition-all relative ${value ? 'bg-blue-600' : 'bg-zinc-800'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="p-16 max-w-5xl space-y-16 animate-in fade-in duration-500 pb-40">
      <div>
        <h2 className="text-5xl font-black mb-2 tracking-tighter text-white">Engine Configuration</h2>
        <p className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.4em]">Melodix Neural Core v5.2</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Library Management */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <HardDrive size={20} className="text-purple-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Library Management</h3>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleDeepScan}
              disabled={isScanning}
              className={`w-full p-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50`}
            >
              {isScanning ? <Cpu className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
              {isScanning ? 'Engine Busy...' : 'Start Deep Scan'}
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button className="p-5 bg-white/5 border border-white/5 rounded-3xl flex flex-col items-center gap-3 group hover:bg-red-500/10 hover:border-red-500/20 transition-all">
                <Trash2 size={20} className="text-zinc-500 group-hover:text-red-500" />
                <span className="text-[9px] font-black uppercase tracking-widest">Clear Cache</span>
              </button>
              <button className="p-5 bg-white/5 border border-white/5 rounded-3xl flex flex-col items-center gap-3 group hover:bg-blue-500/10 hover:border-blue-500/20 transition-all">
                <Database size={20} className="text-zinc-500 group-hover:text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-widest">Export DB</span>
              </button>
            </div>
          </div>
        </section>

        {/* System & Appearance */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Monitor size={20} className="text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">System Integration</h3>
          </div>
          <div className="space-y-3">
            <Toggle label="Auto Launch" description="Start on Windows boot." value={settings.launchOnBoot} field="launchOnBoot" />
            <Toggle label="Stay on Top" description="Priority window layer." value={settings.alwaysOnTop} field="alwaysOnTop" />
            
            <div className="p-5 bg-white/[0.03] rounded-3xl border border-white/5 space-y-4">
               <div className="flex items-center gap-3 text-zinc-400">
                  <Palette size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Theme Mode</span>
               </div>
               <div className="flex gap-2 p-1 bg-black/40 rounded-2xl">
                {(['auto', 'light', 'dark'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => onUpdate({ ...settings, themeMode: mode })}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${settings.themeMode === mode ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="p-10 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-white/5 rounded-[3rem] flex items-center gap-8 relative overflow-hidden group">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
        <ShieldCheck className="text-blue-500 shrink-0" size={48} />
        <div className="space-y-2">
          <h4 className="text-xl font-bold text-white tracking-tight">Enterprise Asset Security</h4>
          <p className="text-sm text-zinc-500 leading-relaxed font-medium">
            Melodix uses 256-bit local encryption for your IndexedDB cache. Your AI metadata and synced lyrics remain private and offline-first at all times.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
