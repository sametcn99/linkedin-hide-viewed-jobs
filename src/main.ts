import { App } from './core/App';

const app = new App();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init(), { once: true });
} else {
  app.init();
}
