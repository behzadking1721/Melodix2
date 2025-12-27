
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Code2, Zap, Play, Save, 
  Trash2, Plus, TerminalSquare, AlertCircle,
  Command, Settings2, SlidersHorizontal,
  ChevronRight, Activity, Cpu, Database,
  Eye, Lock, Bug, RefreshCcw, Box, Layers
} from 'lucide-react';
import { scriptingEngine } from '../services/scriptingEngine';
import { MelodixScript, AutomationRule } from '../types';

const MotionDiv = motion.div as any;

const DeveloperView: React.FC = () => {
  const [scripts, setScripts] = useState<MelodixScript[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [activeTab, setActiveTab] = useState<'scripts' | 'rules' | 'logs'>('scripts');
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    const unsub = scriptingEngine.subscribe(() => {
      setScripts(scriptingEngine.getScripts());
      setRules(scriptingEngine.getRules());
    });
    setScripts(scriptingEngine.getScripts());
    setRules(scriptingEngine.getRules());
    return unsub;
  }, []);

  const activeScript = scripts.find(s => s.id === selectedScriptId);

  const handleSelectScript = (s: MelodixScript) => {
    setSelectedScriptId(s.id);
    setEditorContent(s.code);
  };

  const handleRun = () => {
    if (selectedScriptId) scriptingEngine.executeScript(selectedScriptId);
  };

  const handleSave = () => {
    if (activeScript) {
      scriptingEngine.saveScript({ ...activeScript, code: editorContent });
    }
  };

  return (
    <div className="h-full overflow-hidden flex flex-col bg-transparent p-12">
      
      {/* --- Header --- */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-zinc-800 rounded-[1.5rem] text-zinc-400 border border-white/5 accent-glow">
               <TerminalSquare size={32} />
             </div>
             <div>
               <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Developer Console</h2>
               <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Scripting Engine & Neural Automation</p>
             </div>
          </div>
        </div>
        
        <div className="flex gap-4">
           <button onClick={() => setActiveTab('scripts')} className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'scripts' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>Scripts</button>
           <button onClick={() => setActiveTab('rules')} className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'rules' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>Automation Rules</button>
           <button onClick={() => setActiveTab('logs')} className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-white text-black shadow-2xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>Runtime Logs</button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative flex gap-8">
        
        <AnimatePresence mode="wait">
          
          {/* --- SCRIPTS EDITOR VIEW --- */}
          {activeTab === 'scripts' && (
            <MotionDiv key="scripts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex gap-8 overflow-hidden">
               {/* Script List */}
               <div className="w-80 flex flex-col gap-4">
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                    {scripts.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => handleSelectScript(s)}
                        className={`p-5 rounded-[1.5rem] border cursor-pointer transition-all ${selectedScriptId === s.id ? 'bg-[var(--accent-color)] border-[var(--accent-color)] shadow-xl' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'}`}
                      >
                         <div className="flex items-center justify-between mb-2">
                           <Code2 size={16} className={selectedScriptId === s.id ? 'text-white' : 'text-zinc-500'} />
                           {s.status === 'running' && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                         </div>
                         <h5 className={`font-black text-xs uppercase tracking-widest ${selectedScriptId === s.id ? 'text-white' : 'text-zinc-300'}`}>{s.name}</h5>
                         <p className={`text-[9px] font-bold mt-1 ${selectedScriptId === s.id ? 'text-white/60' : 'text-zinc-600'}`}>{s.lastRun ? `Last run: ${new Date(s.lastRun).toLocaleTimeString()}` : 'Never executed'}</p>
                      </div>
                    ))}
                    <button className="w-full p-5 border-2 border-dashed border-white/5 rounded-[1.5rem] text-zinc-700 hover:text-zinc-400 hover:border-zinc-700 transition-all flex flex-col items-center justify-center gap-2">
                      <Plus size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">New Script</span>
                    </button>
                  </div>
               </div>

               {/* Editor Canvas */}
               <div className="flex-1 bg-black/40 border border-white/5 rounded-[3rem] overflow-hidden flex flex-col">
                  {selectedScriptId ? (
                    <>
                      <div className="p-6 border-b border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Editor:</span>
                            <h4 className="text-sm font-bold text-white tracking-tight">{activeScript?.name}.js</h4>
                         </div>
                         <div className="flex gap-3">
                            <button onClick={handleSave} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 transition-all"><Save size={16}/></button>
                            <button onClick={handleRun} className="px-6 py-2.5 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                               <Play size={14} fill="black" /> Run
                            </button>
                         </div>
                      </div>
                      <div className="flex-1 relative font-mono text-xs p-8 overflow-y-auto custom-scrollbar bg-black/20">
                         <div className="absolute left-0 top-0 w-12 h-full bg-black/40 border-r border-white/5 flex flex-col items-center py-8 text-zinc-800 select-none">
                            {Array.from({ length: 20 }).map((_, i) => <span key={i} className="leading-6 h-6">{i+1}</span>)}
                         </div>
                         <textarea 
                           value={editorContent}
                           onChange={(e) => setEditorContent(e.target.value)}
                           spellCheck={false}
                           className="w-full h-full bg-transparent border-none outline-none resize-none pl-12 leading-6 text-zinc-300 focus:text-white transition-colors"
                         />
                      </div>
                      <div className="p-4 bg-zinc-900 border-t border-white/5 flex items-center justify-between px-8">
                         <div className="flex items-center gap-6 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Box size={12}/> Sandbox Environment: v1.0.4</span>
                            <span className="flex items-center gap-1.5"><Lock size={12}/> Permissions: ui-access, player-control</span>
                         </div>
                         <Bug size={14} className="text-zinc-700" />
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-800 space-y-4">
                       <Code2 size={64} className="opacity-10" />
                       <p className="text-[11px] font-black uppercase tracking-[0.3em]">Select or create a script to begin</p>
                    </div>
                  )}
               </div>
            </MotionDiv>
          )}

          {/* --- AUTOMATION RULES VIEW --- */}
          {activeTab === 'rules' && (
            <MotionDiv key="rules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-6 pb-40">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {rules.map(rule => (
                    <div key={rule.id} className={`p-10 bg-white/[0.02] border rounded-[3rem] transition-all group ${rule.enabled ? 'border-white/10' : 'border-white/5 opacity-50 grayscale'}`}>
                       <div className="flex items-center justify-between mb-8">
                          <div className={`p-4 rounded-2xl ${rule.enabled ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-800 text-zinc-600'}`}>
                            <Zap size={24} />
                          </div>
                          <div 
                            onClick={() => scriptingEngine.toggleRule(rule.id)}
                            className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${rule.enabled ? 'bg-[var(--accent-color)]' : 'bg-zinc-800'}`}
                          >
                             <MotionDiv animate={{ x: rule.enabled ? 24 : 4 }} className="absolute top-1 w-4 h-4 rounded-full bg-white" />
                          </div>
                       </div>
                       
                       <div className="space-y-6">
                          <div className="space-y-1">
                             <h4 className="text-xl font-black text-white">{rule.name}</h4>
                             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                               <RefreshCcw size={10} /> Reactive Event Rule
                             </p>
                          </div>

                          <div className="grid grid-cols-1 gap-3 font-mono text-[10px]">
                             <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                <span className="text-zinc-600 uppercase tracking-widest block mb-1">Trigger:</span>
                                <span className="text-amber-500">{rule.trigger.replace('-', ' ')}</span>
                             </div>
                             <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                <span className="text-zinc-600 uppercase tracking-widest block mb-1">Condition:</span>
                                <span className="text-blue-400">if ({rule.condition})</span>
                             </div>
                             <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                <span className="text-zinc-600 uppercase tracking-widest block mb-1">Action:</span>
                                <span className="text-purple-400">{rule.action}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
                  
                  <div className="p-10 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6 group hover:border-zinc-700 transition-all cursor-pointer">
                     <Plus size={48} className="text-zinc-800 group-hover:text-zinc-400 transition-all" />
                     <div>
                       <h5 className="font-black text-white text-sm">Add New Rule</h5>
                       <p className="text-[10px] text-zinc-600 leading-tight">Combine triggers and actions into reactive behaviors.</p>
                     </div>
                  </div>
               </div>
            </MotionDiv>
          )}

          {/* --- RUNTIME LOGS VIEW --- */}
          {activeTab === 'logs' && (
            <MotionDiv key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 bg-black/60 border border-white/5 rounded-[3.5rem] overflow-hidden flex flex-col">
               <div className="p-6 border-b border-white/5 flex items-center justify-between px-10">
                  <div className="flex items-center gap-3">
                    <Activity className="text-emerald-500" size={18} />
                    <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Sandbox Execution Logs</h4>
                  </div>
                  <button className="text-[10px] font-black text-zinc-700 hover:text-white transition-colors">Clear Console</button>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar p-10 font-mono text-[11px] space-y-3">
                  <div className="text-zinc-600">[08:42:01] ENGINE: System Initialized. Sandbox ready.</div>
                  <div className="text-zinc-600">[08:42:05] SCRIPT: "Bass Optimizer" loaded.</div>
                  <div className="text-blue-400">[08:45:12] TRIGGER: Rule "Lyrics Recovery" evaluated to TRUE.</div>
                  <div className="text-purple-400">[08:45:12] ACTION: Invoked library.autoFixLyrics for ID: 0x4A22</div>
                  <div className="text-emerald-500">[08:45:13] SUCCESS: Task completed in 842ms.</div>
                  <div className="animate-pulse text-zinc-800 italic">_ Waiting for input...</div>
               </div>
               <div className="p-8 border-t border-white/5 bg-zinc-900/50 grid grid-cols-4 gap-8">
                  {[
                    { label: 'Active Handles', val: '4', icon: Command },
                    { label: 'Sandbox RAM', val: '12.4 MB', icon: Database },
                    { label: 'CPU Usage', val: '< 0.1%', icon: Activity },
                    { label: 'API Calls', val: '124 / min', icon: RefreshCcw }
                  ].map(stat => (
                    <div key={stat.label} className="space-y-1">
                      <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2"><stat.icon size={10}/> {stat.label}</p>
                      <p className="text-sm font-bold text-zinc-400">{stat.val}</p>
                    </div>
                  ))}
               </div>
            </MotionDiv>
          )}

        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="mt-8 flex items-center justify-between px-10">
         <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
           <Box size={14} className="text-amber-500" /> Virtualized Execution Active
         </div>
         <div className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
           <Layers size={14} className="text-blue-500" /> Middleware Stack: Verified Stable
         </div>
      </footer>

    </div>
  );
};

export default DeveloperView;
