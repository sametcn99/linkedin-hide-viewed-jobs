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
// @version            1.1.5
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
	//#region \0./main-BbuNg8xE.js
	var t = Object.freeze({
		POLL_INTERVAL_MS: 2e3,
		ROUTE_CHECK_INTERVAL_MS: 500,
		ROUTE_BURST_INTERVAL_MS: 250,
		ROUTE_BURST_MAX_TICKS: 12,
		LAZY_RENDER_TIMEOUT_MS: 8e3,
		MUTATION_DEBOUNCE_MS: 80,
		UI_Z_INDEX: 99999,
		UI_EDGE_MARGIN: 8,
		ENABLE_HIGHLIGHT: 1,
		VIEWED_HIGHLIGHT_COLOR: "#2ecc71",
		APPLIED_HIGHLIGHT_COLOR: "#f59e0b",
		ACTIVE_HIGHLIGHT_COLOR: "#0a66c2",
		HIGHLIGHT_OPACITY: .1,
		HIGHLIGHT_OPACITY_MIN: .04,
		HIGHLIGHT_OPACITY_MAX: .28,
		HIGHLIGHT_OPACITY_STEP: .01,
		HIGHLIGHT_BORDER_RADIUS: "6px",
		SCROLL_GUARD_ENABLED_DEFAULT: 1,
		SCROLL_GUARD_TRIGGER_DELTA_PX: 900,
		SCROLL_GUARD_TRIGGER_WINDOW_MS: 1200,
		SCROLL_GUARD_COOLDOWN_MIN_MS: 5e3,
		SCROLL_GUARD_COOLDOWN_MAX_MS: 15e3,
		SCROLL_GUARD_ALLOWED_STEP_PX: 110,
		SCROLL_GUARD_ALLOWED_STEP_MIN_INTERVAL_MS: 120,
		SCROLL_GUARD_MIN_VIEWED_DENSITY: .55,
		SCROLL_GUARD_DENSITY_WINDOW_MS: 6e3
	}), n = Object.freeze({
		STORAGE_KEY: "lhvj-show-hidden",
		SCROLL_GUARD_STORAGE_KEY: "lhvj-scroll-guard-enabled",
		DETECTION_MODE_STORAGE_KEY: "lhvj-detection-mode",
		RELOAD_ON_NAVIGATION_STORAGE_KEY: "lhvj-reload-on-navigation",
		VIEWED_HIGHLIGHT_COLOR_STORAGE_KEY: "lhvj-viewed-highlight-color",
		APPLIED_HIGHLIGHT_COLOR_STORAGE_KEY: "lhvj-applied-highlight-color",
		ACTIVE_HIGHLIGHT_COLOR_STORAGE_KEY: "lhvj-active-highlight-color",
		HIGHLIGHT_OPACITY_STORAGE_KEY: "lhvj-highlight-opacity",
		UI_POSITION_KEY: "lhvj-ui-position",
		HIDDEN_CLASS: "lhvj-hidden-by-script",
		UI_ID: "lhvj-toggle-root",
		VIEWED_HIGHLIGHT_CLASS: "lhvj-viewed-highlight",
		APPLIED_HIGHLIGHT_CLASS: "lhvj-applied-highlight",
		ACTIVE_HIGHLIGHT_CLASS: "lhvj-active-highlight"
	}), i = Object.freeze([
		"Viewed",
		"Seen",
		"Görüntülenen",
		"Görüntülendi",
		"Visto",
		"Vistos",
		"Visualizado",
		"Visualizados",
		"Vu",
		"Vue",
		"Angesehen",
		"Gesehen",
		"Visualizzato",
		"Visto",
		"Bekeken",
		"Просмотрено",
		"Wyświetlono",
		"Visad",
		"Sedd",
		"已查看",
		"已檢視",
		"閲覧済み",
		"조회됨",
		"تمت المشاهدة",
		"देखा गया"
	]), e = Object.freeze([
		"Applied",
		"Başvurulan",
		"Başvurulanlar",
		"Başvuruldu",
		"Aplicado",
		"Postulado",
		"Candidatado",
		"Candidatura",
		"Postulé",
		"Postulée",
		"Candidature",
		"Beworben",
		"Candidata",
		"Candidati",
		"Candidatura",
		"Solliciteerd",
		"Откликнулся",
		"Aplikowano",
		"Sökt",
		"已申请",
		"已申請",
		"応募済み",
		"지원함",
		"지원 완료",
		"تم التقديم",
		"आवेदन किया गया"
	]), o = Object.freeze([
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
	]), s = Object.freeze([
		"li.job-card-container__footer-job-state",
		"li[class*=\"footer-job-state\"]",
		".job-card-container__footer-wrapper li",
		"[class*=\"job-card-footer\"]",
		"[class*=\"job-state\"]",
		"[data-jobstate]",
		"[data-viewed=\"true\"]",
		"span.job-card-list__footer"
	]), a = Object.freeze([
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
	]), r = o.join(","), l = s.join(","), h = a.join(","), d = [r, "[data-job-id],.job-card-container,.job-card-list,.base-card,.job-search-card,li[class*=\"jobs-search\"],li[class*=\"job-card\"],div[class*=\"job-card\"],article[class*=\"job\"],article[class*=\"base-card\"],.jobs-collections-module__job-card,.jobs-collections-module__job-card-container,li.jobs-collections-module__list-item,div.jobs-collections-module__list-item"].join(","), c = class {
		getItem(t) {
			try {
				return window.localStorage.getItem(t);
			} catch {
				return null;
			}
		}
		setItem(t, n) {
			try {
				window.localStorage.setItem(t, n);
			} catch {}
		}
		getShowHidden() {
			return "1" === this.getItem(n.STORAGE_KEY);
		}
		setShowHidden(t) {
			this.setItem(n.STORAGE_KEY, t ? "1" : "0");
		}
		getScrollGuardEnabled() {
			const i = this.getItem(n.SCROLL_GUARD_STORAGE_KEY);
			return "0" === i ? 0 : "1" === i ? 1 : t.SCROLL_GUARD_ENABLED_DEFAULT;
		}
		setScrollGuardEnabled(t) {
			this.setItem(n.SCROLL_GUARD_STORAGE_KEY, t ? "1" : "0");
		}
		getDetectionMode() {
			return "highlight" === this.getItem(n.DETECTION_MODE_STORAGE_KEY) ? "highlight" : "hide";
		}
		setDetectionMode(t) {
			this.setItem(n.DETECTION_MODE_STORAGE_KEY, t);
		}
		getReloadOnNavigation() {
			return "1" === this.getItem(n.RELOAD_ON_NAVIGATION_STORAGE_KEY);
		}
		setReloadOnNavigation(t) {
			this.setItem(n.RELOAD_ON_NAVIGATION_STORAGE_KEY, t ? "1" : "0");
		}
		getHighlightColors() {
			return {
				viewed: this.getHighlightColor(n.VIEWED_HIGHLIGHT_COLOR_STORAGE_KEY, t.VIEWED_HIGHLIGHT_COLOR),
				applied: this.getHighlightColor(n.APPLIED_HIGHLIGHT_COLOR_STORAGE_KEY, t.APPLIED_HIGHLIGHT_COLOR),
				active: this.getHighlightColor(n.ACTIVE_HIGHLIGHT_COLOR_STORAGE_KEY, t.ACTIVE_HIGHLIGHT_COLOR)
			};
		}
		setViewedHighlightColor(i) {
			this.setItem(n.VIEWED_HIGHLIGHT_COLOR_STORAGE_KEY, this.normalizeHighlightColor(i, t.VIEWED_HIGHLIGHT_COLOR));
		}
		setAppliedHighlightColor(i) {
			this.setItem(n.APPLIED_HIGHLIGHT_COLOR_STORAGE_KEY, this.normalizeHighlightColor(i, t.APPLIED_HIGHLIGHT_COLOR));
		}
		setActiveHighlightColor(i) {
			this.setItem(n.ACTIVE_HIGHLIGHT_COLOR_STORAGE_KEY, this.normalizeHighlightColor(i, t.ACTIVE_HIGHLIGHT_COLOR));
		}
		resetViewedHighlightColor() {
			this.setViewedHighlightColor(t.VIEWED_HIGHLIGHT_COLOR);
		}
		resetAppliedHighlightColor() {
			this.setAppliedHighlightColor(t.APPLIED_HIGHLIGHT_COLOR);
		}
		resetActiveHighlightColor() {
			this.setActiveHighlightColor(t.ACTIVE_HIGHLIGHT_COLOR);
		}
		getHighlightOpacity() {
			const i = this.getItem(n.HIGHLIGHT_OPACITY_STORAGE_KEY);
			return this.normalizeHighlightOpacity(i, t.HIGHLIGHT_OPACITY);
		}
		setHighlightOpacity(i) {
			const e = this.normalizeHighlightOpacity(i + "", t.HIGHLIGHT_OPACITY);
			this.setItem(n.HIGHLIGHT_OPACITY_STORAGE_KEY, e.toFixed(2));
		}
		resetHighlightOpacity() {
			this.setHighlightOpacity(t.HIGHLIGHT_OPACITY);
		}
		getSavedPosition() {
			try {
				const t = this.getItem(n.UI_POSITION_KEY);
				if (!t) return null;
				const i = JSON.parse(t);
				return i && "number" == typeof i.left && "number" == typeof i.top && Number.isFinite(i.left) && Number.isFinite(i.top) ? {
					left: i.left,
					top: i.top
				} : null;
			} catch {
				return null;
			}
		}
		savePosition(t) {
			this.setItem(n.UI_POSITION_KEY, JSON.stringify(t));
		}
		getHighlightColor(t, n) {
			const i = this.getItem(t);
			return this.normalizeHighlightColor(i, n);
		}
		normalizeHighlightColor(t, n) {
			return t && /^#[0-9a-fA-F]{6}$/.test(t) ? t.toLowerCase() : n;
		}
		normalizeHighlightOpacity(n, i) {
			if (!n) return i;
			const e = +n;
			return Number.isFinite(e) ? Math.min(t.HIGHLIGHT_OPACITY_MAX, Math.max(t.HIGHLIGHT_OPACITY_MIN, e)) : i;
		}
	}, u = class {
		t;
		i;
		constructor() {
			this.t = i.map((t) => this.normalize(t)).filter((t) => t.length > 0), this.i = e.map((t) => this.normalize(t)).filter((t) => t.length > 0);
		}
		normalize(t) {
			return (t || "").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		}
		getDetectedStateFromText(t) {
			const n = this.normalize(t);
			return n ? this.containsAnyKeyword(n, this.i) ? "applied" : this.containsAnyKeyword(n, this.t) ? "viewed" : null : null;
		}
		getDetectedStateFromElement(t) {
			const n = (t.textContent || "").trim(), i = t.getAttribute("aria-label") || "", e = t.getAttribute("title") || "";
			return this.getDetectedStateFromText(n) || this.getDetectedStateFromText(i) || this.getDetectedStateFromText(e);
		}
		containsAnyKeyword(t, n) {
			for (const i of n) if (this.containsKeywordExactly(t, i)) return 1;
			return 0;
		}
		containsKeywordExactly(t, n) {
			let i = 0;
			for (; t.length > i;) {
				const e = t.indexOf(n, i);
				if (-1 === e) return 0;
				if (this.hasBoundary(t, e, n.length)) return 1;
				i = e + 1;
			}
			return 0;
		}
		hasBoundary(t, n, i) {
			const e = n + i, o = t.length > e ? t[e] : "";
			return !this.isAsciiLetterOrNumber(n > 0 ? t[n - 1] : "") && !this.isAsciiLetterOrNumber(o);
		}
		isAsciiLetterOrNumber(t) {
			if (!t) return 0;
			const n = t.charCodeAt(0);
			return n >= 48 && 57 >= n || n >= 65 && 90 >= n || n >= 97 && 122 >= n;
		}
	}, p = class {
		matcher;
		constructor(t) {
			this.matcher = t;
		}
		getJobCards() {
			const t = /* @__PURE__ */ new Set();
			return document.querySelectorAll(r).forEach((n) => {
				t.add(n);
			}), Array.from(t);
		}
		getDetectedCardsFromMarkers() {
			const t = /* @__PURE__ */ new Map();
			return document.querySelectorAll(l).forEach((n) => {
				if (!this.isElementVisible(n)) return;
				const i = this.matcher.getDetectedStateFromElement(n);
				if (!i) return;
				const e = this.getCardFromNode(n);
				e && this.setDetectedState(t, e, i);
			}), t;
		}
		getDetectedJobState(t) {
			const n = this.matcher.getDetectedStateFromText(t.className || "");
			if (n) return n;
			const i = this.matcher.getDetectedStateFromElement(t);
			if (i) return i;
			const e = t.querySelectorAll("ul li");
			for (let o = 0; e.length > o; o++) {
				if (!this.isElementVisible(e[o])) continue;
				const t = this.matcher.getDetectedStateFromElement(e[o]);
				if (t) return t;
			}
			return this.cardContainsDetectedStateInDescendants(t, "[aria-label], [title], span, small, div, p, time", 100) || (t.matches("li.discovery-templates-entity-item, li[class*=\"discovery-templates-entity-item\"]") ? this.cardContainsDetectedStateInDescendants(t, "*", 140) : null);
		}
		refreshDetectedAnchors(t) {
			let n = 0;
			const i = /* @__PURE__ */ new Map();
			return this.shouldUseAnchorDetection() ? (this.getPotentialViewedAnchors().forEach((e) => {
				const o = this.getCardFromAnchor(e), s = o || e.closest("li, article, div") || e, a = "1" === e.getAttribute("data-lhvj-hidden-anchor"), r = a && t ? "viewed" : this.getDetectedAnchorState(e, s);
				r && (n++, o && (this.setDetectedState(i, o, r), this.applyVisibility(o, t), this.applyDetectedHighlight(o, t ? null : r))), (r || a) && this.applyAnchorVisibility(e, !!r && t);
			}), {
				detectedAnchorCount: n,
				detectedAnchorCards: i
			}) : (this.restoreHiddenAnchors(), {
				detectedAnchorCount: n,
				detectedAnchorCards: i
			});
		}
		refreshDetectedCardsFallback(t) {
			const n = /* @__PURE__ */ new Map();
			return this.isJobsPage() ? (document.querySelectorAll(l).forEach((i) => {
				if (!this.isElementVisible(i)) return;
				const e = this.matcher.getDetectedStateFromElement(i);
				if (!e) return;
				const o = this.getCardFromViewedMarker(i);
				o && (this.setDetectedState(n, o, e), this.applyVisibility(o, t), this.applyDetectedHighlight(o, t ? null : e));
			}), n) : n;
		}
		applyVisibility(t, i) {
			i ? (t.classList.add(n.HIDDEN_CLASS), t.setAttribute("data-lhvj-hidden", "1")) : (t.classList.remove(n.HIDDEN_CLASS), t.removeAttribute("data-lhvj-hidden"));
		}
		applyDetectedHighlight(t, i) {
			const { VIEWED_HIGHLIGHT_CLASS: e, APPLIED_HIGHLIGHT_CLASS: o } = n;
			if (t.classList.remove(e, o), t.removeAttribute("data-lhvj-viewed"), t.removeAttribute("data-lhvj-applied"), "viewed" === i) return t.classList.add(e), void t.setAttribute("data-lhvj-viewed", "1");
			"applied" === i && (t.classList.add(o), t.setAttribute("data-lhvj-applied", "1"));
		}
		getActiveCards(t) {
			const n = /* @__PURE__ */ new Set(), i = this.getPageCurrentJobId();
			if (!i) return n;
			for (const e of t) this.cardContainsMatchingCurrentJobId(e, i) && n.add(e);
			return n;
		}
		applyActiveHighlight(t, i) {
			if (i) return t.classList.add(n.ACTIVE_HIGHLIGHT_CLASS), void t.setAttribute("data-lhvj-active", "1");
			t.classList.remove(n.ACTIVE_HIGHLIGHT_CLASS), t.removeAttribute("data-lhvj-active");
		}
		isJobsPage() {
			return this.isJobsPath(location.pathname);
		}
		isElementVisible(t) {
			if (t.hasAttribute("hidden")) return 0;
			if ("true" === t.getAttribute("aria-hidden")) return 0;
			const n = window.getComputedStyle(t);
			if ("none" === n.display || "hidden" === n.visibility) return 0;
			if (0 === parseFloat(n.opacity)) return 0;
			try {
				const n = t.getClientRects();
				if (n && 0 === n.length) return 0;
			} catch {}
			return 1;
		}
		getCardFromNode(t) {
			return t.closest(r) ?? null;
		}
		getCardFromAnchor(t) {
			return t.closest(r) || t.closest(d) || (t.matches("a[href*=\"/jobs/view/\"], a[href*=\"/jobs/collections/\"], a[href*=\"currentJobId=\"]") ? t : null);
		}
		getCardFromViewedMarker(t) {
			return t.closest(d) ?? null;
		}
		isJobsRootPath(t) {
			return "/jobs" === t || "/jobs/" === t;
		}
		isJobsSubPath(t) {
			return t.startsWith("/jobs/");
		}
		isJobsPath(t) {
			return this.isJobsRootPath(t) || this.isJobsSubPath(t) || t.includes("/jobs");
		}
		shouldUseAnchorDetection() {
			return this.isJobsPath(location.pathname);
		}
		restoreHiddenAnchors() {
			document.querySelectorAll("a[data-lhvj-hidden-anchor=\"1\"]").forEach((t) => {
				this.applyAnchorVisibility(t, 0);
			});
		}
		getPotentialViewedAnchors() {
			const t = /* @__PURE__ */ new Set();
			return document.querySelectorAll("a[href]").forEach((n) => {
				const i = n.getAttribute("href") || "";
				(i.includes("/jobs/view/") || i.includes("/jobs/collections/") || i.includes("/jobs/collections/recommended") || i.includes("/jobs/search/") || i.includes("currentJobId=") || i.includes("trk=public_jobs")) && t.add(n);
			}), document.querySelectorAll(h).forEach((n) => {
				t.add(n);
			}), document.querySelectorAll("a[data-lhvj-hidden-anchor=\"1\"]").forEach((n) => {
				t.add(n);
			}), Array.from(t);
		}
		getDetectedAnchorState(t, n) {
			if (!this.isElementVisible(t)) return null;
			const i = this.matcher.getDetectedStateFromElement(t);
			if (i) return i;
			const e = t.querySelectorAll("[aria-label], [title]");
			for (let o = 0; e.length > o; o++) {
				if (!this.isElementVisible(e[o])) continue;
				const t = this.matcher.getDetectedStateFromElement(e[o]);
				if (t) return t;
			}
			return n ? this.getDetectedStateInScope(n) : null;
		}
		getDetectedStateInScope(t) {
			return this.cardContainsDetectedStateInDescendants(t, l, 24) || this.cardContainsDetectedStateInDescendants(t, "[aria-label], [title], span, small, p, time, li", 80);
		}
		cardContainsDetectedStateInDescendants(t, n, i) {
			const e = t.querySelectorAll(n), o = Math.min(e.length, i);
			for (let s = 0; o > s; s++) {
				if (!this.isElementVisible(e[s])) continue;
				const t = this.matcher.getDetectedStateFromElement(e[s]);
				if ("applied" === t) return t;
				if ("viewed" === t) return t;
			}
			return null;
		}
		setDetectedState(t, n, i) {
			const e = t.get(n);
			"applied" !== e && ("applied" !== i && e || t.set(n, i));
		}
		applyAnchorVisibility(t, i) {
			i ? (t.classList.add(n.HIDDEN_CLASS), t.setAttribute("data-lhvj-hidden-anchor", "1")) : (t.classList.remove(n.HIDDEN_CLASS), t.removeAttribute("data-lhvj-hidden-anchor"));
		}
		getPageCurrentJobId() {
			const t = new URLSearchParams(location.search).get("currentJobId");
			return t && /^\d+$/.test(t) ? t : null;
		}
		cardContainsMatchingCurrentJobId(t, n) {
			const i = t.matches("a[href]") ? [t] : Array.from(t.querySelectorAll("a[href]"));
			for (let e = 0; i.length > e; e++) if (this.hrefMatchesCurrentJobId(i[e].href, n)) return 1;
			return 0;
		}
		hrefMatchesCurrentJobId(t, n) {
			if (!t) return 0;
			try {
				return new URL(t, location.origin).searchParams.get("currentJobId") === n;
			} catch {
				return 0;
			}
		}
	}, g = class {
		o = location.href;
		l = location.pathname;
		h = null;
		u = null;
		p = null;
		v = /* @__PURE__ */ new Map();
		onRefresh;
		onPathChange;
		constructor(t, n) {
			this.onRefresh = t, this.onPathChange = n;
		}
		startObserving() {
			this.observeRouteChanges(), this.observeDomChanges();
		}
		stopAll() {
			this.stopDomObserver(), this.clearRouteRefreshBurst(), this.v.forEach((t) => clearTimeout(t)), this.v.clear();
		}
		queueRefresh(t) {
			if (this.v.has(t)) return;
			const n = setTimeout(() => {
				this.v.delete(t), this.onRefresh();
			}, t);
			this.v.set(t, n);
		}
		startRouteRefreshBurst() {
			let n = 0;
			this.clearRouteRefreshBurst(), this.h = setInterval(() => {
				n++, this.onRefresh(), t.ROUTE_BURST_MAX_TICKS > n || this.clearRouteRefreshBurst();
			}, t.ROUTE_BURST_INTERVAL_MS);
		}
		restartDomObserver() {
			this.stopDomObserver(), this.observeDomChanges();
		}
		observeRouteChanges() {
			const t = () => this.onLocationMaybeChanged();
			this.wrapHistoryMethod("pushState", t), this.wrapHistoryMethod("replaceState", t), window.addEventListener("popstate", t), window.addEventListener("hashchange", t);
		}
		observeDomChanges() {
			this.stopDomObserver(), this.u = new MutationObserver(() => {
				this.p || (this.p = setTimeout(() => {
					this.p = null, this.onRefresh();
				}, t.MUTATION_DEBOUNCE_MS));
			}), document.body && this.u.observe(document.body, {
				childList: 1,
				subtree: 1,
				attributes: 0
			});
		}
		stopDomObserver() {
			this.p && (clearTimeout(this.p), this.p = null), this.u && (this.u.disconnect(), this.u = null);
		}
		clearRouteRefreshBurst() {
			this.h && (clearInterval(this.h), this.h = null);
		}
		onLocationMaybeChanged() {
			const t = location.href, n = location.pathname;
			if (t !== this.o) {
				if (this.o = t, n !== this.l) return this.l = n, void this.onPathChange();
				this.onRefresh(), this.queueRefresh(120), this.queueRefresh(420);
			}
		}
		wrapHistoryMethod(t, n) {
			const i = history[t];
			"function" == typeof i && (history[t] = function(...t) {
				const e = i.apply(this, t);
				return n(), e;
			});
		}
	}, b = class {
		j = null;
		inject(t) {
			const n = document.getElementById("lhvj-style");
			if (n) return this.j = n, void (this.j.textContent = this.buildCSS(t));
			const i = document.createElement("style");
			i.id = "lhvj-style", i.textContent = this.buildCSS(t), document.head.appendChild(i), this.j = i;
		}
		updateHighlightStyles(t) {
			this.j && document.head.contains(this.j) ? this.j.textContent = this.buildCSS(t) : this.inject(t);
		}
		buildCSS(i) {
			const { HIDDEN_CLASS: e, UI_ID: o, VIEWED_HIGHLIGHT_CLASS: s, APPLIED_HIGHLIGHT_CLASS: a, ACTIVE_HIGHLIGHT_CLASS: r } = n, { UI_Z_INDEX: l, HIGHLIGHT_BORDER_RADIUS: h } = t, d = this.withAlpha(i.colors.viewed, i.opacity), c = this.withAlpha(i.colors.applied, i.opacity), u = this.withAlpha(i.colors.active, i.opacity);
			return `\n      .${e} {\n        height: 1px !important;\n        min-height: 1px !important;\n        max-height: 1px !important;\n        margin-top: 0 !important;\n        margin-bottom: 0 !important;\n        padding-top: 0 !important;\n        padding-bottom: 0 !important;\n        overflow: hidden !important;\n        opacity: 0 !important;\n      }\n\n      #${o} {\n        --lhvj-bg: linear-gradient(150deg, rgba(34, 40, 46, 0.98), rgba(22, 27, 33, 0.98));\n        --lhvj-border: rgba(255, 255, 255, 0.16);\n        --lhvj-text: #e6edf3;\n        --lhvj-muted: #9aa8b6;\n        --lhvj-chip-bg: rgba(255, 255, 255, 0.08);\n        --lhvj-chip-border: rgba(255, 255, 255, 0.16);\n        --lhvj-focus: #82c8ff;\n        position: fixed;\n        top: 76px;\n        right: 16px;\n        z-index: ${l};\n        font-family: "Segoe UI Variable", "Segoe UI", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;\n        background: var(--lhvj-bg);\n        border-radius: 999px;\n        border: 1px solid var(--lhvj-border);\n        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.28);\n        display: inline-flex;\n        flex-direction: column;\n        align-items: stretch;\n        min-height: 36px;\n        width: fit-content;\n        overflow: hidden;\n        user-select: none;\n        backdrop-filter: blur(6px);\n        transition: box-shadow 0.16s ease, transform 0.16s ease, border-color 0.16s ease;\n      }\n\n      #${o}[data-settings-open="1"] {\n        border-radius: 14px;\n      }\n\n      #${o}[data-enabled="0"] {\n        width: fit-content;\n      }\n\n      #${o}:hover {\n        border-color: rgba(160, 214, 255, 0.38);\n        box-shadow: 0 14px 30px rgba(0, 0, 0, 0.42), 0 3px 8px rgba(0, 0, 0, 0.26);\n      }\n\n      #${o}:focus-within {\n        border-color: rgba(130, 200, 255, 0.75);\n        box-shadow: 0 0 0 2px rgba(130, 200, 255, 0.22), 0 10px 24px rgba(0, 0, 0, 0.35);\n      }\n\n      #${o}.lhvj-dragging {\n        transform: scale(1.01);\n        box-shadow: 0 16px 34px rgba(0, 0, 0, 0.45), 0 4px 10px rgba(0, 0, 0, 0.28);\n      }\n\n      #${o} .lhvj-header {\n        display: inline-flex;\n        align-items: stretch;\n        width: 100%;\n      }\n\n      #${o} .lhvj-content {\n        display: flex;\n        flex: 1;\n        min-width: 0;\n        flex-direction: column;\n      }\n\n      #${o} .lhvj-drag-handle {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: 30px;\n        align-self: stretch;\n        cursor: grab;\n        border-right: 1px solid rgba(255, 255, 255, 0.1);\n        color: #5a6774;\n        flex-shrink: 0;\n        transition: color 0.14s ease, background 0.14s ease;\n      }\n\n      #${o} .lhvj-drag-handle:hover {\n        color: #b9c6d3;\n        background: rgba(255, 255, 255, 0.05);\n      }\n\n      #${o} .lhvj-drag-handle::before {\n        content: "";\n        display: block;\n        width: 8px;\n        height: 12px;\n        background: radial-gradient(circle, currentColor 1.2px, transparent 1.2px);\n        background-size: 4px 4px;\n      }\n\n      #${o} .lhvj-main {\n        display: inline-flex;\n        align-items: center;\n        justify-content: flex-start;\n        gap: 8px;\n        padding: 4px 10px 4px 8px;\n        min-height: 36px;\n        cursor: default;\n      }\n\n      #${o} .lhvj-footer {\n        display: flex;\n        align-items: center;\n        justify-content: flex-start;\n        gap: 10px;\n        padding: 0 10px 8px 8px;\n      }\n\n      #${o} .lhvj-count {\n        display: inline-flex;\n        align-items: baseline;\n        gap: 4px;\n        white-space: nowrap;\n      }\n\n      #${o} .lhvj-count-num {\n        font-size: 13px;\n        font-weight: 700;\n        letter-spacing: 0.1px;\n        line-height: 1;\n        color: var(--lhvj-text);\n      }\n\n      #${o} .lhvj-count-unit {\n        font-size: 11px;\n        font-weight: 500;\n        line-height: 1;\n        color: var(--lhvj-muted);\n      }\n\n      #${o} .lhvj-state {\n        display: inline-flex;\n        align-items: center;\n        justify-content: center;\n        min-width: 34px;\n        padding: 3px 8px;\n        border-radius: 999px;\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.36px;\n        line-height: 1;\n        text-align: center;\n        color: #d2dde7;\n        border: 1px solid rgba(255, 255, 255, 0.14);\n        background: rgba(255, 255, 255, 0.07);\n        cursor: pointer;\n        transition: border-color 0.14s ease, background 0.14s ease, color 0.14s ease;\n      }\n\n      #${o} .lhvj-state:hover {\n        border-color: rgba(255, 255, 255, 0.28);\n        background: rgba(255, 255, 255, 0.13);\n      }\n\n      #${o} .lhvj-state:focus-visible {\n        outline: 2px solid var(--lhvj-focus);\n        outline-offset: 2px;\n      }\n\n      #${o}[data-enabled="1"] .lhvj-state {\n        color: #b8e0ff;\n        border-color: rgba(112, 181, 249, 0.46);\n        background: rgba(112, 181, 249, 0.2);\n      }\n\n      #${o}[data-enabled="0"] .lhvj-state {\n        color: #ffc4c4;\n        border-color: rgba(240, 120, 120, 0.34);\n        background: rgba(240, 120, 120, 0.18);\n      }\n\n      #${o} .lhvj-guard-btn {\n        border: 1px solid var(--lhvj-chip-border);\n        background: var(--lhvj-chip-bg);\n        color: #d0dbe6;\n        border-radius: 999px;\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.34px;\n        line-height: 1;\n        padding: 4px 8px;\n        cursor: pointer;\n        transition: border-color 0.14s ease, background 0.14s ease, color 0.14s ease;\n      }\n\n      #${o} .lhvj-guard-btn:hover {\n        background: rgba(255, 255, 255, 0.14);\n        border-color: rgba(255, 255, 255, 0.24);\n      }\n\n      #${o} .lhvj-guard-btn:focus-visible {\n        outline: 2px solid var(--lhvj-focus);\n        outline-offset: 2px;\n      }\n\n      #${o}[data-scroll-guard="1"] .lhvj-guard-btn {\n        border-color: rgba(243, 186, 99, 0.55);\n        color: #ffe2b3;\n        background: rgba(227, 147, 34, 0.24);\n      }\n\n      #${o} .lhvj-cooldown {\n        min-width: 0;\n        max-width: 0;\n        overflow: hidden;\n        opacity: 0;\n        color: #ffe3b5;\n        border: 1px solid rgba(243, 176, 88, 0.5);\n        background: rgba(222, 131, 16, 0.24);\n        border-radius: 999px;\n        padding: 0;\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.2px;\n        line-height: 1;\n        white-space: nowrap;\n        transition: opacity 0.14s ease, max-width 0.14s ease, padding 0.14s ease;\n      }\n\n      #${o}[data-cooldown="1"] .lhvj-cooldown {\n        opacity: 1;\n        max-width: 74px;\n        padding: 4px 7px;\n      }\n\n      #${o} .lhvj-settings-btn {\n        border: 1px solid var(--lhvj-chip-border);\n        background: var(--lhvj-chip-bg);\n        color: #d0dbe6;\n        border-radius: 999px;\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.34px;\n        line-height: 1;\n        padding: 4px 8px;\n        cursor: pointer;\n      }\n\n      #${o} .lhvj-settings-btn:hover {\n        background: rgba(255, 255, 255, 0.14);\n      }\n\n      #${o} .lhvj-settings-btn:focus-visible {\n        outline: 2px solid var(--lhvj-focus);\n        outline-offset: 2px;\n      }\n\n      #${o}[data-settings-open="1"] .lhvj-settings-btn {\n        border-color: rgba(130, 200, 255, 0.5);\n        color: #bee6ff;\n      }\n\n      #${o} .lhvj-settings-panel {\n        display: none;\n        width: 100%;\n        padding: 8px 10px 10px 38px;\n        border-top: 1px solid rgba(255, 255, 255, 0.12);\n        background: rgba(0, 0, 0, 0.16);\n        box-sizing: border-box;\n      }\n\n      #${o}[data-settings-open="1"] .lhvj-settings-panel {\n        display: flex;\n        flex-direction: column;\n        align-items: flex-start;\n        gap: 8px;\n      }\n\n      #${o} .lhvj-settings-label {\n        font-size: 11px;\n        font-weight: 600;\n        color: #c5d1dc;\n      }\n\n      #${o} .lhvj-color-grid {\n        display: grid;\n        grid-template-columns: repeat(2, minmax(0, 1fr));\n        gap: 8px;\n        width: 100%;\n      }\n\n      #${o} .lhvj-slider-row {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        width: 100%;\n      }\n\n      #${o} .lhvj-opacity-input {\n        flex: 1;\n        accent-color: #9fd8ff;\n        cursor: pointer;\n      }\n\n      #${o} .lhvj-opacity-value {\n        min-width: 40px;\n        text-align: right;\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.22px;\n        color: #d9e4ee;\n      }\n\n      #${o} .lhvj-color-control {\n        display: flex;\n        flex-direction: column;\n        gap: 6px;\n        min-width: 0;\n      }\n\n      #${o} .lhvj-color-caption {\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.28px;\n        color: #dbe6ef;\n      }\n\n      #${o} .lhvj-color-actions {\n        display: inline-flex;\n        align-items: center;\n        gap: 6px;\n      }\n\n      #${o} .lhvj-color-input {\n        inline-size: 36px;\n        block-size: 28px;\n        padding: 0;\n        border: 1px solid rgba(255, 255, 255, 0.22);\n        border-radius: 9px;\n        background: rgba(255, 255, 255, 0.08);\n        cursor: pointer;\n      }\n\n      #${o} .lhvj-color-input::-webkit-color-swatch-wrapper {\n        padding: 3px;\n      }\n\n      #${o} .lhvj-color-input::-webkit-color-swatch,\n      #${o} .lhvj-color-input::-moz-color-swatch {\n        border: none;\n        border-radius: 6px;\n      }\n\n      #${o} .lhvj-reset-btn {\n        border: 1px solid rgba(255, 255, 255, 0.16);\n        background: rgba(255, 255, 255, 0.05);\n        color: #cad6e2;\n        border-radius: 999px;\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.28px;\n        padding: 4px 8px;\n        cursor: pointer;\n      }\n\n      #${o} .lhvj-reset-btn:hover,\n      #${o} .lhvj-color-input:hover {\n        background: rgba(255, 255, 255, 0.12);\n      }\n\n      #${o} .lhvj-reset-btn:focus-visible,\n      #${o} .lhvj-color-input:focus-visible {\n        outline: 2px solid var(--lhvj-focus);\n        outline-offset: 2px;\n      }\n\n      #${o} .lhvj-mode-group {\n        display: inline-flex;\n        align-items: center;\n        flex-wrap: wrap;\n        gap: 6px;\n      }\n\n      #${o}[data-enabled="0"] .lhvj-guard-btn,\n      #${o}[data-enabled="0"] .lhvj-cooldown,\n      #${o}[data-enabled="0"] .lhvj-count,\n      #${o}[data-enabled="0"] .lhvj-footer,\n      #${o}[data-enabled="0"] .lhvj-settings-btn,\n      #${o}[data-enabled="0"] .lhvj-settings-panel {\n        display: none !important;\n      }\n\n      #${o} .lhvj-mode-btn,\n      #${o} .lhvj-link-btn {\n        border: 1px solid rgba(255, 255, 255, 0.2);\n        background: rgba(255, 255, 255, 0.06);\n        color: #d4dde6;\n        border-radius: 999px;\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.28px;\n        padding: 4px 8px;\n        cursor: pointer;\n        display: inline-flex;\n        align-items: center;\n        text-decoration: none;\n      }\n\n      #${o} .lhvj-mode-btn:hover,\n      #${o} .lhvj-link-btn:hover {\n        background: rgba(255, 255, 255, 0.12);\n      }\n\n      #${o} .lhvj-mode-btn[data-active="1"] {\n        border-color: rgba(130, 200, 255, 0.56);\n        color: #b8e0ff;\n        background: rgba(112, 181, 249, 0.24);\n      }\n\n      #${o} .lhvj-mode-btn:focus-visible,\n      #${o} .lhvj-link-btn:focus-visible {\n        outline: 2px solid var(--lhvj-focus);\n        outline-offset: 2px;\n      }\n\n      .${s} {\n        box-shadow: inset 0 0 0 999px ${d} !important;\n        border-radius: ${h} !important;\n        background-color: ${d} !important;\n      }\n\n      .${s} .job-card-container,\n      .${s}[class*="job-card"],\n      .${s} > div {\n        box-shadow: inset 0 0 0 999px ${d} !important;\n        border-radius: ${h} !important;\n        background-color: ${d} !important;\n      }\n\n      .${a} {\n        box-shadow: inset 0 0 0 999px ${c} !important;\n        border-radius: ${h} !important;\n        background-color: ${c} !important;\n      }\n\n      .${a} .job-card-container,\n      .${a}[class*="job-card"],\n      .${a} > div {\n        box-shadow: inset 0 0 0 999px ${c} !important;\n        border-radius: ${h} !important;\n        background-color: ${c} !important;\n      }\n\n      .${r} {\n        box-shadow: inset 0 0 0 999px ${u} !important;\n        border-radius: ${h} !important;\n        background-color: ${u} !important;\n      }\n\n      .${r} .job-card-container,\n      .${r}[class*="job-card"],\n      .${r} > div {\n        box-shadow: inset 0 0 0 999px ${u} !important;\n        border-radius: ${h} !important;\n        background-color: ${u} !important;\n      }\n\n      html.lhvj-pagination-cooldown div.jobs-search-pagination button,\n      html.lhvj-pagination-cooldown div.jobs-search-pagination [role="button"] {\n        pointer-events: none !important;\n        opacity: 0.45 !important;\n        cursor: not-allowed !important;\n      }\n\n      @media (max-width: 900px) {\n        #${o} {\n          top: 70px;\n          right: 8px;\n        }\n\n        #${o} .lhvj-color-grid {\n          grid-template-columns: minmax(0, 1fr);\n        }\n      }\n    `;
		}
		withAlpha(n, i) {
			const e = /^#[0-9a-fA-F]{6}$/.test(n) ? n : t.VIEWED_HIGHLIGHT_COLOR;
			return `rgba(${parseInt(e.slice(1, 3), 16)}, ${parseInt(e.slice(3, 5), 16)}, ${parseInt(e.slice(5, 7), 16)}, ${i})`;
		}
	}, v = class i {
		static REPOSITORY_URL = "https://github.com/sametcn99/linkedin-hide-viewed-jobs";
		storage;
		onToggle;
		onScrollGuardToggle;
		onDetectionModeChange;
		onReloadNavigationToggle;
		onHighlightColorChange;
		onHighlightColorReset;
		onHighlightOpacityChange;
		onHighlightOpacityReset;
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
			reloadNavBtn: null,
			viewedColorInput: null,
			appliedColorInput: null,
			activeColorInput: null,
			viewedColorResetBtn: null,
			appliedColorResetBtn: null,
			activeColorResetBtn: null,
			opacityInput: null,
			opacityValue: null,
			opacityResetBtn: null
		};
		m = 0;
		constructor(t, n, i, e, o, s, a, r, l) {
			this.storage = t, this.onToggle = n, this.onScrollGuardToggle = i, this.onDetectionModeChange = e, this.onReloadNavigationToggle = o, this.onHighlightColorChange = s, this.onHighlightColorReset = a, this.onHighlightOpacityChange = r, this.onHighlightOpacityReset = l;
		}
		ensure(t, i, e, o, s) {
			if (this.state.root && document.body.contains(this.state.root)) return this.state.root;
			let a = document.getElementById(n.UI_ID);
			if (a) return this.cacheElements(a), a;
			a = this.buildDom(t, i, e, o, s), document.body.appendChild(a);
			const r = this.storage.getSavedPosition();
			return r && this.applyPosition(a, r.left, r.top, 0), this.cacheElements(a), a;
		}
		updateCount(t, n, i, e, o, s, a = 0) {
			const r = this.state.root;
			r && this.state.countNum && this.state.countUnit && this.state.stateEl && this.state.guardBtn && this.state.cooldownEl && this.state.settingsBtn && this.state.modeHideBtn && this.state.modeHighlightBtn && this.state.reloadNavBtn && this.state.viewedColorInput && this.state.appliedColorInput && this.state.activeColorInput && this.state.opacityInput && this.state.opacityValue && (r.setAttribute("data-enabled", n ? "1" : "0"), r.setAttribute("data-scroll-guard", i ? "1" : "0"), r.setAttribute("data-cooldown", a > 0 ? "1" : "0"), r.setAttribute("data-detection-mode", e), r.setAttribute("data-reload-on-navigation", o ? "1" : "0"), n || "1" !== r.getAttribute("data-settings-open") || (r.setAttribute("data-settings-open", "0"), this.state.settingsBtn.textContent = "Open settings"), this.state.countNum.textContent = t + "", this.state.countUnit.textContent = n ? "hide" === e ? "hidden" : "marked" : "off", this.state.stateEl.textContent = n ? "ON" : "OFF", this.state.guardBtn.textContent = i ? "GUARD ON" : "GUARD OFF", this.state.cooldownEl.textContent = a > 0 ? `CD ${a}s` : "", this.state.modeHideBtn.setAttribute("data-active", "hide" === e ? "1" : "0"), this.state.modeHighlightBtn.setAttribute("data-active", "highlight" === e ? "1" : "0"), this.state.viewedColorInput.value = s.colors.viewed, this.state.appliedColorInput.value = s.colors.applied, this.state.activeColorInput.value = s.colors.active, this.state.opacityInput.value = s.opacity + "", this.state.opacityValue.textContent = Math.round(100 * s.opacity) + "%", this.state.reloadNavBtn.textContent = o ? "Reload ON" : "Reload OFF", this.state.reloadNavBtn.setAttribute("data-active", o ? "1" : "0"), this.state.settingsBtn.textContent = "1" === r.getAttribute("data-settings-open") ? "Close settings" : "Open settings");
		}
		remove() {
			const t = document.getElementById(n.UI_ID);
			t && t.remove(), this.state.root = null, this.state.countNum = null, this.state.countUnit = null, this.state.stateEl = null, this.state.guardBtn = null, this.state.cooldownEl = null, this.state.settingsBtn = null, this.state.settingsPanel = null, this.state.modeHideBtn = null, this.state.modeHighlightBtn = null, this.state.reloadNavBtn = null, this.state.viewedColorInput = null, this.state.appliedColorInput = null, this.state.activeColorInput = null, this.state.viewedColorResetBtn = null, this.state.appliedColorResetBtn = null, this.state.activeColorResetBtn = null, this.state.opacityInput = null, this.state.opacityValue = null, this.state.opacityResetBtn = null;
		}
		syncPositionWithinViewport() {
			const t = document.getElementById(n.UI_ID);
			if (!t) return;
			const i = t.getBoundingClientRect();
			this.applyPosition(t, i.left, i.top, 1);
		}
		buildDom(e, o, s, a, r) {
			const l = document.createElement("div");
			l.id = n.UI_ID, l.setAttribute("data-settings-open", "0"), l.setAttribute("data-enabled", e ? "1" : "0"), l.setAttribute("data-scroll-guard", o ? "1" : "0"), l.setAttribute("data-detection-mode", s), l.setAttribute("data-reload-on-navigation", a ? "1" : "0");
			const h = document.createElement("span");
			h.className = "lhvj-drag-handle", h.title = "Drag to reposition", h.setAttribute("aria-label", "Drag badge");
			const d = document.createElement("div");
			d.className = "lhvj-header";
			const c = document.createElement("div");
			c.className = "lhvj-content";
			const u = document.createElement("div");
			u.className = "lhvj-main";
			const p = document.createElement("span");
			p.className = "lhvj-count";
			const g = document.createElement("span");
			g.className = "lhvj-count-num", g.textContent = "0";
			const b = document.createElement("span");
			b.className = "lhvj-count-unit", b.textContent = e ? "hide" === s ? "hidden" : "marked" : "off", p.appendChild(g), p.appendChild(b);
			const v = document.createElement("span");
			v.className = "lhvj-state", v.textContent = e ? "ON" : "OFF", v.setAttribute("role", "button"), v.setAttribute("tabindex", "0"), v.setAttribute("aria-label", "Enable or disable script logic"), v.addEventListener("click", (t) => {
				t.preventDefault(), this.onToggle("1" !== l.getAttribute("data-enabled"));
			}), v.addEventListener("keydown", (t) => {
				"Enter" !== t.key && " " !== t.key || (t.preventDefault(), this.onToggle("1" !== l.getAttribute("data-enabled")));
			});
			const j = document.createElement("button");
			j.type = "button", j.className = "lhvj-guard-btn", j.textContent = o ? "GUARD ON" : "GUARD OFF", j.setAttribute("aria-label", "Toggle scroll cooldown guard"), j.addEventListener("click", (t) => {
				t.preventDefault();
				const n = "1" !== l.getAttribute("data-scroll-guard");
				this.onScrollGuardToggle(n);
			});
			const m = document.createElement("span");
			m.className = "lhvj-cooldown";
			const f = document.createElement("button");
			f.type = "button", f.className = "lhvj-settings-btn", f.textContent = "Open settings", f.setAttribute("aria-label", "Toggle settings"), f.addEventListener("click", (t) => {
				t.preventDefault();
				const n = !("1" === l.getAttribute("data-settings-open"));
				l.setAttribute("data-settings-open", n ? "1" : "0"), f.textContent = n ? "Close settings" : "Open settings";
			});
			const w = document.createElement("div");
			w.className = "lhvj-footer";
			const x = document.createElement("div");
			x.className = "lhvj-settings-panel";
			const _ = document.createElement("span");
			_.className = "lhvj-settings-label", _.textContent = "Detected jobs:";
			const C = document.createElement("div");
			C.className = "lhvj-mode-group";
			const I = document.createElement("button");
			I.type = "button", I.className = "lhvj-mode-btn", I.textContent = "Hide", I.setAttribute("data-active", "hide" === s ? "1" : "0"), I.addEventListener("click", (t) => {
				t.preventDefault(), this.onDetectionModeChange("hide");
			});
			const O = document.createElement("button");
			O.type = "button", O.className = "lhvj-mode-btn", O.textContent = "Highlight", O.setAttribute("data-active", "highlight" === s ? "1" : "0"), O.addEventListener("click", (t) => {
				t.preventDefault(), this.onDetectionModeChange("highlight");
			}), C.appendChild(I), C.appendChild(O);
			const S = document.createElement("span");
			S.className = "lhvj-settings-label", S.textContent = "Navigation:";
			const A = document.createElement("button");
			A.type = "button", A.className = "lhvj-mode-btn lhvj-reload-nav-btn", A.textContent = a ? "Reload ON" : "Reload OFF", A.setAttribute("data-active", a ? "1" : "0"), A.setAttribute("aria-label", "Toggle full page reload on navigation"), A.addEventListener("click", (t) => {
				t.preventDefault();
				const n = "1" !== l.getAttribute("data-reload-on-navigation");
				this.onReloadNavigationToggle(n);
			}), x.appendChild(_), x.appendChild(C), x.appendChild(S), x.appendChild(A);
			const H = document.createElement("span");
			H.className = "lhvj-settings-label", H.textContent = "Card colors:";
			const y = document.createElement("div");
			y.className = "lhvj-color-grid";
			const $ = this.buildColorControl("Viewed", r.colors.viewed, "viewed"), D = this.buildColorControl("Applied", r.colors.applied, "applied"), R = this.buildColorControl("Active", r.colors.active, "active");
			y.appendChild($), y.appendChild(D), y.appendChild(R), x.appendChild(H), x.appendChild(y);
			const E = document.createElement("span");
			E.className = "lhvj-settings-label", E.textContent = "Filter opacity:";
			const L = document.createElement("div");
			L.className = "lhvj-slider-row";
			const T = document.createElement("input");
			T.type = "range", T.className = "lhvj-opacity-input", T.min = t.HIGHLIGHT_OPACITY_MIN + "", T.max = t.HIGHLIGHT_OPACITY_MAX + "", T.step = t.HIGHLIGHT_OPACITY_STEP + "", T.value = r.opacity + "", T.setAttribute("aria-label", "Highlight filter opacity"), T.addEventListener("input", () => {
				this.onHighlightOpacityChange(+T.value);
			});
			const G = document.createElement("span");
			G.className = "lhvj-opacity-value", G.textContent = Math.round(100 * r.opacity) + "%";
			const k = document.createElement("button");
			k.type = "button", k.className = "lhvj-reset-btn lhvj-opacity-reset", k.textContent = "Reset", k.setAttribute("aria-label", "Reset highlight opacity"), k.addEventListener("click", (t) => {
				t.preventDefault(), this.onHighlightOpacityReset();
			}), L.appendChild(T), L.appendChild(G), L.appendChild(k), x.appendChild(E), x.appendChild(L);
			const M = document.createElement("span");
			M.className = "lhvj-settings-label", M.textContent = "Project:";
			const N = document.createElement("a");
			return N.className = "lhvj-link-btn", N.href = i.REPOSITORY_URL, N.target = "_blank", N.rel = "noopener noreferrer", N.textContent = "GitHub Repo", N.setAttribute("aria-label", "Open the GitHub repository"), x.appendChild(M), x.appendChild(N), u.appendChild(v), u.appendChild(j), u.appendChild(m), w.appendChild(f), w.appendChild(p), c.appendChild(u), c.appendChild(w), d.appendChild(h), d.appendChild(c), l.appendChild(d), l.appendChild(x), this.makeDraggable(l, h), l;
		}
		cacheElements(t) {
			this.state.root = t, this.state.countNum = t.querySelector(".lhvj-count-num"), this.state.countUnit = t.querySelector(".lhvj-count-unit"), this.state.stateEl = t.querySelector(".lhvj-state"), this.state.guardBtn = t.querySelector(".lhvj-guard-btn"), this.state.cooldownEl = t.querySelector(".lhvj-cooldown"), this.state.settingsBtn = t.querySelector(".lhvj-settings-btn"), this.state.settingsPanel = t.querySelector(".lhvj-settings-panel");
			const n = t.querySelectorAll(".lhvj-mode-btn");
			this.state.modeHideBtn = n[0] || null, this.state.modeHighlightBtn = n[1] || null, this.state.reloadNavBtn = t.querySelector(".lhvj-reload-nav-btn"), this.state.viewedColorInput = t.querySelector(".lhvj-viewed-color-input"), this.state.appliedColorInput = t.querySelector(".lhvj-applied-color-input"), this.state.activeColorInput = t.querySelector(".lhvj-active-color-input"), this.state.viewedColorResetBtn = t.querySelector(".lhvj-viewed-color-reset"), this.state.appliedColorResetBtn = t.querySelector(".lhvj-applied-color-reset"), this.state.activeColorResetBtn = t.querySelector(".lhvj-active-color-reset"), this.state.opacityInput = t.querySelector(".lhvj-opacity-input"), this.state.opacityValue = t.querySelector(".lhvj-opacity-value"), this.state.opacityResetBtn = t.querySelector(".lhvj-opacity-reset");
		}
		buildColorControl(t, n, i) {
			const e = document.createElement("div");
			e.className = "lhvj-color-control";
			const o = document.createElement("span");
			o.className = "lhvj-color-caption", o.textContent = t;
			const s = document.createElement("div");
			s.className = "lhvj-color-actions";
			const a = document.createElement("input");
			a.type = "color", a.className = `lhvj-color-input lhvj-${i}-color-input`, a.value = n, a.setAttribute("aria-label", t + " highlight color"), a.addEventListener("input", () => {
				this.onHighlightColorChange(i, a.value);
			});
			const r = document.createElement("button");
			return r.type = "button", r.className = `lhvj-reset-btn lhvj-${i}-color-reset`, r.textContent = "Reset", r.setAttribute("aria-label", `Reset ${t.toLowerCase()} highlight color`), r.addEventListener("click", (t) => {
				t.preventDefault(), this.onHighlightColorReset(i);
			}), s.appendChild(a), s.appendChild(r), e.appendChild(o), e.appendChild(s), e;
		}
		clampPosition(n, i, e) {
			const o = t.UI_EDGE_MARGIN, s = Math.max(o, window.innerWidth - e.offsetWidth - o), a = Math.max(o, window.innerHeight - e.offsetHeight - o);
			return {
				left: Math.min(Math.max(n, o), s),
				top: Math.min(Math.max(i, o), a)
			};
		}
		applyPosition(t, n, i, e) {
			const o = this.clampPosition(n, i, t);
			t.style.left = o.left + "px", t.style.top = o.top + "px", t.style.right = "auto", e && this.storage.savePosition(o);
		}
		makeDraggable(t, n) {
			let i = null, e = 0, o = 0;
			n.addEventListener("pointerdown", (s) => {
				i = s.pointerId;
				const a = t.getBoundingClientRect();
				e = s.clientX - a.left, o = s.clientY - a.top, this.m = 1, t.classList.add("lhvj-dragging"), n.setPointerCapture(i), s.preventDefault();
			}), n.addEventListener("pointermove", (n) => {
				this.m && i === n.pointerId && (this.applyPosition(t, n.clientX - e, n.clientY - o, 0), n.preventDefault());
			});
			const s = (e) => {
				if (!this.m || i !== e.pointerId) return;
				this.m = 0, t.classList.remove("lhvj-dragging"), n.hasPointerCapture(i) && n.releasePointerCapture(i);
				const o = t.getBoundingClientRect();
				this.applyPosition(t, o.left, o.top, 1), i = null, e.preventDefault();
			};
			n.addEventListener("pointerup", s), n.addEventListener("pointercancel", s);
		}
	}, j = new class i {
		static PAGINATION_COOLDOWN_CLASS = "lhvj-pagination-cooldown";
		static COUNT_COOLDOWN_STEP = 20;
		storage;
		matcher;
		detection;
		styleManager;
		badge;
		router;
		_;
		C;
		I;
		O;
		S;
		A;
		H = 0;
		$ = 0;
		D = 0;
		R = 0;
		L = Date.now();
		T = 0;
		G = 0;
		k = 0;
		M = null;
		N = 0;
		P = Date.now();
		U = 0;
		V = 0;
		constructor() {
			this.storage = new c(), this.matcher = new u(), this.detection = new p(this.matcher), this.styleManager = new b(), this._ = this.storage.getShowHidden(), this.C = this.storage.getScrollGuardEnabled(), this.I = this.storage.getDetectionMode(), this.O = this.storage.getReloadOnNavigation(), this.S = this.storage.getHighlightColors(), this.A = this.storage.getHighlightOpacity(), this.badge = new v(this.storage, (t) => {
				this._ = t, this.storage.setShowHidden(t), t || (this.resetScrollCooldown(), this.resetCountBasedCooldownProgress()), this.scheduleRefresh();
			}, (t) => {
				this.C = t, this.storage.setScrollGuardEnabled(t), t || (this.resetScrollCooldown(), this.resetCountBasedCooldownProgress()), this.scheduleRefresh();
			}, (t) => {
				this.I = t, this.storage.setDetectionMode(t), this.scheduleRefresh();
			}, (t) => {
				this.O = t, this.storage.setReloadOnNavigation(t);
			}, (t, n) => {
				this.updateHighlightColor(t, n);
			}, (t) => {
				this.resetHighlightColor(t);
			}, (t) => {
				this.updateHighlightOpacity(t);
			}, () => {
				this.resetHighlightOpacity();
			}), this.router = new g(() => this.scheduleRefresh(), () => this.hardRestartRuntimeForPathChange());
		}
		init() {
			this.styleManager.inject(this.getHighlightSettings()), this.startRuntime(), this.router.startObserving();
		}
		startRuntime() {
			this.D || (this.L = Date.now(), this.N = window.scrollY, this.P = Date.now(), this.router.restartDomObserver(), this.scheduleRefresh(), this.router.queueRefresh(120), this.router.queueRefresh(420), window.addEventListener("resize", this.onWindowResize), window.addEventListener("scroll", this.onWindowScroll, {
				passive: 1,
				capture: 1
			}), window.addEventListener("wheel", this.onWheel, {
				passive: 0,
				capture: 1
			}), window.addEventListener("mousedown", this.onMouseDown, { capture: 1 }), window.addEventListener("auxclick", this.onAuxClick, { capture: 1 }), window.addEventListener("keydown", this.onKeyDown, {
				passive: 0,
				capture: 1
			}), window.addEventListener("touchstart", this.onTouchStart, { passive: 1 }), window.addEventListener("touchmove", this.onTouchMove, {
				passive: 0,
				capture: 1
			}), window.addEventListener("touchend", this.onTouchEnd, { passive: 1 }), window.addEventListener("touchcancel", this.onTouchEnd, { passive: 1 }), this.D = 1, this.detection.isJobsPage() && this.router.startRouteRefreshBurst());
		}
		hardRestartRuntimeForPathChange() {
			if (!this._ || !this.O) return this.L = Date.now(), this.router.restartDomObserver(), this.scheduleRefresh(), this.router.queueRefresh(120), void this.router.queueRefresh(420);
			this.R || (this.R = 1, window.location.reload());
		}
		scheduleRefresh() {
			this.$ && cancelAnimationFrame(this.$), this.$ = requestAnimationFrame(() => {
				this.$ = 0, this.refresh();
			});
		}
		refresh() {
			this.syncCooldownState(), this.syncPaginationCooldownClass();
			const n = this.H;
			if (!this.detection.isJobsPage()) return this.H = 0, this.resetScrollCooldown(), this.resetCountBasedCooldownProgress(), void this.badge.remove();
			if (!this._) return this.H = 0, this.resetScrollCooldown(), this.resetCountBasedCooldownProgress(), this.clearDetectedVisualState(), this.badge.ensure(this._, this.C, this.I, this.O, this.getHighlightSettings()), void this.badge.updateCount(0, this._, this.C, this.I, this.O, this.getHighlightSettings(), 0);
			this.isCountCooldownPage() || this.resetCountBasedCooldownProgress();
			const i = this.detection.getJobCards();
			0 === i.length && Date.now() - this.L < t.LAZY_RENDER_TIMEOUT_MS && (this.router.queueRefresh(180), this.router.queueRefresh(600));
			const e = this.detection.getDetectedCardsFromMarkers(), o = new Map(e);
			for (const t of i) {
				const n = this.detection.getDetectedJobState(t);
				n && this.setDetectedState(o, t, n);
			}
			const s = "hide" === this.I, a = this.detection.refreshDetectedAnchors(s), r = this.detection.refreshDetectedCardsFallback(s), l = new Map(o);
			this.mergeDetectedCardStates(l, a.detectedAnchorCards), this.mergeDetectedCardStates(l, r);
			const h = new Set(i), d = this.detection.getActiveCards(h);
			for (const t of i) {
				const n = l.get(t) ?? null;
				this.detection.applyVisibility(t, !!n && s), this.detection.applyDetectedHighlight(t, s ? null : n), this.detection.applyActiveHighlight(t, d.has(t));
			}
			l.forEach((t, n) => {
				h.has(n) || (this.detection.applyVisibility(n, s), this.detection.applyDetectedHighlight(n, s ? null : t), this.detection.applyActiveHighlight(n, d.has(n)));
			}), document.querySelectorAll("[data-lhvj-hidden=\"1\"]").forEach((t) => {
				s && l.has(t) || this.detection.applyVisibility(t, 0);
			}), document.querySelectorAll("[data-lhvj-viewed=\"1\"], [data-lhvj-applied=\"1\"]").forEach((t) => {
				l.has(t) && !s || this.detection.applyDetectedHighlight(t, null);
			}), document.querySelectorAll("[data-lhvj-active=\"1\"]").forEach((t) => {
				d.has(t) || this.detection.applyActiveHighlight(t, 0);
			}), this.H = Math.max(l.size, a.detectedAnchorCount), this.maybeStartCountBasedCooldown(n), this.badge.ensure(this._, this.C, this.I, this.O, this.getHighlightSettings()), this.badge.updateCount(this.H, this._, this.C, this.I, this.O, this.getHighlightSettings(), this.getCooldownSecondsLeft());
		}
		updateHighlightColor(t, n) {
			"viewed" === t ? this.storage.setViewedHighlightColor(n) : "applied" === t ? this.storage.setAppliedHighlightColor(n) : this.storage.setActiveHighlightColor(n), this.S = this.storage.getHighlightColors(), this.styleManager.updateHighlightStyles(this.getHighlightSettings()), this.scheduleRefresh();
		}
		resetHighlightColor(t) {
			"viewed" === t ? this.storage.resetViewedHighlightColor() : "applied" === t ? this.storage.resetAppliedHighlightColor() : this.storage.resetActiveHighlightColor(), this.S = this.storage.getHighlightColors(), this.styleManager.updateHighlightStyles(this.getHighlightSettings()), this.scheduleRefresh();
		}
		updateHighlightOpacity(t) {
			this.storage.setHighlightOpacity(t), this.A = this.storage.getHighlightOpacity(), this.styleManager.updateHighlightStyles(this.getHighlightSettings()), this.scheduleRefresh();
		}
		resetHighlightOpacity() {
			this.storage.resetHighlightOpacity(), this.A = this.storage.getHighlightOpacity(), this.styleManager.updateHighlightStyles(this.getHighlightSettings()), this.scheduleRefresh();
		}
		getHighlightSettings() {
			return {
				colors: this.S,
				opacity: this.A
			};
		}
		mergeDetectedCardStates(t, n) {
			n.forEach((n, i) => {
				this.setDetectedState(t, i, n);
			});
		}
		setDetectedState(t, n, i) {
			const e = t.get(n);
			"applied" !== e && ("applied" !== i && e || t.set(n, i));
		}
		onWindowResize = () => {
			this.badge.syncPositionWithinViewport();
		};
		onWheel = (t) => {
			t.deltaY > 0 && this.handleScrollGuardInput(t.deltaY, () => {
				t.preventDefault(), t.stopPropagation();
			}) && this.scheduleRefresh();
		};
		onWindowScroll = () => {
			const n = Date.now(), i = window.scrollY, e = i - this.N, o = Math.max(1, n - this.P);
			if (0 >= e) return this.N = i, void (this.P = n);
			if (!this.shouldUseScrollGuard()) return this.N = i, void (this.P = n);
			if (this.syncCooldownState(), this.T && !this.U) {
				const i = Math.max(14, t.SCROLL_GUARD_ALLOWED_STEP_PX * o / t.SCROLL_GUARD_ALLOWED_STEP_MIN_INTERVAL_MS);
				if (e > i) {
					const t = this.N + i;
					this.U = 1, window.scrollTo({
						top: t,
						behavior: "auto"
					}), this.N = t, this.P = n, window.setTimeout(() => {
						this.U = 0;
					}, 0), this.scheduleRefresh();
					return;
				}
			}
			this.N = i, this.P = n;
		};
		onMouseDown = (t) => {
			1 === t.button && this.shouldBlockMiddleMouseDuringCooldown() && (t.preventDefault(), t.stopPropagation());
		};
		onAuxClick = (t) => {
			1 === t.button && this.shouldBlockMiddleMouseDuringCooldown() && (t.preventDefault(), t.stopPropagation());
		};
		onKeyDown = (t) => {
			if (this.isEditableTarget(t.target)) return;
			const n = t.key;
			let i = 0;
			if ("ArrowDown" === n) i = 96;
			else if ("PageDown" === n) i = Math.max(.85 * window.innerHeight, 280);
			else if (" " === n) {
				if (t.shiftKey) return;
				i = Math.max(.85 * window.innerHeight, 280);
			}
			i > 0 && this.handleScrollGuardInput(i, () => {
				t.preventDefault(), t.stopPropagation();
			}) && this.scheduleRefresh();
		};
		onTouchStart = (t) => {
			0 !== t.touches.length && (this.M = t.touches[0].clientY);
		};
		onTouchMove = (t) => {
			if (0 === t.touches.length || null === this.M) return;
			const n = t.touches[0].clientY, i = this.M - n;
			this.M = n, i > 0 && this.handleScrollGuardInput(i, () => {
				t.preventDefault(), t.stopPropagation();
			}) && this.scheduleRefresh();
		};
		onTouchEnd = () => {
			this.M = null;
		};
		handleScrollGuardInput(t, n) {
			return this.shouldUseScrollGuard() ? (this.syncCooldownState(), this.T ? (n(), this.applyControlledScroll(t), 1) : 0) : 0;
		}
		shouldUseScrollGuard() {
			return this.C && this._ ? this.detection.isJobsPage() : 0;
		}
		shouldBlockMiddleMouseDuringCooldown() {
			return this.T ? this.shouldUseScrollGuard() : 0;
		}
		shouldUseCountBasedCooldown() {
			return this.C && this._ ? this.isCountCooldownPage() : 0;
		}
		maybeStartCountBasedCooldown(t) {
			if (!this.shouldUseCountBasedCooldown()) return;
			if (this.H > t && (this.V += this.H - t), i.COUNT_COOLDOWN_STEP > this.V) return;
			const n = Math.floor(this.V / i.COUNT_COOLDOWN_STEP);
			this.V -= n * i.COUNT_COOLDOWN_STEP;
			for (let i = 0; n > i; i++) this.startRandomCooldown();
		}
		resetCountBasedCooldownProgress() {
			this.V = 0;
		}
		isJobsHomepage() {
			const t = location.pathname;
			return "/jobs" === t || "/jobs/" === t;
		}
		isCollectionsPage() {
			return location.pathname.startsWith("/jobs/collections");
		}
		isCountCooldownPage() {
			return this.isJobsHomepage() || this.isCollectionsPage();
		}
		startRandomCooldown() {
			const n = t.SCROLL_GUARD_COOLDOWN_MIN_MS, i = t.SCROLL_GUARD_COOLDOWN_MAX_MS, e = n + Math.floor(Math.random() * (i - n + 1));
			this.T ? this.G += e : (this.T = 1, this.G = Date.now() + e, this.k = 0, this.syncPaginationCooldownClass());
			const o = Math.max(0, this.G - Date.now());
			window.setTimeout(() => {
				this.T && (this.syncCooldownState(), this.scheduleRefresh());
			}, o + 20);
		}
		applyControlledScroll(n) {
			const i = Date.now();
			if (t.SCROLL_GUARD_ALLOWED_STEP_MIN_INTERVAL_MS > i - this.k) return;
			const e = Math.min(Math.max(n, 0), t.SCROLL_GUARD_ALLOWED_STEP_PX);
			e > 0 && (window.scrollBy({
				top: e,
				behavior: "auto"
			}), this.k = i);
		}
		syncCooldownState() {
			this.T && (Date.now() < this.G || this.resetScrollCooldown());
		}
		resetScrollCooldown() {
			this.T = 0, this.G = 0, this.k = 0, this.U = 0, this.syncPaginationCooldownClass();
		}
		getCooldownSecondsLeft() {
			if (!this.T) return 0;
			const t = this.G - Date.now();
			return t > 0 ? Math.ceil(t / 1e3) : 0;
		}
		isEditableTarget(t) {
			return t instanceof HTMLElement ? t.isContentEditable ? 1 : !!t.closest("input, textarea, select, [contenteditable=\"true\"], [role=\"textbox\"]") : 0;
		}
		clearDetectedVisualState() {
			const { HIDDEN_CLASS: t } = n;
			document.querySelectorAll("[data-lhvj-hidden=\"1\"]").forEach((t) => {
				this.detection.applyVisibility(t, 0);
			}), document.querySelectorAll("[data-lhvj-viewed=\"1\"]").forEach((t) => {
				this.detection.applyDetectedHighlight(t, null);
			}), document.querySelectorAll("[data-lhvj-applied=\"1\"]").forEach((t) => {
				this.detection.applyDetectedHighlight(t, null);
			}), document.querySelectorAll("[data-lhvj-active=\"1\"]").forEach((t) => {
				this.detection.applyActiveHighlight(t, 0);
			}), document.querySelectorAll("a[data-lhvj-hidden-anchor=\"1\"]").forEach((n) => {
				n.classList.remove(t), n.removeAttribute("data-lhvj-hidden-anchor");
			});
		}
		syncPaginationCooldownClass() {
			const t = document.documentElement;
			if (!t) return;
			const n = this.T && this.detection.isJobsPage();
			t.classList.toggle(i.PAGINATION_COOLDOWN_CLASS, n);
		}
	}();
	"loading" === document.readyState ? document.addEventListener("DOMContentLoaded", () => j.init(), { once: 1 }) : j.init();
	//#endregion
})();