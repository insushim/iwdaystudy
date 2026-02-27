"use client";

import { motion } from "framer-motion";
import {
  Brain,
  BookOpenCheck,
  BarChart3,
  Shield,
  Palette,
  Clock,
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
  },
  {
    icon: BookOpenCheck,
    title: "2022 개정 교육과정",
    description:
      "최신 교육과정에 맞춘 문제로 학교 수업과 연계해요. 학기별, 단원별 완벽 대응!",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: BarChart3,
    title: "상세 학습 리포트",
    description:
      "과목별 정답률, 취약점, 학습 추이를 한눈에 파악해요. 학부모 리포트도 함께 제공!",
    color: "text-ara-blue",
    bg: "bg-ara-blue/10",
  },
  {
    icon: Clock,
    title: "매일 30분 루틴",
    description:
      "하루 30분이면 충분! 꾸준한 아침학습 습관이 성적 향상의 비결이에요.",
    color: "text-ara-yellow",
    bg: "bg-ara-yellow/10",
  },
  {
    icon: Palette,
    title: "재미있는 학습 경험",
    description:
      "뱃지, 연속학습 보상, 귀여운 캐릭터와 함께하는 학습으로 아이가 스스로 찾아와요.",
    color: "text-ara-pink",
    bg: "bg-ara-pink/10",
  },
  {
    icon: Shield,
    title: "안전한 학습 환경",
    description:
      "광고 없는 깔끔한 화면, 안전한 콘텐츠, 학습 시간 관리까지 부모님이 안심할 수 있어요.",
    color: "text-ara-purple",
    bg: "bg-ara-purple/10",
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
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

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
              <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className={`inline-flex rounded-xl p-3 ${feature.bg}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
