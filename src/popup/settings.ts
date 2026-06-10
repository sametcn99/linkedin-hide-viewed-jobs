import { STORAGE_KEYS, DEFAULTS } from './constants';
import type { PopupElements } from './types';

export function saveSetting(key: string, value: string): void {
  chrome.storage.local.set({ [key]: value });
}

function syncColorSwatch(input: HTMLInputElement): void {
  const swatch = input.closest('.color-label')?.querySelector<HTMLElement>('.color-swatch');
  if (swatch) {
    swatch.style.setProperty('--color', input.value);
  }
}

export function loadSettings(el: PopupElements): void {
  const keys = Object.values(STORAGE_KEYS);
  chrome.storage.local.get(keys, (result: Record<string, unknown>) => {
    const showHidden = result[STORAGE_KEYS.SHOW_HIDDEN];
    el.toggleShowHidden.setAttribute('aria-checked', showHidden === '1' ? 'true' : 'false');

    const scrollGuard = result[STORAGE_KEYS.SCROLL_GUARD];
    el.toggleScrollGuard.setAttribute(
      'aria-checked',
      scrollGuard === '1' ? 'true' : scrollGuard === '0' ? 'false' : 'true'
    );

    const reloadNav = result[STORAGE_KEYS.RELOAD_NAVIGATION];
    el.toggleReloadNav.setAttribute('aria-checked', reloadNav === '1' ? 'true' : 'false');

    const mode = result[STORAGE_KEYS.DETECTION_MODE];
    el.modeHide.checked = mode !== 'highlight';
    el.modeHighlight.checked = mode === 'highlight';
    el.highlightSettings.hidden = mode !== 'highlight';

    el.colorViewed.value =
      (result[STORAGE_KEYS.VIEWED_COLOR] as string) || DEFAULTS[STORAGE_KEYS.VIEWED_COLOR];
    el.colorApplied.value =
      (result[STORAGE_KEYS.APPLIED_COLOR] as string) || DEFAULTS[STORAGE_KEYS.APPLIED_COLOR];
    el.colorActive.value =
      (result[STORAGE_KEYS.ACTIVE_COLOR] as string) || DEFAULTS[STORAGE_KEYS.ACTIVE_COLOR];
    el.colorKeyword.value =
      (result[STORAGE_KEYS.KEYWORD_COLOR] as string) || DEFAULTS[STORAGE_KEYS.KEYWORD_COLOR];
    syncColorSwatch(el.colorViewed);
    syncColorSwatch(el.colorApplied);
    syncColorSwatch(el.colorActive);
    syncColorSwatch(el.colorKeyword);

    const customKeywordsRaw = result[STORAGE_KEYS.CUSTOM_KEYWORDS] as string | undefined;
    let customKeywords: string[] = [];
    if (customKeywordsRaw) {
      try {
        customKeywords = JSON.parse(customKeywordsRaw) as string[];
      } catch {
        customKeywords = [];
      }
    }

    const opacity = Number(result[STORAGE_KEYS.OPACITY]) || 0.1;
    el.opacitySlider.value = String(opacity);
    el.opacityValue.textContent = opacity.toFixed(2);

    renderKeywordChips(el, customKeywords);
  });
}

export function renderKeywordChips(el: PopupElements, keywords: string[]): void {
  if (!el.keywordChipContainer) return;
  el.keywordChipContainer.innerHTML = '';
  for (const keyword of keywords) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = keyword;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'chip-remove';
    removeBtn.textContent = '×';
    removeBtn.setAttribute('aria-label', `Remove keyword ${keyword}`);
    removeBtn.addEventListener('click', () => {
      const newKeywords = keywords.filter((k) => k !== keyword);
      saveSetting(STORAGE_KEYS.CUSTOM_KEYWORDS, JSON.stringify(newKeywords));
      renderKeywordChips(el, newKeywords);
    });

    chip.appendChild(removeBtn);
    el.keywordChipContainer.appendChild(chip);
  }
  if (el.keywordChipInput) {
    el.keywordChipInput.placeholder = 'Add keyword and press Enter';
  }
}
