"use client";

import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  서비스: [
    { href: "#features", label: "소개" },
    { href: "#pricing", label: "요금제" },
    { href: "#how-it-works", label: "이용 방법" },
  ],
  지원: [
    { href: "/faq/", label: "자주 묻는 질문" },
    { href: "#contact", label: "문의하기" },
    { href: "/guide/", label: "사용 가이드" },
  ],
  법적: [
    { href: "/terms/", label: "이용약관" },
    { href: "/privacy/", label: "개인정보처리방침" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Logo size={32} />
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
                매일 아침 30분, 2022 개정 교육과정 기반 맞춤 학습으로 우리 아이의 학습 습관을 키워요.
              </p>
            </div>

            {/* Link Groups */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("#") ? (
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} 아라하루. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:hello@araharu.com"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              hello@araharu.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
