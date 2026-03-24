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
// @version            1.1.4
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
	//#region \0./main-BiezHIat.js
	var t = Object.freeze({
		POLL_INTERVAL_MS: 2e3,
		ROUTE_CHECK_INTERVAL_MS: 500,
		ROUTE_BURST_INTERVAL_MS: 250,
		ROUTE_BURST_MAX_TICKS: 12,
		LAZY_RENDER_TIMEOUT_MS: 8e3,
		MUTATION_DEBOUNCE_MS: 80,
		UI_Z_INDEX: 99999,
		UI_EDGE_MARGIN: 8,
		ENABLE_HIGHLIGHT: !0,
		VIEWED_HIGHLIGHT_COLOR: "#2ecc71",
		APPLIED_HIGHLIGHT_COLOR: "#f59e0b",
		ACTIVE_HIGHLIGHT_COLOR: "#0a66c2",
		HIGHLIGHT_OPACITY: .1,
		HIGHLIGHT_OPACITY_MIN: .04,
		HIGHLIGHT_OPACITY_MAX: .28,
		HIGHLIGHT_OPACITY_STEP: .01,
		HIGHLIGHT_BORDER_RADIUS: "6px",
		SCROLL_GUARD_ENABLED_DEFAULT: !0,
		SCROLL_GUARD_TRIGGER_DELTA_PX: 900,
		SCROLL_GUARD_TRIGGER_WINDOW_MS: 1200,
		SCROLL_GUARD_COOLDOWN_MIN_MS: 5e3,
		SCROLL_GUARD_COOLDOWN_MAX_MS: 15e3,
		SCROLL_GUARD_ALLOWED_STEP_PX: 110,
		SCROLL_GUARD_ALLOWED_STEP_MIN_INTERVAL_MS: 120,
		SCROLL_GUARD_MIN_VIEWED_DENSITY: .55,
		SCROLL_GUARD_DENSITY_WINDOW_MS: 6e3
	}), e = Object.freeze({
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
	}), n = Object.freeze([
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
	]), i = Object.freeze([
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
	]), l = o.join(","), r = s.join(","), h = a.join(","), d = [
		l,
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
	].join(","), c = class {
		getItem(t) {
			try {
				return window.localStorage.getItem(t);
			} catch {
				return null;
			}
		}
		setItem(t, e) {
			try {
				window.localStorage.setItem(t, e);
			} catch {}
		}
		getShowHidden() {
			return "1" === this.getItem(e.STORAGE_KEY);
		}
		setShowHidden(t) {
			this.setItem(e.STORAGE_KEY, t ? "1" : "0");
		}
		getScrollGuardEnabled() {
			const n = this.getItem(e.SCROLL_GUARD_STORAGE_KEY);
			return "0" !== n && ("1" === n || t.SCROLL_GUARD_ENABLED_DEFAULT);
		}
		setScrollGuardEnabled(t) {
			this.setItem(e.SCROLL_GUARD_STORAGE_KEY, t ? "1" : "0");
		}
		getDetectionMode() {
			return "highlight" === this.getItem(e.DETECTION_MODE_STORAGE_KEY) ? "highlight" : "hide";
		}
		setDetectionMode(t) {
			this.setItem(e.DETECTION_MODE_STORAGE_KEY, t);
		}
		getReloadOnNavigation() {
			return "1" === this.getItem(e.RELOAD_ON_NAVIGATION_STORAGE_KEY);
		}
		setReloadOnNavigation(t) {
			this.setItem(e.RELOAD_ON_NAVIGATION_STORAGE_KEY, t ? "1" : "0");
		}
		getHighlightColors() {
			return {
				viewed: this.getHighlightColor(e.VIEWED_HIGHLIGHT_COLOR_STORAGE_KEY, t.VIEWED_HIGHLIGHT_COLOR),
				applied: this.getHighlightColor(e.APPLIED_HIGHLIGHT_COLOR_STORAGE_KEY, t.APPLIED_HIGHLIGHT_COLOR),
				active: this.getHighlightColor(e.ACTIVE_HIGHLIGHT_COLOR_STORAGE_KEY, t.ACTIVE_HIGHLIGHT_COLOR)
			};
		}
		setViewedHighlightColor(n) {
			this.setItem(e.VIEWED_HIGHLIGHT_COLOR_STORAGE_KEY, this.normalizeHighlightColor(n, t.VIEWED_HIGHLIGHT_COLOR));
		}
		setAppliedHighlightColor(n) {
			this.setItem(e.APPLIED_HIGHLIGHT_COLOR_STORAGE_KEY, this.normalizeHighlightColor(n, t.APPLIED_HIGHLIGHT_COLOR));
		}
		setActiveHighlightColor(n) {
			this.setItem(e.ACTIVE_HIGHLIGHT_COLOR_STORAGE_KEY, this.normalizeHighlightColor(n, t.ACTIVE_HIGHLIGHT_COLOR));
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
			const n = this.getItem(e.HIGHLIGHT_OPACITY_STORAGE_KEY);
			return this.normalizeHighlightOpacity(n, t.HIGHLIGHT_OPACITY);
		}
		setHighlightOpacity(n) {
			const i = this.normalizeHighlightOpacity(String(n), t.HIGHLIGHT_OPACITY);
			this.setItem(e.HIGHLIGHT_OPACITY_STORAGE_KEY, i.toFixed(2));
		}
		resetHighlightOpacity() {
			this.setHighlightOpacity(t.HIGHLIGHT_OPACITY);
		}
		getSavedPosition() {
			try {
				const t = this.getItem(e.UI_POSITION_KEY);
				if (!t) return null;
				const n = JSON.parse(t);
				return n && "number" == typeof n.left && "number" == typeof n.top && Number.isFinite(n.left) && Number.isFinite(n.top) ? {
					left: n.left,
					top: n.top
				} : null;
			} catch {
				return null;
			}
		}
		savePosition(t) {
			this.setItem(e.UI_POSITION_KEY, JSON.stringify(t));
		}
		getHighlightColor(t, e) {
			const n = this.getItem(t);
			return this.normalizeHighlightColor(n, e);
		}
		normalizeHighlightColor(t, e) {
			return t && /^#[0-9a-fA-F]{6}$/.test(t) ? t.toLowerCase() : e;
		}
		normalizeHighlightOpacity(e, n) {
			if (!e) return n;
			const i = Number(e);
			return Number.isFinite(i) ? Math.min(t.HIGHLIGHT_OPACITY_MAX, Math.max(t.HIGHLIGHT_OPACITY_MIN, i)) : n;
		}
	}, u = class {
		normalizedViewedKeywords;
		normalizedAppliedKeywords;
		constructor() {
			this.normalizedViewedKeywords = n.map((t) => this.normalize(t)).filter((t) => t.length > 0), this.normalizedAppliedKeywords = i.map((t) => this.normalize(t)).filter((t) => t.length > 0);
		}
		normalize(t) {
			return (t || "").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		}
		getDetectedStateFromText(t) {
			const e = this.normalize(t);
			return e ? this.containsAnyKeyword(e, this.normalizedAppliedKeywords) ? "applied" : this.containsAnyKeyword(e, this.normalizedViewedKeywords) ? "viewed" : null : null;
		}
		getDetectedStateFromElement(t) {
			const e = (t.textContent || "").trim(), n = t.getAttribute("aria-label") || "", i = t.getAttribute("title") || "";
			return this.getDetectedStateFromText(e) || this.getDetectedStateFromText(n) || this.getDetectedStateFromText(i);
		}
		containsAnyKeyword(t, e) {
			for (const n of e) if (this.containsKeywordExactly(t, n)) return !0;
			return !1;
		}
		containsKeywordExactly(t, e) {
			let n = 0;
			for (; n < t.length;) {
				const i = t.indexOf(e, n);
				if (-1 === i) return !1;
				if (this.hasBoundary(t, i, e.length)) return !0;
				n = i + 1;
			}
			return !1;
		}
		hasBoundary(t, e, n) {
			const i = e > 0 ? t[e - 1] : "", o = e + n, s = o < t.length ? t[o] : "";
			return !this.isAsciiLetterOrNumber(i) && !this.isAsciiLetterOrNumber(s);
		}
		isAsciiLetterOrNumber(t) {
			if (!t) return !1;
			const e = t.charCodeAt(0);
			return e >= 48 && e <= 57 || e >= 65 && e <= 90 || e >= 97 && e <= 122;
		}
	}, g = class {
		matcher;
		constructor(t) {
			this.matcher = t;
		}
		getJobCards() {
			const t = /* @__PURE__ */ new Set();
			return document.querySelectorAll(l).forEach((e) => {
				t.add(e);
			}), Array.from(t);
		}
		getDetectedCardsFromMarkers() {
			const t = /* @__PURE__ */ new Map();
			return document.querySelectorAll(r).forEach((e) => {
				if (!this.isElementVisible(e)) return;
				const n = this.matcher.getDetectedStateFromElement(e);
				if (!n) return;
				const i = this.getCardFromNode(e);
				i && this.setDetectedState(t, i, n);
			}), t;
		}
		getDetectedJobState(t) {
			const e = this.matcher.getDetectedStateFromText(t.className || "");
			if (e) return e;
			const n = this.matcher.getDetectedStateFromElement(t);
			if (n) return n;
			const i = t.querySelectorAll("ul li");
			for (let s = 0; s < i.length; s++) {
				if (!this.isElementVisible(i[s])) continue;
				const t = this.matcher.getDetectedStateFromElement(i[s]);
				if (t) return t;
			}
			return this.cardContainsDetectedStateInDescendants(t, "[aria-label], [title], span, small, div, p, time", 100) || (t.matches("li.discovery-templates-entity-item, li[class*=\"discovery-templates-entity-item\"]") ? this.cardContainsDetectedStateInDescendants(t, "*", 140) : null);
		}
		refreshDetectedAnchors(t) {
			let e = 0;
			const n = /* @__PURE__ */ new Map();
			return this.shouldUseAnchorDetection() ? (this.getPotentialViewedAnchors().forEach((i) => {
				const o = this.getCardFromAnchor(i), s = o || i.closest("li, article, div") || i, a = "1" === i.getAttribute("data-lhvj-hidden-anchor"), l = a && t ? "viewed" : this.getDetectedAnchorState(i, s);
				l && (e++, o && (this.setDetectedState(n, o, l), this.applyVisibility(o, t), this.applyDetectedHighlight(o, t ? null : l))), (l || a) && this.applyAnchorVisibility(i, !!l && t);
			}), {
				detectedAnchorCount: e,
				detectedAnchorCards: n
			}) : (this.restoreHiddenAnchors(), {
				detectedAnchorCount: e,
				detectedAnchorCards: n
			});
		}
		refreshDetectedCardsFallback(t) {
			const e = /* @__PURE__ */ new Map();
			return this.isJobsPage() ? (document.querySelectorAll(r).forEach((n) => {
				if (!this.isElementVisible(n)) return;
				const i = this.matcher.getDetectedStateFromElement(n);
				if (!i) return;
				const o = this.getCardFromViewedMarker(n);
				o && (this.setDetectedState(e, o, i), this.applyVisibility(o, t), this.applyDetectedHighlight(o, t ? null : i));
			}), e) : e;
		}
		applyVisibility(t, n) {
			n ? (t.classList.add(e.HIDDEN_CLASS), t.setAttribute("data-lhvj-hidden", "1")) : (t.classList.remove(e.HIDDEN_CLASS), t.removeAttribute("data-lhvj-hidden"));
		}
		applyDetectedHighlight(t, n) {
			const { VIEWED_HIGHLIGHT_CLASS: i, APPLIED_HIGHLIGHT_CLASS: o } = e;
			if (t.classList.remove(i, o), t.removeAttribute("data-lhvj-viewed"), t.removeAttribute("data-lhvj-applied"), "viewed" === n) return t.classList.add(i), void t.setAttribute("data-lhvj-viewed", "1");
			"applied" === n && (t.classList.add(o), t.setAttribute("data-lhvj-applied", "1"));
		}
		getActiveCards(t) {
			const e = /* @__PURE__ */ new Set(), n = this.getPageCurrentJobId();
			if (!n) return e;
			for (const i of t) this.cardContainsMatchingCurrentJobId(i, n) && e.add(i);
			return e;
		}
		applyActiveHighlight(t, n) {
			if (n) return t.classList.add(e.ACTIVE_HIGHLIGHT_CLASS), void t.setAttribute("data-lhvj-active", "1");
			t.classList.remove(e.ACTIVE_HIGHLIGHT_CLASS), t.removeAttribute("data-lhvj-active");
		}
		isJobsPage() {
			return this.isJobsPath(location.pathname);
		}
		isElementVisible(t) {
			if (t.hasAttribute("hidden")) return !1;
			if ("true" === t.getAttribute("aria-hidden")) return !1;
			const e = window.getComputedStyle(t);
			if ("none" === e.display || "hidden" === e.visibility) return !1;
			if (0 === parseFloat(e.opacity)) return !1;
			try {
				const e = t.getClientRects();
				if (e && 0 === e.length) return !1;
			} catch {}
			return !0;
		}
		getCardFromNode(t) {
			return t.closest(l) ?? null;
		}
		getCardFromAnchor(t) {
			const e = t.closest(l);
			if (e) return e;
			return t.closest(d) || (t.matches("a[href*=\"/jobs/view/\"], a[href*=\"/jobs/collections/\"], a[href*=\"currentJobId=\"]") ? t : null);
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
				this.applyAnchorVisibility(t, !1);
			});
		}
		getPotentialViewedAnchors() {
			const t = /* @__PURE__ */ new Set();
			return document.querySelectorAll("a[href]").forEach((e) => {
				const n = e.getAttribute("href") || "";
				(n.includes("/jobs/view/") || n.includes("/jobs/collections/") || n.includes("/jobs/collections/recommended") || n.includes("/jobs/search/") || n.includes("currentJobId=") || n.includes("trk=public_jobs")) && t.add(e);
			}), document.querySelectorAll(h).forEach((e) => {
				t.add(e);
			}), document.querySelectorAll("a[data-lhvj-hidden-anchor=\"1\"]").forEach((e) => {
				t.add(e);
			}), Array.from(t);
		}
		getDetectedAnchorState(t, e) {
			if (!this.isElementVisible(t)) return null;
			const n = this.matcher.getDetectedStateFromElement(t);
			if (n) return n;
			const i = t.querySelectorAll("[aria-label], [title]");
			for (let o = 0; o < i.length; o++) {
				if (!this.isElementVisible(i[o])) continue;
				const t = this.matcher.getDetectedStateFromElement(i[o]);
				if (t) return t;
			}
			return e ? this.getDetectedStateInScope(e) : null;
		}
		getDetectedStateInScope(t) {
			return this.cardContainsDetectedStateInDescendants(t, r, 24) || this.cardContainsDetectedStateInDescendants(t, "[aria-label], [title], span, small, p, time, li", 80);
		}
		cardContainsDetectedStateInDescendants(t, e, n) {
			const i = t.querySelectorAll(e), o = Math.min(i.length, n);
			for (let s = 0; s < o; s++) {
				if (!this.isElementVisible(i[s])) continue;
				const t = this.matcher.getDetectedStateFromElement(i[s]);
				if ("applied" === t) return t;
				if ("viewed" === t) return t;
			}
			return null;
		}
		setDetectedState(t, e, n) {
			const i = t.get(e);
			"applied" !== i && ("applied" !== n && i || t.set(e, n));
		}
		applyAnchorVisibility(t, n) {
			n ? (t.classList.add(e.HIDDEN_CLASS), t.setAttribute("data-lhvj-hidden-anchor", "1")) : (t.classList.remove(e.HIDDEN_CLASS), t.removeAttribute("data-lhvj-hidden-anchor"));
		}
		getPageCurrentJobId() {
			const t = new URLSearchParams(location.search).get("currentJobId");
			return t && /^\d+$/.test(t) ? t : null;
		}
		cardContainsMatchingCurrentJobId(t, e) {
			const n = t.matches("a[href]") ? [t] : Array.from(t.querySelectorAll("a[href]"));
			for (let i = 0; i < n.length; i++) if (this.hrefMatchesCurrentJobId(n[i].href, e)) return !0;
			return !1;
		}
		hrefMatchesCurrentJobId(t, e) {
			if (!t) return !1;
			try {
				return new URL(t, location.origin).searchParams.get("currentJobId") === e;
			} catch {
				return !1;
			}
		}
	}, p = class {
		lastUrl = location.href;
		lastPathname = location.pathname;
		routeRefreshBurstId = null;
		domObserver = null;
		domMutationTimerId = null;
		delayedRefreshTimers = /* @__PURE__ */ new Map();
		onRefresh;
		onPathChange;
		constructor(t, e) {
			this.onRefresh = t, this.onPathChange = e;
		}
		startObserving() {
			this.observeRouteChanges(), this.observeDomChanges();
		}
		stopAll() {
			this.stopDomObserver(), this.clearRouteRefreshBurst(), this.delayedRefreshTimers.forEach((t) => clearTimeout(t)), this.delayedRefreshTimers.clear();
		}
		queueRefresh(t) {
			if (this.delayedRefreshTimers.has(t)) return;
			const e = setTimeout(() => {
				this.delayedRefreshTimers.delete(t), this.onRefresh();
			}, t);
			this.delayedRefreshTimers.set(t, e);
		}
		startRouteRefreshBurst() {
			let e = 0;
			this.clearRouteRefreshBurst(), this.routeRefreshBurstId = setInterval(() => {
				e++, this.onRefresh(), e >= t.ROUTE_BURST_MAX_TICKS && this.clearRouteRefreshBurst();
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
			this.stopDomObserver(), this.domObserver = new MutationObserver(() => {
				this.domMutationTimerId || (this.domMutationTimerId = setTimeout(() => {
					this.domMutationTimerId = null, this.onRefresh();
				}, t.MUTATION_DEBOUNCE_MS));
			}), document.body && this.domObserver.observe(document.body, {
				childList: !0,
				subtree: !0,
				attributes: !1
			});
		}
		stopDomObserver() {
			this.domMutationTimerId && (clearTimeout(this.domMutationTimerId), this.domMutationTimerId = null), this.domObserver && (this.domObserver.disconnect(), this.domObserver = null);
		}
		clearRouteRefreshBurst() {
			this.routeRefreshBurstId && (clearInterval(this.routeRefreshBurstId), this.routeRefreshBurstId = null);
		}
		onLocationMaybeChanged() {
			const t = location.href, e = location.pathname;
			if (t !== this.lastUrl) {
				if (this.lastUrl = t, e !== this.lastPathname) return this.lastPathname = e, void this.onPathChange();
				this.onRefresh(), this.queueRefresh(120), this.queueRefresh(420);
			}
		}
		wrapHistoryMethod(t, e) {
			const n = history[t];
			"function" == typeof n && (history[t] = function(...t) {
				const i = n.apply(this, t);
				return e(), i;
			});
		}
	}, b = class {
		styleEl = null;
		inject(t) {
			const e = document.getElementById("lhvj-style");
			if (e) return this.styleEl = e, void (this.styleEl.textContent = this.buildCSS(t));
			const n = document.createElement("style");
			n.id = "lhvj-style", n.textContent = this.buildCSS(t), document.head.appendChild(n), this.styleEl = n;
		}
		updateHighlightStyles(t) {
			this.styleEl && document.head.contains(this.styleEl) ? this.styleEl.textContent = this.buildCSS(t) : this.inject(t);
		}
		buildCSS(n) {
			const { HIDDEN_CLASS: i, UI_ID: o, VIEWED_HIGHLIGHT_CLASS: s, APPLIED_HIGHLIGHT_CLASS: a, ACTIVE_HIGHLIGHT_CLASS: l } = e, { UI_Z_INDEX: r, HIGHLIGHT_BORDER_RADIUS: h } = t, d = this.withAlpha(n.colors.viewed, n.opacity), c = this.withAlpha(n.colors.applied, n.opacity), u = this.withAlpha(n.colors.active, n.opacity);
			return `\n      .${i} {\n        height: 1px !important;\n        min-height: 1px !important;\n        max-height: 1px !important;\n        margin-top: 0 !important;\n        margin-bottom: 0 !important;\n        padding-top: 0 !important;\n        padding-bottom: 0 !important;\n        overflow: hidden !important;\n        opacity: 0 !important;\n      }\n\n      #${o} {\n        --lhvj-bg: linear-gradient(150deg, rgba(34, 40, 46, 0.98), rgba(22, 27, 33, 0.98));\n        --lhvj-border: rgba(255, 255, 255, 0.16);\n        --lhvj-text: #e6edf3;\n        --lhvj-muted: #9aa8b6;\n        --lhvj-chip-bg: rgba(255, 255, 255, 0.08);\n        --lhvj-chip-border: rgba(255, 255, 255, 0.16);\n        --lhvj-focus: #82c8ff;\n        position: fixed;\n        top: 76px;\n        right: 16px;\n        z-index: ${r};\n        font-family: "Segoe UI Variable", "Segoe UI", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;\n        background: var(--lhvj-bg);\n        border-radius: 999px;\n        border: 1px solid var(--lhvj-border);\n        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.28);\n        display: inline-flex;\n        flex-direction: column;\n        align-items: stretch;\n        min-height: 36px;\n        width: fit-content;\n        overflow: hidden;\n        user-select: none;\n        backdrop-filter: blur(6px);\n        transition: box-shadow 0.16s ease, transform 0.16s ease, border-color 0.16s ease;\n      }\n\n      #${o}[data-settings-open="1"] {\n        border-radius: 14px;\n      }\n\n      #${o}[data-enabled="0"] {\n        width: fit-content;\n      }\n\n      #${o}:hover {\n        border-color: rgba(160, 214, 255, 0.38);\n        box-shadow: 0 14px 30px rgba(0, 0, 0, 0.42), 0 3px 8px rgba(0, 0, 0, 0.26);\n      }\n\n      #${o}:focus-within {\n        border-color: rgba(130, 200, 255, 0.75);\n        box-shadow: 0 0 0 2px rgba(130, 200, 255, 0.22), 0 10px 24px rgba(0, 0, 0, 0.35);\n      }\n\n      #${o}.lhvj-dragging {\n        transform: scale(1.01);\n        box-shadow: 0 16px 34px rgba(0, 0, 0, 0.45), 0 4px 10px rgba(0, 0, 0, 0.28);\n      }\n\n      #${o} .lhvj-header {\n        display: inline-flex;\n        align-items: stretch;\n        width: 100%;\n      }\n\n      #${o} .lhvj-content {\n        display: flex;\n        flex: 1;\n        min-width: 0;\n        flex-direction: column;\n      }\n\n      #${o} .lhvj-drag-handle {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: 30px;\n        align-self: stretch;\n        cursor: grab;\n        border-right: 1px solid rgba(255, 255, 255, 0.1);\n        color: #5a6774;\n        flex-shrink: 0;\n        transition: color 0.14s ease, background 0.14s ease;\n      }\n\n      #${o} .lhvj-drag-handle:hover {\n        color: #b9c6d3;\n        background: rgba(255, 255, 255, 0.05);\n      }\n\n      #${o} .lhvj-drag-handle::before {\n        content: "";\n        display: block;\n        width: 8px;\n        height: 12px;\n        background: radial-gradient(circle, currentColor 1.2px, transparent 1.2px);\n        background-size: 4px 4px;\n      }\n\n      #${o} .lhvj-main {\n        display: inline-flex;\n        align-items: center;\n        justify-content: flex-start;\n        gap: 8px;\n        padding: 4px 10px 4px 8px;\n        min-height: 36px;\n        cursor: default;\n      }\n\n      #${o} .lhvj-footer {\n        display: flex;\n        align-items: center;\n        justify-content: flex-start;\n        gap: 10px;\n        padding: 0 10px 8px 8px;\n      }\n\n      #${o} .lhvj-count {\n        display: inline-flex;\n        align-items: baseline;\n        gap: 4px;\n        white-space: nowrap;\n      }\n\n      #${o} .lhvj-count-num {\n        font-size: 13px;\n        font-weight: 700;\n        letter-spacing: 0.1px;\n        line-height: 1;\n        color: var(--lhvj-text);\n      }\n\n      #${o} .lhvj-count-unit {\n        font-size: 11px;\n        font-weight: 500;\n        line-height: 1;\n        color: var(--lhvj-muted);\n      }\n\n      #${o} .lhvj-state {\n        display: inline-flex;\n        align-items: center;\n        justify-content: center;\n        min-width: 34px;\n        padding: 3px 8px;\n        border-radius: 999px;\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.36px;\n        line-height: 1;\n        text-align: center;\n        color: #d2dde7;\n        border: 1px solid rgba(255, 255, 255, 0.14);\n        background: rgba(255, 255, 255, 0.07);\n        cursor: pointer;\n        transition: border-color 0.14s ease, background 0.14s ease, color 0.14s ease;\n      }\n\n      #${o} .lhvj-state:hover {\n        border-color: rgba(255, 255, 255, 0.28);\n        background: rgba(255, 255, 255, 0.13);\n      }\n\n      #${o} .lhvj-state:focus-visible {\n        outline: 2px solid var(--lhvj-focus);\n        outline-offset: 2px;\n      }\n\n      #${o}[data-enabled="1"] .lhvj-state {\n        color: #b8e0ff;\n        border-color: rgba(112, 181, 249, 0.46);\n        background: rgba(112, 181, 249, 0.2);\n      }\n\n      #${o}[data-enabled="0"] .lhvj-state {\n        color: #ffc4c4;\n        border-color: rgba(240, 120, 120, 0.34);\n        background: rgba(240, 120, 120, 0.18);\n      }\n\n      #${o} .lhvj-guard-btn {\n        border: 1px solid var(--lhvj-chip-border);\n        background: var(--lhvj-chip-bg);\n        color: #d0dbe6;\n        border-radius: 999px;\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.34px;\n        line-height: 1;\n        padding: 4px 8px;\n        cursor: pointer;\n        transition: border-color 0.14s ease, background 0.14s ease, color 0.14s ease;\n      }\n\n      #${o} .lhvj-guard-btn:hover {\n        background: rgba(255, 255, 255, 0.14);\n        border-color: rgba(255, 255, 255, 0.24);\n      }\n\n      #${o} .lhvj-guard-btn:focus-visible {\n        outline: 2px solid var(--lhvj-focus);\n        outline-offset: 2px;\n      }\n\n      #${o}[data-scroll-guard="1"] .lhvj-guard-btn {\n        border-color: rgba(243, 186, 99, 0.55);\n        color: #ffe2b3;\n        background: rgba(227, 147, 34, 0.24);\n      }\n\n      #${o} .lhvj-cooldown {\n        min-width: 0;\n        max-width: 0;\n        overflow: hidden;\n        opacity: 0;\n        color: #ffe3b5;\n        border: 1px solid rgba(243, 176, 88, 0.5);\n        background: rgba(222, 131, 16, 0.24);\n        border-radius: 999px;\n        padding: 0;\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.2px;\n        line-height: 1;\n        white-space: nowrap;\n        transition: opacity 0.14s ease, max-width 0.14s ease, padding 0.14s ease;\n      }\n\n      #${o}[data-cooldown="1"] .lhvj-cooldown {\n        opacity: 1;\n        max-width: 74px;\n        padding: 4px 7px;\n      }\n\n      #${o} .lhvj-settings-btn {\n        border: 1px solid var(--lhvj-chip-border);\n        background: var(--lhvj-chip-bg);\n        color: #d0dbe6;\n        border-radius: 999px;\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.34px;\n        line-height: 1;\n        padding: 4px 8px;\n        cursor: pointer;\n      }\n\n      #${o} .lhvj-settings-btn:hover {\n        background: rgba(255, 255, 255, 0.14);\n      }\n\n      #${o} .lhvj-settings-btn:focus-visible {\n        outline: 2px solid var(--lhvj-focus);\n        outline-offset: 2px;\n      }\n\n      #${o}[data-settings-open="1"] .lhvj-settings-btn {\n        border-color: rgba(130, 200, 255, 0.5);\n        color: #bee6ff;\n      }\n\n      #${o} .lhvj-settings-panel {\n        display: none;\n        width: 100%;\n        padding: 8px 10px 10px 38px;\n        border-top: 1px solid rgba(255, 255, 255, 0.12);\n        background: rgba(0, 0, 0, 0.16);\n        box-sizing: border-box;\n      }\n\n      #${o}[data-settings-open="1"] .lhvj-settings-panel {\n        display: flex;\n        flex-direction: column;\n        align-items: flex-start;\n        gap: 8px;\n      }\n\n      #${o} .lhvj-settings-label {\n        font-size: 11px;\n        font-weight: 600;\n        color: #c5d1dc;\n      }\n\n      #${o} .lhvj-color-grid {\n        display: grid;\n        grid-template-columns: repeat(2, minmax(0, 1fr));\n        gap: 8px;\n        width: 100%;\n      }\n\n      #${o} .lhvj-slider-row {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        width: 100%;\n      }\n\n      #${o} .lhvj-opacity-input {\n        flex: 1;\n        accent-color: #9fd8ff;\n        cursor: pointer;\n      }\n\n      #${o} .lhvj-opacity-value {\n        min-width: 40px;\n        text-align: right;\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.22px;\n        color: #d9e4ee;\n      }\n\n      #${o} .lhvj-color-control {\n        display: flex;\n        flex-direction: column;\n        gap: 6px;\n        min-width: 0;\n      }\n\n      #${o} .lhvj-color-caption {\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.28px;\n        color: #dbe6ef;\n      }\n\n      #${o} .lhvj-color-actions {\n        display: inline-flex;\n        align-items: center;\n        gap: 6px;\n      }\n\n      #${o} .lhvj-color-input {\n        inline-size: 36px;\n        block-size: 28px;\n        padding: 0;\n        border: 1px solid rgba(255, 255, 255, 0.22);\n        border-radius: 9px;\n        background: rgba(255, 255, 255, 0.08);\n        cursor: pointer;\n      }\n\n      #${o} .lhvj-color-input::-webkit-color-swatch-wrapper {\n        padding: 3px;\n      }\n\n      #${o} .lhvj-color-input::-webkit-color-swatch,\n      #${o} .lhvj-color-input::-moz-color-swatch {\n        border: none;\n        border-radius: 6px;\n      }\n\n      #${o} .lhvj-reset-btn {\n        border: 1px solid rgba(255, 255, 255, 0.16);\n        background: rgba(255, 255, 255, 0.05);\n        color: #cad6e2;\n        border-radius: 999px;\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.28px;\n        padding: 4px 8px;\n        cursor: pointer;\n      }\n\n      #${o} .lhvj-reset-btn:hover,\n      #${o} .lhvj-color-input:hover {\n        background: rgba(255, 255, 255, 0.12);\n      }\n\n      #${o} .lhvj-reset-btn:focus-visible,\n      #${o} .lhvj-color-input:focus-visible {\n        outline: 2px solid var(--lhvj-focus);\n        outline-offset: 2px;\n      }\n\n      #${o} .lhvj-mode-group {\n        display: inline-flex;\n        align-items: center;\n        flex-wrap: wrap;\n        gap: 6px;\n      }\n\n      #${o}[data-enabled="0"] .lhvj-guard-btn,\n      #${o}[data-enabled="0"] .lhvj-cooldown,\n      #${o}[data-enabled="0"] .lhvj-count,\n      #${o}[data-enabled="0"] .lhvj-footer,\n      #${o}[data-enabled="0"] .lhvj-settings-btn,\n      #${o}[data-enabled="0"] .lhvj-settings-panel {\n        display: none !important;\n      }\n\n      #${o} .lhvj-mode-btn,\n      #${o} .lhvj-link-btn {\n        border: 1px solid rgba(255, 255, 255, 0.2);\n        background: rgba(255, 255, 255, 0.06);\n        color: #d4dde6;\n        border-radius: 999px;\n        font-size: 10px;\n        font-weight: 700;\n        letter-spacing: 0.28px;\n        padding: 4px 8px;\n        cursor: pointer;\n        display: inline-flex;\n        align-items: center;\n        text-decoration: none;\n      }\n\n      #${o} .lhvj-mode-btn:hover,\n      #${o} .lhvj-link-btn:hover {\n        background: rgba(255, 255, 255, 0.12);\n      }\n\n      #${o} .lhvj-mode-btn[data-active="1"] {\n        border-color: rgba(130, 200, 255, 0.56);\n        color: #b8e0ff;\n        background: rgba(112, 181, 249, 0.24);\n      }\n\n      #${o} .lhvj-mode-btn:focus-visible,\n      #${o} .lhvj-link-btn:focus-visible {\n        outline: 2px solid var(--lhvj-focus);\n        outline-offset: 2px;\n      }\n\n      .${s} {\n        box-shadow: inset 0 0 0 999px ${d} !important;\n        border-radius: ${h} !important;\n        background-color: ${d} !important;\n      }\n\n      .${s} .job-card-container,\n      .${s}[class*="job-card"],\n      .${s} > div {\n        box-shadow: inset 0 0 0 999px ${d} !important;\n        border-radius: ${h} !important;\n        background-color: ${d} !important;\n      }\n\n      .${a} {\n        box-shadow: inset 0 0 0 999px ${c} !important;\n        border-radius: ${h} !important;\n        background-color: ${c} !important;\n      }\n\n      .${a} .job-card-container,\n      .${a}[class*="job-card"],\n      .${a} > div {\n        box-shadow: inset 0 0 0 999px ${c} !important;\n        border-radius: ${h} !important;\n        background-color: ${c} !important;\n      }\n\n      .${l} {\n        box-shadow: inset 0 0 0 999px ${u} !important;\n        border-radius: ${h} !important;\n        background-color: ${u} !important;\n      }\n\n      .${l} .job-card-container,\n      .${l}[class*="job-card"],\n      .${l} > div {\n        box-shadow: inset 0 0 0 999px ${u} !important;\n        border-radius: ${h} !important;\n        background-color: ${u} !important;\n      }\n\n      html.lhvj-pagination-cooldown div.jobs-search-pagination button,\n      html.lhvj-pagination-cooldown div.jobs-search-pagination [role="button"] {\n        pointer-events: none !important;\n        opacity: 0.45 !important;\n        cursor: not-allowed !important;\n      }\n\n      @media (max-width: 900px) {\n        #${o} {\n          top: 70px;\n          right: 8px;\n        }\n\n        #${o} .lhvj-color-grid {\n          grid-template-columns: minmax(0, 1fr);\n        }\n      }\n    `;
		}
		withAlpha(e, n) {
			const i = /^#[0-9a-fA-F]{6}$/.test(e) ? e : t.VIEWED_HIGHLIGHT_COLOR;
			return `rgba(${parseInt(i.slice(1, 3), 16)}, ${parseInt(i.slice(3, 5), 16)}, ${parseInt(i.slice(5, 7), 16)}, ${n})`;
		}
	}, m = class n {
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
		isDragging = !1;
		constructor(t, e, n, i, o, s, a, l, r) {
			this.storage = t, this.onToggle = e, this.onScrollGuardToggle = n, this.onDetectionModeChange = i, this.onReloadNavigationToggle = o, this.onHighlightColorChange = s, this.onHighlightColorReset = a, this.onHighlightOpacityChange = l, this.onHighlightOpacityReset = r;
		}
		ensure(t, n, i, o, s) {
			if (this.state.root && document.body.contains(this.state.root)) return this.state.root;
			let a = document.getElementById(e.UI_ID);
			if (a) return this.cacheElements(a), a;
			a = this.buildDom(t, n, i, o, s), document.body.appendChild(a);
			const l = this.storage.getSavedPosition();
			return l && this.applyPosition(a, l.left, l.top, !1), this.cacheElements(a), a;
		}
		updateCount(t, e, n, i, o, s, a = 0) {
			const l = this.state.root;
			l && this.state.countNum && this.state.countUnit && this.state.stateEl && this.state.guardBtn && this.state.cooldownEl && this.state.settingsBtn && this.state.modeHideBtn && this.state.modeHighlightBtn && this.state.reloadNavBtn && this.state.viewedColorInput && this.state.appliedColorInput && this.state.activeColorInput && this.state.opacityInput && this.state.opacityValue && (l.setAttribute("data-enabled", e ? "1" : "0"), l.setAttribute("data-scroll-guard", n ? "1" : "0"), l.setAttribute("data-cooldown", a > 0 ? "1" : "0"), l.setAttribute("data-detection-mode", i), l.setAttribute("data-reload-on-navigation", o ? "1" : "0"), e || "1" !== l.getAttribute("data-settings-open") || (l.setAttribute("data-settings-open", "0"), this.state.settingsBtn.textContent = "Open settings"), this.state.countNum.textContent = String(t), this.state.countUnit.textContent = e ? "hide" === i ? "hidden" : "marked" : "off", this.state.stateEl.textContent = e ? "ON" : "OFF", this.state.guardBtn.textContent = n ? "GUARD ON" : "GUARD OFF", this.state.cooldownEl.textContent = a > 0 ? `CD ${a}s` : "", this.state.modeHideBtn.setAttribute("data-active", "hide" === i ? "1" : "0"), this.state.modeHighlightBtn.setAttribute("data-active", "highlight" === i ? "1" : "0"), this.state.viewedColorInput.value = s.colors.viewed, this.state.appliedColorInput.value = s.colors.applied, this.state.activeColorInput.value = s.colors.active, this.state.opacityInput.value = String(s.opacity), this.state.opacityValue.textContent = `${Math.round(100 * s.opacity)}%`, this.state.reloadNavBtn.textContent = o ? "Reload ON" : "Reload OFF", this.state.reloadNavBtn.setAttribute("data-active", o ? "1" : "0"), this.state.settingsBtn.textContent = "1" === l.getAttribute("data-settings-open") ? "Close settings" : "Open settings");
		}
		remove() {
			const t = document.getElementById(e.UI_ID);
			t && t.remove(), this.state.root = null, this.state.countNum = null, this.state.countUnit = null, this.state.stateEl = null, this.state.guardBtn = null, this.state.cooldownEl = null, this.state.settingsBtn = null, this.state.settingsPanel = null, this.state.modeHideBtn = null, this.state.modeHighlightBtn = null, this.state.reloadNavBtn = null, this.state.viewedColorInput = null, this.state.appliedColorInput = null, this.state.activeColorInput = null, this.state.viewedColorResetBtn = null, this.state.appliedColorResetBtn = null, this.state.activeColorResetBtn = null, this.state.opacityInput = null, this.state.opacityValue = null, this.state.opacityResetBtn = null;
		}
		syncPositionWithinViewport() {
			const t = document.getElementById(e.UI_ID);
			if (!t) return;
			const n = t.getBoundingClientRect();
			this.applyPosition(t, n.left, n.top, !0);
		}
		buildDom(i, o, s, a, l) {
			const r = document.createElement("div");
			r.id = e.UI_ID, r.setAttribute("data-settings-open", "0"), r.setAttribute("data-enabled", i ? "1" : "0"), r.setAttribute("data-scroll-guard", o ? "1" : "0"), r.setAttribute("data-detection-mode", s), r.setAttribute("data-reload-on-navigation", a ? "1" : "0");
			const h = document.createElement("span");
			h.className = "lhvj-drag-handle", h.title = "Drag to reposition", h.setAttribute("aria-label", "Drag badge");
			const d = document.createElement("div");
			d.className = "lhvj-header";
			const c = document.createElement("div");
			c.className = "lhvj-content";
			const u = document.createElement("div");
			u.className = "lhvj-main";
			const g = document.createElement("span");
			g.className = "lhvj-count";
			const p = document.createElement("span");
			p.className = "lhvj-count-num", p.textContent = "0";
			const b = document.createElement("span");
			b.className = "lhvj-count-unit", b.textContent = i ? "hide" === s ? "hidden" : "marked" : "off", g.appendChild(p), g.appendChild(b);
			const m = document.createElement("span");
			m.className = "lhvj-state", m.textContent = i ? "ON" : "OFF", m.setAttribute("role", "button"), m.setAttribute("tabindex", "0"), m.setAttribute("aria-label", "Enable or disable script logic"), m.addEventListener("click", (t) => {
				t.preventDefault(), this.onToggle("1" !== r.getAttribute("data-enabled"));
			}), m.addEventListener("keydown", (t) => {
				"Enter" !== t.key && " " !== t.key || (t.preventDefault(), this.onToggle("1" !== r.getAttribute("data-enabled")));
			});
			const v = document.createElement("button");
			v.type = "button", v.className = "lhvj-guard-btn", v.textContent = o ? "GUARD ON" : "GUARD OFF", v.setAttribute("aria-label", "Toggle scroll cooldown guard"), v.addEventListener("click", (t) => {
				t.preventDefault();
				const e = "1" !== r.getAttribute("data-scroll-guard");
				this.onScrollGuardToggle(e);
			});
			const C = document.createElement("span");
			C.className = "lhvj-cooldown";
			const f = document.createElement("button");
			f.type = "button", f.className = "lhvj-settings-btn", f.textContent = "Open settings", f.setAttribute("aria-label", "Toggle settings"), f.addEventListener("click", (t) => {
				t.preventDefault();
				const e = !("1" === r.getAttribute("data-settings-open"));
				r.setAttribute("data-settings-open", e ? "1" : "0"), f.textContent = e ? "Close settings" : "Open settings";
			});
			const E = document.createElement("div");
			E.className = "lhvj-footer";
			const w = document.createElement("div");
			w.className = "lhvj-settings-panel";
			const A = document.createElement("span");
			A.className = "lhvj-settings-label", A.textContent = "Detected jobs:";
			const _ = document.createElement("div");
			_.className = "lhvj-mode-group";
			const S = document.createElement("button");
			S.type = "button", S.className = "lhvj-mode-btn", S.textContent = "Hide", S.setAttribute("data-active", "hide" === s ? "1" : "0"), S.addEventListener("click", (t) => {
				t.preventDefault(), this.onDetectionModeChange("hide");
			});
			const I = document.createElement("button");
			I.type = "button", I.className = "lhvj-mode-btn", I.textContent = "Highlight", I.setAttribute("data-active", "highlight" === s ? "1" : "0"), I.addEventListener("click", (t) => {
				t.preventDefault(), this.onDetectionModeChange("highlight");
			}), _.appendChild(S), _.appendChild(I);
			const y = document.createElement("span");
			y.className = "lhvj-settings-label", y.textContent = "Navigation:";
			const H = document.createElement("button");
			H.type = "button", H.className = "lhvj-mode-btn lhvj-reload-nav-btn", H.textContent = a ? "Reload ON" : "Reload OFF", H.setAttribute("data-active", a ? "1" : "0"), H.setAttribute("aria-label", "Toggle full page reload on navigation"), H.addEventListener("click", (t) => {
				t.preventDefault();
				const e = "1" !== r.getAttribute("data-reload-on-navigation");
				this.onReloadNavigationToggle(e);
			}), w.appendChild(A), w.appendChild(_), w.appendChild(y), w.appendChild(H);
			const O = document.createElement("span");
			O.className = "lhvj-settings-label", O.textContent = "Card colors:";
			const j = document.createElement("div");
			j.className = "lhvj-color-grid";
			const R = this.buildColorControl("Viewed", l.colors.viewed, "viewed"), L = this.buildColorControl("Applied", l.colors.applied, "applied"), x = this.buildColorControl("Active", l.colors.active, "active");
			j.appendChild(R), j.appendChild(L), j.appendChild(x), w.appendChild(O), w.appendChild(j);
			const D = document.createElement("span");
			D.className = "lhvj-settings-label", D.textContent = "Filter opacity:";
			const T = document.createElement("div");
			T.className = "lhvj-slider-row";
			const G = document.createElement("input");
			G.type = "range", G.className = "lhvj-opacity-input", G.min = String(t.HIGHLIGHT_OPACITY_MIN), G.max = String(t.HIGHLIGHT_OPACITY_MAX), G.step = String(t.HIGHLIGHT_OPACITY_STEP), G.value = String(l.opacity), G.setAttribute("aria-label", "Highlight filter opacity"), G.addEventListener("input", () => {
				this.onHighlightOpacityChange(Number(G.value));
			});
			const N = document.createElement("span");
			N.className = "lhvj-opacity-value", N.textContent = `${Math.round(100 * l.opacity)}%`;
			const P = document.createElement("button");
			P.type = "button", P.className = "lhvj-reset-btn lhvj-opacity-reset", P.textContent = "Reset", P.setAttribute("aria-label", "Reset highlight opacity"), P.addEventListener("click", (t) => {
				t.preventDefault(), this.onHighlightOpacityReset();
			}), T.appendChild(G), T.appendChild(N), T.appendChild(P), w.appendChild(D), w.appendChild(T);
			const M = document.createElement("span");
			M.className = "lhvj-settings-label", M.textContent = "Project:";
			const $ = document.createElement("a");
			return $.className = "lhvj-link-btn", $.href = n.REPOSITORY_URL, $.target = "_blank", $.rel = "noopener noreferrer", $.textContent = "GitHub Repo", $.setAttribute("aria-label", "Open the GitHub repository"), w.appendChild(M), w.appendChild($), u.appendChild(m), u.appendChild(v), u.appendChild(C), E.appendChild(f), E.appendChild(g), c.appendChild(u), c.appendChild(E), d.appendChild(h), d.appendChild(c), r.appendChild(d), r.appendChild(w), this.makeDraggable(r, h), r;
		}
		cacheElements(t) {
			this.state.root = t, this.state.countNum = t.querySelector(".lhvj-count-num"), this.state.countUnit = t.querySelector(".lhvj-count-unit"), this.state.stateEl = t.querySelector(".lhvj-state"), this.state.guardBtn = t.querySelector(".lhvj-guard-btn"), this.state.cooldownEl = t.querySelector(".lhvj-cooldown"), this.state.settingsBtn = t.querySelector(".lhvj-settings-btn"), this.state.settingsPanel = t.querySelector(".lhvj-settings-panel");
			const e = t.querySelectorAll(".lhvj-mode-btn");
			this.state.modeHideBtn = e[0] || null, this.state.modeHighlightBtn = e[1] || null, this.state.reloadNavBtn = t.querySelector(".lhvj-reload-nav-btn"), this.state.viewedColorInput = t.querySelector(".lhvj-viewed-color-input"), this.state.appliedColorInput = t.querySelector(".lhvj-applied-color-input"), this.state.activeColorInput = t.querySelector(".lhvj-active-color-input"), this.state.viewedColorResetBtn = t.querySelector(".lhvj-viewed-color-reset"), this.state.appliedColorResetBtn = t.querySelector(".lhvj-applied-color-reset"), this.state.activeColorResetBtn = t.querySelector(".lhvj-active-color-reset"), this.state.opacityInput = t.querySelector(".lhvj-opacity-input"), this.state.opacityValue = t.querySelector(".lhvj-opacity-value"), this.state.opacityResetBtn = t.querySelector(".lhvj-opacity-reset");
		}
		buildColorControl(t, e, n) {
			const i = document.createElement("div");
			i.className = "lhvj-color-control";
			const o = document.createElement("span");
			o.className = "lhvj-color-caption", o.textContent = t;
			const s = document.createElement("div");
			s.className = "lhvj-color-actions";
			const a = document.createElement("input");
			a.type = "color", a.className = `lhvj-color-input lhvj-${n}-color-input`, a.value = e, a.setAttribute("aria-label", `${t} highlight color`), a.addEventListener("input", () => {
				this.onHighlightColorChange(n, a.value);
			});
			const l = document.createElement("button");
			return l.type = "button", l.className = `lhvj-reset-btn lhvj-${n}-color-reset`, l.textContent = "Reset", l.setAttribute("aria-label", `Reset ${t.toLowerCase()} highlight color`), l.addEventListener("click", (t) => {
				t.preventDefault(), this.onHighlightColorReset(n);
			}), s.appendChild(a), s.appendChild(l), i.appendChild(o), i.appendChild(s), i;
		}
		clampPosition(e, n, i) {
			const o = t.UI_EDGE_MARGIN, s = Math.max(o, window.innerWidth - i.offsetWidth - o), a = Math.max(o, window.innerHeight - i.offsetHeight - o);
			return {
				left: Math.min(Math.max(e, o), s),
				top: Math.min(Math.max(n, o), a)
			};
		}
		applyPosition(t, e, n, i) {
			const o = this.clampPosition(e, n, t);
			t.style.left = `${o.left}px`, t.style.top = `${o.top}px`, t.style.right = "auto", i && this.storage.savePosition(o);
		}
		makeDraggable(t, e) {
			let n = null, i = 0, o = 0;
			e.addEventListener("pointerdown", (s) => {
				n = s.pointerId;
				const a = t.getBoundingClientRect();
				i = s.clientX - a.left, o = s.clientY - a.top, this.isDragging = !0, t.classList.add("lhvj-dragging"), e.setPointerCapture(n), s.preventDefault();
			}), e.addEventListener("pointermove", (e) => {
				this.isDragging && n === e.pointerId && (this.applyPosition(t, e.clientX - i, e.clientY - o, !1), e.preventDefault());
			});
			const s = (i) => {
				if (!this.isDragging || n !== i.pointerId) return;
				this.isDragging = !1, t.classList.remove("lhvj-dragging"), e.hasPointerCapture(n) && e.releasePointerCapture(n);
				const o = t.getBoundingClientRect();
				this.applyPosition(t, o.left, o.top, !0), n = null, i.preventDefault();
			};
			e.addEventListener("pointerup", s), e.addEventListener("pointercancel", s);
		}
	}, v = new class n {
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
		highlightColors;
		highlightOpacity;
		hiddenCount = 0;
		rafId = 0;
		isRuntimeActive = !1;
		isReloadingForPathChange = !1;
		lastRouteChangeAt = Date.now();
		isCooldownActive = !1;
		cooldownUntil = 0;
		lastControlledScrollAt = 0;
		touchLastY = null;
		lastObservedScrollY = 0;
		lastObservedScrollAt = Date.now();
		isAdjustingNativeScroll = !1;
		countGrowthSinceCooldown = 0;
		constructor() {
			this.storage = new c(), this.matcher = new u(), this.detection = new g(this.matcher), this.styleManager = new b(), this.showHidden = this.storage.getShowHidden(), this.scrollGuardEnabled = this.storage.getScrollGuardEnabled(), this.detectionMode = this.storage.getDetectionMode(), this.reloadOnNavigationEnabled = this.storage.getReloadOnNavigation(), this.highlightColors = this.storage.getHighlightColors(), this.highlightOpacity = this.storage.getHighlightOpacity(), this.badge = new m(this.storage, (t) => {
				this.showHidden = t, this.storage.setShowHidden(t), t || (this.resetScrollCooldown(), this.resetCountBasedCooldownProgress()), this.scheduleRefresh();
			}, (t) => {
				this.scrollGuardEnabled = t, this.storage.setScrollGuardEnabled(t), t || (this.resetScrollCooldown(), this.resetCountBasedCooldownProgress()), this.scheduleRefresh();
			}, (t) => {
				this.detectionMode = t, this.storage.setDetectionMode(t), this.scheduleRefresh();
			}, (t) => {
				this.reloadOnNavigationEnabled = t, this.storage.setReloadOnNavigation(t);
			}, (t, e) => {
				this.updateHighlightColor(t, e);
			}, (t) => {
				this.resetHighlightColor(t);
			}, (t) => {
				this.updateHighlightOpacity(t);
			}, () => {
				this.resetHighlightOpacity();
			}), this.router = new p(() => this.scheduleRefresh(), () => this.hardRestartRuntimeForPathChange());
		}
		init() {
			this.styleManager.inject(this.getHighlightSettings()), this.startRuntime(), this.router.startObserving();
		}
		startRuntime() {
			this.isRuntimeActive || (this.lastRouteChangeAt = Date.now(), this.lastObservedScrollY = window.scrollY, this.lastObservedScrollAt = Date.now(), this.router.restartDomObserver(), this.scheduleRefresh(), this.router.queueRefresh(120), this.router.queueRefresh(420), window.addEventListener("resize", this.onWindowResize), window.addEventListener("scroll", this.onWindowScroll, {
				passive: !0,
				capture: !0
			}), window.addEventListener("wheel", this.onWheel, {
				passive: !1,
				capture: !0
			}), window.addEventListener("mousedown", this.onMouseDown, { capture: !0 }), window.addEventListener("auxclick", this.onAuxClick, { capture: !0 }), window.addEventListener("keydown", this.onKeyDown, {
				passive: !1,
				capture: !0
			}), window.addEventListener("touchstart", this.onTouchStart, { passive: !0 }), window.addEventListener("touchmove", this.onTouchMove, {
				passive: !1,
				capture: !0
			}), window.addEventListener("touchend", this.onTouchEnd, { passive: !0 }), window.addEventListener("touchcancel", this.onTouchEnd, { passive: !0 }), this.isRuntimeActive = !0, this.detection.isJobsPage() && this.router.startRouteRefreshBurst());
		}
		hardRestartRuntimeForPathChange() {
			if (!this.showHidden || !this.reloadOnNavigationEnabled) return this.lastRouteChangeAt = Date.now(), this.router.restartDomObserver(), this.scheduleRefresh(), this.router.queueRefresh(120), void this.router.queueRefresh(420);
			this.isReloadingForPathChange || (this.isReloadingForPathChange = !0, window.location.reload());
		}
		scheduleRefresh() {
			this.rafId && cancelAnimationFrame(this.rafId), this.rafId = requestAnimationFrame(() => {
				this.rafId = 0, this.refresh();
			});
		}
		refresh() {
			this.syncCooldownState(), this.syncPaginationCooldownClass();
			const e = this.hiddenCount;
			if (!this.detection.isJobsPage()) return this.hiddenCount = 0, this.resetScrollCooldown(), this.resetCountBasedCooldownProgress(), void this.badge.remove();
			if (!this.showHidden) return this.hiddenCount = 0, this.resetScrollCooldown(), this.resetCountBasedCooldownProgress(), this.clearDetectedVisualState(), this.badge.ensure(this.showHidden, this.scrollGuardEnabled, this.detectionMode, this.reloadOnNavigationEnabled, this.getHighlightSettings()), void this.badge.updateCount(0, this.showHidden, this.scrollGuardEnabled, this.detectionMode, this.reloadOnNavigationEnabled, this.getHighlightSettings(), 0);
			this.isCountCooldownPage() || this.resetCountBasedCooldownProgress();
			const n = this.detection.getJobCards();
			0 === n.length && Date.now() - this.lastRouteChangeAt < t.LAZY_RENDER_TIMEOUT_MS && (this.router.queueRefresh(180), this.router.queueRefresh(600));
			const i = this.detection.getDetectedCardsFromMarkers(), o = new Map(i);
			for (const t of n) {
				const e = this.detection.getDetectedJobState(t);
				e && this.setDetectedState(o, t, e);
			}
			const s = "hide" === this.detectionMode, a = this.detection.refreshDetectedAnchors(s), l = this.detection.refreshDetectedCardsFallback(s), r = new Map(o);
			this.mergeDetectedCardStates(r, a.detectedAnchorCards), this.mergeDetectedCardStates(r, l);
			const h = new Set(n), d = this.detection.getActiveCards(h);
			for (const t of n) {
				const e = r.get(t) ?? null;
				this.detection.applyVisibility(t, !!e && s), this.detection.applyDetectedHighlight(t, s ? null : e), this.detection.applyActiveHighlight(t, d.has(t));
			}
			r.forEach((t, e) => {
				h.has(e) || (this.detection.applyVisibility(e, s), this.detection.applyDetectedHighlight(e, s ? null : t), this.detection.applyActiveHighlight(e, d.has(e)));
			}), document.querySelectorAll("[data-lhvj-hidden=\"1\"]").forEach((t) => {
				s && r.has(t) || this.detection.applyVisibility(t, !1);
			}), document.querySelectorAll("[data-lhvj-viewed=\"1\"], [data-lhvj-applied=\"1\"]").forEach((t) => {
				r.has(t) && !s || this.detection.applyDetectedHighlight(t, null);
			}), document.querySelectorAll("[data-lhvj-active=\"1\"]").forEach((t) => {
				d.has(t) || this.detection.applyActiveHighlight(t, !1);
			}), this.hiddenCount = Math.max(r.size, a.detectedAnchorCount), this.maybeStartCountBasedCooldown(e), this.badge.ensure(this.showHidden, this.scrollGuardEnabled, this.detectionMode, this.reloadOnNavigationEnabled, this.getHighlightSettings()), this.badge.updateCount(this.hiddenCount, this.showHidden, this.scrollGuardEnabled, this.detectionMode, this.reloadOnNavigationEnabled, this.getHighlightSettings(), this.getCooldownSecondsLeft());
		}
		updateHighlightColor(t, e) {
			"viewed" === t ? this.storage.setViewedHighlightColor(e) : "applied" === t ? this.storage.setAppliedHighlightColor(e) : this.storage.setActiveHighlightColor(e), this.highlightColors = this.storage.getHighlightColors(), this.styleManager.updateHighlightStyles(this.getHighlightSettings()), this.scheduleRefresh();
		}
		resetHighlightColor(t) {
			"viewed" === t ? this.storage.resetViewedHighlightColor() : "applied" === t ? this.storage.resetAppliedHighlightColor() : this.storage.resetActiveHighlightColor(), this.highlightColors = this.storage.getHighlightColors(), this.styleManager.updateHighlightStyles(this.getHighlightSettings()), this.scheduleRefresh();
		}
		updateHighlightOpacity(t) {
			this.storage.setHighlightOpacity(t), this.highlightOpacity = this.storage.getHighlightOpacity(), this.styleManager.updateHighlightStyles(this.getHighlightSettings()), this.scheduleRefresh();
		}
		resetHighlightOpacity() {
			this.storage.resetHighlightOpacity(), this.highlightOpacity = this.storage.getHighlightOpacity(), this.styleManager.updateHighlightStyles(this.getHighlightSettings()), this.scheduleRefresh();
		}
		getHighlightSettings() {
			return {
				colors: this.highlightColors,
				opacity: this.highlightOpacity
			};
		}
		mergeDetectedCardStates(t, e) {
			e.forEach((e, n) => {
				this.setDetectedState(t, n, e);
			});
		}
		setDetectedState(t, e, n) {
			const i = t.get(e);
			"applied" !== i && ("applied" !== n && i || t.set(e, n));
		}
		onWindowResize = () => {
			this.badge.syncPositionWithinViewport();
		};
		onWheel = (t) => {
			t.deltaY <= 0 || this.handleScrollGuardInput(t.deltaY, () => {
				t.preventDefault(), t.stopPropagation();
			}) && this.scheduleRefresh();
		};
		onWindowScroll = () => {
			const e = Date.now(), n = window.scrollY, i = n - this.lastObservedScrollY, o = Math.max(1, e - this.lastObservedScrollAt);
			if (i <= 0) return this.lastObservedScrollY = n, void (this.lastObservedScrollAt = e);
			if (!this.shouldUseScrollGuard()) return this.lastObservedScrollY = n, void (this.lastObservedScrollAt = e);
			if (this.syncCooldownState(), this.isCooldownActive && !this.isAdjustingNativeScroll) {
				const n = Math.max(14, t.SCROLL_GUARD_ALLOWED_STEP_PX * o / t.SCROLL_GUARD_ALLOWED_STEP_MIN_INTERVAL_MS);
				if (i > n) {
					const t = this.lastObservedScrollY + n;
					this.isAdjustingNativeScroll = !0, window.scrollTo({
						top: t,
						behavior: "auto"
					}), this.lastObservedScrollY = t, this.lastObservedScrollAt = e, window.setTimeout(() => {
						this.isAdjustingNativeScroll = !1;
					}, 0), this.scheduleRefresh();
					return;
				}
			}
			this.lastObservedScrollY = n, this.lastObservedScrollAt = e;
		};
		onMouseDown = (t) => {
			1 === t.button && this.shouldBlockMiddleMouseDuringCooldown() && (t.preventDefault(), t.stopPropagation());
		};
		onAuxClick = (t) => {
			1 === t.button && this.shouldBlockMiddleMouseDuringCooldown() && (t.preventDefault(), t.stopPropagation());
		};
		onKeyDown = (t) => {
			if (this.isEditableTarget(t.target)) return;
			const e = t.key;
			let n = 0;
			if ("ArrowDown" === e) n = 96;
			else if ("PageDown" === e) n = Math.max(.85 * window.innerHeight, 280);
			else if (" " === e) {
				if (t.shiftKey) return;
				n = Math.max(.85 * window.innerHeight, 280);
			}
			n <= 0 || this.handleScrollGuardInput(n, () => {
				t.preventDefault(), t.stopPropagation();
			}) && this.scheduleRefresh();
		};
		onTouchStart = (t) => {
			0 !== t.touches.length && (this.touchLastY = t.touches[0].clientY);
		};
		onTouchMove = (t) => {
			if (0 === t.touches.length || null === this.touchLastY) return;
			const e = t.touches[0].clientY, n = this.touchLastY - e;
			this.touchLastY = e, n <= 0 || this.handleScrollGuardInput(n, () => {
				t.preventDefault(), t.stopPropagation();
			}) && this.scheduleRefresh();
		};
		onTouchEnd = () => {
			this.touchLastY = null;
		};
		handleScrollGuardInput(t, e) {
			return !!this.shouldUseScrollGuard() && (this.syncCooldownState(), !!this.isCooldownActive && (e(), this.applyControlledScroll(t), !0));
		}
		shouldUseScrollGuard() {
			return !!this.scrollGuardEnabled && !!this.showHidden && this.detection.isJobsPage();
		}
		shouldBlockMiddleMouseDuringCooldown() {
			return !!this.isCooldownActive && this.shouldUseScrollGuard();
		}
		shouldUseCountBasedCooldown() {
			return !!this.scrollGuardEnabled && !!this.showHidden && this.isCountCooldownPage();
		}
		maybeStartCountBasedCooldown(t) {
			if (!this.shouldUseCountBasedCooldown()) return;
			if (this.hiddenCount > t && (this.countGrowthSinceCooldown += this.hiddenCount - t), this.countGrowthSinceCooldown < n.COUNT_COOLDOWN_STEP) return;
			const e = Math.floor(this.countGrowthSinceCooldown / n.COUNT_COOLDOWN_STEP);
			this.countGrowthSinceCooldown -= e * n.COUNT_COOLDOWN_STEP;
			for (let n = 0; n < e; n++) this.startRandomCooldown();
		}
		resetCountBasedCooldownProgress() {
			this.countGrowthSinceCooldown = 0;
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
			const e = t.SCROLL_GUARD_COOLDOWN_MIN_MS, n = t.SCROLL_GUARD_COOLDOWN_MAX_MS, i = e + Math.floor(Math.random() * (n - e + 1));
			this.isCooldownActive ? this.cooldownUntil += i : (this.isCooldownActive = !0, this.cooldownUntil = Date.now() + i, this.lastControlledScrollAt = 0, this.syncPaginationCooldownClass());
			const o = Math.max(0, this.cooldownUntil - Date.now());
			window.setTimeout(() => {
				this.isCooldownActive && (this.syncCooldownState(), this.scheduleRefresh());
			}, o + 20);
		}
		applyControlledScroll(e) {
			const n = Date.now();
			if (n - this.lastControlledScrollAt < t.SCROLL_GUARD_ALLOWED_STEP_MIN_INTERVAL_MS) return;
			const i = Math.min(Math.max(e, 0), t.SCROLL_GUARD_ALLOWED_STEP_PX);
			i <= 0 || (window.scrollBy({
				top: i,
				behavior: "auto"
			}), this.lastControlledScrollAt = n);
		}
		syncCooldownState() {
			this.isCooldownActive && (Date.now() < this.cooldownUntil || this.resetScrollCooldown());
		}
		resetScrollCooldown() {
			this.isCooldownActive = !1, this.cooldownUntil = 0, this.lastControlledScrollAt = 0, this.isAdjustingNativeScroll = !1, this.syncPaginationCooldownClass();
		}
		getCooldownSecondsLeft() {
			if (!this.isCooldownActive) return 0;
			const t = this.cooldownUntil - Date.now();
			return t <= 0 ? 0 : Math.ceil(t / 1e3);
		}
		isEditableTarget(t) {
			return t instanceof HTMLElement && (!!t.isContentEditable || !!t.closest("input, textarea, select, [contenteditable=\"true\"], [role=\"textbox\"]"));
		}
		clearDetectedVisualState() {
			const { HIDDEN_CLASS: t } = e;
			document.querySelectorAll("[data-lhvj-hidden=\"1\"]").forEach((t) => {
				this.detection.applyVisibility(t, !1);
			}), document.querySelectorAll("[data-lhvj-viewed=\"1\"]").forEach((t) => {
				this.detection.applyDetectedHighlight(t, null);
			}), document.querySelectorAll("[data-lhvj-applied=\"1\"]").forEach((t) => {
				this.detection.applyDetectedHighlight(t, null);
			}), document.querySelectorAll("[data-lhvj-active=\"1\"]").forEach((t) => {
				this.detection.applyActiveHighlight(t, !1);
			}), document.querySelectorAll("a[data-lhvj-hidden-anchor=\"1\"]").forEach((e) => {
				e.classList.remove(t), e.removeAttribute("data-lhvj-hidden-anchor");
			});
		}
		syncPaginationCooldownClass() {
			const t = document.documentElement;
			if (!t) return;
			const e = this.isCooldownActive && this.detection.isJobsPage();
			t.classList.toggle(n.PAGINATION_COOLDOWN_CLASS, e);
		}
	}();
	"loading" === document.readyState ? document.addEventListener("DOMContentLoaded", () => v.init(), { once: !0 }) : v.init();
	//#endregion
})();