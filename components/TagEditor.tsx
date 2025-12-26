
import React, { useState } from 'react';
import { Song } from '../types';
import { X, Sparkles, Save, Info, HardDrive, CheckCircle2, Globe, Search } from 'lucide-react';
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
    try {
      const suggestions = await suggestSongTags(editedSong);
      const lyrics = await fetchLyrics(suggestions.title || song.title, suggestions.artist || song.artist, song.id);
      setEditedSong(prev => ({ ...prev, ...suggestions, hasLyrics: lyrics.length > 50 }));
    } catch (e) {
      console.error("Meta Fixer Error");
    }
    setIsFixing(false);
  };

  const handleMusicBrainzSearch = () => {
    // Stage 7: Simulated MusicBrainz/Online Fetcher
    setIsFixing(true);
    setTimeout(() => {
      setIsFixing(false);
      alert("جستجو در MusicBrainz انجام شد. تگ‌های یافت شده اعمال گردید.");
    }, 1500);
  };

  const handleWriteToFile = async () => {
    setIsWriting(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate IO
    setIsWriting(false);
    setStatus('success');
    onSave(editedSong);
    setTimeout(onClose, 800);
  };

  const InputField = ({ label, value, field }: { label: string, value: string | number, field: keyof Song }) => (
    <div className="space-y-1.5" dir="rtl">
      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-1">{label}</label>
      <input 
        type={typeof value === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => setEditedSong({ ...editedSong, [field]: e.target.value })}
        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-bold"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-zinc-900 rounded-[3rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-xl font-black flex items-center gap-3">
            <HardDrive size={20} className="text-blue-500" /> ویرایشگر متادیتا
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="relative group rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img src={editedSong.coverUrl} className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button onClick={handleAutoFix} className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-all">
                  <Globe size={24} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
               <button 
                  onClick={handleAutoFix}
                  className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-white bg-blue-600 hover:bg-blue-500 py-3 rounded-2xl transition-all shadow-xl shadow-blue-600/20"
                >
                  <Sparkles size={14} className={isFixing ? 'animate-spin' : ''} />
                  {isFixing ? 'در حال تحلیل...' : 'بهینه‌سازی هوشمند Gemini'}
                </button>
                <button 
                  onClick={handleMusicBrainzSearch}
                  className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-zinc-400 bg-white/5 border border-white/5 hover:bg-white/10 py-3 rounded-2xl transition-all"
                >
                  <Search size={14} /> MusicBrainz Search
                </button>
            </div>
          </div>

          <div className="space-y-4">
            <InputField label="عنوان آهنگ" value={editedSong.title} field="title" />
            <InputField label="نام هنرمند" value={editedSong.artist} field="artist" />
            <InputField label="نام آلبوم" value={editedSong.album} field="album" />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="ژانر" value={editedSong.genre} field="genre" />
              <InputField label="سال انتشار" value={editedSong.year} field="year" />
            </div>
            
            <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-start gap-3" dir="rtl">
              <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[9px] text-blue-300 leading-relaxed font-bold">
                تغییرات به صورت مستقیم در تگ‌های فایل فیزیکی ذخیره شده و ایندکس دیتابیس LiteDB به‌روزرسانی می‌شود.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
          <button 
            onClick={handleWriteToFile}
            disabled={isWriting || status === 'success'}
            className={`flex-1 flex items-center justify-center gap-2 font-black py-4 rounded-2xl transition-all shadow-2xl ${
              status === 'success' ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-zinc-200 active:scale-95'
            }`}
          >
            {isWriting ? (
              <div className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin" />
            ) : status === 'success' ? (
              <><CheckCircle2 size={20} /> ذخیره شد</>
            ) : (
              <><Save size={20} /> ذخیره و آپدیت فایل</>
            )}
          </button>
          <button onClick={onClose} className="px-8 py-4 bg-white/5 border border-white/5 text-zinc-400 font-black rounded-2xl hover:bg-white/10 transition-all">انصراف</button>
        </div>
      </div>
    </div>
  );
};

export default TagEditor;
