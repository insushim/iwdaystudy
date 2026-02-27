import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Nanum_Pen_Script } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-noto",
  display: "swap",
});

const nanumPen = Nanum_Pen_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-handwriting",
  display: "swap",
});

export const metadata: Metadata = {
  title: "아라하루 - 매일 아침, 알아가는 즐거움",
  description: "초등 1~6학년 맞춤 일일학습 프로그램. 2022 개정 교육과정 기반 매일 30분 아침학습으로 학습 습관을 키워요.",
  keywords: ["초등학습", "일일학습", "아침학습", "매일학습", "초등교육", "학습앱"],
  authors: [{ name: "아라하루" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "아라하루 - 매일 아침, 알아가는 즐거움",
    description: "초등 1~6학년 맞춤 일일학습 프로그램",
    siteName: "아라하루",
    locale: "ko_KR",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "아라하루",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2ECC71",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${notoSansKR.variable} ${nanumPen.variable} antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
