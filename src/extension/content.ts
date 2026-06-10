import { App } from '../core'
import { ChromeStorageService } from './storage/ChromeStorageService'

const storage = new ChromeStorageService()

storage.ready().then(() => {
  const app = new App(storage, { showBadge: false })

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init(), { once: true })
  } else {
    app.init()
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return

    const lhvjChanges: Record<string, { newValue?: string; oldValue?: string }> = {}
    let hasRelevantChange = false

    for (const [key, change] of Object.entries(changes)) {
      if (!key.startsWith('lhvj-') || typeof change?.newValue === 'undefined') continue
      if (change.newValue !== change.oldValue) hasRelevantChange = true
      if (typeof change.newValue === 'string') {
        lhvjChanges[key] = {
          newValue: change.newValue,
          oldValue: change.oldValue as string | undefined
        }
      } else {
        lhvjChanges[key] = { newValue: undefined, oldValue: change.oldValue as string | undefined }
      }
    }

    if (!hasRelevantChange) return

    storage.updateCacheFromChanges(lhvjChanges)
    app.refreshSettings()
  })

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'get-stats') {
      sendResponse(app.getStats())
      return true
    }
  })
})
