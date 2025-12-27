
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Sparkles, Search, Heart, 
  Wind, Zap, Shield, Database, 
  ChevronUp, ChevronDown, Activity, 
  Sliders, Globe, Lock, SlidersHorizontal,
  Dna, Fingerprint, Layers, BarChart3,
  Network, Save, RefreshCcw, Info
} from 'lucide-react';
import { AppSettings, AISettings } from '../types';

const MotionDiv = motion.div as any;

interface AISettingsViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const AISettingsView: React.FC<AISettingsViewProps> = ({ settings, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'core' | 'providers' | 'privacy'>('core');

  const updateAI = (path: string, value: any) => {
    const keys = path.split('.');
    const newAI = { ...settings.ai };
    let current: any = newAI;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    onUpdate({ ...settings, ai: newAI });
  };

  const Toggle = ({ label, description, value, onToggle }: { label: string, description: string, value: boolean, onToggle: () => void }) => (
    <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all cursor-pointer group" onClick={onToggle}>
      <div className="space-y-1">
        <p className="font-bold text-sm text-white group-hover:text-[var(--accent-color)] transition-colors">{label}</p>
        <p className="text-[10px] text-zinc-500 max-w-xs">{description}</p>
      </div>
      <div className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-[var(--accent-color)]' : 'bg-zinc-800'}`}>
        <MotionDiv animate={{ x: value ? 24 : 4 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg" />
      </div>
    </div>
  );

  const Slider = ({ label, value, min, max, onChange, unit = '%' }: { label: string, value: number, min: number, max: number, onChange: (v: number) => void, unit?: string }) => (
    <div className="space-y-3 p-2">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
        <span>{label}</span>
        <span className="text-[var(--accent-color)]">{value}{unit}</span>
      </div>
      <input 
        type="range" min={min} max={max} value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[var(--accent-color)]"
      />
    </div>
  );

  return (
    <div className="h-full overflow-hidden flex flex-col bg-transparent p-12">
      
      {/* --- Header --- */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-[var(--accent-color)] rounded-[1.5rem] text-white accent-glow">
               <Brain size={32} />
             </div>
             <div>
               <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Neural Settings</h2>
               <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">AI Optimization & Provider Stack</p>
             </div>
          </div>
        </div>
        
        <div className="flex gap-4">
           <button onClick={() => setActiveTab('core')} className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'core' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>Core Engine</button>
           <button onClick={() => setActiveTab('providers')} className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'providers' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>Providers</button>
           <button onClick={() => setActiveTab('privacy')} className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'privacy' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>Privacy</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-12 pb-40">
        <AnimatePresence mode="wait">
          
          {/* --- CORE ENGINE VIEW --- */}
          {activeTab === 'core' && (
            <MotionDiv key="core" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
              
              {/* Smart Search AI */}
              <section className="space-y-8">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <Search size={20} className="text-blue-500" /> Smart Search Neural
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-4">
                     <Toggle label="Enable Neural Search" description="Use AI for deep metadata indexing." value={settings.ai.smartSearch.enabled} onToggle={() => updateAI('smartSearch.enabled', !settings.ai.smartSearch.enabled)} />
                     <Toggle label="Fuzzy Matching" description="Find results even with typos or partial names." value={settings.ai.smartSearch.fuzzyMatching} onToggle={() => updateAI('smartSearch.fuzzyMatching', !settings.ai.smartSearch.fuzzyMatching)} />
                     <Toggle label="Semantic Search" description="Search by concept (e.g. 'Chill summer tracks')." value={settings.ai.smartSearch.semanticSearch} onToggle={() => updateAI('smartSearch.semanticSearch', !settings.ai.smartSearch.semanticSearch)} />
                   </div>
                   <div className="p-8 bg-black/40 border border-white/5 rounded-[3rem] space-y-6">
                      <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Inference Weights</h4>
                      <Slider label="Title Priority" value={settings.ai.smartSearch.weights.title} min={0} max={100} onChange={(v) => updateAI('smartSearch.weights.title', v)} />
                      <Slider label="Artist Priority" value={settings.ai.smartSearch.weights.artist} min={0} max={100} onChange={(v) => updateAI('smartSearch.weights.artist', v)} />
                      <Slider label="Genre Priority" value={settings.ai.smartSearch.weights.genre} min={0} max={100} onChange={(v) => updateAI('smartSearch.weights.genre', v)} />
                   </div>
                </div>
              </section>

              {/* Recommendation AI */}
              <section className="space-y-8">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <Sparkles size={20} className="text-purple-500" /> Recommendation DNA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-4">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Similarity Logic</p>
                    <div className="space-y-2">
                       <Toggle label="Use History" description="" value={settings.ai.recommendation.useHistory} onToggle={() => updateAI('recommendation.useHistory', !settings.ai.recommendation.useHistory)} />
                       <Toggle label="Use Mood" description="" value={settings.ai.recommendation.useMood} onToggle={() => updateAI('recommendation.useMood', !settings.ai.recommendation.useMood)} />
                    </div>
                  </div>
                  <div className="col-span-2 p-8 bg-black/40 border border-white/5 rounded-[3rem] grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-8">
                       <Slider label="Recommendation Strength" value={settings.ai.recommendation.strength} min={0} max={100} onChange={(v) => updateAI('recommendation.strength', v)} />
                       <Slider label="Similarity Threshold" value={settings.ai.recommendation.threshold} min={0} max={100} onChange={(v) => updateAI('recommendation.threshold', v)} />
                     </div>
                     <div className="space-y-8">
                       <Slider label="Diversity Level" value={settings.ai.recommendation.diversity} min={0} max={100} onChange={(v) => updateAI('recommendation.diversity', v)} />
                       <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                          <p className="text-[9px] text-zinc-500 font-bold uppercase leading-tight">High diversity introduces more new artists to your daily mixes.</p>
                       </div>
                     </div>
                  </div>
                </div>
              </section>

              {/* Mood Analysis */}
              <section className="space-y-8">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <Wind size={20} className="text-emerald-500" /> Mood Detection AI
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <Toggle label="Analyze Audio Waveform" description="Detect energy and BPM for mood calculation." value={settings.ai.moodDetection.analyzeWaveform} onToggle={() => updateAI('moodDetection.analyzeWaveform', !settings.ai.moodDetection.analyzeWaveform)} />
                      <Toggle label="Analyze Lyrics Sentiment" description="Use NLP to determine emotional tone." value={settings.ai.moodDetection.analyzeLyrics} onToggle={() => updateAI('moodDetection.analyzeLyrics', !settings.ai.moodDetection.analyzeLyrics)} />
                   </div>
                   <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem]">
                      <div className="flex items-center gap-4 mb-6">
                        <Activity className="text-emerald-500" size={18} />
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Active Categories</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {settings.ai.moodDetection.categories.map(c => (
                          <span key={c} className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest">{c}</span>
                        ))}
                        <button className="px-4 py-2 bg-white/5 text-zinc-500 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">+ Add</button>
                      </div>
                   </div>
                </div>
              </section>
            </MotionDiv>
          )}

          {/* --- PROVIDERS VIEW --- */}
          {activeTab === 'providers' && (
            <MotionDiv key="providers" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
               <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                      <Layers size={20} className="text-amber-500" /> Neural Provider Stack
                    </h3>
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                       <RefreshCcw size={12} /> Ping All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {/* Category: Lyrics */}
                     <div className="p-8 bg-black/40 border border-white/5 rounded-[3rem] space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Lyrics Logic</p>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="space-y-3">
                           {settings.ai.providerPriority.lyrics.map((p, i) => (
                             <div key={p} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl group">
                                <div className="flex items-center gap-3">
                                   <span className="text-[10px] font-black text-zinc-700">{i+1}</span>
                                   <span className="text-xs font-bold text-white uppercase tracking-tight">{p}</span>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button className="p-1 text-zinc-600 hover:text-white"><ChevronUp size={14}/></button>
                                   <button className="p-1 text-zinc-600 hover:text-white"><ChevronDown size={14}/></button>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>

                     {/* Category: Tags */}
                     <div className="p-8 bg-black/40 border border-white/5 rounded-[3rem] space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Metadata Tags</p>
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <div className="space-y-3">
                           {settings.ai.providerPriority.tags.map((p, i) => (
                             <div key={p} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl group">
                                <div className="flex items-center gap-3">
                                   <span className="text-[10px] font-black text-zinc-700">{i+1}</span>
                                   <span className="text-xs font-bold text-white uppercase tracking-tight">{p}</span>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button className="p-1 text-zinc-600 hover:text-white"><ChevronUp size={14}/></button>
                                   <button className="p-1 text-zinc-600 hover:text-white"><ChevronDown size={14}/></button>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>

                     {/* Category: Covers */}
                     <div className="p-8 bg-black/40 border border-white/5 rounded-[3rem] space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Cover Art</p>
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                        </div>
                        <div className="space-y-3">
                           {settings.ai.providerPriority.covers.map((p, i) => (
                             <div key={p} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl group">
                                <div className="flex items-center gap-3">
                                   <span className="text-[10px] font-black text-zinc-700">{i+1}</span>
                                   <span className="text-xs font-bold text-white uppercase tracking-tight">{p}</span>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button className="p-1 text-zinc-600 hover:text-white"><ChevronUp size={14}/></button>
                                   <button className="p-1 text-zinc-600 hover:text-white"><ChevronDown size={14}/></button>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </section>
            </MotionDiv>
          )}

          {/* --- PRIVACY VIEW --- */}
          {activeTab === 'privacy' && (
            <MotionDiv key="privacy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
               <section className="space-y-8">
                  <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <Shield size={20} className="text-rose-500" /> AI Privacy & Data
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <Toggle label="Local Inference Only" description="Disable all cloud-based AI processing." value={settings.ai.privacy.localInferenceOnly} onToggle={() => updateAI('privacy.localInferenceOnly', !settings.ai.privacy.localInferenceOnly)} />
                       <Toggle label="Anonymous Usage Data" description="Help Melodix improve the Neural Core." value={settings.ai.privacy.anonymousUsageData} onToggle={() => updateAI('privacy.anonymousUsageData', !settings.ai.privacy.anonymousUsageData)} />
                       <Toggle label="Neural Cloud Sync" description="Sync your AI preferences across devices." value={settings.ai.privacy.cloudSyncEnabled} onToggle={() => updateAI('privacy.cloudSyncEnabled', !settings.ai.privacy.cloudSyncEnabled)} />
                    </div>
                    <div className="p-10 bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/20 rounded-[3.5rem] flex items-center gap-8">
                       <div className="p-6 bg-[var(--accent-color)]/10 rounded-[2rem] text-[var(--accent-color)]">
                          <Lock size={40} />
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-lg font-black text-white">Your data stays with you.</h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">Melodix AI models are designed to work offline whenever possible. Your metadata analysis never leaves this machine unless cloud providers are explicitly chosen.</p>
                       </div>
                    </div>
                  </div>
               </section>
            </MotionDiv>
          )}

        </AnimatePresence>
      </main>

      <footer className="mt-8 flex items-center justify-between px-10">
         <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
           <Network size={14} className="text-emerald-500" /> Connection: Verified Stable
         </div>
         <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
           <Brain size={14} className="text-blue-500" /> Neural Core v6.0.42 Active
         </div>
      </footer>

    </div>
  );
};

export default AISettingsView;
