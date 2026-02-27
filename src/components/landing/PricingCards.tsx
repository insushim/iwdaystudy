"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, Crown, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRICING } from "@/lib/constants";

const planMeta = [
  {
    key: "free" as const,
    icon: Zap,
    color: "border-border",
    buttonVariant: "outline" as const,
    buttonText: "무료로 시작",
    popular: false,
  },
  {
    key: "basic" as const,
    icon: Check,
    color: "border-ara-blue",
    buttonVariant: "outline" as const,
    buttonText: "베이직 시작",
    popular: false,
  },
  {
    key: "premium" as const,
    icon: Crown,
    color: "border-primary",
    buttonVariant: "default" as const,
    buttonText: "프리미엄 시작",
    popular: true,
  },
  {
    key: "school" as const,
    icon: School,
    color: "border-ara-purple",
    buttonVariant: "outline" as const,
    buttonText: "문의하기",
    popular: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
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

export function PricingCards() {
  return (
    <section id="pricing" className="py-20 md:py-28">
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
            합리적인{" "}
            <span className="bg-gradient-to-r from-primary to-ara-blue bg-clip-text text-transparent">
              요금제
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            우리 아이에게 맞는 플랜을 선택하세요. 무료로 시작할 수 있어요.
          </p>
        </motion.div>

        {/* Pricing grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {planMeta.map((meta) => {
            const plan = PRICING[meta.key];
            return (
              <motion.div key={meta.key} variants={itemVariants} className="flex">
                <Card
                  className={`relative flex flex-col w-full border-2 ${meta.color} ${
                    meta.popular
                      ? "shadow-xl shadow-primary/10 scale-[1.02]"
                      : "shadow-md"
                  } transition-shadow hover:shadow-lg`}
                >
                  {meta.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        인기
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-2">
                      <meta.icon
                        className={`h-8 w-8 ${
                          meta.popular ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-black text-foreground">
                        {plan.price === 0
                          ? "무료"
                          : `${plan.price.toLocaleString()}원`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {"perClass" in plan ? "/학급/월" : "/월"}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1">
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={meta.buttonVariant}
                      className="w-full mt-6"
                      asChild
                    >
                      <Link
                        href={meta.key === "school" ? "#contact" : "/signup/"}
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
  );
}
