"use client";

import { useEffect, useState } from "react";
import { X, Share, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "araharu_ios_install_dismissed";

export function IOSInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari, not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone =
      ("standalone" in window.navigator &&
        (window.navigator as unknown as { standalone: boolean }).standalone) ||
      window.matchMedia("(display-mode: standalone)").matches;
    const dismissed = localStorage.getItem(DISMISS_KEY);

    if (isIOS && !isStandalone && !dismissed) {
      // Delay showing to not interrupt first visit
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto max-w-md border-t border-primary/20 bg-background/95 p-4 pb-6 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">앱으로 설치하기</h4>
              <button
                onClick={handleDismiss}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground"
                aria-label="닫기"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-2 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                  1
                </span>
                <span>
                  하단의 <Share className="inline size-3.5 text-blue-500" />{" "}
                  공유 버튼을 누르세요
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                  2
                </span>
                <span>
                  <PlusSquare className="inline size-3.5" /> &quot;홈 화면에
                  추가&quot;를 선택하세요
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="mt-2 text-xs"
            >
              다시 보지 않기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
