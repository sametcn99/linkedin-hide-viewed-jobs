import { $ } from './dom';
import { STORAGE_KEYS } from './constants';
import type { PopupElements } from './types';
import { fetchStats } from './stats';
import { loadSettings, saveSetting } from './settings';
import { initKeywords } from './keywords';
import { initImportExport } from './import-export';
import { checkForUpdate } from './update-check';

function initPopup(): void {
  const versionEl = $<HTMLElement>('version-display');
  try {
    const manifest = chrome.runtime.getManifest();
    if (versionEl) versionEl.textContent = `v${manifest.version}`;
  } catch {
    if (versionEl) versionEl.textContent = '';
  }

  const toggleShowHidden = $<HTMLButtonElement>('toggle-show-hidden');
  const toggleScrollGuard = $<HTMLButtonElement>('toggle-scroll-guard');
  const toggleReloadNav = $<HTMLButtonElement>('toggle-reload-navigation');
  const modeHide = $<HTMLInputElement>('mode-hide');
  const modeHighlight = $<HTMLInputElement>('mode-highlight');
  const highlightSettings = $<HTMLElement>('highlight-settings');
  const colorViewed = $<HTMLInputElement>('color-viewed');
  const colorApplied = $<HTMLInputElement>('color-applied');
  const colorActive = $<HTMLInputElement>('color-active');
  const colorKeyword = $<HTMLInputElement>('color-keyword');
  const keywordChipContainer = $<HTMLElement>('keyword-chip-container');
  const keywordChipInput = $<HTMLInputElement>('keyword-chip-input');
  const opacitySlider = $<HTMLInputElement>('opacity-slider');
  const opacityValue = $<HTMLElement>('opacity-value');
  const hiddenCountEl = $<HTMLElement>('hidden-count');
  const notOnJobsPageEl = $<HTMLElement>('not-on-jobs-page');
  const exportBtn = $<HTMLButtonElement>('export-settings-btn');
  const importBtn = $<HTMLButtonElement>('import-settings-btn');
  const importFileInput = $<HTMLInputElement>('import-file-input');
  const ioStatus = $<HTMLElement>('io-status');
  const updateBanner = $<HTMLAnchorElement>('update-banner');
  const updateVersion = $<HTMLElement>('update-version');
  const checkUpdateBtn = $<HTMLButtonElement>('check-update-btn');
  const updateSummary = $<HTMLElement>('update-summary');
  const updateStatus = $<HTMLElement>('update-status');

  if (
    !toggleShowHidden ||
    !toggleScrollGuard ||
    !toggleReloadNav ||
    !modeHide ||
    !modeHighlight ||
    !highlightSettings ||
    !colorViewed ||
    !colorApplied ||
    !colorActive ||
    !colorKeyword ||
    !opacitySlider ||
    !opacityValue ||
    !hiddenCountEl ||
    !notOnJobsPageEl ||
    !keywordChipContainer ||
    !keywordChipInput
  ) {
    return;
  }

  const el: PopupElements = {
    toggleShowHidden,
    toggleScrollGuard,
    toggleReloadNav,
    modeHide,
    modeHighlight,
    highlightSettings,
    colorViewed,
    colorApplied,
    colorActive,
    colorKeyword,
    keywordChipContainer,
    keywordChipInput,
    opacitySlider,
    opacityValue,
    hiddenCountEl,
    notOnJobsPageEl,
    exportBtn,
    importBtn,
    importFileInput,
    ioStatus,
    updateBanner,
    updateVersion,
    checkUpdateBtn,
    updateSummary,
    updateStatus,
  };

  initToggles(el);
  initColors(el);
  initOpacity(el);
  initKeywords(el);
  initImportExport(el);
  initUpdateCheckHandler(el);

  loadSettings(el);
  fetchStats(el.hiddenCountEl, el.notOnJobsPageEl);

  const interval = setInterval(() => {
    fetchStats(el.hiddenCountEl, el.notOnJobsPageEl);
  }, 1000);

  window.addEventListener('unload', () => clearInterval(interval));
}

function initToggles(el: PopupElements): void {
  el.toggleShowHidden.addEventListener('click', () => {
    const current = el.toggleShowHidden.getAttribute('aria-checked') === 'true';
    el.toggleShowHidden.setAttribute('aria-checked', String(!current));
    saveSetting(STORAGE_KEYS.SHOW_HIDDEN, current ? '0' : '1');
  });

  el.toggleScrollGuard.addEventListener('click', () => {
    const current = el.toggleScrollGuard.getAttribute('aria-checked') === 'true';
    el.toggleScrollGuard.setAttribute('aria-checked', String(!current));
    saveSetting(STORAGE_KEYS.SCROLL_GUARD, current ? '0' : '1');
  });

  el.toggleReloadNav.addEventListener('click', () => {
    const current = el.toggleReloadNav.getAttribute('aria-checked') === 'true';
    el.toggleReloadNav.setAttribute('aria-checked', String(!current));
    saveSetting(STORAGE_KEYS.RELOAD_NAVIGATION, current ? '0' : '1');
  });

  el.modeHide.addEventListener('change', () => {
    saveSetting(STORAGE_KEYS.DETECTION_MODE, 'hide');
    el.highlightSettings.hidden = true;
  });

  el.modeHighlight.addEventListener('change', () => {
    saveSetting(STORAGE_KEYS.DETECTION_MODE, 'highlight');
    el.highlightSettings.hidden = false;
  });
}

function initColors(el: PopupElements): void {
  el.colorViewed.addEventListener('input', () => {
    syncColorSwatch(el.colorViewed);
    saveSetting(STORAGE_KEYS.VIEWED_COLOR, el.colorViewed.value);
  });

  el.colorApplied.addEventListener('input', () => {
    syncColorSwatch(el.colorApplied);
    saveSetting(STORAGE_KEYS.APPLIED_COLOR, el.colorApplied.value);
  });

  el.colorActive.addEventListener('input', () => {
    syncColorSwatch(el.colorActive);
    saveSetting(STORAGE_KEYS.ACTIVE_COLOR, el.colorActive.value);
  });

  el.colorKeyword.addEventListener('input', () => {
    syncColorSwatch(el.colorKeyword);
    saveSetting(STORAGE_KEYS.KEYWORD_COLOR, el.colorKeyword.value);
  });
}

function syncColorSwatch(input: HTMLInputElement): void {
  const swatch = input.closest('.color-label')?.querySelector<HTMLElement>('.color-swatch');
  if (swatch) {
    swatch.style.setProperty('--color', input.value);
  }
}

function initOpacity(el: PopupElements): void {
  el.opacitySlider.addEventListener('input', () => {
    const val = parseFloat(el.opacitySlider.value);
    el.opacityValue.textContent = val.toFixed(2);
    saveSetting(STORAGE_KEYS.OPACITY, val.toFixed(2));
  });
}

function initUpdateCheckHandler(el: PopupElements): void {
  let currentVersion = '0.0.0';
  try {
    currentVersion = chrome.runtime.getManifest().version || currentVersion;
  } catch {
    currentVersion = '0.0.0';
  }

  function applyResult(info: {
    latestVersion: string | null;
    hasUpdate: boolean;
    checkedAt: number;
    error: string | null;
  }): void {
    if (el.updateSummary) {
      if (info.error) {
        el.updateSummary.textContent = `Last check failed: ${info.error}`;
      } else if (info.latestVersion) {
        el.updateSummary.textContent = info.hasUpdate
          ? `You are on v${currentVersion}, latest is v${info.latestVersion}`
          : `You are on the latest version (v${currentVersion})`;
      } else {
        el.updateSummary.textContent = 'Check for new releases';
      }
    }

    if (el.updateBanner && el.updateVersion) {
      if (info.hasUpdate && info.latestVersion) {
        el.updateVersion.textContent = `v${info.latestVersion}`;
        el.updateBanner.hidden = false;
      } else {
        el.updateBanner.hidden = true;
      }
    }
  }

  function showStatus(message: string, isError: boolean): void {
    if (!el.updateStatus) return;
    el.updateStatus.textContent = message;
    el.updateStatus.classList.remove('status-success', 'status-error', 'is-visible');
    el.updateStatus.classList.add(isError ? 'status-error' : 'status-success');
    el.updateStatus.classList.add('is-visible');
    setTimeout(() => {
      el.updateStatus?.classList.remove('is-visible');
    }, 3000);
  }

  async function run(force: boolean): Promise<void> {
    if (el.checkUpdateBtn) {
      el.checkUpdateBtn.disabled = true;
      el.checkUpdateBtn.classList.add('is-loading');
    }
    try {
      const info = await checkForUpdate(currentVersion, { force });
      applyResult(info);
      if (force) {
        if (info.error) {
          showStatus(`Check failed: ${info.error}`, true);
        } else if (info.hasUpdate) {
          showStatus(`Update available: v${info.latestVersion}`, false);
        } else {
          showStatus('You are on the latest version', false);
        }
      }
    } finally {
      if (el.checkUpdateBtn) {
        el.checkUpdateBtn.disabled = false;
        el.checkUpdateBtn.classList.remove('is-loading');
      }
    }
  }

  if (el.checkUpdateBtn) {
    el.checkUpdateBtn.addEventListener('click', () => {
      void run(true);
    });
  }

  void run(false);
}

document.addEventListener('DOMContentLoaded', () => initPopup());
