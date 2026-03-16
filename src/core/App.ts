import { CONFIG, DOM_IDS } from '../constants';
import { StorageService, KeywordMatcher, DetectionService, RouterService } from '../services';
import { StyleManager, Badge } from '../ui';
import type { TDetectionMode } from '../types';

/**
 * Main application orchestrator that wires all services together.
 */
export class App {
  private static readonly PAGINATION_COOLDOWN_CLASS = 'lhvj-pagination-cooldown';
  private static readonly COUNT_COOLDOWN_STEP = 20;

  private readonly storage: StorageService;
  private readonly matcher: KeywordMatcher;
  private readonly detection: DetectionService;
  private readonly styleManager: StyleManager;
  private readonly badge: Badge;
  private readonly router: RouterService;

  private showHidden: boolean;
  private scrollGuardEnabled: boolean;
  private detectionMode: TDetectionMode;
  private reloadOnNavigationEnabled: boolean;
  private hiddenCount = 0;
  private rafId = 0;
  private isRuntimeActive = false;
  private isReloadingForPathChange = false;
  private lastRouteChangeAt = Date.now();
  private isCooldownActive = false;
  private cooldownUntil = 0;
  private lastControlledScrollAt = 0;
  private touchLastY: number | null = null;
  private lastObservedScrollY = 0;
  private lastObservedScrollAt = Date.now();
  private isAdjustingNativeScroll = false;
  private countGrowthSinceCooldown = 0;

  constructor() {
    this.storage = new StorageService();
    this.matcher = new KeywordMatcher();
    this.detection = new DetectionService(this.matcher);
    this.styleManager = new StyleManager();
    this.showHidden = this.storage.getShowHidden();
    this.scrollGuardEnabled = this.storage.getScrollGuardEnabled();
    this.detectionMode = this.storage.getDetectionMode();
    this.reloadOnNavigationEnabled = this.storage.getReloadOnNavigation();

    this.badge = new Badge(
      this.storage,
      (checked) => {
        this.showHidden = checked;
        this.storage.setShowHidden(checked);
        if (!checked) {
          this.resetScrollCooldown();
          this.resetCountBasedCooldownProgress();
        }
        this.scheduleRefresh();
      },
      (enabled) => {
        this.scrollGuardEnabled = enabled;
        this.storage.setScrollGuardEnabled(enabled);
        if (!enabled) {
          this.resetScrollCooldown();
          this.resetCountBasedCooldownProgress();
        }
        this.scheduleRefresh();
      },
      (mode) => {
        this.detectionMode = mode;
        this.storage.setDetectionMode(mode);
        this.scheduleRefresh();
      },
      (enabled) => {
        this.reloadOnNavigationEnabled = enabled;
        this.storage.setReloadOnNavigation(enabled);
      }
    );

    this.router = new RouterService(
      () => this.scheduleRefresh(),
      () => this.hardRestartRuntimeForPathChange()
    );
  }

  /** Bootstrap the userscript */
  init(): void {
    this.styleManager.inject();
    this.startRuntime();
    this.router.startObserving();
  }

  // ── Runtime lifecycle ────────────────────────────────────────────────

  private startRuntime(): void {
    if (this.isRuntimeActive) return;

    this.lastRouteChangeAt = Date.now();
    this.lastObservedScrollY = window.scrollY;
    this.lastObservedScrollAt = Date.now();
    this.router.restartDomObserver();
    this.scheduleRefresh();
    this.router.queueRefresh(120);
    this.router.queueRefresh(420);

    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('scroll', this.onWindowScroll, { passive: true, capture: true });
    window.addEventListener('wheel', this.onWheel, { passive: false, capture: true });
    window.addEventListener('mousedown', this.onMouseDown, { capture: true });
    window.addEventListener('auxclick', this.onAuxClick, { capture: true });
    window.addEventListener('keydown', this.onKeyDown, { passive: false, capture: true });
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false, capture: true });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
    this.isRuntimeActive = true;

    if (this.detection.isJobsPage()) {
      this.router.startRouteRefreshBurst();
    }
  }

  private hardRestartRuntimeForPathChange(): void {
    // In OFF mode, or when the setting is disabled, keep SPA route changes as soft refreshes.
    if (!this.showHidden || !this.reloadOnNavigationEnabled) {
      this.lastRouteChangeAt = Date.now();
      this.router.restartDomObserver();
      this.scheduleRefresh();
      this.router.queueRefresh(120);
      this.router.queueRefresh(420);
      return;
    }

    if (this.isReloadingForPathChange) return;
    this.isReloadingForPathChange = true;
    window.location.reload();
  }

  // ── Refresh cycle ────────────────────────────────────────────────────

  private scheduleRefresh(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);

    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      this.refresh();
    });
  }

  private refresh(): void {
    this.syncCooldownState();
    this.syncPaginationCooldownClass();
    const previousHiddenCount = this.hiddenCount;

    if (!this.detection.isJobsPage()) {
      this.hiddenCount = 0;
      this.resetScrollCooldown();
      this.resetCountBasedCooldownProgress();
      this.badge.remove();
      return;
    }

    if (!this.showHidden) {
      this.hiddenCount = 0;
      this.resetScrollCooldown();
      this.resetCountBasedCooldownProgress();
      this.clearDetectedVisualState();
      this.badge.ensure(
        this.showHidden,
        this.scrollGuardEnabled,
        this.detectionMode,
        this.reloadOnNavigationEnabled
      );
      this.badge.updateCount(
        0,
        this.showHidden,
        this.scrollGuardEnabled,
        this.detectionMode,
        this.reloadOnNavigationEnabled,
        0
      );
      return;
    }

    if (!this.isCountCooldownPage()) {
      this.resetCountBasedCooldownProgress();
    }

    const cards = this.detection.getJobCards();

    // Retry briefly after navigation because LinkedIn can render cards lazily
    if (cards.length === 0 && Date.now() - this.lastRouteChangeAt < CONFIG.LAZY_RENDER_TIMEOUT_MS) {
      this.router.queueRefresh(180);
      this.router.queueRefresh(600);
    }

    const viewedCardsFromMarkers = this.detection.getViewedCardsFromMarkers();
    const viewedCards = new Set(viewedCardsFromMarkers);

    // Fallback: card-level scan
    for (const card of cards) {
      if (!viewedCards.has(card) && this.detection.isViewedJobCard(card)) {
        viewedCards.add(card);
      }
    }

    this.hiddenCount = 0;

    for (const card of cards) {
      const viewed = viewedCards.has(card);
      if (viewed) this.hiddenCount++;
      this.detection.applyVisibility(card, viewed && this.detectionMode === 'hide');
      this.detection.applyViewedHighlight(card, viewed && this.detectionMode === 'highlight');
    }

    const shouldHideDetected = this.detectionMode === 'hide';
    const anchorResult = this.detection.refreshViewedAnchors(shouldHideDetected);
    const fallbackCards = this.detection.refreshJobsViewedCardsFallback(shouldHideDetected);
    const finalViewedCards = new Set(viewedCards);

    anchorResult.viewedAnchorCards.forEach((c) => finalViewedCards.add(c));
    fallbackCards.forEach((c) => finalViewedCards.add(c));

    // Clean up stale card states
    document.querySelectorAll<HTMLElement>('[data-lhvj-hidden="1"]').forEach((node) => {
      if (!shouldHideDetected || !finalViewedCards.has(node)) {
        this.detection.applyVisibility(node, false);
      }
    });

    document.querySelectorAll<HTMLElement>('[data-lhvj-viewed="1"]').forEach((node) => {
      if (!finalViewedCards.has(node) || shouldHideDetected) {
        this.detection.applyViewedHighlight(node, false);
      }
    });

    this.hiddenCount = Math.max(
      this.hiddenCount,
      anchorResult.viewedAnchorCount,
      fallbackCards.size
    );

    this.maybeStartCountBasedCooldown(previousHiddenCount);

    this.badge.ensure(
      this.showHidden,
      this.scrollGuardEnabled,
      this.detectionMode,
      this.reloadOnNavigationEnabled
    );
    this.badge.updateCount(
      this.hiddenCount,
      this.showHidden,
      this.scrollGuardEnabled,
      this.detectionMode,
      this.reloadOnNavigationEnabled,
      this.getCooldownSecondsLeft()
    );
  }

  private onWindowResize = (): void => {
    this.badge.syncPositionWithinViewport();
  };

  private onWheel = (e: WheelEvent): void => {
    if (e.deltaY <= 0) return;

    const handled = this.handleScrollGuardInput(e.deltaY, () => {
      e.preventDefault();
      e.stopPropagation();
    });

    if (handled) {
      this.scheduleRefresh();
    }
  };

  private onWindowScroll = (): void => {
    const now = Date.now();
    const currentY = window.scrollY;
    const deltaY = currentY - this.lastObservedScrollY;
    const elapsedMs = Math.max(1, now - this.lastObservedScrollAt);

    if (deltaY <= 0) {
      this.lastObservedScrollY = currentY;
      this.lastObservedScrollAt = now;
      return;
    }

    if (!this.shouldUseScrollGuard()) {
      this.lastObservedScrollY = currentY;
      this.lastObservedScrollAt = now;
      return;
    }

    this.syncCooldownState();

    // Middle-click auto-scroll bypasses wheel handlers; clamp native scroll jumps while cooldown is active.
    if (this.isCooldownActive && !this.isAdjustingNativeScroll) {
      const allowedDelta = Math.max(
        14,
        (CONFIG.SCROLL_GUARD_ALLOWED_STEP_PX * elapsedMs) /
          CONFIG.SCROLL_GUARD_ALLOWED_STEP_MIN_INTERVAL_MS
      );

      if (deltaY > allowedDelta) {
        const clampedY = this.lastObservedScrollY + allowedDelta;
        this.isAdjustingNativeScroll = true;
        window.scrollTo({ top: clampedY, behavior: 'auto' });
        this.lastObservedScrollY = clampedY;
        this.lastObservedScrollAt = now;

        window.setTimeout(() => {
          this.isAdjustingNativeScroll = false;
        }, 0);

        this.scheduleRefresh();
        return;
      }
    }

    this.lastObservedScrollY = currentY;
    this.lastObservedScrollAt = now;
  };

  private onMouseDown = (e: MouseEvent): void => {
    if (e.button !== 1) return;
    if (!this.shouldBlockMiddleMouseDuringCooldown()) return;

    e.preventDefault();
    e.stopPropagation();
  };

  private onAuxClick = (e: MouseEvent): void => {
    if (e.button !== 1) return;
    if (!this.shouldBlockMiddleMouseDuringCooldown()) return;

    e.preventDefault();
    e.stopPropagation();
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (this.isEditableTarget(e.target)) return;

    const key = e.key;
    let delta = 0;

    if (key === 'ArrowDown') {
      delta = 96;
    } else if (key === 'PageDown') {
      delta = Math.max(window.innerHeight * 0.85, 280);
    } else if (key === ' ') {
      if (e.shiftKey) return;
      delta = Math.max(window.innerHeight * 0.85, 280);
    }

    if (delta <= 0) return;

    const handled = this.handleScrollGuardInput(delta, () => {
      e.preventDefault();
      e.stopPropagation();
    });

    if (handled) {
      this.scheduleRefresh();
    }
  };

  private onTouchStart = (e: TouchEvent): void => {
    if (e.touches.length === 0) return;
    this.touchLastY = e.touches[0].clientY;
  };

  private onTouchMove = (e: TouchEvent): void => {
    if (e.touches.length === 0 || this.touchLastY === null) return;
    const currentY = e.touches[0].clientY;
    const delta = this.touchLastY - currentY;
    this.touchLastY = currentY;

    if (delta <= 0) return;

    const handled = this.handleScrollGuardInput(delta, () => {
      e.preventDefault();
      e.stopPropagation();
    });

    if (handled) {
      this.scheduleRefresh();
    }
  };

  private onTouchEnd = (): void => {
    this.touchLastY = null;
  };

  private handleScrollGuardInput(deltaY: number, cancelDefault: () => void): boolean {
    if (!this.shouldUseScrollGuard()) {
      return false;
    }

    this.syncCooldownState();

    if (!this.isCooldownActive) {
      return false;
    }

    cancelDefault();
    this.applyControlledScroll(deltaY);
    return true;
  }

  private shouldUseScrollGuard(): boolean {
    if (!this.scrollGuardEnabled) return false;
    if (!this.showHidden) return false;
    return this.detection.isJobsPage();
  }

  private shouldBlockMiddleMouseDuringCooldown(): boolean {
    if (!this.isCooldownActive) return false;
    return this.shouldUseScrollGuard();
  }

  private shouldUseCountBasedCooldown(): boolean {
    if (!this.scrollGuardEnabled) return false;
    if (!this.showHidden) return false;
    return this.isCountCooldownPage();
  }

  private maybeStartCountBasedCooldown(previousHiddenCount: number): void {
    if (!this.shouldUseCountBasedCooldown()) return;

    if (this.hiddenCount > previousHiddenCount) {
      this.countGrowthSinceCooldown += this.hiddenCount - previousHiddenCount;
    }

    if (this.countGrowthSinceCooldown < App.COUNT_COOLDOWN_STEP) return;

    const triggerCount = Math.floor(this.countGrowthSinceCooldown / App.COUNT_COOLDOWN_STEP);
    this.countGrowthSinceCooldown -= triggerCount * App.COUNT_COOLDOWN_STEP;

    // Collapse burst triggers into a single running countdown timeline.
    for (let i = 0; i < triggerCount; i++) {
      this.startRandomCooldown();
    }
  }

  private resetCountBasedCooldownProgress(): void {
    this.countGrowthSinceCooldown = 0;
  }

  private isJobsHomepage(): boolean {
    const path = location.pathname;
    return path === '/jobs' || path === '/jobs/';
  }

  private isCollectionsPage(): boolean {
    return location.pathname.startsWith('/jobs/collections');
  }

  private isCountCooldownPage(): boolean {
    return this.isJobsHomepage() || this.isCollectionsPage();
  }

  private startRandomCooldown(): void {
    const minMs = CONFIG.SCROLL_GUARD_COOLDOWN_MIN_MS;
    const maxMs = CONFIG.SCROLL_GUARD_COOLDOWN_MAX_MS;
    const durationMs = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));

    if (this.isCooldownActive) {
      this.cooldownUntil += durationMs;
    } else {
      this.isCooldownActive = true;
      this.cooldownUntil = Date.now() + durationMs;
      this.lastControlledScrollAt = 0;
      this.syncPaginationCooldownClass();
    }

    const msUntilEnd = Math.max(0, this.cooldownUntil - Date.now());

    window.setTimeout(() => {
      if (!this.isCooldownActive) return;
      this.syncCooldownState();
      this.scheduleRefresh();
    }, msUntilEnd + 20);
  }

  private applyControlledScroll(deltaY: number): void {
    const now = Date.now();
    if (now - this.lastControlledScrollAt < CONFIG.SCROLL_GUARD_ALLOWED_STEP_MIN_INTERVAL_MS) {
      return;
    }

    const step = Math.min(Math.max(deltaY, 0), CONFIG.SCROLL_GUARD_ALLOWED_STEP_PX);
    if (step <= 0) return;

    window.scrollBy({ top: step, behavior: 'auto' });
    this.lastControlledScrollAt = now;
  }

  private syncCooldownState(): void {
    if (!this.isCooldownActive) return;
    if (Date.now() < this.cooldownUntil) return;
    this.resetScrollCooldown();
  }

  private resetScrollCooldown(): void {
    this.isCooldownActive = false;
    this.cooldownUntil = 0;
    this.lastControlledScrollAt = 0;
    this.isAdjustingNativeScroll = false;
    this.syncPaginationCooldownClass();
  }

  private getCooldownSecondsLeft(): number {
    if (!this.isCooldownActive) return 0;
    const msLeft = this.cooldownUntil - Date.now();
    if (msLeft <= 0) return 0;
    return Math.ceil(msLeft / 1000);
  }

  private isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    return !!target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]');
  }

  private clearDetectedVisualState(): void {
    const { HIDDEN_CLASS } = DOM_IDS;
    document.querySelectorAll<HTMLElement>('[data-lhvj-hidden="1"]').forEach((node) => {
      this.detection.applyVisibility(node, false);
    });

    document.querySelectorAll<HTMLElement>('[data-lhvj-viewed="1"]').forEach((node) => {
      this.detection.applyViewedHighlight(node, false);
    });

    document.querySelectorAll<HTMLElement>('a[data-lhvj-hidden-anchor="1"]').forEach((node) => {
      node.classList.remove(HIDDEN_CLASS);
      node.removeAttribute('data-lhvj-hidden-anchor');
    });
  }

  private syncPaginationCooldownClass(): void {
    const root = document.documentElement;
    if (!root) return;

    const shouldDisablePagination = this.isCooldownActive && this.detection.isJobsPage();
    root.classList.toggle(App.PAGINATION_COOLDOWN_CLASS, shouldDisablePagination);
  }
}
