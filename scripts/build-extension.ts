import { build } from 'vite';
import { resolve } from 'path';
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';

const ROOT = import.meta.dir.replace(/[\\/]scripts$/, '').replace(/\\/g, '/');
const DIST = `${ROOT}/dist/extension`;

async function buildEntry(entry: string, outName: string, format: 'iife' | 'es' = 'iife') {
  const entryPath = resolve(ROOT, entry).replace(/\\/g, '/');
  await build({
    root: ROOT,
    configFile: false,
    plugins: [],
    build: {
      outDir: DIST,
      emptyOutDir: false,
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        ecma: 2020,
        compress: {
          passes: 3,
          drop_console: true,
          pure_funcs: ['console.debug', 'console.info', 'console.log', 'console.warn'],
        },
      },
      lib: {
        entry: entryPath,
        name: 'LHVJ',
        formats: [format === 'iife' ? 'iife' : 'es'],
        fileName: () => `${outName}.js`,
      },
    },
  });
}

function deleteRecursive(path: string) {
  try {
    const { statSync, readdirSync, rmdirSync, unlinkSync } = require('fs');
    const stat = statSync(path);
    if (stat.isDirectory()) {
      for (const file of readdirSync(path)) {
        deleteRecursive(resolve(path, file));
      }
      rmdirSync(path);
    } else {
      unlinkSync(path);
    }
  } catch {}
}

async function main() {
  deleteRecursive(DIST);
  mkdirSync(DIST, { recursive: true });
  mkdirSync(`${DIST}/icons`, { recursive: true });

  console.log('Building content script (IIFE)...');
  await buildEntry('src/extension/content.ts', 'content', 'iife');

  console.log('Building background service worker (IIFE)...');
  await buildEntry('src/extension/background.ts', 'background', 'iife');

  console.log('Building popup (ES module)...');
  await buildEntry('src/popup/popup.ts', 'popup', 'es');

  console.log('Copying extension files...');

  const iconsSrc = `${ROOT}/icons`;
  const iconsDest = `${DIST}/icons`;
  mkdirSync(iconsDest, { recursive: true });

  const iconFiles = [
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon.ico',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'apple-touch-icon.png',
    'site.webmanifest',
  ];

  for (const icon of iconFiles) {
    const srcPath = resolve(iconsSrc, icon);
    const destPath = resolve(iconsDest, icon);
    try {
      cpSync(srcPath, destPath, { force: true });
    } catch {}
  }

  const packageJson = JSON.parse(readFileSync(`${ROOT}/package.json`, 'utf8'));
  const manifestData = JSON.parse(readFileSync(`${ROOT}/extension/manifest.json`, 'utf8'));
  manifestData.version = packageJson.version;
  writeFileSync(`${DIST}/manifest.json`, JSON.stringify(manifestData, null, 2));

  const popupHtmlContent = readFileSync(`${ROOT}/src/popup/popup.html`, 'utf8');
  const updatedPopupHtml = popupHtmlContent.replace(/v\d+\.\d+\.\d+/, `v${packageJson.version}`);
  writeFileSync(`${DIST}/popup.html`, updatedPopupHtml);

  writeFileSync(`${DIST}/popup.css`, readFileSync(`${ROOT}/src/popup/popup.css`, 'utf8'));

  console.log('Extension build complete! Output in dist/extension/');
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
