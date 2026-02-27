"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                1. 수집하는 개인정보
              </h2>
              <p>
                서비스 이용을 위해 다음 정보를 수집합니다: 이름, 이메일 주소,
                학년 정보, 학습 기록.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                2. 개인정보의 이용 목적
              </h2>
              <p>
                수집된 정보는 맞춤형 학습 콘텐츠 제공, 학습 통계 분석, 서비스
                개선을 위해 사용됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                3. 개인정보의 보관 및 파기
              </h2>
              <p>
                개인정보는 서비스 이용 기간 동안 보관되며, 회원 탈퇴 시 즉시
                파기됩니다. 법령에 의해 보존이 필요한 경우 해당 기간 동안
                보관합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                4. 제3자 제공
              </h2>
              <p>이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">
                5. 아동의 개인정보 보호
              </h2>
              <p>
                14세 미만 아동의 경우 법정대리인의 동의를 받아 개인정보를
                수집하며, 아동의 개인정보 보호에 최선을 다합니다.
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
