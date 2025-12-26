
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ListMusic, Minimize2, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import MiniPlayer from './components/MiniPlayer';
import LibraryView from './components/LibraryView';
import HomeView from './components/HomeView';
import PlaylistView from './components/PlaylistView';
import Equalizer from './components/Equalizer';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import SmartPlaylistCreator from './components/SmartPlaylistCreator';
import TitleBar from './components/TitleBar';
import { Song, NavigationTab, EQSettings, Playlist, AppSettings, QueueState } from './types';
import { MOCK_SONGS } from './constants';
import { fetchLyrics, suggestSongTags } from './services/geminiService';
import { AudioEngine } from './services/audioEngine';
import { queueManager } from './services/queueManager';

const MotionMain = motion.main as any;
const MotionDiv = motion.div as any;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.Home);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('melodix-library-v10');
    return saved ? JSON.parse(saved) : MOCK_SONGS;
  });
  
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('melodix-playlists-v5');
    return saved ? JSON.parse(saved) : [
      { id: 'favs', name: 'موسیقی‌های مورد علاقه', songIds: songs.filter(s => s.isFavorite).map(s => s.id), isSystem: true, dateCreated: Date.now(), lastModified: Date.now() }
    ];
  });

  const [queue, setQueue] = useState<QueueState>({ items: [], currentIndex: -1, shuffled: false, repeatMode: 'all' });
  const currentSong = useMemo(() => queue.items[queue.currentIndex] || null, [queue]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [eqSettings, setEqSettings] = useState<EQSettings>({ bass: 0, mid: 0, treble: 0 });
  const [isEqOpen, setIsEqOpen] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('melodix-settings-v10');
    return saved ? JSON.parse(saved) : {
      minFileSizeMB: 2,
      minDurationSec: 30,
      launchOnBoot: false,
      isDefaultPlayer: true,
      alwaysOnTop: false,
      themeMode: 'dark',
      floatingLyrics: false,
      accentColor: '#3b82f6',
      crossfadeSec: 5,
      autoNormalize: true,
      visualizationEnabled: true,
      waveformEnabled: true,
      miniMode: false,
      gaplessPlayback: true,
      audioDevice: 'default'
    };
  });

  const [lyricsCache, setLyricsCache] = useState<Record<string, string>>({});
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const engine = useMemo(() => AudioEngine.getInstance(), []);

  // Theme Sync Logic (Stage 6)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--accent-glow', `${settings.accentColor}33`); // 20% Alpha
    
    if (settings.themeMode === 'light') {
      root.classList.add('theme-light');
    } else if (settings.themeMode === 'dark') {
      root.classList.remove('theme-light');
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isSystemDark ? root.classList.remove('theme-light') : root.classList.add('theme-light');
    }
    
    localStorage.setItem('melodix-settings-v10', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const unsubscribe = queueManager.subscribe(setQueue);
    return unsubscribe;
  }, []);

  useEffect(() => {
    localStorage.setItem('melodix-library-v10', JSON.stringify(songs));
    localStorage.setItem('melodix-playlists-v5', JSON.stringify(playlists));
    engine.setCrossfade(settings.crossfadeSec);
  }, [songs, playlists]);

  useEffect(() => {
    engine.setEQ(eqSettings);
  }, [eqSettings, engine]);

  const handleNext = () => queueManager.next();
  const handlePrev = () => queueManager.prev();

  const handleSyncMetadata = async (song: Song) => {
    if (song.isSynced) return;
    setIsLyricsLoading(true);
    try {
      const suggestions = await suggestSongTags(song);
      const lyrics = await fetchLyrics(suggestions.title || song.title, suggestions.artist || song.artist, song.id);
      setLyricsCache(prev => ({ ...prev, [song.id]: lyrics }));
      setSongs(prev => prev.map(s => s.id === song.id ? { ...s, ...suggestions, isSynced: true, hasLyrics: lyrics.length > 50 } : s));
    } catch (e) {
      console.error("AI Synchronization failed", e);
    }
    setIsLyricsLoading(false);
  };

  const handleSongSelect = (song: Song) => {
    const idxInQueue = queue.items.findIndex(s => s.id === song.id);
    if (idxInQueue !== -1) {
      queueManager.jumpTo(idxInQueue);
    } else {
      queueManager.setQueue([song, ...queue.items], 0);
    }
    setIsPlaying(true);
  };

  useEffect(() => {
    if (currentSong) {
      engine.play(currentSong, settings.crossfadeSec > 0);
      handleSyncMetadata(currentSong);
    }
    const activeEl = engine.getActiveElement();
    const onTimeUpdate = () => setProgress(activeEl.currentTime);
    const onEnded = () => settings.gaplessPlayback && handleNext();
    activeEl.addEventListener('timeupdate', onTimeUpdate);
    activeEl.addEventListener('ended', onEnded);
    return () => {
      activeEl.removeEventListener('timeupdate', onTimeUpdate);
      activeEl.removeEventListener('ended', onEnded);
    };
  }, [currentSong?.id]);

  useEffect(() => { isPlaying ? engine.resume() : engine.pause(); }, [isPlaying]);
  useEffect(() => { engine.setVolume(volume); }, [volume]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <TitleBar />
      {!settings.miniMode && (
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => { setActiveTab(tab); setSelectedPlaylistId(null); }} 
          playlists={playlists}
          activePlaylistId={selectedPlaylistId}
          onSelectPlaylist={(id) => { setActiveTab(NavigationTab.Playlists); setSelectedPlaylistId(id); }}
        />
      )}

      <MotionMain layout className="flex-1 h-full relative overflow-hidden pt-10">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={activeTab + (selectedPlaylistId || '')}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="h-full"
          >
            {activeTab === NavigationTab.Home && <HomeView currentSong={currentSong} lyrics={currentSong ? lyricsCache[currentSong.id] : ''} isLoadingLyrics={isLyricsLoading} currentTime={progress} onSongSelect={handleSongSelect} recentSongs={queue.items.slice(0, 10)} library={songs} />}
            {activeTab === NavigationTab.AllSongs && <LibraryView songs={songs} onSongSelect={handleSongSelect} onAddNext={(s) => queueManager.addNext(s)} onAddToQueue={(s) => queueManager.addToEnd(s)} currentSongId={currentSong?.id} onUpdateSong={(s) => setSongs(prev => prev.map(old => old.id === s.id ? s : old))} />}
            {activeTab === NavigationTab.Playlists && <PlaylistView playlists={playlists} songs={songs} recentSongs={queue.items.slice(0, 10)} selectedPlaylistId={selectedPlaylistId} onSelectPlaylist={setSelectedPlaylistId} onPlayPlaylist={(p) => queueManager.setQueue(p.songIds.map(id => songs.find(s => s.id === id)!), 0)} onDeletePlaylist={(id) => setPlaylists(p => p.filter(pl => pl.id !== id))} onCreatePlaylist={() => setIsCreatorOpen(true)} onSongSelect={handleSongSelect} currentSongId={currentSong?.id} />}
            {activeTab === NavigationTab.Settings && <SettingsView settings={settings} onUpdate={setSettings} />}
            {activeTab === NavigationTab.About && <AboutView />}
          </MotionDiv>
        </AnimatePresence>
      </MotionMain>

      {!settings.miniMode && <Player currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)} progress={progress} duration={currentSong?.duration || 0} onSeek={val => engine.seek(val)} volume={volume} onVolumeChange={setVolume} onToggleEq={() => setIsEqOpen(!isEqOpen)} isEqOpen={isEqOpen} onNext={handleNext} onPrev={handlePrev} onToggleQueue={() => setActiveTab(NavigationTab.Queue)} visualizationEnabled={settings.visualizationEnabled} waveformEnabled={settings.waveformEnabled} />}
      
      <Equalizer settings={eqSettings} onChange={setEqSettings} isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />
      {isCreatorOpen && <SmartPlaylistCreator library={songs} onClose={() => setIsCreatorOpen(false)} onSave={(p) => setPlaylists([...playlists, p])} />}
      {settings.miniMode && <MiniPlayer currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)} onNext={handleNext} onPrev={handlePrev} onRestore={() => setSettings({...settings, miniMode: false})} />}
    </div>
  );
};

export default App;
