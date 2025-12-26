
import React, { useState } from 'react';
import { Song } from '../types';
import { X, Sparkles, Save, Info, HardDrive, CheckCircle2, Globe, Search, ArrowRight, AlertTriangle } from 'lucide-react';
import { fetchLyrics } from '../services/geminiService';
import { MetadataFetcher } from '../services/metadataService';

interface TagEditorProps {
  song: Song;
  onClose: () => void;
  onSave: (updatedSong: Song) => void;
}

const TagEditor: React.FC<TagEditorProps> = ({ song, onClose, onSave }) => {
  const [editedSong, setEditedSong] = useState<Song>({ ...song });
  const [previewSong, setPreviewSong] = useState<Partial<Song> | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleAutoFix = async () => {
    setIsFixing(true);
    try {
      const suggestions = await MetadataFetcher.fetchAdvancedMetadata(editedSong);
      // Instead of applying immediately, we show a preview (Stage 2 requirement)
      setPreviewSong(suggestions);
    } catch (e) {
      alert("Metadata sync failed. Check your connection.");
    }
    setIsFixing(false);
  };

  const applyPreview = () => {
    if (previewSong) {
      setEditedSong(prev => ({ ...prev, ...previewSong }));
      setPreviewSong(null);
    }
  };

  const handleWriteToFile = async () => {
    setIsWriting(true);
    try {
      const success = await MetadataFetcher.writeToFile(editedSong);
      if (success) {
        setStatus('success');
        onSave(editedSong);
        setTimeout(onClose, 800);
      }
    } catch (e) {
      alert("File is busy or read-only.");
    }
    setIsWriting(false);
  };

  const InputField = ({ label, value, field, isChanged }: { label: string, value: string | number, field: keyof Song, isChanged?: boolean }) => (
    <div className="space-y-1.5" dir="rtl">
      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-1 flex items-center gap-2">
        {label}
        {isChanged && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
      </label>
      <input 
        type={typeof value === 'number' ? 'number' : 'text'}
        value={value ?? ''}
        onChange={(e) => setEditedSong({ ...editedSong, [field]: typeof value === 'number' ? Number(e.target.value) : e.target.value })}
        className={`w-full bg-black/40 border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all font-bold ${isChanged ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5 focus:border-blue-500/30'}`}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-zinc-900 rounded-[3rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500">
              <HardDrive size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black">ویرایشگر متادیتا</h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">TagLib# Logic Layer v2.0</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {previewSong ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
              <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-white">پیش‌نمایش تغییرات هوشمند</h4>
                  <p className="text-xs text-blue-400">اطلاعات جدید از پایگاه داده MusicBrainz استخراج شد.</p>
                </div>
                <Sparkles className="text-blue-500 animate-pulse" size={32} />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4 opacity-50">
                  <p className="text-[10px] font-black text-zinc-500 uppercase">مقادیر فعلی</p>
                  <div className="p-4 bg-white/5 rounded-2xl space-y-2 text-xs">
                    <p><b>عنوان:</b> {song.title}</p>
                    <p><b>هنرمند:</b> {song.artist}</p>
                    <p><b>آلبوم:</b> {song.album}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-blue-500 uppercase">پیشنهاد Melodix</p>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-2 text-xs text-blue-100">
                    <p><b>عنوان:</b> {previewSong.title}</p>
                    <p><b>هنرمند:</b> {previewSong.artist}</p>
                    <p><b>آلبوم:</b> {previewSong.album}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={applyPreview} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> تایید و اعمال پیشنهاد
                </button>
                <button onClick={() => setPreviewSong(null)} className="flex-1 py-4 bg-white/5 text-zinc-400 font-black rounded-2xl hover:bg-white/10 transition-all">
                  رد کردن
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="relative group rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
                  <img src={editedSong.coverUrl} className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button onClick={handleAutoFix} className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-all">
                      <Globe size={24} />
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={handleAutoFix}
                  disabled={isFixing}
                  className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-white bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20"
                >
                  <Sparkles size={16} className={isFixing ? 'animate-spin' : ''} />
                  {isFixing ? 'در حال تحلیل...' : 'بهینه‌سازی هوشمند (Picard-Style)'}
                </button>
              </div>

              <div className="space-y-4">
                <InputField label="عنوان آهنگ" value={editedSong.title} field="title" />
                <InputField label="نام هنرمند" value={editedSong.artist} field="artist" />
                <InputField label="نام آلبوم" value={editedSong.album} field="album" />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="ژانر" value={editedSong.genre} field="genre" />
                  <InputField label="سال انتشار" value={editedSong.year} field="year" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="شماره ترک" value={editedSong.trackNumber || 1} field="trackNumber" />
                  <div className="space-y-1.5" dir="rtl">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-1">تراز صدا (Gain)</label>
                    <div className="bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-zinc-400 font-mono">
                      {editedSong.replayGain ? `${editedSong.replayGain} dB` : 'تحلیل نشده'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!previewSong && (
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
                <><CheckCircle2 size={20} /> با موفقیت ذخیره شد</>
              ) : (
                <><Save size={20} /> ذخیره تغییرات در فایل</>
              )}
            </button>
            <button onClick={onClose} className="px-8 py-4 bg-white/5 border border-white/5 text-zinc-400 font-black rounded-2xl hover:bg-white/10 transition-all">انصراف</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagEditor;
