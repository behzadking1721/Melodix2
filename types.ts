
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: number;
  trackNumber?: number;
  duration: number; 
  coverUrl: string;
  url: string;
  isFavorite: boolean;
  dateAdded: number;
  playCount: number;
  lastPlayed?: number;
  lastUpdated?: number;
  isSynced?: boolean;
  hasLyrics?: boolean;
  lrcContent?: string;
  replayGain?: number;
  bpm?: number;
  tagStatus?: 'none' | 'partial' | 'full';
  lyricsStatus?: 'none' | 'partial' | 'full';
  coverStatus?: 'none' | 'partial' | 'full';
}

export type ExtensionType = 
  | 'lyrics-provider' 
  | 'tag-provider' 
  | 'cover-provider' 
  | 'audio-effect' 
  | 'visualization' 
  | 'ui-mod' 
  | 'automation';

export interface MelodixScript {
  id: string;
  name: string;
  code: string;
  lastRun?: number;
  status: 'idle' | 'running' | 'error';
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'track-start' | 'metadata-missing' | 'mood-change' | 'low-res-cover';
  condition: string;
  action: string;
  enabled: boolean;
}

export interface MelodixExtension {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  type: ExtensionType;
  status: 'enabled' | 'disabled';
  permissions: string[];
  iconUrl?: string;
  entryPoint?: string;
  hasSettings: boolean;
}

export interface AISettings {
  smartSearch: {
    enabled: boolean;
    fuzzyMatching: boolean;
    typoCorrection: boolean;
    semanticSearch: boolean;
    weights: {
      title: number;
      artist: number;
      album: number;
      genre: number;
      filename: number;
    };
  };
  recommendation: {
    enabled: boolean;
    useHistory: boolean;
    useSimilarity: boolean;
    useMood: boolean;
    strength: number;
    diversity: number;
    threshold: number;
  };
  moodDetection: {
    enabled: boolean;
    analyzeWaveform: boolean;
    analyzeLyrics: boolean;
    categories: string[];
  };
  enhancement: {
    retryAttempts: number;
    networkLimit: 'unlimited' | 'metered' | 'wifi-only';
    priority: 'lyrics' | 'tags' | 'covers';
    autoSaveToFile: boolean;
  };
  privacy: {
    localInferenceOnly: boolean;
    anonymousUsageData: boolean;
    cloudSyncEnabled: boolean;
  };
  providerPriority: {
    lyrics: string[];
    tags: string[];
    covers: string[];
  };
}

export interface AppSettings {
  language: 'en' | 'fa';
  launchOnBoot: boolean;
  launchMinimized: boolean;
  defaultPage: string;
  showToasts: boolean;
  themeMode: 'auto' | 'light' | 'dark' | 'custom';
  activeThemeId: string;
  customThemes: ThemeDefinition[];
  accentColor: string;
  uiDensity: 'comfortable' | 'compact';
  enableAnimations: boolean;
  enableBlur: boolean;
  miniMode: boolean;
  miniProgress: boolean;
  miniCover: boolean;
  gaplessPlayback: boolean;
  crossfadeSec: number;
  autoNormalize: boolean;
  highQualityMode: boolean;
  audioDevice: string;
  audioOutputMode: AudioOutputMode;
  targetSampleRate: number;
  musicFolders: string[];
  autoRescan: boolean;
  preferEmbeddedTags: boolean;
  detectDuplicates: boolean;
  groupByAlbumArtist: boolean;
  lyricsProvider: 'musixmatch' | 'gemini' | 'lrc';
  autoSaveLyrics: boolean;
  preferSyncedLrc: boolean;
  tagProvider: 'musicbrainz' | 'gemini' | 'discogs';
  hdCoverArt: boolean;
  replaceLowQualCover: boolean;
  saveInsideFile: boolean;
  enableEnhancement: boolean;
  autoFixTags: boolean;
  autoFetchLyrics: boolean;
  autoUpdateCover: boolean;
  showStatusIcons: boolean;
  taskScheduling: 'playback' | 'idle' | 'manual';
  alwaysOnTop: boolean;
  visualizationEnabled: boolean;
  waveformEnabled: boolean;
  isDefaultPlayer: boolean;
  minFileSizeMB: number;
  minDurationSec: number;
  backupFrequency: 'never' | 'daily' | 'weekly' | 'monthly' | 'on-exit';
  autoCleanupBackups: boolean;
  ai: AISettings;
}

export enum NavigationTab {
  Home = 'main',
  Collections = 'collections',
  Playlists = 'playlist',
  AllSongs = 'musics',
  Search = 'search',
  Queue = 'queue',
  Downloads = 'downloads',
  Profile = 'profile',
  Backup = 'backup',
  Diagnostics = 'diagnostics',
  Extensions = 'extensions',
  AISettings = 'ai-settings',
  Developer = 'developer', // New
  Settings = 'settings',
  About = 'about'
}

export type PlaylistViewMode = 'grid' | 'list';
export interface Playlist { id: string; name: string; songIds: string[]; coverUrl?: string; dateCreated: number; lastModified: number; isSystem?: boolean; }
export interface QueueState { items: Song[]; currentIndex: number; shuffled: boolean; repeatMode: 'none' | 'one' | 'all'; }
export interface EQSettings { bass: number; mid: number; treble: number; }
export enum AudioOutputMode { Shared = 'shared', Exclusive = 'exclusive' }
export interface ThemeDefinition { id: string; name: string; base: 'light' | 'dark'; background: string; surface: string; card: string; primary: string; secondary: string; accent: string; textPrimary: string; textSecondary: string; border: string; }
export interface BackupMetadata { id: string; timestamp: number; version: string; type: 'full' | 'partial'; size: number; sections: string[]; itemCount: number; checksum: string; }
export interface CloudProvider { id: 'onedrive' | 'gdrive' | 'dropbox'; name: string; connected: boolean; lastSync?: number; accountName?: string; }
export interface AlbumViewModel { name: string; artist: string; year: number; coverUrl: string; songs: Song[]; totalDuration: number; }
export interface ArtistViewModel { name: string; albums: AlbumViewModel[]; songCount: number; coverUrl: string; }
export type TaskType = 'lyrics' | 'tags' | 'cover' | 'full-enhancement';
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
export interface DownloadTask { id: string; songId: string; songTitle: string; artist: string; coverUrl: string; type: TaskType; status: TaskStatus; progress: number; error?: string; retryCount: number; timestamp: number; }
