
import React from 'react';
import { AppSettings } from '../types';
import { Monitor, HardDrive, FileAudio, PlayCircle, Palette, ExternalLink, ShieldCheck } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate }) => {
  const Toggle = ({ label, description, value, field }: { label: string, description: string, value: boolean, field: keyof AppSettings }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
      <div>
        <p className="font-bold text-sm text-white">{label}</p>
        <p className="text-[10px] text-zinc-500 font-medium">{description}</p>
      </div>
      <button 
        onClick={() => onUpdate({ ...settings, [field]: !value })}
        className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-blue-500' : 'bg-zinc-700'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="p-12 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-4xl font-black mb-10 tracking-tighter">Preferences</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* System Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Monitor size={18} className="text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">System Integration</h3>
          </div>
          <Toggle 
            label="Launch on Startup" 
            description="Open Aurora automatically when Windows starts." 
            value={settings.launchOnBoot} 
            field="launchOnBoot" 
          />
          <Toggle 
            label="Set as Default Player" 
            description="Handle all .mp3, .flac and .wav files." 
            value={settings.isDefaultPlayer} 
            field="isDefaultPlayer" 
          />
          <Toggle 
            label="Floating Lyrics" 
            description="Show transparent lyrics overlay on desktop." 
            value={settings.floatingLyrics} 
            field="floatingLyrics" 
          />
        </section>

        {/* Scan Filter Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive size={18} className="text-purple-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Library Scanning</h3>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Min File Size</span>
              <span className="text-xs text-blue-400">{settings.minFileSizeMB} MB</span>
            </div>
            <input 
              type="range" min="0" max="50" step="1" value={settings.minFileSizeMB}
              onChange={(e) => onUpdate({ ...settings, minFileSizeMB: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Min Track Length</span>
              <span className="text-xs text-blue-400">{settings.minDurationSec}s</span>
            </div>
            <input 
              type="range" min="0" max="300" step="10" value={settings.minDurationSec}
              onChange={(e) => onUpdate({ ...settings, minDurationSec: Number(e.target.value) })}
              className="w-full accent-purple-500"
            />
          </div>
        </section>

        {/* Theme Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={18} className="text-pink-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Appearance</h3>
          </div>
          <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
            {(['auto', 'light', 'dark'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => onUpdate({ ...settings, themeMode: mode })}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all ${settings.themeMode === mode ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-16 p-6 bg-blue-500/10 border border-blue-500/20 rounded-[2rem] flex items-center gap-6">
        <ShieldCheck className="text-blue-400" size={32} />
        <div>
          <p className="font-bold text-white">Privacy First Architecture</p>
          <p className="text-xs text-zinc-400">All local files stay on your machine. Gemini AI only analyzes metadata for enhancement.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
