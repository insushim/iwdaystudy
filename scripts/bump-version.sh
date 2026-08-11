#!/bin/bash
# 버전만 업데이트 (커밋/태그 없이)
# Usage: bash scripts/bump-version.sh 1.2.0
# 릴리스까지 하려면: bash scripts/create-release.sh patch "설명"

set -e

NEW_VERSION=${1:?"Usage: bash scripts/bump-version.sh <version>"}
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "=== 버전 업데이트: v${NEW_VERSION} ==="

# 1. package.json
node -e "
const pkg = require('./package.json');
pkg.version = '${NEW_VERSION}';
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"
echo "  package.json: ${NEW_VERSION}"

# 2. service worker
# -i.bak 사용: macOS(BSD sed)와 Linux(GNU sed) 모두에서 동작한다 (-i만 쓰면 macOS에서 실패함)
sed -i.bak "s/const APP_VERSION = .*/const APP_VERSION = \"${NEW_VERSION}\";/" public/sw.js
rm -f public/sw.js.bak
echo "  sw.js: ${NEW_VERSION}"

# 3. android/app/build.gradle + functions/api/version.ts
#    package.json(위에서 이미 갱신됨)을 진실원으로 삼아 동기화한다.
#    (과거엔 android만 sed로 갱신하고 functions/api/version.ts는 누락돼
#     3곳의 버전이 서로 어긋났음 — scripts/sync-version.mjs 로 일원화)
node scripts/sync-version.mjs

echo ""
echo "=== 완료 ==="
echo "커밋하려면: git add -A && git commit -m 'chore: bump to v${NEW_VERSION}'"
