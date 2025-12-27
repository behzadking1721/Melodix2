
import { MelodixExtension, ExtensionType } from "../types";
import { logger, LogLevel, LogCategory } from "./logger";

/**
 * Melodix Plugin & Extension Manager - Stage 17
 * Manages the lifecycle of application add-ons and providers.
 */
class ExtensionManager {
  private static instance: ExtensionManager;
  private extensions: MelodixExtension[] = [];
  private listeners: Set<(exts: MelodixExtension[]) => void> = new Set();

  private constructor() {
    this.loadExtensions();
  }

  public static getInstance(): ExtensionManager {
    if (!ExtensionManager.instance) {
      ExtensionManager.instance = new ExtensionManager();
    }
    return ExtensionManager.instance;
  }

  private loadExtensions() {
    const saved = localStorage.getItem('melodix-extensions-v1');
    if (saved) {
      this.extensions = JSON.parse(saved);
    } else {
      // Default Factory Extensions
      this.extensions = [
        {
          id: 'core-gemini-ai',
          name: 'Gemini Neural Core',
          version: '2.5.0',
          author: 'MelodixLabs',
          description: 'Official AI provider for lyrics, metadata correction, and smart playlists.',
          type: 'automation',
          status: 'enabled',
          permissions: ['network', 'metadata-access'],
          hasSettings: true
        },
        {
          id: 'lrc-local-provider',
          name: 'Local LRC Finder',
          version: '1.0.2',
          author: 'MelodixLabs',
          description: 'Searches for .lrc files in the same directory as your music.',
          type: 'lyrics-provider',
          status: 'enabled',
          permissions: ['filesystem'],
          hasSettings: false
        }
      ];
      this.saveExtensions();
    }
  }

  private saveExtensions() {
    localStorage.setItem('melodix-extensions-v1', JSON.stringify(this.extensions));
    this.notify();
  }

  // Fix: Ensure the returned cleanup function returns void to comply with React useEffect requirements.
  public subscribe(callback: (exts: MelodixExtension[]) => void) {
    this.listeners.add(callback);
    callback(this.extensions);
    return () => { this.listeners.delete(callback); };
  }

  private notify() {
    this.listeners.forEach(l => l([...this.extensions]));
  }

  public toggleExtension(id: string) {
    this.extensions = this.extensions.map(ext => 
      ext.id === id ? { ...ext, status: ext.status === 'enabled' ? 'disabled' : 'enabled' } : ext
    );
    logger.log(LogLevel.INFO, LogCategory.SYSTEM, `Extension ${id} status changed.`);
    this.saveExtensions();
  }

  public installExtension(ext: MelodixExtension) {
    if (this.extensions.find(e => e.id === ext.id)) return;
    this.extensions.push({ ...ext, status: 'enabled' });
    this.saveExtensions();
  }

  public uninstallExtension(id: string) {
    this.extensions = this.extensions.filter(ext => ext.id !== id);
    this.saveExtensions();
  }

  public getExtensionsByType(type: ExtensionType): MelodixExtension[] {
    return this.extensions.filter(e => e.type === type && e.status === 'enabled');
  }

  public getActiveProvider(type: ExtensionType): MelodixExtension | null {
    const providers = this.getExtensionsByType(type);
    return providers.length > 0 ? providers[0] : null;
  }
}

export const extensionManager = ExtensionManager.getInstance();