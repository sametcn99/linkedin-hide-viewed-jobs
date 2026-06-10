import { CONFIG, DOM_IDS } from '../../core/constants';
import { IHighlightSettings } from '../../core/interfaces/IHighlightSettings';
import { IUIState } from '../../core/interfaces/IUIState';
import type { TDetectionMode } from '../../core/types';
import type {
  DetectionModeChangeCallback,
  HighlightColorChangeCallback,
  HighlightColorResetCallback,
  HighlightOpacityChangeCallback,
  HighlightOpacityResetCallback,
  ReloadNavigationToggleCallback,
  ScrollGuardToggleCallback,
  ToggleCallback,
} from './types';

export const REPOSITORY_URL = 'https://github.com/sametcn99/linkedin-hide-viewed-jobs';

export interface HeaderElements {
  root: HTMLDivElement;
  dragHandle: HTMLElement;
  countNum: HTMLSpanElement;
  countUnit: HTMLSpanElement;
  stateEl: HTMLSpanElement;
  guardBtn: HTMLButtonElement;
  cooldownEl: HTMLSpanElement;
  settingsBtn: HTMLButtonElement;
  keywordCountDisplay: HTMLSpanElement;
}

export interface SettingsElements {
  panel: HTMLDivElement;
  modeHideBtn: HTMLButtonElement;
  modeHighlightBtn: HTMLButtonElement;
  reloadNavBtn: HTMLButtonElement;
  viewedColorInput: HTMLInputElement;
  appliedColorInput: HTMLInputElement;
  activeColorInput: HTMLInputElement;
  keywordColorInput: HTMLInputElement;
  viewedColorResetBtn: HTMLButtonElement;
  appliedColorResetBtn: HTMLButtonElement;
  activeColorResetBtn: HTMLButtonElement;
  keywordColorResetBtn: HTMLButtonElement;
  opacityInput: HTMLInputElement;
  opacityValue: HTMLSpanElement;
  opacityResetBtn: HTMLButtonElement;
  chipContainer: HTMLDivElement;
  chipInputRow: HTMLDivElement;
}

export interface HeaderBuildOptions {
  isEnabled: boolean;
  scrollGuardEnabled: boolean;
  onToggle: ToggleCallback;
  onScrollGuardToggle: ScrollGuardToggleCallback;
}

export interface SettingsBuildOptions {
  detectionMode: TDetectionMode;
  reloadOnNavigationEnabled: boolean;
  highlightSettings: IHighlightSettings;
  onDetectionModeChange: DetectionModeChangeCallback;
  onReloadNavigationToggle: ReloadNavigationToggleCallback;
  onHighlightColorChange: HighlightColorChangeCallback;
  onHighlightColorReset: HighlightColorResetCallback;
  onHighlightOpacityChange: HighlightOpacityChangeCallback;
  onHighlightOpacityReset: HighlightOpacityResetCallback;
}

export function createBadgeRoot(): HTMLDivElement {
  const root = document.createElement('div');
  root.id = DOM_IDS.UI_ID;
  root.setAttribute('data-settings-open', '0');
  return root;
}

export function buildHeader(options: HeaderBuildOptions, initialCountUnit: string): HeaderElements {
  const { isEnabled, scrollGuardEnabled } = options;
  const root = document.createElement('div');
  root.className = 'lhvj-header';

  const dragHandle = document.createElement('span');
  dragHandle.className = 'lhvj-drag-handle';
  dragHandle.title = 'Drag to reposition';
  dragHandle.setAttribute('aria-label', 'Drag badge');

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
  countUnit.textContent = initialCountUnit;

  countEl.appendChild(countNum);
  countEl.appendChild(countUnit);

  const stateEl = document.createElement('span');
  stateEl.className = 'lhvj-state';
  stateEl.textContent = isEnabled ? 'ON' : 'OFF';
  stateEl.setAttribute('role', 'button');
  stateEl.setAttribute('tabindex', '0');
  stateEl.setAttribute('aria-label', 'Enable or disable script logic');

  const guardBtn = document.createElement('button');
  guardBtn.type = 'button';
  guardBtn.className = 'lhvj-guard-btn';
  guardBtn.textContent = scrollGuardEnabled ? 'GUARD ON' : 'GUARD OFF';
  guardBtn.setAttribute('aria-label', 'Toggle scroll cooldown guard');

  const cooldownEl = document.createElement('span');
  cooldownEl.className = 'lhvj-cooldown';

  const footer = document.createElement('div');
  footer.className = 'lhvj-footer';

  const settingsBtn = document.createElement('button');
  settingsBtn.type = 'button';
  settingsBtn.className = 'lhvj-settings-btn';
  settingsBtn.textContent = 'Open settings';
  settingsBtn.setAttribute('aria-label', 'Toggle settings');

  const keywordCountDisplay = document.createElement('span');
  keywordCountDisplay.className = 'lhvj-keyword-count-display';
  keywordCountDisplay.textContent = '';

  main.appendChild(stateEl);
  main.appendChild(guardBtn);
  main.appendChild(cooldownEl);
  footer.appendChild(settingsBtn);
  footer.appendChild(countEl);
  footer.appendChild(keywordCountDisplay);

  content.appendChild(main);
  content.appendChild(footer);

  root.appendChild(dragHandle);
  root.appendChild(content);

  return {
    root,
    dragHandle,
    countNum,
    countUnit,
    stateEl,
    guardBtn,
    cooldownEl,
    settingsBtn,
    keywordCountDisplay,
  };
}

export function buildColorControl(
  label: string,
  value: string,
  target: 'viewed' | 'applied' | 'active' | 'keyword',
  onChange: HighlightColorChangeCallback,
  onReset: HighlightColorResetCallback
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
    onChange(target, input.value);
  });

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = `lhvj-reset-btn lhvj-${target}-color-reset`;
  resetBtn.textContent = 'Reset';
  resetBtn.setAttribute('aria-label', `Reset ${label.toLowerCase()} highlight color`);
  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    onReset(target);
  });

  actions.appendChild(input);
  actions.appendChild(resetBtn);
  control.appendChild(caption);
  control.appendChild(actions);

  return control;
}

export function buildOpacityRow(
  highlightSettings: IHighlightSettings,
  onChange: HighlightOpacityChangeCallback,
  onReset: HighlightOpacityResetCallback
): {
  row: HTMLDivElement;
  input: HTMLInputElement;
  value: HTMLSpanElement;
  resetBtn: HTMLButtonElement;
} {
  const row = document.createElement('div');
  row.className = 'lhvj-slider-row';

  const input = document.createElement('input');
  input.type = 'range';
  input.className = 'lhvj-opacity-input';
  input.min = String(CONFIG.HIGHLIGHT_OPACITY_MIN);
  input.max = String(CONFIG.HIGHLIGHT_OPACITY_MAX);
  input.step = String(CONFIG.HIGHLIGHT_OPACITY_STEP);
  input.value = String(highlightSettings.opacity);
  input.setAttribute('aria-label', 'Highlight filter opacity');
  input.addEventListener('input', () => {
    onChange(Number(input.value));
  });

  const value = document.createElement('span');
  value.className = 'lhvj-opacity-value';
  value.textContent = `${Math.round(highlightSettings.opacity * 100)}%`;

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'lhvj-reset-btn lhvj-opacity-reset';
  resetBtn.textContent = 'Reset';
  resetBtn.setAttribute('aria-label', 'Reset highlight opacity');
  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    onReset();
  });

  row.appendChild(input);
  row.appendChild(value);
  row.appendChild(resetBtn);

  return { row, input, value, resetBtn };
}

export function buildSettingsPanel(options: SettingsBuildOptions): SettingsElements {
  const { detectionMode, reloadOnNavigationEnabled, highlightSettings } = options;

  const panel = document.createElement('div');
  panel.className = 'lhvj-settings-panel';

  const keywordLabel = document.createElement('span');
  keywordLabel.className = 'lhvj-settings-label';
  keywordLabel.textContent = 'Custom keywords:';

  const keywordRow = document.createElement('div');
  keywordRow.className = 'lhvj-keyword-row';

  const chipContainer = document.createElement('div');
  chipContainer.className = 'lhvj-keyword-chips';

  const chipInputRow = document.createElement('div');
  chipInputRow.className = 'lhvj-chip-input-row';

  keywordRow.appendChild(chipContainer);
  keywordRow.appendChild(chipInputRow);

  panel.appendChild(keywordLabel);
  panel.appendChild(keywordRow);

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
    options.onDetectionModeChange('hide');
  });

  const modeHighlightBtn = document.createElement('button');
  modeHighlightBtn.type = 'button';
  modeHighlightBtn.className = 'lhvj-mode-btn';
  modeHighlightBtn.textContent = 'Highlight';
  modeHighlightBtn.setAttribute('data-active', detectionMode === 'highlight' ? '1' : '0');
  modeHighlightBtn.addEventListener('click', (e) => {
    e.preventDefault();
    options.onDetectionModeChange('highlight');
  });

  modeGroup.appendChild(modeHideBtn);
  modeGroup.appendChild(modeHighlightBtn);

  panel.appendChild(modeLabel);
  panel.appendChild(modeGroup);

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
    const enabled = reloadNavBtn.getAttribute('data-active') !== '1';
    options.onReloadNavigationToggle(enabled);
  });

  panel.appendChild(reloadLabel);
  panel.appendChild(reloadNavBtn);

  const colorLabel = document.createElement('span');
  colorLabel.className = 'lhvj-settings-label';
  colorLabel.textContent = 'Card colors:';

  const colorGrid = document.createElement('div');
  colorGrid.className = 'lhvj-color-grid';

  const viewed = buildColorControl(
    'Viewed',
    highlightSettings.colors.viewed,
    'viewed',
    options.onHighlightColorChange,
    options.onHighlightColorReset
  );
  const applied = buildColorControl(
    'Applied',
    highlightSettings.colors.applied,
    'applied',
    options.onHighlightColorChange,
    options.onHighlightColorReset
  );
  const active = buildColorControl(
    'Active',
    highlightSettings.colors.active,
    'active',
    options.onHighlightColorChange,
    options.onHighlightColorReset
  );
  const keyword = buildColorControl(
    'Keyword',
    highlightSettings.colors.keyword,
    'keyword',
    options.onHighlightColorChange,
    options.onHighlightColorReset
  );

  colorGrid.appendChild(viewed);
  colorGrid.appendChild(applied);
  colorGrid.appendChild(active);
  colorGrid.appendChild(keyword);

  panel.appendChild(colorLabel);
  panel.appendChild(colorGrid);

  const opacityLabel = document.createElement('span');
  opacityLabel.className = 'lhvj-settings-label';
  opacityLabel.textContent = 'Filter opacity:';

  const opacity = buildOpacityRow(
    highlightSettings,
    options.onHighlightOpacityChange,
    options.onHighlightOpacityReset
  );

  panel.appendChild(opacityLabel);
  panel.appendChild(opacity.row);

  const repoLabel = document.createElement('span');
  repoLabel.className = 'lhvj-settings-label';
  repoLabel.textContent = 'Project:';

  const repoLink = document.createElement('a');
  repoLink.className = 'lhvj-link-btn';
  repoLink.href = REPOSITORY_URL;
  repoLink.target = '_blank';
  repoLink.rel = 'noopener noreferrer';
  repoLink.textContent = 'GitHub Repo';
  repoLink.setAttribute('aria-label', 'Open the GitHub repository');

  panel.appendChild(repoLabel);
  panel.appendChild(repoLink);

  return {
    panel,
    modeHideBtn,
    modeHighlightBtn,
    reloadNavBtn,
    viewedColorInput: viewed.querySelector<HTMLInputElement>('.lhvj-viewed-color-input')!,
    appliedColorInput: applied.querySelector<HTMLInputElement>('.lhvj-applied-color-input')!,
    activeColorInput: active.querySelector<HTMLInputElement>('.lhvj-active-color-input')!,
    keywordColorInput: keyword.querySelector<HTMLInputElement>('.lhvj-keyword-color-input')!,
    viewedColorResetBtn: viewed.querySelector<HTMLButtonElement>('.lhvj-viewed-color-reset')!,
    appliedColorResetBtn: applied.querySelector<HTMLButtonElement>('.lhvj-applied-color-reset')!,
    activeColorResetBtn: active.querySelector<HTMLButtonElement>('.lhvj-active-color-reset')!,
    keywordColorResetBtn: keyword.querySelector<HTMLButtonElement>('.lhvj-keyword-color-reset')!,
    opacityInput: opacity.input,
    opacityValue: opacity.value,
    opacityResetBtn: opacity.resetBtn,
    chipContainer,
    chipInputRow,
  };
}

export function cacheElements(root: HTMLDivElement): IUIState {
  const modeButtons = root.querySelectorAll<HTMLButtonElement>('.lhvj-mode-btn');
  return {
    root,
    countNum: root.querySelector('.lhvj-count-num'),
    countUnit: root.querySelector('.lhvj-count-unit'),
    stateEl: root.querySelector('.lhvj-state'),
    guardBtn: root.querySelector('.lhvj-guard-btn'),
    cooldownEl: root.querySelector('.lhvj-cooldown'),
    settingsBtn: root.querySelector('.lhvj-settings-btn'),
    settingsPanel: root.querySelector('.lhvj-settings-panel'),
    modeHideBtn: modeButtons[0] || null,
    modeHighlightBtn: modeButtons[1] || null,
    reloadNavBtn: root.querySelector('.lhvj-reload-nav-btn'),
    viewedColorInput: root.querySelector('.lhvj-viewed-color-input'),
    appliedColorInput: root.querySelector('.lhvj-applied-color-input'),
    activeColorInput: root.querySelector('.lhvj-active-color-input'),
    keywordColorInput: root.querySelector('.lhvj-keyword-color-input'),
    viewedColorResetBtn: root.querySelector('.lhvj-viewed-color-reset'),
    appliedColorResetBtn: root.querySelector('.lhvj-applied-color-reset'),
    activeColorResetBtn: root.querySelector('.lhvj-active-color-reset'),
    keywordColorResetBtn: root.querySelector('.lhvj-keyword-color-reset'),
    opacityInput: root.querySelector('.lhvj-opacity-input'),
    opacityValue: root.querySelector('.lhvj-opacity-value'),
    opacityResetBtn: root.querySelector('.lhvj-opacity-reset'),
    keywordChipContainer: root.querySelector('.lhvj-keyword-chips'),
    keywordChipInput: root.querySelector('.lhvj-keyword-input'),
    keywordCountDisplay: root.querySelector('.lhvj-keyword-count-display'),
  };
}
