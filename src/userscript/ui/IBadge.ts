import { TDetectionMode } from '../../core'
import { IHighlightSettings } from '../../core/interfaces/IHighlightSettings'

/**
 * Minimal contract that the App orchestrator needs from the in-page badge UI.
 * Defined in `shared/` so that `App.ts` does not depend on the concrete Badge
 * implementation (which lives in the userscript-only `userscript/ui/`).
 */
export interface IBadge {
  ensure(
    showHidden: boolean,
    scrollGuardEnabled: boolean,
    detectionMode: TDetectionMode,
    reloadOnNavigation: boolean,
    highlightSettings: IHighlightSettings
  ): void

  updateCount(
    count: number,
    showHidden: boolean,
    scrollGuardEnabled: boolean,
    detectionMode: TDetectionMode,
    reloadOnNavigation: boolean,
    highlightSettings: IHighlightSettings,
    cooldownSecondsLeft: number,
    keywordCount: number
  ): void

  syncPositionWithinViewport(): void

  remove(): void
}
