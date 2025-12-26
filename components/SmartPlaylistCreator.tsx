
import React, { useState } from 'react';
import { Song, Playlist } from '../types';
import { X, Sparkles, Wand2, Music2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { generateSmartPlaylist, generatePlaylistCover } from '../services/geminiService';

interface SmartPlaylistCreatorProps {
  library: Song[];
  onClose: () => void;
  onSave: (playlist: Playlist) => void;
}

const PRESETS = [
  { label: 'Chill & Relax', icon: '🌙', mood: 'calm and atmospheric' },
  { label: 'Focus & Study', icon: '📖', mood: 'minimalist and productive' },
  { label: 'High Energy', icon: '⚡', mood: 'vibrant and intense' },
  { label: 'Midnight Drive', icon: '🌉', mood: 'neon and cinematic' },
];

const SmartPlaylistCreator: React.FC<SmartPlaylistCreatorProps> = ({ library, onClose, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedIds, setSuggestedIds] = useState<string[]>([]);
  const [playlistName, setPlaylistName] = useState('');
  const [generatedCover, setGeneratedCover] = useState<string | null>(null);

  const handleGenerate = async (preset?: typeof PRESETS[0]) => {
    const activePrompt = preset?.label || prompt;
    const mood = preset?.mood || "musical";
    if (!activePrompt) return;

    setIsGenerating(true);
    try {
      const [ids, cover] = await Promise.all([
        generateSmartPlaylist(library, activePrompt),
        generatePlaylistCover(activePrompt, mood)
      ]);
      setSuggestedIds(ids);
      setGeneratedCover(cover);
      setPlaylistName(activePrompt);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (suggestedIds.length === 0 || !playlistName) return;
    // Fix: Added missing dateCreated and lastModified properties to comply with Playlist interface
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substr(2, 9),
      name: playlistName,
      songIds: suggestedIds,
      coverUrl: generatedCover || undefined,
      dateCreated: Date.now(),
      lastModified: Date.now()
    };
    onSave(newPlaylist);
  };

  const suggestedSongs = library.filter(s => suggestedIds.includes(s.id));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-[#2c2c2c] rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold">AI Smart Local Playlist</h3>
              <p className="text-xs text-zinc-400">Organizing your system music with AI</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 p-8 space-y-8 overflow-y-auto border-r border-white/5">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Presets</label>
              <div className="grid grid-cols-2 gap-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleGenerate(preset)}
                    className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all text-sm group"
                  >
                    <span className="text-2xl">{preset.icon}</span>
                    <span className="font-medium">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Custom Prompt</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. 'Chill beats for coding'" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500/50"
                />
                <button onClick={() => handleGenerate()} disabled={isGenerating} className="absolute right-2 top-1.5 p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg">
                  <Wand2 size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="w-1/2 p-8 bg-black/20 overflow-y-auto flex flex-col items-center">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500">
                <div className="w-48 h-48 rounded-2xl bg-zinc-800 animate-pulse flex items-center justify-center">
                  <ImageIcon size={48} className="opacity-20" />
                </div>
                <p className="animate-pulse">AI is generating your cover and analyzing library...</p>
              </div>
            ) : suggestedIds.length > 0 ? (
              <div className="w-full space-y-6">
                <div className="relative group">
                  <img src={generatedCover!} className="w-48 h-48 mx-auto rounded-2xl shadow-2xl object-cover border border-white/10" alt="Generated Cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <button onClick={() => handleGenerate()} className="text-white text-xs font-bold bg-blue-600 px-4 py-2 rounded-full">Regenerate Cover</button>
                  </div>
                </div>
                
                <div className="space-y-2">
                   <h4 className="text-xs font-bold text-zinc-500 uppercase">Suggested Songs</h4>
                   {suggestedSongs.map(song => (
                     <div key={song.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg">
                       <img src={song.coverUrl} className="w-8 h-8 rounded" alt="" />
                       <span className="text-sm font-medium truncate">{song.title}</span>
                       <CheckCircle2 size={14} className="text-blue-500 ml-auto" />
                     </div>
                   ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                <Music2 size={64} className="opacity-10 mb-4" />
                <p className="text-center">Select a preset or enter a prompt to start</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-black/40 border-t border-white/5 flex gap-4">
          <input 
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            className="flex-1 bg-transparent border-none text-white focus:outline-none text-lg font-bold placeholder:text-zinc-600"
            placeholder="Playlist Name"
          />
          <button 
            onClick={handleSave}
            disabled={suggestedIds.length === 0}
            className="px-8 py-3 bg-white text-black hover:bg-zinc-200 disabled:opacity-20 rounded-2xl font-bold transition-all"
          >
            Create Playlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartPlaylistCreator;
