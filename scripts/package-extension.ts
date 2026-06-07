import { spawn } from 'child_process';
import { platform } from 'os';
import { existsSync } from 'fs';

const ROOT = import.meta.dir.replace(/[\\/]scripts$/, '').replace(/\\/g, '/');

function run(cmd: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd, shell: true, stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

async function packageExtension(browser: 'chrome' | 'firefox'): Promise<void> {
  const distDir = `${ROOT}/dist/extension-${browser}`;
  const zipName = `${ROOT}/linkedin-hide-viewed-jobs-${browser}.zip`;

  if (!existsSync(distDir)) {
    console.error(`  dist/extension-${browser}/ does not exist. Run "bun run build:extension" first.`);
    process.exit(1);
  }

  console.log(`\nPackaging ${browser.toUpperCase()} extension...`);

  if (platform() === 'win32') {
    // Use .NET ZipFile for standard Windows zip archives (Chrome Web Store compatible)
    const distDirWin = distDir.replace(/\//g, '\\');
    const zipNameWin = zipName.replace(/\//g, '\\');
    await run('powershell', [
      '-Command',
      `Add-Type -AssemblyName System.IO.Compression.FileSystem; ` +
      `[System.IO.Compression.ZipFile]::CreateFromDirectory('${distDirWin}', '${zipNameWin}', [System.IO.Compression.CompressionLevel]::Optimal, $false)`,
    ], ROOT);
  } else {
    // Use zip on Unix-like systems
    await run('sh', ['-c', `cd ${distDir} && zip -r ${zipName} .`], ROOT);
  }

  console.log(`  ${browser.toUpperCase()} extension packaged → ${zipName}`);
}

async function main() {
  const args = process.argv.slice(2);
  const target = args[0] as 'chrome' | 'firefox' | undefined;

  if (target && target !== 'chrome' && target !== 'firefox') {
    console.error(`Unknown target: ${target}. Use "chrome" or "firefox".`);
    process.exit(1);
  }

  if (target) {
    await packageExtension(target);
  } else {
    await packageExtension('chrome');
    await packageExtension('firefox');
  }

  console.log('\nAll extensions packaged successfully!');
}

main().catch((err) => {
  console.error('Packaging failed:', err);
  process.exit(1);
});
