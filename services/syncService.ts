
import { CloudDevice, SyncEvent, SyncConflict } from "../types";
import { logger, LogLevel, LogCategory } from "./logger";

/**
 * Melodix Multi-Device Sync Engine - Stage 20
 * Handles cloud persistence, delta synchronization, and device orchestration.
 */
class SyncService {
  private static instance: SyncService;
  private devices: CloudDevice[] = [];
  private history: SyncEvent[] = [];
  private conflicts: SyncConflict[] = [];
  private listeners: Set<() => void> = new Set();
  private isSyncing = false;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private loadFromStorage() {
    const savedDevices = localStorage.getItem('melodix-sync-devices');
    const savedHistory = localStorage.getItem('melodix-sync-history');
    
    if (savedDevices) {
      this.devices = JSON.parse(savedDevices);
    } else {
      this.devices = [
        { id: 'dev-1', name: 'XPS Studio', type: 'desktop', lastSync: Date.now() - 500000, status: 'online', os: 'Windows 11' },
        { id: 'dev-2', name: 'Galaxy S24 Ultra', type: 'mobile', lastSync: Date.now() - 3600000, status: 'offline', os: 'Android 14' }
      ];
    }

    if (savedHistory) {
      this.history = JSON.parse(savedHistory);
    } else {
      this.history = [
        { id: 'e1', timestamp: Date.now() - 100000, type: 'upload', dataType: 'Playlists', status: 'success', itemCount: 12 },
        { id: 'e2', timestamp: Date.now() - 600000, type: 'download', dataType: 'Settings', status: 'success', itemCount: 1 }
      ];
    }
  }

  private save() {
    localStorage.setItem('melodix-sync-devices', JSON.stringify(this.devices));
    localStorage.setItem('melodix-sync-history', JSON.stringify(this.history));
    this.listeners.forEach(l => l());
  }

  public subscribe(l: () => void) {
    this.listeners.add(l);
    return () => { this.listeners.delete(l); };
  }

  public getDevices() { return this.devices; }
  public getHistory() { return this.history; }
  public getConflicts() { return this.conflicts; }
  public getIsSyncing() { return this.isSyncing; }

  public async triggerSync() {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    logger.log(LogLevel.INFO, LogCategory.DB, "Initiating Neural Cloud Sync...");
    this.save();

    // Simulation of network delay and delta comparison
    setTimeout(() => {
      const newEvent: SyncEvent = {
        id: Math.random().toString(36).substr(2, 5),
        timestamp: Date.now(),
        type: 'merge',
        dataType: 'Full Profile',
        status: 'success',
        itemCount: Math.floor(Math.random() * 50) + 1
      };
      
      this.history = [newEvent, ...this.history].slice(0, 20);
      this.isSyncing = false;
      this.devices = this.devices.map(d => d.id === 'dev-1' ? { ...d, lastSync: Date.now() } : d);
      
      logger.log(LogLevel.INFO, LogCategory.DB, `Cloud Sync Completed: ${newEvent.itemCount} items merged.`);
      this.save();
    }, 2500);
  }

  public unlinkDevice(id: string) {
    this.devices = this.devices.filter(d => d.id !== id);
    this.save();
  }

  public renameDevice(id: string, newName: string) {
    this.devices = this.devices.map(d => d.id === id ? { ...d, name: newName } : d);
    this.save();
  }
}

export const syncService = SyncService.getInstance();
