
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertCircle, X, Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar';
import CompactPlayer from './components/CompactPlayer';
import LibraryView from './components/LibraryView';
import HomeView from './components/HomeView';
import PlaylistView from './components/PlaylistView';
import NowPlayingView from './components/NowPlayingView';
import CollectionsView from './components/CollectionsView';
import SearchResultsView from './components/SearchResultsView';
import DownloadsManagerView from './components/DownloadsManagerView';
import ProfileView from './components/ProfileView';
import BackupRestoreView from './components/BackupRestoreView';
import DiagnosticsView from './components/DiagnosticsView';
import ExtensionsView from './components/ExtensionsView';
import AISettingsView from './components/AISettingsView';
import DeveloperView from './components/DeveloperView';
import MultiDeviceSyncView from './components/MultiDeviceSyncView';
import Equalizer from './components/Equalizer';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import SmartPlaylistBuilder from './components/SmartPlaylistBuilder'; // New
import SmartSearch from './components/SmartSearch';
import TitleBar from './components/TitleBar';
import CrashView from './components/CrashView';
import { Song, NavigationTab, EQSettings, Playlist, AppSettings, QueueState, AudioOutputMode, DownloadTask, AISettings } from './types';
import { MOCK_SONGS } from './constants';
import { AudioEngine } from './services/audioEngine';
import { queueManager } from './services/queueManager';
import { initDB, cacheItem } from './services/dbService';
import { logger, LogLevel, LogCategory } from './services/logger';
import { errorService, MelodixError, ErrorSeverity } from './services/errorService';
import { THEME_PRESETS, ThemeManager } from './services/themeManager';
import { enhancementEngine } from './services/enhancementEngine';

const MotionMain = motion.main as any;
const MotionDiv = motion.div as any;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.Home);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingSmartPlaylist, setEditingSmartPlaylist] = useState<Playlist | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [fatalError, setFatalError] = useState<Error | null>(null);
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [queue, setQueue] = useState<QueueState>({ items: [], currentIndex: -1, shuffled: false, repeatMode: 'all' });
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [eqSettings, setEqSettings] = useState<EQSettings>({ bass: 0, mid: 0, treble: 0 });
  const [isEqOpen, setIsEqOpen] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const engine = useMemo(() => AudioEngine.getInstance(), []);

  useEffect(() => {
    return enhancementEngine.subscribe(setTasks);
  }, []);

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      logger.log(LogLevel.FATAL, LogCategory.SYSTEM, 'Unhandled Exception detected', e.error);
      setFatalError(e.error || new Error(e.message));
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  useEffect(() => {
    const startup = async () => {
      try {
        await initDB();
        const savedSongs = localStorage.getItem('melodix-library-v10');
        const savedPlaylists = localStorage.getItem('melodix-playlists-v6');
        const savedSettings = localStorage.getItem('melodix-settings-v12');

        setSongs(savedSongs ? JSON.parse(savedSongs) : MOCK_SONGS);
        setPlaylists(savedPlaylists ? JSON.parse(savedPlaylists) : []);
        
        const defaultAI: AISettings = {
          smartSearch: { enabled: true, fuzzyMatching: true, typoCorrection: true, semanticSearch: false, weights: { title: 80, artist: 60, album: 40, genre: 20, filename: 10 } },
          recommendation: { enabled: true, useHistory: true, useSimilarity: true, useMood: true, strength: 75, diversity: 40, threshold: 50 },
          moodDetection: { enabled: true, analyzeWaveform: true, analyzeLyrics: true, categories: ['Happy', 'Sad', 'Energetic', 'Calm'] },
          enhancement: { retryAttempts: 3, networkLimit: 'unlimited', priority: 'lyrics', autoSaveToFile: false },
          privacy: { localInferenceOnly: false, anonymousUsageData: true, cloudSyncEnabled: true },
          providerPriority: { lyrics: ['Gemini', 'Musixmatch', 'Local'], tags: ['MusicBrainz', 'Gemini', 'Discogs'], covers: ['Official', 'Gemini', 'Fanart.tv'] }
        };

        const currentSettings = savedSettings ? JSON.parse(savedSettings) : { themeMode: 'dark', activeThemeId: 'classic-dark', ai: defaultAI, sync: { enabled: false } };
        setSettings(currentSettings);
        
        const allThemes = [...THEME_PRESETS, ...(currentSettings.customThemes || [])];
        ThemeManager.applyTheme(allThemes.find(t => t.id === currentSettings.activeThemeId) || THEME_PRESETS[0]);
        
        setIsReady(true);
      } catch (e) {
        console.error(e);
      }
    };
    startup();
  }, []);

  useEffect(() => {
    if (playlists.length > 0) localStorage.setItem('melodix-playlists-v6', JSON.stringify(playlists));
  }, [playlists]);

  const currentSong = useMemo(() => queue.items[queue.currentIndex] || null, [queue]);

  const handleTogglePlay = () => {
    if (isPlaying) engine.pause();
    else engine.resume();
    setIsPlaying(!isPlaying);
  };

  const saveSmartPlaylist = (p: Playlist) => {
    setPlaylists(prev => {
      const exists = prev.find(pl => pl.id === p.id);
      if (exists) return prev.map(pl => pl.id === p.id ? p : pl);
      return [...prev, p];
    });
  };

  if (fatalError) return <CrashView error={fatalError} onRestart={() => window.location.reload()} />;
  if (!isReady || !settings) return null;

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-[var(--mica-bg)] ${settings.enableBlur ? 'backdrop-blur-xl' : ''}`} dir="ltr">
      <TitleBar onOpenSearch={() => setIsSearchOpen(true)} />
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => { setActiveTab(tab); setSelectedPlaylistId(null); }} 
        playlists={playlists}
        activePlaylistId={selectedPlaylistId}
        onSelectPlaylist={(id) => { setActiveTab(NavigationTab.Playlists); setSelectedPlaylistId(id); }}
      />

      <MotionMain layout className="flex-1 h-full relative overflow-hidden pt-10">
        <AnimatePresence mode="wait">
          <MotionDiv key={activeTab + (selectedPlaylistId || '') + searchQuery} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            {activeTab === NavigationTab.Home && <HomeView currentSong={currentSong} lyrics={currentSong?.lrcContent || ""} isLoadingLyrics={false} currentTime={progress} onSongSelect={(s) => queueManager.setQueue([s], 0)} recentSongs={queue.items.slice(0, 10)} library={songs} isPlaying={isPlaying} onTogglePlay={handleTogglePlay} />}
            {activeTab === NavigationTab.Playlists && (
              <PlaylistView 
                playlists={playlists} songs={songs} recentSongs={queue.items.slice(0, 10)} 
                selectedPlaylistId={selectedPlaylistId} onSelectPlaylist={setSelectedPlaylistId} 
                onPlayPlaylist={(p) => queueManager.setQueue(p.songIds.map(id => songs.find(s => s.id === id)!), 0)} 
                onDeletePlaylist={(id) => setPlaylists(p => p.filter(pl => pl.id !== id))} 
                onCreatePlaylist={() => { setEditingSmartPlaylist(undefined); setIsBuilderOpen(true); }} 
                onEditSmartPlaylist={(p) => { setEditingSmartPlaylist(p); setIsBuilderOpen(true); }}
                onSongSelect={(s) => queueManager.setQueue([s], 0)} currentSongId={currentSong?.id} isPlaying={isPlaying} 
              />
            )}
            {activeTab === NavigationTab.AllSongs && <LibraryView songs={songs} onSongSelect={(s) => queueManager.setQueue([s], 0)} onAddNext={(s) => queueManager.addNext(s)} onAddToQueue={(s) => queueManager.addToEnd(s)} currentSongId={currentSong?.id} onUpdateSong={(s) => setSongs(prev => prev.map(o => o.id === s.id ? s : o))} />}
            {activeTab === NavigationTab.Collections && <CollectionsView songs={songs} onSongSelect={(s) => queueManager.setQueue([s], 0)} currentSongId={currentSong?.id} onPlayPlaylist={(list) => queueManager.setQueue(list, 0)} />}
            {activeTab === NavigationTab.Search && <SearchResultsView query={searchQuery} songs={songs} playlists={playlists} onSongSelect={(s) => queueManager.setQueue([s], 0)} currentSongId={currentSong?.id} onClear={() => { setSearchQuery(''); setActiveTab(NavigationTab.Home); }} />}
            {activeTab === NavigationTab.Downloads && <DownloadsManagerView tasks={tasks} />}
            {activeTab === NavigationTab.AISettings && <AISettingsView settings={settings} onUpdate={setSettings} />}
            {activeTab === NavigationTab.CloudSync && <MultiDeviceSyncView settings={settings} onUpdate={setSettings} />}
            {activeTab === NavigationTab.Settings && <SettingsView settings={settings} onUpdate={setSettings} />}
            {activeTab === NavigationTab.About && <AboutView />}
          </MotionDiv>
        </AnimatePresence>

        <AnimatePresence>
          {isNowPlayingOpen && <NowPlayingView currentSong={currentSong} isPlaying={isPlaying} progress={progress} duration={currentSong?.duration || 0} onTogglePlay={handleTogglePlay} onNext={() => queueManager.next()} onPrev={() => queueManager.prev()} onSeek={(val) => engine.seek(val)} onBack={() => setIsNowPlayingOpen(false)} onUpdateSong={(s) => setSongs(prev => prev.map(o => o.id === s.id ? s : o))} />}
        </AnimatePresence>
      </MotionMain>

      <CompactPlayer currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={handleTogglePlay} onNext={() => queueManager.next()} onPrev={() => queueManager.prev()} progress={progress} duration={currentSong?.duration || 0} onSeek={(val) => engine.seek(val)} onShowLyrics={() => setIsNowPlayingOpen(true)} />
      
      {isBuilderOpen && (
        <SmartPlaylistBuilder 
          library={songs} 
          initialPlaylist={editingSmartPlaylist}
          onClose={() => setIsBuilderOpen(false)} 
          onSave={saveSmartPlaylist} 
        />
      )}
      
      <SmartSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} songs={songs} currentSong={currentSong} onSongSelect={(s) => { queueManager.setQueue([s], 0); setIsSearchOpen(false); }} onSeeAll={(q) => { setSearchQuery(q); setActiveTab(NavigationTab.Search); }} />
    </div>
  );
};

export default App;
