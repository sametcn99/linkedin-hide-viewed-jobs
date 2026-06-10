import type { CustomKeywordsChangeCallback } from './types';

export class KeywordManager {
  private keywords: string[];

  constructor(
    initial: string[],
    private readonly onChange: CustomKeywordsChangeCallback
  ) {
    this.keywords = [...initial];
  }

  getKeywords(): string[] {
    return this.keywords;
  }

  setKeywords(keywords: string[]): void {
    this.keywords = [...keywords];
  }

  hasKeyword(value: string): boolean {
    return this.keywords.includes(value);
  }

  add(value: string): void {
    const normalized = value.trim().toLowerCase();
    if (!normalized || this.keywords.includes(normalized)) return;
    this.keywords = [...this.keywords, normalized];
    this.onChange(this.keywords);
  }

  remove(value: string): void {
    this.keywords = this.keywords.filter((k) => k !== value);
    this.onChange(this.keywords);
  }
}

export function createChipContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'lhvj-keyword-chips';
  return container;
}

export function createDuplicateMessage(): {
  element: HTMLSpanElement;
  show: () => void;
  hide: () => void;
} {
  const element = document.createElement('span');
  element.className = 'lhvj-keyword-duplicate-msg';
  element.textContent = 'Already added';
  element.style.display = 'none';

  let fadeTimer: ReturnType<typeof setTimeout> | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  const show = (): void => {
    if (fadeTimer) clearTimeout(fadeTimer);
    if (hideTimer) clearTimeout(hideTimer);
    element.style.display = 'inline';
    element.style.opacity = '1';
    fadeTimer = setTimeout(() => {
      element.style.opacity = '0';
      hideTimer = setTimeout(() => {
        element.style.display = 'none';
      }, 300);
    }, 1500);
  };

  const hide = (): void => {
    if (fadeTimer) clearTimeout(fadeTimer);
    if (hideTimer) clearTimeout(hideTimer);
    element.style.display = 'none';
    element.style.opacity = '0';
  };

  return { element, show, hide };
}

export function renderKeywordChips(
  container: HTMLDivElement,
  keywords: string[],
  onRemove: (keyword: string) => void
): void {
  container.innerHTML = '';
  for (const keyword of keywords) {
    const chip = document.createElement('span');
    chip.className = 'lhvj-chip';
    chip.textContent = keyword;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'lhvj-chip-remove';
    removeBtn.textContent = '×';
    removeBtn.setAttribute('aria-label', `Remove keyword ${keyword}`);
    removeBtn.addEventListener('click', () => {
      onRemove(keyword);
    });

    chip.appendChild(removeBtn);
    container.appendChild(chip);
  }
}

export function syncKeywordChips(container: HTMLDivElement, keywords: string[]): boolean {
  const existing = Array.from(container.querySelectorAll('.lhvj-chip')).map(
    (el) => el.childNodes[0]?.textContent ?? ''
  );
  const matches =
    existing.length === keywords.length && existing.every((text, i) => text === keywords[i]);
  return !matches;
}

export function attachKeywordInput(
  input: HTMLInputElement,
  manager: KeywordManager,
  duplicateMessage: { show: () => void; hide: () => void },
  onAfterChange: (container: HTMLDivElement, input: HTMLInputElement) => void,
  getContainer: () => HTMLDivElement | null
): void {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = input.value.trim().toLowerCase();
      if (!value) return;
      if (manager.hasKeyword(value)) {
        duplicateMessage.show();
        return;
      }
      duplicateMessage.hide();
      manager.add(value);
      input.value = '';
      const container = getContainer();
      if (container) onAfterChange(container, input);
    }
  });
}
