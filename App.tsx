
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavigationTab, Song, Playlist, AppSettings, AudioOutputMode } from './types';
import Sidebar from './components/Sidebar';
import TitleBar from './components/TitleBar';
import Player from './components/Player';
import HomeView from './components/HomeView';
import LibraryView from './components/LibraryView';
import PlaylistView from './components/PlaylistView';
import DownloadsManagerView from './components/DownloadsManagerView';
import AISettingsView from './components/AISettingsView';
import SettingsView from './components/SettingsView';
import ProfileView from './components/ProfileView';
import BackupRestoreView from './components/BackupRestoreView';
import DiagnosticsView from './components/DiagnosticsView';
import ExtensionsView from './components/ExtensionsView';
import DeveloperView from './components/DeveloperView';
import MultiDeviceSyncView from './components/MultiDeviceSyncView';
import AboutView from './components/AboutView';
import AudioEffectsView from './components/AudioEffectsView';
import VisualizerView from './components/VisualizerView';
import LyricsVisualizer from './components/LyricsVisualizer';
import ShortcutSettingsView from './components/ShortcutSettingsView';
import AccessibilityView from './components/AccessibilityView';
import CacheManagerView from './components/CacheManagerView';
import { MOCK_SONGS } from './constants';
import { enhancementEngine } from './services/enhancementEngine';
import { AudioEngine } from './services/audioEngine';
import { queueManager } from './services/queueManager';
import { AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.Home);
  const [songs, setSongs] = useState<Song[]>(MOCK_SONGS);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  
  const engine = AudioEngine.getInstance();
  const progressIntervalRef = useRef<number>(0);

  const [settings, setSettings] = useState<AppSettings>({
    autoNormalize: false,
    gaplessPlayback: true,
    activeThemeId: 'classic-dark',
    enableBlur: true,
    enableAnimations: true,
    ai: {
      smartSearch: { enabled: true, fuzzyMatching: true, semanticSearch: false, weights: { title: 80, artist: 60, genre: 40 } },
      recommendation: { useHistory: true, useMood: true, strength: 70, threshold: 50, diversity: 50 },
      moodDetection: { analyzeWaveform: true, analyzeLyrics: true, categories: ['Chill', 'Power'] },
      providerPriority: { lyrics: ['Gemini'], tags: ['Gemini'], covers: ['Gemini'] },
      privacy: { localInferenceOnly: false, anonymousUsageData: true, cloudSyncEnabled: true }
    },
    sync: {
      autoSync: true,
      syncOnExit: false,
      conflictStrategy: 'smart-merge',
      syncTypes: { playlists: true, settings: true, metadata: true, history: true, stats: true }
    },
    accessibility: {
      highContrast: false,
      highContrastTheme: 'black-yellow',
      reduceMotion: false,
      screenReaderOptimized: false,
      textScale: 100,
      uiScale: 100,
      fontFamily: 'default',
      colorBlindnessMode: 'none',
      colorBlindnessIntensity: 50
    }
  });

  // --- Audio Lifecycle Control ---
  useEffect(() => {
    if (isPlaying && currentSong) {
      progressIntervalRef.current = window.setInterval(() => {
        const audioEl = engine.getActiveElement();
        if (audioEl) setProgress(audioEl.currentTime);
      }, 100);
    } else {
      window.clearInterval(progressIntervalRef.current);
    }
    return () => window.clearInterval(progressIntervalRef.current);
  }, [isPlaying, currentSong]);

  const handleTogglePlay = useCallback(() => {
    if (!currentSong && songs.length > 0) {
      handleSongSelect(songs[0]);
      return;
    }
    if (isPlaying) engine.pause();
    else engine.resume();
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentSong, songs]);

  const handleSongSelect = useCallback((song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
    engine.play(song);
  }, []);

  const handleSeek = (val: number) => {
    setProgress(val);
    engine.seek(val);
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    engine.setVolume(val);
  };

  useEffect(() => {
    return enhancementEngine.subscribe((newTasks) => {
      setTasks(newTasks as any);
    });
  }, []);

  const handleUpdateSong = (updated: Song) => {
    setSongs(songs.map(s => s.id === updated.id ? updated : s));
  };

  const handleUpdatePlaylist = (updated: Playlist) => {
    setPlaylists(playlists.map(p => p.id === updated.id ? updated : p));
  };

  return (
    <div className={`flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans select-none ${settings.accessibility.reduceMotion ? 'no-animations' : ''}`}>
      <TitleBar onOpenSearch={() => setActiveTab(NavigationTab.Search)} />
      
      {/* 
        Fix: Pass missing required props to Sidebar component. 
        Included playlists, activePlaylistId and a selection handler that navigates to the playlist view.
      */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        playlists={playlists}
        activePlaylistId={activePlaylistId}
        onSelectPlaylist={(id) => {
          setActivePlaylistId(id);
          setActiveTab(NavigationTab.Playlists);
        }}
      />
      
      <main className="flex-1 relative overflow-hidden pt-10">
        <AnimatePresence mode="wait">
          {activeTab === NavigationTab.Home && (
            <HomeView 
              currentSong={currentSong} 
              library={songs} 
              recentSongs={songs.slice(0, 5)} 
              isPlaying={isPlaying} 
              onTogglePlay={handleTogglePlay} 
              onSongSelect={handleSongSelect} 
              lyrics={currentSong?.lrcContent || ""} 
              isLoadingLyrics={false} 
              currentTime={progress} 
            />
          )}
          {activeTab === NavigationTab.AllSongs && (
            <LibraryView 
              songs={songs} 
              onSongSelect={handleSongSelect} 
              currentSongId={currentSong?.id} 
              onUpdateSong={handleUpdateSong} 
              onAddNext={(s) => queueManager.addNext(s)} 
              onAddToQueue={(s) => queueManager.addToEnd(s)} 
            />
          )}
          {activeTab === NavigationTab.Playlists && (
            <PlaylistView 
              playlists={playlists} 
              songs={songs} 
              recentSongs={songs.slice(0, 5)} 
              selectedPlaylistId={activePlaylistId} 
              onSelectPlaylist={setActivePlaylistId} 
              onPlayPlaylist={(p) => { 
                const pSongs = p.songIds.map(id => songs.find(s => s.id === id)).filter(s => s) as Song[];
                if (pSongs.length > 0) handleSongSelect(pSongs[0]);
              }} 
              onDeletePlaylist={(id) => setPlaylists(playlists.filter(p => p.id !== id))} 
              onCreatePlaylist={() => setActiveTab(NavigationTab.Search)} 
              onSongSelect={handleSongSelect} 
              currentSongId={currentSong?.id} 
              isPlaying={isPlaying} 
              onUpdatePlaylist={handleUpdatePlaylist} 
            />
          )}
          {activeTab === NavigationTab.Downloads && <DownloadsManagerView tasks={tasks} />}
          {activeTab === NavigationTab.Profile && <ProfileView songs={songs} />}
          {activeTab === NavigationTab.AISettings && <AISettingsView settings={settings} onUpdate={setSettings} />}
          {activeTab === NavigationTab.Settings && <SettingsView settings={settings} onUpdate={setSettings} />}
          {activeTab === NavigationTab.Backup && <BackupRestoreView />}
          {activeTab === NavigationTab.Diagnostics && <DiagnosticsView currentSong={currentSong} tasksCount={tasks.length} />}
          {activeTab === NavigationTab.Extensions && <ExtensionsView />}
          {activeTab === NavigationTab.Developer && <DeveloperView />}
          {activeTab === NavigationTab.CloudSync && <MultiDeviceSyncView settings={settings} onUpdate={setSettings} />}
          {activeTab === NavigationTab.About && <AboutView />}
          {activeTab === NavigationTab.AudioLab && <AudioEffectsView />}
          {activeTab === NavigationTab.Visualizer && <VisualizerView currentSong={currentSong} isPlaying={isPlaying} />}
          {activeTab === NavigationTab.LyricsVisualizer && <LyricsVisualizer currentSong={currentSong} currentTime={progress} isPlaying={isPlaying} />}
          {activeTab === NavigationTab.Shortcuts && <ShortcutSettingsView />}
          {activeTab === NavigationTab.Accessibility && <AccessibilityView settings={settings} onUpdate={setSettings} />}
          {activeTab === NavigationTab.CacheManager && <CacheManagerView />}
        </AnimatePresence>
      </main>

      <Player 
        currentSong={currentSong} 
        isPlaying={isPlaying} 
        onTogglePlay={handleTogglePlay}
        progress={progress}
        duration={currentSong?.duration || 0}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        onToggleEq={() => setIsEqOpen(!isEqOpen)}
        isEqOpen={isEqOpen}
        onNext={() => {}}
        onPrev={() => {}}
        onToggleQueue={() => {}}
      />
    </div>
  );
};

export default App;
