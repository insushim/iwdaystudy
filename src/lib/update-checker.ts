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

// functions/api/version.ts 응답 형태 (동일 출처 API)
interface VersionApiResponse {
  version: string;
  minVersion: string;
  buildDate: string;
  apkUrl?: string;
  htmlUrl?: string;
  maintenance?: boolean;
  message?: string | null;
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
    // 동일 출처(same-origin) API — CSP connect-src 'self' 로 통과한다.
    // (GitHub API를 직접 호출하면 CSP에 막혀 항상 실패했음 — CSP를 풀지 않고 이 방식으로 해결)
    const res = await fetch("/api/version", {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as VersionApiResponse;
    const latestVersion = data.version;

    localStorage.setItem(LAST_CHECK_KEY, String(now));

    if (isNewerVersion(latestVersion, getCurrentVersion())) {
      const info: ReleaseInfo = {
        version: latestVersion,
        notes: data.message || "",
        apkUrl: data.apkUrl || "",
        htmlUrl: data.htmlUrl || "",
        publishedAt: data.buildDate,
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
