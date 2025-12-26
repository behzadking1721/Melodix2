
import { Song, QueueState } from "../types";

/**
 * Melodix Queue Manager - Stage 5
 * Handles the current play session, priority adding, and persistence.
 */
export class QueueManager {
  private state: QueueState = {
    items: [],
    currentIndex: -1,
    shuffled: false,
    repeatMode: 'all'
  };

  private listeners: ((state: QueueState) => void)[] = [];

  constructor() {
    const saved = localStorage.getItem('melodix-queue-v5');
    if (saved) {
      this.state = JSON.parse(saved);
    }
  }

  public subscribe(callback: (state: QueueState) => void) {
    this.listeners.push(callback);
    callback(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    localStorage.setItem('melodix-queue-v5', JSON.stringify(this.state));
    this.listeners.forEach(l => l({ ...this.state }));
  }

  public setQueue(songs: Song[], startIndex = 0) {
    this.state.items = [...songs];
    this.state.currentIndex = startIndex;
    this.notify();
  }

  public addNext(song: Song) {
    const newItems = [...this.state.items];
    newItems.splice(this.state.currentIndex + 1, 0, song);
    this.state.items = newItems;
    this.notify();
  }

  public addToEnd(song: Song) {
    this.state.items.push(song);
    this.notify();
  }

  public next(): Song | null {
    if (this.state.items.length === 0) return null;
    this.state.currentIndex = (this.state.currentIndex + 1) % this.state.items.length;
    this.notify();
    return this.state.items[this.state.currentIndex];
  }

  public prev(): Song | null {
    if (this.state.items.length === 0) return null;
    this.state.currentIndex = (this.state.currentIndex - 1 + this.state.items.length) % this.state.items.length;
    this.notify();
    return this.state.items[this.state.currentIndex];
  }

  public jumpTo(index: number) {
    if (index >= 0 && index < this.state.items.length) {
      this.state.currentIndex = index;
      this.notify();
    }
  }

  public reorder(newItems: Song[]) {
    this.state.items = newItems;
    this.notify();
  }

  public removeFromQueue(index: number) {
    this.state.items.splice(index, 1);
    if (this.state.currentIndex >= index) {
      this.state.currentIndex = Math.max(0, this.state.currentIndex - 1);
    }
    this.notify();
  }

  public getCurrentSong(): Song | null {
    return this.state.items[this.state.currentIndex] || null;
  }
}

export const queueManager = new QueueManager();
