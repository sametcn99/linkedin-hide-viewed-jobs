import { App } from '../core'
import { LocalStorageService } from './storage/LocalStorageService'
import { Badge } from './ui/Badge'

const storage = new LocalStorageService()
const app = new App(storage, {
  createBadge: (callbacks) =>
    new Badge({
      storage,
      initialCustomKeywords: storage.getCustomKeywords(),
      ...callbacks
    })
})

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init(), { once: true })
} else {
  app.init()
}
