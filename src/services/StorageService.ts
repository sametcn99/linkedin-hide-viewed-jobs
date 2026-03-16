import type { IPosition, TDetectionMode } from '../types';
import { CONFIG, DOM_IDS } from '../constants';

/**
 * Abstraction over localStorage with safe read/write operations.
 */
export class StorageService {
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
}
