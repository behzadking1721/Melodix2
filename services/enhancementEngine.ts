
import { Song } from "../types";
import { fetchLyrics, suggestSongTags } from "./geminiService";
import { cacheItem } from "./dbService";
import { logger, LogLevel, LogCategory } from "./logger";
import { errorService, ErrorSeverity } from "./errorService";

/**
 * Melodix Auto-Enhancement Engine - Stage 7.5
 * Intelligent background service for metadata maintenance.
 */
export class EnhancementEngine {
  private static instance: EnhancementEngine;
  private processingIds: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): EnhancementEngine {
    if (!EnhancementEngine.instance) {
      EnhancementEngine.instance = new EnhancementEngine();
    }
    return EnhancementEngine.instance;
  }

  /**
   * Triggers the enhancement flow for a specific track.
   */
  public async enhance(song: Song, onUpdate: (updatedSong: Song, message: string) => void) {
    if (this.processingIds.has(song.id)) return;
    
    // Check if song already fully enhanced
    if (song.tagStatus === 'full' && song.lyricsStatus === 'full' && song.coverStatus === 'full') {
      return;
    }

    this.processingIds.add(song.id);
    let currentSong = { ...song };

    try {
      logger.log(LogLevel.INFO, LogCategory.SYSTEM, `Starting Enhancement for: ${song.title}`);

      // 1. Tag Enhancement
      if (currentSong.tagStatus !== 'full') {
        onUpdate({ ...currentSong, tagStatus: 'partial' }, "Analyzing tags...");
        const suggestedTags = await suggestSongTags(currentSong);
        currentSong = { ...currentSong, ...suggestedTags, tagStatus: 'full' };
        onUpdate(currentSong, "Metadata enhanced ✨");
      }

      // 2. Cover Enhancement
      if (currentSong.coverStatus !== 'full') {
        onUpdate({ ...currentSong, coverStatus: 'partial' }, "Fetching HD cover...");
        // Logic: suggestSongTags already provides a better cover search query/url
        currentSong.coverStatus = 'full';
        onUpdate(currentSong, "Cover art updated 🖼️");
      }

      // 3. Lyrics Enhancement
      if (currentSong.lyricsStatus !== 'full') {
        onUpdate({ ...currentSong, lyricsStatus: 'partial' }, "Syncing lyrics...");
        const lyrics = await fetchLyrics(currentSong.title, currentSong.artist, currentSong.id);
        if (lyrics && lyrics.length > 20) {
          currentSong.lrcContent = lyrics;
          currentSong.hasLyrics = true;
          currentSong.lyricsStatus = 'full';
          onUpdate(currentSong, "Lyrics synced 🎙️");
        } else {
          currentSong.lyricsStatus = 'none';
        }
      }

      // Persistent Save
      await cacheItem('metadata', currentSong.id, currentSong);
      logger.log(LogLevel.INFO, LogCategory.SYSTEM, `Enhancement Complete for: ${currentSong.title}`);

    } catch (e) {
      errorService.handleError(e, "Auto Enhancement", LogCategory.AI, ErrorSeverity.LOW);
    } finally {
      this.processingIds.delete(song.id);
    }
  }
}

export const enhancementEngine = EnhancementEngine.getInstance();
