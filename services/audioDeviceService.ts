
/**
 * Melodix Audio Device Service - Stage 10
 * Handles hardware enumeration and state monitoring.
 */

import { logger, LogLevel, LogCategory } from "./logger";

export interface AudioDevice {
  id: string;
  label: string;
  isDefault: boolean;
  state: 'active' | 'unavailable';
}

class AudioDeviceService {
  private static instance: AudioDeviceService;
  private devices: AudioDevice[] = [];

  private constructor() {
    // Monitor hardware changes (e.g. plugging in headphones)
    if (navigator.mediaDevices && navigator.mediaDevices.ondevicechange !== undefined) {
      navigator.mediaDevices.ondevicechange = () => {
        logger.log(LogLevel.INFO, LogCategory.SYSTEM, "Hardware change detected: Refreshing devices.");
        this.enumerateDevices();
      };
    }
  }

  public static getInstance(): AudioDeviceService {
    if (!AudioDeviceService.instance) AudioDeviceService.instance = new AudioDeviceService();
    return AudioDeviceService.instance;
  }

  /**
   * Scans system for audio outputs.
   * Equivalent to NAudio's DirectSoundOut.Devices enumeration.
   */
  public async enumerateDevices(): Promise<AudioDevice[]> {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const outputs = allDevices.filter(d => d.kind === 'audiooutput');
      
      this.devices = outputs.map(d => ({
        id: d.deviceId,
        label: d.label || (d.deviceId === 'default' ? 'System Default Speaker' : `Audio Device (${d.deviceId.slice(0,5)})`),
        isDefault: d.deviceId === 'default',
        state: 'active'
      }));

      return this.devices;
    } catch (e) {
      logger.log(LogLevel.ERROR, LogCategory.SYSTEM, "Failed to enumerate audio devices", e);
      return [];
    }
  }

  public getDeviceById(id: string): AudioDevice | undefined {
    return this.devices.find(d => d.id === id);
  }
}

export const audioDeviceService = AudioDeviceService.getInstance();
