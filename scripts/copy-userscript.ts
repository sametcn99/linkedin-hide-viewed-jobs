import { cpSync, existsSync } from 'fs';

const ROOT = import.meta.dir.replace(/[\\/]scripts$/, '');
const source = `${ROOT}/dist/userscript/linkedin-hide-viewed-jobs.user.js`;
const target = `${ROOT}/linkedin-hide-viewed-jobs.user.js`;

if (!existsSync(source)) {
  console.error(`Missing build output: ${source}`);
  console.error('Run "bun run build" first.');
  process.exit(1);
}

cpSync(source, target);
console.log(`Copied ${source} → ${target}`);
