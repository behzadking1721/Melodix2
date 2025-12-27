
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Keyboard, Search, Zap, Trash2, Plus, 
  RotateCcw, Save, Copy, Download, Upload,
  AlertTriangle, CheckCircle2, ChevronRight,
  Sparkles, MousePointer2, Command, Info,
  Cpu, Activity, Layers, Settings2, X,
  Play, SkipForward, SkipBack, Volume2,
  Maximize2, Mic2, Monitor, Terminal, Database
} from 'lucide-react';
import { KeyboardShortcut, ShortcutProfile } from '../types';

const MotionDiv = motion.div as any;

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  { id: 'play_pause', action: 'Toggle Play/Pause', category: 'playback', keys: ['Space'], isCustom: false },
  { id: 'next_track', action: 'Next Track', category: 'playback', keys: ['Control', 'ArrowRight'], isCustom: false },
  { id: 'prev_track', action: 'Previous Track', category: 'playback', keys: ['Control', 'ArrowLeft'], isCustom: false },
  { id: 'vol_up', action: 'Volume Up', category: 'playback', keys: ['ArrowUp'], isCustom: false },
  { id: 'vol_down', action: 'Volume Down', category: 'playback', keys: ['ArrowDown'], isCustom: false },
  { id: 'search', action: 'Global Search', category: 'ui', keys: ['Control', 'F'], isCustom: false },
  { id: 'mini_player', action: 'Toggle Mini Player', category: 'ui', keys: ['Control', 'M'], isCustom: false },
  { id: 'open_lab', action: 'Open Audio Lab', category: 'advanced', keys: ['Control', 'L'], isCustom: false },
];

const ShortcutSettingsView: React.FC = () => {
  const [profiles, setProfiles] = useState<ShortcutProfile[]>([
    { id: 'p-default', name: 'Master Default', shortcuts: DEFAULT_SHORTCUTS, isSystem: true },
    { id: 'p-dj', name: 'Performance Mode', shortcuts: [], isSystem: false },
  ]);
  const [activeProfileId, setActiveProfileId] = useState('p-default');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [tempKeys, setTempKeys] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'playback' | 'ui' | 'advanced'>('all');
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  const activeProfile = useMemo(() => 
    profiles.find(p => p.id === activeProfileId) || profiles[0]
  , [profiles, activeProfileId]);

  const filteredShortcuts = useMemo(() => {
    return activeProfile.shortcuts.filter(s => {
      const matchSearch = s.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.keys.join('+').toLowerCase().includes(searchQuery.toLowerCase());
      const matchTab = activeTab === 'all' || s.category === activeTab;
      return matchSearch && matchTab;
    });
  }, [activeProfile, searchQuery, activeTab]);

  // --- Key Capture Logic ---
  useEffect(() => {
    if (!isListening) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const key = e.key === ' ' ? 'Space' : e.key;
      
      // Prevent duplicates in current capture session
      setTempKeys(prev => {
        if (prev.includes(key)) return prev;
        return [...prev, key];
      });
    };

    const handleKeyUp = () => {
      // Logic: Commit shortcut after modifiers are released or max keys reached
      if (tempKeys.length > 0) {
        setIsListening(false);
        if (editingId) handleUpdateShortcut(editingId, tempKeys);
        setTempKeys([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening, tempKeys, editingId]);

  const handleUpdateShortcut = (id: string, keys: string[]) => {
    const updatedProfiles = profiles.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          shortcuts: p.shortcuts.map(s => s.id === id ? { ...s, keys, isCustom: true } : s)
        };
      }
      return p;
    });
    setProfiles(updatedProfiles);
    setEditingId(null);
  };

  const KeyCap = ({ k }: { k: string }) => (
    <div className="px-3 py-1.5 bg-zinc-800 border-b-4 border-black rounded-lg shadow-inner min-w-[32px] text-center">
      <span className="text-[10px] font-black text-white font-mono uppercase tracking-tighter">
        {k === 'Control' ? 'CTRL' : k === 'Shift' ? 'SHFT' : k}
      </span>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-transparent font-sans overflow-hidden p-12">
      
      {/* 1. HEADER & PROFILE SELECTOR */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-[var(--accent-color)] rounded-[1.5rem] text-white accent-glow">
               <Keyboard size={32} />
             </div>
             <div>
               <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Shortcut Architect</h2>
               <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Precision Keyboard Orchestration</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
              {profiles.map(p => (
                <button 
                  key={p.id}
                  onClick={() => setActiveProfileId(p.id)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeProfileId === p.id ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}
                >
                  {p.name}
                </button>
              ))}
           </div>
           <button className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all">
              <Plus size={20} />
           </button>
        </div>
      </header>

      {/* 2. SEARCH & AI TRIGGER */}
      <div className="flex items-center gap-6 mb-8">
        <div className="relative flex-1 group">
           <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[var(--accent-color)] transition-colors" />
           <input 
            type="text"
            placeholder="Search actions or key combinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-16 pr-8 text-sm font-bold focus:outline-none focus:border-[var(--accent-color)]/20 transition-all placeholder:text-zinc-800"
           />
        </div>
        <button 
          onClick={() => setShowAiAssistant(true)}
          className="px-8 py-5 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-all"
        >
          <Sparkles size={16} /> AI Optimization
        </button>
      </div>

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 flex gap-10 overflow-hidden">
        
        {/* Category Sidebar */}
        <aside className="w-64 flex flex-col gap-2 shrink-0">
           {['all', 'playback', 'ui', 'advanced'].map(cat => (
             <button 
              key={cat}
              onClick={() => setActiveTab(cat as any)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${activeTab === cat ? 'bg-white text-black shadow-2xl' : 'text-zinc-500 hover:bg-white/5'}`}
             >
               <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>
               {activeTab === cat && <ChevronRight size={14} />}
             </button>
           ))}
           
           <div className="mt-auto p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
              <div className="flex items-center gap-3 text-zinc-600">
                <Info size={14}/>
                <h5 className="text-[9px] font-black uppercase tracking-widest">Modifier Support</h5>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Supports Meta (Win), Alt, Shift, and Control chords up to 4 keys.</p>
           </div>
        </aside>

        {/* Shortcuts List */}
        <main className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3 pb-40">
           {filteredShortcuts.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-6">
                <Search size={80} />
                <p className="text-xl font-black uppercase tracking-[0.4em]">No matching shortcuts</p>
             </div>
           ) : (
             filteredShortcuts.map(s => (
               <div 
                key={s.id} 
                className={`p-6 bg-white/[0.02] border rounded-[2rem] transition-all flex items-center justify-between group ${editingId === s.id ? 'border-[var(--accent-color)] shadow-[0_0_30px_var(--accent-glow)]' : 'border-white/5 hover:bg-white/[0.04]'}`}
               >
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-black/20 rounded-2xl text-zinc-500 group-hover:text-white transition-colors">
                       {s.category === 'playback' ? <Play size={18}/> : s.category === 'ui' ? <Monitor size={18}/> : <Terminal size={18}/>}
                    </div>
                    <div>
                       <h4 className="text-sm font-black text-white uppercase tracking-tight">{s.action}</h4>
                       <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">{s.category} • {s.isCustom ? 'Customized' : 'System Default'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                     <div 
                      onClick={() => { setEditingId(s.id); setIsListening(true); setTempKeys([]); }}
                      className="flex gap-2 cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-all"
                     >
                        {editingId === s.id && isListening ? (
                          <div className="flex gap-2 items-center px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-lg animate-pulse">
                             <Activity size={14} className="text-blue-500" />
                             <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                               {tempKeys.length > 0 ? tempKeys.join(' + ') : 'Listening...'}
                             </span>
                          </div>
                        ) : (
                          s.keys.map((k, i) => <KeyCap key={i} k={k} />)
                        )}
                     </div>
                     <button className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                     </button>
                  </div>
               </div>
             ))
           )}
        </main>
      </div>

      {/* 4. AI ASSISTANT OVERLAY */}
      <AnimatePresence>
        {showAiAssistant && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-black/60 backdrop-blur-md">
             <MotionDiv 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-[4rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative"
             >
                <button onClick={() => setShowAiAssistant(false)} className="absolute top-10 right-10 text-zinc-600 hover:text-white"><X size={24}/></button>
                
                <div className="flex flex-col items-center text-center space-y-8">
                   <div className="p-8 bg-purple-600/10 rounded-[3rem] text-purple-500">
                      <Sparkles size={64} className="animate-pulse" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-3xl font-black text-white tracking-tighter">AI Layout Intelligence</h3>
                      <p className="text-sm text-zinc-500 max-w-sm mx-auto">Gemini has analyzed your listening habits and suggests the following workflow optimizations.</p>
                   </div>
                   
                   <div className="w-full space-y-4">
                      {[
                        { tip: 'Ergonomic Conflict', desc: 'Space and Ctrl+P are far apart for rapid toggling.', fix: 'Remap Play to Shift+Space' },
                        { tip: 'Missing Control', desc: 'You frequently adjust volume manually.', fix: 'Assign Alt+MouseScroll to Master Gain' },
                      ].map((item, i) => (
                        <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between text-left group">
                           <div>
                              <h5 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">{item.tip}</h5>
                              <p className="text-sm font-bold text-white">{item.desc}</p>
                           </div>
                           <button className="px-6 py-2 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">Apply Fix</button>
                        </div>
                      ))}
                   </div>

                   <button className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Apply All Neural Suggestions</button>
                </div>
             </MotionDiv>
          </div>
        )}
      </AnimatePresence>

      <footer className="p-8 border-t border-white/5 flex items-center justify-between px-10">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
              <Database size={14}/> Profile: Master_Backup_v1.0
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
              <Cpu size={14}/> Active Keys: {activeProfile.shortcuts.length}
            </div>
         </div>
         <div className="flex gap-4">
            <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-all flex items-center gap-2"><Upload size={14}/> Import Profile</button>
            <button className="px-6 py-2 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"><Save size={14}/> Commit Changes</button>
         </div>
      </footer>
    </div>
  );
};

export default ShortcutSettingsView;
