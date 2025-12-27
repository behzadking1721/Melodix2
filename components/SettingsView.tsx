
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Palette, Cpu, Database, ShieldCheck, 
  Speaker, Globe, Zap, Puzzle, Cloud, Lock, 
  Terminal, Info, RotateCcw, Download, Upload,
  ChevronRight, Check, AlertCircle, Sparkles,
  Layers, Settings2, Sliders, Bell, Eye,
  Paintbrush, Pipette, Monitor, Headphones,
  Wind, Flame, Box, Trash2, Command, HelpCircle,
  // Fix: Added missing 'Activity' icon from lucide-react
  Activity
} from 'lucide-react';
import { AppSettings, AudioOutputMode, NavigationTab } from '../types';
import { THEME_PRESETS, ThemeManager } from '../services/themeManager';

const MotionDiv = motion.div as any;

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('audio');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- 1. CATEGORY DEFINITIONS ---
  const CATEGORIES = [
    { id: 'audio', label: 'Audio Engine', icon: Speaker, color: 'text-blue-500' },
    { id: 'library', label: 'Library Vault', icon: Database, color: 'text-emerald-500' },
    { id: 'ai', label: 'Neural Core', icon: BrainIcon, color: 'text-purple-500' },
    { id: 'ui', label: 'Atmosphere', icon: Palette, color: 'text-pink-500' },
    { id: 'sync', label: 'Cloud Sync', icon: Cloud, color: 'text-sky-500' },
    { id: 'privacy', label: 'Safety & Data', icon: Lock, color: 'text-rose-500' },
    { id: 'advanced', label: 'Internal Engine', icon: Terminal, color: 'text-amber-500' }
  ];

  // --- 2. SEARCH & DEEP LINK LOGIC ---
  const handleDeepLink = (id: string) => {
    const el = document.getElementById(`setting-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedId(id);
      setTimeout(() => setHighlightedId(null), 2000);
    }
  };

  // --- 3. UI HELPERS ---
  const SettingCard = ({ id, label, description, icon: Icon, children, disabled = false }: any) => (
    <div 
      id={`setting-${id}`}
      className={`p-6 bg-white/[0.02] border transition-all duration-500 rounded-[2.5rem] group ${
        highlightedId === id ? 'border-[var(--accent-color)] shadow-[0_0_30px_var(--accent-glow)]' : 'border-white/5'
      } ${disabled ? 'opacity-30 grayscale pointer-events-none' : 'hover:bg-white/[0.04]'}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl bg-white/5 text-zinc-500 group-hover:text-white transition-colors`}>
            <Icon size={18} />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">{label}</h4>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{description}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );

  const Toggle = ({ value, onChange, label }: any) => (
    <div className="flex items-center justify-between py-2">
       <span className="text-xs font-bold text-zinc-400">{label}</span>
       <button 
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-[var(--accent-color)] shadow-lg' : 'bg-zinc-800'}`}
       >
         <MotionDiv 
          animate={{ x: value ? 24 : 4 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white" 
         />
       </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-transparent font-sans overflow-hidden">
      
      {/* 1. TOP COMMAND BAR */}
      <header className="p-8 border-b border-white/5 flex items-center justify-between z-50 bg-black/20 backdrop-blur-3xl">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white/5 rounded-2xl text-[var(--accent-color)]">
            <Settings2 size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white tracking-tighter leading-none">Command Center</h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">System Configuration Matrix</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[var(--accent-color)] transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Query settings (e.g. 'reverb', 'cloud')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-[1.5rem] py-3.5 pl-14 pr-6 text-sm font-bold w-96 focus:outline-none focus:border-[var(--accent-color)]/20 transition-all placeholder:text-zinc-800 text-white"
            />
          </div>
          <button 
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            className="p-4 bg-[var(--accent-color)]/10 hover:bg-[var(--accent-color)]/20 text-[var(--accent-color)] rounded-2xl transition-all"
          >
            <Sparkles size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. NAVIGATION SIDEBAR */}
        <aside className="w-80 border-r border-white/5 p-8 space-y-2 hidden lg:block overflow-y-auto custom-scrollbar">
           <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-6 ml-4">Architecture</p>
           {CATEGORIES.map(cat => (
             <button 
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all group ${
                activeCategory === cat.id ? 'bg-white text-black shadow-2xl' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
              }`}
             >
               <div className="flex items-center gap-4">
                 <cat.icon size={18} className={activeCategory === cat.id ? 'text-black' : cat.color} />
                 <span className="text-xs font-black uppercase tracking-widest">{cat.label}</span>
               </div>
               {activeCategory === cat.id && <ChevronRight size={14} />}
             </button>
           ))}

           <div className="mt-20 space-y-4 pt-10 border-t border-white/5">
              <button className="w-full p-6 bg-white/[0.02] hover:bg-white/[0.04] rounded-3xl text-left transition-all group">
                 <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Last Export</h5>
                 <p className="text-xs font-bold text-white group-hover:text-[var(--accent-color)] transition-colors">Oct 24, 2025</p>
              </button>
              <button onClick={() => onUpdate({} as any)} className="w-full p-4 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
                 <RotateCcw size={14} className="inline mr-2" /> Reset All Vitals
              </button>
           </div>
        </aside>

        {/* 3. SETTINGS CANVAS */}
        <main 
          ref={containerRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-12 pb-60 space-y-24 scroll-smooth"
        >
          {/* --- SECTION: AUDIO --- */}
          <section id="cat-audio" className="space-y-10">
            <h3 className="text-4xl font-black text-white tracking-tighter flex items-center gap-6">
              <Speaker size={32} className="text-blue-500" /> Audio Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <SettingCard id="output" label="Hardware Hub" description="Physical device output routing" icon={Monitor}>
                  <select className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:outline-none">
                    <option>System Default Speakers</option>
                    <option>Realtek High Definition Audio</option>
                    <option>Focusrite Scarlett 2i2</option>
                  </select>
               </SettingCard>

               <SettingCard id="mode" label="Processing Mode" description="Latency vs Quality prioritization" icon={Zap}>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase">Bit-Perfect</button>
                    <button className="py-4 bg-white/5 text-zinc-500 rounded-2xl font-black text-[10px] uppercase border border-white/5">Low Latency</button>
                  </div>
               </SettingCard>

               <SettingCard id="dsp" label="Signal Enhancers" description="Dynamic range & normalization" icon={Activity}>
                  <div className="space-y-2">
                    <Toggle label="Volume Normalization" value={settings.autoNormalize} onChange={(v:any) => onUpdate({...settings, autoNormalize: v})} />
                    <Toggle label="Gapless Engine" value={settings.gaplessPlayback} onChange={(v:any) => onUpdate({...settings, gaplessPlayback: v})} />
                    <Toggle label="Limiter Guard" value={true} onChange={() => {}} />
                  </div>
               </SettingCard>
            </div>
          </section>

          {/* --- SECTION: AI --- */}
          <section id="cat-ai" className="space-y-10">
            <h3 className="text-4xl font-black text-white tracking-tighter flex items-center gap-6">
              <BrainIcon size={32} className="text-purple-500" /> Neural Integration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="col-span-full p-10 bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-[4rem] flex items-center gap-12">
                  <div className="p-6 bg-purple-600 rounded-[2.5rem] text-white shadow-2xl">
                    <Sparkles size={48} />
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-2xl font-black text-white">Melodix Cognitive Layer</h4>
                     <p className="text-sm text-zinc-500 max-w-xl">Our background neural service automatically organizes your life. It fixes broken filenames, downloads 4K covers, and generates synced lyrics.</p>
                     <button className="px-10 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">Enable Global Intelligence</button>
                  </div>
               </div>

               <SettingCard id="providers" label="Inference Providers" description="Select AI model priority" icon={Layers}>
                  <div className="space-y-3">
                     {['Gemini Pro 1.5', 'Musixmatch API', 'Local NLP Engine'].map((p, i) => (
                       <div key={p} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                          <span className="text-[10px] font-bold text-white uppercase">{p}</span>
                          <span className="text-[9px] font-black text-zinc-700 uppercase">{i === 0 ? 'Primary' : 'Backup'}</span>
                       </div>
                     ))}
                  </div>
               </SettingCard>
            </div>
          </section>

          {/* --- SECTION: ATMOSPHERE --- */}
          <section id="cat-ui" className="space-y-10">
            <h3 className="text-4xl font-black text-white tracking-tighter flex items-center gap-6">
              <Palette size={32} className="text-pink-500" /> Atmospheric UI
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <SettingCard id="themes" label="Core Theme" description="Base color palette" icon={Paintbrush}>
                  <div className="grid grid-cols-1 gap-2">
                    {THEME_PRESETS.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => ThemeManager.applyTheme(t)}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          settings.activeThemeId === t.id ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-500 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase">{t.name}</span>
                        {settings.activeThemeId === t.id && <Check size={14} />}
                      </button>
                    ))}
                  </div>
               </SettingCard>

               <SettingCard id="visuals" label="Acrylic Effects" description="Blur & transparency levels" icon={Eye}>
                  <div className="space-y-4">
                     <Toggle label="Enable Mica Blur" value={settings.enableBlur} onChange={(v:any) => onUpdate({...settings, enableBlur: v})} />
                     <Toggle label="High-FPS Motion" value={settings.enableAnimations} onChange={(v:any) => onUpdate({...settings, enableAnimations: v})} />
                  </div>
               </SettingCard>
            </div>
          </section>

        </main>

        {/* 4. AI ASSISTANT PANEL */}
        <AnimatePresence>
          {showAiAssistant && (
            <MotionDiv 
              initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
              className="w-96 border-l border-white/5 bg-black/40 backdrop-blur-3xl p-10 flex flex-col gap-10 z-[100]"
            >
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <Sparkles className="text-purple-500" />
                   <h4 className="text-sm font-black text-white uppercase">Neural Assistant</h4>
                 </div>
                 <button onClick={() => setShowAiAssistant(false)} className="text-zinc-600 hover:text-white transition-colors"><XIcon size={18}/></button>
              </div>

              <div className="space-y-6">
                 <div className="p-6 bg-purple-600/10 border border-purple-500/20 rounded-[2.5rem] space-y-4">
                    <p className="text-xs text-purple-200 leading-relaxed font-medium">I've noticed your library has 42 tracks with missing album art. Should I launch the <b>Neural Cover Fetcher</b> in the background?</p>
                    <button className="w-full py-3 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Apply Recommendation</button>
                 </div>

                 <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-[2.5rem] space-y-4 opacity-50">
                    <p className="text-xs text-blue-200 leading-relaxed font-medium">Listening profile: "Audiophile". I recommend switching to <b>WASAPI Exclusive</b> output for bit-perfect playback.</p>
                 </div>
              </div>

              <div className="mt-auto p-6 bg-white/5 rounded-3xl">
                 <div className="flex items-center gap-3 mb-2 text-zinc-500">
                    <HelpCircle size={14}/>
                    <span className="text-[9px] font-black uppercase tracking-widest">Diagnostics</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                    <span>Engine Stability</span>
                    <span className="text-emerald-500 font-black">99.8%</span>
                 </div>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>

      <footer className="p-6 border-t border-white/5 bg-black/40 flex items-center justify-between px-12">
         <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
           <Database size={14}/> Config Bundle: v6.0.42.0
         </div>
         <div className="flex gap-4">
            <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-all">Export Settings</button>
            <button className="px-6 py-2 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">Commit & Sync</button>
         </div>
      </footer>

    </div>
  );
};

const BrainIcon = (props: any) => <div {...props}><Zap size={20} fill="currentColor"/></div>;
const XIcon = (props: any) => <div {...props}><Check size={20}/></div>;

export default SettingsView;
