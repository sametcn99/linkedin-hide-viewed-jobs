// ==UserScript==
// @name               LinkedIn Hide Viewed Jobs
// @name:tr            LinkedIn Goruntulenen Ilanlari Gizle
// @name:es            LinkedIn Ocultar Empleos Vistos
// @name:de            LinkedIn Angesehene Jobs Ausblenden
// @name:fr            LinkedIn Masquer Les Offres Consultees
// @name:pt            LinkedIn Ocultar Vagas Visualizadas
// @name:it            LinkedIn Nascondi Annunci Visualizzati
// @name:ru            LinkedIn Скрыть Просмотренные Вакансии
// @name:ja            LinkedIn 閲覧済み求人を非表示
// @name:ko            LinkedIn 확인한 채용 공고 숨기기
// @name:zh-CN         LinkedIn 隐藏已查看职位
// @name:ar            لينكدإن إخفاء الوظائف التي تمت مشاهدتها
// @namespace          https://github.com/sametcn99
// @version            1.0.5
// @author             sametcn99
// @description        Hides viewed job cards on LinkedIn Jobs pages, adds a compact draggable badge, and lets you reveal hidden items anytime.
// @description:tr     LinkedIn is sayfalarinda goruntulenen ilan kartlarini gizler, suruklenebilir kompakt bir badge ekler ve gizlenenleri istedigin zaman geri gostermenizi saglar.
// @description:es     Oculta tarjetas de empleo vistas en LinkedIn Jobs, agrega una insignia compacta y arrastrable, y te permite mostrar los elementos ocultos cuando quieras.
// @description:de     Blendet angesehene Jobkarten auf LinkedIn Jobs aus, fuegt ein kompaktes verschiebbares Badge hinzu und laesst dich ausgeblendete Eintraege jederzeit wieder anzeigen.
// @description:fr     Masque les fiches d'emploi consultees sur LinkedIn Jobs, ajoute un badge compact deplacable et vous permet de reafficher les elements masques a tout moment.
// @description:pt     Oculta cartoes de vagas visualizadas no LinkedIn Jobs, adiciona um selo compacto arrastavel e permite revelar itens ocultos a qualquer momento.
// @description:it     Nasconde le schede delle offerte gia visualizzate su LinkedIn Jobs, aggiunge un badge compatto trascinabile e consente di mostrare di nuovo gli elementi nascosti in qualsiasi momento.
// @description:ru     Скрывает просмотренные карточки вакансий в LinkedIn Jobs, добавляет компактный перетаскиваемый бейдж и позволяет в любой момент снова показать скрытые элементы.
// @description:ja     LinkedIn Jobsで閲覧済みの求人カードを非表示にし、コンパクトでドラッグ可能なバッジを追加して、非表示項目をいつでも再表示できます。
// @description:ko     LinkedIn Jobs 페이지에서 확인한 채용 카드들을 숨기고, 작고 드래그 가능한 배지를 추가하며, 숨긴 항목을 언제든 다시 표시할 수 있습니다.
// @description:zh-CN  在 LinkedIn 职位页面隐藏已查看职位卡片，添加可拖动的紧凑徽章，并可随时重新显示已隐藏项目。
// @description:ar     يخفي بطاقات الوظائف التي تمت مشاهدتها في صفحات وظائف لينكدإن، ويضيف شارة مدمجة قابلة للسحب، ويتيح لك إظهار العناصر المخفية في أي وقت.
// @license            MIT
// @copyright          2026, sametcn99
// @icon               https://www.linkedin.com/favicon.ico
// @icon64             https://www.linkedin.com/favicon.ico
// @homepage           https://github.com/sametcn99/linkedin-hide-viewed-jobs
// @homepageURL        https://github.com/sametcn99/linkedin-hide-viewed-jobs
// @website            https://github.com/sametcn99/linkedin-hide-viewed-jobs
// @source             https://github.com/sametcn99/linkedin-hide-viewed-jobs
// @supportURL         https://github.com/sametcn99/linkedin-hide-viewed-jobs/issues
// @downloadURL        https://raw.githubusercontent.com/sametcn99/linkedin-hide-viewed-jobs/main/linkedin-hide-viewed-jobs.user.js
// @updateURL          https://raw.githubusercontent.com/sametcn99/linkedin-hide-viewed-jobs/main/linkedin-hide-viewed-jobs.user.js
// @match              https://www.linkedin.com/*
// @tag                linkedin
// @tag                jobs
// @tag                productivity
// @tag                userscript
// @tag                ui
// @tag                filtering
// @tag                linkedin-jobs
// @grant              none
// @inject-into        content
// @run-at             document-idle
// @compatible         chrome Violentmonkey/Tampermonkey
// @compatible         edge Violentmonkey/Tampermonkey
// @compatible         firefox Violentmonkey/Tampermonkey
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  const CONFIG = Object.freeze({
    POLL_INTERVAL_MS: 2e3,
    ROUTE_CHECK_INTERVAL_MS: 500,
    ROUTE_BURST_INTERVAL_MS: 250,
    ROUTE_BURST_MAX_TICKS: 12,
    LAZY_RENDER_TIMEOUT_MS: 8e3,
    MUTATION_DEBOUNCE_MS: 80,
    UI_Z_INDEX: 99999,
    UI_EDGE_MARGIN: 8,
    ENABLE_HIGHLIGHT: true,
    HIGHLIGHT_COLOR: "rgba(46, 204, 113, 0.95)",
    HIGHLIGHT_BORDER_RADIUS: "6px"
  });
  const DOM_IDS = Object.freeze({
    STORAGE_KEY: "lhvj-show-hidden",
    UI_POSITION_KEY: "lhvj-ui-position",
    HIDDEN_CLASS: "lhvj-hidden-by-script",
    UI_ID: "lhvj-toggle-root",
    VIEWED_HIGHLIGHT_CLASS: "lhvj-viewed-highlight"
  });
  const VIEWED_KEYWORDS = Object.freeze([
"Viewed",
    "Seen",
    "Applied",
"Görüntülenen",
    "Görüntülendi",
    "Başvurulan",
    "Başvurulanlar",
    "Başvuruldu",
"Visto",
    "Vistos",
    "Aplicado",
    "Postulado",
"Visualizado",
    "Visualizados",
    "Candidatado",
    "Candidatura",
"Vu",
    "Vue",
    "Postulé",
    "Postulée",
    "Candidature",
"Angesehen",
    "Gesehen",
    "Beworben",
"Visualizzato",
    "Visto",
    "Candidata",
    "Candidati",
    "Candidatura",
"Bekeken",
    "Solliciteerd",
"Просмотрено",
    "Откликнулся",
"Wyświetlono",
    "Aplikowano",
"Visad",
    "Sedd",
    "Sökt",
"已查看",
    "已申请",
    "已檢視",
    "已申請",
"閲覧済み",
    "応募済み",
"조회됨",
    "지원함",
    "지원 완료",
"تمت المشاهدة",
    "تم التقديم",
"देखा गया",
    "आवेदन किया गया"
  ]);
  const JOB_CARD_SELECTORS = Object.freeze([
    "[data-occludable-job-id]",
    "li[data-occludable-job-id]",
    "li.jobs-search-results__list-item",
    "li.scaffold-layout__list-item",
    "li.discovery-templates-entity-item",
    'li[class*="discovery-templates-entity-item"]',
    "article.job-search-card",
    "div.job-search-card",
    "div.base-card",
    "article.base-card",
    "li.jobs-collections-module__list-item",
    "div.jobs-collections-module__list-item",
    "li.jobs-collection__list-item",
    "div.jobs-collection__list-item",
    ".jobs-collections-module__job-card",
    ".jobs-collections-module__job-card-container"
  ]);
  const VIEWED_MARKER_SELECTORS = Object.freeze([
    "li.job-card-container__footer-job-state",
    'li[class*="footer-job-state"]',
    ".job-card-container__footer-wrapper li",
    '[class*="job-card-footer"]',
    '[class*="job-state"]',
    "[data-jobstate]",
    '[data-viewed="true"]',
    "span.job-card-list__footer"
  ]);
  const POTENTIAL_VIEWED_ANCHOR_SELECTORS = Object.freeze([
    'a[href*="/jobs/view/"]',
    'a[href*="/jobs/collections/"]',
    'a[href*="/jobs/search/"]',
    'a[href*="currentJobId="]',
    'a[href*="trk=public_jobs"]',
    "a.job-card-container__link",
    'a[data-control-name*="job"]',
    'a[class*="job-card"]',
    "a.base-card__full-link",
    "a.jobs-collection-card__link",
    "a.jobs-collections-module__link"
  ]);
  const CARD_SELECTOR_JOINED = JOB_CARD_SELECTORS.join(",");
  const MARKER_SELECTOR_JOINED = VIEWED_MARKER_SELECTORS.join(",");
  const ANCHOR_SELECTOR_JOINED = POTENTIAL_VIEWED_ANCHOR_SELECTORS.join(",");
  const EXTENDED_CARD_SELECTOR = [
    CARD_SELECTOR_JOINED,
    "[data-job-id]",
    ".job-card-container",
    ".job-card-list",
    ".base-card",
    ".job-search-card",
    'li[class*="jobs-search"]',
    'li[class*="job-card"]',
    'div[class*="job-card"]',
    'article[class*="job"]',
    'article[class*="base-card"]',
    ".jobs-collections-module__job-card",
    ".jobs-collections-module__job-card-container",
    "li.jobs-collections-module__list-item",
    "div.jobs-collections-module__list-item"
  ].join(",");
  class StorageService {
    getItem(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    setItem(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
      }
    }
    getShowHidden() {
      return this.getItem(DOM_IDS.STORAGE_KEY) === "1";
    }
    setShowHidden(value) {
      this.setItem(DOM_IDS.STORAGE_KEY, value ? "1" : "0");
    }
    getSavedPosition() {
      try {
        const raw = this.getItem(DOM_IDS.UI_POSITION_KEY);
        if (!raw) return null;
        const pos = JSON.parse(raw);
        if (!pos || typeof pos.left !== "number" || typeof pos.top !== "number" || !Number.isFinite(pos.left) || !Number.isFinite(pos.top)) {
          return null;
        }
        return { left: pos.left, top: pos.top };
      } catch {
        return null;
      }
    }
    savePosition(pos) {
      this.setItem(DOM_IDS.UI_POSITION_KEY, JSON.stringify(pos));
    }
  }
  class KeywordMatcher {
    normalizedKeywords;
    constructor() {
      this.normalizedKeywords = VIEWED_KEYWORDS.map((kw) => this.normalize(kw)).filter(
        (kw) => kw.length > 0
      );
    }
    normalize(text) {
      return (text || "").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    hasViewedKeyword(text) {
      const normalized = this.normalize(text);
      if (!normalized) return false;
      for (const keyword of this.normalizedKeywords) {
        if (this.containsKeywordExactly(normalized, keyword)) {
          return true;
        }
      }
      return false;
    }
    hasViewedText(el) {
      const text = (el.textContent || "").trim();
      const aria = el.getAttribute("aria-label") || "";
      const title = el.getAttribute("title") || "";
      return this.hasViewedKeyword(text) || this.hasViewedKeyword(aria) || this.hasViewedKeyword(title);
    }
    containsKeywordExactly(text, keyword) {
      let fromIndex = 0;
      while (fromIndex < text.length) {
        const index = text.indexOf(keyword, fromIndex);
        if (index === -1) return false;
        if (this.hasBoundary(text, index, keyword.length)) return true;
        fromIndex = index + 1;
      }
      return false;
    }
    hasBoundary(text, start, keywordLength) {
      const before = start > 0 ? text[start - 1] : "";
      const afterIndex = start + keywordLength;
      const after = afterIndex < text.length ? text[afterIndex] : "";
      return !this.isAsciiLetterOrNumber(before) && !this.isAsciiLetterOrNumber(after);
    }
    isAsciiLetterOrNumber(ch) {
      if (!ch) return false;
      const code = ch.charCodeAt(0);
      return code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122;
    }
  }
  class DetectionService {
    matcher;
    constructor(matcher) {
      this.matcher = matcher;
    }
getJobCards() {
      const cardSet = new Set();
      document.querySelectorAll(CARD_SELECTOR_JOINED).forEach((node) => {
        cardSet.add(node);
      });
      return Array.from(cardSet);
    }
getViewedCardsFromMarkers() {
      const viewedCards = new Set();
      document.querySelectorAll(MARKER_SELECTOR_JOINED).forEach((node) => {
        if (!this.isElementVisible(node) || !this.matcher.hasViewedText(node)) return;
        const card = this.getCardFromNode(node);
        if (card) viewedCards.add(card);
      });
      return viewedCards;
    }
isViewedJobCard(card) {
      if (this.matcher.hasViewedKeyword(card.className || "")) return true;
      if (this.matcher.hasViewedText(card)) return true;
      const infoItems = card.querySelectorAll("ul li");
      for (let i = 0; i < infoItems.length; i++) {
        if (this.isElementVisible(infoItems[i]) && this.matcher.hasViewedText(infoItems[i])) {
          return true;
        }
      }
      if (this.cardContainsViewedInDescendants(
        card,
        "[aria-label], [title], span, small, div, p, time",
        100
      )) {
        return true;
      }
      if (card.matches(
        'li.discovery-templates-entity-item, li[class*="discovery-templates-entity-item"]'
      )) {
        if (this.cardContainsViewedInDescendants(card, "*", 140)) return true;
      }
      return false;
    }
refreshViewedAnchors(showHidden) {
      let viewedAnchorCount = 0;
      const viewedAnchorCards = new Set();
      if (!this.shouldUseAnchorDetection()) {
        this.restoreHiddenAnchors();
        return { viewedAnchorCount, viewedAnchorCards };
      }
      this.getPotentialViewedAnchors().forEach((node) => {
        const card = this.getCardFromAnchor(node);
        const scope = card || node.closest("li, article, div") || node;
        const hiddenByScript = node.getAttribute("data-lhvj-hidden-anchor") === "1";
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
refreshJobsViewedCardsFallback(showHidden) {
      const viewedCards = new Set();
      if (!this.isJobsPage()) return viewedCards;
      document.querySelectorAll(MARKER_SELECTOR_JOINED).forEach((node) => {
        if (!this.isElementVisible(node) || !this.matcher.hasViewedText(node)) return;
        const card = this.getCardFromViewedMarker(node);
        if (!card) return;
        viewedCards.add(card);
        this.applyVisibility(card, showHidden);
        this.applyViewedHighlight(card, !showHidden);
      });
      return viewedCards;
    }
    applyVisibility(card, shouldHide) {
      if (shouldHide) {
        card.classList.add(DOM_IDS.HIDDEN_CLASS);
        card.setAttribute("data-lhvj-hidden", "1");
      } else {
        card.classList.remove(DOM_IDS.HIDDEN_CLASS);
        card.removeAttribute("data-lhvj-hidden");
      }
    }
    applyViewedHighlight(card, shouldHighlight) {
      const { VIEWED_HIGHLIGHT_CLASS } = DOM_IDS;
      if (shouldHighlight) {
        card.classList.add(VIEWED_HIGHLIGHT_CLASS);
        card.setAttribute("data-lhvj-viewed", "1");
      } else {
        card.classList.remove(VIEWED_HIGHLIGHT_CLASS);
        card.removeAttribute("data-lhvj-viewed");
      }
    }
    isJobsPage() {
      return this.isJobsPath(location.pathname);
    }
    isElementVisible(el) {
      if (el.hasAttribute("hidden")) return false;
      if (el.getAttribute("aria-hidden") === "true") return false;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return false;
      if (parseFloat(style.opacity) === 0) return false;
      try {
        const rects = el.getClientRects();
        if (rects && rects.length === 0) return false;
      } catch {
      }
      return true;
    }
getCardFromNode(node) {
      const card = node.closest(CARD_SELECTOR_JOINED);
      return card ?? null;
    }
    getCardFromAnchor(node) {
      const card = node.closest(CARD_SELECTOR_JOINED);
      if (card) return card;
      const fallback = node.closest(EXTENDED_CARD_SELECTOR);
      if (fallback) return fallback;
      if (node.matches(
        'a[href*="/jobs/view/"], a[href*="/jobs/collections/"], a[href*="currentJobId="]'
      )) {
        return node;
      }
      return null;
    }
    getCardFromViewedMarker(node) {
      return node.closest(EXTENDED_CARD_SELECTOR) ?? null;
    }
    isJobsRootPath(pathname) {
      return pathname === "/jobs" || pathname === "/jobs/";
    }
    isJobsSubPath(pathname) {
      return pathname.startsWith("/jobs/");
    }
    isJobsPath(pathname) {
      return this.isJobsRootPath(pathname) || this.isJobsSubPath(pathname) || pathname.includes("/jobs");
    }
    shouldUseAnchorDetection() {
      return this.isJobsPath(location.pathname);
    }
    restoreHiddenAnchors() {
      document.querySelectorAll('a[data-lhvj-hidden-anchor="1"]').forEach((node) => {
        this.applyAnchorVisibility(node, false);
      });
    }
    getPotentialViewedAnchors() {
      const anchorSet = new Set();
      document.querySelectorAll("a[href]").forEach((node) => {
        const href = node.getAttribute("href") || "";
        if (href.includes("/jobs/view/") || href.includes("/jobs/collections/") || href.includes("/jobs/collections/recommended") || href.includes("/jobs/search/") || href.includes("currentJobId=") || href.includes("trk=public_jobs")) {
          anchorSet.add(node);
        }
      });
      document.querySelectorAll(ANCHOR_SELECTOR_JOINED).forEach((node) => {
        anchorSet.add(node);
      });
      document.querySelectorAll('a[data-lhvj-hidden-anchor="1"]').forEach((node) => {
        anchorSet.add(node);
      });
      return Array.from(anchorSet);
    }
    isViewedAnchor(anchor, scope) {
      if (!this.isElementVisible(anchor)) return false;
      if (this.matcher.hasViewedText(anchor)) return true;
      const descendants = anchor.querySelectorAll("[aria-label], [title]");
      for (let i = 0; i < descendants.length; i++) {
        if (this.isElementVisible(descendants[i]) && this.matcher.hasViewedText(descendants[i])) {
          return true;
        }
      }
      if (scope && this.hasViewedStateInScope(scope)) return true;
      return false;
    }
    hasViewedStateInScope(scope) {
      if (this.cardContainsViewedInDescendants(scope, MARKER_SELECTOR_JOINED, 24)) return true;
      return this.cardContainsViewedInDescendants(
        scope,
        "[aria-label], [title], span, small, p, time, li",
        80
      );
    }
    cardContainsViewedInDescendants(card, selector, maxNodes) {
      const nodes = card.querySelectorAll(selector);
      const limit = Math.min(nodes.length, maxNodes);
      for (let i = 0; i < limit; i++) {
        if (this.isElementVisible(nodes[i]) && this.matcher.hasViewedText(nodes[i])) {
          return true;
        }
      }
      return false;
    }
    applyAnchorVisibility(anchor, shouldHide) {
      if (shouldHide) {
        anchor.classList.add(DOM_IDS.HIDDEN_CLASS);
        anchor.setAttribute("data-lhvj-hidden-anchor", "1");
      } else {
        anchor.classList.remove(DOM_IDS.HIDDEN_CLASS);
        anchor.removeAttribute("data-lhvj-hidden-anchor");
      }
    }
  }
  class RouterService {
    lastUrl = location.href;
    lastPathname = location.pathname;
    routeRefreshBurstId = null;
    domObserver = null;
    domMutationTimerId = null;
    delayedRefreshTimers = new Map();
    onRefresh;
    onPathChange;
    constructor(onRefresh, onPathChange) {
      this.onRefresh = onRefresh;
      this.onPathChange = onPathChange;
    }
startObserving() {
      this.observeRouteChanges();
      this.observeDomChanges();
    }
stopAll() {
      this.stopDomObserver();
      this.clearRouteRefreshBurst();
      this.delayedRefreshTimers.forEach((id) => clearTimeout(id));
      this.delayedRefreshTimers.clear();
    }
queueRefresh(delayMs) {
      if (this.delayedRefreshTimers.has(delayMs)) return;
      const timerId = setTimeout(() => {
        this.delayedRefreshTimers.delete(delayMs);
        this.onRefresh();
      }, delayMs);
      this.delayedRefreshTimers.set(delayMs, timerId);
    }
startRouteRefreshBurst() {
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
restartDomObserver() {
      this.stopDomObserver();
      this.observeDomChanges();
    }
observeRouteChanges() {
      const handler = () => this.onLocationMaybeChanged();
      this.wrapHistoryMethod("pushState", handler);
      this.wrapHistoryMethod("replaceState", handler);
      window.addEventListener("popstate", handler);
      window.addEventListener("hashchange", handler);
    }
    observeDomChanges() {
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
        attributes: false
      });
    }
    stopDomObserver() {
      if (this.domMutationTimerId) {
        clearTimeout(this.domMutationTimerId);
        this.domMutationTimerId = null;
      }
      if (this.domObserver) {
        this.domObserver.disconnect();
        this.domObserver = null;
      }
    }
    clearRouteRefreshBurst() {
      if (this.routeRefreshBurstId) {
        clearInterval(this.routeRefreshBurstId);
        this.routeRefreshBurstId = null;
      }
    }
    onLocationMaybeChanged() {
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
    wrapHistoryMethod(methodName, callback) {
      const original = history[methodName];
      if (typeof original !== "function") return;
      history[methodName] = function(...args) {
        const result = original.apply(this, args);
        callback();
        return result;
      };
    }
  }
  class StyleManager {
    injected = false;
    inject() {
      if (this.injected || document.getElementById("lhvj-style")) return;
      const style = document.createElement("style");
      style.id = "lhvj-style";
      style.textContent = this.buildCSS();
      document.head.appendChild(style);
      this.injected = true;
    }
    buildCSS() {
      const { HIDDEN_CLASS, UI_ID, VIEWED_HIGHLIGHT_CLASS } = DOM_IDS;
      const { UI_Z_INDEX, HIGHLIGHT_COLOR, HIGHLIGHT_BORDER_RADIUS } = CONFIG;
      return (
`
      .${HIDDEN_CLASS} { display: none !important; }

      #${UI_ID} {
        position: fixed;
        top: 76px;
        right: 16px;
        z-index: ${UI_Z_INDEX};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background: #1d2226;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);
        display: inline-flex;
        align-items: center;
        height: 32px;
        overflow: hidden;
        user-select: none;
        transition: box-shadow 0.15s ease;
      }

      #${UI_ID}:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.35);
      }

      #${UI_ID}.lhvj-dragging {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      #${UI_ID} .lhvj-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 100%;
        cursor: grab;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        color: #3d4449;
        flex-shrink: 0;
        transition: color 0.15s ease;
      }

      #${UI_ID} .lhvj-drag-handle:hover {
        color: #9aa4ae;
      }

      #${UI_ID} .lhvj-drag-handle::before {
        content: "";
        display: block;
        width: 8px;
        height: 12px;
        background: radial-gradient(circle, currentColor 1.2px, transparent 1.2px);
        background-size: 4px 4px;
      }

      #${UI_ID} label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 0 10px 0 8px;
        height: 100%;
        cursor: pointer;
      }

      #${UI_ID} .lhvj-count {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
      }

      #${UI_ID} .lhvj-count-num {
        font-size: 13px;
        font-weight: 600;
        line-height: 1;
        color: #e7e9ea;
      }

      #${UI_ID} .lhvj-count-unit {
        font-size: 11px;
        font-weight: 400;
        line-height: 1;
        color: #9aa4ae;
      }

      #${UI_ID} .lhvj-state {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 30px;
        padding: 2px 7px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.3px;
        line-height: 1;
        text-align: center;
        background: rgba(255, 255, 255, 0.1);
        color: #c9d1d9;
      }

      #${UI_ID}[data-show-hidden="1"] .lhvj-state {
        background: rgba(112, 181, 249, 0.2);
        color: #9fd0ff;
      }

      #${UI_ID} input[type="checkbox"] {
        appearance: none;
        width: 0;
        height: 0;
        margin: 0;
        padding: 0;
        border-radius: 999px;
        background: #4d5661;
        position: absolute;
        opacity: 0;
        outline: none;
        border: none;
        transition: background 0.2s ease;
        cursor: pointer;
        pointer-events: none;
        flex-shrink: 0;
      }

      #${UI_ID} input[type="checkbox"]::after {
        content: "";
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        position: absolute;
        top: 2px;
        left: 2px;
        transition: transform 0.2s ease;
      }

      #${UI_ID} input[type="checkbox"]:checked { background: #70b5f9; }
      #${UI_ID} input[type="checkbox"]:checked::after { transform: translateX(14px); }
      #${UI_ID} input[type="checkbox"]:focus-visible {
        outline: 2px solid #70b5f9;
        outline-offset: 2px;
      }

      .${VIEWED_HIGHLIGHT_CLASS} {
        box-shadow: inset 0 0 0 2px ${HIGHLIGHT_COLOR} !important;
        outline: 2px solid ${HIGHLIGHT_COLOR} !important;
        outline-offset: -2px !important;
        border-radius: ${HIGHLIGHT_BORDER_RADIUS} !important;
        background-color: rgba(46, 204, 113, 0.06) !important;
      }

      .${VIEWED_HIGHLIGHT_CLASS} .job-card-container,
      .${VIEWED_HIGHLIGHT_CLASS}[class*="job-card"],
      .${VIEWED_HIGHLIGHT_CLASS} > div {
        box-shadow: inset 0 0 0 2px ${HIGHLIGHT_COLOR} !important;
        border-radius: ${HIGHLIGHT_BORDER_RADIUS} !important;
      }

      @media (max-width: 900px) {
        #${UI_ID} {
          top: 70px;
          right: 8px;
        }
      }
    `
      );
    }
  }
  class Badge {
    storage;
    onToggle;
    state = {
      root: null,
      countNum: null,
      countUnit: null,
      stateEl: null
    };
    isDragging = false;
    constructor(storage, onToggle) {
      this.storage = storage;
      this.onToggle = onToggle;
    }
ensure(showHidden) {
      if (this.state.root && document.body.contains(this.state.root)) {
        return this.state.root;
      }
      let root = document.getElementById(DOM_IDS.UI_ID);
      if (root) {
        this.cacheElements(root);
        return root;
      }
      root = this.buildDom(showHidden);
      document.body.appendChild(root);
      const saved = this.storage.getSavedPosition();
      if (saved) {
        this.applyPosition(root, saved.left, saved.top, false);
      }
      this.cacheElements(root);
      return root;
    }
updateCount(hiddenCount, showHidden) {
      const root = this.state.root;
      if (!root || !this.state.countNum || !this.state.countUnit || !this.state.stateEl) return;
      root.setAttribute("data-show-hidden", showHidden ? "1" : "0");
      this.state.countNum.textContent = String(hiddenCount);
      this.state.countUnit.textContent = showHidden ? "hidden" : "viewed";
      this.state.stateEl.textContent = showHidden ? "ON" : "OFF";
    }
remove() {
      const root = document.getElementById(DOM_IDS.UI_ID);
      if (root) root.remove();
      this.state.root = null;
      this.state.countNum = null;
      this.state.countUnit = null;
      this.state.stateEl = null;
    }
syncPositionWithinViewport() {
      const root = document.getElementById(DOM_IDS.UI_ID);
      if (!root) return;
      const rect = root.getBoundingClientRect();
      this.applyPosition(root, rect.left, rect.top, true);
    }
buildDom(showHidden) {
      const root = document.createElement("div");
      root.id = DOM_IDS.UI_ID;
      const dragHandle = document.createElement("span");
      dragHandle.className = "lhvj-drag-handle";
      dragHandle.title = "Drag to reposition";
      dragHandle.setAttribute("aria-label", "Drag badge");
      const label = document.createElement("label");
      const countEl = document.createElement("span");
      countEl.className = "lhvj-count";
      const countNum = document.createElement("span");
      countNum.className = "lhvj-count-num";
      countNum.textContent = "0";
      const countUnit = document.createElement("span");
      countUnit.className = "lhvj-count-unit";
      countUnit.textContent = showHidden ? "hidden" : "viewed";
      countEl.appendChild(countNum);
      countEl.appendChild(countUnit);
      const stateEl = document.createElement("span");
      stateEl.className = "lhvj-state";
      stateEl.textContent = showHidden ? "ON" : "OFF";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = showHidden;
      checkbox.setAttribute("aria-label", "Toggle hiding of viewed jobs");
      checkbox.addEventListener("change", () => {
        this.onToggle(checkbox.checked);
      });
      label.appendChild(stateEl);
      label.appendChild(countEl);
      label.appendChild(checkbox);
      root.appendChild(dragHandle);
      root.appendChild(label);
      this.makeDraggable(root, dragHandle);
      return root;
    }
    cacheElements(root) {
      this.state.root = root;
      this.state.countNum = root.querySelector(".lhvj-count-num");
      this.state.countUnit = root.querySelector(".lhvj-count-unit");
      this.state.stateEl = root.querySelector(".lhvj-state");
    }
    clampPosition(left, top, root) {
      const margin = CONFIG.UI_EDGE_MARGIN;
      const maxLeft = Math.max(margin, window.innerWidth - root.offsetWidth - margin);
      const maxTop = Math.max(margin, window.innerHeight - root.offsetHeight - margin);
      return {
        left: Math.min(Math.max(left, margin), maxLeft),
        top: Math.min(Math.max(top, margin), maxTop)
      };
    }
    applyPosition(root, left, top, save) {
      const clamped = this.clampPosition(left, top, root);
      root.style.left = `${clamped.left}px`;
      root.style.top = `${clamped.top}px`;
      root.style.right = "auto";
      if (save) this.storage.savePosition(clamped);
    }
    makeDraggable(root, dragHandle) {
      let pointerId = null;
      let offsetX = 0;
      let offsetY = 0;
      dragHandle.addEventListener("pointerdown", (e) => {
        pointerId = e.pointerId;
        const rect = root.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        this.isDragging = true;
        root.classList.add("lhvj-dragging");
        dragHandle.setPointerCapture(pointerId);
        e.preventDefault();
      });
      dragHandle.addEventListener("pointermove", (e) => {
        if (!this.isDragging || pointerId !== e.pointerId) return;
        this.applyPosition(root, e.clientX - offsetX, e.clientY - offsetY, false);
        e.preventDefault();
      });
      const stopDrag = (e) => {
        if (!this.isDragging || pointerId !== e.pointerId) return;
        this.isDragging = false;
        root.classList.remove("lhvj-dragging");
        if (dragHandle.hasPointerCapture(pointerId)) {
          dragHandle.releasePointerCapture(pointerId);
        }
        const rect = root.getBoundingClientRect();
        this.applyPosition(root, rect.left, rect.top, true);
        pointerId = null;
        e.preventDefault();
      };
      dragHandle.addEventListener("pointerup", stopDrag);
      dragHandle.addEventListener("pointercancel", stopDrag);
    }
  }
  class App {
    storage;
    matcher;
    detection;
    styleManager;
    badge;
    router;
    showHidden;
    hiddenCount = 0;
    rafId = 0;
    isRuntimeActive = false;
    isReloadingForPathChange = false;
    lastRouteChangeAt = Date.now();
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
init() {
      this.styleManager.inject();
      this.startRuntime();
      this.router.startObserving();
    }
startRuntime() {
      if (this.isRuntimeActive) return;
      this.lastRouteChangeAt = Date.now();
      this.router.restartDomObserver();
      this.scheduleRefresh();
      this.router.queueRefresh(120);
      this.router.queueRefresh(420);
      window.addEventListener("resize", this.onWindowResize);
      this.isRuntimeActive = true;
      if (this.detection.isJobsPage()) {
        this.router.startRouteRefreshBurst();
      }
    }
    hardRestartRuntimeForPathChange() {
      if (this.isReloadingForPathChange) return;
      this.isReloadingForPathChange = true;
      window.location.reload();
    }
scheduleRefresh() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(() => {
        this.rafId = 0;
        this.refresh();
      });
    }
    refresh() {
      if (!this.detection.isJobsPage()) {
        this.hiddenCount = 0;
        this.badge.remove();
        return;
      }
      const cards = this.detection.getJobCards();
      if (cards.length === 0 && Date.now() - this.lastRouteChangeAt < CONFIG.LAZY_RENDER_TIMEOUT_MS) {
        this.router.queueRefresh(180);
        this.router.queueRefresh(600);
      }
      const viewedCardsFromMarkers = this.detection.getViewedCardsFromMarkers();
      const viewedCards = new Set(viewedCardsFromMarkers);
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
      document.querySelectorAll('[data-lhvj-hidden="1"]').forEach((node) => {
        if (!this.showHidden || !finalViewedCards.has(node)) {
          this.detection.applyVisibility(node, false);
        }
      });
      document.querySelectorAll('[data-lhvj-viewed="1"]').forEach((node) => {
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
    onWindowResize = () => {
      this.badge.syncPositionWithinViewport();
    };
  }
  const app = new App();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => app.init(), { once: true });
  } else {
    app.init();
  }

})();