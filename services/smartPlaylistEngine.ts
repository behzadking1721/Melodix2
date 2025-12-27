
import { Song, SmartRuleGroup, SmartRule, ConditionOperator } from "../types";

/**
 * Melodix Smart Playlist Engine - Stage 21
 * Handles high-performance filtering of local library using nested logic.
 */
export class SmartPlaylistEngine {
  
  public static filterLibrary(songs: Song[], group: SmartRuleGroup): Song[] {
    if (!group || group.rules.length === 0) return [];
    return songs.filter(song => this.evaluateGroup(song, group));
  }

  private static evaluateGroup(song: Song, group: SmartRuleGroup): boolean {
    if (group.logic === 'and') {
      return group.rules.every(rule => this.evaluateRuleOrGroup(song, rule));
    } else {
      return group.rules.some(rule => this.evaluateRuleOrGroup(song, rule));
    }
  }

  private static evaluateRuleOrGroup(song: Song, item: SmartRule | SmartRuleGroup): boolean {
    if ('rules' in item) {
      return this.evaluateGroup(song, item);
    }
    return this.evaluateRule(song, item);
  }

  private static evaluateRule(song: Song, rule: SmartRule): boolean {
    const songValue = (song as any)[rule.field];
    const ruleValue = rule.value;

    switch (rule.operator) {
      case 'is': return songValue === ruleValue;
      case 'is-not': return songValue !== ruleValue;
      case 'contains': 
        return String(songValue).toLowerCase().includes(String(ruleValue).toLowerCase());
      case 'not-contains':
        return !String(songValue).toLowerCase().includes(String(ruleValue).toLowerCase());
      case 'greater': return Number(songValue) > Number(ruleValue);
      case 'less': return Number(songValue) < Number(ruleValue);
      case 'starts':
        return String(songValue).toLowerCase().startsWith(String(ruleValue).toLowerCase());
      case 'ends':
        return String(songValue).toLowerCase().endsWith(String(ruleValue).toLowerCase());
      default: return false;
    }
  }

  public static generateEmptyGroup(): SmartRuleGroup {
    return {
      id: Math.random().toString(36).substr(2, 9),
      logic: 'and',
      rules: []
    };
  }
}
