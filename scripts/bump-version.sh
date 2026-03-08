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
sed -i "s/const APP_VERSION = .*/const APP_VERSION = \"${NEW_VERSION}\";/" public/sw.js
echo "  sw.js: ${NEW_VERSION}"

# 3. Android versionName + versionCode
CURRENT_CODE=$(grep "versionCode" android/app/build.gradle | head -1 | sed 's/[^0-9]//g')
NEW_CODE=$((CURRENT_CODE + 1))
sed -i "s/versionCode ${CURRENT_CODE}/versionCode ${NEW_CODE}/" android/app/build.gradle
sed -i "s/versionName \".*\"/versionName \"${NEW_VERSION}\"/" android/app/build.gradle
echo "  android: ${NEW_VERSION} (code ${NEW_CODE})"

echo ""
echo "=== 완료 ==="
echo "커밋하려면: git add -A && git commit -m 'chore: bump to v${NEW_VERSION}'"
