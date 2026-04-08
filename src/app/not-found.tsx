import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <span className="text-4xl">🔍</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">페이지를 찾을 수 없어요</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          요청하신 페이지가 존재하지 않거나 이동되었어요.
        </p>
        <Button asChild className="rounded-xl">
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </div>
    </div>
  );
}
