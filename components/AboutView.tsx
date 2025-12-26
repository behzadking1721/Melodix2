
import React, { useState } from 'react';
import { 
  Shield, Github, Heart, Cpu, Zap, Info, 
  ExternalLink, Code2, ScrollText, AlertCircle,
  FileCode, Layers, Terminal, Speaker, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

const LIBRARIES = [
  { name: 'NAudio', license: 'MIT', role: 'پایه موتور پردازش صوتی', link: 'https://github.com/naudio/NAudio' },
  { name: 'TagLib#', license: 'LGPL', role: 'مدیریت متادیتا و فایل‌ها', link: 'https://github.com/mono/taglib-sharp' },
  { name: 'LiteDB', license: 'MIT', role: 'دیتابیس ابری محلی سریع', link: 'https://www.litedb.org/' },
  { name: 'Material Design XAML', license: 'MIT', role: 'الگوهای طراحی بصری', link: 'https://materialdesigninxaml.net/' },
  { name: 'Framer Motion', license: 'MIT', role: 'ارکستراسیون انیمیشن‌ها', link: 'https://www.framer.com/motion/' },
  { name: 'Lucide Icons', license: 'ISC', role: 'سیستم آیکون‌های وکتور', link: 'https://lucide.dev/' }
];

const AboutView: React.FC = () => {
  const [showLicense, setShowLicense] = useState(false);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-12 pb-40" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Brand Header */}
        <header className="flex flex-col items-center text-center space-y-6">
          <MotionDiv 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-[var(--accent-color)] rounded-[2.5rem] flex items-center justify-center accent-glow"
          >
            <Zap size={48} fill="white" className="text-white" />
          </MotionDiv>
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter text-[var(--text-primary)]">Melodix AI</h1>
            <p className="text-zinc-500 font-bold">نسخه 6.0.42 (نسخه پایدار)</p>
          </div>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            ملودیکس یک موزیک‌پلیر مدرن و هوشمند است که با تمرکز بر کیفیت صدای بی‌نقص و رابط کاربری مینیمال طراحی شده است. 
            این پروژه با الهام از Dopamine و Zune، قدرت پردازش محلی را با هوش مصنوعی Gemini ترکیب می‌کند.
          </p>
        </header>

        {/* Features & Tech */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Cpu, label: 'موتور صوتی', val: '64-bit DSP' },
            { icon: Shield, label: 'حریم خصوصی', val: 'کاملاً آفلاین' },
            { icon: Zap, label: 'هوش مصنوعی', val: 'Gemini Pro' }
          ].map(item => (
            <div key={item.label} className="p-8 mica rounded-[2rem] text-center space-y-3">
              <item.icon className="mx-auto text-[var(--accent-color)]" size={24} />
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{item.label}</p>
              <p className="font-bold text-[var(--text-primary)]">{item.val}</p>
            </div>
          ))}
        </section>

        {/* Libraries Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <Code2 size={24} className="text-[var(--accent-color)]" />
            <h3 className="text-2xl font-black">کتابخانه‌های اوپن‌سورس</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LIBRARIES.map((lib) => (
              <div key={lib.name} className="p-6 mica rounded-3xl flex items-center justify-between group hover:bg-[var(--surface-hover)] transition-all">
                <div className="space-y-1">
                  <h4 className="font-bold text-[var(--text-primary)]">{lib.name}</h4>
                  <p className="text-xs text-[var(--text-secondary)]">{lib.role}</p>
                  <span className="inline-block px-2 py-0.5 bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-[8px] font-black rounded">{lib.license}</span>
                </div>
                <a href={lib.link} target="_blank" className="p-3 text-zinc-500 hover:text-[var(--accent-color)] transition-colors">
                  <Github size={20} />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Actions */}
        <footer className="flex flex-col items-center gap-8 pt-10 border-t border-[var(--border-color)]">
          <div className="flex gap-4">
            <button 
              onClick={() => setShowLicense(true)}
              className="px-8 py-3 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border-color)] rounded-2xl text-sm font-bold flex items-center gap-2 transition-all"
            >
              <ScrollText size={18} /> مشاهده لایسنس Melodix
            </button>
            <button className="px-8 py-3 bg-[var(--accent-color)] text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all accent-glow">
              <Github size={18} /> گیت‌هاب پروژه
            </button>
          </div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">Engineering by MelodixLabs • 2025</p>
        </footer>
      </div>

      {/* License Modal */}
      <AnimatePresence>
        {showLicense && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8">
            <MotionDiv 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setShowLicense(false)} 
            />
            <MotionDiv 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl mica p-10 rounded-[3rem] max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black">Melodix Open License</h3>
                <button onClick={() => setShowLicense(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-xs text-[var(--text-secondary)] leading-relaxed space-y-6 pl-4" dir="ltr">
                <p>Copyright (c) 2025 MelodixLabs</p>
                <p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files...</p>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-[var(--text-primary)] font-bold mb-2">Notice on NAudio:</p>
                  <p>This software utilizes NAudio (Microsoft Public License) for professional audio output. No changes were made to the core logic of NAudio.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-[var(--text-primary)] font-bold mb-2">Notice on Dopamine UI:</p>
                  <p>Design principles and layout patterns are inspired by the Dopamine music player. All code in Melodix is original and does not violate GPL/LGPL terms.</p>
                </div>
              </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AboutView;
