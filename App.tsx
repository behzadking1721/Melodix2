
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertCircle, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import LibraryView from './components/LibraryView';
import HomeView from './components/HomeView';
import PlaylistView from './components/PlaylistView';
import Equalizer from './components/Equalizer';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import SmartPlaylistCreator from './components/SmartPlaylistCreator';
import SmartSearch from './components/SmartSearch';
import TitleBar from './components/TitleBar';
import CrashView from './components/CrashView';
import { Song, NavigationTab, EQSettings, Playlist, AppSettings, QueueState, AudioOutputMode, ThemeDefinition } from './types';
import { MOCK_SONGS } from './constants';
import { AudioEngine } from './services/audioEngine';
import { queueManager } from './services/queueManager';
import { initDB } from './services/dbService';
import { logger, LogLevel, LogCategory } from './services/logger';
import { errorService, MelodixError, ErrorSeverity } from './services/errorService';
import { THEME_PRESETS, ThemeManager } from './services/themeManager';

const MotionMain = motion.main as any;
const MotionDiv = motion.div as any;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.Home);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [fatalError, setFatalError] = useState<Error | null>(null);
  const [notifications, setNotifications] = useState<MelodixError[]>([]);
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [queue, setQueue] = useState<QueueState>({ items: [], currentIndex: -1, shuffled: false, repeatMode: 'all' });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [eqSettings, setEqSettings] = useState<EQSettings>({ bass: 0, mid: 0, treble: 0 });
  const [isEqOpen, setIsEqOpen] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const engine = useMemo(() => AudioEngine.getInstance(), []);

  // Global Crash Handler
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      logger.log(LogLevel.FATAL, LogCategory.SYSTEM, 'Unhandled Exception detected', e.error);
      setFatalError(e.error || new Error(e.message));
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      logger.log(LogLevel.FATAL, LogCategory.SYSTEM, 'Unhandled Promise Rejection', e.reason);
      setFatalError(new Error(String(e.reason)));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Error Service Subscriber
  useEffect(() => {
    return errorService.subscribe((err) => {
      setNotifications(prev => [...prev, err]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n !== err));
      }, 5000);
    });
  }, []);

  useEffect(() => {
    const startup = async () => {
      logger.startTimer('startup');
      try {
        await initDB();
        const savedSongs = localStorage.getItem('melodix-library-v10');
        const savedPlaylists = localStorage.getItem('melodix-playlists-v5');
        const savedSettings = localStorage.getItem('melodix-settings-v10');

        setSongs(savedSongs ? JSON.parse(savedSongs) : MOCK_SONGS);
        setPlaylists(savedPlaylists ? JSON.parse(savedPlaylists) : []);
        
        const defaultSettings: AppSettings = {
          minFileSizeMB: 2, minDurationSec: 30, launchOnBoot: false, isDefaultPlayer: true,
          alwaysOnTop: false, themeMode: 'dark', activeThemeId: 'classic-dark', customThemes: [], 
          floatingLyrics: false, accentColor: '#3b82f6',
          crossfadeSec: 5, autoNormalize: true, visualizationEnabled: true, waveformEnabled: true,
          miniMode: false, gaplessPlayback: true, audioDevice: 'default',
          audioOutputMode: AudioOutputMode.Shared, targetSampleRate: 44100
        };

        const currentSettings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
        setSettings(currentSettings);
        
        // Dynamic Theme Application
        const allThemes = [...THEME_PRESETS, ...(currentSettings.customThemes || [])];
        const initialTheme = allThemes.find(t => t.id === currentSettings.activeThemeId) || THEME_PRESETS[0];
        ThemeManager.applyTheme(initialTheme);
        
        await engine.setOutputDevice(currentSettings.audioDevice, currentSettings.audioOutputMode);
        
        setIsReady(true);
        logger.endTimer('startup', LogCategory.SYSTEM, 'System successfully hydrated');
      } catch (e) {
        errorService.handleError(e, 'App Initialization', LogCategory.SYSTEM, ErrorSeverity.HIGH);
      }
    };
    startup();
  }, []);

  // Persistent Storage Sync
  useEffect(() => {
    if (!settings) return;
    localStorage.setItem('melodix-settings-v10', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const unsubscribe = queueManager.subscribe(setQueue);
    return () => unsubscribe();
  }, []);

  const currentSong = useMemo(() => queue.items[queue.currentIndex] || null, [queue]);

  useEffect(() => {
    if (currentSong) {
      engine.play(currentSong, (settings?.crossfadeSec ?? 0) > 0);
      setIsPlaying(true);
    }
  }, [currentSong?.id]);

  // Audio state sync
  useEffect(() => {
    const el = engine.getActiveElement();
    const update = () => setProgress(el.currentTime);
    el.addEventListener('timeupdate', update);
    el.addEventListener('ended', () => {
      setIsPlaying(false);
      queueManager.next();
    });
    return () => {
      el.removeEventListener('timeupdate', update);
    };
  }, [currentSong]);

  const handleTogglePlay = () => {
    if (isPlaying) engine.pause();
    else engine.resume();
    setIsPlaying(!isPlaying);
  };

  if (fatalError) return <CrashView error={fatalError} onRestart={() => window.location.reload()} />;

  if (!isReady || !settings) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a0a0a] gap-6">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
           <Zap className="text-[#3b82f6]" size={48} fill="currentColor" />
        </motion.div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 animate-pulse">Initializing Neural Core...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--mica-bg)]" dir="ltr">
      <TitleBar onOpenSearch={() => setIsSearchOpen(true)} />
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        playlists={playlists}
        activePlaylistId={selectedPlaylistId}
        onSelectPlaylist={(id) => { setActiveTab(NavigationTab.Playlists); setSelectedPlaylistId(id); }}
      />

      <MotionMain layout className="flex-1 h-full relative overflow-hidden pt-10">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={activeTab + (selectedPlaylistId || '')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            {activeTab === NavigationTab.Home && (
              <HomeView 
                currentSong={currentSong} 
                lyrics="" 
                isLoadingLyrics={false} 
                currentTime={progress} 
                onSongSelect={(s) => queueManager.setQueue([s], 0)} 
                recentSongs={queue.items.slice(0, 10)} 
                library={songs}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
              />
            )}
            {activeTab === NavigationTab.AllSongs && <LibraryView songs={songs} onSongSelect={(s) => queueManager.setQueue([s], 0)} onAddNext={(s) => queueManager.addNext(s)} onAddToQueue={(s) => queueManager.addToEnd(s)} currentSongId={currentSong?.id} onUpdateSong={(s) => setSongs(prev => prev.map(o => o.id === s.id ? s : o))} />}
            {activeTab === NavigationTab.Playlists && <PlaylistView playlists={playlists} songs={songs} recentSongs={queue.items.slice(0, 10)} selectedPlaylistId={selectedPlaylistId} onSelectPlaylist={setSelectedPlaylistId} onPlayPlaylist={(p) => queueManager.setQueue(p.songIds.map(id => songs.find(s => s.id === id)!), 0)} onDeletePlaylist={(id) => setPlaylists(p => p.filter(pl => pl.id !== id))} onCreatePlaylist={() => setIsCreatorOpen(true)} onSongSelect={(s) => queueManager.setQueue([s], 0)} currentSongId={currentSong?.id} />}
            {activeTab === NavigationTab.Settings && <SettingsView settings={settings} onUpdate={setSettings} />}
            {activeTab === NavigationTab.About && <AboutView />}
          </MotionDiv>
        </AnimatePresence>

        <div className="fixed bottom-28 left-10 z-[500] space-y-3 pointer-events-none">
          <AnimatePresence>
            {notifications.map((n, i) => (
              <MotionDiv
                key={i}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-5 rounded-2xl flex items-center gap-4 border shadow-2xl pointer-events-auto mica ${n.severity === ErrorSeverity.LOW ? 'border-zinc-800' : 'border-red-600/20 bg-red-600/5'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${n.severity === ErrorSeverity.LOW ? 'bg-zinc-800 text-zinc-400' : 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'}`}>
                  <AlertCircle size={20} />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <p className="text-xs font-bold text-white">{n.message}</p>
                  <p className="text-[10px] text-zinc-500 font-black uppercase mt-1 tracking-widest">{n.code}</p>
                </div>
              </MotionDiv>
            ))}
          </AnimatePresence>
        </div>
      </MotionMain>

      <Player 
        currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={handleTogglePlay} 
        progress={progress} duration={currentSong?.duration || 0} onSeek={val => engine.seek(val)} 
        volume={volume} onVolumeChange={(v) => { setVolume(v); engine.setVolume(v); }} onToggleEq={() => setIsEqOpen(!isEqOpen)} isEqOpen={isEqOpen} 
        onNext={() => queueManager.next()} onPrev={() => queueManager.prev()} onToggleQueue={() => setActiveTab(NavigationTab.Queue)} 
        visualizationEnabled={settings.visualizationEnabled} waveformEnabled={settings.waveformEnabled} 
      />
      
      <Equalizer settings={eqSettings} onChange={(s) => { setEqSettings(s); engine.setEQ(s); }} isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />
      {isCreatorOpen && <SmartPlaylistCreator library={songs} onClose={() => setIsCreatorOpen(false)} onSave={(p) => setPlaylists([...playlists, p])} />}
      
      <SmartSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        songs={songs} 
        currentSong={currentSong}
        onSongSelect={(s) => queueManager.setQueue([s], 0)} 
      />
    </div>
  );
};

export default App;
