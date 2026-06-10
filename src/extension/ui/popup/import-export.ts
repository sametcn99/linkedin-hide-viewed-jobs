import type { PopupElements } from './types';
import { loadSettings } from './settings';
import { STORAGE_KEYS } from '../../../core/constants/config';

export function initImportExport(el: PopupElements): void {
  const { exportBtn, importBtn, importFileInput, ioStatus } = el;

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const keys = Object.values(STORAGE_KEYS);
      chrome.storage.local.get(keys, (result: Record<string, unknown>) => {
        const data: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(result)) {
          if (value !== undefined) {
            data[key] = value;
          }
        }
        const manifest = chrome.runtime.getManifest();
        const payload = {
          _meta: {
            name: manifest.name,
            version: manifest.version,
            exportedAt: new Date().toISOString(),
          },
          settings: data,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lhvj-settings-${manifest.version}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showIoStatus(ioStatus, 'Settings exported', false);
      });
    });
  }

  if (importBtn && importFileInput) {
    importBtn.addEventListener('click', () => {
      importFileInput.click();
    });

    importFileInput.addEventListener('change', () => {
      const file = importFileInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string) as {
            settings?: Record<string, unknown>;
          };
          const settings = parsed.settings;
          if (!settings || typeof settings !== 'object') {
            showIoStatus(ioStatus, 'Invalid file format', true);
            return;
          }
          const allowedKeys = new Set(Object.values(STORAGE_KEYS) as string[]);
          const filtered: Record<string, unknown> = {};
          let hasValidKey = false;
          for (const [key, value] of Object.entries(settings)) {
            if (allowedKeys.has(key)) {
              filtered[key] = value;
              hasValidKey = true;
            }
          }
          if (!hasValidKey) {
            showIoStatus(ioStatus, 'No valid settings found', true);
            return;
          }
          showImportConfirm(el, ioStatus, filtered);
        } catch {
          showIoStatus(ioStatus, 'Failed to parse file', true);
        }
      };
      reader.readAsText(file);
      importFileInput.value = '';
    });
  }
}

function showImportConfirm(
  el: PopupElements,
  ioStatus: HTMLElement,
  filtered: Record<string, unknown>
): void {
  ioStatus.innerHTML = '';
  ioStatus.classList.remove('is-visible', 'status-success', 'status-error');
  ioStatus.classList.add('status-confirm');
  ioStatus.style.opacity = '';
  ioStatus.style.textAlign = '';

  const text = document.createElement('span');
  text.className = 'status-confirm-text';
  text.textContent = 'Replace all settings?';

  const actions = document.createElement('div');
  actions.className = 'status-confirm-actions';

  const overwriteBtn = document.createElement('button');
  overwriteBtn.type = 'button';
  overwriteBtn.className = 'btn btn-danger';
  overwriteBtn.textContent = 'Replace';
  overwriteBtn.style.padding = '8px 10px';
  overwriteBtn.style.fontSize = '12px';

  const mergeBtn = document.createElement('button');
  mergeBtn.type = 'button';
  mergeBtn.className = 'btn btn-ghost';
  mergeBtn.style.borderColor = 'rgba(46,204,113,0.3)';
  mergeBtn.style.color = 'var(--brand)';
  mergeBtn.textContent = 'Merge';
  mergeBtn.style.padding = '8px 10px';
  mergeBtn.style.fontSize = '12px';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-ghost';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.padding = '8px 10px';
  cancelBtn.style.fontSize = '12px';

  actions.append(overwriteBtn, mergeBtn, cancelBtn);
  ioStatus.append(text, actions);

  function cleanup() {
    ioStatus.classList.remove('status-confirm');
    ioStatus.innerHTML = '';
  }

  overwriteBtn.addEventListener('click', () => {
    const allKeys = Object.values(STORAGE_KEYS) as string[];
    chrome.storage.local.remove(allKeys, () => {
      chrome.storage.local.set(filtered, () => {
        loadSettings(el);
        cleanup();
        showIoStatus(ioStatus, 'Settings replaced', false);
      });
    });
  });

  mergeBtn.addEventListener('click', () => {
    chrome.storage.local.set(filtered, () => {
      loadSettings(el);
      cleanup();
      showIoStatus(ioStatus, 'Settings merged', false);
    });
  });

  cancelBtn.addEventListener('click', cleanup);
}

function showIoStatus(ioStatus: HTMLElement | null, message: string, isError: boolean): void {
  if (!ioStatus) return;
  ioStatus.textContent = message;
  ioStatus.classList.remove('status-success', 'status-error');
  ioStatus.classList.add(isError ? 'status-error' : 'status-success');
  ioStatus.classList.add('is-visible');
  setTimeout(() => {
    ioStatus.classList.remove('is-visible');
  }, 2500);
}
