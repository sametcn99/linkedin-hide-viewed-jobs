import type { IStorageService } from '../../core/storage';
import type { TDetectionMode, THighlightColorTarget } from '../../core/types';

export type ToggleCallback = (checked: boolean) => void;
export type ScrollGuardToggleCallback = (enabled: boolean) => void;
export type DetectionModeChangeCallback = (mode: TDetectionMode) => void;
export type ReloadNavigationToggleCallback = (enabled: boolean) => void;
export type HighlightColorChangeCallback = (target: THighlightColorTarget, color: string) => void;
export type HighlightColorResetCallback = (target: THighlightColorTarget) => void;
export type HighlightOpacityChangeCallback = (value: number) => void;
export type HighlightOpacityResetCallback = () => void;
export type CustomKeywordsChangeCallback = (keywords: string[]) => void;

export interface BadgeDependencies {
  storage: IStorageService;
  initialCustomKeywords: string[];
  onToggle: ToggleCallback;
  onScrollGuardToggle: ScrollGuardToggleCallback;
  onDetectionModeChange: DetectionModeChangeCallback;
  onReloadNavigationToggle: ReloadNavigationToggleCallback;
  onHighlightColorChange: HighlightColorChangeCallback;
  onHighlightColorReset: HighlightColorResetCallback;
  onHighlightOpacityChange: HighlightOpacityChangeCallback;
  onHighlightOpacityReset: HighlightOpacityResetCallback;
  onCustomKeywordsChange: CustomKeywordsChangeCallback;
}
