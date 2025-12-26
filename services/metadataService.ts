
import { Song } from "../types";
import { suggestSongTags } from "./geminiService";

/**
 * MetadataFetcher - Stage 2
 * Inspired by MusicBrainz Picard logic.
 * Orchestrates metadata lookup and validation.
 */
export const MetadataFetcher = {
  /**
   * Fetches advanced metadata and provides a confidence-based suggestion.
   */
  fetchAdvancedMetadata: async (song: Song): Promise<Partial<Song>> => {
    try {
      // In a real environment, we might first check MusicBrainz API by hash.
      // Here we use Gemini to perform "Semantic Identification".
      const suggestion = await suggestSongTags(song);
      
      return {
        ...suggestion,
        // Ensure numeric fields are correctly typed (TagLib# requirement simulation)
        year: Number(suggestion.year) || song.year,
        trackNumber: (suggestion as any).trackNumber || 1,
        replayGain: (suggestion as any).replayGain || -8.5 // Default normalization
      };
    } catch (error) {
      console.error("MetadataFetcher Error:", error);
      throw new Error("Could not reach metadata masters.");
    }
  },

  /**
   * Simulates TagLib# file writing
   */
  writeToFile: async (song: Song): Promise<boolean> => {
    // In Electron: bridge.invoke('write-tags', song)
    console.log(`[TagLib# Sim] Writing tags to ${song.url}`);
    await new Promise(resolve => setTimeout(resolve, 1200));
    return true;
  }
};
