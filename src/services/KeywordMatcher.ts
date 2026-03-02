import { VIEWED_KEYWORDS } from '../constants';

/**
 * Handles text normalization and keyword matching for viewed-job detection.
 */
export class KeywordMatcher {
  private readonly normalizedKeywords: string[];

  constructor() {
    this.normalizedKeywords = VIEWED_KEYWORDS.map((kw) => this.normalize(kw)).filter(
      (kw) => kw.length > 0
    );
  }

  normalize(text: string): string {
    return (text || '')
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  hasViewedKeyword(text: string): boolean {
    const normalized = this.normalize(text);
    if (!normalized) return false;

    for (const keyword of this.normalizedKeywords) {
      if (this.containsKeywordExactly(normalized, keyword)) {
        return true;
      }
    }
    return false;
  }

  hasViewedText(el: HTMLElement): boolean {
    const text = (el.textContent || '').trim();
    const aria = el.getAttribute('aria-label') || '';
    const title = el.getAttribute('title') || '';
    return (
      this.hasViewedKeyword(text) || this.hasViewedKeyword(aria) || this.hasViewedKeyword(title)
    );
  }

  private containsKeywordExactly(text: string, keyword: string): boolean {
    let fromIndex = 0;
    while (fromIndex < text.length) {
      const index = text.indexOf(keyword, fromIndex);
      if (index === -1) return false;
      if (this.hasBoundary(text, index, keyword.length)) return true;
      fromIndex = index + 1;
    }
    return false;
  }

  private hasBoundary(text: string, start: number, keywordLength: number): boolean {
    const before = start > 0 ? text[start - 1] : '';
    const afterIndex = start + keywordLength;
    const after = afterIndex < text.length ? text[afterIndex] : '';
    return !this.isAsciiLetterOrNumber(before) && !this.isAsciiLetterOrNumber(after);
  }

  private isAsciiLetterOrNumber(ch: string): boolean {
    if (!ch) return false;
    const code = ch.charCodeAt(0);
    return (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
  }
}
