
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layers, Search, History, Sparkles, X, Clock } from 'lucide-react';
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
  
  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(['Chill Vibes', 'Lofi 2024', 'Jazz Night']);
  const searchRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('melodix-settings');
    return saved ? JSON.parse(saved) : {
      minFileSizeMB: 2,
      minDurationSec: 30,
      launchOnBoot: false,
      isDefaultPlayer: true,
      alwaysOnTop: false,
      themeMode: 'auto',
      floatingLyrics: false
    };
  });

  const [lyricsCache, setLyricsCache] = useState<Record<string, string>>({});
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  useEffect(() => {
    localStorage.setItem('melodix-settings', JSON.stringify(settings));
  }, [settings]);

  const currentLyricLine = useMemo(() => {
    if (!currentSong || !lyricsCache[currentSong.id]) return null;
    const lines = lyricsCache[currentSong.id].split('\n').map((line, i) => {
      const timeMatch = line.match(/\[(\d+):(\d+\.?\d*)\]/);
      let time = i * 4; 
      let text = line;
      if (timeMatch) {
        time = parseInt(timeMatch[1]) * 60 + parseFloat(timeMatch[2]);
        text = line.replace(/\[.*?\]/g, '').trim();
      }
      return { text: text || line.trim(), time };
    }).filter(l => l.text.length > 0);

    for (let i = lines.length - 1; i >= 0; i--) {
      if (progress >= lines[i].time) return lines[i].text;
    }
    return lines[0]?.text;
  }, [lyricsCache, currentSong, progress]);

  const systemPlaylists = useMemo<Playlist[]>(() => {
    const filteredSongs = songs.filter(s => s.duration >= settings.minDurationSec);
    const genres = Array.from(new Set(filteredSongs.map(s => s.genre)));
    
    return [
      { id: 'recent', name: 'New Assets', isSystem: true, songIds: [...filteredSongs].sort((a,b) => b.dateAdded - a.dateAdded).slice(0, 5).map(s => s.id), coverUrl: 'https://picsum.photos/seed/melodix-new/600/600' },
      { id: 'most-played', name: 'Hot Rotation', isSystem: true, songIds: [...filteredSongs].sort((a,b) => b.playCount - a.playCount).slice(0, 8).map(s => s.id), coverUrl: 'https://picsum.photos/seed/melodix-hot/600/600' },
      { id: 'favorites', name: 'Core Alpha', isSystem: true, songIds: filteredSongs.filter(s => s.isFavorite).map(s => s.id), coverUrl: 'https://picsum.photos/seed/melodix-love/600/600' }
    ];
  }, [songs, settings.minDurationSec]);

  useEffect(() => {
    if (currentSong) {
      handleSyncMetadata(currentSong);
    }
  }, [currentSong?.id]);

  const handleSyncMetadata = async (song: Song) => {
    const suggestions = await suggestSongTags(song);
    handleUpdateSong({ ...song, ...suggestions, isSynced: true });
    
    setIsLyricsLoading(true);
    const lyrics = await fetchLyrics(suggestions.title || song.title, suggestions.artist || song.artist, song.id);
    setLyricsCache(prev => ({ ...prev, [song.id]: lyrics }));
    handleUpdateSong({ ...song, ...suggestions, isSynced: true, hasLyrics: !!lyrics && lyrics.length > 50 });
    setIsLyricsLoading(false);
  };

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    const updateProgress = () => { if (audioRef.current) setProgress(audioRef.current.currentTime); };
    audioRef.current.addEventListener('timeupdate', updateProgress);
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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setSearchHistory(prev => [searchQuery, ...prev.filter(h => h !== searchQuery)].slice(0, 5));
      setIsSearchOpen(false);
      setActiveTab(NavigationTab.AllSongs);
    }
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
               <div className="p-16 flex items-end gap-16 bg-gradient-to-b from-blue-600/20 to-transparent">
                <img src={playlist?.coverUrl} className="w-80 h-80 rounded-[3rem] shadow-2xl object-cover border border-white/5" alt="" />
                <div className="pb-8 space-y-4">
                  <h2 className="text-8xl font-black tracking-tighter text-white">{playlist?.name}</h2>
                  <div className="flex items-center gap-6 text-zinc-500 font-black uppercase text-[10px] tracking-[0.4em]">
                    <span>{playlist?.songIds.length} ASSETS</span>
                    <span>OFFLINE CACHED</span>
                  </div>
                  <button onClick={() => setSelectedPlaylistId(null)} className="mt-4 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">← Back</button>
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
          <div className="p-20 max-w-4xl space-y-10 animate-in fade-in duration-700">
             <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center font-black text-4xl text-white shadow-2xl">M</div>
              <h2 className="text-6xl font-black tracking-tighter text-white">Melodix v5.5</h2>
            </div>
            <p className="text-zinc-400 text-xl leading-relaxed font-semibold max-w-xl">
              Next-generation local audio environment with Neural LRC sync and Musixmatch-grade precision.
            </p>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${settings.themeMode === 'light' ? 'bg-zinc-100 text-zinc-900' : 'bg-[#0a0a0a] text-white'} ${settings.alwaysOnTop ? 'relative z-[999]' : ''}`}>
      <TitleBar />
      <Sidebar activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setSelectedPlaylistId(null); }} playlists={systemPlaylists} />
      
      <main className="flex-1 h-full overflow-y-auto bg-transparent pt-10 relative custom-scrollbar">
        
        {/* Floating Controls Overlay */}
        <div className="fixed top-12 right-10 flex items-center gap-2 z-[300]">
           <button 
             onClick={() => setIsSearchOpen(!isSearchOpen)}
             className={`p-3 rounded-2xl transition-all border ${isSearchOpen ? 'bg-white text-black border-white' : 'bg-black/40 backdrop-blur-3xl text-zinc-400 border-white/5 hover:text-white hover:bg-white/5'}`}
           >
             <Search size={16} />
           </button>
           <button 
              onClick={() => setSettings({...settings, floatingLyrics: !settings.floatingLyrics})}
              className={`p-3 rounded-2xl transition-all border ${settings.floatingLyrics ? 'bg-blue-600 text-white border-blue-400' : 'bg-black/40 backdrop-blur-3xl text-zinc-400 border-white/5 hover:text-white hover:bg-white/5'}`}
            >
              <Layers size={16} />
            </button>
        </div>

        {/* Neural Floating Search Panel */}
        {isSearchOpen && (
          <div ref={searchRef} className="fixed top-24 right-10 w-80 bg-zinc-900/90 backdrop-blur-[60px] border border-white/10 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-[400] animate-in slide-in-from-top-2 duration-300 overflow-hidden">
            <form onSubmit={handleSearchSubmit} className="p-5 border-b border-white/5">
              <input 
                autoFocus
                type="text" 
                placeholder="Ask Melodix..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 px-4 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </form>
            <div className="p-5 space-y-5">
               <div className="space-y-2">
                  <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2"><History size={10}/> History</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {searchHistory.map((h, i) => (
                      <button key={i} onClick={() => { setSearchQuery(h); handleSearchSubmit(); }} className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-bold text-zinc-400 hover:text-white transition-all">
                        {h}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="space-y-1.5">
                  <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Sparkles size={10} className="text-blue-500"/> AI Suggestions</h4>
                  {['Similar to ' + (currentSong?.artist || 'Jazz'), 'High-Fidelity Tracks'].map((s, i) => (
                    <button key={i} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/5 text-[10px] font-medium text-zinc-500 hover:text-blue-400 transition-all">
                      {s}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        )}

        {renderContent()}
      </main>
      
      <Equalizer settings={eqSettings} onChange={setEqSettings} isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />
      
      <Player 
        currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
        progress={progress} duration={currentSong?.duration || 0} onSeek={val => { if (audioRef.current) audioRef.current.currentTime = val; }}
        volume={volume} onVolumeChange={setVolume} onToggleEq={() => setIsEqOpen(!isEqOpen)} isEqOpen={isEqOpen}
      />

      {/* Transparent Floating Lyric Overlay */}
      {settings.floatingLyrics && currentSong && currentLyricLine && !isSearchOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[250] pointer-events-none px-12 text-center animate-in fade-in duration-1000">
           <div className="max-w-5xl">
              <p className="text-white font-black tracking-tighter leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]" style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}>
                {currentLyricLine}
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
