"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export default function SignupPendingPage() {
  return (
    <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm max-w-md mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
          <span className="text-3xl">&#x23F3;</span>
        </div>
        <CardTitle className="text-2xl font-bold">승인 대기 중</CardTitle>
        <CardDescription>
          {APP_NAME} 학급 관리자 가입이 완료되었습니다
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-200 space-y-2">
          <p className="font-medium">관리자 승인 후 이용 가능합니다</p>
          <p>
            슈퍼 관리자가 가입 요청을 검토한 후 승인하면 로그인할 수 있습니다.
            승인이 완료되면 등록된 이메일로 로그인해 주세요.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/login">로그인 페이지로 이동</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
