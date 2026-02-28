// ==UserScript==
// @name         LinkedIn Hide Viewed Jobs
// @name:tr      LinkedIn Goruntulenen Ilanlari Gizle
// @namespace    https://github.com/sametcn99
// @version      1.0.1
// @description  Hides viewed job cards on LinkedIn Jobs pages, adds a compact draggable badge, and lets you reveal hidden items anytime.
// @description:tr LinkedIn is sayfalarinda goruntulenen ilan kartlarini gizler, suruklenebilir kompakt bir badge ekler ve gizlenenleri istedigin zaman geri gostermenizi saglar.
// @source       https://github.com/sametcn99/linkedin-hide-viewed-jobs
// @website      https://github.com/sametcn99/linkedin-hide-viewed-jobs
// @author       sametcn99
// @copyright    2026, sametcn99
// @license      MIT
// @homepageURL  https://github.com/sametcn99/linkedin-hide-viewed-jobs
// @supportURL   https://github.com/sametcn99/linkedin-hide-viewed-jobs/issues
// @downloadURL  https://raw.githubusercontent.com/sametcn99/linkedin-hide-viewed-jobs/main/linkedin-hide-viewed-jobs.user.js
// @updateURL    https://raw.githubusercontent.com/sametcn99/linkedin-hide-viewed-jobs/main/linkedin-hide-viewed-jobs.user.js
// @icon         https://www.linkedin.com/favicon.ico
// @icon64       https://www.linkedin.com/favicon.ico
// @match        https://www.linkedin.com/*
// @compatible   chrome Violentmonkey/Tampermonkey
// @compatible   edge Violentmonkey/Tampermonkey
// @compatible   firefox Violentmonkey/Tampermonkey
// @tag          linkedin
// @tag          jobs
// @tag          productivity
// @tag          userscript
// @tag          ui
// @tag          filtering
// @tag          linkedin-jobs
// @homepage     https://github.com/sametcn99/linkedin-hide-viewed-jobs
// @run-at       document-idle
// @grant        none
// @inject-into  content
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'lhvj-show-hidden';
  const UI_POSITION_KEY = 'lhvj-ui-position';
  const HIDDEN_CLASS = 'lhvj-hidden-by-script';
  const UI_ID = 'lhvj-toggle-root';
  const VIEWED_KEYWORDS = [
    'Viewed',
    'Görüntülenen',
    'Görüntülendi',
    'Applied',
    'Başvurulan',
    'Başvurulanlar',
  ];
  const JOB_CARD_SELECTORS = [
    '[data-occludable-job-id]',
    'li[data-occludable-job-id]',
    'li.jobs-search-results__list-item',
    'li.scaffold-layout__list-item'
  ];
  const VIEWED_MARKER_SELECTORS = [
    'li.job-card-container__footer-job-state',
    'li[class*="footer-job-state"]',
    '.job-card-container__footer-wrapper li'
  ];

  let showHidden = localStorage.getItem(STORAGE_KEY) === '1';
  let hiddenCount = 0;
  let rafId = 0;
  let isDragging = false;
  let routeRefreshBurstId = 0;
  let lastRouteChangeAt = Date.now();

  function injectStyles() {
    if (document.getElementById('lhvj-style')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'lhvj-style';
    style.textContent = [
      `.${HIDDEN_CLASS} { display: none !important; }`,
      `#${UI_ID} {`,
      '  position: fixed;',
      '  top: 76px;',
      '  right: 16px;',
      '  z-index: 99999;',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
      '  background: #1d2226;',
      '  border-radius: 999px;',
      '  border: 1px solid rgba(255, 255, 255, 0.15);',
      '  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);',
      '  display: inline-flex;',
      '  align-items: center;',
      '  height: 32px;',
      '  overflow: hidden;',
      '  user-select: none;',
      '  transition: box-shadow 0.15s ease;',
      '}',
      `#${UI_ID}:hover {`,
      '  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.35);',
      '}',
      `#${UI_ID}.lhvj-dragging {`,
      '  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);',
      '}',
      `#${UI_ID} .lhvj-drag-handle {`,
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  width: 28px;',
      '  height: 100%;',
      '  cursor: grab;',
      '  border-right: 1px solid rgba(255, 255, 255, 0.08);',
      '  color: #3d4449;',
      '  flex-shrink: 0;',
      '  transition: color 0.15s ease;',
      '}',
      `#${UI_ID} .lhvj-drag-handle:hover {`,
      '  color: #9aa4ae;',
      '}',
      `#${UI_ID} .lhvj-drag-handle::before {`,
      '  content: "";',
      '  display: block;',
      '  width: 8px;',
      '  height: 12px;',
      '  background: radial-gradient(circle, currentColor 1.2px, transparent 1.2px);',
      '  background-size: 4px 4px;',
      '}',
      `#${UI_ID} label {`,
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  padding: 0 10px 0 8px;',
      '  height: 100%;',
      '  cursor: pointer;',
      '}',
      `#${UI_ID} .lhvj-count {`,
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 3px;',
      '  white-space: nowrap;',
      '}',
      `#${UI_ID} .lhvj-count-num {`,
      '  font-size: 13px;',
      '  font-weight: 600;',
      '  line-height: 1;',
      '  color: #e7e9ea;',
      '}',
      `#${UI_ID} .lhvj-count-unit {`,
      '  font-size: 11px;',
      '  font-weight: 400;',
      '  line-height: 1;',
      '  color: #9aa4ae;',
      '}',
      `#${UI_ID} .lhvj-state {`,
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  min-width: 30px;',
      '  padding: 2px 7px;',
      '  border-radius: 999px;',
      '  font-size: 10px;',
      '  font-weight: 600;',
      '  letter-spacing: 0.3px;',
      '  line-height: 1;',
      '  text-align: center;',
      '  background: rgba(255, 255, 255, 0.1);',
      '  color: #c9d1d9;',
      '}',
      `#${UI_ID}[data-show-hidden="1"] .lhvj-state {`,
      '  background: rgba(112, 181, 249, 0.2);',
      '  color: #9fd0ff;',
      '}',
      `#${UI_ID} input[type="checkbox"] {`,
      '  appearance: none;',
      '  width: 0;',
      '  height: 0;',
      '  margin: 0;',
      '  padding: 0;',
      '  border-radius: 999px;',
      '  background: #4d5661;',
      '  position: absolute;',
      '  opacity: 0;',
      '  outline: none;',
      '  border: none;',
      '  transition: background 0.2s ease;',
      '  cursor: pointer;',
      '  pointer-events: none;',
      '  flex-shrink: 0;',
      '}',
      `#${UI_ID} input[type="checkbox"]::after {`,
      '  content: "";',
      '  width: 14px;',
      '  height: 14px;',
      '  border-radius: 50%;',
      '  background: #ffffff;',
      '  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);',
      '  position: absolute;',
      '  top: 2px;',
      '  left: 2px;',
      '  transition: transform 0.2s ease;',
      '}',
      `#${UI_ID} input[type="checkbox"]:checked {`,
      '  background: #70b5f9;',
      '}',
      `#${UI_ID} input[type="checkbox"]:checked::after {`,
      '  transform: translateX(14px);',
      '}',
      `#${UI_ID} input[type="checkbox"]:focus-visible {`,
      '  outline: 2px solid #70b5f9;',
      '  outline-offset: 2px;',
      '}',
      '@media (max-width: 900px) {',
      `  #${UI_ID} {`,
      '    top: 70px;',
      '    right: 8px;',
      '  }',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }

  function getSavedUiPosition() {
    try {
      const raw = localStorage.getItem(UI_POSITION_KEY);
      if (!raw) {
        return null;
      }

      const pos = JSON.parse(raw);
      if (
        !pos ||
        typeof pos.left !== 'number' ||
        typeof pos.top !== 'number' ||
        Number.isNaN(pos.left) ||
        Number.isNaN(pos.top)
      ) {
        return null;
      }

      return pos;
    } catch (error) {
      return null;
    }
  }

  function clampUiPosition(left, top, root) {
    const margin = 8;
    const maxLeft = Math.max(margin, window.innerWidth - root.offsetWidth - margin);
    const maxTop = Math.max(margin, window.innerHeight - root.offsetHeight - margin);

    return {
      left: Math.min(Math.max(left, margin), maxLeft),
      top: Math.min(Math.max(top, margin), maxTop)
    };
  }

  function applyUiPosition(root, left, top, save) {
    const clamped = clampUiPosition(left, top, root);
    root.style.left = `${clamped.left}px`;
    root.style.top = `${clamped.top}px`;
    root.style.right = 'auto';

    if (save) {
      localStorage.setItem(UI_POSITION_KEY, JSON.stringify(clamped));
    }
  }

  function syncUiPositionWithinViewport() {
    const root = document.getElementById(UI_ID);
    if (!root) {
      return;
    }

    const rect = root.getBoundingClientRect();
    applyUiPosition(root, rect.left, rect.top, true);
  }

  function makeUiDraggable(root, dragHandle) {
    let pointerId = null;
    let offsetX = 0;
    let offsetY = 0;

    dragHandle.addEventListener('pointerdown', function (event) {
      pointerId = event.pointerId;
      const rect = root.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      isDragging = true;
      root.classList.add('lhvj-dragging');
      dragHandle.setPointerCapture(pointerId);
      event.preventDefault();
    });

    dragHandle.addEventListener('pointermove', function (event) {
      if (!isDragging || pointerId !== event.pointerId) {
        return;
      }

      const nextLeft = event.clientX - offsetX;
      const nextTop = event.clientY - offsetY;
      applyUiPosition(root, nextLeft, nextTop, false);
      event.preventDefault();
    });

    function stopDrag(event) {
      if (!isDragging || pointerId !== event.pointerId) {
        return;
      }

      isDragging = false;
      root.classList.remove('lhvj-dragging');
      if (dragHandle.hasPointerCapture(pointerId)) {
        dragHandle.releasePointerCapture(pointerId);
      }

      const rect = root.getBoundingClientRect();
      applyUiPosition(root, rect.left, rect.top, true);
      pointerId = null;
      event.preventDefault();
    }

    dragHandle.addEventListener('pointerup', stopDrag);
    dragHandle.addEventListener('pointercancel', stopDrag);
  }

  function ensureUi() {
    let root = document.getElementById(UI_ID);
    if (root) {
      return root;
    }

    root = document.createElement('div');
    root.id = UI_ID;

    const dragHandle = document.createElement('span');
    dragHandle.className = 'lhvj-drag-handle';
    dragHandle.setAttribute('title', 'Drag to reposition');
    dragHandle.setAttribute('aria-label', 'Drag badge');

    const label = document.createElement('label');

    const countEl = document.createElement('span');
    countEl.className = 'lhvj-count';

    const countNum = document.createElement('span');
    countNum.className = 'lhvj-count-num';
    countNum.textContent = '0';

    const countUnit = document.createElement('span');
    countUnit.className = 'lhvj-count-unit';
    countUnit.textContent = showHidden ? 'hidden' : 'viewed';

    countEl.appendChild(countNum);
    countEl.appendChild(countUnit);

    const stateEl = document.createElement('span');
    stateEl.className = 'lhvj-state';
    stateEl.textContent = showHidden ? 'ON' : 'OFF';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = showHidden;
    checkbox.setAttribute('aria-label', 'Toggle hiding of viewed jobs');
    checkbox.addEventListener('change', function () {
      showHidden = checkbox.checked;
      localStorage.setItem(STORAGE_KEY, showHidden ? '1' : '0');
      scheduleRefresh();
    });

    label.appendChild(stateEl);
    label.appendChild(countEl);
    label.appendChild(checkbox);

    root.appendChild(dragHandle);
    root.appendChild(label);

    document.body.appendChild(root);

    const saved = getSavedUiPosition();
    if (saved) {
      applyUiPosition(root, saved.left, saved.top, false);
    }

    makeUiDraggable(root, dragHandle);

    return root;
  }

  function updateUiCount() {
    const root = ensureUi();
    const countNum = root.querySelector('.lhvj-count-num');
    const countUnit = root.querySelector('.lhvj-count-unit');
    const stateEl = root.querySelector('.lhvj-state');
    if (!countNum || !countUnit || !stateEl) {
      return;
    }

    root.setAttribute('data-show-hidden', showHidden ? '1' : '0');
    countNum.textContent = String(hiddenCount);
    countUnit.textContent = showHidden ? 'hidden' : 'viewed';
    stateEl.textContent = showHidden ? 'ON' : 'OFF';
  }

  function getJobCards() {
    const cardSet = new Set();

    JOB_CARD_SELECTORS.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (node) {
        if (node instanceof HTMLElement) {
          cardSet.add(node);
        }
      });
    });

    document.querySelectorAll('[data-occludable-job-id]').forEach(function (node) {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      const card = node.matches('[data-occludable-job-id]')
        ? node
        : node.closest('[data-occludable-job-id]');

      if (card) {
        cardSet.add(card);
      }
    });

    return Array.from(cardSet);
  }

  function getCardFromNode(node) {
    if (!(node instanceof HTMLElement)) {
      return null;
    }

    const card = node.closest(JOB_CARD_SELECTORS.join(','));
    return card instanceof HTMLElement ? card : null;
  }

  function getViewedCardsFromMarkers() {
    const viewedCards = new Set();
    const selector = VIEWED_MARKER_SELECTORS.join(',');

    document.querySelectorAll(selector).forEach(function (node) {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      const text = (node.textContent || '').trim();
      const aria = node.getAttribute('aria-label') || '';
      const title = node.getAttribute('title') || '';

      if (!(hasViewedKeyword(text) || hasViewedKeyword(aria) || hasViewedKeyword(title))) {
        return;
      }

      const card = getCardFromNode(node);
      if (card) {
        viewedCards.add(card);
      }
    });

    return viewedCards;
  }

  function normalizeForMatch(text) {
    return (text || '')
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function hasViewedKeyword(text) {
    const normalized = normalizeForMatch(text);
    return VIEWED_KEYWORDS.some(function (keyword) {
      return normalized.includes(normalizeForMatch(keyword));
    });
  }

  function isViewedJobCard(card) {
    const className = card.className || '';
    if (hasViewedKeyword(className)) {
      return true;
    }

    const cardAria = card.getAttribute('aria-label') || '';
    const cardTitle = card.getAttribute('title') || '';
    if (hasViewedKeyword(cardAria) || hasViewedKeyword(cardTitle)) {
      return true;
    }

    // LinkedIn metadata chips are commonly rendered as li items inside nested ul blocks.
    const infoItems = card.querySelectorAll('ul li');
    for (let i = 0; i < infoItems.length; i += 1) {
      const item = infoItems[i];
      const text = (item.textContent || '').trim();
      const aria = item.getAttribute('aria-label') || '';
      const title = item.getAttribute('title') || '';

      if (hasViewedKeyword(text) || hasViewedKeyword(aria) || hasViewedKeyword(title)) {
        return true;
      }
    }

    const subNodes = card.querySelectorAll('[aria-label], [title], span, small, div, p, time');
    for (let i = 0; i < subNodes.length; i += 1) {
      const item = subNodes[i];
      const text = (item.textContent || '').trim();
      const aria = item.getAttribute('aria-label') || '';
      const title = item.getAttribute('title') || '';

      if (hasViewedKeyword(text) || hasViewedKeyword(aria) || hasViewedKeyword(title)) {
        return true;
      }
    }

    if (hasViewedKeyword(card.textContent || '')) {
      return true;
    }

    return false;
  }

  function applyVisibility(card, shouldHide) {
    if (shouldHide) {
      card.classList.add(HIDDEN_CLASS);
      card.setAttribute('data-lhvj-hidden', '1');
    } else {
      card.classList.remove(HIDDEN_CLASS);
      card.removeAttribute('data-lhvj-hidden');
    }
  }

  function isViewedAnchor(anchor) {
    const text = (anchor.textContent || '').trim();
    const aria = anchor.getAttribute('aria-label') || '';
    const title = anchor.getAttribute('title') || '';

    if (hasViewedKeyword(text) || hasViewedKeyword(aria) || hasViewedKeyword(title)) {
      return true;
    }

    const descendants = anchor.querySelectorAll('[aria-label], [title]');
    for (let i = 0; i < descendants.length; i += 1) {
      const node = descendants[i];
      const childAria = node.getAttribute('aria-label') || '';
      const childTitle = node.getAttribute('title') || '';
      const childText = (node.textContent || '').trim();

      if (hasViewedKeyword(childText) || hasViewedKeyword(childAria) || hasViewedKeyword(childTitle)) {
        return true;
      }
    }

    return false;
  }

  function applyAnchorVisibility(anchor, shouldHide) {
    if (shouldHide) {
      anchor.classList.add(HIDDEN_CLASS);
      anchor.setAttribute('data-lhvj-hidden-anchor', '1');
    } else {
      anchor.classList.remove(HIDDEN_CLASS);
      anchor.removeAttribute('data-lhvj-hidden-anchor');
    }
  }

  function isJobsHomePage() {
    return location.pathname === '/jobs' || location.pathname === '/jobs/';
  }

  function restoreHiddenAnchors() {
    document.querySelectorAll('a[data-lhvj-hidden-anchor="1"]').forEach(function (node) {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      applyAnchorVisibility(node, false);
    });
  }

  function refreshViewedAnchors() {
    let viewedAnchorCount = 0;

    // Anchor-based keyword scan is intentionally limited to jobs home.
    if (!isJobsHomePage()) {
      restoreHiddenAnchors();
      return viewedAnchorCount;
    }

    document.querySelectorAll('a').forEach(function (node) {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      const viewed = isViewedAnchor(node);
      const hiddenByScript = node.getAttribute('data-lhvj-hidden-anchor') === '1';

      if (viewed) {
        viewedAnchorCount += 1;
      }

      if (viewed || hiddenByScript) {
        applyAnchorVisibility(node, viewed && showHidden);
      }
    });

    return viewedAnchorCount;
  }

  function getHomeCardFromViewedMarker(node) {
    if (!(node instanceof HTMLElement)) {
      return null;
    }

    const card = node.closest('[data-occludable-job-id], li.scaffold-layout__list-item, .job-card-container, .job-card-list');
    return card instanceof HTMLElement ? card : null;
  }

  function refreshJobsHomeViewedCardsFallback() {
    const viewedHomeCards = new Set();

    if (!isJobsHomePage()) {
      return viewedHomeCards;
    }

    const selector = VIEWED_MARKER_SELECTORS.join(',');
    document.querySelectorAll(selector).forEach(function (node) {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      const text = (node.textContent || '').trim();
      const aria = node.getAttribute('aria-label') || '';
      const title = node.getAttribute('title') || '';
      if (!(hasViewedKeyword(text) || hasViewedKeyword(aria) || hasViewedKeyword(title))) {
        return;
      }

      const card = getHomeCardFromViewedMarker(node);
      if (!card) {
        return;
      }

      viewedHomeCards.add(card);
      applyVisibility(card, showHidden);
    });

    return viewedHomeCards;
  }

  function isJobsPath(pathname) {
    return pathname === '/jobs' || pathname.indexOf('/jobs/') === 0;
  }

  function isJobsPage() {
    return isJobsPath(location.pathname);
  }

  function removeUi() {
    const root = document.getElementById(UI_ID);
    if (root) {
      root.remove();
    }
  }

  function startRouteRefreshBurst() {
    let ticks = 0;

    if (routeRefreshBurstId) {
      clearInterval(routeRefreshBurstId);
      routeRefreshBurstId = 0;
    }

    // LinkedIn can populate cards progressively after navigation.
    routeRefreshBurstId = setInterval(function () {
      ticks += 1;
      scheduleRefresh();

      if (ticks >= 12 || !isJobsPage()) {
        clearInterval(routeRefreshBurstId);
        routeRefreshBurstId = 0;
      }
    }, 250);
  }

  function refresh() {
    if (!isJobsPage()) {
      hiddenCount = 0;
      removeUi();
      return;
    }

    const cards = getJobCards();

    // Retry briefly after navigation because LinkedIn can render cards lazily.
    if (cards.length === 0 && Date.now() - lastRouteChangeAt < 8000) {
      setTimeout(scheduleRefresh, 180);
      setTimeout(scheduleRefresh, 600);
    }

    const viewedCardsFromMarkers = getViewedCardsFromMarkers();
    const viewedCards = new Set(viewedCardsFromMarkers);

    // Fallback: if marker query misses some cards, run card-level scan.
    cards.forEach(function (card) {
      if (!viewedCards.has(card) && isViewedJobCard(card)) {
        viewedCards.add(card);
      }
    });

    hiddenCount = 0;

    cards.forEach(function (card) {
      const viewed = viewedCards.has(card);
      if (viewed) {
        hiddenCount += 1;
      }

      applyVisibility(card, viewed && showHidden);
    });

    const viewedAnchorCount = refreshViewedAnchors();
    const viewedHomeCardsFallback = refreshJobsHomeViewedCardsFallback();

    // On /jobs home, viewed state can be present in anchors even when card markers are missing.
    // Keep the larger count so the badge stays in sync with what is actually hidden/viewed.
    hiddenCount = Math.max(hiddenCount, viewedAnchorCount, viewedHomeCardsFallback.size);

    updateUiCount();
  }

  function scheduleRefresh() {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(function () {
      rafId = 0;
      refresh();
    });
  }

  function observeDomChanges() {
    const observer = new MutationObserver(function () {
      scheduleRefresh();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
  }

  function observeRouteChanges() {
    let lastUrl = location.href;

    function onLocationMaybeChanged() {
      const currentUrl = location.href;
      if (currentUrl === lastUrl) {
        return;
      }

      lastUrl = currentUrl;
      lastRouteChangeAt = Date.now();

      // LinkedIn often paints list items after route change callbacks.
      scheduleRefresh();
      setTimeout(scheduleRefresh, 120);
      setTimeout(scheduleRefresh, 420);

      if (isJobsPage()) {
        startRouteRefreshBurst();
      }
    }

    const originalPushState = history.pushState;
    history.pushState = function () {
      const result = originalPushState.apply(this, arguments);
      onLocationMaybeChanged();
      return result;
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function () {
      const result = originalReplaceState.apply(this, arguments);
      onLocationMaybeChanged();
      return result;
    };

    window.addEventListener('popstate', onLocationMaybeChanged);
    window.addEventListener('hashchange', onLocationMaybeChanged);

    // Fallback: catches router updates that do not fire history events reliably.
    setInterval(onLocationMaybeChanged, 500);
  }

  function init() {
    injectStyles();
    refresh();
    observeDomChanges();
    observeRouteChanges();

    // Fallback polling for UI states updated without structural mutations.
    setInterval(function () {
      scheduleRefresh();
    }, 2000);

    window.addEventListener('resize', function () {
      syncUiPositionWithinViewport();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
