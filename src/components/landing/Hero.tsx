"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const floatingItems = [
  { icon: "📐", x: "10%", y: "20%", delay: 0 },
  { icon: "✏️", x: "85%", y: "15%", delay: 0.5 },
  { icon: "📖", x: "5%", y: "70%", delay: 1 },
  { icon: "🎨", x: "90%", y: "65%", delay: 1.5 },
  { icon: "🔢", x: "15%", y: "45%", delay: 0.8 },
  { icon: "💡", x: "80%", y: "40%", delay: 1.2 },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E8F5E8] via-background to-background" />

      {/* Floating decorations */}
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl sm:text-3xl pointer-events-none select-none opacity-20"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: item.delay,
            ease: "easeInOut",
          }}
        >
          {item.icon}
        </motion.div>
      ))}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="gap-1.5 px-4 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              2022 개정 교육과정 기반
            </Badge>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="block">매일 아침,</span>
            <span className="block mt-2 bg-gradient-to-r from-primary to-ara-blue bg-clip-text text-transparent">
              알아가는 즐거움
            </span>
          </motion.h1>

          {/* Mascot area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
            className="my-8 relative"
          >
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-primary/20 to-ara-blue/20 flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Sprout body */}
                  <ellipse cx="50" cy="82" rx="20" ry="8" fill="#2ECC71" opacity="0.2" />
                  <path d="M50 80 L50 40" stroke="#2ECC71" strokeWidth="4" strokeLinecap="round" />
                  <path d="M50 55 C38 52 32 40 38 30 C44 24 50 32 50 42" fill="#2ECC71" />
                  <path d="M50 46 C62 44 68 32 62 22 C56 16 50 24 50 34" fill="#27AE60" />
                  {/* Cute face */}
                  <circle cx="43" cy="50" r="2.5" fill="#1A1A2E" />
                  <circle cx="57" cy="50" r="2.5" fill="#1A1A2E" />
                  <path d="M46 56 Q50 60 54 56" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" fill="none" />
                  {/* Blush */}
                  <circle cx="39" cy="54" r="3" fill="#FF8BA7" opacity="0.4" />
                  <circle cx="61" cy="54" r="3" fill="#FF8BA7" opacity="0.4" />
                  {/* Pencil hat */}
                  <path d="M50 40 L44 24 L50 12 L56 24 Z" fill="#F9CA24" />
                  <path d="M50 12 L47 18 L53 18 Z" fill="#1A1A2E" />
                  {/* Sparkles */}
                  <motion.circle cx="68" cy="18" r="2" fill="#F9CA24" opacity="0.8"
                    style={{ transformOrigin: "68px 18px" }} />
                  <motion.circle cx="32" cy="28" r="1.5" fill="#F9CA24" opacity="0.6"
                    style={{ transformOrigin: "32px 28px" }} />
                </svg>
              </motion.div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
          >
            초등 1~6학년 맞춤 일일학습 프로그램.{" "}
            <span className="text-foreground font-medium">매일 30분 아침학습</span>으로
            수학, 국어, 영어, 한자까지 학습 습관을 만들어요.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Button size="lg" className="h-12 px-8 text-base font-semibold gap-2" asChild>
              <Link href="/signup/">
                무료로 시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base gap-2" asChild>
              <a href="#features">
                <BookOpen className="h-4 w-4" />
                자세히 알아보기
              </a>
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-12 flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-ara-yellow text-ara-yellow" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">1,200+</span> 가정에서 매일 사용하고 있어요
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 60L48 55C96 50 192 40 288 45C384 50 480 70 576 75C672 80 768 70 864 60C960 50 1056 40 1152 45C1248 50 1344 70 1392 80L1440 90V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z"
            fill="var(--background)"
          />
        </svg>
      </div>
    </section>
  );
}
