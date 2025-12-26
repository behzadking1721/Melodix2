
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
  const [searchHistory, setSearchHistory] = useState<string[]>(['Lofi beats', 'Jazz 2024', 'Acoustic guitar']);
  
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
      { id: 'recent', name: 'New Discovery', isSystem: true, songIds: [...filteredSongs].sort((a,b) => b.dateAdded - a.dateAdded).slice(0, 5).map(s => s.id), coverUrl: 'https://picsum.photos/seed/melodix-new/600/600' },
      { id: 'most-played', name: 'Heavy Rotation', isSystem: true, songIds: [...filteredSongs].sort((a,b) => b.playCount - a.playCount).slice(0, 8).map(s => s.id), coverUrl: 'https://picsum.photos/seed/melodix-hot/600/600' },
      ...genres.slice(0, 2).map(g => ({
        id: `ai-genre-${g}`,
        name: `${g} Pulse`,
        isSystem: true,
        songIds: filteredSongs.filter(s => s.genre === g).map(s => s.id),
        coverUrl: `https://picsum.photos/seed/${g}/600/600`
      })),
      { id: 'favorites', name: 'Collection Alpha', isSystem: true, songIds: filteredSongs.filter(s => s.isFavorite).map(s => s.id), coverUrl: 'https://picsum.photos/seed/melodix-love/600/600' }
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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setSearchHistory(prev => [searchQuery, ...prev.filter(h => h !== searchQuery)].slice(0, 5));
      setIsSearchOpen(false);
      // Actual search logic would navigate or filter
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
                  <button onClick={() => setSelectedPlaylistId(null)} className="mt-4 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">← Hub</button>
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
          <div className="p-24 max-w-5xl space-y-12 animate-in fade-in duration-1000">
             <div className="flex items-center gap-8">
              <div className="w-32 h-32 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center font-black text-6xl text-white shadow-2xl">M</div>
              <h2 className="text-7xl font-black tracking-tighter text-white">Melodix v5.2</h2>
            </div>
            <p className="text-zinc-400 text-2xl leading-relaxed font-semibold max-w-2xl">
              Professional neural audio interface using IndexedDB and Gemini 3 Pro reasoning.
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
        
        {/* Sleek Floating Global Actions */}
        <div className="fixed top-12 right-12 flex items-center gap-3 z-[200]">
           <button 
             onClick={() => setIsSearchOpen(!isSearchOpen)}
             className={`p-3.5 rounded-2xl transition-all duration-300 border ${isSearchOpen ? 'bg-white text-black border-white' : 'bg-black/20 backdrop-blur-3xl text-zinc-400 border-white/5 hover:text-white'}`}
           >
             <Search size={18} />
           </button>
           <button 
              onClick={() => setSettings({...settings, floatingLyrics: !settings.floatingLyrics})}
              className={`p-3.5 rounded-2xl transition-all duration-300 border ${settings.floatingLyrics ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-black/20 backdrop-blur-3xl text-zinc-400 border-white/5 hover:text-white'}`}
            >
              <Layers size={18} />
            </button>
        </div>

        {/* Floating Search Panel */}
        {isSearchOpen && (
          <div className="fixed top-28 right-12 w-96 bg-zinc-900/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl z-[250] animate-in slide-in-from-top-4 duration-300 overflow-hidden">
            <form onSubmit={handleSearchSubmit} className="p-6 border-b border-white/5">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Ask or find anything..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
            </form>
            <div className="p-6 space-y-6">
               <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                    <History size={12} /> Recent Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((h, i) => (
                      <button key={i} onClick={() => { setSearchQuery(h); handleSearchSubmit(); }} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-zinc-400 hover:text-white transition-all">
                        {h}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} className="text-blue-500" /> Neural Suggestions
                  </h4>
                  <div className="space-y-1">
                    {['Top Jazz from Collection', 'Similar to ' + (currentSong?.artist || 'Library')].map((s, i) => (
                      <button key={i} className="w-full text-left px-4 py-2 rounded-xl hover:bg-white/5 text-[11px] font-medium text-zinc-500 hover:text-blue-400 transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
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

      {/* Persistent Lyric Layer */}
      {settings.floatingLyrics && currentSong && currentLyricLine && !isSearchOpen && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 z-[180] pointer-events-none animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-black/20 backdrop-blur-[60px] border border-white/5 rounded-[2.5rem] p-10 text-center shadow-2xl">
            <p className="text-white font-black tracking-tighter leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
              {currentLyricLine}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
