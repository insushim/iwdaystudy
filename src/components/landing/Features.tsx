"use client";

import { motion } from "framer-motion";
import {
  Brain,
  BookOpenCheck,
  BarChart3,
  Shield,
  Palette,
  Clock,
  Check,
  Wifi,
  WifiOff,
  Lock,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI 맞춤 학습",
    description:
      "아이의 수준과 학습 패턴을 분석하여 딱 맞는 문제를 출제해요. 어려우면 쉽게, 쉬우면 도전적으로!",
    color: "text-ara-orange",
    bg: "bg-ara-orange/10",
    borderHover: "hover:border-ara-orange/30",
  },
  {
    icon: BookOpenCheck,
    title: "2022 개정 교육과정",
    description:
      "최신 교육과정에 맞춘 문제로 학교 수업과 연계해요. 학기별, 단원별 완벽 대응!",
    color: "text-primary",
    bg: "bg-primary/10",
    borderHover: "hover:border-primary/30",
  },
  {
    icon: BarChart3,
    title: "상세 학습 리포트",
    description:
      "과목별 정답률, 취약점, 학습 추이를 한눈에 파악해요. 학부모 리포트도 함께 제공!",
    color: "text-ara-blue",
    bg: "bg-ara-blue/10",
    borderHover: "hover:border-ara-blue/30",
  },
  {
    icon: Clock,
    title: "매일 30분 루틴",
    description:
      "하루 30분이면 충분! 꾸준한 아침학습 습관이 성적 향상의 비결이에요.",
    color: "text-ara-yellow",
    bg: "bg-ara-yellow/10",
    borderHover: "hover:border-ara-yellow/30",
  },
  {
    icon: Palette,
    title: "재미있는 학습 경험",
    description:
      "뱃지, 연속학습 보상, 귀여운 캐릭터와 함께하는 학습으로 아이가 스스로 찾아와요.",
    color: "text-ara-pink",
    bg: "bg-ara-pink/10",
    borderHover: "hover:border-ara-pink/30",
  },
  {
    icon: Shield,
    title: "안전한 학습 환경",
    description:
      "광고 없는 깔끔한 화면, 안전한 콘텐츠, 학습 시간 관리까지 부모님이 안심할 수 있어요.",
    color: "text-ara-purple",
    bg: "bg-ara-purple/10",
    borderHover: "hover:border-ara-purple/30",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// Comparison data
const comparisons = [
  { feature: "2022 개정 교육과정 기반", us: true, others: "일부" },
  { feature: "AI 맞춤 문제 출제", us: true, others: "유료" },
  { feature: "선행학습법 지원", us: true, others: false },
  { feature: "개인정보 최소 수집", us: true, others: false },
  { feature: "오프라인 학습 지원", us: true, others: "일부" },
  { feature: "광고 없는 환경", us: true, others: false },
  { feature: "학부모 리포트", us: true, others: "유료" },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            왜{" "}
            <span className="bg-gradient-to-r from-primary to-ara-blue bg-clip-text text-transparent">
              아라하루
            </span>
            일까요?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            검증된 교육 방법론과 최신 기술이 만나 아이에게 딱 맞는 학습 경험을 만들어요.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className={`group h-full border shadow-md hover:shadow-xl transition-all duration-300 ${feature.borderHover}`}>
                <CardContent className="pt-6">
                  <motion.div
                    className={`inline-flex rounded-xl p-3 ${feature.bg}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </motion.div>
                  <h3 className="mt-4 text-lg font-bold group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Key differentiators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 mb-4">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <h4 className="text-base font-bold mb-2">선행학습법</h4>
            <p className="text-sm text-muted-foreground">
              다음 학기, 다음 학년 과정을 미리 학습하여 학교 수업에 자신감을 더해요.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 mb-4">
              <Lock className="h-7 w-7 text-blue-600" />
            </div>
            <h4 className="text-base font-bold mb-2">개인정보 보호</h4>
            <p className="text-sm text-muted-foreground">
              최소한의 정보만 수집하고, 학습 데이터는 기기에 안전하게 저장돼요.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 mb-4">
              <WifiOff className="h-7 w-7 text-amber-600" />
            </div>
            <h4 className="text-base font-bold mb-2">오프라인 학습</h4>
            <p className="text-sm text-muted-foreground">
              인터넷이 없어도 문제 풀기가 가능해요. 캠핑, 차 안에서도 학습해요.
            </p>
          </div>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <h3 className="text-xl font-bold text-center mb-6">
            다른 학습 앱과 비교해보세요
          </h3>
          <div className="max-w-2xl mx-auto overflow-hidden rounded-2xl border bg-card">
            {/* Header */}
            <div className="grid grid-cols-3 bg-muted/50 px-4 py-3 text-sm font-bold">
              <div>기능</div>
              <div className="text-center text-primary">아라하루</div>
              <div className="text-center text-muted-foreground">다른 앱</div>
            </div>
            {/* Rows */}
            {comparisons.map((row, i) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`grid grid-cols-3 px-4 py-3 text-sm ${
                  i % 2 === 0 ? '' : 'bg-muted/20'
                } ${i < comparisons.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <div className="font-medium">{row.feature}</div>
                <div className="flex justify-center">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="flex justify-center items-center">
                  {row.others === true ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  ) : row.others === false ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">{row.others}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
