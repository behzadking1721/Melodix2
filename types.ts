
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
  About = 'about',
  AudioLab = 'audio-lab',
  Visualizer = 'visualizer'
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: number;
  duration: number;
  coverUrl: string;
  url: string;
  isFavorite: boolean;
  dateAdded: number;
  playCount: number;
  lyricsStatus?: 'full' | 'partial' | 'none';
  tagStatus?: 'full' | 'partial' | 'none';
  coverStatus?: 'full' | 'partial' | 'none';
  trackNumber?: number;
  trackCount?: number;
  discNumber?: number;
  lrcContent?: string;
  hasLyrics?: boolean;
  albumArtist?: string;
  comment?: string;
  composer?: string;
  publisher?: string;
  isrc?: string;
  bpm?: number;
  lyricsLanguage?: string;
  tagHistory?: TagSnapshot[];
  lastUpdated?: number;
  lastPlayed?: number;
  replayGain?: number;
}

export interface TagSnapshot {
  id: string;
  timestamp: number;
  data: Partial<Song>;
}

export interface ArtistViewModel {
  name: string;
  albums: AlbumViewModel[];
  songCount: number;
  coverUrl: string;
}

export interface AlbumViewModel {
  name: string;
  artist: string;
  year: number;
  coverUrl: string;
  songs: Song[];
  totalDuration: number;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  coverUrl?: string;
  isSystem?: boolean;
  isSmart?: boolean;
  smartRules?: SmartRuleGroup;
  dateCreated: number;
  lastModified: number;
}

export enum AudioOutputMode {
  Shared = 'shared',
  Exclusive = 'exclusive'
}

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'paused';

export interface DownloadTask {
  id: string;
  songId: string;
  songTitle: string;
  artist: string;
  coverUrl: string;
  type: string;
  status: TaskStatus;
  progress: number;
  retryCount: number;
  timestamp: number;
  error?: string;
}

export interface EQSettings {
  enabled: boolean;
  mode: number;
  bands: number[];
  bass: number;
  mid: number;
  treble: number;
  presets: Record<string, number[]>;
}

export interface AppSettings {
  themeMode: 'light' | 'dark';
  activeThemeId: string;
  ai: AISettings;
  sync: {
    enabled: boolean;
    autoSync: boolean;
    syncOnExit: boolean;
    conflictStrategy: string;
    syncTypes: {
      playlists: boolean;
      settings: boolean;
      metadata: boolean;
      history: boolean;
      stats: boolean;
    };
  };
  enableBlur?: boolean;
  enableAnimations?: boolean;
  miniMode?: boolean;
  miniProgress?: boolean;
  miniCover?: boolean;
  language?: string;
  defaultPage?: NavigationTab;
  launchOnBoot?: boolean;
  launchMinimized?: boolean;
  showToasts?: boolean;
  uiDensity?: 'comfortable' | 'compact';
  audioDevice?: string;
  audioOutputMode?: AudioOutputMode;
  autoNormalize?: boolean;
  gaplessPlayback?: boolean;
  crossfadeSec?: number;
  targetSampleRate?: number;
  musicFolders: string[];
  autoRescan?: boolean;
  preferEmbeddedTags?: boolean;
  detectDuplicates?: boolean;
  groupByAlbumArtist?: boolean;
  lyricsProvider?: string;
  tagProvider?: string;
  autoSaveLyrics?: boolean;
  preferSyncedLrc?: boolean;
  saveInsideFile?: boolean;
  hdCoverArt?: boolean;
  enableEnhancement?: boolean;
  autoFixTags?: boolean;
  autoFetchLyrics?: boolean;
  autoUpdateCover?: boolean;
  showStatusIcons?: boolean;
  taskScheduling?: 'playback' | 'idle' | 'manual';
  customThemes?: ThemeDefinition[];
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
    networkLimit: 'unlimited' | 'cellular' | 'none';
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

export interface QueueState {
  items: Song[];
  currentIndex: number;
  shuffled: boolean;
  repeatMode: 'all' | 'one' | 'none';
}

export interface ThemeDefinition {
  id: string;
  name: string;
  base: 'light' | 'dark';
  background: string;
  surface: string;
  card: string;
  primary: string;
  secondary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

export interface BackupMetadata {
  id: string;
  timestamp: number;
  version: string;
  type: 'full' | 'partial';
  size: number;
  sections: string[];
  itemCount: number;
  checksum: string;
}

export interface CloudProvider {
  id: string;
  name: string;
  connected: boolean;
  accountName?: string;
  lastSync?: number;
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
  hasSettings: boolean;
}

export type ExtensionType = 'lyrics-provider' | 'audio-effect' | 'visualization' | 'automation' | 'ui-mod' | 'tag-provider';

export interface MelodixScript {
  id: string;
  name: string;
  code: string;
  status: 'idle' | 'running';
  lastRun?: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export interface CloudDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  lastSync: number;
  status: 'online' | 'offline';
  os: string;
}

export interface SyncEvent {
  id: string;
  timestamp: number;
  type: 'upload' | 'download' | 'merge';
  dataType: string;
  status: 'success' | 'failed';
  itemCount: number;
}

export interface SyncConflict {
  id: string;
  songId: string;
  field: string;
  localValue: any;
  remoteValue: any;
}

export interface SmartRuleGroup {
  id: string;
  logic: 'and' | 'or';
  rules: (SmartRule | SmartRuleGroup)[];
}

export interface SmartRule {
  id: string;
  field: FilterField;
  operator: ConditionOperator;
  value: any;
}

export type ConditionOperator = 'is' | 'is-not' | 'contains' | 'not-contains' | 'greater' | 'less' | 'starts' | 'ends';

export type FilterField = 'title' | 'artist' | 'album' | 'genre' | 'year' | 'playCount' | 'duration' | 'hasLyrics';

export interface AudioEffectSettings {
  bassBoost: number;
  trebleBoost: number;
  clarity: number;
  warmth: number;
  reverb: {
    enabled: boolean;
    type: 'room' | 'hall' | 'plate' | 'cathedral';
    size: number;
    decay: number;
    mix: number;
  };
  spatial: {
    enabled: boolean;
    depth: number;
    width: number;
    mode: 'headphone' | 'speaker';
  };
}

export type PlaylistViewMode = 'grid' | 'list' | 'columns';
