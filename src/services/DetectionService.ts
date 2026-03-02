import type { IAnchorDetectionResult } from '../types';
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
  getViewedCardsFromMarkers(): Set<HTMLElement> {
    const viewedCards = new Set<HTMLElement>();
    document.querySelectorAll<HTMLElement>(MARKER_SELECTOR_JOINED).forEach((node) => {
      if (!this.isElementVisible(node) || !this.matcher.hasViewedText(node)) return;
      const card = this.getCardFromNode(node);
      if (card) viewedCards.add(card);
    });
    return viewedCards;
  }

  /** Full card-level scan for viewed status */
  isViewedJobCard(card: HTMLElement): boolean {
    if (this.matcher.hasViewedKeyword(card.className || '')) return true;
    if (this.matcher.hasViewedText(card)) return true;

    const infoItems = card.querySelectorAll<HTMLElement>('ul li');
    for (let i = 0; i < infoItems.length; i++) {
      if (this.isElementVisible(infoItems[i]) && this.matcher.hasViewedText(infoItems[i])) {
        return true;
      }
    }

    if (
      this.cardContainsViewedInDescendants(
        card,
        '[aria-label], [title], span, small, div, p, time',
        100
      )
    ) {
      return true;
    }

    if (
      card.matches(
        'li.discovery-templates-entity-item, li[class*="discovery-templates-entity-item"]'
      )
    ) {
      if (this.cardContainsViewedInDescendants(card, '*', 140)) return true;
    }

    return false;
  }

  /** Anchor-based detection for viewed jobs */
  refreshViewedAnchors(showHidden: boolean): IAnchorDetectionResult {
    let viewedAnchorCount = 0;
    const viewedAnchorCards = new Set<HTMLElement>();

    if (!this.shouldUseAnchorDetection()) {
      this.restoreHiddenAnchors();
      return { viewedAnchorCount, viewedAnchorCards };
    }

    this.getPotentialViewedAnchors().forEach((node) => {
      const card = this.getCardFromAnchor(node);
      const scope = card || node.closest<HTMLElement>('li, article, div') || node;
      const hiddenByScript = node.getAttribute('data-lhvj-hidden-anchor') === '1';
      const viewed = hiddenByScript && showHidden ? true : this.isViewedAnchor(node, scope);

      if (viewed) {
        viewedAnchorCount++;
        if (card) {
          viewedAnchorCards.add(card);
          this.applyVisibility(card, showHidden);
          this.applyViewedHighlight(card, !showHidden);
        }
      }

      if (viewed || hiddenByScript) {
        this.applyAnchorVisibility(node, viewed && showHidden);
      }
    });

    return { viewedAnchorCount, viewedAnchorCards };
  }

  /** Fallback marker-based detection */
  refreshJobsViewedCardsFallback(showHidden: boolean): Set<HTMLElement> {
    const viewedCards = new Set<HTMLElement>();
    if (!this.isJobsPage()) return viewedCards;

    document.querySelectorAll<HTMLElement>(MARKER_SELECTOR_JOINED).forEach((node) => {
      if (!this.isElementVisible(node) || !this.matcher.hasViewedText(node)) return;
      const card = this.getCardFromViewedMarker(node);
      if (!card) return;

      viewedCards.add(card);
      this.applyVisibility(card, showHidden);
      this.applyViewedHighlight(card, !showHidden);
    });

    return viewedCards;
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

  applyViewedHighlight(card: HTMLElement, shouldHighlight: boolean): void {
    const { VIEWED_HIGHLIGHT_CLASS } = DOM_IDS;
    if (shouldHighlight) {
      card.classList.add(VIEWED_HIGHLIGHT_CLASS);
      card.setAttribute('data-lhvj-viewed', '1');
    } else {
      card.classList.remove(VIEWED_HIGHLIGHT_CLASS);
      card.removeAttribute('data-lhvj-viewed');
    }
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

  private isViewedAnchor(anchor: HTMLElement, scope: HTMLElement): boolean {
    if (!this.isElementVisible(anchor)) return false;
    if (this.matcher.hasViewedText(anchor)) return true;

    const descendants = anchor.querySelectorAll<HTMLElement>('[aria-label], [title]');
    for (let i = 0; i < descendants.length; i++) {
      if (this.isElementVisible(descendants[i]) && this.matcher.hasViewedText(descendants[i])) {
        return true;
      }
    }

    if (scope && this.hasViewedStateInScope(scope)) return true;
    return false;
  }

  private hasViewedStateInScope(scope: HTMLElement): boolean {
    if (this.cardContainsViewedInDescendants(scope, MARKER_SELECTOR_JOINED, 24)) return true;
    return this.cardContainsViewedInDescendants(
      scope,
      '[aria-label], [title], span, small, p, time, li',
      80
    );
  }

  private cardContainsViewedInDescendants(
    card: HTMLElement,
    selector: string,
    maxNodes: number
  ): boolean {
    const nodes = card.querySelectorAll<HTMLElement>(selector);
    const limit = Math.min(nodes.length, maxNodes);
    for (let i = 0; i < limit; i++) {
      if (this.isElementVisible(nodes[i]) && this.matcher.hasViewedText(nodes[i])) {
        return true;
      }
    }
    return false;
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
}
