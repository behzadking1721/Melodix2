
import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, AudioOutputMode, ThemeDefinition, NavigationTab } from '../types';
import { 
  Palette, Cpu, Database, ShieldCheck, RefreshCcw, Speaker, 
  Sun, Moon, Laptop, Headphones, Settings2, Info, 
  Download, Upload, Save, Trash2, Plus, Layout, 
  Paintbrush, Pipette, Share2, AlertCircle, Globe,
  Terminal, Monitor, Bell, Sliders, Zap, Mic2, Tags,
  Image as ImageIcon, HardDrive, Search, History, Shield,
  Layers, Package, ChevronRight, Check, Library
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
  const [activeSection, setActiveSection] = useState<string>('general');

  useEffect(() => {
    refreshDevices();
  }, []);

  const refreshDevices = async () => {
    setIsRefreshing(true);
    const list = await audioDeviceService.enumerateDevices();
    setDevices(list);
    setIsRefreshing(false);
  };

  const updateSetting = (field: keyof AppSettings, value: any) => {
    onUpdate({ ...settings, [field]: value });
  };

  const SectionHeader = ({ icon: Icon, title, id }: { icon: any, title: string, id: string }) => (
    <div id={id} className="flex items-center gap-4 pt-12 mb-8 border-b border-white/5 pb-4 sticky top-0 bg-[var(--mica-bg)] z-10">
      <div className="p-2.5 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-xl">
        <Icon size={20} />
      </div>
      <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
    </div>
  );

  const ToggleItem = ({ label, description, value, field }: { label: string, description: string, value: boolean, field: keyof AppSettings }) => (
    <div 
      className="flex items-center justify-between p-5 bg-white/[0.02] rounded-[1.5rem] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group" 
      onClick={() => updateSetting(field, !value)}
    >
      <div className="space-y-1">
        <p className="font-bold text-sm text-white group-hover:text-[var(--accent-color)] transition-colors">{label}</p>
        <p className="text-[10px] text-zinc-500 max-w-md">{description}</p>
      </div>
      <div className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-[var(--accent-color)]' : 'bg-zinc-800'}`}>
        <MotionDiv 
          animate={{ x: value ? 24 : 4 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg" 
        />
      </div>
    </div>
  );

  const SelectItem = ({ label, description, value, options, field }: { label: string, description: string, value: any, options: { label: string, value: any }[], field: keyof AppSettings }) => (
    <div className="flex items-center justify-between p-5 bg-white/[0.02] rounded-[1.5rem] border border-white/5">
      <div className="space-y-1">
        <p className="font-bold text-sm text-white">{label}</p>
        <p className="text-[10px] text-zinc-500">{description}</p>
      </div>
      <select 
        value={value} 
        onChange={(e) => updateSetting(field, e.target.value)}
        className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-[var(--accent-color)] text-white"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="h-full flex overflow-hidden">
      {/* Quick Access Sidebar */}
      <aside className="w-64 border-r border-white/5 p-8 space-y-2 hidden xl:block">
        <h4 className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-6">Navigation</h4>
        {[
          { id: 'general', label: 'General', icon: Globe },
          { id: 'appearance', label: 'Appearance', icon: Palette },
          { id: 'audio', label: 'Audio Engine', icon: Speaker },
          { id: 'library', label: 'Library', icon: Library },
          { id: 'lyrics', label: 'Metadata', icon: Tags },
          { id: 'ai', label: 'AI Enhancement', icon: Zap },
          { id: 'advanced', label: 'Advanced', icon: Terminal },
          { id: 'about', label: 'About', icon: Info },
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <item.icon size={14} /> {item.label}
          </button>
        ))}
      </aside>

      {/* Main Settings Panel */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-12 pb-60 space-y-4">
        
        {/* Section 1: General */}
        <section>
          <SectionHeader icon={Globe} title="General Settings" id="general" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectItem 
              label="Language" 
              description="Primary application interface language." 
              value={settings.language} 
              field="language"
              options={[{ label: 'English (US)', value: 'en' }, { label: 'Persian (Farsi)', value: 'fa' }]} 
            />
            <SelectItem 
              label="Default Page" 
              description="The view displayed when the app launches." 
              value={settings.defaultPage} 
              field="defaultPage"
              options={[
                { label: 'Home Dashboard', value: 'main' },
                { label: 'Local Library', value: 'musics' },
                { label: 'Playlists', value: 'playlist' }
              ]} 
            />
            <ToggleItem label="Launch on System Startup" description="Start Melodix automatically when Windows starts." value={settings.launchOnBoot} field="launchOnBoot" />
            <ToggleItem label="Launch Minimized" description="Start in the system tray instead of the main window." value={settings.launchMinimized} field="launchMinimized" />
            <ToggleItem label="Show Desktop Notifications" description="Display a toast when a new track begins." value={settings.showToasts} field="showToasts" />
          </div>
        </section>

        {/* Section 2: Appearance */}
        <section>
          <SectionHeader icon={Palette} title="Theme & Appearance" id="appearance" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <SelectItem 
              label="UI Density" 
              description="Adjust spacing and sizing of list elements." 
              value={settings.uiDensity} 
              field="uiDensity"
              options={[{ label: 'Comfortable', value: 'comfortable' }, { label: 'Compact', value: 'compact' }]} 
            />
            <ToggleItem label="Mica / Acrylic Blur" description="Enable translucent background effects (High performance cost)." value={settings.enableBlur} field="enableBlur" />
            <ToggleItem label="Smooth Animations" description="Use Framer Motion for interface transitions." value={settings.enableAnimations} field="enableAnimations" />
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] col-span-2">
              <p className="font-bold text-sm text-white mb-4">Mini Player Behavior</p>
              <div className="grid grid-cols-3 gap-4">
                <ToggleItem label="Auto-Expand" description="Show controls on hover." value={settings.miniMode} field="miniMode" />
                <ToggleItem label="Progress Bar" description="Show seek bar in mini." value={settings.miniProgress} field="miniProgress" />
                <ToggleItem label="Cover Art" description="Show art background." value={settings.miniCover} field="miniCover" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Audio Engine */}
        <section>
          <SectionHeader icon={Speaker} title="Audio Engine" id="audio" />
          <div className="space-y-4">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-black text-sm text-white">Hardware Output</p>
                  <p className="text-xs text-zinc-500">Select your primary playback device.</p>
                </div>
                <button onClick={refreshDevices} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                  <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
              </div>
              <select 
                value={settings.audioDevice}
                onChange={(e) => updateSetting('audioDevice', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-[var(--accent-color)]"
              >
                {devices.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => updateSetting('audioOutputMode', AudioOutputMode.Shared)}
                  className={`p-6 rounded-[2rem] border cursor-pointer transition-all ${settings.audioOutputMode === AudioOutputMode.Shared ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)]' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <Layers size={20} className={settings.audioOutputMode === AudioOutputMode.Shared ? 'text-[var(--accent-color)]' : 'text-zinc-600'} />
                    {settings.audioOutputMode === AudioOutputMode.Shared && <Check size={16} className="text-[var(--accent-color)]" />}
                  </div>
                  <h5 className="font-black text-xs text-white uppercase tracking-widest mb-1">Shared Mode</h5>
                  <p className="text-[10px] text-zinc-500">Allow other apps to play sounds simultaneously.</p>
                </div>

                <div 
                  onClick={() => updateSetting('audioOutputMode', AudioOutputMode.Exclusive)}
                  className={`p-6 rounded-[2rem] border cursor-pointer transition-all ${settings.audioOutputMode === AudioOutputMode.Exclusive ? 'bg-amber-500/20 border-amber-500' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <Headphones size={20} className={settings.audioOutputMode === AudioOutputMode.Exclusive ? 'text-amber-500' : 'text-zinc-600'} />
                    {settings.audioOutputMode === AudioOutputMode.Exclusive && <Check size={16} className="text-amber-500" />}
                  </div>
                  <h5 className="font-black text-xs text-white uppercase tracking-widest mb-1">Exclusive Mode</h5>
                  <p className="text-[10px] text-zinc-500">Lock hardware for bit-perfect audiophile output.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleItem label="Normalize Volume" description="Ensures all tracks have consistent loudness." value={settings.autoNormalize} field="autoNormalize" />
              <ToggleItem label="Gapless Playback" description="Erase silence between tracks automatically." value={settings.gaplessPlayback} field="gaplessPlayback" />
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] space-y-3">
                <div className="flex justify-between text-[11px] font-black text-zinc-500 uppercase">
                  <span>Crossfade Duration</span>
                  <span className="text-[var(--accent-color)]">{settings.crossfadeSec}s</span>
                </div>
                <input 
                  type="range" min="0" max="10" value={settings.crossfadeSec}
                  onChange={(e) => updateSetting('crossfadeSec', Number(e.target.value))}
                  className="w-full accent-[var(--accent-color)]"
                />
              </div>
              <SelectItem 
                label="Sample Rate" 
                description="Target output frequency." 
                value={settings.targetSampleRate} 
                field="targetSampleRate"
                options={[{ label: '44.1 kHz', value: 44100 }, { label: '48 kHz', value: 48000 }, { label: '96 kHz (Studio)', value: 96000 }]} 
              />
            </div>
          </div>
        </section>

        {/* Section 4: Library */}
        <section>
          <SectionHeader icon={Library} title="Library Management" id="library" />
          <div className="space-y-4">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">Indexed Folders</h4>
                <button className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Add Folder</button>
              </div>
              <div className="space-y-2">
                {settings.musicFolders.map((path, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <HardDrive size={16} className="text-zinc-500" />
                        <span className="text-xs font-medium text-zinc-300">{path}</span>
                      </div>
                      <button className="text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                   </div>
                ))}
              </div>
              <button className="w-full py-4 bg-[var(--accent-color)] text-white rounded-2xl font-black text-xs flex items-center justify-center gap-3 shadow-xl shadow-[var(--accent-glow)]">
                <Search size={16} /> Rescan All Library
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleItem label="Auto-Rescan on Startup" description="Search for new files every time Melodix starts." value={settings.autoRescan} field="autoRescan" />
              <ToggleItem label="Prefer Embedded Tags" description="Always use metadata stored inside the audio files." value={settings.preferEmbeddedTags} field="preferEmbeddedTags" />
              <ToggleItem label="Detect Duplicates" description="Filter out identical tracks with different filenames." value={settings.detectDuplicates} field="detectDuplicates" />
              <ToggleItem label="Group by Album Artist" description="Maintain discography order for multi-artist albums." value={settings.groupByAlbumArtist} field="groupByAlbumArtist" />
            </div>
          </div>
        </section>

        {/* Section 5: Lyrics & Tags */}
        <section>
          <SectionHeader icon={Tags} title="Lyrics & Meta Providers" id="lyrics" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectItem 
              label="Primary Lyrics Source" 
              description="Provider used for initial lyrics search." 
              value={settings.lyricsProvider} 
              field="lyricsProvider"
              options={[{ label: 'Gemini Neural Sync', value: 'gemini' }, { label: 'Local LRC Files', value: 'lrc' }, { label: 'Musixmatch', value: 'musixmatch' }]} 
            />
            <SelectItem 
              label="Metadata Database" 
              description="Canonical source for tags and years." 
              value={settings.tagProvider} 
              field="tagProvider"
              options={[{ label: 'MusicBrainz Picard', value: 'musicbrainz' }, { label: 'Gemini Intelligence', value: 'gemini' }, { label: 'Discogs', value: 'discogs' }]} 
            />
            <ToggleItem label="Auto-Save Lyrics" description="Write fetched lyrics to local database immediately." value={settings.autoSaveLyrics} field="autoSaveLyrics" />
            <ToggleItem label="Prefer Synced LRC" description="Prioritize time-stamped lyrics over static text." value={settings.preferSyncedLrc} field="preferSyncedLrc" />
            <ToggleItem label="Embed in File (ID3)" description="Save tags and covers directly inside audio files." value={settings.saveInsideFile} field="saveInsideFile" />
            <ToggleItem label="HD Cover Art" description="Always search for 800px+ resolution covers." value={settings.hdCoverArt} field="hdCoverArt" />
          </div>
        </section>

        {/* Section 6: AI Enhancement */}
        <section>
          <SectionHeader icon={Zap} title="Auto-Enhancement Engine" id="ai" />
          <div className="space-y-4">
            <div className="p-8 bg-gradient-to-br from-[var(--accent-color)]/10 to-purple-600/10 border border-[var(--accent-color)]/20 rounded-[3rem] flex flex-col md:flex-row items-center gap-12">
               <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 text-[var(--accent-color)]">
                 <Zap size={48} fill="currentColor" />
               </div>
               <div className="flex-1 space-y-4 text-center md:text-left">
                  <h4 className="text-2xl font-black text-white tracking-tight">Melodix Neural Engine</h4>
                  <p className="text-sm text-zinc-500 max-w-xl">Our AI service works in the background to polish your library. It fixes broken titles, fetches HD art, and prepares synchronized lyrics without you lifting a finger.</p>
                  <button 
                    onClick={() => updateSetting('enableEnhancement', !settings.enableEnhancement)}
                    className={`px-10 py-4 rounded-2xl font-black text-xs transition-all ${settings.enableEnhancement ? 'bg-emerald-600 text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)]' : 'bg-white text-black'}`}
                  >
                    {settings.enableEnhancement ? 'ENHANCEMENT ACTIVE' : 'ENABLE ENGINE NOW'}
                  </button>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ToggleItem label="Auto-Fix Tags" description="Neural fixing of Title/Artist." value={settings.autoFixTags} field="autoFixTags" />
              <ToggleItem label="Auto-Fetch Lyrics" description="Sync lyrics on playback." value={settings.autoFetchLyrics} field="autoFetchLyrics" />
              <ToggleItem label="Update HD Covers" description="Replace missing/low-res art." value={settings.autoUpdateCover} field="autoUpdateCover" />
              <ToggleItem label="Show Status Icons" description="Display fix indicators in lists." value={settings.showStatusIcons} field="showStatusIcons" />
              <SelectItem 
                label="Task Schedule" 
                description="When to run heavy fixes." 
                value={settings.taskScheduling} 
                field="taskScheduling"
                options={[{ label: 'During Playback', value: 'playback' }, { label: 'When System Idle', value: 'idle' }, { label: 'Manual Only', value: 'manual' }]} 
              />
            </div>
          </div>
        </section>

        {/* Section 7: Advanced */}
        <section>
          <SectionHeader icon={Terminal} title="Advanced & Maintenance" id="advanced" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
              <h4 className="font-bold text-sm text-white flex items-center gap-2"><Database size={16}/> Neural Database (IndexedDB)</h4>
              <div className="grid grid-cols-2 gap-3">
                 <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-3">
                   <Download size={20} className="text-blue-500" /> Export Backup
                 </button>
                 <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-3">
                   <Upload size={20} className="text-emerald-500" /> Restore Backup
                 </button>
                 <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-3">
                   <Package size={20} className="text-amber-500" /> Compact DB
                 </button>
                 <button className="p-4 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-3 text-red-500">
                   <Trash2 size={20} /> Reset All
                 </button>
              </div>
            </div>
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
              <h4 className="font-bold text-sm text-white flex items-center gap-2"><Shield size={16}/> Cache Management</h4>
              <div className="space-y-3">
                 <button className="w-full flex justify-between items-center p-4 bg-black/20 hover:bg-black/40 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
                   <span>Clear Lyrics Cache</span>
                   <Trash2 size={14} className="text-zinc-600" />
                 </button>
                 <button className="w-full flex justify-between items-center p-4 bg-black/20 hover:bg-black/40 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
                   <span>Clear Cover Art Cache</span>
                   <Trash2 size={14} className="text-zinc-600" />
                 </button>
                 <button className="w-full flex justify-between items-center p-4 bg-black/20 hover:bg-black/40 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
                   <span>Reset Hardware Device Config</span>
                   <Trash2 size={14} className="text-zinc-600" />
                 </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: About */}
        <section>
          <SectionHeader icon={Info} title="Application Info" id="about" />
          <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[4rem] flex flex-col items-center text-center space-y-6">
             <div className="w-20 h-20 bg-[var(--accent-color)] rounded-[2rem] flex items-center justify-center accent-glow text-white">
               <Zap size={40} fill="currentColor" />
             </div>
             <div className="space-y-2">
               <h3 className="text-4xl font-black text-white tracking-tighter">Melodix v6.0.42</h3>
               <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.4em]">Engineered for high-fidelity</p>
             </div>
             <div className="flex gap-4">
               <button className="px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Check for Updates</button>
               <button className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-all">View Changelog</button>
             </div>
             <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.2em]">© 2025 MelodixLabs • Developed with Gemini Neural Processing</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SettingsView;
