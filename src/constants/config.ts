import type { IConfig, IDomIdentifiers } from '../types';

export const CONFIG: IConfig = Object.freeze({
  POLL_INTERVAL_MS: 2000,
  ROUTE_CHECK_INTERVAL_MS: 500,
  ROUTE_BURST_INTERVAL_MS: 250,
  ROUTE_BURST_MAX_TICKS: 12,
  LAZY_RENDER_TIMEOUT_MS: 8000,
  MUTATION_DEBOUNCE_MS: 80,
  UI_Z_INDEX: 99999,
  UI_EDGE_MARGIN: 8,
  ENABLE_HIGHLIGHT: true,
  HIGHLIGHT_COLOR: 'rgba(46, 204, 113, 0.95)',
  HIGHLIGHT_BORDER_RADIUS: '6px',
});

export const DOM_IDS: IDomIdentifiers = Object.freeze({
  STORAGE_KEY: 'lhvj-show-hidden',
  UI_POSITION_KEY: 'lhvj-ui-position',
  HIDDEN_CLASS: 'lhvj-hidden-by-script',
  UI_ID: 'lhvj-toggle-root',
  VIEWED_HIGHLIGHT_CLASS: 'lhvj-viewed-highlight',
});
