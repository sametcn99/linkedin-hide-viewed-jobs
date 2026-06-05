import { DOM_IDS } from '../constants';

const STORAGE_KEYS = {
  SHOW_HIDDEN: DOM_IDS.STORAGE_KEY,
  SCROLL_GUARD: DOM_IDS.SCROLL_GUARD_STORAGE_KEY,
  DETECTION_MODE: DOM_IDS.DETECTION_MODE_STORAGE_KEY,
  RELOAD_NAVIGATION: DOM_IDS.RELOAD_ON_NAVIGATION_STORAGE_KEY,
  VIEWED_COLOR: DOM_IDS.VIEWED_HIGHLIGHT_COLOR_STORAGE_KEY,
  APPLIED_COLOR: DOM_IDS.APPLIED_HIGHLIGHT_COLOR_STORAGE_KEY,
  ACTIVE_COLOR: DOM_IDS.ACTIVE_HIGHLIGHT_COLOR_STORAGE_KEY,
  OPACITY: DOM_IDS.HIGHLIGHT_OPACITY_STORAGE_KEY,
} as const;

interface StatsResponse {
  hiddenCount: number;
  isJobsPage: boolean;
  cooldownSecondsLeft: number;
}

function $<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

async function fetchStats(hiddenCountEl: HTMLElement, notOnJobsPageEl: HTMLElement): Promise<void> {
  const cooldownRow = $<HTMLElement>('cooldown-row');
  const cooldownValue = $<HTMLElement>('cooldown-value');

  try {
    const tabs = await chrome.tabs.query({ url: 'https://www.linkedin.com/jobs/*' });
    const tab = tabs.find((t) => t.id !== undefined);
    if (!tab?.id) {
      hiddenCountEl.textContent = '-';
      notOnJobsPageEl.style.display = 'block';
      if (cooldownRow) cooldownRow.style.display = 'none';
      return;
    }

    const response = (await chrome.tabs.sendMessage(tab.id, {
      type: 'get-stats',
    })) as StatsResponse;

    if (response?.isJobsPage) {
      hiddenCountEl.textContent = String(response.hiddenCount);
      notOnJobsPageEl.style.display = 'none';

      if (cooldownRow && cooldownValue) {
        if (response.cooldownSecondsLeft > 0) {
          cooldownRow.style.display = 'flex';
          cooldownValue.textContent = `${response.cooldownSecondsLeft}s`;
        } else {
          cooldownRow.style.display = 'none';
        }
      }
    } else {
      hiddenCountEl.textContent = '-';
      notOnJobsPageEl.style.display = 'block';
      if (cooldownRow) cooldownRow.style.display = 'none';
    }
  } catch {
    hiddenCountEl.textContent = '-';
    notOnJobsPageEl.style.display = 'block';
    if (cooldownRow) cooldownRow.style.display = 'none';
  }
}

function initPopup(): void {
  const toggleShowHidden = $<HTMLButtonElement>('toggle-show-hidden');
  const toggleScrollGuard = $<HTMLButtonElement>('toggle-scroll-guard');
  const toggleReloadNav = $<HTMLButtonElement>('toggle-reload-navigation');
  const modeHide = $<HTMLInputElement>('mode-hide');
  const modeHighlight = $<HTMLInputElement>('mode-highlight');
  const highlightSettings = $<HTMLElement>('highlight-settings');
  const colorViewed = $<HTMLInputElement>('color-viewed');
  const colorApplied = $<HTMLInputElement>('color-applied');
  const colorActive = $<HTMLInputElement>('color-active');
  const opacitySlider = $<HTMLInputElement>('opacity-slider');
  const opacityValue = $<HTMLElement>('opacity-value');
  const resetBtns = document.querySelectorAll<HTMLButtonElement>('.reset-btn');
  const hiddenCountEl = $<HTMLElement>('hidden-count');
  const notOnJobsPageEl = $<HTMLElement>('not-on-jobs-page');
  const openAsWindowBtn = $<HTMLButtonElement>('open-as-window-btn');

  const isWindowMode = window.location.href.includes('_popup=true');

  if (isWindowMode) {
    document.documentElement.classList.add('window-mode');
    document.body.classList.add('window-mode');
  }

  if (openAsWindowBtn) {
    if (isWindowMode) {
      openAsWindowBtn.classList.add('hidden');
    } else {
      openAsWindowBtn.addEventListener('click', async () => {
        const currentUrl = chrome.runtime.getURL('popup.html');
        const windowUrl = currentUrl + '?_popup=true';
        try {
          await chrome.windows.create({
            url: windowUrl,
            type: 'popup',
            width: 320,
            height: Math.min(screen.height - 100, 600),
            top: 100,
            left: screen.width - 340,
          });
          window.close();
        } catch {
          await chrome.windows.create({
            url: windowUrl,
            type: 'popup',
            width: 320,
            height: Math.min(screen.height - 100, 600),
            top: 100,
            left: screen.width - 340,
          });
        }
      });
    }
  }

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
    !opacitySlider ||
    !opacityValue ||
    !hiddenCountEl ||
    !notOnJobsPageEl
  ) {
    return;
  }

  function loadSettings(): void {
    const keys = Object.values(STORAGE_KEYS);
    chrome.storage.local.get(keys, (result: Record<string, unknown>) => {
      const showHidden = result[STORAGE_KEYS.SHOW_HIDDEN];
      toggleShowHidden.setAttribute('aria-checked', showHidden === '1' ? 'true' : 'false');

      const scrollGuard = result[STORAGE_KEYS.SCROLL_GUARD];
      toggleScrollGuard.setAttribute(
        'aria-checked',
        scrollGuard === '1' ? 'true' : scrollGuard === '0' ? 'false' : 'true'
      );

      const reloadNav = result[STORAGE_KEYS.RELOAD_NAVIGATION];
      toggleReloadNav.setAttribute('aria-checked', reloadNav === '1' ? 'true' : 'false');

      const mode = result[STORAGE_KEYS.DETECTION_MODE];
      modeHide.checked = mode !== 'highlight';
      modeHighlight.checked = mode === 'highlight';
      highlightSettings.style.display = mode === 'highlight' ? 'flex' : 'none';

      const viewedColor = (result[STORAGE_KEYS.VIEWED_COLOR] as string) || '#2ecc71';
      colorViewed.value = viewedColor;

      const appliedColor = (result[STORAGE_KEYS.APPLIED_COLOR] as string) || '#f59e0b';
      colorApplied.value = appliedColor;

      const activeColor = (result[STORAGE_KEYS.ACTIVE_COLOR] as string) || '#0a66c2';
      colorActive.value = activeColor;

      const opacity = Number(result[STORAGE_KEYS.OPACITY]) || 0.1;
      opacitySlider.value = String(opacity);
      opacityValue.textContent = opacity.toFixed(2);
    });
  }

  function saveSetting(key: string, value: string): void {
    chrome.storage.local.set({ [key]: value });
  }

  toggleShowHidden.addEventListener('click', () => {
    const current = toggleShowHidden.getAttribute('aria-checked') === 'true';
    toggleShowHidden.setAttribute('aria-checked', String(!current));
    saveSetting(STORAGE_KEYS.SHOW_HIDDEN, current ? '0' : '1');
  });

  toggleScrollGuard.addEventListener('click', () => {
    const current = toggleScrollGuard.getAttribute('aria-checked') === 'true';
    toggleScrollGuard.setAttribute('aria-checked', String(!current));
    saveSetting(STORAGE_KEYS.SCROLL_GUARD, current ? '0' : '1');
  });

  toggleReloadNav.addEventListener('click', () => {
    const current = toggleReloadNav.getAttribute('aria-checked') === 'true';
    toggleReloadNav.setAttribute('aria-checked', String(!current));
    saveSetting(STORAGE_KEYS.RELOAD_NAVIGATION, current ? '0' : '1');
  });

  modeHide.addEventListener('change', () => {
    saveSetting(STORAGE_KEYS.DETECTION_MODE, 'hide');
    highlightSettings.style.display = 'none';
  });

  modeHighlight.addEventListener('change', () => {
    saveSetting(STORAGE_KEYS.DETECTION_MODE, 'highlight');
    highlightSettings.style.display = 'flex';
  });

  colorViewed.addEventListener('input', () => {
    saveSetting(STORAGE_KEYS.VIEWED_COLOR, colorViewed.value);
  });

  colorApplied.addEventListener('input', () => {
    saveSetting(STORAGE_KEYS.APPLIED_COLOR, colorApplied.value);
  });

  colorActive.addEventListener('input', () => {
    saveSetting(STORAGE_KEYS.ACTIVE_COLOR, colorActive.value);
  });

  opacitySlider.addEventListener('input', () => {
    const val = parseFloat(opacitySlider.value);
    opacityValue.textContent = val.toFixed(2);
    saveSetting(STORAGE_KEYS.OPACITY, val.toFixed(2));
  });

  resetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      switch (target) {
        case 'viewed':
          colorViewed.value = '#2ecc71';
          saveSetting(STORAGE_KEYS.VIEWED_COLOR, '#2ecc71');
          break;
        case 'applied':
          colorApplied.value = '#f59e0b';
          saveSetting(STORAGE_KEYS.APPLIED_COLOR, '#f59e0b');
          break;
        case 'active':
          colorActive.value = '#0a66c2';
          saveSetting(STORAGE_KEYS.ACTIVE_COLOR, '#0a66c2');
          break;
        case 'opacity':
          opacitySlider.value = '0.1';
          opacityValue.textContent = '0.10';
          saveSetting(STORAGE_KEYS.OPACITY, '0.10');
          break;
      }
    });
  });

  loadSettings();
  fetchStats(hiddenCountEl, notOnJobsPageEl);

  const interval = setInterval(() => {
    fetchStats(hiddenCountEl, notOnJobsPageEl);
  }, 1000);

  window.addEventListener('unload', () => clearInterval(interval));
}

document.addEventListener('DOMContentLoaded', () => initPopup());
