
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layers, Search, History, Sparkles, X, ListMusic, Minimize2, Maximize2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import MiniPlayer from './components/MiniPlayer';
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
  
  // Queue Management
  const [queue, setQueue] = useState<Song[]>(MOCK_SONGS);
  const [queueIndex, setQueueIndex] = useState(0);
  const currentSong = useMemo(() => queue[queueIndex] || null, [queue, queueIndex]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [eqSettings, setEqSettings] = useState<EQSettings>({ bass: 0, mid: 0, treble: 0 });
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(['Lofi Beats', 'Gaming Mix']);
  const searchRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('melodix-settings-v5');
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
      autoNormalize: true,
      visualizationEnabled: true,
      miniMode: false
    };
  });

  const [lyricsCache, setLyricsCache] = useState<Record<string, string>>({});
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('melodix-settings-v5', JSON.stringify(settings));
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
  }, [settings]);

  // Audio Engine & Crossfade Logic
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const nextAudio = new Audio();
    nextAudio.volume = 0;
    nextAudioRef.current = nextAudio;

    const handleTimeUpdate = () => {
      if (!audioRef.current) return;
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setProgress(cur);

      // Crossfade Trigger
      if (settings.crossfadeSec > 0 && dur > settings.crossfadeSec && cur >= dur - settings.crossfadeSec) {
        handleNext();
      }
    };

    const handleEnded = () => {
      if (settings.crossfadeSec === 0) handleNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      const wasPlaying = isPlaying;
      audioRef.current.src = currentSong.url;
      if (wasPlaying) audioRef.current.play().catch(() => {});
    }
    if (currentSong) handleSyncMetadata(currentSong);
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

  const handleNext = () => {
    setQueueIndex((prev) => (prev + 1) % queue.length);
  };

  const handlePrev = () => {
    setQueueIndex((prev) => (prev - 1 + queue.length) % queue.length);
  };

  const handleSyncMetadata = async (song: Song) => {
    if (song.isSynced) return;
    setIsLyricsLoading(true);
    const suggestions = await suggestSongTags(song);
    const lyrics = await fetchLyrics(suggestions.title || song.title, suggestions.artist || song.artist, song.id);
    setLyricsCache(prev => ({ ...prev, [song.id]: lyrics }));
    handleUpdateSong({ ...song, ...suggestions, isSynced: true, hasLyrics: lyrics.length > 50 });
    setIsLyricsLoading(false);
  };

  const handleUpdateSong = (updatedSong: Song) => {
    setSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
    setQueue(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
  };

  const renderContent = () => {
    if (settings.miniMode) return (
      <MiniPlayer 
        currentSong={currentSong} 
        isPlaying={isPlaying} 
        onTogglePlay={() => setIsPlaying(!isPlaying)} 
        onNext={handleNext} 
        onPrev={handlePrev} 
        onRestore={() => setSettings({...settings, miniMode: false})} 
      />
    );

    switch (activeTab) {
      case NavigationTab.Home:
        return <HomeView currentSong={currentSong} lyrics={currentSong ? lyricsCache[currentSong.id] : ''} isLoadingLyrics={isLyricsLoading} currentTime={progress} />;
      case NavigationTab.AllSongs:
        return <LibraryView songs={songs} onSongSelect={(s) => { 
          setQueue([s]); setQueueIndex(0); setIsPlaying(true);
        }} currentSongId={currentSong?.id} onUpdateSong={handleUpdateSong} />;
      case NavigationTab.Playlists:
        return <LibraryView songs={songs} playlists={[]} onSongSelect={(s) => { setQueue([s]); setQueueIndex(0); }} isPlaylistView={true} onUpdateSong={handleUpdateSong} />;
      case NavigationTab.Settings:
        return <SettingsView settings={settings} onUpdate={setSettings} />;
      case NavigationTab.Queue:
        return (
          <div className="p-12 animate-in fade-in duration-500">
            <h2 className="text-4xl font-black mb-10 tracking-tighter">Up Next</h2>
            <div className="space-y-2">
              {queue.map((song, i) => (
                <div 
                  key={song.id + i} 
                  onClick={() => setQueueIndex(i)}
                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${i === queueIndex ? 'bg-blue-600/20 border border-blue-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <img src={song.coverUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  <div>
                    <h4 className={`font-bold text-sm ${i === queueIndex ? 'text-blue-400' : 'text-white'}`}>{song.title}</h4>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{song.artist}</p>
                  </div>
                  {i === queueIndex && <Sparkles size={14} className="ml-auto text-blue-500" />}
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${settings.themeMode === 'light' ? 'bg-zinc-100 text-zinc-900' : 'bg-[#080808] text-white'}`}>
      <TitleBar />
      {!settings.miniMode && <Sidebar activeTab={activeTab} onTabChange={setActiveTab} playlists={[]} />}
      
      <main className={`flex-1 h-full overflow-y-auto bg-transparent relative custom-scrollbar ${settings.miniMode ? 'pt-0' : 'pt-10'}`}>
        {!settings.miniMode && (
          <div className="fixed top-12 right-10 flex items-center gap-2 z-[300]">
             <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-3 rounded-2xl bg-black/40 backdrop-blur-3xl text-zinc-400 border border-white/5 hover:text-white transition-all"><Search size={16} /></button>
             <button onClick={() => setSettings({...settings, miniMode: true})} className="p-3 rounded-2xl bg-black/40 backdrop-blur-3xl text-zinc-400 border border-white/5 hover:text-white transition-all"><Minimize2 size={16} /></button>
             <button onClick={() => setActiveTab(NavigationTab.Queue)} className={`p-3 rounded-2xl transition-all border ${activeTab === NavigationTab.Queue ? 'bg-blue-600 text-white' : 'bg-black/40 backdrop-blur-3xl text-zinc-400 border-white/5'}`}><ListMusic size={16} /></button>
          </div>
        )}

        {renderContent()}
      </main>
      
      {!settings.miniMode && (
        <>
          <Equalizer settings={eqSettings} onChange={setEqSettings} isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />
          <Player 
            currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
            progress={progress} duration={currentSong?.duration || 0} onSeek={val => { if (audioRef.current) audioRef.current.currentTime = val; }}
            volume={volume} onVolumeChange={setVolume} onToggleEq={() => setIsEqOpen(!isEqOpen)} isEqOpen={isEqOpen}
            onNext={handleNext} onPrev={handlePrev} onToggleQueue={() => setActiveTab(NavigationTab.Queue)}
          />
        </>
      )}
    </div>
  );
};

export default App;
