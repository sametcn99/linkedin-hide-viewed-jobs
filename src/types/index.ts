/** User-configurable settings for the userscript */
export interface IConfig {
  /** Fallback polling interval in ms */
  readonly POLL_INTERVAL_MS: number;
  /** SPA route-change check interval in ms */
  readonly ROUTE_CHECK_INTERVAL_MS: number;
  /** Post-navigation rapid refresh interval in ms */
  readonly ROUTE_BURST_INTERVAL_MS: number;
  /** Max rapid-refresh cycles after navigation */
  readonly ROUTE_BURST_MAX_TICKS: number;
  /** Timeout for waiting on lazily-rendered cards in ms */
  readonly LAZY_RENDER_TIMEOUT_MS: number;
  /** Min interval between MutationObserver refreshes in ms */
  readonly MUTATION_DEBOUNCE_MS: number;
  /** Badge z-index */
  readonly UI_Z_INDEX: number;
  /** Badge drag edge margin in px */
  readonly UI_EDGE_MARGIN: number;
  /** Toggle viewed-card highlight feature */
  readonly ENABLE_HIGHLIGHT: boolean;
  /** Viewed-card highlight color */
  readonly HIGHLIGHT_COLOR: string;
  /** Viewed-card highlight border-radius */
  readonly HIGHLIGHT_BORDER_RADIUS: string;
}

/** Persisted UI badge position */
export interface IPosition {
  left: number;
  top: number;
}

/** Cached references to badge DOM elements */
export interface IUIState {
  root: HTMLDivElement | null;
  countNum: HTMLSpanElement | null;
  countUnit: HTMLSpanElement | null;
  stateEl: HTMLSpanElement | null;
}

/** Result from anchor-based viewed job detection */
export interface IAnchorDetectionResult {
  viewedAnchorCount: number;
  viewedAnchorCards: Set<HTMLElement>;
}

/** CSS class names and DOM IDs used by the script */
export interface IDomIdentifiers {
  readonly STORAGE_KEY: string;
  readonly UI_POSITION_KEY: string;
  readonly HIDDEN_CLASS: string;
  readonly UI_ID: string;
  readonly VIEWED_HIGHLIGHT_CLASS: string;
}
