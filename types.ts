
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

export type ConditionOperator = 
  | 'is' | 'is-not' | 'contains' | 'not-contains' 
  | 'greater' | 'less' | 'starts' | 'ends';

export type FilterField = 
  | 'title' | 'artist' | 'album' | 'genre' | 'year' 
  | 'duration' | 'playCount' | 'dateAdded' | 'lastPlayed'
  | 'hasLyrics' | 'mood' | 'bitrate';

export interface SmartRule {
  id: string;
  field: FilterField;
  operator: ConditionOperator;
  value: string | number | boolean;
}

export interface SmartRuleGroup {
  id: string;
  logic: 'and' | 'or';
  rules: (SmartRule | SmartRuleGroup)[];
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  coverUrl?: string;
  dateCreated: number;
  lastModified: number;
  isSystem?: boolean;
  isSmart?: boolean;
  smartRules?: SmartRuleGroup;
}

export type ExtensionType = 
  | 'lyrics-provider' 
  | 'tag-provider' 
  | 'cover-provider' 
  | 'audio-effect' 
  | 'visualization' 
  | 'ui-mod' 
  | 'automation';

export interface MelodixExtension {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  type: ExtensionType;
  status: 'enabled' | 'disabled';
  permissions: string[];
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
    networkLimit: 'unlimited' | 'wifi-only' | 'off';
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

export interface CloudDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'web';
  lastSync: number;
  status: 'online' | 'offline' | 'syncing';
  os: string;
}

export interface SyncEvent {
  id: string;
  timestamp: number;
  type: 'upload' | 'download' | 'merge';
  dataType: string;
  status: 'success' | 'failed' | 'pending';
  itemCount: number;
}

export interface SyncConflict {
  id: string;
  type: 'settings' | 'playlist' | 'metadata';
  description: string;
  localTime: number;
  cloudTime: number;
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
  sync: {
    enabled: boolean;
    provider: 'onedrive' | 'gdrive' | 'dropbox' | 'none';
    autoSync: boolean;
    syncOnExit: boolean;
    conflictStrategy: 'ask' | 'keep-local' | 'keep-cloud' | 'smart-merge';
    syncTypes: {
      playlists: boolean;
      settings: boolean;
      metadata: boolean;
      history: boolean;
      stats: boolean;
    };
  };
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
  Developer = 'developer',
  CloudSync = 'cloud-sync',
  Settings = 'settings',
  About = 'about'
}

export type PlaylistViewMode = 'grid' | 'list';
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
