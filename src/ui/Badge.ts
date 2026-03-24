import type {
  IHighlightSettings,
  IPosition,
  IUIState,
  TDetectionMode,
  THighlightColorTarget,
} from '../types';
import { CONFIG, DOM_IDS } from '../constants';
import { StorageService } from '../services/StorageService';

type ToggleCallback = (checked: boolean) => void;
type ScrollGuardToggleCallback = (enabled: boolean) => void;
type DetectionModeChangeCallback = (mode: TDetectionMode) => void;
type ReloadNavigationToggleCallback = (enabled: boolean) => void;
type HighlightColorChangeCallback = (target: THighlightColorTarget, color: string) => void;
type HighlightColorResetCallback = (target: THighlightColorTarget) => void;
type HighlightOpacityChangeCallback = (value: number) => void;
type HighlightOpacityResetCallback = () => void;

/**
 * The draggable UI badge that shows viewed/hidden job counts.
 */
export class Badge {
  private static readonly REPOSITORY_URL = 'https://github.com/sametcn99/linkedin-hide-viewed-jobs';

  private readonly storage: StorageService;
  private readonly onToggle: ToggleCallback;
  private readonly onScrollGuardToggle: ScrollGuardToggleCallback;
  private readonly onDetectionModeChange: DetectionModeChangeCallback;
  private readonly onReloadNavigationToggle: ReloadNavigationToggleCallback;
  private readonly onHighlightColorChange: HighlightColorChangeCallback;
  private readonly onHighlightColorReset: HighlightColorResetCallback;
  private readonly onHighlightOpacityChange: HighlightOpacityChangeCallback;
  private readonly onHighlightOpacityReset: HighlightOpacityResetCallback;
  private readonly state: IUIState = {
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
    opacityResetBtn: null,
  };
  private isDragging = false;

  constructor(
    storage: StorageService,
    onToggle: ToggleCallback,
    onScrollGuardToggle: ScrollGuardToggleCallback,
    onDetectionModeChange: DetectionModeChangeCallback,
    onReloadNavigationToggle: ReloadNavigationToggleCallback,
    onHighlightColorChange: HighlightColorChangeCallback,
    onHighlightColorReset: HighlightColorResetCallback,
    onHighlightOpacityChange: HighlightOpacityChangeCallback,
    onHighlightOpacityReset: HighlightOpacityResetCallback
  ) {
    this.storage = storage;
    this.onToggle = onToggle;
    this.onScrollGuardToggle = onScrollGuardToggle;
    this.onDetectionModeChange = onDetectionModeChange;
    this.onReloadNavigationToggle = onReloadNavigationToggle;
    this.onHighlightColorChange = onHighlightColorChange;
    this.onHighlightColorReset = onHighlightColorReset;
    this.onHighlightOpacityChange = onHighlightOpacityChange;
    this.onHighlightOpacityReset = onHighlightOpacityReset;
  }

  /** Create or reattach the badge, returns the root element */
  ensure(
    isEnabled: boolean,
    scrollGuardEnabled: boolean,
    detectionMode: TDetectionMode,
    reloadOnNavigationEnabled: boolean,
    highlightSettings: IHighlightSettings
  ): HTMLDivElement {
    if (this.state.root && document.body.contains(this.state.root)) {
      return this.state.root;
    }

    let root = document.getElementById(DOM_IDS.UI_ID) as HTMLDivElement | null;
    if (root) {
      this.cacheElements(root);
      return root;
    }

    root = this.buildDom(
      isEnabled,
      scrollGuardEnabled,
      detectionMode,
      reloadOnNavigationEnabled,
      highlightSettings
    );
    document.body.appendChild(root);

    const saved = this.storage.getSavedPosition();
    if (saved) {
      this.applyPosition(root, saved.left, saved.top, false);
    }

    this.cacheElements(root);
    return root;
  }

  /** Update displayed count and state label */
  updateCount(
    count: number,
    isEnabled: boolean,
    scrollGuardEnabled: boolean,
    detectionMode: TDetectionMode,
    reloadOnNavigationEnabled: boolean,
    highlightSettings: IHighlightSettings,
    cooldownSecondsLeft = 0
  ): void {
    const root = this.state.root;
    if (
      !root ||
      !this.state.countNum ||
      !this.state.countUnit ||
      !this.state.stateEl ||
      !this.state.guardBtn ||
      !this.state.cooldownEl ||
      !this.state.settingsBtn ||
      !this.state.modeHideBtn ||
      !this.state.modeHighlightBtn ||
      !this.state.reloadNavBtn ||
      !this.state.viewedColorInput ||
      !this.state.appliedColorInput ||
      !this.state.activeColorInput ||
      !this.state.opacityInput ||
      !this.state.opacityValue
    ) {
      return;
    }

    root.setAttribute('data-enabled', isEnabled ? '1' : '0');
    root.setAttribute('data-scroll-guard', scrollGuardEnabled ? '1' : '0');
    root.setAttribute('data-cooldown', cooldownSecondsLeft > 0 ? '1' : '0');
    root.setAttribute('data-detection-mode', detectionMode);
    root.setAttribute('data-reload-on-navigation', reloadOnNavigationEnabled ? '1' : '0');

    if (!isEnabled && root.getAttribute('data-settings-open') === '1') {
      root.setAttribute('data-settings-open', '0');
      this.state.settingsBtn.textContent = 'Open settings';
    }

    this.state.countNum.textContent = String(count);
    this.state.countUnit.textContent = !isEnabled
      ? 'off'
      : detectionMode === 'hide'
        ? 'hidden'
        : 'marked';
    this.state.stateEl.textContent = isEnabled ? 'ON' : 'OFF';
    this.state.guardBtn.textContent = scrollGuardEnabled ? 'GUARD ON' : 'GUARD OFF';
    this.state.cooldownEl.textContent = cooldownSecondsLeft > 0 ? `CD ${cooldownSecondsLeft}s` : '';
    this.state.modeHideBtn.setAttribute('data-active', detectionMode === 'hide' ? '1' : '0');
    this.state.modeHighlightBtn.setAttribute(
      'data-active',
      detectionMode === 'highlight' ? '1' : '0'
    );
    this.state.viewedColorInput.value = highlightSettings.colors.viewed;
    this.state.appliedColorInput.value = highlightSettings.colors.applied;
    this.state.activeColorInput.value = highlightSettings.colors.active;
    this.state.opacityInput.value = String(highlightSettings.opacity);
    this.state.opacityValue.textContent = `${Math.round(highlightSettings.opacity * 100)}%`;
    this.state.reloadNavBtn.textContent = reloadOnNavigationEnabled ? 'Reload ON' : 'Reload OFF';
    this.state.reloadNavBtn.setAttribute('data-active', reloadOnNavigationEnabled ? '1' : '0');
    this.state.settingsBtn.textContent =
      root.getAttribute('data-settings-open') === '1' ? 'Close settings' : 'Open settings';
  }

  /** Remove the badge from the DOM */
  remove(): void {
    const root = document.getElementById(DOM_IDS.UI_ID);
    if (root) root.remove();
    this.state.root = null;
    this.state.countNum = null;
    this.state.countUnit = null;
    this.state.stateEl = null;
    this.state.guardBtn = null;
    this.state.cooldownEl = null;
    this.state.settingsBtn = null;
    this.state.settingsPanel = null;
    this.state.modeHideBtn = null;
    this.state.modeHighlightBtn = null;
    this.state.reloadNavBtn = null;
    this.state.viewedColorInput = null;
    this.state.appliedColorInput = null;
    this.state.activeColorInput = null;
    this.state.viewedColorResetBtn = null;
    this.state.appliedColorResetBtn = null;
    this.state.activeColorResetBtn = null;
    this.state.opacityInput = null;
    this.state.opacityValue = null;
    this.state.opacityResetBtn = null;
  }

  /** Clamp badge position within the viewport */
  syncPositionWithinViewport(): void {
    const root = document.getElementById(DOM_IDS.UI_ID) as HTMLDivElement | null;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    this.applyPosition(root, rect.left, rect.top, true);
  }

  // ── Private ──────────────────────────────────────────────────────────

  private buildDom(
    isEnabled: boolean,
    scrollGuardEnabled: boolean,
    detectionMode: TDetectionMode,
    reloadOnNavigationEnabled: boolean,
    highlightSettings: IHighlightSettings
  ): HTMLDivElement {
    const root = document.createElement('div');
    root.id = DOM_IDS.UI_ID;
    root.setAttribute('data-settings-open', '0');
    root.setAttribute('data-enabled', isEnabled ? '1' : '0');
    root.setAttribute('data-scroll-guard', scrollGuardEnabled ? '1' : '0');
    root.setAttribute('data-detection-mode', detectionMode);
    root.setAttribute('data-reload-on-navigation', reloadOnNavigationEnabled ? '1' : '0');

    const dragHandle = document.createElement('span');
    dragHandle.className = 'lhvj-drag-handle';
    dragHandle.title = 'Drag to reposition';
    dragHandle.setAttribute('aria-label', 'Drag badge');

    const header = document.createElement('div');
    header.className = 'lhvj-header';

    const content = document.createElement('div');
    content.className = 'lhvj-content';

    const main = document.createElement('div');
    main.className = 'lhvj-main';

    const countEl = document.createElement('span');
    countEl.className = 'lhvj-count';

    const countNum = document.createElement('span');
    countNum.className = 'lhvj-count-num';
    countNum.textContent = '0';

    const countUnit = document.createElement('span');
    countUnit.className = 'lhvj-count-unit';
    countUnit.textContent = !isEnabled ? 'off' : detectionMode === 'hide' ? 'hidden' : 'marked';

    countEl.appendChild(countNum);
    countEl.appendChild(countUnit);

    const stateEl = document.createElement('span');
    stateEl.className = 'lhvj-state';
    stateEl.textContent = isEnabled ? 'ON' : 'OFF';
    stateEl.setAttribute('role', 'button');
    stateEl.setAttribute('tabindex', '0');
    stateEl.setAttribute('aria-label', 'Enable or disable script logic');
    stateEl.addEventListener('click', (e) => {
      e.preventDefault();
      this.onToggle(root.getAttribute('data-enabled') !== '1');
    });
    stateEl.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      this.onToggle(root.getAttribute('data-enabled') !== '1');
    });

    const guardBtn = document.createElement('button');
    guardBtn.type = 'button';
    guardBtn.className = 'lhvj-guard-btn';
    guardBtn.textContent = scrollGuardEnabled ? 'GUARD ON' : 'GUARD OFF';
    guardBtn.setAttribute('aria-label', 'Toggle scroll cooldown guard');
    guardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const enabled = root.getAttribute('data-scroll-guard') !== '1';
      this.onScrollGuardToggle(enabled);
    });

    const cooldownEl = document.createElement('span');
    cooldownEl.className = 'lhvj-cooldown';

    const settingsBtn = document.createElement('button');
    settingsBtn.type = 'button';
    settingsBtn.className = 'lhvj-settings-btn';
    settingsBtn.textContent = 'Open settings';
    settingsBtn.setAttribute('aria-label', 'Toggle settings');
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const open = root.getAttribute('data-settings-open') === '1';
      const nextOpen = !open;
      root.setAttribute('data-settings-open', nextOpen ? '1' : '0');
      settingsBtn.textContent = nextOpen ? 'Close settings' : 'Open settings';
    });

    const footer = document.createElement('div');
    footer.className = 'lhvj-footer';

    const settingsPanel = document.createElement('div');
    settingsPanel.className = 'lhvj-settings-panel';

    const modeLabel = document.createElement('span');
    modeLabel.className = 'lhvj-settings-label';
    modeLabel.textContent = 'Detected jobs:';

    const modeGroup = document.createElement('div');
    modeGroup.className = 'lhvj-mode-group';

    const modeHideBtn = document.createElement('button');
    modeHideBtn.type = 'button';
    modeHideBtn.className = 'lhvj-mode-btn';
    modeHideBtn.textContent = 'Hide';
    modeHideBtn.setAttribute('data-active', detectionMode === 'hide' ? '1' : '0');
    modeHideBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.onDetectionModeChange('hide');
    });

    const modeHighlightBtn = document.createElement('button');
    modeHighlightBtn.type = 'button';
    modeHighlightBtn.className = 'lhvj-mode-btn';
    modeHighlightBtn.textContent = 'Highlight';
    modeHighlightBtn.setAttribute('data-active', detectionMode === 'highlight' ? '1' : '0');
    modeHighlightBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.onDetectionModeChange('highlight');
    });

    modeGroup.appendChild(modeHideBtn);
    modeGroup.appendChild(modeHighlightBtn);

    const reloadLabel = document.createElement('span');
    reloadLabel.className = 'lhvj-settings-label';
    reloadLabel.textContent = 'Navigation:';

    const reloadNavBtn = document.createElement('button');
    reloadNavBtn.type = 'button';
    reloadNavBtn.className = 'lhvj-mode-btn lhvj-reload-nav-btn';
    reloadNavBtn.textContent = reloadOnNavigationEnabled ? 'Reload ON' : 'Reload OFF';
    reloadNavBtn.setAttribute('data-active', reloadOnNavigationEnabled ? '1' : '0');
    reloadNavBtn.setAttribute('aria-label', 'Toggle full page reload on navigation');
    reloadNavBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const enabled = root.getAttribute('data-reload-on-navigation') !== '1';
      this.onReloadNavigationToggle(enabled);
    });

    settingsPanel.appendChild(modeLabel);
    settingsPanel.appendChild(modeGroup);
    settingsPanel.appendChild(reloadLabel);
    settingsPanel.appendChild(reloadNavBtn);

    const colorLabel = document.createElement('span');
    colorLabel.className = 'lhvj-settings-label';
    colorLabel.textContent = 'Card colors:';

    const colorGrid = document.createElement('div');
    colorGrid.className = 'lhvj-color-grid';

    const viewedColorControl = this.buildColorControl(
      'Viewed',
      highlightSettings.colors.viewed,
      'viewed'
    );
    const appliedColorControl = this.buildColorControl(
      'Applied',
      highlightSettings.colors.applied,
      'applied'
    );
    const activeColorControl = this.buildColorControl(
      'Active',
      highlightSettings.colors.active,
      'active'
    );

    colorGrid.appendChild(viewedColorControl);
    colorGrid.appendChild(appliedColorControl);
    colorGrid.appendChild(activeColorControl);

    settingsPanel.appendChild(colorLabel);
    settingsPanel.appendChild(colorGrid);

    const opacityLabel = document.createElement('span');
    opacityLabel.className = 'lhvj-settings-label';
    opacityLabel.textContent = 'Filter opacity:';

    const opacityRow = document.createElement('div');
    opacityRow.className = 'lhvj-slider-row';

    const opacityInput = document.createElement('input');
    opacityInput.type = 'range';
    opacityInput.className = 'lhvj-opacity-input';
    opacityInput.min = String(CONFIG.HIGHLIGHT_OPACITY_MIN);
    opacityInput.max = String(CONFIG.HIGHLIGHT_OPACITY_MAX);
    opacityInput.step = String(CONFIG.HIGHLIGHT_OPACITY_STEP);
    opacityInput.value = String(highlightSettings.opacity);
    opacityInput.setAttribute('aria-label', 'Highlight filter opacity');
    opacityInput.addEventListener('input', () => {
      this.onHighlightOpacityChange(Number(opacityInput.value));
    });

    const opacityValue = document.createElement('span');
    opacityValue.className = 'lhvj-opacity-value';
    opacityValue.textContent = `${Math.round(highlightSettings.opacity * 100)}%`;

    const opacityResetBtn = document.createElement('button');
    opacityResetBtn.type = 'button';
    opacityResetBtn.className = 'lhvj-reset-btn lhvj-opacity-reset';
    opacityResetBtn.textContent = 'Reset';
    opacityResetBtn.setAttribute('aria-label', 'Reset highlight opacity');
    opacityResetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.onHighlightOpacityReset();
    });

    opacityRow.appendChild(opacityInput);
    opacityRow.appendChild(opacityValue);
    opacityRow.appendChild(opacityResetBtn);

    settingsPanel.appendChild(opacityLabel);
    settingsPanel.appendChild(opacityRow);

    const repoLabel = document.createElement('span');
    repoLabel.className = 'lhvj-settings-label';
    repoLabel.textContent = 'Project:';

    const repoLink = document.createElement('a');
    repoLink.className = 'lhvj-link-btn';
    repoLink.href = Badge.REPOSITORY_URL;
    repoLink.target = '_blank';
    repoLink.rel = 'noopener noreferrer';
    repoLink.textContent = 'GitHub Repo';
    repoLink.setAttribute('aria-label', 'Open the GitHub repository');

    settingsPanel.appendChild(repoLabel);
    settingsPanel.appendChild(repoLink);

    main.appendChild(stateEl);
    main.appendChild(guardBtn);
    main.appendChild(cooldownEl);
    footer.appendChild(settingsBtn);
    footer.appendChild(countEl);

    content.appendChild(main);
    content.appendChild(footer);

    header.appendChild(dragHandle);
    header.appendChild(content);

    root.appendChild(header);
    root.appendChild(settingsPanel);

    this.makeDraggable(root, dragHandle);

    return root;
  }

  private cacheElements(root: HTMLDivElement): void {
    this.state.root = root;
    this.state.countNum = root.querySelector('.lhvj-count-num');
    this.state.countUnit = root.querySelector('.lhvj-count-unit');
    this.state.stateEl = root.querySelector('.lhvj-state');
    this.state.guardBtn = root.querySelector('.lhvj-guard-btn');
    this.state.cooldownEl = root.querySelector('.lhvj-cooldown');
    this.state.settingsBtn = root.querySelector('.lhvj-settings-btn');
    this.state.settingsPanel = root.querySelector('.lhvj-settings-panel');
    const modeButtons = root.querySelectorAll<HTMLButtonElement>('.lhvj-mode-btn');
    this.state.modeHideBtn = modeButtons[0] || null;
    this.state.modeHighlightBtn = modeButtons[1] || null;
    this.state.reloadNavBtn = root.querySelector('.lhvj-reload-nav-btn');
    this.state.viewedColorInput = root.querySelector('.lhvj-viewed-color-input');
    this.state.appliedColorInput = root.querySelector('.lhvj-applied-color-input');
    this.state.activeColorInput = root.querySelector('.lhvj-active-color-input');
    this.state.viewedColorResetBtn = root.querySelector('.lhvj-viewed-color-reset');
    this.state.appliedColorResetBtn = root.querySelector('.lhvj-applied-color-reset');
    this.state.activeColorResetBtn = root.querySelector('.lhvj-active-color-reset');
    this.state.opacityInput = root.querySelector('.lhvj-opacity-input');
    this.state.opacityValue = root.querySelector('.lhvj-opacity-value');
    this.state.opacityResetBtn = root.querySelector('.lhvj-opacity-reset');
  }

  private buildColorControl(
    label: string,
    value: string,
    target: THighlightColorTarget
  ): HTMLDivElement {
    const control = document.createElement('div');
    control.className = 'lhvj-color-control';

    const caption = document.createElement('span');
    caption.className = 'lhvj-color-caption';
    caption.textContent = label;

    const actions = document.createElement('div');
    actions.className = 'lhvj-color-actions';

    const input = document.createElement('input');
    input.type = 'color';
    input.className = `lhvj-color-input lhvj-${target}-color-input`;
    input.value = value;
    input.setAttribute('aria-label', `${label} highlight color`);
    input.addEventListener('input', () => {
      this.onHighlightColorChange(target, input.value);
    });

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = `lhvj-reset-btn lhvj-${target}-color-reset`;
    resetBtn.textContent = 'Reset';
    resetBtn.setAttribute('aria-label', `Reset ${label.toLowerCase()} highlight color`);
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.onHighlightColorReset(target);
    });

    actions.appendChild(input);
    actions.appendChild(resetBtn);
    control.appendChild(caption);
    control.appendChild(actions);

    return control;
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
