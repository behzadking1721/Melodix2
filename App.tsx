
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
import DeveloperView from './components/DeveloperView'; // New
import Equalizer from './components/Equalizer';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import SmartPlaylistCreator from './components/SmartPlaylistCreator';
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
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [fatalError, setFatalError] = useState<Error | null>(null);
  const [notifications, setNotifications] = useState<MelodixError[]>([]);
  
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

  // Sync tasks from engine
  useEffect(() => {
    return enhancementEngine.subscribe(setTasks);
  }, []);

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
        const savedSettings = localStorage.getItem('melodix-settings-v11');

        setSongs(savedSongs ? JSON.parse(savedSongs) : MOCK_SONGS);
        setPlaylists(savedPlaylists ? JSON.parse(savedPlaylists) : []);
        
        const defaultAI: AISettings = {
          smartSearch: {
            enabled: true, fuzzyMatching: true, typoCorrection: true, semanticSearch: false,
            weights: { title: 80, artist: 60, album: 40, genre: 20, filename: 10 }
          },
          recommendation: {
            enabled: true, useHistory: true, useSimilarity: true, useMood: true,
            strength: 75, diversity: 40, threshold: 50
          },
          moodDetection: {
            enabled: true, analyzeWaveform: true, analyzeLyrics: true,
            categories: ['Happy', 'Sad', 'Energetic', 'Calm']
          },
          enhancement: { retryAttempts: 3, networkLimit: 'unlimited', priority: 'lyrics', autoSaveToFile: false },
          privacy: { localInferenceOnly: false, anonymousUsageData: true, cloudSyncEnabled: true },
          providerPriority: {
            lyrics: ['Gemini', 'Musixmatch', 'Local'],
            tags: ['MusicBrainz', 'Gemini', 'Discogs'],
            covers: ['Official', 'Gemini', 'Fanart.tv']
          }
        };

        const defaultSettings: AppSettings = {
          language: 'en', launchOnBoot: false, launchMinimized: false, defaultPage: 'main',
          showToasts: true, themeMode: 'dark', activeThemeId: 'classic-dark', customThemes: [],
          accentColor: '#3b82f6', uiDensity: 'comfortable', enableAnimations: true,
          enableBlur: true, miniMode: false, miniProgress: true, miniCover: true,
          gaplessPlayback: true, crossfadeSec: 3, autoNormalize: true, highQualityMode: true,
          audioDevice: 'default', audioOutputMode: AudioOutputMode.Shared, targetSampleRate: 44100,
          musicFolders: ['C:\\Users\\Default\\Music'], autoRescan: true, preferEmbeddedTags: true,
          detectDuplicates: true, groupByAlbumArtist: true, lyricsProvider: 'gemini',
          autoSaveLyrics: true, preferSyncedLrc: true, tagProvider: 'gemini',
          hdCoverArt: true, replaceLowQualCover: true, saveInsideFile: false,
          enableEnhancement: true, autoFixTags: true, autoFetchLyrics: true,
          autoUpdateCover: true, showStatusIcons: true, taskScheduling: 'playback',
          alwaysOnTop: false, visualizationEnabled: true, waveformEnabled: true,
          isDefaultPlayer: true, minFileSizeMB: 2, minDurationSec: 30,
          backupFrequency: 'weekly', autoCleanupBackups: true, ai: defaultAI
        };

        const currentSettings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
        setSettings(currentSettings);
        
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

  useEffect(() => {
    if (!settings) return;
    localStorage.setItem('melodix-settings-v11', JSON.stringify(settings));
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
      if (settings?.enableEnhancement) enhancementEngine.enqueue(currentSong);
    }
  }, [currentSong?.id]);

  useEffect(() => {
    if (songs.length > 0) localStorage.setItem('melodix-library-v10', JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    const el = engine.getActiveElement();
    const update = () => setProgress(el.currentTime);
    el.addEventListener('timeupdate', update);
    el.addEventListener('ended', () => { setIsPlaying(false); queueManager.next(); });
    return () => el.removeEventListener('timeupdate', update);
  }, [currentSong]);

  const handleTogglePlay = () => {
    if (isPlaying) engine.pause();
    else engine.resume();
    setIsPlaying(!isPlaying);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q) { setActiveTab(NavigationTab.Search); setSelectedPlaylistId(null); }
    else setActiveTab(NavigationTab.Home);
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
    <div className={`flex h-screen w-screen overflow-hidden bg-[var(--mica-bg)] ${settings.enableBlur ? 'backdrop-blur-xl' : ''}`} dir="ltr">
      <TitleBar onOpenSearch={() => setIsSearchOpen(true)} />
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => { 
          setActiveTab(tab); 
          setSelectedPlaylistId(null);
          if (tab !== NavigationTab.Search) setSearchQuery('');
        }} 
        playlists={playlists}
        activePlaylistId={selectedPlaylistId}
        onSelectPlaylist={(id) => { setActiveTab(NavigationTab.Playlists); setSelectedPlaylistId(id); }}
      />

      <MotionMain layout className={`flex-1 h-full relative overflow-hidden pt-10 ${settings.enableAnimations ? '' : 'no-animation'}`}>
        <AnimatePresence mode="wait">
          <MotionDiv
            key={activeTab + (selectedPlaylistId || '') + searchQuery}
            initial={settings.enableAnimations ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={settings.enableAnimations ? { opacity: 0 } : false}
            className="h-full"
          >
            {activeTab === NavigationTab.Home && <HomeView currentSong={currentSong} lyrics={currentSong?.lrcContent || ""} isLoadingLyrics={false} currentTime={progress} onSongSelect={(s) => queueManager.setQueue([s], 0)} recentSongs={queue.items.slice(0, 10)} library={songs} isPlaying={isPlaying} onTogglePlay={handleTogglePlay} />}
            {activeTab === NavigationTab.Profile && <ProfileView songs={songs} />}
            {activeTab === NavigationTab.Backup && <BackupRestoreView />}
            {activeTab === NavigationTab.Diagnostics && <DiagnosticsView currentSong={currentSong} tasksCount={tasks.filter(t => t.status === 'processing').length} />}
            {activeTab === NavigationTab.Extensions && <ExtensionsView />}
            {activeTab === NavigationTab.AISettings && <AISettingsView settings={settings} onUpdate={setSettings} />}
            {activeTab === NavigationTab.Developer && <DeveloperView />}
            {activeTab === NavigationTab.Collections && <CollectionsView songs={songs} onSongSelect={(s) => queueManager.setQueue([s], 0)} currentSongId={currentSong?.id} onPlayPlaylist={(songsList, title) => queueManager.setQueue(songsList, 0)} />}
            {activeTab === NavigationTab.Search && <SearchResultsView query={searchQuery} songs={songs} playlists={playlists} onSongSelect={(s) => queueManager.setQueue([s], 0)} currentSongId={currentSong?.id} onClear={() => { setSearchQuery(''); setActiveTab(NavigationTab.Home); }} />}
            {activeTab === NavigationTab.Downloads && <DownloadsManagerView tasks={tasks} />}
            {activeTab === NavigationTab.AllSongs && <LibraryView songs={songs} onSongSelect={(s) => queueManager.setQueue([s], 0)} onAddNext={(s) => queueManager.addNext(s)} onAddToQueue={(s) => queueManager.addToEnd(s)} currentSongId={currentSong?.id} onUpdateSong={(s) => setSongs(prev => prev.map(o => o.id === s.id ? s : o))} />}
            {activeTab === NavigationTab.Playlists && <PlaylistView playlists={playlists} songs={songs} recentSongs={queue.items.slice(0, 10)} selectedPlaylistId={selectedPlaylistId} onSelectPlaylist={setSelectedPlaylistId} onPlayPlaylist={(p) => queueManager.setQueue(p.songIds.map(id => songs.find(s => s.id === id)!), 0)} onDeletePlaylist={(id) => setPlaylists(p => p.filter(pl => pl.id !== id))} onCreatePlaylist={() => setIsCreatorOpen(true)} onSongSelect={(s) => queueManager.setQueue([s], 0)} currentSongId={currentSong?.id} isPlaying={isPlaying} />}
            {activeTab === NavigationTab.Settings && <SettingsView settings={settings} onUpdate={setSettings} />}
            {activeTab === NavigationTab.About && <AboutView />}
          </MotionDiv>
        </AnimatePresence>

        <AnimatePresence>
          {isNowPlayingOpen && <NowPlayingView currentSong={currentSong} isPlaying={isPlaying} progress={progress} duration={currentSong?.duration || 0} onTogglePlay={handleTogglePlay} onNext={() => queueManager.next()} onPrev={() => queueManager.prev()} onSeek={(val) => engine.seek(val)} onBack={() => setIsNowPlayingOpen(false)} onUpdateSong={(s) => setSongs(prev => prev.map(o => o.id === s.id ? s : o))} />}
        </AnimatePresence>
      </MotionMain>

      <CompactPlayer currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={handleTogglePlay} onNext={() => queueManager.next()} onPrev={() => queueManager.prev()} progress={progress} duration={currentSong?.duration || 0} onSeek={(val) => engine.seek(val)} onShowLyrics={() => setIsNowPlayingOpen(true)} />
      <Equalizer settings={eqSettings} onChange={(s) => { setEqSettings(s); engine.setEQ(s); }} isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />
      {isCreatorOpen && <SmartPlaylistCreator library={songs} onClose={() => setIsCreatorOpen(false)} onSave={(p) => setPlaylists([...playlists, p])} />}
      <SmartSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} songs={songs} currentSong={currentSong} onSongSelect={(s) => { queueManager.setQueue([s], 0); setIsSearchOpen(false); }} onSeeAll={handleSearch} />
    </div>
  );
};

export default App;
