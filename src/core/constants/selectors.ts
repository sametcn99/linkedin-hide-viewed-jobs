export const JOB_CARD_SELECTORS: readonly string[] = Object.freeze([
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
  '.jobs-collections-module__job-card-container',
]);

export const VIEWED_MARKER_SELECTORS: readonly string[] = Object.freeze([
  'li.job-card-container__footer-job-state',
  'li[class*="footer-job-state"]',
  '.job-card-container__footer-wrapper li',
  '[class*="job-card-footer"]',
  '[class*="job-state"]',
  '[data-jobstate]',
  '[data-viewed="true"]',
  'span.job-card-list__footer',
]);

export const POTENTIAL_VIEWED_ANCHOR_SELECTORS: readonly string[] = Object.freeze([
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
  'a.jobs-collections-module__link',
]);

/** Pre-joined selector strings to avoid re-joining on every call */
export const CARD_SELECTOR_JOINED = JOB_CARD_SELECTORS.join(',');
export const MARKER_SELECTOR_JOINED = VIEWED_MARKER_SELECTORS.join(',');
export const ANCHOR_SELECTOR_JOINED = POTENTIAL_VIEWED_ANCHOR_SELECTORS.join(',');

/** Extended card selector for fallback matching */
export const EXTENDED_CARD_SELECTOR = [
  CARD_SELECTOR_JOINED,
  '[data-job-id]',
  '.job-card-container',
  '.job-card-list',
  '.base-card',
  '.job-search-card',
  'li[class*="jobs-search"]',
  'li[class*="job-card"]',
  'div[class*="job-card"]',
  'article[class*="job"]',
  'article[class*="base-card"]',
  '.jobs-collections-module__job-card',
  '.jobs-collections-module__job-card-container',
  'li.jobs-collections-module__list-item',
  'div.jobs-collections-module__list-item',
].join(',');
