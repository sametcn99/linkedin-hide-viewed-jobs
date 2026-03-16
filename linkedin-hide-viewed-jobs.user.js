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
// @version            1.1.2
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

(function() {
var CONFIG = Object.freeze({
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
		HIGHLIGHT_BORDER_RADIUS: "6px",
		SCROLL_GUARD_ENABLED_DEFAULT: true,
		SCROLL_GUARD_TRIGGER_DELTA_PX: 900,
		SCROLL_GUARD_TRIGGER_WINDOW_MS: 1200,
		SCROLL_GUARD_COOLDOWN_MIN_MS: 5e3,
		SCROLL_GUARD_COOLDOWN_MAX_MS: 15e3,
		SCROLL_GUARD_ALLOWED_STEP_PX: 110,
		SCROLL_GUARD_ALLOWED_STEP_MIN_INTERVAL_MS: 120,
		SCROLL_GUARD_MIN_VIEWED_DENSITY: .55,
		SCROLL_GUARD_DENSITY_WINDOW_MS: 6e3
	});
	var DOM_IDS = Object.freeze({
		STORAGE_KEY: "lhvj-show-hidden",
		SCROLL_GUARD_STORAGE_KEY: "lhvj-scroll-guard-enabled",
		DETECTION_MODE_STORAGE_KEY: "lhvj-detection-mode",
		RELOAD_ON_NAVIGATION_STORAGE_KEY: "lhvj-reload-on-navigation",
		UI_POSITION_KEY: "lhvj-ui-position",
		HIDDEN_CLASS: "lhvj-hidden-by-script",
		UI_ID: "lhvj-toggle-root",
		VIEWED_HIGHLIGHT_CLASS: "lhvj-viewed-highlight"
	});
	var VIEWED_KEYWORDS = Object.freeze([
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
	var JOB_CARD_SELECTORS = Object.freeze([
		"[data-occludable-job-id]",
		"li[data-occludable-job-id]",
		"li.jobs-search-results__list-item",
		"li.scaffold-layout__list-item",
		"li.discovery-templates-entity-item",
		"li[class*=\"discovery-templates-entity-item\"]",
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
	var VIEWED_MARKER_SELECTORS = Object.freeze([
		"li.job-card-container__footer-job-state",
		"li[class*=\"footer-job-state\"]",
		".job-card-container__footer-wrapper li",
		"[class*=\"job-card-footer\"]",
		"[class*=\"job-state\"]",
		"[data-jobstate]",
		"[data-viewed=\"true\"]",
		"span.job-card-list__footer"
	]);
	var POTENTIAL_VIEWED_ANCHOR_SELECTORS = Object.freeze([
		"a[href*=\"/jobs/view/\"]",
		"a[href*=\"/jobs/collections/\"]",
		"a[href*=\"/jobs/search/\"]",
		"a[href*=\"currentJobId=\"]",
		"a[href*=\"trk=public_jobs\"]",
		"a.job-card-container__link",
		"a[data-control-name*=\"job\"]",
		"a[class*=\"job-card\"]",
		"a.base-card__full-link",
		"a.jobs-collection-card__link",
		"a.jobs-collections-module__link"
	]);
var CARD_SELECTOR_JOINED = JOB_CARD_SELECTORS.join(",");
	var MARKER_SELECTOR_JOINED = VIEWED_MARKER_SELECTORS.join(",");
	var ANCHOR_SELECTOR_JOINED = POTENTIAL_VIEWED_ANCHOR_SELECTORS.join(",");
var EXTENDED_CARD_SELECTOR = [
		CARD_SELECTOR_JOINED,
		"[data-job-id]",
		".job-card-container",
		".job-card-list",
		".base-card",
		".job-search-card",
		"li[class*=\"jobs-search\"]",
		"li[class*=\"job-card\"]",
		"div[class*=\"job-card\"]",
		"article[class*=\"job\"]",
		"article[class*=\"base-card\"]",
		".jobs-collections-module__job-card",
		".jobs-collections-module__job-card-container",
		"li.jobs-collections-module__list-item",
		"div.jobs-collections-module__list-item"
	].join(",");
var StorageService = class {
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
			} catch {}
		}
		getShowHidden() {
			return this.getItem(DOM_IDS.STORAGE_KEY) === "1";
		}
		setShowHidden(value) {
			this.setItem(DOM_IDS.STORAGE_KEY, value ? "1" : "0");
		}
		getScrollGuardEnabled() {
			const value = this.getItem(DOM_IDS.SCROLL_GUARD_STORAGE_KEY);
			if (value === "0") return false;
			if (value === "1") return true;
			return CONFIG.SCROLL_GUARD_ENABLED_DEFAULT;
		}
		setScrollGuardEnabled(value) {
			this.setItem(DOM_IDS.SCROLL_GUARD_STORAGE_KEY, value ? "1" : "0");
		}
		getDetectionMode() {
			return this.getItem(DOM_IDS.DETECTION_MODE_STORAGE_KEY) === "highlight" ? "highlight" : "hide";
		}
		setDetectionMode(mode) {
			this.setItem(DOM_IDS.DETECTION_MODE_STORAGE_KEY, mode);
		}
		getReloadOnNavigation() {
			return this.getItem(DOM_IDS.RELOAD_ON_NAVIGATION_STORAGE_KEY) === "1";
		}
		setReloadOnNavigation(value) {
			this.setItem(DOM_IDS.RELOAD_ON_NAVIGATION_STORAGE_KEY, value ? "1" : "0");
		}
		getSavedPosition() {
			try {
				const raw = this.getItem(DOM_IDS.UI_POSITION_KEY);
				if (!raw) return null;
				const pos = JSON.parse(raw);
				if (!pos || typeof pos.left !== "number" || typeof pos.top !== "number" || !Number.isFinite(pos.left) || !Number.isFinite(pos.top)) return null;
				return {
					left: pos.left,
					top: pos.top
				};
			} catch {
				return null;
			}
		}
		savePosition(pos) {
			this.setItem(DOM_IDS.UI_POSITION_KEY, JSON.stringify(pos));
		}
	};
var KeywordMatcher = class {
		normalizedKeywords;
		constructor() {
			this.normalizedKeywords = VIEWED_KEYWORDS.map((kw) => this.normalize(kw)).filter((kw) => kw.length > 0);
		}
		normalize(text) {
			return (text || "").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		}
		hasViewedKeyword(text) {
			const normalized = this.normalize(text);
			if (!normalized) return false;
			for (const keyword of this.normalizedKeywords) if (this.containsKeywordExactly(normalized, keyword)) return true;
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
	};
var DetectionService = class {
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
			for (let i = 0; i < infoItems.length; i++) if (this.isElementVisible(infoItems[i]) && this.matcher.hasViewedText(infoItems[i])) return true;
			if (this.cardContainsViewedInDescendants(card, "[aria-label], [title], span, small, div, p, time", 100)) return true;
			if (card.matches("li.discovery-templates-entity-item, li[class*=\"discovery-templates-entity-item\"]")) {
				if (this.cardContainsViewedInDescendants(card, "*", 140)) return true;
			}
			return false;
		}
refreshViewedAnchors(showHidden) {
			let viewedAnchorCount = 0;
			const viewedAnchorCards = new Set();
			if (!this.shouldUseAnchorDetection()) {
				this.restoreHiddenAnchors();
				return {
					viewedAnchorCount,
					viewedAnchorCards
				};
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
				if (viewed || hiddenByScript) this.applyAnchorVisibility(node, viewed && showHidden);
			});
			return {
				viewedAnchorCount,
				viewedAnchorCards
			};
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
			} catch {}
			return true;
		}
		getCardFromNode(node) {
			return node.closest(CARD_SELECTOR_JOINED) ?? null;
		}
		getCardFromAnchor(node) {
			const card = node.closest(CARD_SELECTOR_JOINED);
			if (card) return card;
			const fallback = node.closest(EXTENDED_CARD_SELECTOR);
			if (fallback) return fallback;
			if (node.matches("a[href*=\"/jobs/view/\"], a[href*=\"/jobs/collections/\"], a[href*=\"currentJobId=\"]")) return node;
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
			document.querySelectorAll("a[data-lhvj-hidden-anchor=\"1\"]").forEach((node) => {
				this.applyAnchorVisibility(node, false);
			});
		}
		getPotentialViewedAnchors() {
			const anchorSet = new Set();
			document.querySelectorAll("a[href]").forEach((node) => {
				const href = node.getAttribute("href") || "";
				if (href.includes("/jobs/view/") || href.includes("/jobs/collections/") || href.includes("/jobs/collections/recommended") || href.includes("/jobs/search/") || href.includes("currentJobId=") || href.includes("trk=public_jobs")) anchorSet.add(node);
			});
			document.querySelectorAll(ANCHOR_SELECTOR_JOINED).forEach((node) => {
				anchorSet.add(node);
			});
			document.querySelectorAll("a[data-lhvj-hidden-anchor=\"1\"]").forEach((node) => {
				anchorSet.add(node);
			});
			return Array.from(anchorSet);
		}
		isViewedAnchor(anchor, scope) {
			if (!this.isElementVisible(anchor)) return false;
			if (this.matcher.hasViewedText(anchor)) return true;
			const descendants = anchor.querySelectorAll("[aria-label], [title]");
			for (let i = 0; i < descendants.length; i++) if (this.isElementVisible(descendants[i]) && this.matcher.hasViewedText(descendants[i])) return true;
			if (scope && this.hasViewedStateInScope(scope)) return true;
			return false;
		}
		hasViewedStateInScope(scope) {
			if (this.cardContainsViewedInDescendants(scope, MARKER_SELECTOR_JOINED, 24)) return true;
			return this.cardContainsViewedInDescendants(scope, "[aria-label], [title], span, small, p, time, li", 80);
		}
		cardContainsViewedInDescendants(card, selector, maxNodes) {
			const nodes = card.querySelectorAll(selector);
			const limit = Math.min(nodes.length, maxNodes);
			for (let i = 0; i < limit; i++) if (this.isElementVisible(nodes[i]) && this.matcher.hasViewedText(nodes[i])) return true;
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
	};
var RouterService = class {
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
				if (ticks >= CONFIG.ROUTE_BURST_MAX_TICKS) this.clearRouteRefreshBurst();
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
			if (currentPathname !== this.lastPathname) {
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
	};
var StyleManager = class {
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
			return `
      .${HIDDEN_CLASS} {
        height: 1px !important;
        min-height: 1px !important;
        max-height: 1px !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        overflow: hidden !important;
        opacity: 0 !important;
      }

      #${UI_ID} {
        --lhvj-bg: linear-gradient(150deg, rgba(34, 40, 46, 0.98), rgba(22, 27, 33, 0.98));
        --lhvj-border: rgba(255, 255, 255, 0.16);
        --lhvj-text: #e6edf3;
        --lhvj-muted: #9aa8b6;
        --lhvj-chip-bg: rgba(255, 255, 255, 0.08);
        --lhvj-chip-border: rgba(255, 255, 255, 0.16);
        --lhvj-focus: #82c8ff;
        position: fixed;
        top: 76px;
        right: 16px;
        z-index: ${UI_Z_INDEX};
        font-family: "Segoe UI Variable", "Segoe UI", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
        background: var(--lhvj-bg);
        border-radius: 999px;
        border: 1px solid var(--lhvj-border);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.28);
        display: inline-flex;
        flex-direction: column;
        align-items: stretch;
        min-height: 36px;
        width: fit-content;
        overflow: hidden;
        user-select: none;
        backdrop-filter: blur(6px);
        transition: box-shadow 0.16s ease, transform 0.16s ease, border-color 0.16s ease;
      }

      #${UI_ID}[data-settings-open="1"] {
        border-radius: 14px;
      }

      #${UI_ID}[data-enabled="0"] {
        width: fit-content;
      }

      #${UI_ID}:hover {
        border-color: rgba(160, 214, 255, 0.38);
        box-shadow: 0 14px 30px rgba(0, 0, 0, 0.42), 0 3px 8px rgba(0, 0, 0, 0.26);
      }

      #${UI_ID}:focus-within {
        border-color: rgba(130, 200, 255, 0.75);
        box-shadow: 0 0 0 2px rgba(130, 200, 255, 0.22), 0 10px 24px rgba(0, 0, 0, 0.35);
      }

      #${UI_ID}.lhvj-dragging {
        transform: scale(1.01);
        box-shadow: 0 16px 34px rgba(0, 0, 0, 0.45), 0 4px 10px rgba(0, 0, 0, 0.28);
      }

      #${UI_ID} .lhvj-header {
        display: inline-flex;
        align-items: stretch;
        width: 100%;
      }

      #${UI_ID} .lhvj-content {
        display: flex;
        flex: 1;
        min-width: 0;
        flex-direction: column;
      }

      #${UI_ID} .lhvj-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        align-self: stretch;
        cursor: grab;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        color: #5a6774;
        flex-shrink: 0;
        transition: color 0.14s ease, background 0.14s ease;
      }

      #${UI_ID} .lhvj-drag-handle:hover {
        color: #b9c6d3;
        background: rgba(255, 255, 255, 0.05);
      }

      #${UI_ID} .lhvj-drag-handle::before {
        content: "";
        display: block;
        width: 8px;
        height: 12px;
        background: radial-gradient(circle, currentColor 1.2px, transparent 1.2px);
        background-size: 4px 4px;
      }

      #${UI_ID} .lhvj-main {
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        gap: 8px;
        padding: 4px 10px 4px 8px;
        min-height: 36px;
        cursor: default;
      }

      #${UI_ID} .lhvj-footer {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        padding: 0 10px 8px 8px;
      }

      #${UI_ID} .lhvj-count {
        display: inline-flex;
        align-items: baseline;
        gap: 4px;
        white-space: nowrap;
      }

      #${UI_ID} .lhvj-count-num {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.1px;
        line-height: 1;
        color: var(--lhvj-text);
      }

      #${UI_ID} .lhvj-count-unit {
        font-size: 11px;
        font-weight: 500;
        line-height: 1;
        color: var(--lhvj-muted);
      }

      #${UI_ID} .lhvj-state {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 34px;
        padding: 3px 8px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.36px;
        line-height: 1;
        text-align: center;
        color: #d2dde7;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.07);
        cursor: pointer;
        transition: border-color 0.14s ease, background 0.14s ease, color 0.14s ease;
      }

      #${UI_ID} .lhvj-state:hover {
        border-color: rgba(255, 255, 255, 0.28);
        background: rgba(255, 255, 255, 0.13);
      }

      #${UI_ID} .lhvj-state:focus-visible {
        outline: 2px solid var(--lhvj-focus);
        outline-offset: 2px;
      }

      #${UI_ID}[data-enabled="1"] .lhvj-state {
        color: #b8e0ff;
        border-color: rgba(112, 181, 249, 0.46);
        background: rgba(112, 181, 249, 0.2);
      }

      #${UI_ID}[data-enabled="0"] .lhvj-state {
        color: #ffc4c4;
        border-color: rgba(240, 120, 120, 0.34);
        background: rgba(240, 120, 120, 0.18);
      }

      #${UI_ID} .lhvj-guard-btn {
        border: 1px solid var(--lhvj-chip-border);
        background: var(--lhvj-chip-bg);
        color: #d0dbe6;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.34px;
        line-height: 1;
        padding: 4px 8px;
        cursor: pointer;
        transition: border-color 0.14s ease, background 0.14s ease, color 0.14s ease;
      }

      #${UI_ID} .lhvj-guard-btn:hover {
        background: rgba(255, 255, 255, 0.14);
        border-color: rgba(255, 255, 255, 0.24);
      }

      #${UI_ID} .lhvj-guard-btn:focus-visible {
        outline: 2px solid var(--lhvj-focus);
        outline-offset: 2px;
      }

      #${UI_ID}[data-scroll-guard="1"] .lhvj-guard-btn {
        border-color: rgba(243, 186, 99, 0.55);
        color: #ffe2b3;
        background: rgba(227, 147, 34, 0.24);
      }

      #${UI_ID} .lhvj-cooldown {
        min-width: 0;
        max-width: 0;
        overflow: hidden;
        opacity: 0;
        color: #ffe3b5;
        border: 1px solid rgba(243, 176, 88, 0.5);
        background: rgba(222, 131, 16, 0.24);
        border-radius: 999px;
        padding: 0;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.2px;
        line-height: 1;
        white-space: nowrap;
        transition: opacity 0.14s ease, max-width 0.14s ease, padding 0.14s ease;
      }

      #${UI_ID}[data-cooldown="1"] .lhvj-cooldown {
        opacity: 1;
        max-width: 74px;
        padding: 4px 7px;
      }

      #${UI_ID} .lhvj-settings-btn {
        border: 1px solid var(--lhvj-chip-border);
        background: var(--lhvj-chip-bg);
        color: #d0dbe6;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.34px;
        line-height: 1;
        padding: 4px 8px;
        cursor: pointer;
      }

      #${UI_ID} .lhvj-settings-btn:hover {
        background: rgba(255, 255, 255, 0.14);
      }

      #${UI_ID} .lhvj-settings-btn:focus-visible {
        outline: 2px solid var(--lhvj-focus);
        outline-offset: 2px;
      }

      #${UI_ID}[data-settings-open="1"] .lhvj-settings-btn {
        border-color: rgba(130, 200, 255, 0.5);
        color: #bee6ff;
      }

      #${UI_ID} .lhvj-settings-panel {
        display: none;
        width: 100%;
        padding: 8px 10px 10px 38px;
        border-top: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(0, 0, 0, 0.16);
        box-sizing: border-box;
      }

      #${UI_ID}[data-settings-open="1"] .lhvj-settings-panel {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      #${UI_ID} .lhvj-settings-label {
        font-size: 11px;
        font-weight: 600;
        color: #c5d1dc;
      }

      #${UI_ID} .lhvj-mode-group {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
      }

      #${UI_ID}[data-enabled="0"] .lhvj-guard-btn,
      #${UI_ID}[data-enabled="0"] .lhvj-cooldown,
      #${UI_ID}[data-enabled="0"] .lhvj-count,
      #${UI_ID}[data-enabled="0"] .lhvj-footer,
      #${UI_ID}[data-enabled="0"] .lhvj-settings-btn,
      #${UI_ID}[data-enabled="0"] .lhvj-settings-panel {
        display: none !important;
      }

      #${UI_ID} .lhvj-mode-btn,
      #${UI_ID} .lhvj-link-btn {
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.06);
        color: #d4dde6;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.28px;
        padding: 4px 8px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        text-decoration: none;
      }

      #${UI_ID} .lhvj-mode-btn:hover,
      #${UI_ID} .lhvj-link-btn:hover {
        background: rgba(255, 255, 255, 0.12);
      }

      #${UI_ID} .lhvj-mode-btn[data-active="1"] {
        border-color: rgba(130, 200, 255, 0.56);
        color: #b8e0ff;
        background: rgba(112, 181, 249, 0.24);
      }

      #${UI_ID} .lhvj-mode-btn:focus-visible,
      #${UI_ID} .lhvj-link-btn:focus-visible {
        outline: 2px solid var(--lhvj-focus);
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

      html.lhvj-pagination-cooldown div.jobs-search-pagination button,
      html.lhvj-pagination-cooldown div.jobs-search-pagination [role="button"] {
        pointer-events: none !important;
        opacity: 0.45 !important;
        cursor: not-allowed !important;
      }

      @media (max-width: 900px) {
        #${UI_ID} {
          top: 70px;
          right: 8px;
        }
      }
    `;
		}
	};
var Badge = class Badge {
		static REPOSITORY_URL = "https://github.com/sametcn99/linkedin-hide-viewed-jobs";
		storage;
		onToggle;
		onScrollGuardToggle;
		onDetectionModeChange;
		onReloadNavigationToggle;
		state = {
			root: null,
			countNum: null,
			countUnit: null,
			stateEl: null,
			guardBtn: null,
			cooldownEl: null,
			settingsBtn: null,
			settingsPanel: null,
			modeHideBtn: null,
			modeHighlightBtn: null,
			reloadNavBtn: null
		};
		isDragging = false;
		constructor(storage, onToggle, onScrollGuardToggle, onDetectionModeChange, onReloadNavigationToggle) {
			this.storage = storage;
			this.onToggle = onToggle;
			this.onScrollGuardToggle = onScrollGuardToggle;
			this.onDetectionModeChange = onDetectionModeChange;
			this.onReloadNavigationToggle = onReloadNavigationToggle;
		}
ensure(isEnabled, scrollGuardEnabled, detectionMode, reloadOnNavigationEnabled) {
			if (this.state.root && document.body.contains(this.state.root)) return this.state.root;
			let root = document.getElementById(DOM_IDS.UI_ID);
			if (root) {
				this.cacheElements(root);
				return root;
			}
			root = this.buildDom(isEnabled, scrollGuardEnabled, detectionMode, reloadOnNavigationEnabled);
			document.body.appendChild(root);
			const saved = this.storage.getSavedPosition();
			if (saved) this.applyPosition(root, saved.left, saved.top, false);
			this.cacheElements(root);
			return root;
		}
updateCount(count, isEnabled, scrollGuardEnabled, detectionMode, reloadOnNavigationEnabled, cooldownSecondsLeft = 0) {
			const root = this.state.root;
			if (!root || !this.state.countNum || !this.state.countUnit || !this.state.stateEl || !this.state.guardBtn || !this.state.cooldownEl || !this.state.settingsBtn || !this.state.modeHideBtn || !this.state.modeHighlightBtn || !this.state.reloadNavBtn) return;
			root.setAttribute("data-enabled", isEnabled ? "1" : "0");
			root.setAttribute("data-scroll-guard", scrollGuardEnabled ? "1" : "0");
			root.setAttribute("data-cooldown", cooldownSecondsLeft > 0 ? "1" : "0");
			root.setAttribute("data-detection-mode", detectionMode);
			root.setAttribute("data-reload-on-navigation", reloadOnNavigationEnabled ? "1" : "0");
			if (!isEnabled && root.getAttribute("data-settings-open") === "1") {
				root.setAttribute("data-settings-open", "0");
				this.state.settingsBtn.textContent = "Open settings";
			}
			this.state.countNum.textContent = String(count);
			this.state.countUnit.textContent = !isEnabled ? "off" : detectionMode === "hide" ? "hidden" : "marked";
			this.state.stateEl.textContent = isEnabled ? "ON" : "OFF";
			this.state.guardBtn.textContent = scrollGuardEnabled ? "GUARD ON" : "GUARD OFF";
			this.state.cooldownEl.textContent = cooldownSecondsLeft > 0 ? `CD ${cooldownSecondsLeft}s` : "";
			this.state.modeHideBtn.setAttribute("data-active", detectionMode === "hide" ? "1" : "0");
			this.state.modeHighlightBtn.setAttribute("data-active", detectionMode === "highlight" ? "1" : "0");
			this.state.reloadNavBtn.textContent = reloadOnNavigationEnabled ? "Reload ON" : "Reload OFF";
			this.state.reloadNavBtn.setAttribute("data-active", reloadOnNavigationEnabled ? "1" : "0");
			this.state.settingsBtn.textContent = root.getAttribute("data-settings-open") === "1" ? "Close settings" : "Open settings";
		}
remove() {
			const root = document.getElementById(DOM_IDS.UI_ID);
			if (root) root.remove();
			this.state.root = null;
			this.state.countNum = null;
			this.state.countUnit = null;
			this.state.stateEl = null;
			this.state.guardBtn = null;
			this.state.cooldownEl = null;
			this.state.settingsBtn = null;
			this.state.settingsPanel = null;
			this.state.modeHideBtn = null;
			this.state.modeHighlightBtn = null;
			this.state.reloadNavBtn = null;
		}
syncPositionWithinViewport() {
			const root = document.getElementById(DOM_IDS.UI_ID);
			if (!root) return;
			const rect = root.getBoundingClientRect();
			this.applyPosition(root, rect.left, rect.top, true);
		}
		buildDom(isEnabled, scrollGuardEnabled, detectionMode, reloadOnNavigationEnabled) {
			const root = document.createElement("div");
			root.id = DOM_IDS.UI_ID;
			root.setAttribute("data-settings-open", "0");
			root.setAttribute("data-enabled", isEnabled ? "1" : "0");
			root.setAttribute("data-scroll-guard", scrollGuardEnabled ? "1" : "0");
			root.setAttribute("data-detection-mode", detectionMode);
			root.setAttribute("data-reload-on-navigation", reloadOnNavigationEnabled ? "1" : "0");
			const dragHandle = document.createElement("span");
			dragHandle.className = "lhvj-drag-handle";
			dragHandle.title = "Drag to reposition";
			dragHandle.setAttribute("aria-label", "Drag badge");
			const header = document.createElement("div");
			header.className = "lhvj-header";
			const content = document.createElement("div");
			content.className = "lhvj-content";
			const main = document.createElement("div");
			main.className = "lhvj-main";
			const countEl = document.createElement("span");
			countEl.className = "lhvj-count";
			const countNum = document.createElement("span");
			countNum.className = "lhvj-count-num";
			countNum.textContent = "0";
			const countUnit = document.createElement("span");
			countUnit.className = "lhvj-count-unit";
			countUnit.textContent = !isEnabled ? "off" : detectionMode === "hide" ? "hidden" : "marked";
			countEl.appendChild(countNum);
			countEl.appendChild(countUnit);
			const stateEl = document.createElement("span");
			stateEl.className = "lhvj-state";
			stateEl.textContent = isEnabled ? "ON" : "OFF";
			stateEl.setAttribute("role", "button");
			stateEl.setAttribute("tabindex", "0");
			stateEl.setAttribute("aria-label", "Enable or disable script logic");
			stateEl.addEventListener("click", (e) => {
				e.preventDefault();
				this.onToggle(root.getAttribute("data-enabled") !== "1");
			});
			stateEl.addEventListener("keydown", (e) => {
				if (e.key !== "Enter" && e.key !== " ") return;
				e.preventDefault();
				this.onToggle(root.getAttribute("data-enabled") !== "1");
			});
			const guardBtn = document.createElement("button");
			guardBtn.type = "button";
			guardBtn.className = "lhvj-guard-btn";
			guardBtn.textContent = scrollGuardEnabled ? "GUARD ON" : "GUARD OFF";
			guardBtn.setAttribute("aria-label", "Toggle scroll cooldown guard");
			guardBtn.addEventListener("click", (e) => {
				e.preventDefault();
				const enabled = root.getAttribute("data-scroll-guard") !== "1";
				this.onScrollGuardToggle(enabled);
			});
			const cooldownEl = document.createElement("span");
			cooldownEl.className = "lhvj-cooldown";
			const settingsBtn = document.createElement("button");
			settingsBtn.type = "button";
			settingsBtn.className = "lhvj-settings-btn";
			settingsBtn.textContent = "Open settings";
			settingsBtn.setAttribute("aria-label", "Toggle settings");
			settingsBtn.addEventListener("click", (e) => {
				e.preventDefault();
				const nextOpen = !(root.getAttribute("data-settings-open") === "1");
				root.setAttribute("data-settings-open", nextOpen ? "1" : "0");
				settingsBtn.textContent = nextOpen ? "Close settings" : "Open settings";
			});
			const footer = document.createElement("div");
			footer.className = "lhvj-footer";
			const settingsPanel = document.createElement("div");
			settingsPanel.className = "lhvj-settings-panel";
			const modeLabel = document.createElement("span");
			modeLabel.className = "lhvj-settings-label";
			modeLabel.textContent = "Detected jobs:";
			const modeGroup = document.createElement("div");
			modeGroup.className = "lhvj-mode-group";
			const modeHideBtn = document.createElement("button");
			modeHideBtn.type = "button";
			modeHideBtn.className = "lhvj-mode-btn";
			modeHideBtn.textContent = "Hide";
			modeHideBtn.setAttribute("data-active", detectionMode === "hide" ? "1" : "0");
			modeHideBtn.addEventListener("click", (e) => {
				e.preventDefault();
				this.onDetectionModeChange("hide");
			});
			const modeHighlightBtn = document.createElement("button");
			modeHighlightBtn.type = "button";
			modeHighlightBtn.className = "lhvj-mode-btn";
			modeHighlightBtn.textContent = "Highlight";
			modeHighlightBtn.setAttribute("data-active", detectionMode === "highlight" ? "1" : "0");
			modeHighlightBtn.addEventListener("click", (e) => {
				e.preventDefault();
				this.onDetectionModeChange("highlight");
			});
			modeGroup.appendChild(modeHideBtn);
			modeGroup.appendChild(modeHighlightBtn);
			const reloadLabel = document.createElement("span");
			reloadLabel.className = "lhvj-settings-label";
			reloadLabel.textContent = "Navigation:";
			const reloadNavBtn = document.createElement("button");
			reloadNavBtn.type = "button";
			reloadNavBtn.className = "lhvj-mode-btn lhvj-reload-nav-btn";
			reloadNavBtn.textContent = reloadOnNavigationEnabled ? "Reload ON" : "Reload OFF";
			reloadNavBtn.setAttribute("data-active", reloadOnNavigationEnabled ? "1" : "0");
			reloadNavBtn.setAttribute("aria-label", "Toggle full page reload on navigation");
			reloadNavBtn.addEventListener("click", (e) => {
				e.preventDefault();
				const enabled = root.getAttribute("data-reload-on-navigation") !== "1";
				this.onReloadNavigationToggle(enabled);
			});
			settingsPanel.appendChild(modeLabel);
			settingsPanel.appendChild(modeGroup);
			settingsPanel.appendChild(reloadLabel);
			settingsPanel.appendChild(reloadNavBtn);
			const repoLabel = document.createElement("span");
			repoLabel.className = "lhvj-settings-label";
			repoLabel.textContent = "Project:";
			const repoLink = document.createElement("a");
			repoLink.className = "lhvj-link-btn";
			repoLink.href = Badge.REPOSITORY_URL;
			repoLink.target = "_blank";
			repoLink.rel = "noopener noreferrer";
			repoLink.textContent = "GitHub Repo";
			repoLink.setAttribute("aria-label", "Open the GitHub repository");
			settingsPanel.appendChild(repoLabel);
			settingsPanel.appendChild(repoLink);
			main.appendChild(stateEl);
			main.appendChild(guardBtn);
			main.appendChild(cooldownEl);
			footer.appendChild(settingsBtn);
			footer.appendChild(countEl);
			content.appendChild(main);
			content.appendChild(footer);
			header.appendChild(dragHandle);
			header.appendChild(content);
			root.appendChild(header);
			root.appendChild(settingsPanel);
			this.makeDraggable(root, dragHandle);
			return root;
		}
		cacheElements(root) {
			this.state.root = root;
			this.state.countNum = root.querySelector(".lhvj-count-num");
			this.state.countUnit = root.querySelector(".lhvj-count-unit");
			this.state.stateEl = root.querySelector(".lhvj-state");
			this.state.guardBtn = root.querySelector(".lhvj-guard-btn");
			this.state.cooldownEl = root.querySelector(".lhvj-cooldown");
			this.state.settingsBtn = root.querySelector(".lhvj-settings-btn");
			this.state.settingsPanel = root.querySelector(".lhvj-settings-panel");
			const modeButtons = root.querySelectorAll(".lhvj-mode-btn");
			this.state.modeHideBtn = modeButtons[0] || null;
			this.state.modeHighlightBtn = modeButtons[1] || null;
			this.state.reloadNavBtn = root.querySelector(".lhvj-reload-nav-btn");
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
				if (dragHandle.hasPointerCapture(pointerId)) dragHandle.releasePointerCapture(pointerId);
				const rect = root.getBoundingClientRect();
				this.applyPosition(root, rect.left, rect.top, true);
				pointerId = null;
				e.preventDefault();
			};
			dragHandle.addEventListener("pointerup", stopDrag);
			dragHandle.addEventListener("pointercancel", stopDrag);
		}
	};
	var app = new class App {
		static PAGINATION_COOLDOWN_CLASS = "lhvj-pagination-cooldown";
		static COUNT_COOLDOWN_STEP = 20;
		storage;
		matcher;
		detection;
		styleManager;
		badge;
		router;
		showHidden;
		scrollGuardEnabled;
		detectionMode;
		reloadOnNavigationEnabled;
		hiddenCount = 0;
		rafId = 0;
		isRuntimeActive = false;
		isReloadingForPathChange = false;
		lastRouteChangeAt = Date.now();
		isCooldownActive = false;
		cooldownUntil = 0;
		lastControlledScrollAt = 0;
		touchLastY = null;
		lastObservedScrollY = 0;
		lastObservedScrollAt = Date.now();
		isAdjustingNativeScroll = false;
		countGrowthSinceCooldown = 0;
		constructor() {
			this.storage = new StorageService();
			this.matcher = new KeywordMatcher();
			this.detection = new DetectionService(this.matcher);
			this.styleManager = new StyleManager();
			this.showHidden = this.storage.getShowHidden();
			this.scrollGuardEnabled = this.storage.getScrollGuardEnabled();
			this.detectionMode = this.storage.getDetectionMode();
			this.reloadOnNavigationEnabled = this.storage.getReloadOnNavigation();
			this.badge = new Badge(this.storage, (checked) => {
				this.showHidden = checked;
				this.storage.setShowHidden(checked);
				if (!checked) {
					this.resetScrollCooldown();
					this.resetCountBasedCooldownProgress();
				}
				this.scheduleRefresh();
			}, (enabled) => {
				this.scrollGuardEnabled = enabled;
				this.storage.setScrollGuardEnabled(enabled);
				if (!enabled) {
					this.resetScrollCooldown();
					this.resetCountBasedCooldownProgress();
				}
				this.scheduleRefresh();
			}, (mode) => {
				this.detectionMode = mode;
				this.storage.setDetectionMode(mode);
				this.scheduleRefresh();
			}, (enabled) => {
				this.reloadOnNavigationEnabled = enabled;
				this.storage.setReloadOnNavigation(enabled);
			});
			this.router = new RouterService(() => this.scheduleRefresh(), () => this.hardRestartRuntimeForPathChange());
		}
init() {
			this.styleManager.inject();
			this.startRuntime();
			this.router.startObserving();
		}
		startRuntime() {
			if (this.isRuntimeActive) return;
			this.lastRouteChangeAt = Date.now();
			this.lastObservedScrollY = window.scrollY;
			this.lastObservedScrollAt = Date.now();
			this.router.restartDomObserver();
			this.scheduleRefresh();
			this.router.queueRefresh(120);
			this.router.queueRefresh(420);
			window.addEventListener("resize", this.onWindowResize);
			window.addEventListener("scroll", this.onWindowScroll, {
				passive: true,
				capture: true
			});
			window.addEventListener("wheel", this.onWheel, {
				passive: false,
				capture: true
			});
			window.addEventListener("mousedown", this.onMouseDown, { capture: true });
			window.addEventListener("auxclick", this.onAuxClick, { capture: true });
			window.addEventListener("keydown", this.onKeyDown, {
				passive: false,
				capture: true
			});
			window.addEventListener("touchstart", this.onTouchStart, { passive: true });
			window.addEventListener("touchmove", this.onTouchMove, {
				passive: false,
				capture: true
			});
			window.addEventListener("touchend", this.onTouchEnd, { passive: true });
			window.addEventListener("touchcancel", this.onTouchEnd, { passive: true });
			this.isRuntimeActive = true;
			if (this.detection.isJobsPage()) this.router.startRouteRefreshBurst();
		}
		hardRestartRuntimeForPathChange() {
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
		scheduleRefresh() {
			if (this.rafId) cancelAnimationFrame(this.rafId);
			this.rafId = requestAnimationFrame(() => {
				this.rafId = 0;
				this.refresh();
			});
		}
		refresh() {
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
				this.badge.ensure(this.showHidden, this.scrollGuardEnabled, this.detectionMode, this.reloadOnNavigationEnabled);
				this.badge.updateCount(0, this.showHidden, this.scrollGuardEnabled, this.detectionMode, this.reloadOnNavigationEnabled, 0);
				return;
			}
			if (!this.isCountCooldownPage()) this.resetCountBasedCooldownProgress();
			const cards = this.detection.getJobCards();
			if (cards.length === 0 && Date.now() - this.lastRouteChangeAt < CONFIG.LAZY_RENDER_TIMEOUT_MS) {
				this.router.queueRefresh(180);
				this.router.queueRefresh(600);
			}
			const viewedCardsFromMarkers = this.detection.getViewedCardsFromMarkers();
			const viewedCards = new Set(viewedCardsFromMarkers);
			for (const card of cards) if (!viewedCards.has(card) && this.detection.isViewedJobCard(card)) viewedCards.add(card);
			this.hiddenCount = 0;
			for (const card of cards) {
				const viewed = viewedCards.has(card);
				if (viewed) this.hiddenCount++;
				this.detection.applyVisibility(card, viewed && this.detectionMode === "hide");
				this.detection.applyViewedHighlight(card, viewed && this.detectionMode === "highlight");
			}
			const shouldHideDetected = this.detectionMode === "hide";
			const anchorResult = this.detection.refreshViewedAnchors(shouldHideDetected);
			const fallbackCards = this.detection.refreshJobsViewedCardsFallback(shouldHideDetected);
			const finalViewedCards = new Set(viewedCards);
			anchorResult.viewedAnchorCards.forEach((c) => finalViewedCards.add(c));
			fallbackCards.forEach((c) => finalViewedCards.add(c));
			document.querySelectorAll("[data-lhvj-hidden=\"1\"]").forEach((node) => {
				if (!shouldHideDetected || !finalViewedCards.has(node)) this.detection.applyVisibility(node, false);
			});
			document.querySelectorAll("[data-lhvj-viewed=\"1\"]").forEach((node) => {
				if (!finalViewedCards.has(node) || shouldHideDetected) this.detection.applyViewedHighlight(node, false);
			});
			this.hiddenCount = Math.max(this.hiddenCount, anchorResult.viewedAnchorCount, fallbackCards.size);
			this.maybeStartCountBasedCooldown(previousHiddenCount);
			this.badge.ensure(this.showHidden, this.scrollGuardEnabled, this.detectionMode, this.reloadOnNavigationEnabled);
			this.badge.updateCount(this.hiddenCount, this.showHidden, this.scrollGuardEnabled, this.detectionMode, this.reloadOnNavigationEnabled, this.getCooldownSecondsLeft());
		}
		onWindowResize = () => {
			this.badge.syncPositionWithinViewport();
		};
		onWheel = (e) => {
			if (e.deltaY <= 0) return;
			if (this.handleScrollGuardInput(e.deltaY, () => {
				e.preventDefault();
				e.stopPropagation();
			})) this.scheduleRefresh();
		};
		onWindowScroll = () => {
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
			if (this.isCooldownActive && !this.isAdjustingNativeScroll) {
				const allowedDelta = Math.max(14, CONFIG.SCROLL_GUARD_ALLOWED_STEP_PX * elapsedMs / CONFIG.SCROLL_GUARD_ALLOWED_STEP_MIN_INTERVAL_MS);
				if (deltaY > allowedDelta) {
					const clampedY = this.lastObservedScrollY + allowedDelta;
					this.isAdjustingNativeScroll = true;
					window.scrollTo({
						top: clampedY,
						behavior: "auto"
					});
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
		onMouseDown = (e) => {
			if (e.button !== 1) return;
			if (!this.shouldBlockMiddleMouseDuringCooldown()) return;
			e.preventDefault();
			e.stopPropagation();
		};
		onAuxClick = (e) => {
			if (e.button !== 1) return;
			if (!this.shouldBlockMiddleMouseDuringCooldown()) return;
			e.preventDefault();
			e.stopPropagation();
		};
		onKeyDown = (e) => {
			if (this.isEditableTarget(e.target)) return;
			const key = e.key;
			let delta = 0;
			if (key === "ArrowDown") delta = 96;
			else if (key === "PageDown") delta = Math.max(window.innerHeight * .85, 280);
			else if (key === " ") {
				if (e.shiftKey) return;
				delta = Math.max(window.innerHeight * .85, 280);
			}
			if (delta <= 0) return;
			if (this.handleScrollGuardInput(delta, () => {
				e.preventDefault();
				e.stopPropagation();
			})) this.scheduleRefresh();
		};
		onTouchStart = (e) => {
			if (e.touches.length === 0) return;
			this.touchLastY = e.touches[0].clientY;
		};
		onTouchMove = (e) => {
			if (e.touches.length === 0 || this.touchLastY === null) return;
			const currentY = e.touches[0].clientY;
			const delta = this.touchLastY - currentY;
			this.touchLastY = currentY;
			if (delta <= 0) return;
			if (this.handleScrollGuardInput(delta, () => {
				e.preventDefault();
				e.stopPropagation();
			})) this.scheduleRefresh();
		};
		onTouchEnd = () => {
			this.touchLastY = null;
		};
		handleScrollGuardInput(deltaY, cancelDefault) {
			if (!this.shouldUseScrollGuard()) return false;
			this.syncCooldownState();
			if (!this.isCooldownActive) return false;
			cancelDefault();
			this.applyControlledScroll(deltaY);
			return true;
		}
		shouldUseScrollGuard() {
			if (!this.scrollGuardEnabled) return false;
			if (!this.showHidden) return false;
			return this.detection.isJobsPage();
		}
		shouldBlockMiddleMouseDuringCooldown() {
			if (!this.isCooldownActive) return false;
			return this.shouldUseScrollGuard();
		}
		shouldUseCountBasedCooldown() {
			if (!this.scrollGuardEnabled) return false;
			if (!this.showHidden) return false;
			return this.isCountCooldownPage();
		}
		maybeStartCountBasedCooldown(previousHiddenCount) {
			if (!this.shouldUseCountBasedCooldown()) return;
			if (this.hiddenCount > previousHiddenCount) this.countGrowthSinceCooldown += this.hiddenCount - previousHiddenCount;
			if (this.countGrowthSinceCooldown < App.COUNT_COOLDOWN_STEP) return;
			const triggerCount = Math.floor(this.countGrowthSinceCooldown / App.COUNT_COOLDOWN_STEP);
			this.countGrowthSinceCooldown -= triggerCount * App.COUNT_COOLDOWN_STEP;
			for (let i = 0; i < triggerCount; i++) this.startRandomCooldown();
		}
		resetCountBasedCooldownProgress() {
			this.countGrowthSinceCooldown = 0;
		}
		isJobsHomepage() {
			const path = location.pathname;
			return path === "/jobs" || path === "/jobs/";
		}
		isCollectionsPage() {
			return location.pathname.startsWith("/jobs/collections");
		}
		isCountCooldownPage() {
			return this.isJobsHomepage() || this.isCollectionsPage();
		}
		startRandomCooldown() {
			const minMs = CONFIG.SCROLL_GUARD_COOLDOWN_MIN_MS;
			const maxMs = CONFIG.SCROLL_GUARD_COOLDOWN_MAX_MS;
			const durationMs = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
			if (this.isCooldownActive) this.cooldownUntil += durationMs;
			else {
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
		applyControlledScroll(deltaY) {
			const now = Date.now();
			if (now - this.lastControlledScrollAt < CONFIG.SCROLL_GUARD_ALLOWED_STEP_MIN_INTERVAL_MS) return;
			const step = Math.min(Math.max(deltaY, 0), CONFIG.SCROLL_GUARD_ALLOWED_STEP_PX);
			if (step <= 0) return;
			window.scrollBy({
				top: step,
				behavior: "auto"
			});
			this.lastControlledScrollAt = now;
		}
		syncCooldownState() {
			if (!this.isCooldownActive) return;
			if (Date.now() < this.cooldownUntil) return;
			this.resetScrollCooldown();
		}
		resetScrollCooldown() {
			this.isCooldownActive = false;
			this.cooldownUntil = 0;
			this.lastControlledScrollAt = 0;
			this.isAdjustingNativeScroll = false;
			this.syncPaginationCooldownClass();
		}
		getCooldownSecondsLeft() {
			if (!this.isCooldownActive) return 0;
			const msLeft = this.cooldownUntil - Date.now();
			if (msLeft <= 0) return 0;
			return Math.ceil(msLeft / 1e3);
		}
		isEditableTarget(target) {
			if (!(target instanceof HTMLElement)) return false;
			if (target.isContentEditable) return true;
			return !!target.closest("input, textarea, select, [contenteditable=\"true\"], [role=\"textbox\"]");
		}
		clearDetectedVisualState() {
			const { HIDDEN_CLASS } = DOM_IDS;
			document.querySelectorAll("[data-lhvj-hidden=\"1\"]").forEach((node) => {
				this.detection.applyVisibility(node, false);
			});
			document.querySelectorAll("[data-lhvj-viewed=\"1\"]").forEach((node) => {
				this.detection.applyViewedHighlight(node, false);
			});
			document.querySelectorAll("a[data-lhvj-hidden-anchor=\"1\"]").forEach((node) => {
				node.classList.remove(HIDDEN_CLASS);
				node.removeAttribute("data-lhvj-hidden-anchor");
			});
		}
		syncPaginationCooldownClass() {
			const root = document.documentElement;
			if (!root) return;
			const shouldDisablePagination = this.isCooldownActive && this.detection.isJobsPage();
			root.classList.toggle(App.PAGINATION_COOLDOWN_CLASS, shouldDisablePagination);
		}
	}();
	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => app.init(), { once: true });
	else app.init();
})();