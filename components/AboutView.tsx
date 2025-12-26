
import React from 'react';
import { Shield, Github, Heart, Cpu, Zap, Info, ExternalLink, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LIBRARIES = [
  { name: 'NAudio / CSCore', license: 'MIT/MS-PL', role: 'Audio Engine & DSP Architectures', link: 'https://github.com/naudio/NAudio' },
  { name: 'TagLib#', license: 'LGPL', role: 'Metadata & Tagging Logic Reference', link: 'https://github.com/mono/taglib-sharp' },
  { name: 'LyricsX', license: 'MIT', role: 'Synced LRC Lyrics Algorithms', link: 'https://github.com/ddddxxx/LyricsX' },
  { name: 'Dopamine UI', license: 'GPL (Inspiration)', role: 'WPF Architecture & Layout Pattern', link: 'https://github.com/digimezzo/dopamine' },
  { name: 'Google Gemini', license: 'Proprietary', role: 'Neural Metadata & Lyrics API', link: 'https://ai.google.dev/' },
  { name: 'Lucide Icons', license: 'ISC', role: 'Vector Interface Assets', link: 'https://lucide.dev/' },
];

const AboutView: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-12 pb-40 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Brand Header */}
        <header className="flex items-center gap-8">
          <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-600/30">
            <Zap size={48} fill="white" className="text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-white">Melodix AI</h1>
            <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-xs mt-2">Enterprise Audio Station • v5.8.0</p>
          </div>
        </header>

        {/* Mission Statement */}
        <section className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-4">
          <div className="flex items-center gap-3 text-blue-400">
            <Shield size={20} />
            <h3 className="font-black uppercase tracking-widest text-xs">Architectural Philosophy</h3>
          </div>
          <p className="text-zinc-400 leading-relaxed font-medium">
            ملودیکس یک پروژه متن‌باز نیست، اما بر شانه‌های غول‌های دنیای اوپن‌سورس ایستاده است. 
            ما از الگوریتم‌های پیشرفته DSP پروژه‌هایی مثل NAudio و ساختار مدیریت کتابخانه Dopamine الهام گرفته‌ایم تا تجربه‌ای بی‌نظیر 
            در پلتفرم وب با استفاده از قدرت هوش مصنوعی Gemini خلق کنیم.
          </p>
        </section>

        {/* Library Table (Stage 7) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Code2 className="text-purple-500" /> Open Source Credits
            </h3>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Stage 7 Compliance</span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {LIBRARIES.map((lib, i) => (
              <motion.a
                key={lib.name}
                href={lib.link}
                target="_blank"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-blue-400 transition-colors">
                    <Github size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{lib.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">{lib.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-mono text-zinc-600 px-2 py-1 bg-white/5 rounded uppercase">{lib.license}</span>
                  <ExternalLink size={14} className="text-zinc-700 group-hover:text-white transition-colors" />
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Tech Stack Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl text-center space-y-2">
            <Cpu size={24} className="mx-auto text-blue-500" />
            <h5 className="font-black text-white text-xs uppercase tracking-widest">Audio Engine</h5>
            <p className="text-[10px] text-zinc-500">WebAudio DSP v2</p>
          </div>
          <div className="p-6 bg-purple-600/5 border border-purple-500/10 rounded-3xl text-center space-y-2">
            <Zap size={24} className="mx-auto text-purple-500" />
            <h5 className="font-black text-white text-xs uppercase tracking-widest">Neural Sync</h5>
            <p className="text-[10px] text-zinc-500">Gemini 3.0 Pro</p>
          </div>
          <div className="p-6 bg-pink-600/5 border border-pink-500/10 rounded-3xl text-center space-y-2">
            <Heart size={24} className="mx-auto text-pink-500" />
            <h5 className="font-black text-white text-xs uppercase tracking-widest">Handcrafted UI</h5>
            <p className="text-[10px] text-zinc-500">React + Framer</p>
          </div>
        </div>

        <footer className="text-center py-10 opacity-20 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 flex items-center justify-center gap-3">
            Designed by <span className="text-white">MelodixLabs</span> • 2025
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AboutView;
