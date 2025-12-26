
/**
 * Melodix Enterprise Logger - v8.0
 * Inspired by Serilog for structured logging and performance profiling.
 */

import { cacheItem } from "./dbService";

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5
}

export enum LogCategory {
  AUDIO = 'AudioEngine',
  LIB = 'Library',
  UI = 'UserInterface',
  AI = 'GeminiAI',
  DB = 'Database',
  SYSTEM = 'System'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: any;
  elapsedMs?: number;
}

class MelodixLogger {
  private static instance: MelodixLogger;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;
  private timers: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): MelodixLogger {
    if (!MelodixLogger.instance) MelodixLogger.instance = new MelodixLogger();
    return MelodixLogger.instance;
  }

  public log(level: LogLevel, category: LogCategory, message: string, context?: any, elapsedMs?: number) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context,
      elapsedMs
    };

    // Console Output with Color Formatting
    const color = this.getColor(level);
    console.log(
      `%c[${entry.timestamp}] [${LogCategory[category]}] [${LogLevel[level]}]: ${message} ${elapsedMs ? `(${elapsedMs}ms)` : ''}`,
      `color: ${color}; font-weight: bold;`
    );

    this.logs.push(entry);
    
    // Rolling memory limit
    if (this.logs.length > this.MAX_LOGS) this.logs.shift();

    // Async persistence to DB (Simulation of Rolling File)
    if (level >= LogLevel.INFO) {
      cacheItem('logs', entry.timestamp, entry).catch(() => {});
    }
  }

  public startTimer(id: string) {
    this.timers.set(id, performance.now());
  }

  public endTimer(id: string, category: LogCategory, message: string) {
    const start = this.timers.get(id);
    if (start) {
      const elapsed = Math.round(performance.now() - start);
      const level = elapsed > 1000 ? LogLevel.WARN : LogLevel.DEBUG;
      this.log(level, category, message, null, elapsed);
      this.timers.delete(id);
    }
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.TRACE: return '#71717a';
      case LogLevel.DEBUG: return '#3b82f6';
      case LogLevel.INFO: return '#10b981';
      case LogLevel.WARN: return '#f59e0b';
      case LogLevel.ERROR: return '#ef4444';
      case LogLevel.FATAL: return '#7f1d1d';
      default: return '#fff';
    }
  }

  public getLogs(): LogEntry[] { return [...this.logs]; }
}

export const logger = MelodixLogger.getInstance();
