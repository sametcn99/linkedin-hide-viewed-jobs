import { build } from 'vite';

const ROOT = import.meta.dir.replace('/scripts', '');
const DIST = `${ROOT}/dist/extension`;

async function buildEntry(entry: string, outName: string, format: 'iife' | 'es' = 'iife') {
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
        entry: `${ROOT}/${entry}`,
        name: 'LHVJ',
        formats: [format === 'iife' ? 'iife' : 'es'],
        fileName: () => `${outName}.js`,
      },
    },
  });
}

async function main() {
  await Bun.$`rm -rf ${DIST}`.quiet();
  await Bun.$`mkdir -p ${DIST}`.quiet();

  console.log('Building content script (IIFE)...');
  await buildEntry('src/extension/content.ts', 'content', 'iife');

  console.log('Building background service worker (IIFE)...');
  await buildEntry('src/extension/background.ts', 'background', 'iife');

  console.log('Building popup (ES module)...');
  await buildEntry('src/popup/popup.ts', 'popup', 'es');

console.log('Copying extension files...');
  await Bun.write(`${DIST}/manifest.json`, Bun.file(`${ROOT}/extension/manifest.json`));

  const pkg = await Bun.file(`${ROOT}/package.json`).json();
  const popupHtml = await Bun.file(`${ROOT}/src/popup/popup.html`).text();
  await Bun.write(`${DIST}/popup.html`, popupHtml.replace('v1.1.5', `v${pkg.version}`));

  await Bun.write(`${DIST}/popup.css`, Bun.file(`${ROOT}/src/popup/popup.css`));

  await Bun.$`cp -r ${ROOT}/icons ${DIST}/icons`.quiet();

  console.log('Extension build complete! Output in dist/extension/');
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
