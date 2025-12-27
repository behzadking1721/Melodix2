
/**
 * Melodix LRC Engine - Stage 22 (Advanced)
 * Handles parsing, timing, and generation of synchronized lyrics.
 */

export interface LrcLine {
  time: number; // in seconds
  text: string;
}

export const LrcParser = {
  /**
   * Parses a raw string (LRC format) into a structured array of timed lines.
   */
  parse: (raw: string): LrcLine[] => {
    if (!raw) return [];

    const lines = raw.split('\n');
    const result: LrcLine[] = [];
    const timeRegex = /\[(\d+):(\d+(?:\.\d+)?)\]/g;

    lines.forEach(line => {
      let match;
      const text = line.replace(timeRegex, '').trim();
      timeRegex.lastIndex = 0;
      
      while ((match = timeRegex.exec(line)) !== null) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseFloat(match[2]);
        const time = minutes * 60 + seconds;
        
        if (text || line.includes(']')) { // Keep empty lines if they have timestamps
          result.push({ time, text });
        }
      }
    });

    return result.sort((a, b) => a.time - b.time);
  },

  /**
   * Converts a structured array back into a standard LRC string.
   */
  stringify: (lines: LrcLine[]): string => {
    return lines
      .map(line => {
        const mins = Math.floor(line.time / 60).toString().padStart(2, '0');
        const secs = (line.time % 60).toFixed(2).padStart(5, '0');
        return `[${mins}:${secs}]${line.text}`;
      })
      .join('\n');
  },

  /**
   * Formats seconds into mm:ss.xx
   */
  formatTimestamp: (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toFixed(2).padStart(5, '0');
    return `${mins}:${secs}`;
  },

  /**
   * Determines if a string contains valid LRC tags.
   */
  isLrc: (content: string): boolean => {
    return /\[\d+:\d+(?:\.\d+)?\]/.test(content);
  }
};
