
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layers, Search, History, Sparkles, X, ListMusic, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import MiniPlayer from './components/MiniPlayer';
import LibraryView from './components/LibraryView';
import HomeView from './components/HomeView';
import Equalizer from './components/Equalizer';
import SettingsView from './components/SettingsView';
import TitleBar from './components/TitleBar';
import { Song, NavigationTab, EQSettings, Playlist, AppSettings } from './types';
import { MOCK_SONGS } from './constants';
import { fetchLyrics, suggestSongTags } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.Home);
  const [songs, setSongs] = useState<Song[]>(MOCK_SONGS);
  
  // Queue & Navigation
  const [queue, setQueue] = useState<Song[]>(MOCK_SONGS);
  const [queueIndex, setQueueIndex] = useState(0);
  const currentSong = useMemo(() => queue[queueIndex] || null, [queue, queueIndex]);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [eqSettings, setEqSettings] = useState<EQSettings>({ bass: 0, mid: 0, treble: 0 });
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('melodix-settings-v6');
    return saved ? JSON.parse(saved) : {
      minFileSizeMB: 2,
      minDurationSec: 30,
      launchOnBoot: false,
      isDefaultPlayer: true,
      alwaysOnTop: false,
      themeMode: 'auto',
      floatingLyrics: false,
      accentColor: '#3b82f6',
      crossfadeSec: 5,
      autoNormalize: true,
      visualizationEnabled: true,
      miniMode: false
    };
  });

  const [lyricsCache, setLyricsCache] = useState<Record<string, string>>({});
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  
  // Audio Refs for Crossfade
  const audioPrimary = useRef<HTMLAudioElement | null>(null);
  const audioSecondary = useRef<HTMLAudioElement | null>(null);
  const [activeEngine, setActiveEngine] = useState<'primary' | 'secondary'>('primary');

  useEffect(() => {
    localStorage.setItem('melodix-settings-v6', JSON.stringify(settings));
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
  }, [settings]);

  // Audio Engine Setup
  useEffect(() => {
    const p = new Audio();
    const s = new Audio();
    p.volume = volume;
    s.volume = 0;
    audioPrimary.current = p;
    audioSecondary.current = s;

    const onTimeUpdate = () => {
      const active = activeEngine === 'primary' ? p : s;
      setProgress(active.currentTime);

      // Crossfade logic
      if (settings.crossfadeSec > 0 && active.duration > settings.crossfadeSec) {
        if (active.currentTime >= active.duration - settings.crossfadeSec) {
           triggerCrossfade();
        }
      }
    };

    const onEnded = () => {
      if (settings.crossfadeSec === 0) handleNext();
    };

    p.addEventListener('timeupdate', onTimeUpdate);
    p.addEventListener('ended', onEnded);
    s.addEventListener('timeupdate', onTimeUpdate);
    s.addEventListener('ended', onEnded);

    return () => {
      p.pause(); s.pause();
    };
  }, [activeEngine, settings.crossfadeSec]);

  const triggerCrossfade = () => {
    const nextIdx = (queueIndex + 1) % queue.length;
    const nextSong = queue[nextIdx];
    const targetEngine = activeEngine === 'primary' ? audioSecondary.current : audioPrimary.current;
    const currentEngine = activeEngine === 'primary' ? audioPrimary.current : audioSecondary.current;

    if (targetEngine && nextSong && targetEngine.src !== nextSong.url) {
      targetEngine.src = nextSong.url;
      targetEngine.volume = 0;
      targetEngine.play().catch(() => {});
      
      // Simultaneous Fade
      let step = 0;
      const interval = setInterval(() => {
        step += 0.05;
        if (currentEngine) currentEngine.volume = Math.max(0, volume * (1 - step));
        if (targetEngine) targetEngine.volume = Math.min(volume, volume * step);
        
        if (step >= 1) {
          clearInterval(interval);
          if (currentEngine) { currentEngine.pause(); currentEngine.currentTime = 0; }
          setQueueIndex(nextIdx);
          setActiveEngine(activeEngine === 'primary' ? 'secondary' : 'primary');
        }
      }, (settings.crossfadeSec * 1000) / 20);
    }
  };

  useEffect(() => {
    const active = activeEngine === 'primary' ? audioPrimary.current : audioSecondary.current;
    if (active && currentSong && active.src !== currentSong.url) {
      active.src = currentSong.url;
      active.volume = volume;
      if (isPlaying) active.play().catch(() => setIsPlaying(false));
    }
    if (currentSong) handleSyncMetadata(currentSong);
  }, [currentSong?.id]);

  useEffect(() => {
    const active = activeEngine === 'primary' ? audioPrimary.current : audioSecondary.current;
    if (active) {
      if (isPlaying) active.play().catch(() => setIsPlaying(false));
      else active.pause();
    }
  }, [isPlaying]);

  const handleNext = () => {
    setQueueIndex((prev) => (prev + 1) % queue.length);
  };

  const handlePrev = () => {
    setQueueIndex((prev) => (prev - 1 + queue.length) % queue.length);
  };

  const handleSyncMetadata = async (song: Song) => {
    if (song.isSynced) return;
    setIsLyricsLoading(true);
    const suggestions = await suggestSongTags(song);
    const lyrics = await fetchLyrics(suggestions.title || song.title, suggestions.artist || song.artist, song.id);
    setLyricsCache(prev => ({ ...prev, [song.id]: lyrics }));
    handleUpdateSong({ ...song, ...suggestions, isSynced: true, hasLyrics: lyrics.length > 50 });
    setIsLyricsLoading(false);
  };

  const handleUpdateSong = (updatedSong: Song) => {
    setSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
    setQueue(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${settings.themeMode === 'light' ? 'bg-zinc-100 text-zinc-900' : 'bg-[#050505] text-white'}`}>
      <TitleBar />
      
      <AnimatePresence mode="wait">
        {!settings.miniMode && (
          <motion.div 
            key="sidebar" initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: 'spring', damping: 20 }}
            className="h-full z-40"
          >
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} playlists={[]} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main 
        layout
        className={`flex-1 h-full overflow-y-auto bg-transparent relative custom-scrollbar ${settings.miniMode ? 'pt-0' : 'pt-10'}`}
      >
        <AnimatePresence>
          {!settings.miniMode && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-12 right-10 flex items-center gap-2 z-[300]"
            >
               <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-3 rounded-2xl bg-black/40 backdrop-blur-3xl text-zinc-400 border border-white/5 hover:text-white transition-all"><Search size={16} /></button>
               <button onClick={() => setSettings({...settings, miniMode: true})} className="p-3 rounded-2xl bg-black/40 backdrop-blur-3xl text-zinc-400 border border-white/5 hover:text-white transition-all"><Minimize2 size={16} /></button>
               <button onClick={() => setActiveTab(NavigationTab.Queue)} className={`p-3 rounded-2xl transition-all border ${activeTab === NavigationTab.Queue ? 'bg-blue-600 text-white' : 'bg-black/40 backdrop-blur-3xl text-zinc-400 border-white/5'}`}><ListMusic size={16} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {settings.miniMode ? (
          <MiniPlayer 
            currentSong={currentSong} isPlaying={isPlaying} 
            onTogglePlay={() => setIsPlaying(!isPlaying)} onNext={handleNext} onPrev={handlePrev} 
            onRestore={() => setSettings({...settings, miniMode: false})} 
          />
        ) : (
          <>
            {activeTab === NavigationTab.Home && <HomeView currentSong={currentSong} lyrics={currentSong ? lyricsCache[currentSong.id] : ''} isLoadingLyrics={isLyricsLoading} currentTime={progress} />}
            {activeTab === NavigationTab.AllSongs && <LibraryView songs={songs} onSongSelect={(s) => { setQueue([s]); setQueueIndex(0); setIsPlaying(true); }} currentSongId={currentSong?.id} onUpdateSong={handleUpdateSong} />}
            {activeTab === NavigationTab.Settings && <SettingsView settings={settings} onUpdate={setSettings} />}
            {activeTab === NavigationTab.Queue && (
               <div className="p-12 animate-in fade-in duration-500">
                <h2 className="text-4xl font-black mb-10 tracking-tighter">Queue Management</h2>
                <div className="space-y-2">
                  {queue.map((song, i) => (
                    <motion.div 
                      key={song.id + i} layout 
                      onClick={() => setQueueIndex(i)}
                      className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all ${i === queueIndex ? 'bg-blue-600/20 border border-blue-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                    >
                      <img src={song.coverUrl} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                      <div>
                        <h4 className={`font-bold text-sm ${i === queueIndex ? 'text-blue-400' : 'text-white'}`}>{song.title}</h4>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{song.artist}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </motion.main>
      
      <AnimatePresence>
        {!settings.miniMode && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}>
            <Equalizer settings={eqSettings} onChange={setEqSettings} isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />
            <Player 
              currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
              progress={progress} duration={currentSong?.duration || 0} 
              onSeek={val => { 
                const active = activeEngine === 'primary' ? audioPrimary.current : audioSecondary.current;
                if (active) active.currentTime = val; 
              }}
              volume={volume} onVolumeChange={setVolume} onToggleEq={() => setIsEqOpen(!isEqOpen)} isEqOpen={isEqOpen}
              onNext={handleNext} onPrev={handlePrev} onToggleQueue={() => setActiveTab(NavigationTab.Queue)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
