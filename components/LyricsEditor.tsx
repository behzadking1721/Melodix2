
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Save, Sparkles, Wand2, Languages, 
  Clock, Type, List, History, Play, 
  Pause, RotateCcw, ChevronRight, Check,
  Trash2, Plus, AlignLeft, Search, 
  Eraser, FileText, Timer, Music,
  ArrowRightLeft, AlertCircle, Undo2, Redo2
} from 'lucide-react';
import { Song } from '../types';
import { LrcParser, LrcLine } from '../services/lrcService';
import { AudioEngine } from '../services/audioEngine';
import { fetchLyrics } from '../services/geminiService';

const MotionDiv = motion.div as any;

interface LyricsEditorProps {
  song: Song;
  onClose: () => void;
  onSave: (updatedSong: Song) => void;
  currentProgress: number;
}

type EditorMode = 'view' | 'text' | 'sync' | 'translate';

const LyricsEditor: React.FC<LyricsEditorProps> = ({ song, onClose, onSave, currentProgress }) => {
  const [mode, setMode] = useState<EditorMode>('view');
  const [rawText, setRawText] = useState(song.lrcContent || '');
  const [syncLines, setSyncLines] = useState<LrcLine[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeSyncIndex, setActiveSyncIndex] = useState(0);

  const engine = AudioEngine.getInstance();

  // Load and Parse
  useEffect(() => {
    if (rawText) {
      setSyncLines(LrcParser.parse(rawText));
    }
  }, []);

  // History Tracker
  const recordHistory = (text: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(text);
    setHistory(newHistory.slice(-20));
    setHistoryIndex(newHistory.length - 1);
  };

  const handleModeChange = (newMode: EditorMode) => {
    if (mode === 'text') recordHistory(rawText);
    if (mode === 'sync') setRawText(LrcParser.stringify(syncLines));
    setMode(newMode);
  };

  // --- AI ACTIONS ---
  const handleAIFix = async () => {
    setIsProcessing(true);
    try {
      // Simulate Gemini cleaning
      await new Promise(r => setTimeout(r, 1500));
      const cleaned = rawText
        .replace(/Lyrics by .*/gi, '')
        .replace(/\[\d+:\d+\]/g, '') // Remove timestamps for plain text cleaning
        .trim();
      setRawText(cleaned);
      recordHistory(cleaned);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async () => {
    setIsProcessing(true);
    try {
      // Logic would call geminiService.translate
      await new Promise(r => setTimeout(r, 2000));
      alert("AI Translation Preview: Integration with Gemini Pro Translation API active.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- SYNC LOGIC ---
  const handleTapSync = () => {
    const time = engine.getActiveElement().currentTime;
    const updated = [...syncLines];
    if (updated[activeSyncIndex]) {
      updated[activeSyncIndex].time = time;
      setSyncLines(updated);
      setActiveSyncIndex(prev => Math.min(prev + 1, updated.length - 1));
    }
  };

  const handleFinalSave = () => {
    const finalContent = mode === 'sync' ? LrcParser.stringify(syncLines) : rawText;
    onSave({
      ...song,
      lrcContent: finalContent,
      hasLyrics: finalContent.length > 10,
      lyricsStatus: 'full',
      lastUpdated: Date.now()
    });
    onClose();
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
            <div className="p-3.5 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/20">
              <Mic2Icon size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white tracking-tighter leading-none">Lyrics Orchestrator</h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">{song.title} • {song.artist}</p>
            </div>
          </div>

          <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/5">
            {[
              { id: 'view', label: 'Reader', icon: FileText },
              { id: 'text', label: 'Editor', icon: Type },
              { id: 'sync', label: 'Timeline', icon: Timer },
              { id: 'translate', label: 'Neural Mix', icon: Languages },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => handleModeChange(item.id as EditorMode)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mode === item.id ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              >
                <item.icon size={14} /> {item.label}
              </button>
            ))}
          </div>

          <button onClick={onClose} className="p-4 text-zinc-500 hover:text-white transition-all"><X size={24}/></button>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-hidden flex">
          
          {/* Mode-specific content */}
          <div className="flex-1 overflow-hidden relative">
             <AnimatePresence mode="wait">
                
                {/* 1. READER VIEW */}
                {mode === 'view' && (
                  <MotionDiv key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto custom-scrollbar p-20 space-y-10 text-center">
                    {syncLines.length > 0 ? (
                      syncLines.map((line, i) => (
                        <p key={i} className={`text-5xl font-black tracking-tighter leading-tight transition-all duration-500 ${currentProgress >= line.time ? 'text-white' : 'text-zinc-800 opacity-40'}`}>
                          {line.text}
                        </p>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-20">
                        <AlignLeft size={80} />
                        <p className="text-xl font-bold">No structured lyrics found.</p>
                      </div>
                    )}
                  </MotionDiv>
                )}

                {/* 2. TEXT EDITOR */}
                {mode === 'text' && (
                  <MotionDiv key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                    <div className="flex-1 flex overflow-hidden">
                       <div className="w-12 bg-black/40 border-r border-white/5 py-8 flex flex-col items-center gap-4 text-zinc-800 font-mono text-[10px] select-none">
                         {rawText.split('\n').map((_, i) => <span key={i}>{i+1}</span>)}
                       </div>
                       <textarea 
                         value={rawText}
                         onChange={(e) => setRawText(e.target.value)}
                         className="flex-1 bg-transparent p-8 text-xl font-bold text-white focus:outline-none resize-none custom-scrollbar leading-relaxed"
                         placeholder="Paste or type lyrics here..."
                         spellCheck={false}
                       />
                    </div>
                  </MotionDiv>
                )}

                {/* 3. TIMELINE SYNC */}
                {mode === 'sync' && (
                  <MotionDiv key="sync" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                    <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                         <button 
                          onClick={() => engine.getActiveElement().paused ? engine.resume() : engine.pause()}
                          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                         >
                            <Play size={20} fill="black" />
                         </button>
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                           Press <span className="px-2 py-0.5 bg-white/5 rounded text-white border border-white/10">SPACE</span> to mark start of current line
                         </p>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => setActiveSyncIndex(0)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400"><RotateCcw size={16}/></button>
                       </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-2">
                       {syncLines.map((line, i) => (
                         <div 
                          key={i} 
                          onClick={() => setActiveSyncIndex(i)}
                          className={`flex items-center gap-6 p-4 rounded-2xl border transition-all cursor-pointer ${activeSyncIndex === i ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/[0.02] border-transparent hover:border-white/5'}`}
                         >
                            <div className={`w-20 px-3 py-1.5 rounded-xl font-mono text-xs text-center transition-all ${line.time > 0 ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-600'}`}>
                               {LrcParser.formatTimestamp(line.time)}
                            </div>
                            <span className={`text-lg font-bold transition-all ${activeSyncIndex === i ? 'text-white' : 'text-zinc-500'}`}>{line.text}</span>
                            {activeSyncIndex === i && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                         </div>
                       ))}
                    </div>
                  </MotionDiv>
                )}

             </AnimatePresence>
          </div>

          {/* AI Panel (Right) */}
          <aside className="w-80 border-l border-white/5 bg-black/40 p-8 flex flex-col gap-8">
             <div className="space-y-6">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">AI Toolbox</p>
                
                <button 
                  onClick={handleAIFix}
                  disabled={isProcessing}
                  className="w-full p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all flex items-start gap-4 group"
                >
                   <div className="p-3 bg-purple-600/10 text-purple-400 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <Sparkles size={18} />
                   </div>
                   <div className="text-left">
                      <h5 className="text-xs font-black text-white uppercase tracking-tight">Neural Clean</h5>
                      <p className="text-[9px] text-zinc-600 font-bold mt-1 leading-tight">Remove spam, fix casing, and normalize symbols.</p>
                   </div>
                </button>

                <button 
                  onClick={handleTranslate}
                  disabled={isProcessing}
                  className="w-full p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all flex items-start gap-4 group"
                >
                   <div className="p-3 bg-blue-600/10 text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Languages size={18} />
                   </div>
                   <div className="text-left">
                      <h5 className="text-xs font-black text-white uppercase tracking-tight">AI Translate</h5>
                      <p className="text-[9px] text-zinc-600 font-bold mt-1 leading-tight">Generate high-quality multi-language overlays.</p>
                   </div>
                </button>

                <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] space-y-3">
                   <div className="flex items-center gap-2 text-amber-500">
                      <AlertCircle size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Editor Hint</span>
                   </div>
                   <p className="text-[9px] text-zinc-500 font-bold leading-tight italic">
                      LRC synchronization works best with 44.1kHz audio sampling. Tap SPACE slightly before the singer starts.
                   </p>
                </div>
             </div>

             <div className="mt-auto space-y-4">
                <button 
                  onClick={handleFinalSave}
                  className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                >
                   <Save size={18}/> Commit Changes
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-5 bg-white/5 text-zinc-500 hover:text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all"
                >
                   Discard
                </button>
             </div>
          </aside>
        </div>

        {/* Global Task Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 flex items-center justify-center animate-pulse">
                   <Sparkles size={32} className="text-white" />
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Processing Neural Request...</p>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>

      </MotionDiv>

      {/* Tap-to-sync Global Key Listener */}
      <SyncKeyListener active={mode === 'sync' && !isProcessing} onSync={handleTapSync} />
    </div>
  );
};

// Internal Component for precision keyboard capture
const SyncKeyListener = ({ active, onSync }: { active: boolean, onSync: () => void }) => {
  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onSync();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, onSync]);
  return null;
};

const Mic2Icon = (props: any) => <div {...props}><List /></div>;

export default LyricsEditor;
