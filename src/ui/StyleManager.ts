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
      .${HIDDEN_CLASS} { display: none !important; }

      #${UI_ID} {
        position: fixed;
        top: 76px;
        right: 16px;
        z-index: ${UI_Z_INDEX};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background: #1d2226;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);
        display: inline-flex;
        align-items: center;
        height: 32px;
        overflow: hidden;
        user-select: none;
        transition: box-shadow 0.15s ease;
      }

      #${UI_ID}:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.35);
      }

      #${UI_ID}.lhvj-dragging {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      #${UI_ID} .lhvj-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 100%;
        cursor: grab;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        color: #3d4449;
        flex-shrink: 0;
        transition: color 0.15s ease;
      }

      #${UI_ID} .lhvj-drag-handle:hover {
        color: #9aa4ae;
      }

      #${UI_ID} .lhvj-drag-handle::before {
        content: "";
        display: block;
        width: 8px;
        height: 12px;
        background: radial-gradient(circle, currentColor 1.2px, transparent 1.2px);
        background-size: 4px 4px;
      }

      #${UI_ID} label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 0 10px 0 8px;
        height: 100%;
        cursor: pointer;
      }

      #${UI_ID} .lhvj-count {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
      }

      #${UI_ID} .lhvj-count-num {
        font-size: 13px;
        font-weight: 600;
        line-height: 1;
        color: #e7e9ea;
      }

      #${UI_ID} .lhvj-count-unit {
        font-size: 11px;
        font-weight: 400;
        line-height: 1;
        color: #9aa4ae;
      }

      #${UI_ID} .lhvj-state {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 30px;
        padding: 2px 7px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.3px;
        line-height: 1;
        text-align: center;
        background: rgba(255, 255, 255, 0.1);
        color: #c9d1d9;
      }

      #${UI_ID}[data-show-hidden="1"] .lhvj-state {
        background: rgba(112, 181, 249, 0.2);
        color: #9fd0ff;
      }

      #${UI_ID} input[type="checkbox"] {
        appearance: none;
        width: 0;
        height: 0;
        margin: 0;
        padding: 0;
        border-radius: 999px;
        background: #4d5661;
        position: absolute;
        opacity: 0;
        outline: none;
        border: none;
        transition: background 0.2s ease;
        cursor: pointer;
        pointer-events: none;
        flex-shrink: 0;
      }

      #${UI_ID} input[type="checkbox"]::after {
        content: "";
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        position: absolute;
        top: 2px;
        left: 2px;
        transition: transform 0.2s ease;
      }

      #${UI_ID} input[type="checkbox"]:checked { background: #70b5f9; }
      #${UI_ID} input[type="checkbox"]:checked::after { transform: translateX(14px); }
      #${UI_ID} input[type="checkbox"]:focus-visible {
        outline: 2px solid #70b5f9;
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

      @media (max-width: 900px) {
        #${UI_ID} {
          top: 70px;
          right: 8px;
        }
      }
    `;
  }
}
