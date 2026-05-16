import { App } from './core/App';
import { LocalStorageService } from './storage';

const storage = new LocalStorageService();
const app = new App(storage);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init(), { once: true });
} else {
  app.init();
}
