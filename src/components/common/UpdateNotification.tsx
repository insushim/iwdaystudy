'use client';

import { useEffect, useState } from 'react';
import { checkForUpdate, type ReleaseInfo } from '@/lib/update-checker';
import { Button } from '@/components/ui/button';
import { X, Download, Sparkles } from 'lucide-react';

const DISMISS_KEY = 'araharu_update_dismissed';

export function UpdateNotification() {
  const [release, setRelease] = useState<ReleaseInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedVersion = localStorage.getItem(DISMISS_KEY);

    checkForUpdate().then((info) => {
      if (info && info.version !== dismissedVersion) {
        setRelease(info);
      }
    });
  }, []);

  if (!release || dismissed) return null;

  const isAndroidWebView =
    typeof navigator !== 'undefined' &&
    /wv/.test(navigator.userAgent) &&
    /Android/.test(navigator.userAgent);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, release.version);
  };

  const handleUpdate = () => {
    if (isAndroidWebView && release.apkUrl) {
      window.location.href = release.apkUrl;
    } else if (release.htmlUrl) {
      window.open(release.htmlUrl, '_blank');
    } else {
      window.location.reload();
    }
  };

  const summaryNotes = release.notes
    ? release.notes.split('\n').filter((line) => line.trim()).slice(0, 3).join(' ')
    : '';

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-xl border border-primary/20 bg-background/95 p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-foreground">
                v{release.version} 업데이트
              </h4>
              <button
                onClick={handleDismiss}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="닫기"
              >
                <X className="size-4" />
              </button>
            </div>

            {summaryNotes && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {summaryNotes}
              </p>
            )}

            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" onClick={handleUpdate} className="gap-1.5">
                <Download className="size-3.5" />
                {isAndroidWebView ? 'APK 다운로드' : '업데이트'}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                나중에
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
