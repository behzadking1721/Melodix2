
import { Song, DownloadTask, TaskStatus } from "../types";
import { fetchLyrics, suggestSongTags } from "./geminiService";
import { cacheItem } from "./dbService";
import { logger, LogLevel, LogCategory } from "./logger";
import { errorService, ErrorSeverity } from "./errorService";

type TaskListener = (tasks: DownloadTask[]) => void;

/**
 * Melodix Auto-Enhancement Engine - Stage 13 (Integrated Task Queue)
 */
export class EnhancementEngine {
  private static instance: EnhancementEngine;
  private tasks: DownloadTask[] = [];
  private listeners: TaskListener[] = [];
  private readonly MAX_CONCURRENT = 3;
  private isProcessing = false;

  private constructor() {
    // Load persisted tasks if any
    const saved = localStorage.getItem('melodix-tasks-v1');
    if (saved) {
      this.tasks = JSON.parse(saved).map((t: any) => ({
        ...t,
        status: t.status === 'processing' ? 'pending' : t.status // Reset processing on restart
      }));
    }
  }

  public static getInstance(): EnhancementEngine {
    if (!EnhancementEngine.instance) {
      EnhancementEngine.instance = new EnhancementEngine();
    }
    return EnhancementEngine.instance;
  }

  public subscribe(callback: TaskListener) {
    this.listeners.push(callback);
    callback(this.tasks);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    localStorage.setItem('melodix-tasks-v1', JSON.stringify(this.tasks));
    this.listeners.forEach(l => l([...this.tasks]));
  }

  /**
   * Main Entry Point for App components to request enhancement
   */
  public async enqueue(song: Song) {
    // Check if task already exists
    if (this.tasks.some(t => t.songId === song.id && (t.status === 'pending' || t.status === 'processing'))) {
      return;
    }

    const newTask: DownloadTask = {
      id: Math.random().toString(36).substr(2, 9),
      songId: song.id,
      songTitle: song.title,
      artist: song.artist,
      coverUrl: song.coverUrl,
      type: 'full-enhancement',
      status: 'pending',
      progress: 0,
      retryCount: 0,
      timestamp: Date.now()
    };

    this.tasks = [newTask, ...this.tasks];
    this.notify();
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing) return;
    
    const activeTasks = this.tasks.filter(t => t.status === 'processing');
    if (activeTasks.length >= this.MAX_CONCURRENT) return;

    const nextTask = this.tasks.find(t => t.status === 'pending');
    if (!nextTask) return;

    this.runTask(nextTask);
    this.processQueue(); // Check for more slots
  }

  private async runTask(task: DownloadTask) {
    this.updateTask(task.id, { status: 'processing', progress: 5 });
    
    try {
      // 1. Tags (25%)
      this.updateTask(task.id, { progress: 10 });
      const suggestedTags = await suggestSongTags({ title: task.songTitle, artist: task.artist } as Song);
      this.updateTask(task.id, { progress: 30 });

      // 2. Lyrics (60%)
      const lyrics = await fetchLyrics(task.songTitle, task.artist, task.songId);
      this.updateTask(task.id, { progress: 70 });

      // 3. Finalize (100%)
      const updatedSong: Partial<Song> = {
        ...suggestedTags,
        lrcContent: lyrics,
        hasLyrics: lyrics.length > 20,
        tagStatus: 'full',
        lyricsStatus: lyrics.length > 20 ? 'full' : 'none',
        coverStatus: 'full',
        lastUpdated: Date.now()
      };

      // Simulating some I/O delay
      await new Promise(r => setTimeout(r, 800));

      this.updateTask(task.id, { status: 'completed', progress: 100 });
      logger.log(LogLevel.INFO, LogCategory.AI, `Task Completed: ${task.songTitle}`);
      
      // Update DB and global state via a broadcast or callback if needed
      // For Stage 13, we assume App.tsx watches tasks and updates songs list
    } catch (e: any) {
      if (task.retryCount < 2) {
        this.updateTask(task.id, { status: 'pending', retryCount: task.retryCount + 1, progress: 0 });
      } else {
        this.updateTask(task.id, { status: 'failed', error: e.message || 'Network Timeout' });
      }
    } finally {
      this.processQueue();
    }
  }

  private updateTask(id: string, updates: Partial<DownloadTask>) {
    this.tasks = this.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    this.notify();
  }

  // --- Queue Controls ---
  public pauseAll() {
    this.tasks = this.tasks.map(t => t.status === 'pending' || t.status === 'processing' ? { ...t, status: 'paused' as TaskStatus } : t);
    this.notify();
  }

  public resumeAll() {
    this.tasks = this.tasks.map(t => t.status === 'paused' ? { ...t, status: 'pending' as TaskStatus } : t);
    this.notify();
    this.processQueue();
  }

  public clearCompleted() {
    this.tasks = this.tasks.filter(t => t.status !== 'completed');
    this.notify();
  }

  public clearFailed() {
    this.tasks = this.tasks.filter(t => t.status !== 'failed');
    this.notify();
  }

  public retryTask(id: string) {
    this.updateTask(id, { status: 'pending', retryCount: 0, progress: 0 });
    this.processQueue();
  }

  public removeTask(id: string) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.notify();
    this.processQueue();
  }
}

export const enhancementEngine = EnhancementEngine.getInstance();
