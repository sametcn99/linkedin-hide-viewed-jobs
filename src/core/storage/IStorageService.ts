import { IHighlightColors } from '../interfaces/IHighlightColors';
import { IPosition } from '../interfaces/IPosition';
import type { TDetectionMode } from '../types';

/**
 * Storage adapter interface abstracting localStorage and chrome.storage.local.
 * Enables the same business logic to work in both userscript and extension contexts.
 */
export interface IStorageService {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;

  getShowHidden(): boolean;
  setShowHidden(value: boolean): void;

  getScrollGuardEnabled(): boolean;
  setScrollGuardEnabled(value: boolean): void;

  getDetectionMode(): TDetectionMode;
  setDetectionMode(mode: TDetectionMode): void;

  getReloadOnNavigation(): boolean;
  setReloadOnNavigation(value: boolean): void;

  getHighlightColors(): IHighlightColors;
  setViewedHighlightColor(color: string): void;
  setAppliedHighlightColor(color: string): void;
  setActiveHighlightColor(color: string): void;
  setKeywordHighlightColor(color: string): void;

  resetViewedHighlightColor(): void;
  resetAppliedHighlightColor(): void;
  resetActiveHighlightColor(): void;
  resetKeywordHighlightColor(): void;

  getCustomKeywords(): string[];
  setCustomKeywords(keywords: string[]): void;

  getHighlightOpacity(): number;
  setHighlightOpacity(value: number): void;
  resetHighlightOpacity(): void;

  getSavedPosition(): IPosition | null;
  savePosition(pos: IPosition): void;
}
