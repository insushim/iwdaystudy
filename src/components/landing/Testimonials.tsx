"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "김지은",
    role: "초등 2학년 학부모",
    avatar: "JE",
    avatarBg: "bg-ara-pink/20 text-ara-pink",
    rating: 5,
    text: "아이가 매일 아침 스스로 아라하루를 켜서 학습해요. 맞춤법 문제가 정말 좋고, 귀여운 캐릭터 덕에 지루해하지 않아요. 3개월째 연속 학습 중이에요!",
  },
  {
    name: "박승호",
    role: "초등 4학년 학부모",
    avatar: "SH",
    avatarBg: "bg-ara-blue/20 text-ara-blue",
    rating: 5,
    text: "학원을 다니지 않아도 기초가 탄탄해져요. 특히 수학 문제가 교과서와 잘 연계되어 있어서 학교 시험 준비에도 큰 도움이 됩니다.",
  },
  {
    name: "이서연",
    role: "초등 5학년 담임교사",
    avatar: "SY",
    avatarBg: "bg-ara-purple/20 text-ara-purple",
    rating: 5,
    text: "학교 플랜으로 우리 반 전체가 사용하고 있어요. 아침 자습 시간에 활용하니 학생들의 기초학력이 눈에 띄게 향상됐어요. 교사 대시보드도 편리해요.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
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

export function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
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
            사용자{" "}
            <span className="bg-gradient-to-r from-ara-yellow to-ara-orange bg-clip-text text-transparent">
              후기
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            아라하루와 함께 성장하고 있는 학부모님과 선생님의 이야기예요.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={itemVariants}>
              <Card className="h-full border-0 shadow-md">
                <CardContent className="pt-6">
                  {/* Quote icon */}
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-ara-yellow text-ara-yellow"
                      />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {t.text}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${t.avatarBg}`}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
