"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section
      id="contact"
      className="py-20 md:py-28 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-ara-blue/5 to-ara-purple/5" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Floating sparkles */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-8 left-1/4 opacity-20"
          >
            <Sparkles className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.div
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-12 right-1/4 opacity-20"
          >
            <Sparkles className="h-6 w-6 text-ara-yellow" />
          </motion.div>

          <h2 className="text-3xl font-black sm:text-4xl md:text-5xl">
            오늘 시작하면,
            <br />
            <span className="bg-gradient-to-r from-primary via-ara-blue to-ara-purple bg-clip-text text-transparent">
              내일 아침이 달라져요
            </span>
          </h2>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            매일 30분의 작은 습관이 아이의 학습 자신감을 키워요.
            지금 무료로 시작하고, 일주일간 모든 기능을 체험해 보세요.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-14 px-10 text-lg font-semibold gap-2 shadow-lg shadow-primary/25"
              asChild
            >
              <Link href="/signup/">
                무료 체험 시작하기
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            신용카드 없이 시작 &middot; 언제든 해지 가능 &middot; 7일 무료 체험
          </p>
        </motion.div>
      </div>
    </section>
  );
}
