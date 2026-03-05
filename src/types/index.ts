export type TDetectionMode = 'hide' | 'highlight';

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
  /** Enable scroll cooldown guard by default */
  readonly SCROLL_GUARD_ENABLED_DEFAULT: boolean;
  /** Total downward scroll delta in trigger window to start cooldown */
  readonly SCROLL_GUARD_TRIGGER_DELTA_PX: number;
  /** Time window for collecting scroll delta samples */
  readonly SCROLL_GUARD_TRIGGER_WINDOW_MS: number;
  /** Min cooldown duration in ms */
  readonly SCROLL_GUARD_COOLDOWN_MIN_MS: number;
  /** Max cooldown duration in ms */
  readonly SCROLL_GUARD_COOLDOWN_MAX_MS: number;
  /** Max allowed downward step while cooldown is active */
  readonly SCROLL_GUARD_ALLOWED_STEP_PX: number;
  /** Min interval between controlled scroll steps during cooldown */
  readonly SCROLL_GUARD_ALLOWED_STEP_MIN_INTERVAL_MS: number;
  /** Minimum recent viewed density required to arm the guard (0-1) */
  readonly SCROLL_GUARD_MIN_VIEWED_DENSITY: number;
  /** Time window for viewed density sampling */
  readonly SCROLL_GUARD_DENSITY_WINDOW_MS: number;
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
  guardBtn: HTMLButtonElement | null;
  cooldownEl: HTMLSpanElement | null;
  settingsBtn: HTMLButtonElement | null;
  settingsPanel: HTMLDivElement | null;
  modeHideBtn: HTMLButtonElement | null;
  modeHighlightBtn: HTMLButtonElement | null;
}

/** Result from anchor-based viewed job detection */
export interface IAnchorDetectionResult {
  viewedAnchorCount: number;
  viewedAnchorCards: Set<HTMLElement>;
}

/** CSS class names and DOM IDs used by the script */
export interface IDomIdentifiers {
  readonly STORAGE_KEY: string;
  readonly SCROLL_GUARD_STORAGE_KEY: string;
  readonly DETECTION_MODE_STORAGE_KEY: string;
  readonly UI_POSITION_KEY: string;
  readonly HIDDEN_CLASS: string;
  readonly UI_ID: string;
  readonly VIEWED_HIGHLIGHT_CLASS: string;
}
