import type { IAnchorDetectionResult, TDetectedJobState } from '../types';
import {
  CARD_SELECTOR_JOINED,
  MARKER_SELECTOR_JOINED,
  ANCHOR_SELECTOR_JOINED,
  EXTENDED_CARD_SELECTOR,
  DOM_IDS,
} from '../constants';
import { KeywordMatcher } from './KeywordMatcher';

/**
 * Handles all DOM detection logic for viewed job cards.
 */
export class DetectionService {
  private readonly matcher: KeywordMatcher;

  constructor(matcher: KeywordMatcher) {
    this.matcher = matcher;
  }

  /** Collect all job card elements on the page */
  getJobCards(): HTMLElement[] {
    const cardSet = new Set<HTMLElement>();
    document.querySelectorAll<HTMLElement>(CARD_SELECTOR_JOINED).forEach((node) => {
      cardSet.add(node);
    });
    return Array.from(cardSet);
  }

  /** Find cards that are marked as viewed via marker selectors */
  getDetectedCardsFromMarkers(): Map<HTMLElement, TDetectedJobState> {
    const detectedCards = new Map<HTMLElement, TDetectedJobState>();
    document.querySelectorAll<HTMLElement>(MARKER_SELECTOR_JOINED).forEach((node) => {
      if (!this.isElementVisible(node)) return;
      const state = this.matcher.getDetectedStateFromElement(node);
      if (!state) return;
      const card = this.getCardFromNode(node);
      if (card) this.setDetectedState(detectedCards, card, state);
    });
    return detectedCards;
  }

  /** Full card-level scan for viewed status */
  getDetectedJobState(card: HTMLElement): TDetectedJobState | null {
    const classState = this.matcher.getDetectedStateFromText(card.className || '');
    if (classState) return classState;

    const cardState = this.matcher.getDetectedStateFromElement(card);
    if (cardState) return cardState;

    const infoItems = card.querySelectorAll<HTMLElement>('ul li');
    for (let i = 0; i < infoItems.length; i++) {
      if (!this.isElementVisible(infoItems[i])) continue;
      const state = this.matcher.getDetectedStateFromElement(infoItems[i]);
      if (state) {
        return state;
      }
    }

    const descendantState = this.cardContainsDetectedStateInDescendants(
      card,
      '[aria-label], [title], span, small, div, p, time',
      100
    );
    if (descendantState) {
      return descendantState;
    }

    if (
      card.matches(
        'li.discovery-templates-entity-item, li[class*="discovery-templates-entity-item"]'
      )
    ) {
      return this.cardContainsDetectedStateInDescendants(card, '*', 140);
    }

    return null;
  }

  /** Anchor-based detection for viewed jobs */
  refreshDetectedAnchors(showHidden: boolean): IAnchorDetectionResult {
    let detectedAnchorCount = 0;
    const detectedAnchorCards = new Map<HTMLElement, TDetectedJobState>();

    if (!this.shouldUseAnchorDetection()) {
      this.restoreHiddenAnchors();
      return { detectedAnchorCount, detectedAnchorCards };
    }

    this.getPotentialViewedAnchors().forEach((node) => {
      const card = this.getCardFromAnchor(node);
      const scope = card || node.closest<HTMLElement>('li, article, div') || node;
      const hiddenByScript = node.getAttribute('data-lhvj-hidden-anchor') === '1';
      const detectedState =
        hiddenByScript && showHidden ? 'viewed' : this.getDetectedAnchorState(node, scope);

      if (detectedState) {
        detectedAnchorCount++;
        if (card) {
          this.setDetectedState(detectedAnchorCards, card, detectedState);
          this.applyVisibility(card, showHidden);
          this.applyDetectedHighlight(card, showHidden ? null : detectedState);
        }
      }

      if (detectedState || hiddenByScript) {
        this.applyAnchorVisibility(node, !!detectedState && showHidden);
      }
    });

    return { detectedAnchorCount, detectedAnchorCards };
  }

  /** Fallback marker-based detection */
  refreshDetectedCardsFallback(showHidden: boolean): Map<HTMLElement, TDetectedJobState> {
    const detectedCards = new Map<HTMLElement, TDetectedJobState>();
    if (!this.isJobsPage()) return detectedCards;

    document.querySelectorAll<HTMLElement>(MARKER_SELECTOR_JOINED).forEach((node) => {
      if (!this.isElementVisible(node)) return;
      const state = this.matcher.getDetectedStateFromElement(node);
      if (!state) return;
      const card = this.getCardFromViewedMarker(node);
      if (!card) return;

      this.setDetectedState(detectedCards, card, state);
      this.applyVisibility(card, showHidden);
      this.applyDetectedHighlight(card, showHidden ? null : state);
    });

    return detectedCards;
  }

  applyVisibility(card: HTMLElement, shouldHide: boolean): void {
    if (shouldHide) {
      card.classList.add(DOM_IDS.HIDDEN_CLASS);
      card.setAttribute('data-lhvj-hidden', '1');
    } else {
      card.classList.remove(DOM_IDS.HIDDEN_CLASS);
      card.removeAttribute('data-lhvj-hidden');
    }
  }

  applyDetectedHighlight(card: HTMLElement, state: TDetectedJobState | null): void {
    const { VIEWED_HIGHLIGHT_CLASS, APPLIED_HIGHLIGHT_CLASS } = DOM_IDS;

    card.classList.remove(VIEWED_HIGHLIGHT_CLASS, APPLIED_HIGHLIGHT_CLASS);
    card.removeAttribute('data-lhvj-viewed');
    card.removeAttribute('data-lhvj-applied');

    if (state === 'viewed') {
      card.classList.add(VIEWED_HIGHLIGHT_CLASS);
      card.setAttribute('data-lhvj-viewed', '1');
      return;
    }

    if (state === 'applied') {
      card.classList.add(APPLIED_HIGHLIGHT_CLASS);
      card.setAttribute('data-lhvj-applied', '1');
    }
  }

  getActiveCards(cards: Iterable<HTMLElement>): Set<HTMLElement> {
    const activeCards = new Set<HTMLElement>();
    const activeJobId = this.getPageCurrentJobId();

    if (!activeJobId) {
      return activeCards;
    }

    for (const card of cards) {
      if (this.cardContainsMatchingCurrentJobId(card, activeJobId)) {
        activeCards.add(card);
      }
    }

    return activeCards;
  }

  applyActiveHighlight(card: HTMLElement, isActive: boolean): void {
    if (isActive) {
      card.classList.add(DOM_IDS.ACTIVE_HIGHLIGHT_CLASS);
      card.setAttribute('data-lhvj-active', '1');
      return;
    }

    card.classList.remove(DOM_IDS.ACTIVE_HIGHLIGHT_CLASS);
    card.removeAttribute('data-lhvj-active');
  }

  isJobsPage(): boolean {
    return this.isJobsPath(location.pathname);
  }

  isElementVisible(el: HTMLElement): boolean {
    if (el.hasAttribute('hidden')) return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;

    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (parseFloat(style.opacity) === 0) return false;

    try {
      const rects = el.getClientRects();
      if (rects && rects.length === 0) return false;
    } catch {
      // Conservatively assume visible
    }

    return true;
  }

  // ── Private helpers ──────────────────────────────────────────────────

  private getCardFromNode(node: HTMLElement): HTMLElement | null {
    const card = node.closest<HTMLElement>(CARD_SELECTOR_JOINED);
    return card ?? null;
  }

  private getCardFromAnchor(node: HTMLElement): HTMLElement | null {
    const card = node.closest<HTMLElement>(CARD_SELECTOR_JOINED);
    if (card) return card;

    const fallback = node.closest<HTMLElement>(EXTENDED_CARD_SELECTOR);
    if (fallback) return fallback;

    if (
      node.matches(
        'a[href*="/jobs/view/"], a[href*="/jobs/collections/"], a[href*="currentJobId="]'
      )
    ) {
      return node;
    }

    return null;
  }

  private getCardFromViewedMarker(node: HTMLElement): HTMLElement | null {
    return node.closest<HTMLElement>(EXTENDED_CARD_SELECTOR) ?? null;
  }

  private isJobsRootPath(pathname: string): boolean {
    return pathname === '/jobs' || pathname === '/jobs/';
  }

  private isJobsSubPath(pathname: string): boolean {
    return pathname.startsWith('/jobs/');
  }

  private isJobsPath(pathname: string): boolean {
    return (
      this.isJobsRootPath(pathname) || this.isJobsSubPath(pathname) || pathname.includes('/jobs')
    );
  }

  private shouldUseAnchorDetection(): boolean {
    return this.isJobsPath(location.pathname);
  }

  private restoreHiddenAnchors(): void {
    document.querySelectorAll<HTMLElement>('a[data-lhvj-hidden-anchor="1"]').forEach((node) => {
      this.applyAnchorVisibility(node, false);
    });
  }

  private getPotentialViewedAnchors(): HTMLElement[] {
    const anchorSet = new Set<HTMLElement>();

    document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((node) => {
      const href = node.getAttribute('href') || '';
      if (
        href.includes('/jobs/view/') ||
        href.includes('/jobs/collections/') ||
        href.includes('/jobs/collections/recommended') ||
        href.includes('/jobs/search/') ||
        href.includes('currentJobId=') ||
        href.includes('trk=public_jobs')
      ) {
        anchorSet.add(node);
      }
    });

    document.querySelectorAll<HTMLElement>(ANCHOR_SELECTOR_JOINED).forEach((node) => {
      anchorSet.add(node);
    });

    document.querySelectorAll<HTMLElement>('a[data-lhvj-hidden-anchor="1"]').forEach((node) => {
      anchorSet.add(node);
    });

    return Array.from(anchorSet);
  }

  private getDetectedAnchorState(
    anchor: HTMLElement,
    scope: HTMLElement
  ): TDetectedJobState | null {
    if (!this.isElementVisible(anchor)) return null;
    const anchorState = this.matcher.getDetectedStateFromElement(anchor);
    if (anchorState) return anchorState;

    const descendants = anchor.querySelectorAll<HTMLElement>('[aria-label], [title]');
    for (let i = 0; i < descendants.length; i++) {
      if (!this.isElementVisible(descendants[i])) continue;
      const descendantState = this.matcher.getDetectedStateFromElement(descendants[i]);
      if (descendantState) {
        return descendantState;
      }
    }

    if (scope) {
      return this.getDetectedStateInScope(scope);
    }

    return null;
  }

  private getDetectedStateInScope(scope: HTMLElement): TDetectedJobState | null {
    const markerState = this.cardContainsDetectedStateInDescendants(
      scope,
      MARKER_SELECTOR_JOINED,
      24
    );
    if (markerState) return markerState;
    return this.cardContainsDetectedStateInDescendants(
      scope,
      '[aria-label], [title], span, small, p, time, li',
      80
    );
  }

  private cardContainsDetectedStateInDescendants(
    card: HTMLElement,
    selector: string,
    maxNodes: number
  ): TDetectedJobState | null {
    const nodes = card.querySelectorAll<HTMLElement>(selector);
    const limit = Math.min(nodes.length, maxNodes);
    for (let i = 0; i < limit; i++) {
      if (!this.isElementVisible(nodes[i])) continue;
      const state = this.matcher.getDetectedStateFromElement(nodes[i]);
      if (state === 'applied') {
        return state;
      }
      if (state === 'viewed') {
        return state;
      }
    }
    return null;
  }

  private setDetectedState(
    map: Map<HTMLElement, TDetectedJobState>,
    card: HTMLElement,
    state: TDetectedJobState
  ): void {
    const previous = map.get(card);
    if (previous === 'applied') return;
    if (state === 'applied' || !previous) {
      map.set(card, state);
    }
  }

  private applyAnchorVisibility(anchor: HTMLElement, shouldHide: boolean): void {
    if (shouldHide) {
      anchor.classList.add(DOM_IDS.HIDDEN_CLASS);
      anchor.setAttribute('data-lhvj-hidden-anchor', '1');
    } else {
      anchor.classList.remove(DOM_IDS.HIDDEN_CLASS);
      anchor.removeAttribute('data-lhvj-hidden-anchor');
    }
  }

  private getPageCurrentJobId(): string | null {
    const currentJobId = new URLSearchParams(location.search).get('currentJobId');
    if (!currentJobId || !/^\d+$/.test(currentJobId)) {
      return null;
    }

    return currentJobId;
  }

  private cardContainsMatchingCurrentJobId(card: HTMLElement, activeJobId: string): boolean {
    const anchors = card.matches('a[href]')
      ? [card as HTMLAnchorElement]
      : Array.from(card.querySelectorAll<HTMLAnchorElement>('a[href]'));

    for (let i = 0; i < anchors.length; i++) {
      if (this.hrefMatchesCurrentJobId(anchors[i].href, activeJobId)) {
        return true;
      }
    }

    return false;
  }

  private hrefMatchesCurrentJobId(href: string | null, activeJobId: string): boolean {
    if (!href) return false;

    try {
      const url = new URL(href, location.origin);
      return url.searchParams.get('currentJobId') === activeJobId;
    } catch {
      return false;
    }
  }
}
