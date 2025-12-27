
import React, { useState, useEffect } from 'react';
import { NavigationTab, Song, Playlist, AppSettings } from './types';
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
import { MOCK_SONGS } from './constants';
import { enhancementEngine } from './services/enhancementEngine';
import { AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.Home);
  const [songs, setSongs] = useState<Song[]>(MOCK_SONGS);
  const [playlists] = useState<Playlist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
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
    }
  });

  useEffect(() => {
    return enhancementEngine.subscribe((newTasks) => {
      setTasks(newTasks as any);
    });
  }, []);

  const handleUpdateSong = (updated: Song) => {
    setSongs(songs.map(s => s.id === updated.id ? updated : s));
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans select-none">
      <TitleBar onOpenSearch={() => setActiveTab(NavigationTab.Search)} />
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        playlists={playlists} 
        activePlaylistId={activePlaylistId}
        onSelectPlaylist={(id) => { setActivePlaylistId(id); setActiveTab(NavigationTab.Playlists); }}
      />
      
      <main className="flex-1 relative overflow-hidden pt-10">
        <AnimatePresence mode="wait">
          {activeTab === NavigationTab.Home && <HomeView currentSong={currentSong} library={songs} recentSongs={songs.slice(0, 5)} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)} onSongSelect={setCurrentSong} lyrics="" isLoadingLyrics={false} currentTime={progress} />}
          {activeTab === NavigationTab.AllSongs && <LibraryView songs={songs} onSongSelect={setCurrentSong} currentSongId={currentSong?.id} onUpdateSong={handleUpdateSong} onAddNext={() => {}} onAddToQueue={() => {}} />}
          {activeTab === NavigationTab.Playlists && <PlaylistView playlists={playlists} songs={songs} recentSongs={songs.slice(0, 5)} selectedPlaylistId={activePlaylistId} onSelectPlaylist={setActivePlaylistId} onPlayPlaylist={() => {}} onDeletePlaylist={() => {}} onCreatePlaylist={() => {}} onSongSelect={setCurrentSong} currentSongId={currentSong?.id} isPlaying={isPlaying} onUpdatePlaylist={() => {}} />}
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
        </AnimatePresence>
      </main>

      <Player 
        currentSong={currentSong} 
        isPlaying={isPlaying} 
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        progress={progress}
        duration={currentSong?.duration || 0}
        onSeek={setProgress}
        volume={volume}
        onVolumeChange={setVolume}
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
