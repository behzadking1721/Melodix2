
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ListMusic, Minimize2, Trash2, Shuffle, Download, Upload, CheckCircle2, AlertCircle, Settings, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import MiniPlayer from './components/MiniPlayer';
import LibraryView from './components/LibraryView';
import HomeView from './components/HomeView';
import PlaylistView from './components/PlaylistView';
import Equalizer from './components/Equalizer';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import SmartPlaylistCreator from './components/SmartPlaylistCreator';
import TitleBar from './components/TitleBar';
import { Song, NavigationTab, EQSettings, Playlist, AppSettings } from './types';
import { MOCK_SONGS } from './constants';
import { fetchLyrics, suggestSongTags } from './services/geminiService';
import { AudioEngine } from './services/audioEngine';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.Home);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('melodix-library-v10');
    return saved ? JSON.parse(saved) : MOCK_SONGS;
  });
  
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('melodix-playlists-v5');
    return saved ? JSON.parse(saved) : [
      { id: 'favs', name: 'My Favorites', songIds: songs.filter(s => s.isFavorite).map(s => s.id), isSystem: true }
    ];
  });

  const [recentSongs, setRecentSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('melodix-recent');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [queue, setQueue] = useState<Song[]>(() => {
    const saved = localStorage.getItem('melodix-queue-v3');
    return saved ? JSON.parse(saved) : MOCK_SONGS;
  });
  const [queueIndex, setQueueIndex] = useState(0);
  const currentSong = useMemo(() => queue[queueIndex] || null, [queue, queueIndex]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [eqSettings, setEqSettings] = useState<EQSettings>({ bass: 0, mid: 0, treble: 0 });
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [snackbar, setSnackbar] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('melodix-settings-v10');
    return saved ? JSON.parse(saved) : {
      minFileSizeMB: 2,
      minDurationSec: 30,
      launchOnBoot: false,
      isDefaultPlayer: true,
      alwaysOnTop: false,
      themeMode: 'dark',
      floatingLyrics: false,
      accentColor: '#3b82f6',
      crossfadeSec: 5,
      autoNormalize: true,
      visualizationEnabled: true,
      miniMode: false,
      gaplessPlayback: true,
      audioDevice: 'default'
    };
  });

  const [lyricsCache, setLyricsCache] = useState<Record<string, string>>({});
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  
  // Initialize AudioEngine Singleton
  const engine = useMemo(() => AudioEngine.getInstance(), []);

  useEffect(() => {
    localStorage.setItem('melodix-library-v10', JSON.stringify(songs));
    localStorage.setItem('melodix-recent', JSON.stringify(recentSongs));
    localStorage.setItem('melodix-queue-v3', JSON.stringify(queue));
    localStorage.setItem('melodix-playlists-v5', JSON.stringify(playlists));
    localStorage.setItem('melodix-settings-v10', JSON.stringify(settings));
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    
    engine.setCrossfade(settings.crossfadeSec);
  }, [songs, recentSongs, queue, settings, playlists]);

  useEffect(() => {
    engine.setEQ(eqSettings);
  }, [eqSettings, engine]);

  const showSnackbar = (msg: string, type: 'success' | 'error' = 'success') => {
    setSnackbar({ msg, type });
    setTimeout(() => setSnackbar(null), 3000);
  };

  const handleNext = () => setQueueIndex((prev) => (prev + 1) % queue.length);
  const handlePrev = () => setQueueIndex((prev) => (prev - 1 + queue.length) % queue.length);

  const handleSyncMetadata = async (song: Song) => {
    if (song.isSynced) return;
    setIsLyricsLoading(true);
    try {
      const suggestions = await suggestSongTags(song);
      const lyrics = await fetchLyrics(suggestions.title || song.title, suggestions.artist || song.artist, song.id);
      setLyricsCache(prev => ({ ...prev, [song.id]: lyrics }));
      handleUpdateSong({ ...song, ...suggestions, isSynced: true, hasLyrics: lyrics.length > 50 });
    } catch (e) {
      showSnackbar("AI Synchronization failed", "error");
    }
    setIsLyricsLoading(false);
  };

  const handleUpdateSong = (updatedSong: Song) => {
    setSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
    setQueue(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
  };

  const handleSongSelect = (song: Song) => {
    const idx = queue.findIndex(s => s.id === song.id);
    if (idx !== -1) {
      setQueueIndex(idx);
    } else {
      setQueue([song, ...queue]);
      setQueueIndex(0);
    }
    setIsPlaying(true);
    setIsSearchFocused(false);
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    const playlistSongs = playlist.songIds
      .map(id => songs.find(s => s.id === id))
      .filter((s): s is Song => !!s);
    
    if (playlistSongs.length > 0) {
      setQueue(playlistSongs);
      setQueueIndex(0);
      setIsPlaying(true);
    }
  };

  const handleCreatePlaylist = (newPlaylist: Playlist) => {
    setPlaylists([...playlists, newPlaylist]);
    setIsCreatorOpen(false);
    showSnackbar(`Playlist "${newPlaylist.name}" created!`);
  };

  // Integration with AudioEngine logic
  useEffect(() => {
    if (currentSong) {
      engine.play(currentSong, settings.crossfadeSec > 0);
      setRecentSongs(prev => [currentSong, ...prev.filter(s => s.id !== currentSong.id)].slice(0, 20));
      handleSyncMetadata(currentSong);
    }

    const activeEl = engine.getActiveElement();
    const onTimeUpdate = () => setProgress(activeEl.currentTime);
    const onEnded = () => {
      if (settings.gaplessPlayback) {
        handleNext();
      }
    };

    activeEl.addEventListener('timeupdate', onTimeUpdate);
    activeEl.addEventListener('ended', onEnded);
    
    return () => {
      activeEl.removeEventListener('timeupdate', onTimeUpdate);
      activeEl.removeEventListener('ended', onEnded);
    };
  }, [currentSong?.id]);

  useEffect(() => {
    isPlaying ? engine.resume() : engine.pause();
  }, [isPlaying]);

  useEffect(() => {
    engine.setVolume(volume);
  }, [volume]);

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${settings.themeMode === 'light' ? 'bg-zinc-100 text-zinc-900' : 'bg-[#050505] text-white'}`}>
      <TitleBar />
      {!settings.miniMode && (
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => { setActiveTab(tab); setSelectedPlaylistId(null); }} 
          playlists={playlists}
          activePlaylistId={selectedPlaylistId}
          onSelectPlaylist={(id) => { setActiveTab(NavigationTab.Playlists); setSelectedPlaylistId(id); }}
        />
      )}

      <motion.main layout className={`flex-1 h-full relative overflow-hidden ${settings.miniMode ? 'pt-0' : 'pt-10'}`}>
        {!settings.miniMode && (
          <div className="fixed top-12 right-10 flex items-center gap-2 z-[300]">
             <div className="relative group">
               <input 
                 type="text" value={searchQuery} 
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onFocus={() => setIsSearchFocused(true)}
                 onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                 placeholder="Search Intelligence..." className="bg-black/40 border border-white/5 rounded-xl py-2 px-4 text-xs font-bold focus:w-80 transition-all w-48 backdrop-blur-3xl outline-none h-10 pr-10"
               />
               <Search size={14} className="absolute right-3 top-3 text-zinc-500 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
             </div>

             <button 
              onClick={() => setActiveTab(NavigationTab.Settings)} 
              className={`p-3 rounded-xl border transition-all h-10 w-10 flex items-center justify-center backdrop-blur-3xl ${activeTab === NavigationTab.Settings ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}
             >
               <Settings size={16} />
             </button>
             <button onClick={() => setSettings({...settings, miniMode: true})} className="p-3 rounded-xl bg-black/40 border border-white/5 text-zinc-400 hover:text-white backdrop-blur-3xl hover:bg-white/10 transition-all h-10 w-10 flex items-center justify-center">
               <Minimize2 size={16} />
             </button>
          </div>
        )}

        {settings.miniMode ? (
          <MiniPlayer currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)} onNext={handleNext} onPrev={handlePrev} onRestore={() => setSettings({...settings, miniMode: false})} />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === NavigationTab.Home && (
              <HomeView 
                key="home" currentSong={currentSong} lyrics={currentSong ? lyricsCache[currentSong.id] : ''} 
                isLoadingLyrics={isLyricsLoading} currentTime={progress} onSongSelect={handleSongSelect}
                recentSongs={recentSongs} library={songs}
              />
            )}
            {activeTab === NavigationTab.AllSongs && <LibraryView key="lib" songs={songs} onSongSelect={handleSongSelect} currentSongId={currentSong?.id} onUpdateSong={handleUpdateSong} onAddToQueue={(s) => setQueue([...queue, s])} />}
            {activeTab === NavigationTab.Playlists && (
              <PlaylistView 
                playlists={playlists} songs={songs} recentSongs={recentSongs}
                selectedPlaylistId={selectedPlaylistId} onSelectPlaylist={setSelectedPlaylistId}
                onPlayPlaylist={handlePlayPlaylist} onDeletePlaylist={(id) => setPlaylists(p => p.filter(pl => pl.id !== id))}
                onCreatePlaylist={() => setIsCreatorOpen(true)} onSongSelect={handleSongSelect} currentSongId={currentSong?.id}
              />
            )}
            {activeTab === NavigationTab.Settings && <SettingsView settings={settings} onUpdate={setSettings} />}
            {activeTab === NavigationTab.About && <AboutView />}
            {activeTab === NavigationTab.Queue && (
               <div className="p-12 h-full overflow-y-auto custom-scrollbar">
                 <div className="flex justify-between items-center mb-10">
                   <div>
                     <h2 className="text-5xl font-black tracking-tighter text-white">Smart Queue</h2>
                     <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2">Active Asset Stream</p>
                   </div>
                 </div>
                 <Reorder.Group axis="y" values={queue} onReorder={setQueue} className="space-y-2 pb-40">
                    {queue.map((s, i) => (
                      <Reorder.Item 
                        key={s.id + i} value={s}
                        className={`group flex items-center gap-4 p-4 rounded-3xl cursor-grab border transition-all ${i === queueIndex ? 'bg-blue-600/20 border-blue-500/20' : 'bg-white/[0.02] border-white/5 hover:bg-white/5'}`}
                      >
                        <div className="w-10 text-[10px] font-black text-zinc-600">{i + 1}</div>
                        <img src={s.coverUrl} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-sm truncate ${i === queueIndex ? 'text-blue-400' : 'text-white'}`}>{s.title}</h4>
                          <p className="text-[10px] text-zinc-500 font-black uppercase truncate">{s.artist}</p>
                        </div>
                      </Reorder.Item>
                    ))}
                 </Reorder.Group>
               </div>
            )}
          </AnimatePresence>
        )}
      </motion.main>

      {!settings.miniMode && (
        <Player 
          currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
          progress={progress} duration={currentSong?.duration || 0} onSeek={val => engine.seek(val)} 
          volume={volume} onVolumeChange={(v) => setVolume(v)} 
          onToggleEq={() => setIsEqOpen(!isEqOpen)} isEqOpen={isEqOpen}
          onNext={handleNext} onPrev={handlePrev} onToggleQueue={() => setActiveTab(NavigationTab.Queue)}
        />
      )}
      
      <Equalizer settings={eqSettings} onChange={setEqSettings} isOpen={isEqOpen} onClose={() => setIsEqOpen(false)} />
      {isCreatorOpen && <SmartPlaylistCreator library={songs} onClose={() => setIsCreatorOpen(false)} onSave={handleCreatePlaylist} />}
      
      <AnimatePresence>
        {snackbar && (
          <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }} className={`fixed bottom-32 left-1/2 px-6 py-3 rounded-2xl font-bold shadow-2xl z-[1000] flex items-center gap-3 border ${snackbar.type === 'error' ? 'bg-red-600 border-red-500 text-white' : 'bg-blue-600 border-blue-500 text-white'}`}>
            {snackbar.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {snackbar.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
