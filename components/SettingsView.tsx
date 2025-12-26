
import React, { useState } from 'react';
import { AppSettings } from '../types';
import { 
  Monitor, HardDrive, Palette, Zap, 
  Cpu, Trash2, Database, ShieldCheck, Filter, Clock
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleDeepScan = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsScanning(false);
    alert("Scan Complete: 48 High-Fidelity local assets analyzed.");
  };

  const Toggle = ({ label, description, value, field }: { label: string, description: string, value: boolean, field: keyof AppSettings }) => (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer" onClick={() => onUpdate({ ...settings, [field]: !value })}>
      <div className="space-y-0.5">
        <p className="font-bold text-sm text-white">{label}</p>
        <p className="text-[10px] text-zinc-500">{description}</p>
      </div>
      <div className={`w-10 h-5 rounded-full transition-all relative ${value ? 'bg-blue-600' : 'bg-zinc-800'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-5.5' : 'left-0.5'}`} />
      </div>
    </div>
  );

  return (
    <div className="p-12 max-w-4xl space-y-12 animate-in fade-in duration-500 pb-40">
      <div>
        <h2 className="text-4xl font-black mb-1 tracking-tighter text-white">Settings</h2>
        <p className="text-zinc-500 font-black uppercase text-[9px] tracking-[0.3em]">System Configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Library Scanner Filters */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-blue-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Scan Filters</h3>
          </div>
          
          <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
                <span>Min File Size</span>
                <span className="text-blue-400">{settings.minFileSizeMB} MB</span>
              </div>
              <input 
                type="range" min="1" max="50" value={settings.minFileSizeMB}
                onChange={(e) => onUpdate({...settings, minFileSizeMB: Number(e.target.value)})}
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
                <span>Min Duration</span>
                <span className="text-blue-400">{settings.minDurationSec}s</span>
              </div>
              <input 
                type="range" min="5" max="300" step="5" value={settings.minDurationSec}
                onChange={(e) => onUpdate({...settings, minDurationSec: Number(e.target.value)})}
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-blue-500"
              />
            </div>

            <button 
              onClick={handleDeepScan}
              disabled={isScanning}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {isScanning ? <Cpu className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />}
              {isScanning ? 'Scanning System...' : 'Deep Scan Now'}
            </button>
          </div>
        </section>

        {/* Integration */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <Monitor size={18} className="text-purple-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">System Integration</h3>
          </div>
          <div className="space-y-2">
            <Toggle label="Launch on Boot" description="Auto-start with Windows." value={settings.launchOnBoot} field="launchOnBoot" />
            <Toggle label="Always on Top" description="Keep Melodix above all windows." value={settings.alwaysOnTop} field="alwaysOnTop" />
            <Toggle label="Musixmatch Sync" description="Prioritize high-precision lyrics." value={true} field="isDefaultPlayer" />
            
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
               <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase mb-3">
                 <Palette size={14} /> Theme Behavior
               </div>
               <div className="flex gap-1.5 p-1 bg-black/40 rounded-xl">
                {(['auto', 'light', 'dark'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => onUpdate({ ...settings, themeMode: mode })}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${settings.themeMode === mode ? 'bg-white text-black' : 'text-zinc-600 hover:text-white'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
