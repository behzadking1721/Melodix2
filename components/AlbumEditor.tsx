
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  X, Save, Sparkles, Wand2, Disc, 
  ListOrdered, Layers, Trash2, Plus, 
  ChevronRight, ArrowRight, Music, Calendar, 
  Tags, Clock, LayoutGrid, Info, Globe,
  AlertTriangle, CheckCircle2, GripVertical,
  Hash, SortAsc, RefreshCw, Layers2
} from 'lucide-react';
import { Song, AlbumViewModel } from '../types';
import { MetadataFetcher } from '../services/metadataService';

const MotionDiv = motion.div as any;

interface AlbumEditorProps {
  album: AlbumViewModel;
  onClose: () => void;
  onSave: (updatedSongs: Song[]) => void;
}

type EditorTab = 'ordering' | 'discs' | 'online';

const AlbumEditor: React.FC<AlbumEditorProps> = ({ album, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('ordering');
  const [tracks, setTracks] = useState<Song[]>(
    [...album.songs].sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0))
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [editedMeta, setEditedMeta] = useState({
    album: album.name,
    artist: album.artist,
    year: album.year,
    genre: album.songs[0]?.genre || 'Unknown'
  });

  // Track Ordering Logic
  const handleReorder = (newOrder: Song[]) => {
    const updated = newOrder.map((s, i) => ({ ...s, trackNumber: i + 1 }));
    setTracks(updated);
  };

  const handleAutoSort = (key: 'title' | 'duration') => {
    const sorted = [...tracks].sort((a, b) => {
      if (key === 'title') return a.title.localeCompare(b.title);
      return a.duration - b.duration;
    });
    handleReorder(sorted);
  };

  // AI Fixer Logic
  const handleAIFix = async () => {
    setIsProcessing(true);
    try {
      // Simulate Gemini album analysis
      await new Promise(r => setTimeout(r, 2000));
      setAiSuggestions({
        missing: ["08. The Final Chapter", "12. Digital Outro"],
        incorrectOrder: true,
        canonicalYear: 2024
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Disc Management
  const discs = useMemo(() => {
    const map = new Map<number, Song[]>();
    tracks.forEach(s => {
      const d = s.discNumber || 1;
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(s);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [tracks]);

  const handleFinalSave = () => {
    const finalized = tracks.map(t => ({
      ...t,
      album: editedMeta.album,
      artist: editedMeta.artist,
      year: editedMeta.year,
      genre: editedMeta.genre,
      trackCount: tracks.length,
      lastUpdated: Date.now()
    }));
    onSave(finalized);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 lg:p-12 overflow-hidden">
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      
      <MotionDiv 
        initial={{ scale: 0.95, opacity: 0, y: 40 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-6xl h-[90vh] bg-[#0c0c0c] border border-white/10 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
      >
        {/* Header Hero */}
        <header className="p-10 border-b border-white/5 flex gap-10 bg-white/[0.01]">
          <div className="relative w-48 h-48 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 shrink-0 group">
             <img src={album.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s]" alt="" />
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button className="p-4 bg-white text-black rounded-full shadow-2xl"><RefreshCw size={24}/></button>
             </div>
          </div>
          
          <div className="flex-1 space-y-6">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.5em]">Album Sequence Editor</p>
                <h3 className="text-5xl font-black text-white tracking-tighter leading-tight">{album.name}</h3>
                <p className="text-xl text-zinc-500 font-bold">{album.artist} • {album.year}</p>
             </div>
             
             <div className="flex items-center gap-6">
                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                  {[
                    { id: 'ordering', label: 'Sequencer', icon: ListOrdered },
                    { id: 'discs', label: 'Discs', icon: Layers },
                    { id: 'online', label: 'Compare', icon: Globe },
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as EditorTab)}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                    >
                      <tab.icon size={14} /> {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                   <span className="flex items-center gap-1.5"><Music size={12}/> {tracks.length} Tracks</span>
                   <span className="w-1 h-1 rounded-full bg-zinc-800" />
                   <span className="flex items-center gap-1.5"><Clock size={12}/> {formatDuration(tracks.reduce((a,b)=>a+b.duration, 0))}</span>
                </div>
             </div>
          </div>

          <button onClick={onClose} className="p-4 text-zinc-600 hover:text-white transition-all"><X size={28}/></button>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-hidden flex">
          
          {/* Main Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
             <AnimatePresence mode="wait">
                
                {/* 1. TRACK ORDERING / SEQUENCER */}
                {activeTab === 'ordering' && (
                  <MotionDiv key="ordering" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                     <div className="flex items-center justify-between px-2 mb-4">
                        <h4 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-2">
                           <ListOrdered size={14} /> Master Sequence
                        </h4>
                        <div className="flex gap-2">
                           <button onClick={() => handleAutoSort('title')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400">Sort A-Z</button>
                           <button onClick={() => handleAutoSort('duration')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400">Sort Length</button>
                        </div>
                     </div>

                     <Reorder.Group axis="y" values={tracks} onReorder={handleReorder} className="space-y-2">
                        {tracks.map((track) => (
                          <Reorder.Item 
                            key={track.id} 
                            value={track}
                            className="group flex items-center gap-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-grab active:cursor-grabbing hover:bg-white/[0.04] hover:border-white/10 transition-all"
                          >
                             <div className="text-zinc-700 group-hover:text-zinc-500 transition-colors">
                                <GripVertical size={16} />
                             </div>
                             <div className="w-8 text-center text-xs font-mono font-black text-[var(--accent-color)]">
                                {track.trackNumber?.toString().padStart(2, '0')}
                             </div>
                             <img src={track.coverUrl} className="w-10 h-10 rounded-lg object-cover shadow-lg" alt="" />
                             <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-bold text-white truncate">{track.title}</h5>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{track.artist}</p>
                             </div>
                             <div className="text-[10px] font-mono text-zinc-600 mr-4">
                                {formatDuration(track.duration)}
                             </div>
                             <button className="p-2 text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={16}/>
                             </button>
                          </Reorder.Item>
                        ))}
                     </Reorder.Group>
                  </MotionDiv>
                )}

                {/* 2. DISC MANAGEMENT */}
                {activeTab === 'discs' && (
                  <MotionDiv key="discs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                     {discs.map(([discNum, discTracks]) => (
                       <div key={discNum} className="space-y-4">
                          <div className="flex items-center gap-4 px-4">
                             <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
                                <Disc size={18} />
                             </div>
                             <h4 className="text-xl font-black text-white tracking-tight">Disc {discNum}</h4>
                             <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{discTracks.length} TRACKS</span>
                             <button className="ml-auto p-2 text-zinc-700 hover:text-white transition-colors"><MoreHorizontal size={18}/></button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {discTracks.map(t => (
                               <div key={t.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 group">
                                  <div className="w-8 text-[10px] font-mono text-zinc-600">#{t.trackNumber}</div>
                                  <div className="flex-1 font-bold text-sm text-zinc-300 truncate">{t.title}</div>
                                  <button className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-zinc-500 hover:text-white">
                                     <ArrowRightLeft size={12}/>
                                  </button>
                               </div>
                             ))}
                          </div>
                       </div>
                     ))}
                     <button className="w-full py-8 border-2 border-dashed border-white/5 rounded-[2.5rem] text-zinc-700 hover:text-zinc-500 hover:border-white/10 transition-all flex flex-col items-center justify-center gap-3">
                        <Plus size={32}/>
                        <span className="text-[10px] font-black uppercase tracking-widest">Create New Disc Partition</span>
                     </button>
                  </MotionDiv>
                )}

                {/* 3. ONLINE COMPARE */}
                {activeTab === 'online' && (
                  <MotionDiv key="online" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                     <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[3rem] flex items-center gap-8">
                        <Globe size={40} className="text-blue-500 shrink-0" />
                        <div>
                           <h4 className="text-lg font-black text-white">MusicBrainz Synchronization</h4>
                           <p className="text-xs text-blue-400 font-medium leading-relaxed">Melodix is comparing your local file structure against the global ID3 database. Any discrepancies will be flagged for review.</p>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2">Local Assets ({tracks.length})</h5>
                           <div className="space-y-1">
                              {tracks.map(t => (
                                <div key={t.id} className="p-4 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-zinc-300 flex justify-between">
                                  <span>{t.trackNumber}. {t.title}</span>
                                  <CheckCircle2 size={14} className="text-emerald-500" />
                                </div>
                              ))}
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2">Official Database</h5>
                           <div className="space-y-1">
                              {tracks.map(t => (
                                <div key={t.id} className="p-4 bg-black/40 border border-white/5 rounded-xl text-xs font-bold text-zinc-600">
                                  {t.trackNumber}. {t.title}
                                </div>
                              ))}
                              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-500 flex justify-between items-center">
                                 <span>??. [Missing Track] Final Chapter</span>
                                 <AlertTriangle size={14} />
                              </div>
                           </div>
                        </div>
                     </div>
                  </MotionDiv>
                )}

             </AnimatePresence>
          </div>

          {/* AI Sidebar */}
          <aside className="w-80 border-l border-white/5 bg-black/40 p-8 flex flex-col gap-8">
             <div className="space-y-6">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Neural Insights</p>
                
                <button 
                  onClick={handleAIFix}
                  disabled={isProcessing}
                  className="w-full p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5 rounded-[2.5rem] hover:opacity-80 transition-all text-left flex items-start gap-4 group"
                >
                   <div className="p-3 bg-blue-600 rounded-xl text-white shadow-xl group-hover:scale-110 transition-transform">
                      <Wand2 size={18} />
                   </div>
                   <div>
                      <h5 className="text-xs font-black text-white uppercase tracking-tight">Sequence Fixer</h5>
                      <p className="text-[9px] text-zinc-500 font-bold mt-1 leading-tight">Detect gaps, find missing metadata, and fix numbering.</p>
                   </div>
                </button>

                {aiSuggestions && (
                  <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] space-y-4">
                     <div className="flex items-center gap-3 text-amber-500">
                        <AlertTriangle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">AI Audit Found Issues</span>
                     </div>
                     <div className="space-y-2">
                        {aiSuggestions.missing.map((m: string) => (
                           <p key={m} className="text-[10px] text-zinc-400 font-bold flex items-center gap-2 italic">
                              <span className="w-1 h-1 rounded-full bg-amber-500" /> Missing: {m}
                           </p>
                        ))}
                     </div>
                     <button className="w-full py-2 bg-amber-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest">Apply Suggested Sequence</button>
                  </MotionDiv>
                )}
             </div>

             <div className="mt-auto space-y-4">
                <div className="p-6 bg-white/5 rounded-[2rem] space-y-4">
                   <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Quick Meta</p>
                   <div className="space-y-3">
                      <div className="space-y-1">
                         <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">Genre Global</span>
                         <input value={editedMeta.genre} onChange={e=>setEditedMeta({...editedMeta, genre: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-bold text-white focus:outline-none focus:border-[var(--accent-color)]" />
                      </div>
                      <div className="space-y-1">
                         <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">Release Year</span>
                         <input type="number" value={editedMeta.year} onChange={e=>setEditedMeta({...editedMeta, year: Number(e.target.value)})} className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-bold text-white focus:outline-none focus:border-[var(--accent-color)]" />
                      </div>
                   </div>
                </div>

                <button 
                  onClick={handleFinalSave}
                  className="w-full py-6 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                >
                   <Save size={18}/> Commit Album
                </button>
                <button onClick={onClose} className="w-full py-5 bg-white/5 text-zinc-500 hover:text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all">Discard Changes</button>
             </div>
          </aside>
        </div>

        {/* Processing State */}
        <AnimatePresence>
          {isProcessing && (
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-[2.5rem] bg-[var(--accent-color)] flex items-center justify-center shadow-2xl animate-pulse">
                   <Layers2 size={40} className="text-white" />
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Syncing with MusicBrainz...</p>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>

      </MotionDiv>
    </div>
  );
};

const MoreHorizontal = (props: any) => <div {...props}><ArrowRight size={16} /></div>;
const ArrowRightLeft = (props: any) => <div {...props}><RefreshCw size={12} /></div>;

export default AlbumEditor;
