#!/bin/bash
# Bump version across all files, commit, tag, and push
# Usage: bash scripts/bump-version.sh 1.2.0 "릴리스 설명"
# This triggers GitHub Actions: build → deploy → APK → release

set -e

NEW_VERSION=${1:?"Usage: bash scripts/bump-version.sh <version> [notes]"}
NOTES=${2:-"아라하루 v${NEW_VERSION} 업데이트"}
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== 아라하루 v${NEW_VERSION} 버전 업데이트 ==="

# 1. package.json
echo "→ package.json"
cd "$ROOT_DIR"
node -e "
const pkg = require('./package.json');
pkg.version = '${NEW_VERSION}';
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# 2. update-checker.ts
echo "→ src/lib/update-checker.ts"
sed -i "s/const CURRENT_VERSION = '.*'/const CURRENT_VERSION = '${NEW_VERSION}'/" src/lib/update-checker.ts

# 3. service worker
echo "→ public/sw.js"
sed -i "s/const APP_VERSION = .*/const APP_VERSION = '${NEW_VERSION}';/" public/sw.js

# 4. Cloudflare version API
echo "→ functions/api/version.ts"
sed -i "s/version: [\"'].*[\"']/version: '${NEW_VERSION}'/" functions/api/version.ts
sed -i "s/minVersion: [\"'].*[\"']/minVersion: '${NEW_VERSION}'/" functions/api/version.ts

# 5. Android versionName + versionCode
echo "→ android/app/build.gradle"
# Increment versionCode by extracting current and adding 1
CURRENT_CODE=$(grep "versionCode" android/app/build.gradle | grep -o '[0-9]*')
NEW_CODE=$((CURRENT_CODE + 1))
sed -i "s/versionCode ${CURRENT_CODE}/versionCode ${NEW_CODE}/" android/app/build.gradle
sed -i "s/versionName \".*\"/versionName \"${NEW_VERSION}\"/" android/app/build.gradle

echo ""
echo "=== 버전 업데이트 완료 ==="
echo "  package.json:        ${NEW_VERSION}"
echo "  update-checker.ts:   ${NEW_VERSION}"
echo "  sw.js:               ${NEW_VERSION}"
echo "  version API:         ${NEW_VERSION}"
echo "  android versionName: ${NEW_VERSION}"
echo "  android versionCode: ${NEW_CODE}"
echo ""

# 6. Git commit + tag + push
echo "→ Git commit & tag..."
git add -A
git commit -m "release: v${NEW_VERSION}

${NOTES}"

git tag -a "v${NEW_VERSION}" -m "${NOTES}"

echo ""
echo "=== 준비 완료! ==="
echo "아래 명령으로 push하면 자동 배포됩니다:"
echo ""
echo "  git push origin master --tags"
echo ""
echo "이 명령은 자동으로:"
echo "  1. Cloudflare Pages에 웹 배포"
echo "  2. D1 데이터베이스 마이그레이션"
echo "  3. Android APK 빌드"
echo "  4. GitHub Release 생성 (APK 첨부)"
echo ""
echo "앱에서는 GitHub Releases를 체크해 업데이트를 감지합니다."
