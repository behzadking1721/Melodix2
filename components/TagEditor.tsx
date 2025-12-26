
import React, { useState } from 'react';
import { Song } from '../types';
import { X, Sparkles, Save, Info, HardDrive, CheckCircle2 } from 'lucide-react';
import { suggestSongTags, fetchLyrics } from '../services/geminiService';

interface TagEditorProps {
  song: Song;
  onClose: () => void;
  onSave: (updatedSong: Song) => void;
}

const TagEditor: React.FC<TagEditorProps> = ({ song, onClose, onSave }) => {
  const [editedSong, setEditedSong] = useState<Song>({ ...song });
  const [isFixing, setIsFixing] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleAutoFix = async () => {
    setIsFixing(true);
    const suggestions = await suggestSongTags(editedSong);
    // Also fetch lyrics for embedding
    // Fix: Added the required third argument (songId) to fetchLyrics
    const lyrics = await fetchLyrics(suggestions.title || song.title, suggestions.artist || song.artist, song.id);
    setEditedSong(prev => ({ ...prev, ...suggestions }));
    setIsFixing(false);
  };

  const handleWriteToFile = async () => {
    setIsWriting(true);
    // Simulate File System Access and ID3 Tag Writing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsWriting(false);
    setStatus('success');
    onSave(editedSong);
    setTimeout(onClose, 1000);
  };

  const InputField = ({ label, value, field }: { label: string, value: string | number, field: keyof Song }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">{label}</label>
      <input 
        type={typeof value === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => setEditedSong({ ...editedSong, [field]: e.target.value })}
        className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#2c2c2c] rounded-2xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <HardDrive size={18} className="text-blue-400" />
            Local File Editor
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-4 mb-6">
            <img src={editedSong.coverUrl} className="w-24 h-24 rounded-xl object-cover shadow-lg border border-white/5" alt="" />
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-xs text-blue-400 font-bold uppercase mb-1">AI Metadata Sync</p>
              <h4 className="font-bold truncate">{editedSong.title}</h4>
              <p className="text-sm text-zinc-500 truncate">{editedSong.artist}</p>
              <button 
                onClick={handleAutoFix}
                className="mt-3 flex items-center gap-2 text-xs font-bold text-white bg-blue-600/20 hover:bg-blue-600/40 px-3 py-1.5 rounded-lg border border-blue-500/30 transition-all"
              >
                <Sparkles size={12} className={isFixing ? 'animate-spin' : ''} />
                {isFixing ? 'Analyzing...' : 'Auto-Fix & Find Cover'}
              </button>
            </div>
          </div>

          <InputField label="Song Title" value={editedSong.title} field="title" />
          <InputField label="Artist" value={editedSong.artist} field="artist" />
          <InputField label="Album" value={editedSong.album} field="album" />
          
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Genre" value={editedSong.genre} field="genre" />
            <InputField label="Year" value={editedSong.year} field="year" />
          </div>
        </div>

        <div className="p-6 bg-black/20 flex gap-3 rounded-b-2xl">
          <button 
            onClick={handleWriteToFile}
            disabled={isWriting || status === 'success'}
            className={`flex-1 flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl transition-all ${
              status === 'success' ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isWriting ? (
              <>
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Writing ID3 Tags...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 size={18} />
                Saved to File
              </>
            ) : (
              <>
                <Save size={16} />
                Save & Update Local File
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagEditor;
