import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchLyrics = async (title: string, artist: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find the complete and accurate lyrics for the song "${title}" by "${artist}". 
      Format with clear line breaks and include approximate [mm:ss] time tags for each line like Musixmatch (LRC format). 
      Return ONLY the lyrics text.`,
      config: { temperature: 0.3 },
    });
    return response.text || "Lyrics not found.";
  } catch (error) {
    console.error("Gemini Lyrics Error:", error);
    return "Error connecting to AI Lyrics database.";
  }
};

export const suggestSongTags = async (song: Partial<Song>): Promise<Partial<Song>> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this local file metadata: Title: "${song.title}", Artist: "${song.artist}". 
      Provide the correct Title, Artist, Album, Genre, Year, and a search query for the high-quality official cover art URL.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            album: { type: Type.STRING },
            genre: { type: Type.STRING },
            year: { type: Type.NUMBER },
            coverSearchQuery: { type: Type.STRING }
          },
          required: ["title", "artist", "album", "genre", "year", "coverSearchQuery"]
        }
      }
    });
    const data = JSON.parse(response.text || "{}");
    data.coverUrl = `https://picsum.photos/seed/${encodeURIComponent(data.coverSearchQuery)}/800/800`;
    return data;
  } catch (error) {
    console.error("Gemini Tag Fixer Error:", error);
    return song;
  }
};

// Added generateSmartPlaylist for AI-powered song selection from library
export const generateSmartPlaylist = async (library: Song[], prompt: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this music library: ${JSON.stringify(library.map(s => ({ id: s.id, title: s.title, artist: s.artist, genre: s.genre })))}
      Select a subset of songs that fit the following vibe/request: "${prompt}".
      Return ONLY the list of IDs in a JSON array format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Smart Playlist Error:", error);
    return [];
  }
};

// Added generatePlaylistCover for AI image generation using gemini-2.5-flash-image
export const generatePlaylistCover = async (prompt: string, mood: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A professional, high-quality artistic cover art for a music playlist titled "${prompt}" with a "${mood}" mood. Modern aesthetic.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    // Fallback if no image generated
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/800`;
  } catch (error) {
    console.error("Gemini Cover Generation Error:", error);
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/800`;
  }
};
