import type { IHighlightColors, IPosition, TDetectionMode } from '../types';
import type { IStorageService } from './IStorageService';
import { CONFIG, DOM_IDS } from '../constants';

/**
 * localStorage-backed storage adapter for userscript context.
 * This is the original StorageService logic, now implementing IStorageService.
 */
export class LocalStorageService implements IStorageService {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore quota/privacy failures
    }
  }

  getShowHidden(): boolean {
    return this.getItem(DOM_IDS.STORAGE_KEY) === '1';
  }

  setShowHidden(value: boolean): void {
    this.setItem(DOM_IDS.STORAGE_KEY, value ? '1' : '0');
  }

  getScrollGuardEnabled(): boolean {
    const value = this.getItem(DOM_IDS.SCROLL_GUARD_STORAGE_KEY);
    if (value === '0') return false;
    if (value === '1') return true;
    return CONFIG.SCROLL_GUARD_ENABLED_DEFAULT;
  }

  setScrollGuardEnabled(value: boolean): void {
    this.setItem(DOM_IDS.SCROLL_GUARD_STORAGE_KEY, value ? '1' : '0');
  }

  getDetectionMode(): TDetectionMode {
    const mode = this.getItem(DOM_IDS.DETECTION_MODE_STORAGE_KEY);
    return mode === 'highlight' ? 'highlight' : 'hide';
  }

  setDetectionMode(mode: TDetectionMode): void {
    this.setItem(DOM_IDS.DETECTION_MODE_STORAGE_KEY, mode);
  }

  getReloadOnNavigation(): boolean {
    return this.getItem(DOM_IDS.RELOAD_ON_NAVIGATION_STORAGE_KEY) === '1';
  }

  setReloadOnNavigation(value: boolean): void {
    this.setItem(DOM_IDS.RELOAD_ON_NAVIGATION_STORAGE_KEY, value ? '1' : '0');
  }

  getHighlightColors(): IHighlightColors {
    return {
      viewed: this.getHighlightColor(
        DOM_IDS.VIEWED_HIGHLIGHT_COLOR_STORAGE_KEY,
        CONFIG.VIEWED_HIGHLIGHT_COLOR
      ),
      applied: this.getHighlightColor(
        DOM_IDS.APPLIED_HIGHLIGHT_COLOR_STORAGE_KEY,
        CONFIG.APPLIED_HIGHLIGHT_COLOR
      ),
      active: this.getHighlightColor(
        DOM_IDS.ACTIVE_HIGHLIGHT_COLOR_STORAGE_KEY,
        CONFIG.ACTIVE_HIGHLIGHT_COLOR
      ),
      keyword: this.getHighlightColor(
        DOM_IDS.KEYWORD_HIGHLIGHT_COLOR_STORAGE_KEY,
        CONFIG.KEYWORD_HIGHLIGHT_COLOR
      ),
    };
  }

  setViewedHighlightColor(color: string): void {
    this.setItem(
      DOM_IDS.VIEWED_HIGHLIGHT_COLOR_STORAGE_KEY,
      this.normalizeHighlightColor(color, CONFIG.VIEWED_HIGHLIGHT_COLOR)
    );
  }

  setAppliedHighlightColor(color: string): void {
    this.setItem(
      DOM_IDS.APPLIED_HIGHLIGHT_COLOR_STORAGE_KEY,
      this.normalizeHighlightColor(color, CONFIG.APPLIED_HIGHLIGHT_COLOR)
    );
  }

  setActiveHighlightColor(color: string): void {
    this.setItem(
      DOM_IDS.ACTIVE_HIGHLIGHT_COLOR_STORAGE_KEY,
      this.normalizeHighlightColor(color, CONFIG.ACTIVE_HIGHLIGHT_COLOR)
    );
  }

  setKeywordHighlightColor(color: string): void {
    this.setItem(
      DOM_IDS.KEYWORD_HIGHLIGHT_COLOR_STORAGE_KEY,
      this.normalizeHighlightColor(color, CONFIG.KEYWORD_HIGHLIGHT_COLOR)
    );
  }

  resetViewedHighlightColor(): void {
    this.setViewedHighlightColor(CONFIG.VIEWED_HIGHLIGHT_COLOR);
  }

  resetAppliedHighlightColor(): void {
    this.setAppliedHighlightColor(CONFIG.APPLIED_HIGHLIGHT_COLOR);
  }

  resetActiveHighlightColor(): void {
    this.setActiveHighlightColor(CONFIG.ACTIVE_HIGHLIGHT_COLOR);
  }

  resetKeywordHighlightColor(): void {
    this.setKeywordHighlightColor(CONFIG.KEYWORD_HIGHLIGHT_COLOR);
  }

  getCustomKeywords(): string[] {
    try {
      const raw = this.getItem(DOM_IDS.CUSTOM_KEYWORDS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return this.normalizeKeywords(parsed.filter((k): k is string => typeof k === 'string'));
    } catch {
      return [];
    }
  }

  setCustomKeywords(keywords: string[]): void {
    const normalized = this.normalizeKeywords(keywords);
    this.setItem(DOM_IDS.CUSTOM_KEYWORDS_STORAGE_KEY, JSON.stringify(normalized));
  }

  private normalizeKeywords(keywords: string[]): string[] {
    return Array.from(
      new Set(keywords.map((k) => k.trim().toLowerCase()).filter((k) => k.length > 0))
    );
  }

  getHighlightOpacity(): number {
    const raw = this.getItem(DOM_IDS.HIGHLIGHT_OPACITY_STORAGE_KEY);
    return this.normalizeHighlightOpacity(raw, CONFIG.HIGHLIGHT_OPACITY);
  }

  setHighlightOpacity(value: number): void {
    const normalized = this.normalizeHighlightOpacity(String(value), CONFIG.HIGHLIGHT_OPACITY);
    this.setItem(DOM_IDS.HIGHLIGHT_OPACITY_STORAGE_KEY, normalized.toFixed(2));
  }

  resetHighlightOpacity(): void {
    this.setHighlightOpacity(CONFIG.HIGHLIGHT_OPACITY);
  }

  getSavedPosition(): IPosition | null {
    try {
      const raw = this.getItem(DOM_IDS.UI_POSITION_KEY);
      if (!raw) return null;

      const pos = JSON.parse(raw) as Record<string, unknown>;
      if (
        !pos ||
        typeof pos.left !== 'number' ||
        typeof pos.top !== 'number' ||
        !Number.isFinite(pos.left) ||
        !Number.isFinite(pos.top)
      ) {
        return null;
      }

      return { left: pos.left as number, top: pos.top as number };
    } catch {
      return null;
    }
  }

  savePosition(pos: IPosition): void {
    this.setItem(DOM_IDS.UI_POSITION_KEY, JSON.stringify(pos));
  }

  private getHighlightColor(key: string, fallback: string): string {
    const raw = this.getItem(key);
    return this.normalizeHighlightColor(raw, fallback);
  }

  private normalizeHighlightColor(value: string | null, fallback: string): string {
    if (!value) return fallback;
    return /^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : fallback;
  }

  private normalizeHighlightOpacity(value: string | null, fallback: number): number {
    if (!value) return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(CONFIG.HIGHLIGHT_OPACITY_MAX, Math.max(CONFIG.HIGHLIGHT_OPACITY_MIN, parsed));
  }
}
