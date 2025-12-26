
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
  isSynced?: boolean;
  hasLyrics?: boolean;
  replayGain?: number; // dB adjustment
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
  autoNormalize: boolean; // Step 3: ReplayGain/Normalizer
  visualizationEnabled: boolean; // Step 4: Spectrum
  miniMode: boolean;
  gaplessPlayback: boolean; // Step 2: Gapless
  audioDevice: string; // Step 11: Output Device
}

export enum NavigationTab {
  Home = 'main',
  Playlists = 'playlist',
  AllSongs = 'musics',
  Queue = 'queue',
  Settings = 'settings',
  About = 'about'
}
