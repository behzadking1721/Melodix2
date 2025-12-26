
/**
 * Melodix Pro Audio Engine - Stage 10 (Hardware Sync)
 * Integrated device switching (setSinkId) and WASAPI mode simulation.
 */

import { EQSettings, Song, AudioOutputMode } from "../types";
import { logger, LogLevel, LogCategory } from "./logger";
import { errorService, ErrorSeverity } from "./errorService";

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
  private currentDeviceId: string = 'default';
  private currentMode: AudioOutputMode = AudioOutputMode.Shared;

  private constructor() {
    this.initContext();
  }

  private initContext() {
    // In Native apps, we would use new AudioContext({ latencyHint: 'interactive' }) for Shared
    // and specific sample rates for Exclusive.
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)({
      latencyHint: 'interactive',
    });
    
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 256; 
    this.analyser.smoothingTimeConstant = 0.85;

    this.limiter = this.context.createDynamicsCompressor();
    this.limiter.threshold.setValueAtTime(-1, this.context.currentTime);
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
    
    lastNode.connect(this.analyser);
    this.analyser.connect(this.limiter);
    this.limiter.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);

    this.channels = [];
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
   * Switches the physical output device seamlessly.
   * Simulation of WASAPI Device Initialization.
   */
  public async setOutputDevice(deviceId: string, mode: AudioOutputMode = AudioOutputMode.Shared) {
    try {
      this.currentDeviceId = deviceId;
      this.currentMode = mode;

      logger.log(LogLevel.INFO, LogCategory.AUDIO, `Switching to device: ${deviceId} (Mode: ${mode})`);

      // 1. Update elements sinkId (Browser-specific hardware routing)
      for (const channel of this.channels) {
        if ((channel.element as any).setSinkId) {
          try {
            await (channel.element as any).setSinkId(deviceId);
          } catch (err: any) {
            if (err.name === 'SecurityError') {
              throw new Error("دسترسی به دستگاه خروجی توسط سیستم امنیتی مسدود شده است.");
            }
            throw err;
          }
        }
      }

      // 2. Handle WASAPI Exclusive Simulation
      // In a native bridge, we would re-open the stream with a specific buffer size.
      // Here, we log the intent and ensure the context is active.
      if (mode === AudioOutputMode.Exclusive) {
        logger.log(LogLevel.WARN, LogCategory.AUDIO, "Exclusive Mode requested: Attempting low-latency synchronization.");
        // In actual WASAPI Exclusive, we would lock the sample rate.
      }

      return true;
    } catch (e) {
      errorService.handleError(e, "Output Device Switch", LogCategory.AUDIO, ErrorSeverity.MEDIUM);
      // Fallback to default
      if (deviceId !== 'default') await this.setOutputDevice('default', AudioOutputMode.Shared);
      return false;
    }
  }

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
      return Array.from({ length: bars }, () => 0.1 + Math.random() * 0.4);
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
