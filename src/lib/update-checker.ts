const GITHUB_OWNER = "insushim";
const GITHUB_REPO = "iwdaystudy";
const LAST_CHECK_KEY = "araharu_last_update_check";
const CACHED_RELEASE_KEY = "araharu_cached_release";
const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes (more frequent for better UX)

export interface ReleaseInfo {
  version: string;
  notes: string;
  apkUrl: string;
  htmlUrl: string;
  publishedAt: string;
}

// Get current version from package.json (injected at build time)
function getCurrentVersion(): string {
  // This will be replaced by the build process or read from SW
  return process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";
}

export async function checkForUpdate(): Promise<ReleaseInfo | null> {
  if (typeof window === "undefined") return null;

  const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
  const now = Date.now();

  // Return cached release if checked recently
  if (lastCheck && now - parseInt(lastCheck) < CHECK_INTERVAL) {
    const cached = localStorage.getItem(CACHED_RELEASE_KEY);
    if (cached) {
      try {
        const info = JSON.parse(cached) as ReleaseInfo;
        if (isNewerVersion(info.version, getCurrentVersion())) {
          return info;
        }
      } catch {}
    }
    return null;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
      { headers: { Accept: "application/vnd.github.v3+json" } },
    );

    if (!res.ok) return null;

    const data = await res.json();
    const latestVersion = data.tag_name.replace("v", "");

    localStorage.setItem(LAST_CHECK_KEY, String(now));

    if (isNewerVersion(latestVersion, getCurrentVersion())) {
      const apkAsset = data.assets?.find((a: Record<string, string>) =>
        a.name.endsWith(".apk"),
      );
      const info: ReleaseInfo = {
        version: latestVersion,
        notes: data.body || "",
        apkUrl: apkAsset?.browser_download_url || "",
        htmlUrl: data.html_url,
        publishedAt: data.published_at,
      };
      localStorage.setItem(CACHED_RELEASE_KEY, JSON.stringify(info));
      return info;
    } else {
      // Clear cached release if current version is up to date
      localStorage.removeItem(CACHED_RELEASE_KEY);
    }
  } catch (e) {
    console.error("Update check failed:", e);
  }

  return null;
}

function isNewerVersion(latest: string, current: string): boolean {
  const lp = latest.split(".").map(Number);
  const cp = current.split(".").map(Number);

  for (let i = 0; i < Math.max(lp.length, cp.length); i++) {
    const l = lp[i] || 0;
    const c = cp[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

export { getCurrentVersion };
