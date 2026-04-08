"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <span className="text-4xl">😢</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">앗, 문제가 생겼어요</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          잠시 후 다시 시도해 주세요. 문제가 계속되면 새로고침 해보세요.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="rounded-xl">
            다시 시도
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="rounded-xl"
          >
            홈으로
          </Button>
        </div>
      </div>
    </div>
  );
}
