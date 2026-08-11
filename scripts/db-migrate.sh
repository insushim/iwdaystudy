#!/bin/bash
# D1 스키마를 원격(프로덕션) DB에 적용한다.
#
# CI(cf-deploy.yml)에서 자동으로 돌리지 않는 이유:
#   GitHub Actions 의 CLOUDFLARE_API_TOKEN 에 D1:Edit 권한이 없어
#   `d1 execute --remote` 가 Authentication error [code: 10000] 로 실패하고,
#   그 때문에 사이트 배포 전체가 막힌다(2026-08-12 실측).
#
# 그래서 스키마를 바꿨으면 **배포 전에 로컬에서 이 스크립트를 먼저 돌린다.**
#   bash scripts/db-migrate.sh            # 원격(프로덕션)
#   bash scripts/db-migrate.sh --local    # 로컬 개발 DB
#
# wrangler.toml 의 schema.sql 은 CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT
# EXISTS 만 쓰므로 여러 번 돌려도 안전하다(멱등).
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

TARGET="--remote"
LABEL="원격(프로덕션)"
if [ "${1:-}" = "--local" ]; then
  TARGET="--local"
  LABEL="로컬 개발"
fi

echo "=== D1 스키마 적용: ${LABEL} ==="
npx wrangler d1 execute araharu-db --file=wrangler/schema.sql "$TARGET"
echo "=== 완료 ==="
echo "테이블 확인:"
npx wrangler d1 execute araharu-db "$TARGET" \
  --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
