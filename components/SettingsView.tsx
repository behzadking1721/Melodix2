
import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, AudioOutputMode, ThemeDefinition, NavigationTab } from '../types';
import { 
  Palette, Cpu, Database, ShieldCheck, RefreshCcw, Speaker, 
  Sun, Moon, Laptop, Headphones, Settings2, Info, 
  Download, Upload, Save, Trash2, Plus, Layout, 
  Paintbrush, Pipette, Share2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioDeviceService, AudioDevice } from '../services/audioDeviceService';
import { AudioEngine } from '../services/audioEngine';
import { THEME_PRESETS, ThemeManager } from '../services/themeManager';
import { logger, LogCategory, LogLevel } from '../services/logger';

const MotionDiv = motion.div as any;

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate }) => {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeDefinition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshDevices();
  }, []);

  const refreshDevices = async () => {
    setIsRefreshing(true);
    const list = await audioDeviceService.enumerateDevices();
    setDevices(list);
    setIsRefreshing(false);
  };

  const handleThemeSelect = (theme: ThemeDefinition) => {
    onUpdate({ ...settings, activeThemeId: theme.id, themeMode: 'custom' });
    ThemeManager.applyTheme(theme);
  };

  const startEditing = (theme: ThemeDefinition) => {
    setEditingTheme({ ...theme, id: `custom-${Date.now()}`, name: `${theme.name} (Copy)` });
  };

  const saveCustomTheme = () => {
    if (!editingTheme) return;
    const newThemes = [...(settings.customThemes || []), editingTheme];
    onUpdate({ ...settings, customThemes: newThemes, activeThemeId: editingTheme.id });
    setEditingTheme(null);
  };

  const deleteTheme = (id: string) => {
    const newThemes = (settings.customThemes || []).filter(t => t.id !== id);
    onUpdate({ ...settings, customThemes: newThemes, activeThemeId: 'classic-dark' });
    ThemeManager.applyTheme(THEME_PRESETS[0]);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const theme = await ThemeManager.importTheme(file);
      if (theme) {
        const newThemes = [...(settings.customThemes || []), theme];
        onUpdate({ ...settings, customThemes: newThemes, activeThemeId: theme.id });
        ThemeManager.applyTheme(theme);
      }
    }
  };

  const Toggle = ({ label, description, value, field }: { label: string, description: string, value: boolean, field: keyof AppSettings }) => (
    <div 
      className="flex items-center justify-between p-5 bg-white/[0.02] rounded-[1.5rem] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group" 
      onClick={() => onUpdate({ ...settings, [field]: !value })}
    >
      <div className="space-y-0.5">
        <p className="font-bold text-sm text-white group-hover:text-[var(--accent-color)] transition-colors">{label}</p>
        <p className="text-[10px] text-zinc-500">{description}</p>
      </div>
      <div className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-[var(--accent-color)]' : 'bg-zinc-800'}`}>
        <MotionDiv 
          animate={{ x: value ? 24 : 4 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg" 
        />
      </div>
    </div>
  );

  const allThemes = [...THEME_PRESETS, ...(settings.customThemes || [])];
  const activeTheme = allThemes.find(t => t.id === settings.activeThemeId) || THEME_PRESETS[0];

  return (
    <div className="p-12 max-w-6xl space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-40 overflow-y-auto h-full custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-5xl font-black mb-2 tracking-tighter text-white">System Settings</h2>
          <p className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.4em]">Melodix Customization Lab</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="space-y-8 text-left">
          <div className="flex items-center gap-4">
            <Paintbrush size={20} className="text-pink-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">Design & Theming</h3>
          </div>
          
          <div className="space-y-6">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8">
              <div className="flex justify-between items-center">
                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Melodix Theme Gallery</p>
                <div className="flex gap-2">
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400" title="Import Theme">
                    <Upload size={14} />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
                  <button onClick={() => startEditing(activeTheme)} className="p-2 bg-blue-600/20 text-blue-400 rounded-lg" title="Create Custom from Active">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {allThemes.map(theme => (
                  <div 
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme)}
                    className={`p-4 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${settings.activeThemeId === theme.id ? 'border-[var(--accent-color)] bg-white/5' : 'border-white/5 bg-black/20 hover:border-white/20'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.background }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }} />
                      </div>
                      {settings.activeThemeId === theme.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />}
                    </div>
                    <p className="text-xs font-bold text-white mb-1">{theme.name}</p>
                    <p className="text-[9px] text-zinc-500 font-black uppercase">{theme.base}</p>
                    
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                       <button onClick={(e) => { e.stopPropagation(); ThemeManager.exportTheme(theme); }} className="p-1.5 bg-black/60 rounded-lg text-zinc-400 hover:text-white"><Share2 size={10}/></button>
                       {theme.id.startsWith('custom-') && (
                         <button onClick={(e) => { e.stopPropagation(); deleteTheme(theme.id); }} className="p-1.5 bg-red-600/20 rounded-lg text-red-400 hover:text-red-300"><Trash2 size={10}/></button>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {editingTheme && (
                <MotionDiv 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 mica border border-blue-500/20 rounded-[3rem] space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-black text-white">Customization Lab</h4>
                    <button onClick={() => setEditingTheme(null)} className="p-2 text-zinc-500 hover:text-white"><Trash2 size={18}/></button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">New Theme Name</label>
                      <input 
                        value={editingTheme.name}
                        onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { label: 'Background', key: 'background' },
                         { label: 'Cards & Panels', key: 'card' },
                         { label: 'Accent Color', key: 'accent' },
                         { label: 'Primary Text', key: 'textPrimary' }
                       ].map(color => (
                        <div key={color.key} className="space-y-2">
                          <label className="text-[9px] font-black text-zinc-600 ml-2">{color.label}</label>
                          <div className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-white/5">
                            <input 
                              type="color" 
                              value={(editingTheme as any)[color.key]} 
                              onChange={(e) => {
                                const newTheme = { ...editingTheme, [color.key]: e.target.value };
                                setEditingTheme(newTheme);
                                ThemeManager.applyTheme(newTheme);
                              }}
                              className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
                            />
                            <span className="text-[10px] font-mono text-zinc-400 uppercase">{(editingTheme as any)[color.key]}</span>
                          </div>
                        </div>
                       ))}
                    </div>

                    <button 
                      onClick={saveCustomTheme}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20"
                    >
                      <Save size={16} /> Save & Apply
                    </button>
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>

            <Toggle label="Frequency Visualizer" description="Real-time 60FPS audio spectrum rendering." value={settings.visualizationEnabled} field="visualizationEnabled" />
            <Toggle label="Waveform Progress" description="Display audio peaks in the progress bar." value={settings.waveformEnabled} field="waveformEnabled" />
          </div>
        </section>

        <section className="space-y-8 text-left">
          <div className="flex items-center gap-4">
            <Cpu size={20} className="text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">Engine & Hardware</h3>
          </div>
          
          <div className="space-y-6">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Speaker size={12}/> Audio Output (Hardware)
                </p>
                <button 
                  onClick={refreshDevices} 
                  className={`p-2 hover:bg-white/5 rounded-lg transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                >
                  <RefreshCcw size={12} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-zinc-600 ml-2">Select Device</label>
                  <select 
                    value={settings.audioDevice}
                    onChange={(e) => {
                       onUpdate({ ...settings, audioDevice: e.target.value });
                       AudioEngine.getInstance().setOutputDevice(e.target.value, settings.audioOutputMode);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                  >
                    {devices.map(d => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-zinc-600 ml-2">Output Mode (WASAPI)</label>
                  <div className="flex gap-2 p-1 bg-black/20 rounded-2xl">
                    <button 
                      onClick={() => {
                        onUpdate({ ...settings, audioOutputMode: AudioOutputMode.Shared });
                        AudioEngine.getInstance().setOutputDevice(settings.audioDevice, AudioOutputMode.Shared);
                      }}
                      className={`flex-1 py-2 rounded-xl text-[9px] font-black transition-all ${settings.audioOutputMode === AudioOutputMode.Shared ? 'bg-[var(--accent-color)] text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}
                    >
                      SHARED MODE
                    </button>
                    <button 
                      onClick={() => {
                        onUpdate({ ...settings, audioOutputMode: AudioOutputMode.Exclusive });
                        AudioEngine.getInstance().setOutputDevice(settings.audioDevice, AudioOutputMode.Exclusive);
                      }}
                      className={`flex-1 py-2 rounded-xl text-[9px] font-black transition-all ${settings.audioOutputMode === AudioOutputMode.Exclusive ? 'bg-amber-500 text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}
                    >
                      EXCLUSIVE MODE
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-black text-zinc-500 uppercase tracking-widest">
                  <span>Crossfade Duration</span>
                  <span className="text-[var(--accent-color)] font-mono">{settings.crossfadeSec}s</span>
                </div>
                <input 
                  type="range" min="0" max="10" step="1" value={settings.crossfadeSec}
                  onChange={(e) => onUpdate({...settings, crossfadeSec: Number(e.target.value)})}
                  className="w-full accent-[var(--accent-color)]"
                />
              </div>
            </div>
            
            <Toggle label="Auto Gain Normalization" description="Standardize loudness to -14 LUFS." value={settings.autoNormalize} field="autoNormalize" />
            <Toggle label="Gapless Playback" description="Eliminate silence between tracks." value={settings.gaplessPlayback} field="gaplessPlayback" />
          </div>
        </section>
      </div>

      <MotionDiv 
        whileHover={{ scale: 1.01 }}
        className="p-10 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 rounded-[3rem] flex items-center gap-10 relative overflow-hidden group"
      >
        <Database className="text-blue-500/10 absolute -left-8 -bottom-8 group-hover:scale-110 transition-transform duration-1000" size={200} />
        <div className="space-y-6 relative z-10 text-left">
          <h4 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
            <ShieldCheck className="text-emerald-500" /> Security & Local Index
          </h4>
          <p className="text-sm text-zinc-400 leading-relaxed font-medium max-w-2xl">
            All your metadata is encrypted and stored in your local database (Neural Index). Melodix does not transmit any files to cloud servers without your explicit permission.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-4 bg-[var(--accent-color)] hover:opacity-90 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl">
              <Share2 size={16} /> Backup Settings
            </button>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
              Clear Cache
            </button>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
};

export default SettingsView;
