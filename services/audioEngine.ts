
/**
 * Melodix Pro Audio Engine
 * Inspired by NAudio/CSCore architectures.
 * Modular DSP Pipeline for high-fidelity audio playback.
 */

import { EQSettings, Song } from "../types";

export class AudioEngine {
  private static instance: AudioEngine;
  private context: AudioContext;
  private masterGain: GainNode;
  private limiter: DynamicsCompressorNode;
  private eqNodes: BiquadFilterNode[] = [];
  
  // Dual Channel System for Crossfading
  private channels: {
    element: HTMLAudioElement;
    source: MediaElementAudioSourceNode;
    gain: GainNode;
  }[] = [];

  private activeChannelIndex = 0;
  private crossfadeDuration = 3; // seconds
  private useReplayGain = true;

  private constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Master Limiter (prevents clipping)
    this.limiter = this.context.createDynamicsCompressor();
    this.limiter.threshold.setValueAtTime(-1, this.context.currentTime);
    this.limiter.knee.setValueAtTime(40, this.context.currentTime);
    this.limiter.ratio.setValueAtTime(12, this.context.currentTime);
    this.limiter.attack.setValueAtTime(0, this.context.currentTime);
    this.limiter.release.setValueAtTime(0.25, this.context.currentTime);

    this.masterGain = this.context.createGain();
    
    // Setup EQ Bank (3-Band standard)
    const freqs = [100, 1000, 10000];
    const types: BiquadFilterType[] = ['lowshelf', 'peaking', 'highshelf'];
    
    this.eqNodes = freqs.map((f, i) => {
      const node = this.context.createBiquadFilter();
      node.type = types[i];
      node.frequency.value = f;
      node.gain.value = 0;
      return node;
    });

    // Connect Pipeline: EQ -> Limiter -> MasterGain -> Destination
    let lastNode: AudioNode = this.eqNodes[0];
    for (let i = 1; i < this.eqNodes.length; i++) {
      lastNode.connect(this.eqNodes[i]);
      lastNode = this.eqNodes[i];
    }
    lastNode.connect(this.limiter);
    this.limiter.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);

    // Initialize dual channels
    for (let i = 0; i < 2; i++) {
      const el = new Audio();
      el.crossOrigin = "anonymous";
      // Fix: the correct method name is createMediaElementSource
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

  public async play(song: Song, crossfade: boolean = true) {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    const nextIndex = (this.activeChannelIndex + 1) % 2;
    const current = this.channels[this.activeChannelIndex];
    const next = this.channels[nextIndex];

    // 1. Prepare Next Track
    next.element.src = song.url;
    next.gain.gain.setValueAtTime(0, this.context.currentTime);
    
    // 2. ReplayGain Logic
    const volumeLevel = song.replayGain ? Math.pow(10, song.replayGain / 20) : 1.0;
    
    if (crossfade && current.element.src) {
      // 3. Crossfade Animation
      const now = this.context.currentTime;
      current.gain.gain.linearRampToValueAtTime(0, now + this.crossfadeDuration);
      next.gain.gain.linearRampToValueAtTime(volumeLevel, now + this.crossfadeDuration);
      
      next.element.play();
      setTimeout(() => {
        current.element.pause();
        current.element.src = "";
      }, this.crossfadeDuration * 1000);
    } else {
      // Immediate Play
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
