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
    title: "수준별 맞춤 출제",
    description:
      "과목별 정답률에 따라 난이도가 자동으로 조정돼요. 어려우면 쉽게, 쉬우면 도전적으로!",
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

// 아라하루가 실제로 제공하는 것만 적는다.
// (근거를 댈 수 없는 타사 비교는 표시광고법상 문제가 되므로 두지 않는다.)
const promises = [
  "2022 개정 교육과정 진도에 맞춘 출제",
  "과목별 정답률에 따른 자동 난이도 조정",
  "하루 한 세트, 국어·수학·영어·한자 등 전 과목",
  "광고 없는 화면",
  "가입 시 최소한의 정보만 수집",
  "학습 기록·정답률 리포트 제공",
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
            <h4 className="text-base font-bold mb-2">가벼운 데이터 사용</h4>
            <p className="text-sm text-muted-foreground">
              문제를 기기에서 직접 만들어요. 푸는 동안 추가 통신이 없어요.
            </p>
          </div>
        </motion.div>

        {/* 제공 항목 체크리스트 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <h3 className="text-xl font-bold text-center mb-6">
            아라하루가 약속하는 것
          </h3>
          <div className="max-w-2xl mx-auto overflow-hidden rounded-2xl border bg-card">
            {promises.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 px-4 py-3 text-sm ${
                  i % 2 === 0 ? '' : 'bg-muted/20'
                } ${i < promises.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
