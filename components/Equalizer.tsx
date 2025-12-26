
import React from 'react';
import { EQSettings } from '../types';
import { SlidersHorizontal, X } from 'lucide-react';

interface EqualizerProps {
  settings: EQSettings;
  onChange: (settings: EQSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Equalizer: React.FC<EqualizerProps> = ({ settings, onChange, isOpen, onClose }) => {
  const handleChange = (band: keyof EQSettings, value: string) => {
    onChange({ ...settings, [band]: parseInt(value, 10) });
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-[#1a1a1a] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-white/5 z-[200] transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-8 flex flex-col h-full">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={20} className="text-purple-400" />
            <h2 className="text-lg font-bold">Audio Engine</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-around py-10 px-4 bg-black/20 rounded-[2rem] border border-white/5 mb-8">
          {(['bass', 'mid', 'treble'] as const).map((band) => (
            <div key={band} className="space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2">
                <span>{band}</span>
                <span className="text-white">{settings[band]}db</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={settings[band]}
                onChange={(e) => handleChange(band, e.target.value)}
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          ))}
        </div>

        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-[10px] text-purple-300 font-medium">
          MASTER DSP: Real-time Biquad Filter active for local high-fidelity output.
        </div>
      </div>
    </div>
  );
};

export default Equalizer;
