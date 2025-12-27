
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
  About = 'about',
  AudioLab = 'audio-lab',
  Visualizer = 'visualizer',
  LyricsVisualizer = 'lyrics-visualizer'
}

export interface KeyboardShortcut {
  id: string;
  action: string;
  category: 'playback' | 'library' | 'ui' | 'advanced';
  keys: string[]; // e.g. ["Control", "Shift", "P"]
  isCustom: boolean;
  global?: boolean;
}

export interface ShortcutProfile {
  id: string;
  name: string;
  shortcuts: KeyboardShortcut[];
  isSystem?: boolean;
}

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'paused';

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
  trackNumber?: number;
  trackCount?: number;
  discNumber?: number;
  albumArtist?: string;
  comment?: string;
  composer?: string;
  publisher?: string;
  isrc?: string;
  bpm?: number;
  lyricsLanguage?: string;
  tagStatus?: 'none' | 'partial' | 'full';
  lyricsStatus?: 'none' | 'partial' | 'full';
  coverStatus?: 'none' | 'partial' | 'full';
  hasLyrics?: boolean;
  lrcContent?: string;
  lastPlayed?: number;
  lastUpdated?: number;
  tagHistory?: TagSnapshot[];
  replayGain?: number;
}

export interface TagSnapshot {
  id: string;
  timestamp: number;
  data: Partial<Song>;
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

export interface EQSettings {
  enabled?: boolean;
  mode?: number;
  bands?: number[];
  bass: number;
  mid: number;
  treble: number;
  presets?: Record<string, number[]>;
}

export enum AudioOutputMode {
  Shared = 'shared',
  Exclusive = 'exclusive'
}

export type PlaylistViewMode = 'grid' | 'list';

export interface QueueState {
  items: Song[];
  currentIndex: number;
  shuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
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

export interface AppSettings {
  autoNormalize: boolean;
  gaplessPlayback: boolean;
  activeThemeId: string;
  enableBlur: boolean;
  enableAnimations: boolean;
  ai: AISettings;
  sync: SyncSettings;
}

export interface AISettings {
  smartSearch: {
    enabled: boolean;
    fuzzyMatching: boolean;
    semanticSearch: boolean;
    weights: {
      title: number;
      artist: number;
      genre: number;
    };
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

export type ExtensionType = 'lyrics-provider' | 'audio-effect' | 'visualization' | 'automation' | 'ui-mod' | 'tag-provider';

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
  itemId: string;
  type: string;
  localData: any;
  cloudData: any;
}

export type ConditionOperator = 'is' | 'is-not' | 'contains' | 'not-contains' | 'greater' | 'less' | 'starts' | 'ends';
export type FilterField = keyof Song;

export interface SmartRule {
  id: string;
  field: FilterField;
  operator: ConditionOperator;
  value: any;
}

export interface SmartRuleGroup {
  id: string;
  logic: 'and' | 'or';
  rules: (SmartRule | SmartRuleGroup)[];
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
