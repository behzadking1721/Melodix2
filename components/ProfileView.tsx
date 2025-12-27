
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Award, Clock, Music2, TrendingUp, 
  Calendar, Flame, Sparkles, Trophy, 
  Star, Headphones, Zap, ShieldCheck,
  Disc, Mic2, Tags, BarChart3, PieChart,
  Activity, Sun, Moon, Lock
} from 'lucide-react';
import { Song } from '../types';

const MotionDiv = motion.div as any;

interface ProfileViewProps {
  songs: Song[];
  user?: {
    name: string;
    avatar: string;
    joinDate: string;
  };
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: any;
  unlocked: boolean;
  category: 'listening' | 'discovery' | 'enhancement';
}

const ProfileView: React.FC<ProfileViewProps> = ({ songs, user = { name: "Melodix User", avatar: "https://picsum.photos/seed/user123/400/400", joinDate: "2024" } }) => {
  
  // --- Analytics Logic ---
  const stats = useMemo(() => {
    const totalTimeSec = songs.reduce((acc, s) => acc + (s.duration * s.playCount), 0);
    const totalPlays = songs.reduce((acc, s) => acc + s.playCount, 0);
    
    const artistMap = new Map<string, number>();
    const genreMap = new Map<string, number>();
    
    songs.forEach(s => {
      artistMap.set(s.artist, (artistMap.get(s.artist) || 0) + s.playCount);
      genreMap.set(s.genre, (genreMap.get(s.genre) || 0) + 1);
    });

    const topArtists = Array.from(artistMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topGenres = Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const enhancedCount = songs.filter(s => s.tagStatus === 'full' && s.lyricsStatus === 'full').length;

    return {
      totalTime: {
        h: Math.floor(totalTimeSec / 3600),
        m: Math.floor((totalTimeSec % 3600) / 60)
      },
      totalPlays,
      uniqueArtists: artistMap.size,
      enhancedCount,
      topArtists,
      topGenres
    };
  }, [songs]);

  const badges: Badge[] = useMemo(() => [
    { id: '1', name: 'First Beat', description: 'Played your first track.', icon: PlayCircle, unlocked: stats.totalPlays > 0, category: 'listening' },
    { id: '2', name: 'Centurion', description: 'Played over 100 tracks.', icon: Trophy, unlocked: stats.totalPlays >= 100, category: 'listening' },
    { id: '3', name: 'Time Traveler', description: '10+ hours of music.', icon: Clock, unlocked: stats.totalTime.h >= 10, category: 'listening' },
    { id: '4', name: 'Explorer', description: 'Discover 20+ artists.', icon: Headphones, unlocked: stats.uniqueArtists >= 20, category: 'discovery' },
    { id: '5', name: 'Lyricist', description: 'Sync 10+ lyrics.', icon: Mic2, unlocked: songs.filter(s => s.hasLyrics).length >= 10, category: 'enhancement' },
    { id: '6', name: 'Tag Master', description: 'Optimized 50+ tracks.', icon: Tags, unlocked: stats.enhancedCount >= 50, category: 'enhancement' },
    { id: '7', name: 'Melodix Fan', description: 'Using Melodix for a year.', icon: Star, unlocked: true, category: 'discovery' },
    { id: '8', name: 'Night Owl', description: 'Listen after midnight.', icon: Moon, unlocked: true, category: 'listening' }
  ], [stats, songs]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-transparent p-12 pb-40">
      <MotionDiv 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-16"
      >
        
        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className="w-40 h-40 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/5 ring-4 ring-[var(--accent-color)]/20">
              <img src={user.avatar} className="w-full h-full object-cover" alt="User Avatar" />
            </div>
            <div className="absolute -bottom-2 -right-2 p-3 bg-[var(--accent-color)] text-white rounded-2xl shadow-xl accent-glow">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-6xl font-black text-white tracking-tighter leading-tight">{user.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em]">
              <span className="flex items-center gap-2 text-[var(--accent-color)]"><Calendar size={14}/> Member Since {user.joinDate}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <span className="flex items-center gap-2"><Zap size={14}/> Neural Core v6.0</span>
            </div>
          </div>
        </header>

        {/* --- Primary Stats Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Time Spent', val: `${stats.totalTime.h}h ${stats.totalTime.m}m`, icon: Clock, color: 'text-blue-500' },
            { label: 'Total Plays', val: stats.totalPlays, icon: PlayCircle, color: 'text-emerald-500' },
            { label: 'Artists Explored', val: stats.uniqueArtists, icon: Headphones, color: 'text-purple-500' },
            { label: 'AI Enhanced', val: stats.enhancedCount, icon: Zap, color: 'text-amber-500' }
          ].map(stat => (
            <MotionDiv key={stat.label} variants={itemVariants} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/[0.04] transition-all">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                <h4 className="text-3xl font-black text-white">{stat.val}</h4>
              </div>
              <stat.icon className={`${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} size={32} />
            </MotionDiv>
          ))}
        </div>

        {/* --- Charts & Habits Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Top Artists (Bar Chart) */}
          <MotionDiv variants={itemVariants} className="lg:col-span-2 p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <BarChart3 size={20} className="text-[var(--accent-color)]" /> Top Artists
                </h3>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Calculated by frequency</p>
              </div>
              <TrendingUp size={24} className="text-zinc-800" />
            </div>

            <div className="space-y-6">
              {stats.topArtists.map(([name, plays], i) => (
                <div key={name} className="space-y-2 group">
                   <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                     <span className="text-white group-hover:text-[var(--accent-color)] transition-colors">{name}</span>
                     <span className="text-zinc-600">{plays} plays</span>
                   </div>
                   <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(plays / stats.topArtists[0][1]) * 100}%` }}
                        transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                        className="h-full bg-gradient-to-r from-[var(--accent-color)] to-purple-600"
                     />
                   </div>
                </div>
              ))}
            </div>
          </MotionDiv>

          {/* Genre DNA (Pie/Ring Chart) */}
          <MotionDiv variants={itemVariants} className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center text-center space-y-8">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Genre DNA</h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Musical diversity breakdown</p>
            </div>
            
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                <circle 
                  cx="96" cy="96" r="80" 
                  stroke="currentColor" strokeWidth="12" fill="transparent" 
                  strokeDasharray={502} 
                  strokeDashoffset={150}
                  className="text-[var(--accent-color)]" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{stats.topGenres[0]?.[0] || 'N/A'}</span>
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">PRIMARY</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
               {stats.topGenres.map(([name, count], i) => (
                 <div key={name} className="flex flex-col items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                   <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">{name}</span>
                   <span className="text-xs font-bold text-white">{Math.round((count / songs.length) * 100)}%</span>
                 </div>
               ))}
            </div>
          </MotionDiv>
        </div>

        {/* --- Listening Patterns (Pattern Visualization) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Daily Listening Pulse (Line Graph Simulation) */}
          <MotionDiv variants={itemVariants} className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] space-y-8">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <Activity size={18} className="text-emerald-500" /> Weekly Pulse
            </h3>
            <div className="h-32 w-full flex items-end gap-2">
              {[40, 70, 45, 90, 65, 30, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className={`w-full rounded-t-xl ${i === 3 ? 'bg-emerald-500 accent-glow' : 'bg-white/10'}`}
                  />
                  <span className="text-[8px] font-black text-zinc-700 uppercase">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-[10px] text-emerald-500 font-bold uppercase tracking-widest text-center">
              Most active day: Thursday
            </div>
          </MotionDiv>

          {/* Time of Day Pattern */}
          <MotionDiv variants={itemVariants} className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] flex items-center gap-8">
            <div className="p-6 bg-amber-500/10 rounded-[2.5rem] text-amber-500">
               <Sun size={48} />
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-black text-white tracking-tight">Morning Bird</h3>
               <p className="text-xs text-zinc-500 leading-relaxed">Most of your sessions happen between 8:00 AM and 11:00 AM. You prefer starting your day with rhythm.</p>
               <div className="flex items-center gap-3 pt-2">
                 <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest px-3 py-1 bg-amber-500/10 rounded-full">Early Riser</span>
                 <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full">Focused</span>
               </div>
            </div>
          </MotionDiv>

        </div>

        {/* --- Achievement Badges Grid --- */}
        <section className="space-y-10">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-white flex items-center gap-4">
                <Trophy size={28} className="text-amber-500" /> Achievements
              </h3>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Milestones reached on your journey</p>
            </div>
            <div className="px-6 py-2 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-[var(--accent-color)]">
              {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {badges.map(badge => (
              <MotionDiv 
                key={badge.id}
                variants={itemVariants}
                whileHover={badge.unlocked ? { scale: 1.05, y: -5 } : {}}
                className={`relative p-8 rounded-[2.5rem] border transition-all flex flex-col items-center text-center gap-4 overflow-hidden ${
                  badge.unlocked 
                  ? 'bg-white/[0.03] border-white/10 group' 
                  : 'bg-black/40 border-white/5 grayscale opacity-60 cursor-not-allowed'
                }`}
              >
                {!badge.unlocked && (
                  <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                    <Lock size={20} className="text-zinc-700" />
                  </div>
                )}
                
                <div className={`p-5 rounded-3xl transition-all ${
                  badge.unlocked ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] shadow-xl' : 'bg-zinc-800 text-zinc-600'
                }`}>
                  <badge.icon size={32} />
                </div>
                
                <div className="space-y-1">
                  <h5 className="font-black text-sm text-white">{badge.name}</h5>
                  <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">{badge.description}</p>
                </div>

                {badge.unlocked && (
                  <div className="absolute top-0 right-0 p-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 accent-glow" />
                  </div>
                )}
              </MotionDiv>
            ))}
          </div>
        </section>

        {/* --- Monthly Activity Log --- */}
        <section className="p-10 bg-white/[0.02] border border-white/5 rounded-[4rem] space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <TrendingUp size={22} className="text-[var(--accent-color)]" /> Monthly Activity
            </h3>
            <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">Compare with last month</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Tracks Played', val: '1,248', change: '+12%', color: 'text-emerald-500' },
              { label: 'New Artists', val: '24', change: '+5%', color: 'text-emerald-500' },
              { label: 'Full Albums', val: '12', change: '-2%', color: 'text-rose-500' },
              { label: 'Enhancements', val: '156', change: '+45%', color: 'text-emerald-500' }
            ].map(log => (
              <div key={log.label} className="space-y-2">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{log.label}</p>
                <div className="flex items-baseline gap-3">
                   <span className="text-4xl font-black text-white">{log.val}</span>
                   <span className={`text-[10px] font-black ${log.color}`}>{log.change}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </MotionDiv>
    </div>
  );
};

// Sub-components used in badges
const PlayCircle = (props: any) => <div {...props}><Sparkles /></div>;

export default ProfileView;
