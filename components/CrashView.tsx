
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Copy, Download, RefreshCcw, Terminal, Zap } from 'lucide-react';
import { logger } from '../services/logger';

interface CrashViewProps {
  error: Error | null;
  onRestart: () => void;
}

const CrashView: React.FC<CrashViewProps> = ({ error, onRestart }) => {
  const generateReport = () => {
    const report = {
      version: '6.0.42',
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message,
        stack: error?.stack,
      },
      recentLogs: logger.getLogs().slice(-20),
      environment: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        memory: (performance as any).memory?.usedJSHeapSize
      }
    };
    return JSON.stringify(report, null, 2);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateReport());
    alert("Report copied to clipboard.");
  };

  const downloadReport = () => {
    const blob = new Blob([generateReport()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `melodix-crash-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/30 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full max-w-3xl space-y-12">
        <header className="flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 bg-red-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.5)]">
            <AlertTriangle size={48} className="text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter">Melodix has crashed</h1>
            <p className="text-zinc-500 font-bold text-lg">A critical error caused the system to stop working.</p>
          </div>
        </header>

        <div className="mica bg-red-600/5 border-red-600/20 p-8 rounded-[3rem] space-y-6 text-left">
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <Terminal size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Stack Trace Preview</span>
          </div>
          <div className="bg-black/40 p-6 rounded-2xl font-mono text-[11px] text-red-300/80 overflow-x-auto whitespace-pre border border-red-900/20 max-h-48 custom-scrollbar">
            {error?.stack || error?.message || "No stack trace available."}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <button 
            onClick={onRestart}
            className="px-10 py-4 bg-white text-black rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-2xl"
          >
            <RefreshCcw size={18} /> Restart Melodix
          </button>
          <button 
            onClick={copyToClipboard}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black flex items-center gap-3 border border-white/5 transition-all"
          >
            <Copy size={18} /> Copy Error Report
          </button>
          <button 
            onClick={downloadReport}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black flex items-center gap-3 border border-white/5 transition-all"
          >
            <Download size={18} /> Download JSON Report
          </button>
        </div>

        <footer className="text-center pt-8 border-t border-white/5 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-zinc-600">
            <Zap size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Melodix Labs Disaster Recovery Engine</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CrashView;
