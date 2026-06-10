import { TDetectedJobState } from '../types'

/** Result from anchor-based viewed job detection */
export interface IAnchorDetectionResult {
  detectedAnchorCount: number
  detectedAnchorCards: Map<HTMLElement, TDetectedJobState>
}
