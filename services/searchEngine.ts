
import { Song } from "../types";

export interface SearchResultGroup {
  topResult: Song | null;
  similarTracks: Song[];
  fromSameArtist: Song[];
  fromSameGenre: Song[];
  recentlyAdded: Song[];
}

export class SearchEngine {
  /**
   * Normalizes strings for consistent matching
   */
  private static normalize(str: string): string {
    return str.toLowerCase().trim().replace(/[^\w\s]/gi, '');
  }

  /**
   * Offline Search Algorithm with Weighted Ranking
   */
  public static search(songs: Song[], query: string): SearchResultGroup {
    if (!query.trim()) return this.getEmptyState(songs);

    const q = this.normalize(query);
    
    // 1. Scoring & Filtering
    const scoredMatches = songs.map(song => {
      let score = 0;
      const title = this.normalize(song.title);
      const artist = this.normalize(song.artist);
      const album = this.normalize(song.album);
      const genre = this.normalize(song.genre);

      // Title weight (highest)
      if (title === q) score += 100;
      else if (title.startsWith(q)) score += 80;
      else if (title.includes(q)) score += 60;

      // Artist weight
      if (artist === q) score += 70;
      else if (artist.includes(q)) score += 40;

      // Album & Genre weight
      if (album.includes(q)) score += 30;
      if (genre.includes(q)) score += 20;

      return { song, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

    const matches = scoredMatches.map(m => m.song);
    const topResult = matches[0] || null;

    // 2. Grouping Results
    return {
      topResult,
      similarTracks: matches.slice(1, 6),
      fromSameArtist: topResult ? matches.filter(s => s.artist === topResult.artist && s.id !== topResult.id).slice(0, 5) : [],
      fromSameGenre: topResult ? matches.filter(s => s.genre === topResult.genre && s.id !== topResult.id).slice(0, 5) : [],
      recentlyAdded: [...songs].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 5)
    };
  }

  /**
   * Offline Recommendation Engine Heuristics
   */
  public static recommend(songs: Song[], currentSong: Song | null): SearchResultGroup {
    if (!currentSong) return this.getEmptyState(songs);

    // Scoring based on the current song's metadata
    const scoredRecommendations = songs
      .filter(s => s.id !== currentSong.id)
      .map(song => {
        let score = 0;
        
        // Same Album (100)
        if (song.album === currentSong.album) score += 100;
        
        // Same Artist (80)
        if (song.artist === currentSong.artist) score += 80;
        
        // Same Genre (60)
        if (song.genre === currentSong.genre) score += 60;
        
        // Similar Year (40) - +/- 2 years
        if (Math.abs(song.year - currentSong.year) <= 2) score += 40;

        return { song, score };
      })
      .sort((a, b) => b.score - a.score);

    const recommended = scoredRecommendations.map(r => r.song);

    return {
      topResult: null,
      similarTracks: recommended.slice(0, 10),
      fromSameArtist: recommended.filter(s => s.artist === currentSong.artist).slice(0, 5),
      fromSameGenre: recommended.filter(s => s.genre === currentSong.genre).slice(0, 5),
      recentlyAdded: [...songs].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 5)
    };
  }

  private static getEmptyState(songs: Song[]): SearchResultGroup {
    return {
      topResult: null,
      similarTracks: [],
      fromSameArtist: [],
      fromSameGenre: [],
      recentlyAdded: [...songs].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 10)
    };
  }
}
