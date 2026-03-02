import type { IPosition } from '../types';
import { DOM_IDS } from '../constants';

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
