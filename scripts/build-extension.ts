import { build } from 'vite';
import { resolve } from 'path';
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'fs';

const ROOT = import.meta.dir.replace(/[\\/]scripts$/, '').replace(/\\/g, '/');

type BrowserTarget = 'chrome' | 'firefox';

const DIST_ROOT = `${ROOT}/dist/extension`;

const ICON_FILES = [
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon.ico',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  'apple-touch-icon.png',
  'site.webmanifest',
];

function deleteRecursive(path: string) {
  try {
    rmSync(path, { recursive: true, force: true });
  } catch {}
}

async function buildEntry(
  entry: string,
  outName: string,
  outDir: string,
  format: 'iife' | 'es' = 'iife',
) {
  const entryPath = resolve(ROOT, entry).replace(/\\/g, '/');
  await build({
    root: ROOT,
    configFile: false,
    plugins: [],
    build: {
      outDir,
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

function getChromeManifest(version: string) {
  return {
    manifest_version: 3,
    name: 'LinkedIn Hide Viewed Jobs',
    description:
      'Hides viewed job cards on LinkedIn Jobs pages, adds a compact badge, and lets you reveal hidden items anytime.',
    version,
    permissions: ['storage', 'activeTab', 'tabs', 'windows'],
    host_permissions: ['https://www.linkedin.com/*'],
    content_scripts: [
      {
        matches: ['https://www.linkedin.com/*'],
        js: ['content.js'],
        run_at: 'document_idle',
      },
    ],
    action: {
      default_popup: 'popup.html',
      default_icon: {
        '16': 'icons/favicon-16x16.png',
        '32': 'icons/favicon-32x32.png',
      },
    },
    background: {
      service_worker: 'background.js',
    },
    icons: {
      '16': 'icons/favicon-16x16.png',
      '32': 'icons/favicon-32x32.png',
      '192': 'icons/android-chrome-192x192.png',
      '512': 'icons/android-chrome-512x512.png',
    },
  };
}

function getFirefoxManifest(version: string) {
  return {
    manifest_version: 3,
    name: 'LinkedIn Hide Viewed Jobs',
    description:
      'Hides viewed job cards on LinkedIn Jobs pages, adds a compact badge, and lets you reveal hidden items anytime.',
    version,
    permissions: ['storage', 'activeTab', 'tabs', 'windows'],
    host_permissions: ['https://www.linkedin.com/*'],
    content_scripts: [
      {
        matches: ['https://www.linkedin.com/*'],
        js: ['content.js'],
        run_at: 'document_idle',
      },
    ],
    action: {
      default_popup: 'popup.html',
      default_icon: {
        '16': 'icons/favicon-16x16.png',
        '32': 'icons/favicon-32x32.png',
      },
    },
    background: {
      scripts: ['background.js'],
    },
    icons: {
      '16': 'icons/favicon-16x16.png',
      '32': 'icons/favicon-32x32.png',
      '192': 'icons/android-chrome-192x192.png',
      '512': 'icons/android-chrome-512x512.png',
    },
    browser_specific_settings: {
      gecko: {
        id: 'linkedin-hide-viewed-jobs@sametcn99',
        strict_min_version: '109.0',
      },
    },
  };
}

function copyStaticFiles(distDir: string) {
  const iconsSrc = `${ROOT}/icons`;
  const iconsDest = `${distDir}/icons`;
  mkdirSync(iconsDest, { recursive: true });

  for (const icon of ICON_FILES) {
    const srcPath = resolve(iconsSrc, icon);
    const destPath = resolve(iconsDest, icon);
    try {
      cpSync(srcPath, destPath, { force: true });
    } catch {}
  }
}

function copyPopupFiles(distDir: string, version: string) {
  const popupHtmlContent = readFileSync(`${ROOT}/src/popup/popup.html`, 'utf8');
  const updatedPopupHtml = popupHtmlContent.replace(/v\d+\.\d+\.\d+/, `v${version}`);
  writeFileSync(`${distDir}/popup.html`, updatedPopupHtml);
  writeFileSync(`${distDir}/popup.css`, readFileSync(`${ROOT}/src/popup/popup.css`, 'utf8'));
}

async function buildForBrowser(browser: BrowserTarget): Promise<void> {
  const distDir = `${DIST_ROOT}-${browser}`;
  const packageJson = JSON.parse(readFileSync(`${ROOT}/package.json`, 'utf8'));
  const version = packageJson.version as string;

  console.log(`\nBuilding ${browser.toUpperCase()} extension (v${version})...`);

  deleteRecursive(distDir);
  mkdirSync(distDir, { recursive: true });
  mkdirSync(`${distDir}/icons`, { recursive: true });

  console.log(`  Building content script (IIFE)...`);
  await buildEntry('src/extension/content.ts', 'content', distDir, 'iife');

  console.log(`  Building background script (IIFE)...`);
  await buildEntry('src/extension/background.ts', 'background', distDir, 'iife');

  console.log(`  Building popup (ES module)...`);
  await buildEntry('src/popup/popup.ts', 'popup', distDir, 'es');

  console.log(`  Copying static files...`);
  copyStaticFiles(distDir);
  copyPopupFiles(distDir, version);

  const manifest =
    browser === 'chrome' ? getChromeManifest(version) : getFirefoxManifest(version);
  writeFileSync(`${distDir}/manifest.json`, JSON.stringify(manifest, null, 2));

  console.log(`  ${browser.toUpperCase()} extension built → ${distDir}`);
}

async function main() {
  const packageJson = JSON.parse(readFileSync(`${ROOT}/package.json`, 'utf8'));
  const version = packageJson.version as string;

  console.log(`LinkedIn Hide Viewed Jobs v${version} — Extension Build`);
  console.log('='.repeat(50));

  await buildForBrowser('chrome');
  await buildForBrowser('firefox');

  console.log('\n' + '='.repeat(50));
  console.log('All extension builds complete!');
  console.log(`  Chrome:  dist/extension-chrome/`);
  console.log(`  Firefox: dist/extension-firefox/`);
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});