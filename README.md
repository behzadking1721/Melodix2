
# 🎵 Melodix Music Player v5.8 (Enterprise Edition)

**Melodix** is a high-performance, professional-grade music player designed for modern audiophiles. Built with a focus on **AI integration**, **ultra-smooth UI**, and **advanced audio DSP**, it offers a seamless experience for managing massive local libraries (up to 50k+ tracks).

---

## 🚀 Key Features

### 🎧 Pro Audio Engine (Stage 2, 3, 11)
- **Dual-Engine Crossfade**: 2-10s adjustable transition between tracks using parallel audio contexts.
- **Auto Gain Normalization**: Built-in ReplayGain simulation targeting -14 LUFS standard.
- **Gapless Playback**: Intelligent asset pre-loading to eliminate silence.
- **WASAPI/ASIO Ready**: Support for high-fidelity output devices.

### 🧠 Gemini AI Intelligence (Stage 7, 8)
- **Neural Metadata Fixer**: Automatically syncs Title, Artist, Album, and Cover Art using Google's Gemini Pro.
- **Synced LRC Stream**: Real-time AI-generated and synced lyrics with Musixmatch-style time-tags.
- **Smart Playlists**: Generate mood-based collections via natural language prompts.

### 🎨 Elite UI/UX (Stage 1, 9, 13)
- **Cinematic Mini Player**: Always-on-top floating mode with Framer Motion animations.
- **Mica Atmosphere**: Adaptive background blur and saturation based on current cover art.
- **Spectrum Visualization**: High-performance 60FPS FFT-based real-time frequency analyzer.
- **RTL Ready**: Full support for Persian/Arabic layout with Vazirmatn typography.

### 📦 System Management (Stage 5, 10, 12)
- **Smart Queue**: Persistent queue management with drag-and-drop and shuffle logic.
- **Disaster Recovery**: One-click JSON backup and restore for library metadata and settings.
- **IndexedDB Cache**: Optimized local storage (LiteDB simulation) for lightning-fast search on 50k tracks.

---

## 🛠 Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **AI Core**: Google Gemini API (@google/genai)
- **Storage**: IndexedDB (Neural Cache) & LocalStorage (State)
- **Audio Control**: Web Audio API (Dual-Channel Simulation)

---

## 📂 Project Structure
- `/components`: Modular UI parts (Player, Equalizer, Library, etc.)
- `/services`: Core logic (AI interface, Database services, Queue manager)
- `/types`: Strict TypeScript definitions for system state
- `/constants`: Simulation data and default configurations

---

## 📝 Performance Notes
- **List Virtualization**: Only active items in view are rendered, ensuring 60FPS even with 50,000 songs.
- **Canvas Rendering**: Visualizers are rendered on a dedicated frame loop to prevent main-thread blocking.

---

*Designed & Engineered by MelodixLabs*
