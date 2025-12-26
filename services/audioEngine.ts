
/**
 * Melodix Pro Audio Engine - Stage 4
 * Integrated FFT Analysis and Waveform Generation logic.
 */

import { EQSettings, Song } from "../types";

export class AudioEngine {
  private static instance: AudioEngine;
  private context: AudioContext;
  private masterGain: GainNode;
  private limiter: DynamicsCompressorNode;
  private analyser: AnalyserNode;
  private eqNodes: BiquadFilterNode[] = [];
  
  private channels: {
    element: HTMLAudioElement;
    source: MediaElementAudioSourceNode;
    gain: GainNode;
  }[] = [];

  private activeChannelIndex = 0;
  private crossfadeDuration = 3; 
  private waveformCache: Map<string, number[]> = new Map();

  private constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Analyser Node for Spectrum Visualization
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 256; // High precision for spectrum bars
    this.analyser.smoothingTimeConstant = 0.8;

    this.limiter = this.context.createDynamicsCompressor();
    this.limiter.threshold.setValueAtTime(-1, this.context.currentTime);
    this.limiter.knee.setValueAtTime(40, this.context.currentTime);
    this.limiter.ratio.setValueAtTime(12, this.context.currentTime);
    this.limiter.attack.setValueAtTime(0, this.context.currentTime);
    this.limiter.release.setValueAtTime(0.25, this.context.currentTime);

    this.masterGain = this.context.createGain();
    
    const freqs = [100, 1000, 10000];
    const types: BiquadFilterType[] = ['lowshelf', 'peaking', 'highshelf'];
    
    this.eqNodes = freqs.map((f, i) => {
      const node = this.context.createBiquadFilter();
      node.type = types[i];
      node.frequency.value = f;
      node.gain.value = 0;
      return node;
    });

    let lastNode: AudioNode = this.eqNodes[0];
    for (let i = 1; i < this.eqNodes.length; i++) {
      lastNode.connect(this.eqNodes[i]);
      lastNode = this.eqNodes[i];
    }
    lastNode.connect(this.analyser); // Connect analyser before limiter/master
    this.analyser.connect(this.limiter);
    this.limiter.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);

    for (let i = 0; i < 2; i++) {
      const el = new Audio();
      el.crossOrigin = "anonymous";
      const source = this.context.createMediaElementSource(el);
      const gain = this.context.createGain();
      
      source.connect(gain);
      gain.connect(this.eqNodes[0]);
      
      this.channels.push({ element: el, source, gain });
    }
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Generates or retrieves waveform peaks for a specific song URL.
   * Decodes audio buffer to extract magnitude data.
   */
  public async getWaveformData(url: string, bars: number = 100): Promise<number[]> {
    if (this.waveformCache.has(url)) return this.waveformCache.get(url)!;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      
      const channelData = audioBuffer.getChannelData(0);
      const samplesPerBar = Math.floor(channelData.length / bars);
      const peaks: number[] = [];

      for (let i = 0; i < bars; i++) {
        let max = 0;
        for (let j = 0; j < samplesPerBar; j++) {
          const val = Math.abs(channelData[i * samplesPerBar + j]);
          if (val > max) max = val;
        }
        peaks.push(max);
      }

      this.waveformCache.set(url, peaks);
      return peaks;
    } catch (e) {
      console.warn("Waveform extraction failed, using fallback simulation", e);
      return Array.from({ length: bars }, () => Math.random() * 0.8 + 0.1);
    }
  }

  public getFrequencyData(): Uint8Array {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public async play(song: Song, crossfade: boolean = true) {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    const nextIndex = (this.activeChannelIndex + 1) % 2;
    const current = this.channels[this.activeChannelIndex];
    const next = this.channels[nextIndex];

    next.element.src = song.url;
    next.gain.gain.setValueAtTime(0, this.context.currentTime);
    
    const volumeLevel = song.replayGain ? Math.pow(10, song.replayGain / 20) : 1.0;
    
    if (crossfade && current.element.src) {
      const now = this.context.currentTime;
      current.gain.gain.linearRampToValueAtTime(0, now + this.crossfadeDuration);
      next.gain.gain.linearRampToValueAtTime(volumeLevel, now + this.crossfadeDuration);
      
      next.element.play();
      setTimeout(() => {
        current.element.pause();
        current.element.src = "";
      }, this.crossfadeDuration * 1000);
    } else {
      next.gain.gain.setValueAtTime(volumeLevel, this.context.currentTime);
      next.element.play();
      current.element.pause();
    }

    this.activeChannelIndex = nextIndex;
  }

  public setEQ(settings: EQSettings) {
    this.eqNodes[0].gain.setTargetAtTime(settings.bass, this.context.currentTime, 0.1);
    this.eqNodes[1].gain.setTargetAtTime(settings.mid, this.context.currentTime, 0.1);
    this.eqNodes[2].gain.setTargetAtTime(settings.treble, this.context.currentTime, 0.1);
  }

  public setVolume(val: number) {
    this.masterGain.gain.setTargetAtTime(val, this.context.currentTime, 0.1);
  }

  public setCrossfade(seconds: number) {
    this.crossfadeDuration = seconds;
  }

  public getActiveElement(): HTMLAudioElement {
    return this.channels[this.activeChannelIndex].element;
  }

  public pause() {
    this.channels[this.activeChannelIndex].element.pause();
  }

  public resume() {
    this.channels[this.activeChannelIndex].element.play();
  }

  public seek(seconds: number) {
    this.channels[this.activeChannelIndex].element.currentTime = seconds;
  }
}
