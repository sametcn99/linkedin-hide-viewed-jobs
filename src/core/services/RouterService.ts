import { CONFIG } from '../constants';

type RouteChangeCallback = () => void;

/**
 * Observes SPA route changes via history API wrapping and DOM mutation.
 */
export class RouterService {
  private lastUrl: string = location.href;
  private lastPathname: string = location.pathname;
  private routeRefreshBurstId: ReturnType<typeof setInterval> | null = null;
  private domObserver: MutationObserver | null = null;
  private domMutationTimerId: ReturnType<typeof setTimeout> | null = null;
  private readonly delayedRefreshTimers = new Map<number, ReturnType<typeof setTimeout>>();

  private onRefresh: RouteChangeCallback;
  private onPathChange: RouteChangeCallback;

  constructor(onRefresh: RouteChangeCallback, onPathChange: RouteChangeCallback) {
    this.onRefresh = onRefresh;
    this.onPathChange = onPathChange;
  }

  /** Start observing route and DOM changes */
  startObserving(): void {
    this.observeRouteChanges();
    this.observeDomChanges();
  }

  /** Stop all observers and timers */
  stopAll(): void {
    this.stopDomObserver();
    this.clearRouteRefreshBurst();
    this.delayedRefreshTimers.forEach((id) => clearTimeout(id));
    this.delayedRefreshTimers.clear();
  }

  /** Queue a delayed refresh */
  queueRefresh(delayMs: number): void {
    if (this.delayedRefreshTimers.has(delayMs)) return;

    const timerId = setTimeout(() => {
      this.delayedRefreshTimers.delete(delayMs);
      this.onRefresh();
    }, delayMs);

    this.delayedRefreshTimers.set(delayMs, timerId);
  }

  /** Start rapid refresh burst after navigation */
  startRouteRefreshBurst(): void {
    let ticks = 0;
    this.clearRouteRefreshBurst();

    this.routeRefreshBurstId = setInterval(() => {
      ticks++;
      this.onRefresh();

      if (ticks >= CONFIG.ROUTE_BURST_MAX_TICKS) {
        this.clearRouteRefreshBurst();
      }
    }, CONFIG.ROUTE_BURST_INTERVAL_MS);
  }

  /** Restart DOM observer */
  restartDomObserver(): void {
    this.stopDomObserver();
    this.observeDomChanges();
  }

  // ── Private ──────────────────────────────────────────────────────────

  private observeRouteChanges(): void {
    const handler = () => this.onLocationMaybeChanged();

    this.wrapHistoryMethod('pushState', handler);
    this.wrapHistoryMethod('replaceState', handler);
    window.addEventListener('popstate', handler);
    window.addEventListener('hashchange', handler);
  }

  private observeDomChanges(): void {
    this.stopDomObserver();

    this.domObserver = new MutationObserver(() => {
      if (this.domMutationTimerId) return;

      this.domMutationTimerId = setTimeout(() => {
        this.domMutationTimerId = null;
        this.onRefresh();
      }, CONFIG.MUTATION_DEBOUNCE_MS);
    });

    if (!document.body) return;

    this.domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });
  }

  private stopDomObserver(): void {
    if (this.domMutationTimerId) {
      clearTimeout(this.domMutationTimerId);
      this.domMutationTimerId = null;
    }
    if (this.domObserver) {
      this.domObserver.disconnect();
      this.domObserver = null;
    }
  }

  private clearRouteRefreshBurst(): void {
    if (this.routeRefreshBurstId) {
      clearInterval(this.routeRefreshBurstId);
      this.routeRefreshBurstId = null;
    }
  }

  private onLocationMaybeChanged(): void {
    const currentUrl = location.href;
    const currentPathname = location.pathname;
    if (currentUrl === this.lastUrl) return;

    this.lastUrl = currentUrl;
    const pathChanged = currentPathname !== this.lastPathname;

    if (pathChanged) {
      this.lastPathname = currentPathname;
      this.onPathChange();
      return;
    }

    this.onRefresh();
    this.queueRefresh(120);
    this.queueRefresh(420);
  }

  private wrapHistoryMethod(methodName: 'pushState' | 'replaceState', callback: () => void): void {
    const original = history[methodName];
    if (typeof original !== 'function') return;

    history[methodName] = function (this: History, ...args: Parameters<typeof original>) {
      const result = original.apply(this, args);
      callback();
      return result;
    };
  }
}
