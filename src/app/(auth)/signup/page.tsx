"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_NAME, GRADES, SEMESTERS } from "@/lib/constants";

type Role = "student" | "teacher" | "parent";

const ROLE_OPTIONS: {
  value: Role;
  label: string;
  icon: string;
  desc: string;
}[] = [
  { value: "student", label: "학생", icon: "🎒", desc: "매일 아침학습을 해요" },
  {
    value: "teacher",
    label: "학급 관리자",
    icon: "👩‍🏫",
    desc: "학급을 관리해요 (승인 필요)",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [schoolName, setSchoolName] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleRoleSelect(selectedRole: Role) {
    setRole(selectedRole);
    setStep(2);
  }

  function handleBack() {
    setStep(1);
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("역할을 선택해 주세요.");
      return;
    }
    if (!name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (!email.trim()) {
      setError("이메일을 입력해 주세요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (role === "student") {
      if (!grade) {
        setError("학년을 선택해 주세요.");
        return;
      }
      if (!semester) {
        setError("학기를 선택해 주세요.");
        return;
      }
    }

    try {
      await signup({
        email,
        password,
        name,
        role,
        ...(role === "student"
          ? { grade: Number(grade), semester: Number(semester) }
          : {}),
        ...(schoolName ? { school_name: schoolName } : {}),
      });
      // Teacher signup → redirect to pending page
      if (role === "teacher") {
        router.push("/signup/pending");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <span className="text-3xl">🌱</span>
        </div>
        <CardTitle className="text-2xl font-bold">
          {APP_NAME} 회원가입
        </CardTitle>
        <CardDescription>
          {step === 1 ? "어떤 분이신가요?" : "정보를 입력해 주세요"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === 1 ? (
          /* Step 1: Role Selection */
          <div className="space-y-3">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleRoleSelect(option.value)}
                className="w-full flex items-center gap-4 rounded-xl border-2 border-border p-4 text-left transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  {option.icon}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {option.label}
                  </p>
                  <p className="text-sm text-muted-foreground">{option.desc}</p>
                </div>
                <svg
                  className="ml-auto h-5 w-5 text-muted-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        ) : (
          /* Step 2: Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role indicator */}
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {ROLE_OPTIONS.find((r) => r.value === role)?.icon}{" "}
              {ROLE_OPTIONS.find((r) => r.value === role)?.label}으로 가입
            </button>

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                placeholder={role === "student" ? "학생 이름" : "이름"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">이메일</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="6자 이상 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-confirm">비밀번호 확인</Label>
              <Input
                id="password-confirm"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호 재입력"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
                className="h-11"
              />
              {passwordConfirm && password !== passwordConfirm && (
                <p className="text-xs text-destructive">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
            </div>

            {/* Student-specific fields */}
            {role === "student" && (
              <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium text-primary">학생 정보</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>학년</Label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="학년" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADES.map((g) => (
                          <SelectItem key={g} value={String(g)}>
                            {g}학년
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>학기</Label>
                    <Select value={semester} onValueChange={setSemester}>
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="학기" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEMESTERS.map((s) => (
                          <SelectItem key={s} value={String(s)}>
                            {s}학기
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Teacher school name */}
            {role === "teacher" && (
              <div className="space-y-2">
                <Label htmlFor="school-name">학교명 (선택)</Label>
                <Input
                  id="school-name"
                  type="text"
                  placeholder="OO초등학교"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="h-11"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  가입 중...
                </span>
              ) : (
                "가입하기"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              가입하면{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-foreground"
              >
                이용약관
              </Link>
              과{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-foreground"
              >
                개인정보처리방침
              </Link>
              에 동의하게 됩니다.
            </p>
          </form>
        )}

        {step === 1 && (
          <>
            {/* Social login divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            {/* Social signup buttons (UI only) */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                className="h-11"
                onClick={() => setError("소셜 로그인은 준비 중입니다.")}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                className="h-11"
                onClick={() => setError("소셜 로그인은 준비 중입니다.")}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M12 3C6.477 3 2 6.463 2 10.691c0 2.788 1.922 5.239 4.8 6.603-.21.807-.763 2.925-.874 3.378-.136.551.203.543.426.395.175-.116 2.788-1.893 3.913-2.659.556.079 1.13.12 1.735.12 5.523 0 10-3.463 10-7.737C22 6.463 17.523 3 12 3z"
                    fill="#FEE500"
                  />
                </svg>
                Kakao
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
          >
            로그인
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
