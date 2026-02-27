"use client";

import { motion } from "framer-motion";
import { UserPlus, BookOpen, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "가입하고 학년 선택",
    description:
      "간단한 가입 후 아이의 학년과 학기를 선택하면 맞춤 커리큘럼이 자동으로 구성돼요.",
    color: "from-primary to-ara-blue",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "매일 아침 30분 학습",
    description:
      "수학, 국어, 맞춤법, 한자 등 다양한 과목을 하루 한 세트씩! 재미있는 문제로 지루할 틈이 없어요.",
    color: "from-ara-blue to-ara-purple",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "성장 확인",
    description:
      "상세 리포트로 아이의 성장을 확인하고, AI가 취약점을 분석해 맞춤 복습 문제를 추천해요.",
    color: "from-ara-purple to-ara-pink",
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Connector line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[calc(50%+60px)] w-[calc(100%-120px)] h-[2px] bg-gradient-to-r from-border to-border/50" />
              )}

              {/* Icon circle */}
              <div
                className={`relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${step.color} shadow-lg`}
              >
                <step.icon className="h-10 w-10 text-white" />
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-primary text-xs font-bold text-primary">
                  {step.number}
                </div>
              </div>

              {/* Text */}
              <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
