
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, CheckCircle2, AlertCircle, Clock, 
  Pause, Play, X, RotateCcw, Trash2, 
  Download, ListChecks, History, AlertTriangle,
  PlayCircle, PauseCircle, Trash, ExternalLink
} from 'lucide-react';
import { DownloadTask } from '../types';
import { enhancementEngine } from '../services/enhancementEngine';

const MotionDiv = motion.div as any;

interface DownloadsManagerViewProps {
  tasks: DownloadTask[];
}

const DownloadsManagerView: React.FC<DownloadsManagerViewProps> = ({ tasks }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'failed'>('all');

  const stats = useMemo(() => ({
    active: tasks.filter(t => t.status === 'processing' || t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    switch(activeTab) {
      case 'active': return tasks.filter(t => t.status === 'processing' || t.status === 'pending' || t.status === 'paused');
      case 'completed': return tasks.filter(t => t.status === 'completed');
      case 'failed': return tasks.filter(t => t.status === 'failed');
      default: return tasks;
    }
  }, [tasks, activeTab]);

  // Added key to props type definition to fix TypeScript assignment errors
  const TaskItem = ({ task }: { task: DownloadTask, key?: React.Key }) => (
    <MotionDiv 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.04] transition-all"
    >
      <div className="relative w-14 h-14 shrink-0 rounded-2xl overflow-hidden shadow-2xl">
        <img src={task.coverUrl} className="w-full h-full object-cover" alt="" />
        {task.status === 'processing' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="text-[var(--accent-color)]"
            >
              <RotateCcw size={16} />
            </motion.div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-white truncate">{task.songTitle}</h4>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{task.artist}</p>
          </div>
          <div className="text-right">
             <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
               task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
               task.status === 'failed' ? 'bg-red-500/10 text-red-500' :
               task.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
               'bg-zinc-800 text-zinc-500'
             }`}>
               {task.status}
             </span>
          </div>
        </div>

        {(task.status === 'processing' || task.status === 'pending') && (
          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-glow)]"
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest">
              <span>{task.type.replace('-', ' ')}</span>
              <span>{task.progress}%</span>
            </div>
          </div>
        )}

        {task.status === 'failed' && (
          <p className="text-[9px] text-red-400 font-medium italic flex items-center gap-1">
            <AlertTriangle size={10} /> {task.error}
          </p>
        )}

        {task.status === 'completed' && (
          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-1">
            <CheckCircle2 size={10} className="text-emerald-500" /> Optimization Successful
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.status === 'failed' && (
          <button 
            onClick={() => enhancementEngine.retryTask(task.id)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all"
            title="Retry"
          >
            <RotateCcw size={16} />
          </button>
        )}
        {(task.status === 'pending' || task.status === 'processing') && (
           <button 
            onClick={() => enhancementEngine.removeTask(task.id)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-red-500 transition-all"
            title="Cancel"
           >
             <X size={16} />
           </button>
        )}
        {(task.status === 'completed' || task.status === 'failed') && (
          <button 
            onClick={() => enhancementEngine.removeTask(task.id)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-red-500 transition-all"
            title="Remove from list"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </MotionDiv>
  );

  return (
    <div className="h-full flex flex-col p-12 overflow-hidden bg-transparent">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-[var(--accent-color)] rounded-[1.5rem] text-white accent-glow">
               <Download size={32} />
             </div>
             <div>
               <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Downloads</h2>
               <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Neural Task & Enhancement Manager</p>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
           <button 
            onClick={() => enhancementEngine.pauseAll()}
            className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all flex items-center gap-3"
           >
             <Pause size={14} /> Pause All
           </button>
           <button 
            onClick={() => enhancementEngine.resumeAll()}
            className="px-8 py-3.5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-2xl"
           >
             <Play size={14} fill="black" /> Resume All
           </button>
           <div className="w-px h-10 bg-white/5 mx-2" />
           <button 
            onClick={() => enhancementEngine.clearCompleted()}
            className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all"
            title="Clear Completed"
           >
             <Trash size={18} />
           </button>
        </div>
      </header>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Active Tasks', value: stats.active, icon: Zap, color: 'text-blue-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Failures', value: stats.failed, icon: AlertCircle, color: 'text-red-500' }
        ].map(stat => (
          <div key={stat.label} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-white leading-none">{stat.value}</p>
            </div>
            <stat.icon className={stat.color} size={32} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-8">
        {[
          { id: 'all', label: 'All Tasks', icon: ListChecks },
          { id: 'active', label: 'Processing', icon: Zap },
          { id: 'completed', label: 'History', icon: History },
          { id: 'failed', label: 'Warnings', icon: AlertTriangle }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-xl' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-40">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <MotionDiv 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-64 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="p-8 bg-white/5 rounded-full text-zinc-800">
                 <Download size={48} className="opacity-10" />
              </div>
              <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.3em]">No {activeTab} downloads tracked</p>
            </MotionDiv>
          ) : (
            <div className="space-y-4">
               {filteredTasks.map(task => <TaskItem key={task.id} task={task} />)}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DownloadsManagerView;
