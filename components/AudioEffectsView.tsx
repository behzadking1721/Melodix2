
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Sliders, Zap, Wind, Speaker, 
  Headphones, Layers, Save, RefreshCw, 
  Sparkles, Wand2, Power, Globe, Info,
  ChevronRight, ArrowRight, Music, Flame,
  Waves, Box, Maximize2, RotateCcw
} from 'lucide-react';
import { EQSettings, AudioEffectSettings } from '../types';
import { AudioEngine } from '../services/audioEngine';

const MotionDiv = motion.div as any;

const FREQS_10 = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const PRESETS: Record<string, number[]> = {
  'Flat': [0,0,0,0,0,0,0,0,0,0],
  'Heavy Bass': [8, 7, 5, 2, 0, -2, -1, 0, 1, 2],
  'Crystal': [-2, -1, 0, 2, 4, 6, 8, 7, 5, 3],
  'Vocal Boost': [-3, -2, 0, 1, 3, 5, 4, 2, 1, 0],
  'Electronic': [6, 4, 1, 0, -2, 2, 4, 3, 5, 6]
};

const AudioEffectsView: React.FC = () => {
  // Added bass, mid, and treble properties to initialize EQSettings correctly and resolve the TypeScript error
  const [eq, setEq] = useState<EQSettings>({
    enabled: true,
    mode: 10,
    bands: new Array(10).fill(0),
    bass: 0,
    mid: 0,
    treble: 0,
    presets: PRESETS
  });

  const [effects, setEffects] = useState<AudioEffectSettings>({
    bassBoost: 40,
    trebleBoost: 20,
    clarity: 60,
    warmth: 15,
    reverb: { enabled: false, type: 'hall', size: 50, decay: 40, mix: 30 },
    spatial: { enabled: true, depth: 40, width: 70, mode: 'headphone' }
  });

  const [isAIEnhancing, setIsAIEnhancing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = AudioEngine.getInstance();

  // EQ Change Handler
  const handleBandChange = (index: number, val: number) => {
    const newBands = [...eq.bands];
    newBands[index] = val;
    setEq({ ...eq, bands: newBands });
    // engine.updateEQ(newBands); // Link to real DSP
  };

  const applyPreset = (name: string) => {
    setEq({ ...eq, bands: PRESETS[name] });
  };

  // --- Visualizer Animation ---
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    let frame: number;
    
    const render = () => {
      ctx.clearRect(0, 0, 800, 150);
      ctx.beginPath();
      ctx.moveTo(0, 75);
      
      const step = 800 / (eq.bands.length - 1);
      eq.bands.forEach((val, i) => {
        const x = i * step;
        const y = 75 - (val * 5); // 5px per dB
        if (i === 0) ctx.moveTo(x, y);
        else ctx.bezierCurveTo(x - step/2, 75 - (eq.bands[i-1]*5), x - step/2, y, x, y);
      });
      
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      frame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frame);
  }, [eq.bands]);

  return (
    <div className="h-full overflow-hidden flex flex-col bg-transparent p-12">
      
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-[var(--accent-color)] rounded-[1.5rem] text-white accent-glow">
               <Activity size={32} />
             </div>
             <div>
               <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Audio Lab</h2>
               <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Precision DSP & Neural Enhancement</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <button 
             onClick={() => setIsAIEnhancing(true)}
             className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-all"
           >
             <Sparkles size={16} /> Neural Optimizer
           </button>
           <div className="w-px h-10 bg-white/5 mx-2" />
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Master Bypass</span>
              <button 
                onClick={() => setEq({...eq, enabled: !eq.enabled})}
                className={`w-14 h-7 rounded-full transition-all relative ${eq.enabled ? 'bg-[var(--accent-color)]' : 'bg-zinc-800'}`}
              >
                 <MotionDiv animate={{ x: eq.enabled ? 30 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg" />
              </button>
           </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-40 space-y-12">
        
        {/* --- 1. EQUALIZER ENGINE --- */}
        <section className="p-10 bg-white/[0.02] border border-white/5 rounded-[4rem] space-y-10">
          <div className="flex items-center justify-between">
             <div className="space-y-1">
               <h3 className="text-2xl font-black text-white flex items-center gap-3">
                 <Sliders size={22} className="text-[var(--accent-color)]" /> Studio Equalizer
               </h3>
               <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Acoustic Precision Calibration</p>
             </div>
             
             <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                {Object.keys(PRESETS).map(p => (
                  <button key={p} onClick={() => applyPreset(p)} className="px-4 py-2 rounded-xl text-[9px] font-black uppercase text-zinc-500 hover:text-white transition-all">{p}</button>
                ))}
             </div>
          </div>

          <div className="relative h-48 w-full bg-black/40 rounded-[2.5rem] border border-white/5 overflow-hidden">
             <canvas ref={canvasRef} width={800} height={150} className="w-full h-full opacity-60" />
             <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <Music size={120} className="text-white" />
             </div>
          </div>

          <div className="flex items-end justify-between gap-2 px-4 h-64">
             {eq.bands.map((val, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="text-[9px] font-mono text-zinc-700 font-black group-hover:text-[var(--accent-color)] transition-colors">
                    {val > 0 ? `+${val}` : val}dB
                  </div>
                  <div className="relative w-2 h-48 bg-zinc-900 rounded-full flex justify-center">
                     <div className="absolute inset-x-0 bottom-0 bg-[var(--accent-color)]/20 rounded-full" style={{ height: `${(val + 12) / 24 * 100}%` }} />
                     <input 
                       type="range" min="-12" max="12" step="0.5" value={val}
                       onChange={(e) => handleBandChange(i, parseFloat(e.target.value))}
                       onDoubleClick={() => handleBandChange(i, 0)}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer vertical-slider"
                       style={{ writingMode: 'bt-lr' as any }}
                     />
                     <motion.div 
                        animate={{ bottom: `${(val + 12) / 24 * 100}%` }}
                        className="absolute w-6 h-6 -ml-2 mb-[-12px] bg-white rounded-lg shadow-xl border-2 border-[var(--accent-color)] z-10 pointer-events-none"
                     />
                  </div>
                  <div className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">
                    {FREQS_10[i] < 1000 ? `${FREQS_10[i]}Hz` : `${FREQS_10[i]/1000}kHz`}
                  </div>
               </div>
             ))}
          </div>
        </section>

        {/* --- 2. ENHANCERS & EFFECTS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Enhancers */}
          <section className="p-10 bg-white/[0.02] border border-white/5 rounded-[4rem] space-y-10">
             <h4 className="text-xl font-black text-white flex items-center gap-3">
               <Zap size={20} className="text-amber-500" /> Sonic Enhancers
             </h4>
             <div className="grid grid-cols-2 gap-8">
                {[
                  { label: 'Bass Impact', val: effects.bassBoost, field: 'bassBoost', icon: Flame, color: 'text-orange-500' },
                  { label: 'Treble Clarity', val: effects.trebleBoost, field: 'trebleBoost', icon: Zap, color: 'text-blue-400' },
                  { label: 'Vocal Presence', val: effects.clarity, field: 'clarity', icon: Wand2, color: 'text-purple-500' },
                  { label: 'Tube Warmth', val: effects.warmth, field: 'warmth', icon: Wind, color: 'text-emerald-500' }
                ].map(item => (
                  <div key={item.label} className="space-y-4">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <span className="flex items-center gap-2"><item.icon size={12} className={item.color}/> {item.label}</span>
                        <span className="text-white">{item.val}%</span>
                     </div>
                     <input 
                       type="range" value={item.val} 
                       onChange={(e) => setEffects({...effects, [item.field]: Number(e.target.value)})}
                       className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-white" 
                     />
                  </div>
                ))}
             </div>
          </section>

          {/* Reverb Engine */}
          <section className="p-10 bg-white/[0.02] border border-white/5 rounded-[4rem] space-y-10">
             <div className="flex justify-between items-center">
                <h4 className="text-xl font-black text-white flex items-center gap-3">
                  <Waves size={20} className="text-blue-500" /> Space Modeler
                </h4>
                <button 
                  onClick={() => setEffects({...effects, reverb: {...effects.reverb, enabled: !effects.reverb.enabled}})}
                  className={`p-2 rounded-xl transition-all ${effects.reverb.enabled ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-600'}`}
                >
                  <Power size={16} />
                </button>
             </div>
             
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Environment</p>
                   <div className="grid grid-cols-2 gap-2">
                      {['Room', 'Hall', 'Plate', 'Cathedral'].map(t => (
                        <button 
                          key={t}
                          onClick={() => setEffects({...effects, reverb: {...effects.reverb, type: t.toLowerCase() as any}})}
                          className={`py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${effects.reverb.type === t.toLowerCase() ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-500 border-transparent hover:bg-white/10'}`}
                        >
                          {t}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase text-zinc-500"><span>Decay Time</span><span>{effects.reverb.decay}%</span></div>
                      <input type="range" value={effects.reverb.decay} onChange={e=>setEffects({...effects, reverb: {...effects.reverb, decay: Number(e.target.value)}})} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-blue-500" />
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase text-zinc-500"><span>Wet Mix</span><span>{effects.reverb.mix}%</span></div>
                      <input type="range" value={effects.reverb.mix} onChange={e=>setEffects({...effects, reverb: {...effects.reverb, mix: Number(e.target.value)}})} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-blue-500" />
                   </div>
                </div>
             </div>
          </section>
        </div>

        {/* --- 3. SPATIALIZATION --- */}
        <section className="p-10 bg-white/[0.02] border border-white/5 rounded-[4rem] space-y-10">
           <div className="flex justify-between items-center">
              <h4 className="text-xl font-black text-white flex items-center gap-3">
                <Box size={22} className="text-purple-500" /> Neural Spatializer
              </h4>
              <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                <button onClick={() => setEffects({...effects, spatial: {...effects.spatial, mode: 'headphone'}})} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 transition-all ${effects.spatial.mode === 'headphone' ? 'bg-white text-black' : 'text-zinc-500'}`}><Headphones size={12}/> Headphones</button>
                <button onClick={() => setEffects({...effects, spatial: {...effects.spatial, mode: 'speaker'}})} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 transition-all ${effects.spatial.mode === 'speaker' ? 'bg-white text-black' : 'text-zinc-500'}`}><Speaker size={12}/> Speakers</button>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 relative h-64 bg-black/40 rounded-[3rem] border border-white/5 flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--accent-color)_0%,_transparent_70%)]" />
                 <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="w-48 h-48 border-2 border-[var(--accent-color)] rounded-full"
                 />
                 <motion.div 
                    style={{ x: (effects.spatial.width - 50) * 2, y: (effects.spatial.depth - 50) * -1 }}
                    className="relative w-10 h-10 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-[var(--accent-color)] z-10"
                 >
                    <Headphones size={20} />
                 </motion.div>
                 <div className="absolute bottom-6 text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">3D Soundstage Mapping</div>
              </div>
              
              <div className="space-y-8 flex flex-col justify-center">
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500"><span>Stereo Width</span><span>{effects.spatial.width}%</span></div>
                    <input type="range" value={effects.spatial.width} onChange={e=>setEffects({...effects, spatial: {...effects.spatial, width: Number(e.target.value)}})} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-purple-500" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500"><span>Room Depth</span><span>{effects.spatial.depth}%</span></div>
                    <input type="range" value={effects.spatial.depth} onChange={e=>setEffects({...effects, spatial: {...effects.spatial, depth: Number(e.target.value)}})} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-purple-500" />
                 </div>
              </div>
           </div>
        </section>

      </main>

      {/* Global AI Overlay */}
      <AnimatePresence>
        {isAIEnhancing && (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center">
             <div className="flex flex-col items-center gap-8">
                <div className="relative">
                   <MotionDiv animate={{ scale: [1, 1.5, 1], rotate: 360 }} transition={{ duration: 3, repeat: Infinity }} className="w-32 h-32 rounded-[3rem] bg-gradient-to-br from-purple-600 to-blue-600 opacity-20 blur-2xl" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles size={64} className="text-white animate-pulse" />
                   </div>
                </div>
                <div className="text-center space-y-2">
                   <h4 className="text-2xl font-black text-white tracking-tighter">Neural Mastering Active</h4>
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] animate-pulse">Analyzing Signal Harmonics...</p>
                </div>
                <button onClick={() => setIsAIEnhancing(false)} className="px-10 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105">Commit Master</button>
             </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <style>{`
        .vertical-slider {
          -webkit-appearance: none;
          transform: rotate(-90deg);
          transform-origin: center;
        }
      `}</style>
    </div>
  );
};

export default AudioEffectsView;
