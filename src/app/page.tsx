"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { GradePreview } from "@/components/landing/GradePreview";
import { CTA } from "@/components/landing/CTA";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <GradePreview />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
