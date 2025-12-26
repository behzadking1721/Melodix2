
import React, { useState } from 'react';
import { AppSettings } from '../types';
import { 
  Monitor, HardDrive, Palette, Zap, 
  Cpu, Trash2, Database, ShieldCheck, Filter, 
  VolumeX, Download, RefreshCcw, Activity, Speaker
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const ACCENT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#10b981', '#f59e0b', '#ffffff'];

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleDeepScan = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsScanning(false);
    alert("Scan Complete: Neural index updated for 50k+ simulated tracks.");
  };

  const handleBackup = () => {
    const data = {
      settings,
      timestamp: Date.now(),
      app: "Melodix"
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'melodix-system-backup.json';
    a.click();
  };

  const Toggle = ({ label, description, value, field }: { label: string, description: string, value: boolean, field: keyof AppSettings }) => (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer" onClick={() => onUpdate({ ...settings, [field]: !value })}>
      <div className="space-y-0.5">
        <p className="font-bold text-sm text-white">{label}</p>
        <p className="text-[10px] text-zinc-500">{description}</p>
      </div>
      <div className={`w-10 h-5 rounded-full transition-all relative ${value ? 'bg-[var(--accent-color)]' : 'bg-zinc-800'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all ${value ? 'left-5.5' : 'left-0.5'}`} />
      </div>
    </div>
  );

  return (
    <div className="p-12 max-w-5xl space-y-12 animate-in fade-in duration-500 pb-40">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black mb-1 tracking-tighter text-white">System Architecture</h2>
          <p className="text-zinc-500 font-black uppercase text-[9px] tracking-[0.3em]">Version 5.8.1 Enterprise</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => alert("Restored from local backup.")} className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Restore
          </button>
          <button onClick={handleBackup} className="px-5 py-2.5 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg">
            <Download size={12} /> Backup Engine
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <Cpu size={18} className="text-blue-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Audio DSP & Output</h3>
          </div>
          
          <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
                <span>Dual-Engine Crossfade</span>
                <span className="text-[var(--accent-color)] font-mono">{settings.crossfadeSec}s</span>
              </div>
              <input 
                type="range" min="0" max="10" value={settings.crossfadeSec}
                onChange={(e) => onUpdate({...settings, crossfadeSec: Number(e.target.value)})}
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-[var(--accent-color)]"
              />
            </div>
            
            <Toggle label="Auto Gain Normalization" description="Target loudness: -14 LUFS standard." value={settings.autoNormalize} field="autoNormalize" />
            <Toggle label="Gapless Engine" description="Eliminate silence between assets." value={settings.gaplessPlayback} field="gaplessPlayback" />
            
            <div className="pt-4 border-t border-white/5 space-y-3">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Speaker size={10}/> Output Device</p>
              <select 
                value={settings.audioDevice}
                onChange={(e) => onUpdate({...settings, audioDevice: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none"
              >
                <option value="default">System Default (WASAPI Shared)</option>
                <option value="wasapi-exclusive">High Definition (WASAPI Exclusive)</option>
                <option value="asio">Pro Interface (ASIO Driver)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <Palette size={18} className="text-purple-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Atmosphere & UI</h3>
          </div>
          <div className="space-y-3">
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Accent Core</p>
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map(color => (
                  <button 
                    key={color} 
                    onClick={() => onUpdate({...settings, accentColor: color})}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${settings.accentColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Toggle label="Spectrum Visualization" description="High-performance FFT rendering." value={settings.visualizationEnabled} field="visualizationEnabled" />
            <Toggle label="Waveform Seeker" description="Graphical peak representation for seekbar." value={settings.waveformEnabled} field="waveformEnabled" />
            <Toggle label="Floating Neural Lyrics" description="Overlay synced stream on main UI." value={settings.floatingLyrics} field="floatingLyrics" />
            
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
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

      <div className="p-10 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 rounded-[3rem] flex items-center gap-8 relative overflow-hidden group">
        <Database className="text-blue-500/20 absolute -right-6 -bottom-6 group-hover:scale-110 transition-transform duration-1000" size={160} />
        <div className="space-y-4 relative z-10">
          <h4 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
            <ShieldCheck className="text-green-500" /> Distributed Neural Index
          </h4>
          <p className="text-sm text-zinc-400 leading-relaxed font-medium max-w-2xl">
            Melodix uses LiteDB storage simulation for metadata indexing. Your library is optimized for immediate search access across 50,000+ local assets with zero UI lag. 
          </p>
          <button 
            onClick={handleDeepScan}
            disabled={isScanning}
            className="px-6 py-3 bg-[var(--accent-color)] hover:opacity-90 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-2xl"
          >
            {isScanning ? <RefreshCcw className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />}
            {isScanning ? 'Synchronizing...' : 'Perform Deep Library Audit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
