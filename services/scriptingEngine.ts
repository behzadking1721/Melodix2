import { MelodixScript, AutomationRule } from "../types";
import { logger, LogLevel, LogCategory } from "./logger";

/**
 * Melodix Scripting & Automation Engine - Stage 19
 * Orchestrates user-defined scripts and reactive automation rules.
 */
class ScriptingEngine {
  private static instance: ScriptingEngine;
  private scripts: MelodixScript[] = [];
  private rules: AutomationRule[] = [];
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): ScriptingEngine {
    if (!ScriptingEngine.instance) {
      ScriptingEngine.instance = new ScriptingEngine();
    }
    return ScriptingEngine.instance;
  }

  private loadFromStorage() {
    const savedScripts = localStorage.getItem('melodix-dev-scripts');
    const savedRules = localStorage.getItem('melodix-dev-rules');
    
    if (savedScripts) {
      this.scripts = JSON.parse(savedScripts);
    } else {
      this.scripts = [{
        id: 'sample-bass-boost',
        name: 'Auto Bass Optimizer',
        code: `// Melodix Sandbox Script v1.0\nif (track.genre === "Rock") {\n  player.setEQ("bass", +10);\n  ui.showToast("Optimizer: Heavy Rock profile applied.");\n}`,
        status: 'idle'
      }];
    }

    if (savedRules) {
      this.rules = JSON.parse(savedRules);
    } else {
      this.rules = [{
        id: 'rule-lyrics-autofetch',
        name: 'Smart Lyrics Recovery',
        trigger: 'metadata-missing',
        condition: 'track.hasLyrics === false',
        action: 'library.autoFixLyrics(track.id)',
        enabled: true
      }];
    }
  }

  private save() {
    localStorage.setItem('melodix-dev-scripts', JSON.stringify(this.scripts));
    localStorage.setItem('melodix-dev-rules', JSON.stringify(this.rules));
    this.listeners.forEach(l => l());
  }

  public subscribe(l: () => void) {
    this.listeners.add(l);
    // Fix: Ensure the returned cleanup function returns void to comply with React useEffect requirements.
    return () => { this.listeners.delete(l); };
  }

  public getScripts() { return this.scripts; }
  public getRules() { return this.rules; }

  public executeScript(id: string) {
    const script = this.scripts.find(s => s.id === id);
    if (!script) return;

    logger.log(LogLevel.INFO, LogCategory.SYSTEM, `Script Execution Started: ${script.name}`);
    
    // Simulation of Sandbox Execution
    setTimeout(() => {
      this.scripts = this.scripts.map(s => s.id === id ? { ...s, status: 'idle', lastRun: Date.now() } : s);
      logger.log(LogLevel.DEBUG, LogCategory.SYSTEM, `Sandbox: Script "${script.name}" finished in 14ms.`);
      this.save();
    }, 500);

    this.scripts = this.scripts.map(s => s.id === id ? { ...s, status: 'running' } : s);
    this.save();
  }

  public saveScript(script: MelodixScript) {
    const exists = this.scripts.find(s => s.id === script.id);
    if (exists) {
      this.scripts = this.scripts.map(s => s.id === script.id ? script : s);
    } else {
      this.scripts.push(script);
    }
    this.save();
  }

  public toggleRule(id: string) {
    this.rules = this.rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    this.save();
  }

  public deleteScript(id: string) {
    this.scripts = this.scripts.filter(s => s.id !== id);
    this.save();
  }
}

export const scriptingEngine = ScriptingEngine.getInstance();