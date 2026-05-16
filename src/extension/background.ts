chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'get-settings') {
    chrome.storage.local.get(null, (result) => {
      const settings: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(result)) {
        if (key.startsWith('lhvj-')) {
          settings[key] = value;
        }
      }
      sendResponse(settings);
    });
    return true;
  }
});
