
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: number;
  trackNumber?: number; // Stage 2
  duration: number; 
  coverUrl: string;
  url: string;
  isFavorite: boolean;
  dateAdded: number;
  playCount: number;
  isSynced?: boolean;
  hasLyrics?: boolean;
  lrcContent?: string; // Stage 3: Sync Lyrics
  replayGain?: number; // Stage 1: Auto Volume Leveling (dB)
  bpm?: number;
}

export enum PlaylistViewMode {
  Detailed = 'detailed',
  Compact = 'compact',
  Grid = 'grid'
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  coverUrl?: string;
  isSystem?: boolean;
}

export interface EQSettings {
  bass: number;
  mid: number;
  treble: number;
}

export interface AppSettings {
  minFileSizeMB: number;
  minDurationSec: number;
  launchOnBoot: boolean;
  isDefaultPlayer: boolean;
  alwaysOnTop: boolean;
  themeMode: 'auto' | 'light' | 'dark';
  floatingLyrics: boolean;
  accentColor: string;
  crossfadeSec: number;
  autoNormalize: boolean;
  visualizationEnabled: boolean;
  waveformEnabled: boolean; // New in Stage 4
  miniMode: boolean;
  gaplessPlayback: boolean;
  audioDevice: string;
}

export enum NavigationTab {
  Home = 'main',
  Playlists = 'playlist',
  AllSongs = 'musics',
  Queue = 'queue',
  Settings = 'settings',
  About = 'about'
}
