// ==UserScript==
// @name         LinkedIn Hide Viewed Jobs
// @name:tr      LinkedIn Goruntulenen Ilanlari Gizle
// @name:es      LinkedIn Ocultar Empleos Vistos
// @name:de      LinkedIn Angesehene Jobs Ausblenden
// @name:fr      LinkedIn Masquer Les Offres Consultees
// @name:pt      LinkedIn Ocultar Vagas Visualizadas
// @name:it      LinkedIn Nascondi Annunci Visualizzati
// @name:ru      LinkedIn Скрыть Просмотренные Вакансии
// @name:ja      LinkedIn 閲覧済み求人を非表示
// @name:ko      LinkedIn 확인한 채용 공고 숨기기
// @name:zh-CN   LinkedIn 隐藏已查看职位
// @name:ar      لينكدإن إخفاء الوظائف التي تمت مشاهدتها
// @namespace    https://github.com/sametcn99
// @version      1.0.4
// @description  Hides viewed job cards on LinkedIn Jobs pages, adds a compact draggable badge, and lets you reveal hidden items anytime.
// @description:tr LinkedIn is sayfalarinda goruntulenen ilan kartlarini gizler, suruklenebilir kompakt bir badge ekler ve gizlenenleri istedigin zaman geri gostermenizi saglar.
// @description:es Oculta tarjetas de empleo vistas en LinkedIn Jobs, agrega una insignia compacta y arrastrable, y te permite mostrar los elementos ocultos cuando quieras.
// @description:de Blendet angesehene Jobkarten auf LinkedIn Jobs aus, fuegt ein kompaktes verschiebbares Badge hinzu und laesst dich ausgeblendete Eintraege jederzeit wieder anzeigen.
// @description:fr Masque les fiches d'emploi consultees sur LinkedIn Jobs, ajoute un badge compact deplacable et vous permet de reafficher les elements masques a tout moment.
// @description:pt Oculta cartoes de vagas visualizadas no LinkedIn Jobs, adiciona um selo compacto arrastavel e permite revelar itens ocultos a qualquer momento.
// @description:it Nasconde le schede delle offerte gia visualizzate su LinkedIn Jobs, aggiunge un badge compatto trascinabile e consente di mostrare di nuovo gli elementi nascosti in qualsiasi momento.
// @description:ru Скрывает просмотренные карточки вакансий в LinkedIn Jobs, добавляет компактный перетаскиваемый бейдж и позволяет в любой момент снова показать скрытые элементы.
// @description:ja LinkedIn Jobsで閲覧済みの求人カードを非表示にし、コンパクトでドラッグ可能なバッジを追加して、非表示項目をいつでも再表示できます。
// @description:ko LinkedIn Jobs 페이지에서 확인한 채용 카드들을 숨기고, 작고 드래그 가능한 배지를 추가하며, 숨긴 항목을 언제든 다시 표시할 수 있습니다.
// @description:zh-CN 在 LinkedIn 职位页面隐藏已查看职位卡片，添加可拖动的紧凑徽章，并可随时重新显示已隐藏项目。
// @description:ar يخفي بطاقات الوظائف التي تمت مشاهدتها في صفحات وظائف لينكدإن، ويضيف شارة مدمجة قابلة للسحب، ويتيح لك إظهار العناصر المخفية في أي وقت.
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

  // ── User-Configurable Settings ────────────────────────────────────────
  const CONFIG = Object.freeze({
    POLL_INTERVAL_MS: 2000,           // Fallback polling interval
    ROUTE_CHECK_INTERVAL_MS: 500,     // SPA route-change check interval
    ROUTE_BURST_INTERVAL_MS: 250,     // Post-navigation rapid refresh interval
    ROUTE_BURST_MAX_TICKS: 12,        // Max rapid-refresh cycles after navigation
    LAZY_RENDER_TIMEOUT_MS: 8000,     // Timeout for waiting on lazily-rendered cards
    MUTATION_DEBOUNCE_MS: 80,         // Min interval between MutationObserver refreshes
    UI_Z_INDEX: 99999,                // Badge z-index
    UI_EDGE_MARGIN: 8,                // Badge drag edge margin (px)
    ENABLE_HIGHLIGHT: true,           // Toggle viewed-card highlight feature
    HIGHLIGHT_COLOR: 'rgba(46, 204, 113, 0.95)',  // Viewed-card highlight color
    HIGHLIGHT_BORDER_RADIUS: '6px',   // Viewed-card highlight border-radius
  });
  // ─────────────────────────────────────────────────────────────────────

  const STORAGE_KEY = 'lhvj-show-hidden';
  const UI_POSITION_KEY = 'lhvj-ui-position';
  const HIDDEN_CLASS = 'lhvj-hidden-by-script';
  const UI_ID = 'lhvj-toggle-root';
  const VIEWED_HIGHLIGHT_CLASS = 'lhvj-viewed-highlight';
  const VIEWED_KEYWORDS = [
    // English
    'Viewed',
    'Seen',
    'Applied',

    // Turkish
    'Görüntülenen',
    'Görüntülendi',
    'Başvurulan',
    'Başvurulanlar',
    'Başvuruldu',

    // Spanish
    'Visto',
    'Vistos',
    'Aplicado',
    'Postulado',

    // Portuguese
    'Visualizado',
    'Visualizados',
    'Candidatado',
    'Candidatura',

    // French
    'Vu',
    'Vue',
    'Postulé',
    'Postulée',
    'Candidature',

    // German
    'Angesehen',
    'Gesehen',
    'Beworben',

    // Italian
    'Visualizzato',
    'Visto',
    'Candidata',
    'Candidati',
    'Candidatura',

    // Dutch
    'Bekeken',
    'Solliciteerd',

    // Russian
    'Просмотрено',
    'Откликнулся',

    // Polish
    'Wyświetlono',
    'Aplikowano',

    // Swedish
    'Visad',
    'Sedd',
    'Sökt',

    // Chinese (Simplified / Traditional)
    '已查看',
    '已申请',
    '已檢視',
    '已申請',

    // Japanese
    '閲覧済み',
    '応募済み',

    // Korean
    '조회됨',
    '지원함',
    '지원 완료',

    // Arabic
    'تمت المشاهدة',
    'تم التقديم',

    // Hindi
    'देखा गया',
    'आवेदन किया गया'
  ];
  const JOB_CARD_SELECTORS = [
    '[data-occludable-job-id]',
    'li[data-occludable-job-id]',
    'li.jobs-search-results__list-item',
    'li.scaffold-layout__list-item',
    'li.discovery-templates-entity-item',
    'li[class*="discovery-templates-entity-item"]',
    'article.job-search-card',
    'div.job-search-card',
    'div.base-card',
    'article.base-card',
    'li.jobs-collections-module__list-item',
    'div.jobs-collections-module__list-item',
    'li.jobs-collection__list-item',
    'div.jobs-collection__list-item',
    '.jobs-collections-module__job-card',
    '.jobs-collections-module__job-card-container'
  ];
  const VIEWED_MARKER_SELECTORS = [
    'li.job-card-container__footer-job-state',
    'li[class*="footer-job-state"]',
    '.job-card-container__footer-wrapper li',
    '[class*="job-card-footer"]',
    '[class*="job-state"]',
    '[data-jobstate]',
    '[data-viewed="true"]',
    'span.job-card-list__footer'
  ];
  const POTENTIAL_VIEWED_ANCHOR_SELECTORS = [
    'a[href*="/jobs/view/"]',
    'a[href*="/jobs/collections/"]',
    'a[href*="/jobs/search/"]',
    'a[href*="currentJobId="]',
    'a[href*="trk=public_jobs"]',
    'a.job-card-container__link',
    'a[data-control-name*="job"]',
    'a[class*="job-card"]',
    'a.base-card__full-link',
    'a.jobs-collection-card__link',
    'a.jobs-collections-module__link'
  ];

  // Pre-joined selector strings (avoids re-joining on every call)
  const CARD_SELECTOR_JOINED = JOB_CARD_SELECTORS.join(',');
  const MARKER_SELECTOR_JOINED = VIEWED_MARKER_SELECTORS.join(',');
  const ANCHOR_SELECTOR_JOINED = POTENTIAL_VIEWED_ANCHOR_SELECTORS.join(',');

  let showHidden = false;
  let hiddenCount = 0;
  let rafId = 0;
  let isDragging = false;
  let routeRefreshBurstId = 0;
  let routeCheckIntervalId = 0;
  let pollIntervalId = 0;
  let domObserver = null;
  let domMutationTimerId = 0;
  let isRuntimeActive = false;
  let isReloadingForPathChange = false;
  let lastRouteChangeAt = Date.now();
  const delayedRefreshTimers = new Map();
  const uiState = {
    root: null,
    countNum: null,
    countUnit: null,
    stateEl: null
  };

  function onWindowResize() {
    syncUiPositionWithinViewport();
  }

  function getStorageItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function setStorageItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Ignore quota/privacy failures to keep script behavior stable.
    }
  }

  showHidden = getStorageItem(STORAGE_KEY) === '1';

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
      '  z-index: ' + CONFIG.UI_Z_INDEX + ';',
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
      `.${VIEWED_HIGHLIGHT_CLASS} {`,
      '  box-shadow: inset 0 0 0 2px ' + CONFIG.HIGHLIGHT_COLOR + ' !important;',
      '  outline: 2px solid ' + CONFIG.HIGHLIGHT_COLOR + ' !important;',
      '  outline-offset: -2px !important;',
      '  border-radius: ' + CONFIG.HIGHLIGHT_BORDER_RADIUS + ' !important;',
      '  background-color: rgba(46, 204, 113, 0.06) !important;',
      '}',
      `.${VIEWED_HIGHLIGHT_CLASS} .job-card-container,`,
      `.${VIEWED_HIGHLIGHT_CLASS}[class*="job-card"],`,
      `.${VIEWED_HIGHLIGHT_CLASS} > div {`,
      '  box-shadow: inset 0 0 0 2px ' + CONFIG.HIGHLIGHT_COLOR + ' !important;',
      '  border-radius: ' + CONFIG.HIGHLIGHT_BORDER_RADIUS + ' !important;',
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
      const raw = getStorageItem(UI_POSITION_KEY);
      if (!raw) {
        return null;
      }

      const pos = JSON.parse(raw);
      if (
        !pos ||
        typeof pos.left !== 'number' ||
        typeof pos.top !== 'number' ||
        !Number.isFinite(pos.left) ||
        !Number.isFinite(pos.top)
      ) {
        return null;
      }

      // Return a clean object to avoid prototype-pollution from tampered localStorage
      return { left: pos.left, top: pos.top };
    } catch (error) {
      return null;
    }
  }

  function clampUiPosition(left, top, root) {
    const margin = CONFIG.UI_EDGE_MARGIN;
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
      setStorageItem(UI_POSITION_KEY, JSON.stringify(clamped));
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
    if (uiState.root && document.body.contains(uiState.root)) {
      return uiState.root;
    }

    let root = document.getElementById(UI_ID);
    if (root) {
      uiState.root = root;
      uiState.countNum = root.querySelector('.lhvj-count-num');
      uiState.countUnit = root.querySelector('.lhvj-count-unit');
      uiState.stateEl = root.querySelector('.lhvj-state');
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
      setStorageItem(STORAGE_KEY, showHidden ? '1' : '0');
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

    uiState.root = root;
    uiState.countNum = countNum;
    uiState.countUnit = countUnit;
    uiState.stateEl = stateEl;

    return root;
  }

  function updateUiCount() {
    const root = ensureUi();
    const countNum = uiState.countNum;
    const countUnit = uiState.countUnit;
    const stateEl = uiState.stateEl;
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

    // Single combined query; [data-occludable-job-id] is already in CARD_SELECTOR_JOINED.
    document.querySelectorAll(CARD_SELECTOR_JOINED).forEach(function (node) {
      if (node instanceof HTMLElement) {
        cardSet.add(node);
      }
    });

    return Array.from(cardSet);
  }

  function getCardFromNode(node) {
    if (!(node instanceof HTMLElement)) {
      return null;
    }

    const card = node.closest(CARD_SELECTOR_JOINED);
    return card instanceof HTMLElement ? card : null;
  }

  function getViewedCardsFromMarkers() {
    const viewedCards = new Set();

    document.querySelectorAll(MARKER_SELECTOR_JOINED).forEach(function (node) {
      if (!(node instanceof HTMLElement) || !isElementVisible(node) || !hasViewedText(node)) {
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

  // Pre-compute normalized keywords once and match each item one by one.
  const NORMALIZED_KEYWORDS = VIEWED_KEYWORDS
    .map(normalizeForMatch)
    .filter(function (keyword) {
      return keyword.length > 0;
    });

  function isAsciiLetterOrNumber(ch) {
    if (!ch) {
      return false;
    }

    const code = ch.charCodeAt(0);
    return (
      (code >= 48 && code <= 57) ||
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122)
    );
  }

  function hasBoundary(text, start, keywordLength) {
    const before = start > 0 ? text[start - 1] : '';
    const afterIndex = start + keywordLength;
    const after = afterIndex < text.length ? text[afterIndex] : '';

    return !isAsciiLetterOrNumber(before) && !isAsciiLetterOrNumber(after);
  }

  function containsKeywordExactly(text, keyword) {
    let fromIndex = 0;

    while (fromIndex < text.length) {
      const index = text.indexOf(keyword, fromIndex);
      if (index === -1) {
        return false;
      }

      if (hasBoundary(text, index, keyword.length)) {
        return true;
      }

      fromIndex = index + 1;
    }

    return false;
  }

  // Return true when an element is actually rendered/visible to users.
  // This prevents the script from matching keywords inside visually-hidden elements
  // (e.g. aria-hidden, display:none, visibility:hidden, opacity:0, or no client rects).
  function isElementVisible(el) {
    if (!(el instanceof HTMLElement)) {
      return false;
    }

    if (el.hasAttribute('hidden')) {
      return false;
    }

    const ariaHidden = el.getAttribute('aria-hidden');
    if (ariaHidden === 'true') {
      return false;
    }

    const style = window.getComputedStyle(el);
    if (style) {
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }

      if (parseFloat(style.opacity) === 0) {
        return false;
      }
    }

    try {
      const rects = el.getClientRects();
      if (rects && rects.length === 0) {
        return false;
      }
    } catch (e) {
      // Some nodes may throw; conservatively assume visible in that case.
    }

    return true;
  }

  function hasViewedKeyword(text) {
    const normalized = normalizeForMatch(text);
    if (!normalized) {
      return false;
    }

    for (let i = 0; i < NORMALIZED_KEYWORDS.length; i += 1) {
      const keyword = NORMALIZED_KEYWORDS[i];
      if (containsKeywordExactly(normalized, keyword)) {
        return true;
      }
    }

    return false;
  }

  // Check text content, aria-label, and title of an element for viewed keywords.
  function hasViewedText(el) {
    if (!(el instanceof HTMLElement)) {
      return false;
    }
    const text = (el.textContent || '').trim();
    const aria = el.getAttribute('aria-label') || '';
    const title = el.getAttribute('title') || '';
    return hasViewedKeyword(text) || hasViewedKeyword(aria) || hasViewedKeyword(title);
  }

  function cardContainsViewedInDescendants(card, selector, maxNodes) {
    const nodes = card.querySelectorAll(selector);
    const limit = Math.min(nodes.length, maxNodes);

    for (let i = 0; i < limit; i += 1) {
      if (isElementVisible(nodes[i]) && hasViewedText(nodes[i])) {
        return true;
      }
    }

    return false;
  }

  function isViewedJobCard(card) {
    if (hasViewedKeyword(card.className || '')) {
      return true;
    }

    if (hasViewedText(card)) {
      return true;
    }

    // LinkedIn metadata chips: li items inside nested ul blocks.
    const infoItems = card.querySelectorAll('ul li');
    for (let i = 0; i < infoItems.length; i += 1) {
      if (isElementVisible(infoItems[i]) && hasViewedText(infoItems[i])) {
        return true;
      }
    }

    // Sub-elements with semantic or visible text content.
    if (cardContainsViewedInDescendants(card, '[aria-label], [title], span, small, div, p, time', 100)) {
      return true;
    }

    // Discovery template cards may render state text on deeply nested children.
    if (card.matches('li.discovery-templates-entity-item, li[class*="discovery-templates-entity-item"]')) {
      if (cardContainsViewedInDescendants(card, '*', 140)) {
        return true;
      }
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

  function applyViewedHighlight(card, shouldHighlight) {
    if (!CONFIG.ENABLE_HIGHLIGHT) {
      card.classList.remove(VIEWED_HIGHLIGHT_CLASS);
      card.removeAttribute('data-lhvj-viewed');
      return;
    }

    if (shouldHighlight) {
      card.classList.add(VIEWED_HIGHLIGHT_CLASS);
      card.setAttribute('data-lhvj-viewed', '1');
    } else {
      card.classList.remove(VIEWED_HIGHLIGHT_CLASS);
      card.removeAttribute('data-lhvj-viewed');
    }
  }

  function hasViewedStateInScope(scope) {
    if (!(scope instanceof HTMLElement)) {
      return false;
    }

    if (cardContainsViewedInDescendants(scope, MARKER_SELECTOR_JOINED, 24)) {
      return true;
    }

    // Fallback for home feed variants where viewed state is rendered outside marker list items.
    return cardContainsViewedInDescendants(scope, '[aria-label], [title], span, small, p, time, li', 80);
  }

  function isViewedAnchor(anchor, scope) {
    if (!isElementVisible(anchor)) {
      return false;
    }

    if (hasViewedText(anchor)) {
      return true;
    }

    const descendants = anchor.querySelectorAll('[aria-label], [title]');
    for (let i = 0; i < descendants.length; i += 1) {
      if (isElementVisible(descendants[i]) && hasViewedText(descendants[i])) {
        return true;
      }
    }

    if (scope && hasViewedStateInScope(scope)) {
      return true;
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

  function isJobsRootPath(pathname) {
    return pathname === '/jobs' || pathname === '/jobs/';
  }

  function isJobsSubPath(pathname) {
    return pathname.indexOf('/jobs/') === 0;
  }

  function isJobsPath(pathname) {
    // Fallback: treat any pathname containing '/jobs' as a jobs page to survive UI path tweaks.
    return isJobsRootPath(pathname) || isJobsSubPath(pathname) || pathname.indexOf('/jobs') !== -1;
  }

  function shouldUseAnchorDetection() {
    // Enable anchor detection on /jobs and all nested routes.
    return isJobsPath(location.pathname);
  }

  function restoreHiddenAnchors() {
    document.querySelectorAll('a[data-lhvj-hidden-anchor="1"]').forEach(function (node) {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      applyAnchorVisibility(node, false);
    });
  }

  function getPotentialViewedAnchors() {
    const anchorSet = new Set();

    // Route transitions can swap class names; rely on href patterns as a stable fallback.
    document.querySelectorAll('a[href]').forEach(function (node) {
      if (!(node instanceof HTMLAnchorElement)) {
        return;
      }

      const href = node.getAttribute('href') || '';
      if (
        href.indexOf('/jobs/view/') !== -1 ||
        href.indexOf('/jobs/collections/') !== -1 ||
        href.indexOf('/jobs/collections/recommended') !== -1 ||
        href.indexOf('/jobs/search/') !== -1 ||
        href.indexOf('currentJobId=') !== -1 ||
        href.indexOf('trk=public_jobs') !== -1
      ) {
        anchorSet.add(node);
      }
    });

    // Keep explicit selectors as an additional signal for legacy layouts.
    document.querySelectorAll(ANCHOR_SELECTOR_JOINED).forEach(function (node) {
      if (node instanceof HTMLElement) {
        anchorSet.add(node);
      }
    });

    // Keep previously hidden anchors in scope so stale states can be restored reliably.
    document.querySelectorAll('a[data-lhvj-hidden-anchor="1"]').forEach(function (node) {
      if (node instanceof HTMLElement) {
        anchorSet.add(node);
      }
    });

    return Array.from(anchorSet);
  }

  function getCardFromAnchor(node) {
    if (!(node instanceof HTMLElement)) {
      return null;
    }

    const card = node.closest(CARD_SELECTOR_JOINED);
    if (card instanceof HTMLElement) {
      return card;
    }

    const fallbackCard = node.closest(
      '[data-occludable-job-id], [data-job-id], li.scaffold-layout__list-item, li.jobs-search-results__list-item, li[class*="jobs-search-results"], li[class*="job-card"], div[class*="job-card"], article[class*="job"], .job-card-container, .job-card-list, li.jobs-collections-module__list-item, div.jobs-collections-module__list-item, .jobs-collections-module__job-card, .jobs-collections-module__job-card-container'
    );

    if (fallbackCard instanceof HTMLElement) {
      return fallbackCard;
    }

    // Some /jobs views can expose anchor-based cards without list-item wrappers.
    if (node.matches('a[href*="/jobs/view/"], a[href*="/jobs/collections/"], a[href*="currentJobId="]')) {
      return node;
    }

    return null;
  }

  function refreshViewedAnchors() {
    let viewedAnchorCount = 0;
    const viewedAnchorCards = new Set();

    // Anchor-based detection is enabled on /jobs and all /jobs/* routes.
    if (!shouldUseAnchorDetection()) {
      restoreHiddenAnchors();
      return {
        viewedAnchorCount: viewedAnchorCount,
        viewedAnchorCards: viewedAnchorCards
      };
    }

    getPotentialViewedAnchors().forEach(function (node) {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      const card = getCardFromAnchor(node);
      const scope = card || node.closest('li, article, div') || node;
      const hiddenByScript = node.getAttribute('data-lhvj-hidden-anchor') === '1';
      // Keep hidden anchors sticky while hide mode is ON to avoid hide/show flip loops.
      const viewed = hiddenByScript && showHidden ? true : isViewedAnchor(node, scope);

      if (viewed) {
        viewedAnchorCount += 1;
        if (card) {
          viewedAnchorCards.add(card);
          applyVisibility(card, showHidden);
          applyViewedHighlight(card, !showHidden);
        }
      }

      if (viewed || hiddenByScript) {
        applyAnchorVisibility(node, viewed && showHidden);
      }
    });

    return {
      viewedAnchorCount: viewedAnchorCount,
      viewedAnchorCards: viewedAnchorCards
    };
  }

  function getCardFromViewedMarker(node) {
    if (!(node instanceof HTMLElement)) {
      return null;
    }

    const card = node.closest(
      CARD_SELECTOR_JOINED +
      ', [data-job-id], .job-card-container, .job-card-list, .base-card, .job-search-card,' +
      ' li[class*="jobs-search"], li[class*="job-card"], div[class*="job-card"], article[class*="job"], article[class*="base-card"], .jobs-collections-module__job-card, .jobs-collections-module__job-card-container, li.jobs-collections-module__list-item, div.jobs-collections-module__list-item'
    );

    return card instanceof HTMLElement ? card : null;
  }

  function refreshJobsViewedCardsFallback() {
    const viewedCardsFromFallback = new Set();

    if (!isJobsPage()) {
      return viewedCardsFromFallback;
    }

    document.querySelectorAll(MARKER_SELECTOR_JOINED).forEach(function (node) {
      if (!(node instanceof HTMLElement) || !isElementVisible(node) || !hasViewedText(node)) {
        return;
      }

      const card = getCardFromViewedMarker(node);
      if (!card) {
        return;
      }

      viewedCardsFromFallback.add(card);
      applyVisibility(card, showHidden);
      applyViewedHighlight(card, !showHidden);
    });

    return viewedCardsFromFallback;
  }

  function isJobsPage() {
    return isJobsPath(location.pathname);
  }

  function removeUi() {
    const root = document.getElementById(UI_ID);
    if (root) {
      root.remove();
    }

    uiState.root = null;
    uiState.countNum = null;
    uiState.countUnit = null;
    uiState.stateEl = null;
  }

  function queueRefresh(delayMs) {
    if (delayedRefreshTimers.has(delayMs)) {
      return;
    }

    const timerId = setTimeout(function () {
      delayedRefreshTimers.delete(delayMs);
      scheduleRefresh();
    }, delayMs);

    delayedRefreshTimers.set(delayMs, timerId);
  }

  function clearDelayedRefreshTimers() {
    delayedRefreshTimers.forEach(function (timerId) {
      clearTimeout(timerId);
    });

    delayedRefreshTimers.clear();
  }

  function clearRouteRefreshBurst() {
    if (!routeRefreshBurstId) {
      return;
    }

    clearInterval(routeRefreshBurstId);
    routeRefreshBurstId = 0;
  }

  function resetScriptAppliedStates() {
    document.querySelectorAll('[data-lhvj-hidden="1"]').forEach(function (node) {
      if (node instanceof HTMLElement) {
        applyVisibility(node, false);
      }
    });

    document.querySelectorAll('a[data-lhvj-hidden-anchor="1"]').forEach(function (node) {
      if (node instanceof HTMLElement) {
        applyAnchorVisibility(node, false);
      }
    });

    document.querySelectorAll('[data-lhvj-viewed="1"]').forEach(function (node) {
      if (node instanceof HTMLElement) {
        applyViewedHighlight(node, false);
      }
    });
  }

  function stopDomObserver() {
    if (domMutationTimerId) {
      clearTimeout(domMutationTimerId);
      domMutationTimerId = 0;
    }

    if (domObserver) {
      domObserver.disconnect();
      domObserver = null;
    }
  }

  function stopRuntime() {
    if (!isRuntimeActive) {
      return;
    }

    // Cancel all pending work before tearing down DOM state.
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    clearRouteRefreshBurst();
    clearDelayedRefreshTimers();
    stopDomObserver();

    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = 0;
    }

    window.removeEventListener('resize', onWindowResize);

    resetScriptAppliedStates();

    hiddenCount = 0;
    removeUi();
    isRuntimeActive = false;
  }

  function startRuntime() {
    if (isRuntimeActive) {
      return;
    }

    lastRouteChangeAt = Date.now();

    observeDomChanges();
    scheduleRefresh();
    queueRefresh(120);
    queueRefresh(420);

    // Fallback polling for UI states updated without structural mutations.
    pollIntervalId = setInterval(function () {
      scheduleRefresh();
    }, CONFIG.POLL_INTERVAL_MS);

    window.addEventListener('resize', onWindowResize);
    isRuntimeActive = true;

    if (isJobsPage()) {
      startRouteRefreshBurst();
    }
  }

  function hardRestartRuntimeForPathChange() {
    if (isReloadingForPathChange) {
      return;
    }

    // Force a full document reload so the userscript engine re-injects from scratch.
    isReloadingForPathChange = true;
    window.location.reload();
  }

  function startRouteRefreshBurst() {
    let ticks = 0;

    clearRouteRefreshBurst();

    // LinkedIn can populate cards progressively after navigation.
    routeRefreshBurstId = setInterval(function () {
      ticks += 1;
      scheduleRefresh();

      if (ticks >= CONFIG.ROUTE_BURST_MAX_TICKS || !isJobsPage()) {
        clearInterval(routeRefreshBurstId);
        routeRefreshBurstId = 0;
      }
    }, CONFIG.ROUTE_BURST_INTERVAL_MS);
  }

  function refresh() {
    if (!isJobsPage()) {
      hiddenCount = 0;
      removeUi();
      return;
    }

    const cards = getJobCards();

    // Retry briefly after navigation because LinkedIn can render cards lazily.
    if (cards.length === 0 && Date.now() - lastRouteChangeAt < CONFIG.LAZY_RENDER_TIMEOUT_MS) {
      queueRefresh(180);
      queueRefresh(600);
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
      // When UI toggle is OFF, mark detected viewed cards with a subtle green inset border.
      applyViewedHighlight(card, viewed && !showHidden);
    });

    const viewedAnchorResult = refreshViewedAnchors();
    const viewedAnchorCount = viewedAnchorResult.viewedAnchorCount;
    const viewedCardsFallback = refreshJobsViewedCardsFallback();
    const finalViewedCards = new Set(viewedCards);

    viewedAnchorResult.viewedAnchorCards.forEach(function (card) {
      finalViewedCards.add(card);
    });

    viewedCardsFallback.forEach(function (card) {
      finalViewedCards.add(card);
    });

    // Clean up stale card states on cards detected in earlier passes.
    document.querySelectorAll('[data-lhvj-hidden="1"]').forEach(function (node) {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      const stillViewed = finalViewedCards.has(node);
      if (!showHidden || !stillViewed) {
        applyVisibility(node, false);
      }
    });

    document.querySelectorAll('[data-lhvj-viewed="1"]').forEach(function (node) {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      const stillViewed = finalViewedCards.has(node);
      if (!stillViewed || showHidden) {
        applyViewedHighlight(node, false);
      }
    });

    // On some /jobs routes, viewed state can be present in anchors or fallback markers
    // even when default card markers are missing.
    // Keep the larger count so the badge stays in sync with what is actually hidden/viewed.
    hiddenCount = Math.max(hiddenCount, viewedAnchorCount, viewedCardsFallback.size);

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
    stopDomObserver();

    domObserver = new MutationObserver(function () {
      if (domMutationTimerId) {
        return;
      }

      domMutationTimerId = setTimeout(function () {
        domMutationTimerId = 0;
        scheduleRefresh();
      }, CONFIG.MUTATION_DEBOUNCE_MS);
    });

    if (!document.body) {
      return;
    }

    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
  }

  function wrapHistoryMethod(methodName, onLocationMaybeChanged) {
    const originalMethod = history[methodName];
    if (typeof originalMethod !== 'function') {
      return;
    }

    history[methodName] = function () {
      const result = originalMethod.apply(this, arguments);
      onLocationMaybeChanged();
      return result;
    };
  }

  function observeRouteChanges() {
    let lastUrl = location.href;
    let lastPathname = location.pathname;

    function onLocationMaybeChanged() {
      const currentUrl = location.href;
      const currentPathname = location.pathname;
      if (currentUrl === lastUrl) {
        return;
      }

      lastUrl = currentUrl;
      const pathChanged = currentPathname !== lastPathname;
      if (pathChanged) {
        lastPathname = currentPathname;
        hardRestartRuntimeForPathChange();
        return;
      }

      lastRouteChangeAt = Date.now();

      // LinkedIn often paints list items after route change callbacks.
      scheduleRefresh();
      queueRefresh(120);
      queueRefresh(420);

      if (isJobsPage()) {
        startRouteRefreshBurst();
      }
    }

    wrapHistoryMethod('pushState', onLocationMaybeChanged);
    wrapHistoryMethod('replaceState', onLocationMaybeChanged);

    window.addEventListener('popstate', onLocationMaybeChanged);
    window.addEventListener('hashchange', onLocationMaybeChanged);

    // Fallback: catches router updates that do not fire history events reliably.
    routeCheckIntervalId = setInterval(onLocationMaybeChanged, CONFIG.ROUTE_CHECK_INTERVAL_MS);
  }

  function init() {
    injectStyles();
    startRuntime();
    observeRouteChanges();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
