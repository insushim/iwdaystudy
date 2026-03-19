"use client";

import { motion } from "framer-motion";
import { UserPlus, BookOpen, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "가입하고 학년 선택",
    description:
      "간단한 가입 후 아이의 학년과 학기를 선택하면 맞춤 커리큘럼이 자동으로 구성돼요.",
    color: "from-primary to-ara-blue",
    highlight: "30초면 완료",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "매일 아침 30분 학습",
    description:
      "수학, 국어, 맞춤법, 한자 등 다양한 과목을 하루 한 세트씩! 재미있는 문제로 지루할 틈이 없어요.",
    color: "from-ara-blue to-ara-purple",
    highlight: "12개 과목",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "성장 확인",
    description:
      "상세 리포트로 아이의 성장을 확인하고, AI가 취약점을 분석해 맞춤 복습 문제를 추천해요.",
    color: "from-ara-purple to-ara-pink",
    highlight: "AI 분석",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-muted/30">
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
            이렇게{" "}
            <span className="bg-gradient-to-r from-ara-blue to-ara-purple bg-clip-text text-transparent">
              시작
            </span>
            해요
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            3단계면 충분해요. 오늘 가입하면 내일 아침부터 바로 학습할 수 있어요.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Connector arrow (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-16 left-[calc(50%+70px)] w-[calc(100%-140px)] items-center justify-center">
                  <div className="flex-1 h-[2px] bg-gradient-to-r from-border to-border/50" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 -ml-1" />
                </div>
              )}

              {/* Icon circle */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${step.color} shadow-lg`}
              >
                <step.icon className="h-10 w-10 text-white" />
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-primary text-xs font-bold text-primary shadow-sm">
                  {step.number}
                </div>
              </motion.div>

              {/* Highlight badge */}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.3 }}
                className="mt-4 inline-flex rounded-full bg-primary/10 text-primary text-xs font-bold px-3 py-1"
              >
                {step.highlight}
              </motion.span>

              {/* Text */}
              <h3 className="mt-3 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
