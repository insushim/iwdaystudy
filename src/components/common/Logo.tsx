"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  variant?: "default" | "white";
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 32, variant = "default", className, showText = true }: LogoProps) {
  const stemColor = variant === "white" ? "#FFFFFF" : "#2ECC71";
  const leafColor = variant === "white" ? "#E0E0E0" : "#27AE60";
  const pencilColor = variant === "white" ? "#FFFFFF" : "#F9CA24";
  const tipColor = variant === "white" ? "#CCCCCC" : "#1A1A2E";
  const textColor = variant === "white" ? "text-white" : "text-foreground";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Stem */}
        <path d="M32 52 L32 28" stroke={stemColor} strokeWidth="3" strokeLinecap="round" />
        {/* Left leaf */}
        <path d="M32 38 C24 36 20 28 24 22 C28 18 32 24 32 30" fill={stemColor} />
        {/* Right leaf */}
        <path d="M32 32 C40 30 44 22 40 16 C36 12 32 18 32 24" fill={leafColor} />
        {/* Pencil tip */}
        <path d="M32 28 L28 18 L32 10 L36 18 Z" fill={pencilColor} />
        <path d="M32 10 L30 14 L34 14 Z" fill={tipColor} />
        {/* Soil dots */}
        <ellipse cx="32" cy="54" rx="12" ry="3" fill={stemColor} opacity="0.2" />
        {/* Sparkle */}
        <circle cx="42" cy="14" r="1.5" fill={pencilColor} opacity="0.8" />
        <circle cx="22" cy="20" r="1" fill={pencilColor} opacity="0.6" />
      </svg>
      {showText && (
        <span className={cn("font-bold tracking-tight", textColor)} style={{ fontSize: size * 0.55 }}>
          아라하루
        </span>
      )}
    </div>
  );
}
