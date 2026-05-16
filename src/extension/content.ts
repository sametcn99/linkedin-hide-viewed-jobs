import { App } from '../core/App';
import { ChromeStorageService } from '../storage/ChromeStorageService';

const storage = new ChromeStorageService();

storage.ready().then(() => {
  const app = new App(storage, { showBadge: false });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init(), { once: true });
  } else {
    app.init();
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;

    const changedKeys = Object.keys(changes);
    const hasRelevantChange = changedKeys.some(
      (key) => key.startsWith('lhvj-') && changes[key]?.newValue !== changes[key]?.oldValue
    );

    if (!hasRelevantChange) return;

    storage.updateCacheFromChanges(changes);
    app.refreshSettings();
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'get-stats') {
      sendResponse(app.getStats());
    }
    return true;
  });
});
