
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
  id: 'onedrive' | 'gdrive' | 'dropbox';
  name: string;
  connected: boolean;
  lastSync?: number;
  accountName?: string;
}

export interface AlbumViewModel {
  name: string;
  artist: string;
  year: number;
  coverUrl: string;
  songs: Song[];
  totalDuration: number;
}

export interface ArtistViewModel {
  name: string;
  albums: AlbumViewModel[];
  songCount: number;
  coverUrl: string;
}

export type TaskType = 'lyrics' | 'tags' | 'cover' | 'full-enhancement';
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'paused';

export interface DownloadTask {
  id: string;
  songId: string;
  songTitle: string;
  artist: string;
  coverUrl: string;
  type: TaskType;
  status: TaskStatus;
  progress: number;
  error?: string;
  retryCount: number;
  timestamp: number;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  coverUrl?: string;
  dateCreated: number;
  lastModified: number;
  isSystem?: boolean;
}

export interface QueueState {
  items: Song[];
  currentIndex: number;
  shuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
}

export interface EQSettings {
  bass: number;
  mid: number;
  treble: number;
}

export enum AudioOutputMode {
  Shared = 'shared',
  Exclusive = 'exclusive'
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
}

export type PlaylistViewMode = 'grid' | 'list';

export enum NavigationTab {
  Home = 'main',
  Collections = 'collections',
  Playlists = 'playlist',
  AllSongs = 'musics',
  Search = 'search',
  Queue = 'queue',
  Downloads = 'downloads',
  Profile = 'profile',
  Backup = 'backup', // New
  Settings = 'settings',
  About = 'about'
}
