# Global Memory

## 2026-03-12

- 학생 일일 문제는 `src/lib/daily-set-generator.ts`에서 생성한다.
- 문제형 문항 중복 방지는 `generateDailySetWithoutRepeats()` + `getSeenQuestionSignatures()` 조합으로 동작한다.
- 학생별 과거 출제 이력은 `src/lib/local-storage.ts`의 저장된 완료 세트 질문 데이터 기준으로 계산한다.
- 문제형 중복 방지 대상은 `getQuestionSignature()`가 시그니처를 만드는 문항 타입들이다.
- 준비물 확인은 `question_type === 'readiness_check'`로 먼저 라우팅되어야 한다.
- `src/components/learning/QuestionRenderer.tsx`에서 특수 타입 라우팅보다 subject 라우팅을 먼저 하면 readiness가 글쓰기 컴포넌트로 잘못 가는 버그가 난다.
- 준비물 확인은 `src/components/learning/ReadinessChecklist.tsx`에서 아무 것도 체크하지 않아도 제출 가능해야 한다.
- 전 과목 콘텐츠 풀 확장은 현재 `src/lib/daily-set-generator.ts`의 `getGradeData()`에서 시드 배치를 합치는 방식으로 처리 중이다.
- 현재는 기본 생성 배치 + 추가 배치 + 보너스 절반 배치로 풀을 확장하고 있다.
- 자동 GitHub Actions 배포가 실패할 때가 있어서, 급하면 로컬에서 `npx wrangler pages deploy out --project-name=araharu --branch master`로 수동 프로덕션 배포 가능하다.
- Cloudflare Pages 프로젝트명은 `araharu`이고 운영 도메인은 `araharu-ecp.pages.dev`다.
- 빌드는 `npm run build`, 빠른 검증은 필요한 파일만 `npx eslint <files>`로 확인하는 흐름이 효율적이다.
