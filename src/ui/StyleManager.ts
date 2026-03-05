import { CONFIG, DOM_IDS } from '../constants';

/**
 * Injects and manages all CSS styles for the userscript.
 */
export class StyleManager {
  private injected = false;

  inject(): void {
    if (this.injected || document.getElementById('lhvj-style')) return;

    const style = document.createElement('style');
    style.id = 'lhvj-style';
    style.textContent = this.buildCSS();
    document.head.appendChild(style);
    this.injected = true;
  }

  private buildCSS(): string {
    const { HIDDEN_CLASS, UI_ID, VIEWED_HIGHLIGHT_CLASS } = DOM_IDS;
    const { UI_Z_INDEX, HIGHLIGHT_COLOR, HIGHLIGHT_BORDER_RADIUS } = CONFIG;

    return /* css */ `
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
        min-width: 262px;
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

      #${UI_ID} .lhvj-mode-btn {
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.06);
        color: #d4dde6;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.28px;
        padding: 4px 8px;
        cursor: pointer;
      }

      #${UI_ID} .lhvj-mode-btn:hover {
        background: rgba(255, 255, 255, 0.12);
      }

      #${UI_ID} .lhvj-mode-btn[data-active="1"] {
        border-color: rgba(130, 200, 255, 0.56);
        color: #b8e0ff;
        background: rgba(112, 181, 249, 0.24);
      }

      #${UI_ID} .lhvj-mode-btn:focus-visible {
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
}
