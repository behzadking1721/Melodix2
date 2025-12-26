
import React, { useState } from 'react';
import { AppSettings } from '../types';
import { 
  Monitor, HardDrive, Palette, Zap, 
  Cpu, Trash2, Database, ShieldCheck, Filter, 
  VolumeX, Download, RefreshCcw, Activity, Speaker,
  Sun, Moon, Laptop
} from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const ACCENT_COLORS = [
  { name: 'Classic Blue', hex: '#3b82f6' },
  { name: 'Royal Purple', hex: '#8b5cf6' },
  { name: 'Deep Pink', hex: '#ec4899' },
  { name: 'Sunset Red', hex: '#ef4444' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Amber Glow', hex: '#f59e0b' },
  { name: 'Minimal White', hex: '#ffffff' }
];

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleDeepScan = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsScanning(false);
    alert("Scan Complete: Neural index updated.");
  };

  const Toggle = ({ label, description, value, field }: { label: string, description: string, value: boolean, field: keyof AppSettings }) => (
    <div 
      className="flex items-center justify-between p-5 bg-white/[0.02] rounded-[1.5rem] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group" 
      onClick={() => onUpdate({ ...settings, [field]: !value })}
    >
      <div className="space-y-0.5" dir="rtl">
        <p className="font-bold text-sm text-white group-hover:text-[var(--accent-color)] transition-colors">{label}</p>
        <p className="text-[10px] text-zinc-500">{description}</p>
      </div>
      <div className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-[var(--accent-color)]' : 'bg-zinc-800'}`}>
        <MotionDiv 
          animate={{ x: value ? 24 : 4 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg" 
        />
      </div>
    </div>
  );

  return (
    <div className="p-12 max-w-6xl space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-40">
      <div className="flex items-center justify-between" dir="rtl">
        <div>
          <h2 className="text-5xl font-black mb-2 tracking-tighter text-white">معماری سیستم</h2>
          <p className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.4em]">Melodix Enterprise Engine v6.0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Visuals Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4" dir="rtl">
            <Palette size={20} className="text-purple-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">اتمسفر و رابط کاربری</h3>
          </div>
          
          <div className="space-y-6">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6">
              <div className="flex justify-between items-center" dir="rtl">
                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">رنگ سازمانی (Accent)</p>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: settings.accentColor }} />
              </div>
              <div className="flex flex-wrap gap-4">
                {ACCENT_COLORS.map(color => (
                  <button 
                    key={color.hex} 
                    onClick={() => onUpdate({...settings, accentColor: color.hex})}
                    className={`w-10 h-10 rounded-2xl border-2 transition-all hover:scale-110 ${settings.accentColor === color.hex ? 'border-white scale-110 shadow-[0_0_20px_var(--accent-glow)]' : 'border-transparent'}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-4">
               <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest text-center">حالت روشنایی</p>
               <div className="flex gap-3 p-1.5 bg-black/40 rounded-2xl">
                {[
                  { mode: 'light', icon: Sun, label: 'روشن' },
                  { mode: 'dark', icon: Moon, label: 'تاریک' },
                  { mode: 'auto', icon: Laptop, label: 'خودکار' }
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => onUpdate({ ...settings, themeMode: mode as any })}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${settings.themeMode === mode ? 'bg-white text-black shadow-xl' : 'text-zinc-600 hover:text-white'}`}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
            </div>

            <Toggle label="تجسم‌ساز فرکانس (Visualizer)" description="رندرینگ ۶۰ فریم بر ثانیه طیف صوتی." value={settings.visualizationEnabled} field="visualizationEnabled" />
            <Toggle label="نمایش موجی (Waveform)" description="نمایش گرافیکی قله‌های صوتی در نوار پیشرفت." value={settings.waveformEnabled} field="waveformEnabled" />
          </div>
        </section>

        {/* Engine Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4" dir="rtl">
            <Cpu size={20} className="text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">موتور پردازش صوتی</h3>
          </div>
          
          <div className="space-y-6">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-black text-zinc-500 uppercase tracking-widest" dir="rtl">
                  <span>محو شدن آهنگ (Crossfade)</span>
                  <span className="text-[var(--accent-color)] font-mono">{settings.crossfadeSec} ثانیه</span>
                </div>
                <input 
                  type="range" min="0" max="10" step="1" value={settings.crossfadeSec}
                  onChange={(e) => onUpdate({...settings, crossfadeSec: Number(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5" dir="rtl">
                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Speaker size={12}/> خروجی صدا (ASIO/WASAPI)
                </p>
                <select 
                  value={settings.audioDevice}
                  onChange={(e) => onUpdate({...settings, audioDevice: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                >
                  <option value="default">Default System Output</option>
                  <option value="wasapi-exclusive">WASAPI Exclusive Mode</option>
                  <option value="asio">ASIO High-Fidelity Interface</option>
                </select>
              </div>
            </div>
            
            <Toggle label="تراز صوتی خودکار" description="استانداردسازی بلندی صدا در -14 LUFS." value={settings.autoNormalize} field="autoNormalize" />
            <Toggle label="پخش بدون وقفه (Gapless)" description="حذف سکوت بین قطعات موسیقی." value={settings.gaplessPlayback} field="gaplessPlayback" />
          </div>
        </section>
      </div>

      <MotionDiv 
        whileHover={{ scale: 1.01 }}
        className="p-10 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 rounded-[3rem] flex items-center gap-10 relative overflow-hidden group"
      >
        <Database className="text-blue-500/10 absolute -right-8 -bottom-8 group-hover:scale-110 transition-transform duration-1000" size={200} />
        <div className="space-y-6 relative z-10" dir="rtl">
          <h4 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
            <ShieldCheck className="text-emerald-500" /> امنیت و ایندکس محلی
          </h4>
          <p className="text-sm text-zinc-400 leading-relaxed font-medium max-w-2xl">
            تمام داده‌های متادیتای شما به‌صورت رمزنگاری شده در دیتابیس داخلی (Neural Index) ذخیره می‌شوند. Melodix هیچ‌گونه فایلی را بدون اجازه شما به سرورهای ابری منتقل نمی‌کند.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={handleDeepScan}
              className="px-8 py-4 bg-[var(--accent-color)] hover:opacity-90 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl"
            >
              <Zap size={16} fill="currentColor" /> اسکن عمیق کتابخانه
            </button>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
              پاکسازی کش
            </button>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
};

export default SettingsView;
