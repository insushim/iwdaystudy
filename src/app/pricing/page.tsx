"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  Crown,
  School,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRICING } from "@/lib/constants";

const planMeta = [
  {
    key: "free" as const,
    icon: Zap,
    gradient: "from-gray-400 to-gray-500",
    borderColor: "border-border",
    bgGlow: "",
    buttonVariant: "outline" as const,
    buttonText: "무료로 시작",
    popular: false,
  },
  {
    key: "basic" as const,
    icon: Check,
    gradient: "from-blue-400 to-cyan-500",
    borderColor: "border-blue-300 dark:border-blue-700",
    bgGlow: "",
    buttonVariant: "outline" as const,
    buttonText: "베이직 시작",
    popular: false,
  },
  {
    key: "premium" as const,
    icon: Crown,
    gradient: "from-primary to-emerald-500",
    borderColor: "border-primary",
    bgGlow: "shadow-xl shadow-primary/15",
    buttonVariant: "default" as const,
    buttonText: "프리미엄 시작",
    popular: true,
  },
  {
    key: "school" as const,
    icon: School,
    gradient: "from-purple-400 to-pink-500",
    borderColor: "border-purple-300 dark:border-purple-700",
    bgGlow: "",
    buttonVariant: "outline" as const,
    buttonText: "문의하기",
    popular: false,
  },
];

const faqs = [
  {
    q: "무료 플랜에서 유료로 업그레이드하면 기존 데이터는 유지되나요?",
    a: "네, 모든 학습 기록과 뱃지, 통계는 그대로 유지됩니다. 언제든 업그레이드하셔도 이전 데이터가 사라지지 않아요.",
  },
  {
    q: "결제 방법은 어떻게 되나요?",
    a: "신용카드, 체크카드, 카카오페이, 네이버페이로 결제할 수 있습니다. 매월 자동 결제되며, 언제든 취소할 수 있어요.",
  },
  {
    q: "환불 규정이 어떻게 되나요?",
    a: "결제일로부터 7일 이내에 환불을 요청하시면 전액 환불해 드립니다. 7일 이후에는 남은 기간에 대해 일할 계산하여 환불합니다.",
  },
  {
    q: "학교 플랜은 어떻게 신청하나요?",
    a: "학교 플랜은 학급 단위로 가입할 수 있습니다. 문의 페이지를 통해 연락주시면, 담당자가 맞춤 안내를 도와드립니다.",
  },
  {
    q: "형제/자매 할인이 있나요?",
    a: "네! 같은 계정에서 2명 이상의 자녀를 등록하시면 두 번째 자녀부터 30% 할인이 적용됩니다.",
  },
  {
    q: "프리미엄과 베이직의 가장 큰 차이는 무엇인가요?",
    a: "프리미엄에서는 AI가 아이의 학습 패턴을 분석하여 맞춤 문제를 추천하고, 학부모 리포트를 제공합니다. 또한 하루 학습 세트 제한이 없어요.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-base font-medium text-foreground pr-4">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
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
        <p className="pb-5 text-sm text-muted-foreground leading-relaxed">
          {a}
        </p>
      </motion.div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              무료로 시작하세요
            </Badge>
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
              우리 아이에게 맞는{" "}
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                요금제
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              모든 플랜에서 2022 개정 교육과정 기반의 양질의 학습 콘텐츠를
              제공합니다. 무료 플랜으로 시작해 보세요.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {planMeta.map((meta) => {
              const plan = PRICING[meta.key];
              return (
                <motion.div
                  key={meta.key}
                  variants={itemVariants}
                  className="flex"
                >
                  <Card
                    className={`relative flex flex-col w-full border-2 ${meta.borderColor} ${meta.bgGlow} ${
                      meta.popular ? "scale-[1.03] lg:scale-105" : ""
                    } transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                  >
                    {meta.popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
                          <Crown className="h-3.5 w-3.5 mr-1" />
                          가장 인기
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4 pt-8">
                      <div
                        className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-white`}
                      >
                        <meta.icon className="h-7 w-7" />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription className="mt-2">
                        <span className="text-4xl font-black text-foreground">
                          {plan.price === 0
                            ? "무료"
                            : `${plan.price.toLocaleString()}원`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-sm text-muted-foreground block mt-1">
                            {"perClass" in plan ? "/학급/월" : "/월"}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-1 px-6">
                      <ul className="space-y-3.5 flex-1">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2.5 text-sm"
                          >
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Check className="h-3 w-3 text-primary" />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant={meta.buttonVariant}
                        className={`w-full mt-8 h-11 text-sm font-semibold ${
                          meta.popular
                            ? "shadow-md shadow-primary/20"
                            : ""
                        }`}
                        asChild
                      >
                        <Link
                          href={
                            meta.key === "school" ? "/contact" : "/signup"
                          }
                        >
                          {meta.buttonText}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Comparison note */}
      <section className="py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-muted/50 p-6 md:p-8 text-center">
            <p className="text-sm text-muted-foreground">
              모든 유료 플랜은{" "}
              <span className="font-semibold text-foreground">
                7일 무료 체험
              </span>
              을 제공합니다. 체험 기간 중 언제든 취소할 수 있으며, 취소 시
              요금이 청구되지 않습니다.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
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
              요금제에 대해 궁금한 점이 있으신가요?
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

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-t from-primary/5 to-transparent">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold">
              지금 바로 시작해 보세요
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              무료 플랜으로 아라하루의 학습 경험을 체험해 보세요.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link href="/contact">문의하기</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
