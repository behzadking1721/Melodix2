
import { Song } from './types';

export const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Aurora Borealis',
    artist: 'Celestial Echo',
    album: 'Northern Lights',
    genre: 'Ambient',
    year: 2024,
    duration: 185,
    coverUrl: 'https://picsum.photos/seed/aurora/400/400',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    isFavorite: true,
    dateAdded: Date.now() - 1000000,
    playCount: 45
  },
  {
    id: '2',
    title: 'Digital Dreams',
    artist: 'Synthwave Knight',
    album: 'Neon City',
    genre: 'Electronic',
    year: 2023,
    duration: 210,
    coverUrl: 'https://picsum.photos/seed/dreams/400/400',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    isFavorite: false,
    dateAdded: Date.now() - 5000000,
    playCount: 12
  },
  {
    id: '3',
    title: 'Midnight Rain',
    artist: 'Lofi Girl',
    album: 'Cozy Study',
    genre: 'Lofi',
    year: 2024,
    duration: 145,
    coverUrl: 'https://picsum.photos/seed/rain/400/400',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    isFavorite: true,
    dateAdded: Date.now() - 200000,
    playCount: 120
  },
  {
    id: '4',
    title: 'Desert Wind',
    artist: 'Sandstorm',
    album: 'Golden Dunes',
    genre: 'World',
    year: 2022,
    duration: 320,
    coverUrl: 'https://picsum.photos/seed/wind/400/400',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    isFavorite: false,
    dateAdded: Date.now() - 10000000,
    playCount: 2
  },
  {
    id: '5',
    title: 'Cyberpunk Skyline',
    artist: 'Techno Lord',
    album: 'High Tech Low Life',
    genre: 'Techno',
    year: 2025,
    duration: 245,
    coverUrl: 'https://picsum.photos/seed/cyber/400/400',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    isFavorite: false,
    dateAdded: Date.now() - 50000,
    playCount: 30
  }
];
