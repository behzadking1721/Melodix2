
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
  isSynced?: boolean;
  hasLyrics?: boolean;
  lrcContent?: string;
  replayGain?: number;
  bpm?: number;
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
  waveformEnabled: boolean;
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

/**
 * Defines available viewing modes for the playlist section.
 */
export enum PlaylistViewMode {
  Grid = 'grid',
  List = 'list',
  Detailed = 'detailed'
}
