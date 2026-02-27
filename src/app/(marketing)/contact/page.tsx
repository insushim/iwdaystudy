"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Send,
  ChevronDown,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";

const contactTypes = [
  { value: "general", label: "일반 문의" },
  { value: "pricing", label: "요금제 문의" },
  { value: "school", label: "학교/기관 도입 문의" },
  { value: "technical", label: "기술 지원" },
  { value: "partnership", label: "제휴/협업 문의" },
  { value: "feedback", label: "피드백/건의" },
];

const faqs = [
  {
    q: "아라하루를 어떻게 시작하나요?",
    a: "회원가입 후 아이의 학년과 학기를 설정하면 바로 시작할 수 있습니다. 무료 플랜으로 시작하여 서비스를 체험해 보세요.",
  },
  {
    q: "학습 시간은 얼마나 걸리나요?",
    a: "학년에 따라 10~15문제로 구성되며, 보통 20~30분 정도 소요됩니다. 아이의 속도에 맞추어 진행할 수 있어요.",
  },
  {
    q: "오프라인에서도 사용할 수 있나요?",
    a: "PWA(Progressive Web App)를 지원하여, 한 번 접속한 학습 세트는 오프라인에서도 풀 수 있습니다.",
  },
  {
    q: "학부모가 학습 현황을 확인할 수 있나요?",
    a: "네! 프리미엄 플랜에서는 학부모 리포트를 통해 아이의 학습 현황, 취약 과목, 성장 추이를 확인할 수 있습니다.",
  },
  {
    q: "여러 자녀를 등록할 수 있나요?",
    a: "하나의 계정에서 여러 자녀의 프로필을 관리할 수 있습니다. 두 번째 자녀부터는 할인이 적용됩니다.",
  },
  {
    q: "학교에서 단체로 사용할 수 있나요?",
    a: "학교 플랜을 통해 학급 단위로 사용할 수 있습니다. 교사 대시보드, 학급 관리, 과제 배정 기능이 포함되어 있습니다.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-medium text-foreground pr-4">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {a}
        </p>
      </motion.div>
    </div>
  );
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
              <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
              문의하기
            </Badge>
            <h1 className="text-4xl font-bold sm:text-5xl">
              무엇이든{" "}
              <span className="text-primary">물어보세요</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              아라하루 팀이 빠르게 답변 드리겠습니다. 평일 기준 24시간 이내
              답변을 드려요.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">문의 보내기</CardTitle>
                    <CardDescription>
                      아래 양식을 작성하시면 이메일로 답변을 보내드립니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-12 text-center"
                      >
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <CheckCircle2 className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                          문의가 접수되었습니다!
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          평일 기준 24시간 이내 입력하신 이메일로 답변 드리겠습니다.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSubmitted(false);
                            setName("");
                            setEmail("");
                            setType("");
                            setMessage("");
                          }}
                        >
                          추가 문의하기
                        </Button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label htmlFor="name">이름</Label>
                            <Input
                              id="name"
                              placeholder="홍길동"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">이메일</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="name@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="h-11"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type">문의 유형</Label>
                          <Select value={type} onValueChange={setType} required>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="문의 유형을 선택해 주세요" />
                            </SelectTrigger>
                            <SelectContent>
                              {contactTypes.map((ct) => (
                                <SelectItem key={ct.value} value={ct.value}>
                                  {ct.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">메시지</Label>
                          <Textarea
                            id="message"
                            placeholder="문의 내용을 입력해 주세요..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            rows={6}
                            className="resize-none"
                          />
                        </div>

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
                              전송 중...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Send className="h-4 w-4" />
                              문의 보내기
                            </span>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-bold mb-4">연락처</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">이메일</p>
                          <a
                            href="mailto:contact@araharu.kr"
                            className="text-sm text-primary hover:underline"
                          >
                            contact@araharu.kr
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="#FEE500"
                          >
                            <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.788 1.922 5.239 4.8 6.603-.21.807-.763 2.925-.874 3.378-.136.551.203.543.426.395.175-.116 2.788-1.893 3.913-2.659.556.079 1.13.12 1.735.12 5.523 0 10-3.463 10-7.737C22 6.463 17.523 3 12 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">카카오톡</p>
                          <p className="text-sm text-muted-foreground">
                            @아라하루
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-sm font-medium mb-2">응답 시간</h4>
                      <p className="text-sm text-muted-foreground">
                        평일: 24시간 이내
                      </p>
                      <p className="text-sm text-muted-foreground">
                        주말/공휴일: 48시간 이내
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="border-0 shadow-sm bg-primary/5">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-bold mb-2">
                      학교/기관 도입을 원하시나요?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      학교 플랜에 대한 자세한 안내와 데모를 제공해 드립니다.
                      문의 유형에서 &ldquo;학교/기관 도입 문의&rdquo;를
                      선택해 주세요.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">자주 묻는 질문</h2>
            <p className="mt-4 text-muted-foreground">
              자주 문의하시는 내용을 모았습니다.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border bg-card p-6 md:p-8"
          >
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
