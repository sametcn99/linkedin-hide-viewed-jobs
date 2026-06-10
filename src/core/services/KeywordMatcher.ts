import { APPLIED_KEYWORDS, VIEWED_KEYWORDS } from '../constants'
import type { TDetectedJobState } from '../types'

/**
 * Handles text normalization and keyword matching for viewed-job detection.
 */
export class KeywordMatcher {
  private readonly normalizedViewedKeywords: string[]
  private readonly normalizedAppliedKeywords: string[]
  private normalizedCustomKeywords: string[]

  constructor(customKeywords: string[] = []) {
    this.normalizedViewedKeywords = VIEWED_KEYWORDS.map((kw) => this.normalize(kw)).filter(
      (kw) => kw.length > 0
    )
    this.normalizedAppliedKeywords = APPLIED_KEYWORDS.map((kw) => this.normalize(kw)).filter(
      (kw) => kw.length > 0
    )
    this.normalizedCustomKeywords = customKeywords
      .map((kw) => this.normalize(kw))
      .filter((kw) => kw.length > 0)
  }

  setCustomKeywords(keywords: string[]): void {
    this.normalizedCustomKeywords = keywords
      .map((kw) => this.normalize(kw))
      .filter((kw) => kw.length > 0)
  }

  matchCustomKeywords(text: string): boolean {
    if (this.normalizedCustomKeywords.length === 0) return false
    const normalized = this.normalize(text)
    if (!normalized) return false
    return this.containsAnySubstring(normalized, this.normalizedCustomKeywords)
  }

  matchCustomKeywordsFromElement(el: HTMLElement): boolean {
    const text = (el.textContent || '').trim()
    const aria = el.getAttribute('aria-label') || ''
    const title = el.getAttribute('title') || ''
    const altTexts: string[] = []
    el.querySelectorAll<HTMLElement>('[alt]').forEach((child) => {
      const alt = child.getAttribute('alt')
      if (alt) altTexts.push(alt)
    })
    return (
      this.matchCustomKeywords(text) ||
      this.matchCustomKeywords(aria) ||
      this.matchCustomKeywords(title) ||
      (altTexts.length > 0 && altTexts.some((a) => this.matchCustomKeywords(a)))
    )
  }

  normalize(text: string): string {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  getDetectedStateFromText(text: string): TDetectedJobState | null {
    const normalized = this.normalize(text)
    if (!normalized) return null

    if (this.containsAnyKeyword(normalized, this.normalizedAppliedKeywords)) {
      return 'applied'
    }

    if (this.containsAnyKeyword(normalized, this.normalizedViewedKeywords)) {
      return 'viewed'
    }

    return null
  }

  getDetectedStateFromElement(el: HTMLElement): TDetectedJobState | null {
    const text = (el.textContent || '').trim()
    const aria = el.getAttribute('aria-label') || ''
    const title = el.getAttribute('title') || ''

    return (
      this.getDetectedStateFromText(text) ||
      this.getDetectedStateFromText(aria) ||
      this.getDetectedStateFromText(title)
    )
  }

  private containsAnyKeyword(text: string, keywords: readonly string[]): boolean {
    for (const keyword of keywords) {
      if (this.containsKeywordExactly(text, keyword)) {
        return true
      }
    }
    return false
  }

  private containsAnySubstring(text: string, keywords: readonly string[]): boolean {
    for (const keyword of keywords) {
      if (text.includes(keyword)) return true
    }
    return false
  }

  private containsKeywordExactly(text: string, keyword: string): boolean {
    let fromIndex = 0
    while (fromIndex < text.length) {
      const index = text.indexOf(keyword, fromIndex)
      if (index === -1) return false
      if (this.hasBoundary(text, index, keyword.length)) return true
      fromIndex = index + 1
    }
    return false
  }

  private hasBoundary(text: string, start: number, keywordLength: number): boolean {
    const before = start > 0 ? text[start - 1] : ''
    const afterIndex = start + keywordLength
    const after = afterIndex < text.length ? text[afterIndex] : ''
    return !this.isAsciiLetterOrNumber(before) && !this.isAsciiLetterOrNumber(after)
  }

  private isAsciiLetterOrNumber(ch: string): boolean {
    if (!ch) return false
    const code = ch.charCodeAt(0)
    return (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122)
  }
}
