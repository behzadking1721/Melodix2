
import React, { useState } from 'react';
import { Song } from '../types';
import { 
  X, Sparkles, Save, Info, HardDrive, 
  CheckCircle2, Globe, Search, ArrowRight, 
  AlertTriangle, RefreshCcw, Image as ImageIcon,
  Check, Edit3
} from 'lucide-react';
import { MetadataFetcher } from '../services/metadataService';

interface TagEditorProps {
  song: Song;
  onClose: () => void;
  onSave: (updatedSong: Song) => void;
}

const TagEditor: React.FC<TagEditorProps> = ({ song, onClose, onSave }) => {
  const [editedSong, setEditedSong] = useState<Song>({ ...song });
  const [previewData, setPreviewData] = useState<Partial<Song> | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAutoFix = async () => {
    setIsFixing(true);
    setError(null);
    try {
      const suggestion = await MetadataFetcher.fetchAdvancedMetadata(editedSong);
      setPreviewData(suggestion);
    } catch (e: any) {
      setError(e.message || "Failed to fetch metadata.");
    } finally {
      setIsFixing(false);
    }
  };

  const applyPreview = () => {
    if (previewData) {
      setEditedSong(prev => ({ ...prev, ...previewData }));
      setPreviewData(null);
    }
  };

  const handleFinalSave = async () => {
    setIsSaving(true);
    try {
      const success = await MetadataFetcher.writeToFile(editedSong);
      if (success) {
        onSave(editedSong);
        onClose();
      }
    } catch (e) {
      setError("File I/O Error: Permission denied or file in use.");
    } finally {
      setIsSaving(false);
    }
  };

  const InputField = ({ label, value, field, type = "text" }: { label: string, value: any, field: keyof Song, type?: string }) => (
    <div className="space-y-1.5" dir="rtl">
      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-1">{label}</label>
      <input 
        type={type}
        value={value ?? ''}
        onChange={(e) => setEditedSong({ ...editedSong, [field]: type === 'number' ? Number(e.target.value) : e.target.value })}
        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-bold text-white"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#121212] rounded-[3rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500 shadow-inner">
              <Edit3 size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">ویرایشگر متادیتا</h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">TagLib# Logic Integration</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold animate-in slide-in-from-top-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {previewData ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
              <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-white">پیش‌نمایش تغییرات هوشمند</h4>
                  <p className="text-xs text-blue-400">اطلاعات جدید بر اساس MusicBrainz Picard استخراج شد.</p>
                </div>
                <Sparkles className="text-blue-500 animate-pulse" size={32} />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4 opacity-40 grayscale">
                  <p className="text-[10px] font-black text-zinc-500 uppercase text-center">متادیتای فعلی</p>
                  <div className="p-5 bg-white/5 rounded-3xl space-y-3 text-xs">
                    <p><b>عنوان:</b> {song.title}</p>
                    <p><b>هنرمند:</b> {song.artist}</p>
                    <p><b>آلبوم:</b> {song.album}</p>
                    <p><b>سال:</b> {song.year}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-blue-500 uppercase text-center">پیشنهاد هوش مصنوعی</p>
                  <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-3xl space-y-3 text-xs text-blue-100 shadow-2xl">
                    <p><b>عنوان:</b> {previewData.title}</p>
                    <p><b>هنرمند:</b> {previewData.artist}</p>
                    <p><b>آلبوم:</b> {previewData.album}</p>
                    <p><b>سال:</b> {previewData.year}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={applyPreview} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                  <Check size={18} /> تایید و جایگزینی
                </button>
                <button onClick={() => setPreviewData(null)} className="flex-1 py-4 bg-white/5 text-zinc-400 font-black rounded-2xl hover:bg-white/10 transition-all">
                  انصراف
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="relative group rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 aspect-square bg-zinc-900">
                  <img src={editedSong.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-all">
                      <ImageIcon size={24} />
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={handleAutoFix}
                  disabled={isFixing}
                  className="w-full flex items-center justify-center gap-3 text-[10px] font-black text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
                >
                  <Sparkles size={16} className={isFixing ? 'animate-spin' : ''} />
                  {isFixing ? 'در حال تحلیل دیتابیس...' : 'بهینه‌سازی خودکار (Auto Fix)'}
                </button>
              </div>

              <div className="space-y-4">
                <InputField label="عنوان آهنگ" value={editedSong.title} field="title" />
                <InputField label="نام هنرمند" value={editedSong.artist} field="artist" />
                <InputField label="نام آلبوم" value={editedSong.album} field="album" />
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="ژانر" value={editedSong.genre} field="genre" />
                  <InputField label="سال انتشار" value={editedSong.year} field="year" type="number" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="شماره ترک" value={editedSong.trackNumber || 1} field="trackNumber" type="number" />
                  <div className="space-y-1.5" dir="rtl">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-1">تراز صدا (Gain)</label>
                    <div className="bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-blue-400 font-mono flex items-center justify-between">
                      {editedSong.replayGain ? `${editedSong.replayGain} dB` : 'تحلیل نشده'}
                      <RefreshCcw size={12} className="opacity-40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!previewData && (
          <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
            <button 
              onClick={handleFinalSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 font-black py-4 rounded-2xl transition-all shadow-2xl bg-white text-black hover:bg-zinc-200 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <><Save size={20} /> ذخیره در فایل (TagLib#)</>
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
