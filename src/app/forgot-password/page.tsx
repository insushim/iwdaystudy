"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

// 이메일 발송 백엔드가 없어 "재설정 링크 전송"을 흉내내지 않는다.
// 학생은 담임 선생님(계정 생성자)에게, 교사/학부모는 관리자에게 직접 문의해
// 실제로 비밀번호를 재설정받는 안내만 정직하게 제공한다.
export default function ForgotPasswordPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">비밀번호 찾기</CardTitle>
          <CardDescription>
            {APP_NAME}는 아직 이메일로 비밀번호를 재설정하는 기능을 지원하지
            않아요. 아래 방법으로 문의해 주세요.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-foreground mb-1">
              🎒 학생이에요
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              선생님이 만들어 준 계정은 처음에 <b>아이디와 비밀번호가
              같아요</b>. 그래도 안 되면 담임 선생님께 여쭤보세요.
            </p>
          </div>
          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="text-sm font-semibold text-foreground mb-1">
              👩‍🏫 선생님/학부모예요
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              관리자에게 문의해 주시면 비밀번호 재설정을 도와드립니다.
            </p>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href="/contact">
                <MessageCircle className="h-3.5 w-3.5" />
                문의하기 페이지로 이동
              </Link>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            로그인으로 돌아가기
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
