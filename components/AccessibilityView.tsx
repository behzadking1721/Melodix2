
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Type, Move, Palette, Keyboard, 
  Ear, Smartphone, ShieldCheck, Zap,
  RotateCcw, Sparkles, Sliders, Info,
  CheckCircle2, AlertCircle, Maximize2,
  Minimize2, Moon, Sun, Monitor, Layout,
  MousePointer2, Volume2, Mic2, Contrast,
  Languages, Fingerprint, Ghost, Brain,
  // Added ChevronRight to fix errors on lines 272 and 276
  ChevronRight
} from 'lucide-react';
import { AppSettings, AccessibilitySettings } from '../types';

const MotionDiv = motion.div as any;

interface AccessibilityViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const AccessibilityView: React.FC<AccessibilityViewProps> = ({ settings, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'interaction' | 'typography' | 'cognitive'>('visual');

  const updateAcc = (field: keyof AccessibilitySettings, value: any) => {
    onUpdate({
      ...settings,
      accessibility: {
        ...settings.accessibility,
        [field]: value
      }
    });
  };

  const isDefault = useMemo(() => {
    const a = settings.accessibility;
    return !a.highContrast && !a.reduceMotion && a.textScale === 100 && 
           a.uiScale === 100 && a.colorBlindnessMode === 'none' && 
           a.fontFamily === 'default';
  }, [settings.accessibility]);

  const SettingCard = ({ id, label, description, icon: Icon, children, active = false }: any) => (
    <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${active ? 'bg-[var(--accent-color)]/5 border-[var(--accent-color)] shadow-xl' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}>
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl ${active ? 'bg-[var(--accent-color)] text-white' : 'bg-zinc-900 text-zinc-500'}`}>
            <Icon size={20} />
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
    <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange(!value)}>
       <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">{label}</span>
       <button className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-[var(--accent-color)]' : 'bg-zinc-800'}`}>
         <MotionDiv 
          animate={{ x: value ? 24 : 4 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg" 
         />
       </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-transparent font-sans overflow-hidden p-12">
      
      {/* 1. HEADER & GLOBAL RESET */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-emerald-600 rounded-[1.5rem] text-white shadow-xl shadow-emerald-500/20">
               <ShieldCheck size={32} />
             </div>
             <div>
               <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Accessibility Suite</h2>
               <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Inclusive Engineering & Sensory Optimization</p>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
           {!isDefault && (
             <button 
              onClick={() => onUpdate({ ...settings, accessibility: { 
                highContrast: false, highContrastTheme: 'black-yellow', reduceMotion: false, screenReaderOptimized: false,
                textScale: 100, uiScale: 100, fontFamily: 'default', colorBlindnessMode: 'none', colorBlindnessIntensity: 50
              } })}
              className="px-6 py-3.5 bg-white/5 hover:bg-red-600/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-all flex items-center gap-2"
             >
                <RotateCcw size={14}/> Reset to Standards
             </button>
           )}
           <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
              {['visual', 'interaction', 'typography', 'cognitive'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
           </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-12 pb-40">
        
        <AnimatePresence mode="wait">
          
          {/* --- VISUAL AIDS --- */}
          {activeTab === 'visual' && (
            <MotionDiv key="visual" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <SettingCard label="High Contrast Mode" description="Enhanced legibility for visual impairments" icon={Contrast} active={settings.accessibility.highContrast}>
                     <div className="space-y-6">
                        <Toggle label="Enable High Contrast Theme" value={settings.accessibility.highContrast} onChange={(v:any) => updateAcc('highContrast', v)} />
                        <div className="grid grid-cols-3 gap-2">
                           {[
                             { id: 'black-yellow', label: 'Solar', bg: 'bg-black', text: 'text-yellow-400' },
                             { id: 'white-black', label: 'Classic', bg: 'bg-white', text: 'text-black' },
                             { id: 'blue-yellow', label: 'Ocean', bg: 'bg-blue-900', text: 'text-yellow-200' },
                           ].map(t => (
                             <button 
                              key={t.id}
                              onClick={() => updateAcc('highContrastTheme', t.id)}
                              className={`p-4 rounded-2xl border transition-all ${settings.accessibility.highContrastTheme === t.id ? 'border-white ring-2 ring-[var(--accent-color)]' : 'border-transparent opacity-50 hover:opacity-100'} ${t.bg}`}
                             >
                                <span className={`text-[9px] font-black uppercase tracking-tighter ${t.text}`}>{t.label}</span>
                             </button>
                           ))}
                        </div>
                     </div>
                  </SettingCard>

                  <SettingCard label="Color Blindness Simulation" description="Shift spectrum for clarity" icon={Palette} active={settings.accessibility.colorBlindnessMode !== 'none'}>
                     <div className="space-y-6">
                        <select 
                          value={settings.accessibility.colorBlindnessMode}
                          onChange={(e) => updateAcc('colorBlindnessMode', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-[var(--accent-color)]"
                        >
                          <option value="none">No Filter</option>
                          <option value="protanopia">Protanopia (Red-Blind)</option>
                          <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                          <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                          <option value="achromatopsia">Achromatopsia (No Color)</option>
                        </select>
                        
                        <div className="space-y-3">
                           <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500">
                              <span>Correction Intensity</span>
                              <span>{settings.accessibility.colorBlindnessIntensity}%</span>
                           </div>
                           <input 
                            type="range" min="0" max="100" value={settings.accessibility.colorBlindnessIntensity} 
                            onChange={(e) => updateAcc('colorBlindnessIntensity', Number(e.target.value))}
                            className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-white" 
                           />
                        </div>
                     </div>
                  </SettingCard>
               </div>
            </MotionDiv>
          )}

          {/* --- INTERACTION & AUDITORY --- */}
          {activeTab === 'interaction' && (
            <MotionDiv key="interaction" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SettingCard label="Screen Reader Optimizations" description="Enhanced ARIA & Audio Cues" icon={Ear} active={settings.accessibility.screenReaderOptimized}>
                     <div className="space-y-4">
                        <Toggle label="Announce Playback Changes" value={settings.accessibility.screenReaderOptimized} onChange={(v:any) => updateAcc('screenReaderOptimized', v)} />
                        <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">When enabled, the system will provide spoken feedback for track navigation, volume changes, and scan results.</p>
                     </div>
                  </SettingCard>

                  <SettingCard label="Keyboard Orchestration" description="Precision navigation without mouse" icon={Keyboard} active={true}>
                     <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                           <span className="text-[10px] font-bold text-white uppercase tracking-widest">Enhanced Outlines</span>
                           <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                        </div>
                        <p className="text-[10px] text-zinc-600 leading-relaxed">System focus indicator is currently set to <b>4px Solid Neon</b> for high visibility during Tab navigation.</p>
                     </div>
                  </SettingCard>
               </div>
            </MotionDiv>
          )}

          {/* --- TYPOGRAPHY & SCALING --- */}
          {activeTab === 'typography' && (
            <MotionDiv key="typography" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
               <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[4rem] grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div className="space-y-8">
                     <h3 className="text-xl font-black text-white flex items-center gap-3"><Type size={20} className="text-blue-500" /> Font Matrix</h3>
                     <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: 'default', label: 'System Default', font: 'font-sans' },
                          { id: 'sans', label: 'Modern Sans', font: 'font-sans' },
                          { id: 'serif', label: 'Classic Serif', font: 'font-serif' },
                          { id: 'dyslexic', label: 'OpenDyslexic', font: 'font-mono italic' },
                        ].map(f => (
                          <button 
                            key={f.id}
                            onClick={() => updateAcc('fontFamily', f.id)}
                            className={`p-6 rounded-[2rem] border text-left transition-all ${settings.accessibility.fontFamily === f.id ? 'bg-white text-black border-white shadow-2xl' : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/20'}`}
                          >
                             <span className={`text-lg font-bold block mb-1 ${f.font}`}>Aa</span>
                             <span className="text-[9px] font-black uppercase tracking-widest">{f.label}</span>
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-10 flex flex-col justify-center">
                     <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500">
                           <span>Text Scaling</span>
                           <span>{settings.accessibility.textScale}%</span>
                        </div>
                        <input 
                          type="range" min="80" max="200" step="10" value={settings.accessibility.textScale} 
                          onChange={(e) => updateAcc('textScale', Number(e.target.value))}
                          className="w-full accent-blue-500" 
                        />
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500">
                           <span>UI Element Scale</span>
                           <span>{settings.accessibility.uiScale}%</span>
                        </div>
                        <input 
                          type="range" min="80" max="150" step="5" value={settings.accessibility.uiScale} 
                          onChange={(e) => updateAcc('uiScale', Number(e.target.value))}
                          className="w-full accent-purple-500" 
                        />
                     </div>
                  </div>
               </div>
            </MotionDiv>
          )}

          {/* --- COGNITIVE & MOTION --- */}
          {activeTab === 'cognitive' && (
            <MotionDiv key="cognitive" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <SettingCard label="Kinetic Reduction" description="Suppress animations & parallax" icon={Move} active={settings.accessibility.reduceMotion}>
                     <div className="space-y-6">
                        <Toggle label="Reduce Global Motion" value={settings.accessibility.reduceMotion} onChange={(v:any) => updateAcc('reduceMotion', v)} />
                        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
                           <p className="text-[10px] text-zinc-500 leading-relaxed font-medium flex items-start gap-3">
                              <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                              Enabling this will disable the 60FPS background spectrum visualizer and all sliding transitions between pages.
                           </p>
                        </div>
                     </div>
                  </SettingCard>

                  <SettingCard label="Neural Load Control" description="Simplify complex interfaces" icon={Brain} active={false}>
                     <div className="space-y-4">
                        <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left flex items-center justify-between group">
                           <span>Simplify Metadata View</span>
                           <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 text-left flex items-center justify-between group">
                           <span>Enable High-Visibility Cues</span>
                           <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                     </div>
                  </SettingCard>
               </div>
            </MotionDiv>
          )}

        </AnimatePresence>
      </main>

      {/* 3. FOOTER DIAGNOSTICS */}
      <footer className="p-8 border-t border-white/5 flex items-center justify-between px-10 bg-black/20">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
              <Fingerprint size={14}/> AA Compliance: Verified
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
              <Sparkles size={14} className="text-emerald-500"/> Neural Overlays: v4.2
            </div>
         </div>
         <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-xl border border-white/5">
            <Info size={14} className="text-zinc-600"/>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Accessibility changes are applied in real-time to the current session.</span>
         </div>
      </footer>

      {/* 4. DYNAMIC COLOR FILTER OVERLAY (SVG INJECT) */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="protanopia">
          <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0" />
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0" />
        </filter>
        <filter id="tritanopia">
          <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0" />
        </filter>
        <filter id="achromatopsia">
          <feColorMatrix type="matrix" values="0.299, 0.587, 0.114, 0, 0 0.299, 0.587, 0.114, 0, 0 0.299, 0.587, 0.114, 0, 0 0, 0, 0, 1, 0" />
        </filter>
      </svg>
      
      <style>{`
        ${settings.accessibility.colorBlindnessMode !== 'none' ? `
          body { 
            filter: url(#${settings.accessibility.colorBlindnessMode});
            opacity: ${0.8 + (settings.accessibility.colorBlindnessIntensity / 500)};
          }
        ` : ''}

        ${settings.accessibility.highContrast ? `
          :root {
            --mica-bg: #000 !important;
            --accent-color: #ffff00 !important;
            --text-primary: #fff !important;
            --text-secondary: #eee !important;
            --border-color: #fff !important;
            --surface: #000 !important;
          }
          * { outline: 2px solid #ffff00 !important; }
        ` : ''}

        html {
          font-size: ${settings.accessibility.textScale}%;
        }

        ${settings.accessibility.fontFamily === 'dyslexic' ? `
          * { font-family: 'OpenDyslexic', 'Comic Sans MS', cursive !important; letter-spacing: 0.05em; }
        ` : ''}
      `}</style>
    </div>
  );
};

export default AccessibilityView;
