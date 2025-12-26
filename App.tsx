
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layers, Search, History, Sparkles, X, Clock, Minimize2, Maximize2 } from 'lucide-react';
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
  const [isMiniMode, setIsMiniMode] = useState(false);
  const [eqSettings, setEqSettings] = useState<EQSettings>({ bass: 0, mid: 0, treble: 0 });
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(['Chill Beats', 'Retro Synth', 'Acoustic Soul']);
  const searchRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('melodix-settings-v2');
    return saved ? JSON.parse(saved) : {
      minFileSizeMB: 2,
      minDurationSec: 30,
      launchOnBoot: false,
      isDefaultPlayer: true,
      alwaysOnTop: false,
      themeMode: 'auto',
      floatingLyrics: false,
      accentColor: '#3b82f6',
      crossfadeSec: 3,
      autoNormalize: true
    };
  });

  const [lyricsCache, setLyricsCache] = useState<Record<string, string>>({});
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('melodix-settings-v2', JSON.stringify(settings));
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
  }, [settings]);

  // Close search on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isSearchOpen]);

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
    return [
      { id: 'recent', name: 'New Discovery', isSystem: true, songIds: [...filteredSongs].sort((a,b) => b.dateAdded - a.dateAdded).slice(0, 5).map(s => s.id), coverUrl: 'https://picsum.photos/seed/melodix-new/600/600' },
      { id: 'most-played', name: 'Hot Assets', isSystem: true, songIds: [...filteredSongs].sort((a,b) => b.playCount - a.playCount).slice(0, 8).map(s => s.id), coverUrl: 'https://picsum.photos/seed/melodix-hot/600/600' },
      { id: 'favorites', name: 'Core Collection', isSystem: true, songIds: filteredSongs.filter(s => s.isFavorite).map(s => s.id), coverUrl: 'https://picsum.photos/seed/melodix-love/600/600' }
    ];
  }, [songs, settings.minDurationSec]);

  useEffect(() => {
    if (currentSong) handleSyncMetadata(currentSong);
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
    if (isMiniMode) return (
      <div className="h-full flex flex-col items-center justify-center p-6 space-y-4 animate-in zoom-in-95 duration-300">
        <img src={currentSong?.coverUrl} className="w-40 h-40 rounded-3xl shadow-2xl border border-white/10" alt="" />
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold truncate max-w-[200px]">{currentSong?.title}</h3>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{currentSong?.artist}</p>
        </div>
        <button 
          onClick={() => setIsMiniMode(false)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white transition-all"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    );

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
               <div className="p-12 flex items-end gap-12 bg-gradient-to-b from-blue-600/10 to-transparent">
                <img src={playlist?.coverUrl} className="w-64 h-64 rounded-[2.5rem] shadow-2xl object-cover border border-white/5" alt="" />
                <div className="pb-4 space-y-2">
                  <h2 className="text-6xl font-black tracking-tighter text-white">{playlist?.name}</h2>
                  <div className="flex items-center gap-4 text-zinc-500 font-black uppercase text-[9px] tracking-[0.3em]">
                    <span>{playlist?.songIds.length} Assets</span>
                    <span>System Sync Active</span>
                  </div>
                  <button onClick={() => setSelectedPlaylistId(null)} className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">← Back</button>
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
              <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center font-black text-3xl text-white shadow-2xl">M</div>
              <h2 className="text-5xl font-black tracking-tighter text-white">Melodix v5.8</h2>
            </div>
            <p className="text-zinc-400 text-lg leading-relaxed font-semibold max-w-lg">
              Enterprise Audio Environment with Neural LRC Sync and Crossfade Engine. Built for High-Performance Local Asset Management.
            </p>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${settings.themeMode === 'light' ? 'bg-zinc-100 text-zinc-900' : 'bg-[#050505] text-white'} ${settings.alwaysOnTop ? 'relative z-[999]' : ''}`}>
      <TitleBar />
      {!isMiniMode && <Sidebar activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setSelectedPlaylistId(null); }} playlists={systemPlaylists} />}
      
      <main className={`flex-1 h-full overflow-y-auto bg-transparent relative custom-scrollbar ${isMiniMode ? 'pt-0' : 'pt-10'}`}>
        
        {/* Floating Controls Overlay */}
        {!isMiniMode && (
          <div className="fixed top-12 right-10 flex items-center gap-2 z-[300]">
             <button 
               onClick={() => setIsSearchOpen(!isSearchOpen)}
               className={`p-3 rounded-2xl transition-all border ${isSearchOpen ? 'bg-white text-black border-white' : 'bg-black/40 backdrop-blur-3xl text-zinc-400 border-white/5 hover:text-white hover:bg-white/5'}`}
             >
               <Search size={16} />
             </button>
             <button 
                onClick={() => setIsMiniMode(true)}
                className="p-3 rounded-2xl bg-black/40 backdrop-blur-3xl text-zinc-400 border border-white/5 hover:text-white hover:bg-white/5 transition-all"
                title="Enter Mini-Player"
              >
                <Minimize2 size={16} />
              </button>
             <button 
                onClick={() => setSettings({...settings, floatingLyrics: !settings.floatingLyrics})}
                className={`p-3 rounded-2xl transition-all border ${settings.floatingLyrics ? 'bg-[var(--accent-color)] text-white border-white/20' : 'bg-black/40 backdrop-blur-3xl text-zinc-400 border-white/5 hover:text-white hover:bg-white/5'}`}
              >
                <Layers size={16} />
              </button>
          </div>
        )}

        {/* Global Floating Search Panel */}
        {isSearchOpen && (
          <div ref={searchRef} className="fixed top-24 right-10 w-80 bg-zinc-900/90 backdrop-blur-[60px] border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-[400] animate-in slide-in-from-top-2 duration-300 overflow-hidden">
            <form onSubmit={handleSearchSubmit} className="p-5 border-b border-white/5">
              <input 
                autoFocus
                type="text" 
                placeholder="Find in Core..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </form>
            <div className="p-5 space-y-4">
               <div className="space-y-2">
                  <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2"><History size={10}/> Historical</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {searchHistory.map((h, i) => (
                      <button key={i} onClick={() => { setSearchQuery(h); handleSearchSubmit(); }} className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-bold text-zinc-400 hover:text-white transition-all">
                        {h}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Sparkles size={10} className="text-blue-500"/> Neural Discovery</h4>
                  {['Similar to ' + (currentSong?.artist || 'Library'), 'Lofi & Ambient Sync'].map((s, i) => (
                    <button key={i} className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-[10px] font-medium text-zinc-500 hover:text-blue-400 transition-all">
                      {s}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        )}

        {renderContent()}
      </main>
      
      {!isMiniMode && (
        <>
          <Equalizer settings={eqSettings} onChange={setEqSettings} isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />
          <Player 
            currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
            progress={progress} duration={currentSong?.duration || 0} onSeek={val => { if (audioRef.current) audioRef.current.currentTime = val; }}
            volume={volume} onVolumeChange={setVolume} onToggleEq={() => setIsEqOpen(!isEqOpen)} isEqOpen={isEqOpen}
          />
        </>
      )}

      {/* Persistent Lyric Layer */}
      {settings.floatingLyrics && currentSong && currentLyricLine && !isSearchOpen && !isMiniMode && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 z-[250] pointer-events-none text-center animate-in fade-in duration-1000">
           <p className="text-white font-black tracking-tighter leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            {currentLyricLine}
           </p>
        </div>
      )}
    </div>
  );
};

export default App;
