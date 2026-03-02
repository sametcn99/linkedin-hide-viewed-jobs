import { CONFIG } from '../constants';
import { StorageService, KeywordMatcher, DetectionService, RouterService } from '../services';
import { StyleManager, Badge } from '../ui';

/**
 * Main application orchestrator that wires all services together.
 */
export class App {
  private readonly storage: StorageService;
  private readonly matcher: KeywordMatcher;
  private readonly detection: DetectionService;
  private readonly styleManager: StyleManager;
  private readonly badge: Badge;
  private readonly router: RouterService;

  private showHidden: boolean;
  private hiddenCount = 0;
  private rafId = 0;
  private isRuntimeActive = false;
  private isReloadingForPathChange = false;
  private lastRouteChangeAt = Date.now();

  constructor() {
    this.storage = new StorageService();
    this.matcher = new KeywordMatcher();
    this.detection = new DetectionService(this.matcher);
    this.styleManager = new StyleManager();
    this.showHidden = this.storage.getShowHidden();

    this.badge = new Badge(this.storage, (checked) => {
      this.showHidden = checked;
      this.storage.setShowHidden(checked);
      this.scheduleRefresh();
    });

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
    this.router.restartDomObserver();
    this.scheduleRefresh();
    this.router.queueRefresh(120);
    this.router.queueRefresh(420);

    window.addEventListener('resize', this.onWindowResize);
    this.isRuntimeActive = true;

    if (this.detection.isJobsPage()) {
      this.router.startRouteRefreshBurst();
    }
  }

  private hardRestartRuntimeForPathChange(): void {
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
    if (!this.detection.isJobsPage()) {
      this.hiddenCount = 0;
      this.badge.remove();
      return;
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
      this.detection.applyVisibility(card, viewed && this.showHidden);
      this.detection.applyViewedHighlight(card, viewed && !this.showHidden);
    }

    const anchorResult = this.detection.refreshViewedAnchors(this.showHidden);
    const fallbackCards = this.detection.refreshJobsViewedCardsFallback(this.showHidden);
    const finalViewedCards = new Set(viewedCards);

    anchorResult.viewedAnchorCards.forEach((c) => finalViewedCards.add(c));
    fallbackCards.forEach((c) => finalViewedCards.add(c));

    // Clean up stale card states
    document.querySelectorAll<HTMLElement>('[data-lhvj-hidden="1"]').forEach((node) => {
      if (!this.showHidden || !finalViewedCards.has(node)) {
        this.detection.applyVisibility(node, false);
      }
    });

    document.querySelectorAll<HTMLElement>('[data-lhvj-viewed="1"]').forEach((node) => {
      if (!finalViewedCards.has(node) || this.showHidden) {
        this.detection.applyViewedHighlight(node, false);
      }
    });

    this.hiddenCount = Math.max(
      this.hiddenCount,
      anchorResult.viewedAnchorCount,
      fallbackCards.size
    );

    this.badge.ensure(this.showHidden);
    this.badge.updateCount(this.hiddenCount, this.showHidden);
  }

  private onWindowResize = (): void => {
    this.badge.syncPositionWithinViewport();
  };
}
