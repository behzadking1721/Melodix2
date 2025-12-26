import React, { useState, useEffect, useRef, useMemo } from 'react';
// Added Mic2 import to fix "Cannot find name 'Mic2'" error
import { Mic2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import LibraryView from './components/LibraryView';
import HomeView from './components/HomeView';
import Equalizer from './components/Equalizer';
import SettingsView from './components/SettingsView';
import TitleBar from './components/TitleBar';
import { Song, NavigationTab, EQSettings, Playlist, AppSettings } from './types';
import { MOCK_SONGS } from './constants';
import { fetchLyrics, suggestSongTags } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.Home);
  const [songs, setSongs] = useState<Song[]>(MOCK_SONGS);
  const [currentSong, setCurrentSong] = useState<Song | null>(songs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [eqSettings, setEqSettings] = useState<EQSettings>({ bass: 0, mid: 0, treble: 0 });
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('aurora-settings');
    return saved ? JSON.parse(saved) : {
      minFileSizeMB: 2,
      minDurationSec: 30,
      launchOnBoot: false,
      isDefaultPlayer: true,
      themeMode: 'auto',
      floatingLyrics: false
    };
  });

  const [lyricsCache, setLyricsCache] = useState<Record<string, string>>({});
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('aurora-settings', JSON.stringify(settings));
  }, [settings]);

  // AI-Powered Dynamic Collections - Completely automated curation based on library analysis
  const systemPlaylists = useMemo<Playlist[]>(() => {
    const filteredSongs = songs.filter(s => s.duration >= settings.minDurationSec);
    const genres = Array.from(new Set(filteredSongs.map(s => s.genre)));
    
    const smartLists = genres.slice(0, 3).map(g => ({
      id: `ai-genre-${g}`,
      name: `${g} Mood`,
      isSystem: true,
      songIds: filteredSongs.filter(s => s.genre === g).map(s => s.id),
      coverUrl: `https://picsum.photos/seed/genre-${g}/600/600`
    }));

    return [
      { id: 'recent', name: 'Fresh Picks', isSystem: true, songIds: [...filteredSongs].sort((a,b) => b.dateAdded - a.dateAdded).slice(0, 5).map(s => s.id), coverUrl: 'https://picsum.photos/seed/fresh/600/600' },
      { id: 'most-played', name: 'Your Top Hits', isSystem: true, songIds: [...filteredSongs].sort((a,b) => b.playCount - a.playCount).slice(0, 8).map(s => s.id), coverUrl: 'https://picsum.photos/seed/fire/600/600' },
      ...smartLists,
      { id: 'favorites', name: 'Loved Tracks', isSystem: true, songIds: filteredSongs.filter(s => s.isFavorite).map(s => s.id), coverUrl: 'https://picsum.photos/seed/love/600/600' }
    ];
  }, [songs, settings.minDurationSec]);

  useEffect(() => {
    if (currentSong && !currentSong.isSynced) {
      handleSyncMetadata(currentSong);
    }
  }, [currentSong?.id]);

  const handleSyncMetadata = async (song: Song) => {
    const suggestions = await suggestSongTags(song);
    handleUpdateSong({ ...song, ...suggestions, isSynced: true });
    
    setIsLyricsLoading(true);
    const lyrics = await fetchLyrics(suggestions.title || song.title, suggestions.artist || song.artist);
    setLyricsCache(prev => ({ ...prev, [song.id]: lyrics }));
    handleUpdateSong({ ...song, ...suggestions, isSynced: true, hasLyrics: !!lyrics && lyrics.length > 50 });
    setIsLyricsLoading(false);
  };

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    const updateProgress = () => { if (audioRef.current) setProgress(audioRef.current.currentTime); };
    audioRef.current.addEventListener('timeupdate', updateProgress);
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
      if (currentSong) handleUpdateSong({ ...currentSong, playCount: currentSong.playCount + 1 });
    });
    return () => audioRef.current?.pause();
  }, [currentSong?.id]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      const wasPlaying = isPlaying;
      audioRef.current.src = currentSong.url;
      if (wasPlaying) audioRef.current.play().catch(() => {});
    }
  }, [currentSong?.id]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  const handleUpdateSong = (updatedSong: Song) => {
    setSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
    if (currentSong?.id === updatedSong.id) setCurrentSong(updatedSong);
  };

  const renderContent = () => {
    switch (activeTab) {
      case NavigationTab.Home:
        return <HomeView currentSong={currentSong} lyrics={currentSong ? lyricsCache[currentSong.id] : ''} isLoadingLyrics={isLyricsLoading} currentTime={progress} />;
      case NavigationTab.AllSongs:
        return <LibraryView songs={songs} onSongSelect={setCurrentSong} currentSongId={currentSong?.id} onUpdateSong={handleUpdateSong} />;
      case NavigationTab.Playlists:
        if (selectedPlaylistId) {
          const playlist = systemPlaylists.find(p => p.id === selectedPlaylistId);
          const playlistSongs = songs.filter(s => playlist?.songIds.includes(s.id));
          return (
            <div className="flex flex-col h-full animate-in slide-in-from-right-10 duration-500 pb-32">
               <div className="p-12 flex items-end gap-12 bg-gradient-to-b from-blue-500/10 to-transparent">
                <img src={playlist?.coverUrl} className="w-80 h-80 rounded-[3.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] object-cover border border-white/5" alt="" />
                <div className="pb-6">
                  <h2 className="text-8xl font-black mb-6 tracking-tighter text-white drop-shadow-lg">{playlist?.name}</h2>
                  <div className="flex items-center gap-4 text-zinc-400 font-black uppercase text-[10px] tracking-[0.3em]">
                    <span>{playlist?.songIds.length} SYSTEM FILES</span>
                    <span className="text-blue-500">AI CURATED</span>
                  </div>
                  <button onClick={() => setSelectedPlaylistId(null)} className="mt-8 px-10 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">← Back to Collections</button>
                </div>
              </div>
              <LibraryView songs={playlistSongs} onSongSelect={setCurrentSong} currentSongId={currentSong?.id} onUpdateSong={handleUpdateSong} />
            </div>
          );
        }
        return <LibraryView songs={songs} playlists={systemPlaylists} onSongSelect={setCurrentSong} onUpdateSong={handleUpdateSong} isPlaylistView={true} onPlaylistSelect={setSelectedPlaylistId} />;
      case NavigationTab.Settings:
        return <SettingsView settings={settings} onUpdate={setSettings} />;
      case NavigationTab.About:
        return (
          <div className="p-16 max-w-4xl space-y-12 animate-in fade-in duration-700">
             <div className="flex items-center gap-10">
              <div className="w-40 h-40 rounded-[3.5rem] bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-black text-7xl shadow-3xl shadow-blue-500/30 text-white">A</div>
              <div>
                <h2 className="text-7xl font-black tracking-tighter text-white">Aurora Player</h2>
                <p className="text-blue-400 font-black uppercase tracking-[0.4em] text-xs">V4.0.0 Intelligence Edition</p>
              </div>
            </div>
            <p className="text-zinc-400 text-2xl leading-relaxed font-semibold">
              Aurora analysis your system music using Google Gemini AI. It restores missing metadata and embeds synced lyrics directly into your local storage experience.
            </p>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${settings.themeMode === 'light' ? 'bg-zinc-50' : 'bg-transparent text-white'}`}>
      <TitleBar />
      <Sidebar activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setSelectedPlaylistId(null); }} playlists={systemPlaylists} />
      <main className="flex-1 h-full overflow-y-auto bg-black/40 pt-8 relative custom-scrollbar">
        {renderContent()}
      </main>
      
      <Equalizer settings={eqSettings} onChange={setEqSettings} isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />
      
      <Player 
        currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
        progress={progress} duration={currentSong?.duration || 0} onSeek={val => { if (audioRef.current) audioRef.current.currentTime = val; }}
        volume={volume} onVolumeChange={setVolume} onToggleEq={() => setIsEqOpen(!isEqOpen)} isEqOpen={isEqOpen}
      />

      {settings.floatingLyrics && currentSong && (
        <div className="fixed top-20 right-8 w-64 p-4 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl z-[200] animate-in zoom-in-95 pointer-events-none shadow-2xl">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Mic2 size={10} /> Floating Stream
          </p>
          <p className="text-white font-bold leading-tight text-sm">
            {lyricsCache[currentSong.id]?.split('\n')[progress % 10] || "Synced to system track..."}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;