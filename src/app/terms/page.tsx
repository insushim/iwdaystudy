"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-bold mb-8">이용약관</h1>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                제1조 (목적)
              </h2>
              <p>
                이 약관은 아라하루(이하 &quot;서비스&quot;)가 제공하는 교육 관련
                서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로
                합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                제2조 (서비스의 내용)
              </h2>
              <p>
                서비스는 초등학생을 대상으로 한 일일학습 프로그램을 제공하며,
                2022 개정 교육과정에 기반한 학습 콘텐츠를 포함합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                제3조 (이용자의 의무)
              </h2>
              <p>
                이용자는 서비스를 교육 목적으로만 사용하여야 하며, 타인의
                개인정보를 침해하거나 서비스의 정상적인 운영을 방해하는 행위를
                하여서는 안 됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                제4조 (면책 조항)
              </h2>
              <p>
                서비스는 학습 보조 도구로서 제공되며, 학업 성과를 보장하지
                않습니다. 서비스 이용으로 인한 결과에 대해 법적 책임을 지지
                않습니다.
              </p>
            </section>

            <p className="text-xs text-muted-foreground pt-8">
              시행일: 2026년 2월 27일
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
