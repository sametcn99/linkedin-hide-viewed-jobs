import type { PopupElements } from './types';
import { saveSetting, renderKeywordChips } from './settings';
import { STORAGE_KEYS } from '../../../core/constants/config';

export function initKeywords(el: PopupElements): void {
  const { keywordChipInput } = el;

  if (!keywordChipInput) return;

  keywordChipInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const value = keywordChipInput.value.trim().toLowerCase();
    if (!value) return;

    chrome.storage.local.get(STORAGE_KEYS.CUSTOM_KEYWORDS, (result: Record<string, unknown>) => {
      let customKeywords: string[] = [];
      const raw = result[STORAGE_KEYS.CUSTOM_KEYWORDS];
      if (typeof raw === 'string' && raw.length > 0) {
        try {
          customKeywords = JSON.parse(raw) as string[];
        } catch {
          customKeywords = [];
        }
      }

      if (customKeywords.includes(value)) {
        const dupMsg = document.getElementById('keyword-duplicate-msg');
        if (dupMsg) {
          dupMsg.classList.add('is-visible');
          setTimeout(() => {
            dupMsg.classList.remove('is-visible');
          }, 1800);
        }
        return;
      }

      const newKeywords = [...customKeywords, value];
      saveSetting(STORAGE_KEYS.CUSTOM_KEYWORDS, JSON.stringify(newKeywords));
      renderKeywordChips(el, newKeywords);
      keywordChipInput.value = '';
    });
  });
}
