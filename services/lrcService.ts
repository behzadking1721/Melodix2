
/**
 * Melodix LRC Engine - Stage 3
 * Handles parsing and timing of synchronized lyrics.
 */

export interface LrcLine {
  time: number; // in seconds
  text: string;
}

export const LrcParser = {
  /**
   * Parses a raw string (LRC format) into a structured array of timed lines.
   * Supports [mm:ss], [mm:ss.xx], and [mm:ss:xx] formats.
   */
  parse: (raw: string): LrcLine[] => {
    if (!raw) return [];

    const lines = raw.split('\n');
    const result: LrcLine[] = [];
    const timeRegex = /\[(\d+):(\d+(?:\.\d+)?)\]/g;

    lines.forEach(line => {
      let match;
      // An LRC line can have multiple timestamps for the same text
      const text = line.replace(timeRegex, '').trim();
      
      // Reset regex index for multiple matches in the same line
      timeRegex.lastIndex = 0;
      
      while ((match = timeRegex.exec(line)) !== null) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseFloat(match[2]);
        const time = minutes * 60 + seconds;
        
        if (text) {
          result.push({ time, text });
        }
      }
    });

    // Sort by time as LRC files sometimes have out-of-order tags
    return result.sort((a, b) => a.time - b.time);
  },

  /**
   * Determines if a string contains valid LRC tags.
   */
  isLrc: (content: string): boolean => {
    return /\[\d+:\d+(?:\.\d+)?\]/.test(content);
  }
};
