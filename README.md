# 아라하루 (araharu / iwdaystudy)

초등학교 1~6학년 학생을 위한 **매일 아침 학습 세트** 웹앱. 학년·학기별로 수학·맞춤법·상식·안전·한자·영어·독해 문항을 매일 자동 생성해 제공하고, 학생·학부모·교사·관리자용 대시보드를 함께 제공한다.

- 웹/PWA: https://araharu.pages.dev
- Android: GitHub Releases에서 APK 배포 (자동 업데이트 감지)

## 기술 스택

- **Next.js 16** (App Router, `output: "export"` 정적 export)
- **Cloudflare Pages** 호스팅 + **Cloudflare Pages Functions**(`functions/`, `/api/*`)
- **Cloudflare D1**(SQLite) — `wrangler/schema.sql`
- **Android**: WebView 기반 앱 (`android/`), PWA를 앱으로 감싼 형태
- TypeScript, Tailwind CSS, Zustand, Radix UI

## 로컬 실행

```bash
npm ci
npm run dev
```

http://localhost:3000 에서 확인. 로컬에서 D1/API를 함께 띄우려면 `wrangler pages dev out` (빌드 산출물 필요) 또는 Cloudflare 대시보드의 미리보기 배포를 사용한다.

## 빌드

```bash
npm run build
```

`next build`가 정적 파일을 `out/`에 생성한다. 빌드 전(`prebuild`) 다음이 자동 실행된다:

1. `scripts/generate-icons.mjs` — `public/favicon.svg`에서 PWA 아이콘 생성
2. `scripts/sync-version.mjs` — `package.json`의 `version`을 진실원(single source of truth)으로 삼아 `android/app/build.gradle`, `functions/api/version.ts`에 동일 버전을 주입

**`npm run build`는 CI(GitHub Actions)가 실행한다. 로컬에서 이 커맨드를 실행하지 말 것** — 다른 작업과 충돌할 수 있다. 로컬 검증은 아래 "검증 스크립트"로 한다.

## 버전 관리

버전은 **`package.json`의 `version`이 유일한 진실원**이다. 아래 세 곳이 항상 일치해야 한다.

| 파일 | 용도 |
|---|---|
| `package.json` `version` | 웹 클라이언트가 빌드 시 `NEXT_PUBLIC_APP_VERSION`으로 주입받아 자기 버전을 안다 (`next.config.ts`) |
| `android/app/build.gradle` `versionName`/`versionCode` | Android 앱 버전 |
| `functions/api/version.ts` `APP_VERSION` | 서버가 "최신 버전이 몇인지" 응답하는 API (`GET /api/version`) — 웹/PWA/Android가 업데이트 여부를 판단하는 기준 |

버전을 올릴 때:

```bash
bash scripts/bump-version.sh 1.0.31   # package.json + sw.js + (gradle/version.ts는 sync-version.mjs가 처리)
# 또는 커밋/태그/푸시까지 한 번에:
bash scripts/create-release.sh patch "버그 수정"
```

두 스크립트 모두 내부적으로 `node scripts/sync-version.mjs`를 호출해 `android/app/build.gradle`, `functions/api/version.ts`를 `package.json` 기준으로 동기화한다. CI(`cf-deploy.yml`, `deploy.yml`)도 빌드 직전 동일 스크립트를 한 번 더 실행해, 배포 시점에는 항상 세 곳이 일치하도록 보장한다.

업데이트 알림(`src/lib/update-checker.ts`)은 **동일 출처인 `/api/version`만 호출한다** (GitHub API 직접 호출은 CSP `connect-src 'self'`에 막히므로 사용하지 않는다).

## 배포

- **`master` 브랜치 push → `.github/workflows/cf-deploy.yml`** (실질적인 상시 배포 경로)
  1. 버전 동기화(`sync-version.mjs`)
  2. **D1 마이그레이션** (`wrangler/schema.sql`) — 실패 시 이후 단계(빌드·배포)를 중단한다
  3. `npm run build`
  4. Cloudflare Pages 배포
- **태그(`v*`) push 또는 workflow_dispatch → `.github/workflows/deploy.yml`** (릴리스 경로)
  1. 웹 빌드 (버전 동기화 포함) → Cloudflare Pages 배포 + D1 마이그레이션(실패 시 중단)
  2. Android APK 빌드 (버전 동기화 포함)
  3. GitHub Release 생성 (APK 첨부, 릴리스 노트 자동 생성)

`create-release.sh`는 `git push origin master --tags`로 두 ref를 동시에 push하므로 두 워크플로가 같은 커밋에 대해 동시에 켜질 수 있다. 둘 다 `concurrency: group: cloudflare-pages-deploy`로 묶여 있어 **동시 배포는 직렬화**된다(취소하지 않고 순서대로 대기).

### D1 마이그레이션

스키마 변경은 `wrangler/schema.sql`에 반영한다. 배포 워크플로가 매번 `wrangler d1 execute araharu-db --file=wrangler/schema.sql --remote`를 실행하므로, 컬럼 추가 등은 **기존 데이터를 깨지 않는 형태**(예: `ALTER TABLE ... ADD COLUMN` + 기본값, 또는 `CREATE TABLE IF NOT EXISTS`)로 작성해야 한다. 마이그레이션이 실패하면 배포 자체가 중단된다.

## 환경변수 / 시크릿

**GitHub Actions Secrets** (`.github/workflows/*.yml`에서 사용):

| 이름 | 용도 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Pages 배포 + D1 마이그레이션 인증 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 계정 ID |

**Cloudflare Pages 시크릿** (`wrangler secret put <이름>` 으로 등록, `wrangler.toml` 참고):

| 이름 | 용도 |
|---|---|
| `ANTHROPIC_API_KEY` | AI 문항 생성 등에서 사용하는 Claude API 키 |
| `CRON_SECRET` | 정기 실행(cron) 엔드포인트 인증 |
| `AUTH_SECRET` | 세션/인증 서명 키 |

**빌드 타임 변수** (`next.config.ts`가 자동 주입, 사람이 설정할 필요 없음): `NEXT_PUBLIC_APP_VERSION` (← `package.json` version).

## 검증 스크립트 (배포 전 필수 게이트)

문항 생성기·콘텐츠를 수정했다면 **아래를 실행해 0결함을 확인한 뒤에만 배포**한다.

```bash
npx tsx scripts/verify-math.ts       # 수학 문항 정답 기계검증 (전 학년·학기·난이도 × 다수 시드, expression 독립 재계산)
npx tsx scripts/verify-spelling.ts   # 맞춤법 문항 결정론 게이트 (조사 정합성 + 생성 가능한 전 문항 비문/판정불가 검사)
npx tsx scripts/verify-grade.ts      # 학년/학기별 일일 세트 생성 결과 요약 (과목별 문항 수 확인)
npx tsx scripts/smoke-set.ts         # 학년/학기별 일일 세트 스모크 테스트 (기대 문항 수·수학 예시 출력)
```

하나라도 결함(exit 1 또는 비정상 출력)이 나오면 원인을 해결하기 전까지 배포하지 않는다.

일반적인 타입 체크:

```bash
npx tsc --noEmit
```

## 프로젝트 구조 (요약)

```
src/app/            Next.js App Router 페이지 (student / parent / teacher / admin)
src/lib/curriculum/  학년별 교과 데이터 + 과목별 문항 생성기
src/lib/daily-set-generator.ts   학년/학기별 일일 학습 세트 생성 로직
src/components/      공용 컴포넌트
functions/           Cloudflare Pages Functions (/api/*)
android/             Android WebView 앱 래퍼
wrangler/schema.sql  D1 스키마
scripts/             버전 동기화 · 검증 · 릴리스 스크립트
```
