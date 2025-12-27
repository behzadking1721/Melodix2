
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Save, Sparkles, Wand2, HardDrive, 
  CheckCircle2, AlertTriangle, RefreshCcw, 
  Image as ImageIcon, History, Globe, 
  Search, List, LayoutGrid, Layers, 
  Music, User, Disc, Info, ArrowRight,
  Hash, Calendar, FileText, Languages,
  MoreHorizontal, ChevronRight, Check,
  Clock, Activity, Trash2, Edit3, Tags
} from 'lucide-react';
import { Song, TagSnapshot } from '../types';
import { MetadataFetcher } from '../services/metadataService';

const MotionDiv = motion.div as any;

interface TagEditorProps {
  songs: Song[];
  onClose: () => void;
  onSave: (updatedSongs: Song[]) => void;
}

type TabMode = 'metadata' | 'advanced' | 'online' | 'history' | 'batch';

const GENRES = [
  'Alternative', 'Ambient', 'Classical', 'Country', 'Electronic', 
  'Hip-Hop', 'Jazz', 'Lofi', 'Metal', 'Pop', 'R&B', 'Rock', 'Techno'
];

const TagEditor: React.FC<TagEditorProps> = ({ songs, onClose, onSave }) => {
  const isBatch = songs.length > 1;
  const [activeTab, setActiveTab] = useState<TabMode>(isBatch ? 'batch' : 'metadata');
  const [editedData, setEditedData] = useState<Partial<Song>>(songs[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diffData, setDiffData] = useState<Partial<Song> | null>(null);

  // Field Update logic
  const updateField = (field: keyof Song, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  // AI Fix logic
  const handleAIFix = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const suggestion = await MetadataFetcher.fetchAdvancedMetadata(editedData as Song);
      setDiffData(suggestion);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyAIDiff = () => {
    if (diffData) {
      setEditedData(prev => ({ ...prev, ...diffData }));
      setDiffData(null);
    }
  };

  // Final Commit
  const handleFinalSave = async () => {
    setIsProcessing(true);
    try {
      const updatedSongs = songs.map(s => {
        const newSnapshot: TagSnapshot = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          data: { ...s }
        };
        
        const history = [...(s.tagHistory || []), newSnapshot].slice(-5);
        
        return {
          ...s,
          ...editedData,
          tagHistory: history,
          tagStatus: 'full',
          lastUpdated: Date.now()
        } as Song;
      });

      // Simulation of writing to file
      await MetadataFetcher.writeToFile(updatedSongs[0]); 
      
      onSave(updatedSongs);
      onClose();
    } catch (e) {
      setError("File locking error: Audio file is being used by another process.");
    } finally {
      setIsProcessing(false);
    }
  };

  const InputField = ({ label, value, field, type = "text", icon: Icon }: { label: string, value: any, field: keyof Song, type?: string, icon?: any }) => {
    const hasChanged = diffData && diffData[field] !== undefined && diffData[field] !== editedData[field];
    return (
      <div className="space-y-1.5 text-left group">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
           {Icon && <Icon size={10} />} {label}
        </label>
        <div className={`relative transition-all ${hasChanged ? 'ring-2 ring-purple-500/50' : ''}`}>
          <input 
            type={type}
            value={value ?? ''}
            onChange={(e) => updateField(field, type === 'number' ? Number(e.target.value) : e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[var(--accent-color)] transition-all placeholder:text-zinc-800"
          />
          {hasChanged && (
            <div className="absolute -top-2 -right-2 bg-purple-600 text-white p-1 rounded-full shadow-lg">
               <Sparkles size={8} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 lg:p-12 overflow-hidden">
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      
      <MotionDiv 
        initial={{ scale: 0.95, opacity: 0, y: 40 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-6xl h-[90vh] bg-[#0c0c0c] border border-white/10 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-[var(--accent-color)]/20 text-[var(--accent-color)] rounded-[1.5rem] shadow-inner">
              <Tags size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white tracking-tighter leading-none">
                {isBatch ? `Batch Tag Orchestrator (${songs.length})` : 'Precision Metadata Editor'}
              </h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Integrated ID3v2.4 & Neural Fixer</p>
            </div>
          </div>

          <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/5">
            {[
              { id: 'metadata', label: 'Basic', icon: Music },
              { id: 'advanced', label: 'Advanced', icon: Layers },
              { id: 'batch', label: 'Batch', icon: LayoutGrid, hide: !isBatch },
              { id: 'online', label: 'Merge', icon: Globe },
              { id: 'history', label: 'Snapshots', icon: History },
            ].filter(t => !t.hide).map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as TabMode)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === item.id ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              >
                <item.icon size={14} /> {item.label}
              </button>
            ))}
          </div>

          <button onClick={onClose} className="p-4 text-zinc-500 hover:text-white transition-all"><X size={24}/></button>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-hidden flex">
          
          {/* Main Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
            {error && (
              <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold animate-in slide-in-from-top-2">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              
              {/* --- 1. BASIC METADATA --- */}
              {activeTab === 'metadata' && (
                <MotionDiv key="metadata" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <InputField label="Track Title" value={editedData.title} field="title" icon={Music} />
                         <InputField label="Artist Name" value={editedData.artist} field="artist" icon={User} />
                         <InputField label="Album Artist" value={editedData.albumArtist} field="albumArtist" icon={Layers} />
                         <InputField label="Album Title" value={editedData.album} field="album" icon={Disc} />
                      </div>
                      <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5 text-left">
                              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Genre</label>
                              <select 
                                value={editedData.genre}
                                onChange={(e) => updateField('genre', e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none"
                              >
                                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                              </select>
                            </div>
                            <InputField label="Year" value={editedData.year} field="year" type="number" icon={Calendar} />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <InputField label="Track No." value={editedData.trackNumber} field="trackNumber" type="number" icon={Hash} />
                            <InputField label="Disc No." value={editedData.discNumber} field="discNumber" type="number" icon={Disc} />
                         </div>
                         <div className="space-y-1.5 text-left">
                           <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Comments</label>
                           <textarea 
                             value={editedData.comment || ''}
                             onChange={(e) => updateField('comment', e.target.value)}
                             className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none h-24 resize-none"
                           />
                         </div>
                      </div>
                   </div>
                </MotionDiv>
              )}

              {/* --- 2. ADVANCED METADATA --- */}
              {activeTab === 'advanced' && (
                <MotionDiv key="advanced" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <InputField label="Composer" value={editedData.composer} field="composer" icon={Edit3} />
                      <InputField label="Publisher" value={editedData.publisher} field="publisher" icon={Globe} />
                      <InputField label="ISRC Code" value={editedData.isrc} field="isrc" icon={FileText} />
                   </div>
                   <div className="space-y-6">
                      <InputField label="BPM" value={editedData.bpm} field="bpm" type="number" icon={Activity} />
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Lyrics Language</label>
                        <select 
                          value={editedData.lyricsLanguage}
                          onChange={(e) => updateField('lyricsLanguage', e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none"
                        >
                          <option value="en">English</option>
                          <option value="fa">Persian</option>
                          <option value="de">German</option>
                          <option value="jp">Japanese</option>
                        </select>
                      </div>
                   </div>
                </MotionDiv>
              )}

              {/* --- 3. BATCH OPERATIONS --- */}
              {activeTab === 'batch' && (
                 <MotionDiv key="batch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] flex items-center gap-6">
                       <div className="p-4 bg-blue-600 rounded-2xl text-white"><LayoutGrid size={24}/></div>
                       <div>
                          <h4 className="text-lg font-black text-white">Batch Operations Mode</h4>
                          <p className="text-xs text-blue-400">Any field edited will be applied to all {songs.length} tracks.</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                       <button onClick={() => updateField('albumArtist', editedData.artist)} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all text-left space-y-2">
                          <h5 className="text-[10px] font-black uppercase text-zinc-500">Auto-Fill</h5>
                          <p className="text-sm font-bold text-white">Match Album Artist to Artist</p>
                       </button>
                       <button className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all text-left space-y-2">
                          <h5 className="text-[10px] font-black uppercase text-zinc-500">Sequence</h5>
                          <p className="text-sm font-bold text-white">Re-calculate Track Numbers</p>
                       </button>
                       <button className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all text-left space-y-2">
                          <h5 className="text-[10px] font-black uppercase text-zinc-500">Normalize</h5>
                          <p className="text-sm font-bold text-white">Standardize All Casing</p>
                       </button>
                    </div>
                 </MotionDiv>
              )}

              {/* --- 4. HISTORY / SNAPSHOTS --- */}
              {activeTab === 'history' && (
                <MotionDiv key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                   <div className="flex items-center justify-between px-2">
                      <h4 className="text-sm font-black text-white flex items-center gap-3"><History size={16}/> Metadata Delta History</h4>
                   </div>
                   <div className="space-y-3">
                      {(editedData.tagHistory || []).length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] text-zinc-700">
                           <History size={48} className="mx-auto mb-4 opacity-10" />
                           <p className="text-sm font-bold uppercase tracking-widest">No previous versions found</p>
                        </div>
                      ) : (
                        editedData.tagHistory!.map((snap, i) => (
                          <div key={snap.id} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl group">
                             <div className="flex items-center gap-6">
                                <div className="text-xs font-mono text-zinc-600">#{i+1}</div>
                                <div>
                                   <p className="text-sm font-bold text-white">Snapshot taken on {new Date(snap.timestamp).toLocaleString()}</p>
                                   <p className="text-[10px] text-zinc-600 font-bold uppercase">Source: Manual Edit</p>
                                </div>
                             </div>
                             <button onClick={() => setEditedData({ ...editedData, ...snap.data })} className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all">Restore</button>
                          </div>
                        ))
                      )}
                   </div>
                </MotionDiv>
              )}

            </AnimatePresence>
          </div>

          {/* Asset Sidebar (Right) */}
          <aside className="w-96 border-l border-white/5 bg-black/40 p-10 flex flex-col gap-10 overflow-y-auto custom-scrollbar">
             <div className="space-y-6">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Asset Control</p>
                <div className="relative group rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 aspect-square">
                   <img src={editedData.coverUrl} className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110" alt="" />
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                      <button className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all"><ImageIcon size={24}/></button>
                      <button className="p-4 bg-white/10 backdrop-blur-xl text-white rounded-full hover:scale-110 active:scale-90 transition-all"><Globe size={24}/></button>
                   </div>
                </div>
                <div className="flex items-center gap-3 justify-center">
                   <button className="px-5 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white">Export Cover</button>
                   <button className="px-5 py-2 bg-red-600/10 hover:bg-red-600/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500">Remove</button>
                </div>
             </div>

             <div className="space-y-6">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Neural Intelligence</p>
                <button 
                  onClick={handleAIFix}
                  disabled={isProcessing}
                  className="w-full p-6 bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-[2.5rem] hover:opacity-80 transition-all flex items-start gap-4 text-left group"
                >
                   <div className="p-3 bg-purple-600 rounded-xl text-white shadow-xl shadow-purple-600/20 group-hover:scale-110 transition-transform">
                      <Wand2 size={18} />
                   </div>
                   <div>
                      <h5 className="text-xs font-black text-white uppercase tracking-tight">Neural Fixer</h5>
                      <p className="text-[9px] text-zinc-500 font-bold mt-1 leading-tight italic">Standardize names, fetch year, and detect genre.</p>
                   </div>
                </button>
             </div>

             <div className="mt-auto space-y-4">
                <AnimatePresence>
                  {diffData && (
                    <MotionDiv initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 bg-purple-600 text-white rounded-[2rem] space-y-4 shadow-2xl">
                       <div className="flex items-center gap-3">
                         <Sparkles size={16} />
                         <p className="text-[10px] font-black uppercase tracking-widest">AI Suggestion Ready</p>
                       </div>
                       <button onClick={applyAIDiff} className="w-full py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Apply Neural Delta</button>
                    </MotionDiv>
                  )}
                </AnimatePresence>

                <button 
                  onClick={handleFinalSave}
                  disabled={isProcessing}
                  className="w-full py-6 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                >
                   <Save size={20}/> {isBatch ? 'Save Batch Changes' : 'Commit Changes'}
                </button>
                <button onClick={onClose} className="w-full py-5 bg-white/5 text-zinc-500 hover:text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all">Discard Changes</button>
             </div>
          </aside>
        </div>

        {/* Global Loading Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-[var(--accent-color)] flex items-center justify-center shadow-2xl animate-pulse">
                   <Activity size={40} className="text-white" />
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Interfacing with Hardware Stream...</p>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>

      </MotionDiv>
    </div>
  );
};

export default TagEditor;
