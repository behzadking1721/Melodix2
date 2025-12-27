
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
  Shortcuts = 'shortcuts',
  Accessibility = 'accessibility',
  CacheManager = 'cache-manager',
  About = 'about',
  AudioLab = 'audio-lab',
  Visualizer = 'visualizer',
  LyricsVisualizer = 'lyrics-visualizer'
}

/**
 * Core Song model representing local audio assets and their AI-enhanced metadata.
 */
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
  lastPlayed?: number;
  lastUpdated?: number;
  replayGain?: number;
  lrcContent?: string;
  hasLyrics?: boolean;
  tagStatus?: 'none' | 'partial' | 'full';
  lyricsStatus?: 'none' | 'partial' | 'full';
  coverStatus?: 'none' | 'partial' | 'full';
  trackNumber?: number;
  discNumber?: number;
  albumArtist?: string;
  composer?: string;
  publisher?: string;
  isrc?: string;
  bpm?: number;
  lyricsLanguage?: string;
  comment?: string;
  tagHistory?: TagSnapshot[];
}

/**
 * Snapshot for tracking metadata changes over time.
 */
export interface TagSnapshot {
  id: string;
  timestamp: number;
  data: Partial<Song>;
}

/**
 * User-defined or system-generated collection of tracks.
 */
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

/**
 * Logic group for high-performance library filtering.
 */
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

/**
 * View models for library aggregation.
 */
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

/**
 * Background task tracking for AI enhancements.
 */
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

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'paused';

/**
 * DSP and Audio Engine configurations.
 */
export interface EQSettings {
  bass: number;
  mid: number;
  treble: number;
  enabled?: boolean;
  mode?: number;
  bands: number[];
  presets?: Record<string, number[]>;
}

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

export enum AudioOutputMode {
  Shared = 'shared',
  Exclusive = 'exclusive'
}

export enum PlaylistViewMode {
  List = 'list',
  Grid = 'grid'
}

/**
 * Playback session state.
 */
export interface QueueState {
  items: Song[];
  currentIndex: number;
  shuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
}

/**
 * Visual styling and atmosphere definitions.
 */
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

/**
 * System recovery and backup structures.
 */
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

export interface BackupSnapshot {
  id: string;
  label: string;
  timestamp: number;
  type: 'local' | 'cloud' | 'hybrid';
  size: number;
  version: string;
  checksum: string;
  integrityScore: number;
  contents: {
    library: boolean;
    metadata: boolean;
    settings: boolean;
    extensions: boolean;
  };
  provider?: string;
}

export interface CloudProvider {
  id: string;
  name: string;
  connected: boolean;
  accountName?: string;
  lastSync?: number;
  storageUsed?: number;
  storageTotal?: number;
}

/**
 * Application extensibility and middleware.
 */
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

export type ExtensionType = 'lyrics-provider' | 'audio-effect' | 'visualization' | 'automation' | 'ui-mod' | 'tag-provider' | 'general';

/**
 * Scripting and automation.
 */
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

/**
 * Cross-device synchronization.
 */
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
  type: string;
  localValue: any;
  remoteValue: any;
}

/**
 * Input orchestration.
 */
export interface KeyboardShortcut {
  id: string;
  action: string;
  category: 'playback' | 'ui' | 'advanced';
  keys: string[];
  isCustom: boolean;
}

export interface ShortcutProfile {
  id: string;
  name: string;
  shortcuts: KeyboardShortcut[];
  isSystem: boolean;
}

/**
 * Cache and storage metrics.
 */
export interface CacheCategoryStats {
  id: string;
  name: string;
  size: number;
  itemCount: number;
  oldestFile: number;
  health: 'optimal' | 'bloated' | 'corrupted';
  description: string;
}

export interface CacheSettings {
  autoPurgeEnabled: boolean;
  purgeFrequency: 'weekly' | 'monthly';
  maxSizeGB: number;
  retentionDays: number;
}

/**
 * Neural Core configurations.
 */
export interface AISettings {
  smartSearch: {
    enabled: boolean;
    fuzzyMatching: boolean;
    semanticSearch: boolean;
    weights: { title: number; artist: number; genre: number };
  };
  recommendation: {
    useHistory: boolean;
    useMood: boolean;
    strength: number;
    threshold: number;
    diversity: number;
  };
  moodDetection: {
    analyzeWaveform: boolean;
    analyzeLyrics: boolean;
    categories: string[];
  };
  providerPriority: {
    lyrics: string[];
    tags: string[];
    covers: string[];
  };
  privacy: {
    localInferenceOnly: boolean;
    anonymousUsageData: boolean;
    cloudSyncEnabled: boolean;
  };
}

export interface SyncSettings {
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
}

export interface AccessibilitySettings {
  highContrast: boolean;
  highContrastTheme: string;
  reduceMotion: boolean;
  screenReaderOptimized: boolean;
  textScale: number;
  uiScale: number;
  fontFamily: string;
  colorBlindnessMode: string;
  colorBlindnessIntensity: number;
}

export interface BackupScheduler {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retentionLimit: number;
  autoDeleteOld: boolean;
}

/**
 * Global application settings matrix.
 */
export interface AppSettings {
  autoNormalize: boolean;
  gaplessPlayback: boolean;
  activeThemeId: string;
  enableBlur: boolean;
  enableAnimations: boolean;
  ai: AISettings;
  sync: SyncSettings;
  accessibility: AccessibilitySettings;
  backupScheduler?: BackupScheduler;
  cache?: CacheSettings;
}
