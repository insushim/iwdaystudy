const GITHUB_OWNER = 'insushim';
const GITHUB_REPO = 'iwdaystudy';
const CURRENT_VERSION = '1.0.0';
const LAST_CHECK_KEY = 'araharu_last_update_check';
const CHECK_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

export interface ReleaseInfo {
  version: string;
  notes: string;
  apkUrl: string;
  htmlUrl: string;
  publishedAt: string;
}

export async function checkForUpdate(): Promise<ReleaseInfo | null> {
  // Don't check too frequently
  if (typeof window === 'undefined') return null;

  const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
  if (lastCheck && Date.now() - parseInt(lastCheck) < CHECK_INTERVAL) {
    return null;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const latestVersion = data.tag_name.replace('v', '');

    localStorage.setItem(LAST_CHECK_KEY, String(Date.now()));

    if (isNewerVersion(latestVersion, CURRENT_VERSION)) {
      const apkAsset = data.assets?.find((a: Record<string, string>) => a.name.endsWith('.apk'));
      return {
        version: latestVersion,
        notes: data.body || '',
        apkUrl: apkAsset?.browser_download_url || '',
        htmlUrl: data.html_url,
        publishedAt: data.published_at,
      };
    }
  } catch (e) {
    console.error('Update check failed:', e);
  }

  return null;
}

function isNewerVersion(latest: string, current: string): boolean {
  const lp = latest.split('.').map(Number);
  const cp = current.split('.').map(Number);

  for (let i = 0; i < Math.max(lp.length, cp.length); i++) {
    const l = lp[i] || 0;
    const c = cp[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

export function getCurrentVersion(): string {
  return CURRENT_VERSION;
}
