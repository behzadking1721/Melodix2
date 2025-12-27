
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, X, Plus, Trash2, ChevronRight, 
  Settings2, Database, Zap, Filter, Save,
  Layers, Info, AlertCircle, RefreshCw,
  Search, ListMusic
} from 'lucide-react';
import { 
  Song, SmartRuleGroup, SmartRule, 
  ConditionOperator, FilterField, Playlist 
} from '../types';
import { SmartPlaylistEngine } from '../services/smartPlaylistEngine';

const MotionDiv = motion.div as any;

interface SmartPlaylistBuilderProps {
  library: Song[];
  onClose: () => void;
  onSave: (playlist: Playlist) => void;
  initialPlaylist?: Playlist;
}

const FIELDS: { id: FilterField, label: string, type: 'string' | 'number' | 'boolean' }[] = [
  { id: 'title', label: 'Track Title', type: 'string' },
  { id: 'artist', label: 'Artist Name', type: 'string' },
  { id: 'album', label: 'Album Title', type: 'string' },
  { id: 'genre', label: 'Genre', type: 'string' },
  { id: 'year', label: 'Release Year', type: 'number' },
  { id: 'playCount', label: 'Play Count', type: 'number' },
  { id: 'duration', label: 'Duration (sec)', type: 'number' },
  { id: 'hasLyrics', label: 'Has Lyrics', type: 'boolean' }
];

const OPERATORS: { id: ConditionOperator, label: string }[] = [
  { id: 'is', label: 'is exactly' },
  { id: 'is-not', label: 'is not' },
  { id: 'contains', label: 'contains' },
  { id: 'not-contains', label: 'does not contain' },
  { id: 'greater', label: 'is greater than' },
  { id: 'less', label: 'is less than' },
  { id: 'starts', label: 'starts with' },
  { id: 'ends', label: 'ends with' }
];

const SmartPlaylistBuilder: React.FC<SmartPlaylistBuilderProps> = ({ library, onClose, onSave, initialPlaylist }) => {
  const [name, setName] = useState(initialPlaylist?.name || '');
  const [rules, setRules] = useState<SmartRuleGroup>(
    initialPlaylist?.smartRules || SmartPlaylistEngine.generateEmptyGroup()
  );

  const matchedSongs = useMemo(() => {
    return SmartPlaylistEngine.filterLibrary(library, rules);
  }, [library, rules]);

  const addRule = (parentId: string) => {
    const newRule: SmartRule = {
      id: Math.random().toString(36).substr(2, 9),
      field: 'title',
      operator: 'contains',
      value: ''
    };
    
    const updated = { ...rules };
    const findAndAdd = (group: SmartRuleGroup) => {
      if (group.id === parentId) {
        group.rules.push(newRule);
        return true;
      }
      for (const r of group.rules) {
        if ('rules' in r && findAndAdd(r)) return true;
      }
      return false;
    };
    
    findAndAdd(updated);
    setRules(updated);
  };

  const removeRule = (ruleId: string) => {
    const updated = { ...rules };
    const findAndRemove = (group: SmartRuleGroup) => {
      const idx = group.rules.findIndex(r => r.id === ruleId);
      if (idx > -1) {
        group.rules.splice(idx, 1);
        return true;
      }
      for (const r of group.rules) {
        if ('rules' in r && findAndRemove(r)) return true;
      }
      return false;
    };
    findAndRemove(updated);
    setRules(updated);
  };

  const updateRule = (ruleId: string, updates: Partial<SmartRule>) => {
    const updated = { ...rules };
    const findAndUpdate = (group: SmartRuleGroup) => {
      const r = group.rules.find(r => r.id === ruleId);
      if (r && !('rules' in r)) {
        Object.assign(r, updates);
        return true;
      }
      for (const grp of group.rules) {
        if ('rules' in grp && findAndUpdate(grp)) return true;
      }
      return false;
    };
    findAndUpdate(updated);
    setRules(updated);
  };

  const handleSave = () => {
    if (!name || matchedSongs.length === 0) return;
    const playlist: Playlist = {
      id: initialPlaylist?.id || Math.random().toString(36).substr(2, 9),
      name,
      songIds: matchedSongs.map(s => s.id),
      isSmart: true,
      smartRules: rules,
      dateCreated: initialPlaylist?.dateCreated || Date.now(),
      lastModified: Date.now(),
      coverUrl: matchedSongs[0]?.coverUrl
    };
    onSave(playlist);
    onClose();
  };

  const RuleRow = ({ rule }: { rule: SmartRule }) => (
    <MotionDiv 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-wrap items-center gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-2xl group"
    >
      <select 
        value={rule.field} 
        onChange={(e) => updateRule(rule.id, { field: e.target.value as FilterField })}
        className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[var(--accent-color)]"
      >
        {FIELDS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
      </select>

      <select 
        value={rule.operator} 
        onChange={(e) => updateRule(rule.id, { operator: e.target.value as ConditionOperator })}
        className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-400 focus:outline-none focus:border-[var(--accent-color)]"
      >
        {OPERATORS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>

      <input 
        type="text"
        placeholder="Value..."
        value={String(rule.value)}
        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
        className="flex-1 min-w-[120px] bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[var(--accent-color)]"
      />

      <button onClick={() => removeRule(rule.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
        <Trash2 size={14} />
      </button>
    </MotionDiv>
  );

  const GroupView = ({ group, isRoot = false }: { group: SmartRuleGroup, isRoot?: boolean }) => (
    <div className={`space-y-4 ${!isRoot ? 'pl-8 border-l border-white/5 mt-4' : ''}`}>
      <div className="flex items-center justify-between bg-white/[0.02] p-3 rounded-2xl border border-white/5">
         <div className="flex items-center gap-3">
           <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Logic:</span>
           <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
              <button 
                onClick={() => {
                  const updated = { ...rules };
                  const findAndSet = (g: SmartRuleGroup) => {
                    if (g.id === group.id) { g.logic = 'and'; return true; }
                    for (const r of g.rules) if ('rules' in r && findAndSet(r)) return true;
                    return false;
                  };
                  findAndSet(updated);
                  setRules(updated);
                }}
                className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${group.logic === 'and' ? 'bg-[var(--accent-color)] text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              >AND</button>
              <button 
                onClick={() => {
                   const updated = { ...rules };
                   const findAndSet = (g: SmartRuleGroup) => {
                     if (g.id === group.id) { g.logic = 'or'; return true; }
                     for (const r of g.rules) if ('rules' in r && findAndSet(r)) return true;
                     return false;
                   };
                   findAndSet(updated);
                   setRules(updated);
                }}
                className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${group.logic === 'or' ? 'bg-[var(--accent-color)] text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              >OR</button>
           </div>
         </div>
         <button onClick={() => addRule(group.id)} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
            <Plus size={12}/> Add Rule
         </button>
      </div>

      <div className="space-y-3">
         <AnimatePresence mode="popLayout">
           {group.rules.map(item => (
             'rules' in item ? <GroupView key={item.id} group={item} /> : <RuleRow key={item.id} rule={item} />
           ))}
         </AnimatePresence>
         {group.rules.length === 0 && (
           <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-[2rem] text-zinc-700">
              <Filter size={24} className="mx-auto mb-2 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">No rules defined in this group</p>
           </div>
         )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 lg:p-12 overflow-hidden">
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      
      <MotionDiv 
        initial={{ scale: 0.95, opacity: 0, y: 40 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-5xl h-[85vh] bg-[#0c0c0c] border border-white/10 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <header className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-purple-600 rounded-[1.5rem] text-white shadow-xl shadow-purple-600/20">
              <Sparkles size={28} />
            </div>
            <div className="space-y-1">
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Smart Playlist Name..."
                className="bg-transparent border-none text-3xl font-black text-white focus:outline-none tracking-tighter placeholder:text-zinc-800 w-[400px]"
              />
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Neural Rule Orchestrator</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 text-zinc-500 hover:text-white transition-all"><X size={24}/></button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          
          {/* Builder Canvas */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-12 space-y-12">
             <section className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.5em] flex items-center gap-3 px-2">
                     <Layers size={14} /> Logic Hierarchy
                   </h3>
                </div>
                <GroupView group={rules} isRoot={true} />
             </section>

             {/* Tips Section */}
             <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-[2.5rem] flex items-start gap-6">
                <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl">
                   <Info size={18} />
                </div>
                <div className="space-y-1">
                   <h5 className="text-[11px] font-black text-blue-400 uppercase">Pro Tip</h5>
                   <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Use 'contains' for fuzzy metadata matching. Smart playlists update in real-time as your library evolves or as AI background tasks complete metadata fixes.</p>
                </div>
             </div>
          </div>

          {/* Live Preview Sidebar */}
          <aside className="w-80 border-l border-white/5 bg-black/40 p-10 flex flex-col gap-10">
             <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Evaluation</p>
                <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] text-center space-y-2">
                   <h4 className="text-5xl font-black text-white">{matchedSongs.length}</h4>
                   <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Matched Assets</p>
                </div>
             </div>

             <div className="flex-1 overflow-hidden flex flex-col gap-4">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Sample Matches</p>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                   {matchedSongs.slice(0, 8).map(s => (
                     <div key={s.id} className="flex items-center gap-3 p-2 bg-white/[0.01] rounded-xl border border-white/5">
                        <img src={s.coverUrl} className="w-8 h-8 rounded-lg object-cover" alt=""/>
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold text-white truncate">{s.title}</p>
                           <p className="text-[8px] font-bold text-zinc-600 truncate uppercase">{s.artist}</p>
                        </div>
                     </div>
                   ))}
                   {matchedSongs.length > 8 && <p className="text-center text-[8px] font-black text-zinc-700 uppercase pt-2">+{matchedSongs.length - 8} more</p>}
                   {matchedSongs.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center text-zinc-800 space-y-2">
                        <Search size={32} className="opacity-20"/>
                        <p className="text-[8px] font-black uppercase">No tracks match rules</p>
                     </div>
                   )}
                </div>
             </div>

             <button 
              onClick={handleSave}
              disabled={matchedSongs.length === 0 || !name}
              className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-20 disabled:grayscale"
             >
                <Save size={18}/>
                {initialPlaylist ? 'Update Smart List' : 'Create Smart List'}
             </button>
          </aside>
        </div>
      </MotionDiv>
    </div>
  );
};

export default SmartPlaylistBuilder;
