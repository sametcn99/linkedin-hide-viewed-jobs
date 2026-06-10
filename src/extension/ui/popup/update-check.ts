import { DOM_IDS } from '../../../core/constants';

const GITHUB_RELEASES_URL =
  'https://api.github.com/repos/sametcn99/linkedin-hide-viewed-jobs/releases/latest';
const GITHUB_RELEASES_PAGE =
  'https://github.com/sametcn99/linkedin-hide-viewed-jobs/releases/latest';
const AUTO_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string | null;
  releaseUrl: string;
  hasUpdate: boolean;
  checkedAt: number;
  error: string | null;
}

interface CachedCheck {
  checkedAt: number;
  latestVersion: string | null;
  error: string | null;
}

function parseVersion(version: string): number[] {
  return version
    .replace(/^v/, '')
    .split('.')
    .map((p) => parseInt(p, 10) || 0);
}

export function isNewerVersion(latest: string, current: string): boolean {
  const a = parseVersion(latest);
  const b = parseVersion(current);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av > bv) return true;
    if (av < bv) return false;
  }
  return false;
}

function getCached(): Promise<CachedCheck | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(DOM_IDS.UPDATE_CHECK_STORAGE_KEY, (result) => {
      const raw = result[DOM_IDS.UPDATE_CHECK_STORAGE_KEY];
      if (raw && typeof raw === 'object') {
        resolve(raw as CachedCheck);
      } else {
        resolve(null);
      }
    });
  });
}

function setCached(value: CachedCheck): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [DOM_IDS.UPDATE_CHECK_STORAGE_KEY]: value }, () => resolve());
  });
}

function fetchLatestVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    fetch(GITHUB_RELEASES_URL, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    })
      .then((res) => {
        clearTimeout(timer);
        if (!res.ok) {
          reject(new Error(`HTTP ${res.status}`));
          return;
        }
        return res.json();
      })
      .then((data: { tag_name?: string; name?: string } | undefined) => {
        if (!data) {
          reject(new Error('Empty response'));
          return;
        }
        const tag = (data.tag_name || data.name || '').replace(/^v/, '').trim();
        if (!tag) {
          reject(new Error('No version in response'));
          return;
        }
        resolve(tag);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export function shouldAutoCheck(cached: CachedCheck | null): boolean {
  if (!cached) return true;
  return Date.now() - cached.checkedAt > AUTO_CHECK_INTERVAL_MS;
}

export function checkForUpdate(
  currentVersion: string,
  options: { force?: boolean } = {}
): Promise<UpdateInfo> {
  return new Promise((resolve) => {
    const finish = (info: Omit<UpdateInfo, 'currentVersion' | 'releaseUrl'>) => {
      resolve({
        currentVersion,
        releaseUrl: GITHUB_RELEASES_PAGE,
        ...info,
      });
    };

    const run = () => {
      fetchLatestVersion()
        .then((latestVersion) => {
          const cached: CachedCheck = { checkedAt: Date.now(), latestVersion, error: null };
          void setCached(cached);
          finish({
            latestVersion,
            hasUpdate: isNewerVersion(latestVersion, currentVersion),
            checkedAt: cached.checkedAt,
            error: null,
          });
        })
        .catch((err: Error) => {
          const cached: CachedCheck = {
            checkedAt: Date.now(),
            latestVersion: null,
            error: err.message || 'Network error',
          };
          void setCached(cached);
          finish({
            latestVersion: null,
            hasUpdate: false,
            checkedAt: cached.checkedAt,
            error: cached.error,
          });
        });
    };

    if (options.force) {
      run();
      return;
    }

    void getCached().then((cached) => {
      if (shouldAutoCheck(cached)) {
        run();
      } else if (cached) {
        finish({
          latestVersion: cached.latestVersion,
          hasUpdate: cached.latestVersion
            ? isNewerVersion(cached.latestVersion, currentVersion)
            : false,
          checkedAt: cached.checkedAt,
          error: cached.error,
        });
      } else {
        run();
      }
    });
  });
}
