
import { ThemeDefinition } from "../types";
import { logger, LogCategory, LogLevel } from "./logger";

export const THEME_PRESETS: ThemeDefinition[] = [
  {
    id: 'classic-dark',
    name: 'Classic Dark',
    base: 'dark',
    background: '#0a0a0a',
    surface: 'rgba(255, 255, 255, 0.03)',
    card: 'rgba(255, 255, 255, 0.05)',
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    accent: '#3b82f6',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    border: 'rgba(255, 255, 255, 0.08)'
  },
  {
    id: 'midnight-void',
    name: 'Midnight Void',
    base: 'dark',
    background: '#000000',
    surface: 'rgba(255, 255, 255, 0.01)',
    card: '#0a0a0a',
    primary: '#8b5cf6',
    secondary: '#6d28d9',
    accent: '#8b5cf6',
    textPrimary: '#f8fafc',
    textSecondary: '#64748b',
    border: 'rgba(139, 92, 246, 0.1)'
  },
  {
    id: 'aurora-glass',
    name: 'Aurora Glass',
    base: 'dark',
    background: '#020617',
    surface: 'rgba(15, 23, 42, 0.6)',
    card: 'rgba(30, 41, 59, 0.4)',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#10b981',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: 'rgba(16, 185, 129, 0.15)'
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    base: 'light',
    background: '#f8fafc',
    surface: 'rgba(0, 0, 0, 0.03)',
    card: '#ffffff',
    primary: '#3b82f6',
    secondary: '#2563eb',
    accent: '#3b82f6',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    border: 'rgba(0, 0, 0, 0.08)'
  }
];

export class ThemeManager {
  public static applyTheme(theme: ThemeDefinition) {
    const root = document.documentElement;
    
    // Core Backgrounds
    root.style.setProperty('--mica-bg', theme.background);
    root.style.setProperty('--surface', theme.surface);
    root.style.setProperty('--card-color', theme.card);
    
    // Colors
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--accent-glow', `${theme.accent}33`);
    
    // Text & Borders
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    root.style.setProperty('--border-color', theme.border);

    // Update body classes for conditional light/dark styles
    if (theme.base === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }

    logger.log(LogLevel.DEBUG, LogCategory.UI, `Theme applied: ${theme.name}`);
  }

  public static exportTheme(theme: ThemeDefinition) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(theme));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `melodix-theme-${theme.name.toLowerCase().replace(/\s/g, '-')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  public static async importTheme(file: File): Promise<ThemeDefinition | null> {
    try {
      const text = await file.text();
      const theme = JSON.parse(text) as ThemeDefinition;
      if (!theme.id || !theme.accent) throw new Error("Invalid theme structure");
      return theme;
    } catch (e) {
      logger.log(LogLevel.ERROR, LogCategory.UI, "Failed to import theme", e);
      return null;
    }
  }
}
