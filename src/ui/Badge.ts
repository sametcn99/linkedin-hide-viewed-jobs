import type { IPosition, IUIState } from '../types';
import { CONFIG, DOM_IDS } from '../constants';
import { StorageService } from '../services/StorageService';

type ToggleCallback = (checked: boolean) => void;

/**
 * The draggable UI badge that shows viewed/hidden job counts.
 */
export class Badge {
  private readonly storage: StorageService;
  private readonly onToggle: ToggleCallback;
  private readonly state: IUIState = {
    root: null,
    countNum: null,
    countUnit: null,
    stateEl: null,
  };
  private isDragging = false;

  constructor(storage: StorageService, onToggle: ToggleCallback) {
    this.storage = storage;
    this.onToggle = onToggle;
  }

  /** Create or reattach the badge, returns the root element */
  ensure(showHidden: boolean): HTMLDivElement {
    if (this.state.root && document.body.contains(this.state.root)) {
      return this.state.root;
    }

    let root = document.getElementById(DOM_IDS.UI_ID) as HTMLDivElement | null;
    if (root) {
      this.cacheElements(root);
      return root;
    }

    root = this.buildDom(showHidden);
    document.body.appendChild(root);

    const saved = this.storage.getSavedPosition();
    if (saved) {
      this.applyPosition(root, saved.left, saved.top, false);
    }

    this.cacheElements(root);
    return root;
  }

  /** Update displayed count and state label */
  updateCount(hiddenCount: number, showHidden: boolean): void {
    const root = this.state.root;
    if (!root || !this.state.countNum || !this.state.countUnit || !this.state.stateEl) return;

    root.setAttribute('data-show-hidden', showHidden ? '1' : '0');
    this.state.countNum.textContent = String(hiddenCount);
    this.state.countUnit.textContent = showHidden ? 'hidden' : 'viewed';
    this.state.stateEl.textContent = showHidden ? 'ON' : 'OFF';
  }

  /** Remove the badge from the DOM */
  remove(): void {
    const root = document.getElementById(DOM_IDS.UI_ID);
    if (root) root.remove();
    this.state.root = null;
    this.state.countNum = null;
    this.state.countUnit = null;
    this.state.stateEl = null;
  }

  /** Clamp badge position within the viewport */
  syncPositionWithinViewport(): void {
    const root = document.getElementById(DOM_IDS.UI_ID) as HTMLDivElement | null;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    this.applyPosition(root, rect.left, rect.top, true);
  }

  // ── Private ──────────────────────────────────────────────────────────

  private buildDom(showHidden: boolean): HTMLDivElement {
    const root = document.createElement('div');
    root.id = DOM_IDS.UI_ID;

    const dragHandle = document.createElement('span');
    dragHandle.className = 'lhvj-drag-handle';
    dragHandle.title = 'Drag to reposition';
    dragHandle.setAttribute('aria-label', 'Drag badge');

    const label = document.createElement('label');

    const countEl = document.createElement('span');
    countEl.className = 'lhvj-count';

    const countNum = document.createElement('span');
    countNum.className = 'lhvj-count-num';
    countNum.textContent = '0';

    const countUnit = document.createElement('span');
    countUnit.className = 'lhvj-count-unit';
    countUnit.textContent = showHidden ? 'hidden' : 'viewed';

    countEl.appendChild(countNum);
    countEl.appendChild(countUnit);

    const stateEl = document.createElement('span');
    stateEl.className = 'lhvj-state';
    stateEl.textContent = showHidden ? 'ON' : 'OFF';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = showHidden;
    checkbox.setAttribute('aria-label', 'Toggle hiding of viewed jobs');
    checkbox.addEventListener('change', () => {
      this.onToggle(checkbox.checked);
    });

    label.appendChild(stateEl);
    label.appendChild(countEl);
    label.appendChild(checkbox);

    root.appendChild(dragHandle);
    root.appendChild(label);

    this.makeDraggable(root, dragHandle);

    return root;
  }

  private cacheElements(root: HTMLDivElement): void {
    this.state.root = root;
    this.state.countNum = root.querySelector('.lhvj-count-num');
    this.state.countUnit = root.querySelector('.lhvj-count-unit');
    this.state.stateEl = root.querySelector('.lhvj-state');
  }

  private clampPosition(left: number, top: number, root: HTMLElement): IPosition {
    const margin = CONFIG.UI_EDGE_MARGIN;
    const maxLeft = Math.max(margin, window.innerWidth - root.offsetWidth - margin);
    const maxTop = Math.max(margin, window.innerHeight - root.offsetHeight - margin);
    return {
      left: Math.min(Math.max(left, margin), maxLeft),
      top: Math.min(Math.max(top, margin), maxTop),
    };
  }

  private applyPosition(root: HTMLElement, left: number, top: number, save: boolean): void {
    const clamped = this.clampPosition(left, top, root);
    root.style.left = `${clamped.left}px`;
    root.style.top = `${clamped.top}px`;
    root.style.right = 'auto';
    if (save) this.storage.savePosition(clamped);
  }

  private makeDraggable(root: HTMLDivElement, dragHandle: HTMLElement): void {
    let pointerId: number | null = null;
    let offsetX = 0;
    let offsetY = 0;

    dragHandle.addEventListener('pointerdown', (e: PointerEvent) => {
      pointerId = e.pointerId;
      const rect = root.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      this.isDragging = true;
      root.classList.add('lhvj-dragging');
      dragHandle.setPointerCapture(pointerId);
      e.preventDefault();
    });

    dragHandle.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isDragging || pointerId !== e.pointerId) return;
      this.applyPosition(root, e.clientX - offsetX, e.clientY - offsetY, false);
      e.preventDefault();
    });

    const stopDrag = (e: PointerEvent) => {
      if (!this.isDragging || pointerId !== e.pointerId) return;
      this.isDragging = false;
      root.classList.remove('lhvj-dragging');
      if (dragHandle.hasPointerCapture(pointerId!)) {
        dragHandle.releasePointerCapture(pointerId!);
      }
      const rect = root.getBoundingClientRect();
      this.applyPosition(root, rect.left, rect.top, true);
      pointerId = null;
      e.preventDefault();
    };

    dragHandle.addEventListener('pointerup', stopDrag);
    dragHandle.addEventListener('pointercancel', stopDrag);
  }
}
