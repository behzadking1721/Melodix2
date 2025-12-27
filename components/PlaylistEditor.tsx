
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  X, Save, Sparkles, Wand2, ListOrdered, 
  Trash2, Plus, ArrowRight, Music, Clock, 
  LayoutGrid, Globe, AlertTriangle, CheckCircle2, 
  GripVertical, Hash, RefreshCw, Layers2,
  ListFilter, Copy, Download, Share2, Undo2,
  Redo2, Filter, Shuffle, BarChart3, PieChart,
  Zap, Flame, Wind, Activity, MoreHorizontal,
  FileJson, FileText, Eraser, Settings2, Target
} from 'lucide-react';
import { Song, Playlist, SmartRuleGroup } from '../types';
import { SmartPlaylistEngine } from '../services/smartPlaylistEngine';
import { generateSmartPlaylist } from '../services/geminiService';

const MotionDiv = motion.div as any;

interface PlaylistEditorProps {
  playlist: Playlist;
  library: Song[];
  onClose: () => void;
  onSave: (updatedPlaylist: Playlist) => void;
}

type EditorTab = 'editor' | 'smart' | 'ai' | 'stats';

const PlaylistEditor: React.FC<PlaylistEditorProps> = ({ playlist, library, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<EditorTab>(playlist.isSmart ? 'smart' : 'editor');
  const [songIds, setSongIds] = useState<string[]>(playlist.songIds);
  const [undoStack, setUndoStack] = useState<string[][]>([]);
  const [redoStack, setRedoStack] = useState<string[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // AI Builder State
  const [aiConfig, setAiConfig] = useState({
    mood: 'Energetic',
    targetDuration: 60, // minutes
    diversity: 50,
    genre: 'All'
  });

  const currentSongs = useMemo(() => 
    songIds.map(id => library.find(s => s.id === id)).filter((s): s is Song => !!s)
  , [songIds, library]);

  // --- ACTIONS ---

  const recordState = useCallback((newIds: string[]) => {
    setUndoStack(prev => [...prev, songIds].slice(-20));
    setRedoStack([]);
    setSongIds(newIds);
  }, [songIds]);

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, songIds]);
    setUndoStack(u => u.slice(0, -1));
    setSongIds(prev);
  };

  const handleDeduplicate = () => {
    const seen = new Set();
    const unique = currentSongs.filter(s => {
      const key = `${s.title.toLowerCase()}-${s.artist.toLowerCase()}-${Math.floor(s.duration)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(s => s.id);
    
    if (unique.length !== songIds.length) {
      recordState(unique);
    }
  };

  const handleSort = (key: 'title' | 'artist' | 'duration' | 'year' | 'recent') => {
    const sorted = [...currentSongs].sort((a, b) => {
      if (key === 'title') return a.title.localeCompare(b.title);
      if (key === 'artist') return a.artist.localeCompare(b.artist);
      if (key === 'year') return b.year - a.year;
      if (key === 'recent') return b.dateAdded - a.dateAdded;
      return b.duration - a.duration;
    }).map(s => s.id);
    recordState(sorted);
  };

  const handleRemoveSelected = () => {
    const next = songIds.filter(id => !selectedIds.has(id));
    recordState(next);
    setSelectedIds(new Set());
  };

  const handleAIGenerate = async () => {
    setIsProcessing(true);
    try {
      const prompt = `Build a ${aiConfig.targetDuration} minute playlist with a ${aiConfig.mood} mood in the ${aiConfig.genre} genre. Diversity setting: ${aiConfig.diversity}%.`;
      const ids = await generateSmartPlaylist(library, prompt);
      recordState(ids);
      setActiveTab('editor');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalSave = () => {
    onSave({
      ...playlist,
      songIds,
      lastModified: Date.now(),
      coverUrl: currentSongs[0]?.coverUrl || playlist.coverUrl
    });
  };

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const totalSec = currentSongs.reduce((a, b) => a + b.duration, 0);
    const genreMap = new Map<string, number>();
    currentSongs.forEach(s => genreMap.set(s.genre, (genreMap.get(s.genre) || 0) + 1));
    const sortedGenres = Array.from(genreMap.entries()).sort((a, b) => b[1] - a[1]);
    
    return {
      count: currentSongs.length,
      duration: `${Math.floor(totalSec / 3600)}h ${Math.floor((totalSec % 3600) / 60)}m`,
      topGenre: sortedGenres[0]?.[0] || 'Mixed',
      energy: Math.floor(Math.random() * 40) + 50 // Simulation
    };
  }, [currentSongs]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 lg:p-12 overflow-hidden">
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      
      <MotionDiv 
        initial={{ scale: 0.95, opacity: 0, y: 40 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-7xl h-[90vh] bg-[#0c0c0c] border border-white/10 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <header className="p-8 border-b border-white/5 flex gap-8 bg-white/[0.01]">
          <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-2xl border border-white/10 shrink-0 group">
             <img src={currentSongs[0]?.coverUrl || playlist.coverUrl} className="w-full h-full object-cover" alt="" />
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button className="p-3 bg-white text-black rounded-full"><RefreshCw size={18}/></button>
             </div>
          </div>
          
          <div className="flex-1 space-y-4">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.5em]">Collection Architect</p>
                <h3 className="text-4xl font-black text-white tracking-tighter leading-tight truncate">{playlist.name}</h3>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                  {[
                    { id: 'editor', label: 'Curation', icon: ListOrdered },
                    { id: 'smart', label: 'Logic', icon: Settings2, hide: !playlist.isSmart },
                    { id: 'ai', label: 'Neural Mix', icon: Wand2 },
                    { id: 'stats', label: 'DNA', icon: BarChart3 },
                  ].filter(t => !t.hide).map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as EditorTab)}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                    >
                      <tab.icon size={14} /> {tab.label}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                   <button onClick={handleUndo} disabled={undoStack.length === 0} className="p-2.5 bg-white/5 rounded-xl text-zinc-500 hover:text-white disabled:opacity-20"><Undo2 size={16}/></button>
                   <button onClick={() => {}} className="p-2.5 bg-white/5 rounded-xl text-zinc-500 hover:text-white"><Download size={16}/></button>
                </div>
             </div>
          </div>

          <button onClick={onClose} className="p-4 text-zinc-600 hover:text-white transition-all self-start"><X size={28}/></button>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-hidden flex">
          
          {/* Main Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
             <AnimatePresence mode="wait">
                
                {/* 1. MANUAL EDITOR */}
                {activeTab === 'editor' && (
                  <MotionDiv key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                     <div className="flex items-center justify-between px-4 mb-4">
                        <div className="flex items-center gap-6">
                           <h4 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-2">
                             <ListFilter size={14} /> Sequence Control
                           </h4>
                           {selectedIds.size > 0 && (
                             <button onClick={handleRemoveSelected} className="px-4 py-1.5 bg-red-600/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                                <Trash2 size={12}/> Remove Selected ({selectedIds.size})
                             </button>
                           )}
                        </div>
                        <div className="flex gap-2">
                           {['title', 'artist', 'recent'].map(k => (
                             <button key={k} onClick={() => handleSort(k as any)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400">Sort {k}</button>
                           ))}
                        </div>
                     </div>

                     {currentSongs.length === 0 ? (
                       <div className="h-80 flex flex-col items-center justify-center text-zinc-800 border-2 border-dashed border-white/5 rounded-[3rem] gap-4">
                          <Music size={48} className="opacity-10" />
                          <p className="text-xs font-black uppercase tracking-widest">No tracks in this collection</p>
                       </div>
                     ) : (
                       <Reorder.Group axis="y" values={songIds} onReorder={recordState} className="space-y-1">
                          {currentSongs.map((track, i) => (
                            <Reorder.Item 
                              key={track.id + i} 
                              value={track.id}
                              className={`group flex items-center gap-6 p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all ${selectedIds.has(track.id) ? 'bg-purple-600/10 border border-purple-500/20' : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04]'}`}
                            >
                               <div className="flex items-center gap-4">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedIds.has(track.id)}
                                    onChange={(e) => {
                                      const next = new Set(selectedIds);
                                      if (e.target.checked) next.add(track.id);
                                      else next.delete(track.id);
                                      setSelectedIds(next);
                                    }}
                                    className="w-4 h-4 rounded border-white/10 bg-black/40 accent-purple-600" 
                                  />
                                  <GripVertical size={16} className="text-zinc-700 group-hover:text-zinc-500" />
                               </div>
                               <div className="w-8 text-center text-[10px] font-mono font-black text-zinc-700 group-hover:text-[var(--accent-color)] transition-colors">
                                  {(i + 1).toString().padStart(2, '0')}
                               </div>
                               <img src={track.coverUrl} className="w-10 h-10 rounded-lg object-cover shadow-lg" alt="" />
                               <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-bold text-white truncate">{track.title}</h5>
                                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{track.artist}</p>
                               </div>
                               <div className="text-[10px] font-mono text-zinc-600 mr-4">
                                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                               </div>
                               <button 
                                onClick={(e) => { e.stopPropagation(); recordState(songIds.filter(id => id !== track.id)); }}
                                className="p-2 text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                               >
                                  <Trash2 size={16}/>
                               </button>
                            </Reorder.Item>
                          ))}
                       </Reorder.Group>
                     )}
                  </MotionDiv>
                )}

                {/* 2. NEURAL MIX / AI BUILDER */}
                {activeTab === 'ai' && (
                  <MotionDiv key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 p-10">
                     <div className="p-10 bg-purple-600/10 border border-purple-500/20 rounded-[4rem] flex items-center gap-10">
                        <div className="p-8 bg-purple-600 rounded-[2.5rem] text-white shadow-2xl shadow-purple-600/30">
                           <Wand2 size={64} />
                        </div>
                        <div className="space-y-3">
                           <h4 className="text-4xl font-black text-white tracking-tight leading-none">Neural Magic Mix</h4>
                           <p className="text-sm text-purple-400 font-medium max-w-xl">Let Melodix AI scan your local vault to construct the perfect sequence based on acoustic similarity and mood heuristics.</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-8 p-8 bg-white/[0.02] border border-white/5 rounded-[3rem]">
                           <div className="space-y-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select Mood Palette</label>
                                 <div className="grid grid-cols-2 gap-3">
                                    {['Energetic', 'Chill', 'Melancholic', 'Productive'].map(m => (
                                      <button key={m} onClick={() => setAiConfig({...aiConfig, mood: m})} className={`py-4 rounded-2xl text-xs font-bold transition-all border ${aiConfig.mood === m ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'}`}>{m}</button>
                                    ))}
                                 </div>
                              </div>

                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target Length (Minutes)</label>
                                 <div className="flex items-center gap-6">
                                    <input type="range" min="15" max="300" step="15" value={aiConfig.targetDuration} onChange={e=>setAiConfig({...aiConfig, targetDuration: Number(e.target.value)})} className="flex-1 accent-purple-600" />
                                    <span className="text-xl font-black text-white w-20 text-center">{aiConfig.targetDuration}m</span>
                                 </div>
                              </div>
                           </div>
                           
                           <button 
                            onClick={handleAIGenerate}
                            disabled={isProcessing}
                            className="w-full py-6 bg-purple-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-[1.02] transition-all shadow-2xl"
                           >
                              <Sparkles size={20}/> {isProcessing ? 'SCANNING VAULT...' : 'SUMMON MIX'}
                           </button>
                        </div>

                        <div className="p-8 bg-black/40 border border-white/5 rounded-[3rem] space-y-6">
                           <div className="flex items-center gap-4 mb-4">
                              <Target className="text-zinc-500" size={20} />
                              <h5 className="font-black text-white uppercase tracking-tight">Refinement Hooks</h5>
                           </div>
                           <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 bg-white/[0.01] rounded-2xl border border-white/5">
                                 <span className="text-xs font-bold text-zinc-400">Exclude Recent Tracks</span>
                                 <div className="w-10 h-5 bg-zinc-800 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-zinc-600 rounded-full"/></div>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-white/[0.01] rounded-2xl border border-white/5">
                                 <span className="text-xs font-bold text-zinc-400">Prioritize Favorites</span>
                                 <div className="w-10 h-5 bg-purple-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"/></div>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-white/[0.01] rounded-2xl border border-white/5">
                                 <span className="text-xs font-bold text-zinc-400">Include Similar Artists</span>
                                 <div className="w-10 h-5 bg-purple-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"/></div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </MotionDiv>
                )}

                {/* 3. DNA / STATS VIEW */}
                {activeTab === 'stats' && (
                  <MotionDiv key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                          { label: 'Intensity', val: `${stats.energy}%`, icon: Flame, color: 'text-orange-500' },
                          { label: 'Tempo', val: '124 BPM', icon: Activity, color: 'text-emerald-500' },
                          { label: 'Flow', val: 'Fluid', icon: Wind, color: 'text-blue-400' },
                          { label: 'Variety', val: 'High', icon: Shuffle, color: 'text-purple-500' }
                        ].map(stat => (
                          <div key={stat.label} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] text-center space-y-2 group hover:bg-white/[0.04] transition-all">
                             <stat.icon size={24} className={`mx-auto ${stat.color} mb-2 group-hover:scale-110 transition-transform`} />
                             <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                             <p className="text-3xl font-black text-white">{stat.val}</p>
                          </div>
                        ))}
                     </div>

                     <div className="grid grid-cols-2 gap-10">
                        <div className="p-10 bg-black/40 border border-white/5 rounded-[4rem] space-y-6">
                           <h4 className="text-xl font-black text-white flex items-center gap-3"><PieChart size={20} className="text-purple-500" /> Genre Breakdown</h4>
                           <div className="space-y-4">
                              {currentSongs.slice(0, 5).map((s, i) => (
                                <div key={i} className="space-y-2">
                                   <div className="flex justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                                      <span>{s.genre}</span>
                                      <span className="text-white">80%</span>
                                   </div>
                                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                      <div className="h-full bg-purple-600" style={{ width: '80%' }} />
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                        <div className="p-10 bg-black/40 border border-white/5 rounded-[4rem] space-y-6">
                           <h4 className="text-xl font-black text-white flex items-center gap-3"><BarChart3 size={20} className="text-blue-500" /> Decades Map</h4>
                           <div className="h-48 flex items-end justify-between gap-4 px-4">
                              {[30, 80, 45, 60, 90, 20].map((h, i) => (
                                <div key={i} className="flex-1 bg-blue-600/20 hover:bg-blue-600 transition-all rounded-t-xl relative group" style={{ height: `${h}%` }}>
                                   <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-zinc-700 uppercase">{2025 - i * 10}s</span>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </MotionDiv>
                )}

             </AnimatePresence>
          </div>

          {/* Tools Sidebar */}
          <aside className="w-80 border-l border-white/5 bg-black/40 p-8 flex flex-col gap-10 overflow-y-auto custom-scrollbar">
             <div className="space-y-6">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Curation Toolbox</p>
                <div className="grid grid-cols-1 gap-3">
                   <button onClick={handleDeduplicate} className="w-full p-5 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-4 text-left group transition-all">
                      <div className="p-2.5 bg-zinc-900 rounded-xl text-zinc-500 group-hover:text-blue-400 group-hover:bg-blue-400/10 transition-all"><Eraser size={18}/></div>
                      <div>
                        <h5 className="text-xs font-black text-white uppercase">Deduplicate</h5>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase">Fingerprint Match</p>
                      </div>
                   </button>
                   <button className="w-full p-5 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-4 text-left group transition-all">
                      <div className="p-2.5 bg-zinc-900 rounded-xl text-zinc-500 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-all"><Layers2 size={18}/></div>
                      <div>
                        <h5 className="text-xs font-black text-white uppercase">Merge Lists</h5>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase">Combine archives</p>
                      </div>
                   </button>
                   <button className="w-full p-5 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-4 text-left group transition-all">
                      <div className="p-2.5 bg-zinc-900 rounded-xl text-zinc-500 group-hover:text-purple-500 group-hover:bg-purple-500/10 transition-all"><Zap size={18}/></div>
                      <div>
                        <h5 className="text-xs font-black text-white uppercase">Enhance All</h5>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase">Fetch missing tags</p>
                      </div>
                   </button>
                </div>
             </div>

             <div className="space-y-6">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Export Matrix</p>
                <div className="grid grid-cols-2 gap-3">
                   <button className="p-4 bg-zinc-900 hover:bg-white/5 rounded-2xl flex flex-col items-center gap-2 transition-all">
                      <FileJson size={20} className="text-zinc-600" />
                      <span className="text-[8px] font-black text-zinc-500 uppercase">JSON</span>
                   </button>
                   <button className="p-4 bg-zinc-900 hover:bg-white/5 rounded-2xl flex flex-col items-center gap-2 transition-all">
                      <FileText size={20} className="text-zinc-600" />
                      <span className="text-[8px] font-black text-zinc-500 uppercase">M3U8</span>
                   </button>
                </div>
             </div>

             <div className="mt-auto space-y-4">
                <div className="p-6 bg-white/5 rounded-[2rem] space-y-4">
                   <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Inventory</p>
                   <div className="flex justify-between">
                      <span className="text-[10px] font-black text-zinc-500 uppercase">{stats.count} Tracks</span>
                      <span className="text-[10px] font-black text-white uppercase">{stats.duration}</span>
                   </div>
                </div>

                <button 
                  onClick={handleFinalSave}
                  className="w-full py-6 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                >
                   <Save size={18}/> COMMIT ARCHIVE
                </button>
             </div>
          </aside>
        </div>

        {/* Processing State */}
        <AnimatePresence>
          {isProcessing && (
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-[2.5rem] bg-[var(--accent-color)] flex items-center justify-center shadow-2xl animate-pulse">
                   <RefreshCw size={40} className="text-white" />
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Summoning Neural Heuristics...</p>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>

      </MotionDiv>
    </div>
  );
};

export default PlaylistEditor;
