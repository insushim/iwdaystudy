#!/bin/bash
# 간편 릴리스 스크립트 - 버전 업데이트 → 커밋 → 태그 → 푸시
# GitHub Actions가 자동으로: 웹 배포 + APK 빌드 + GitHub Release 생성
#
# Usage:
#   bash scripts/create-release.sh                    # patch 자동 증가
#   bash scripts/create-release.sh patch "버그 수정"   # patch + 설명
#   bash scripts/create-release.sh minor "새 기능"     # minor bump
#   bash scripts/create-release.sh major "대규모 변경" # major bump
#   bash scripts/create-release.sh v2.0.0 "설명"      # 직접 지정

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# === Get current version ===
get_current_version() {
    node -p "require('./package.json').version"
}

get_current_code() {
    grep 'versionCode' android/app/build.gradle | head -1 | sed 's/[^0-9]//g'
}

bump_version() {
    local current=$1 type=$2
    local major minor patch
    IFS='.' read -r major minor patch <<< "$current"
    case $type in
        major) major=$((major + 1)); minor=0; patch=0 ;;
        minor) minor=$((minor + 1)); patch=0 ;;
        patch|*) patch=$((patch + 1)) ;;
    esac
    echo "${major}.${minor}.${patch}"
}

CURRENT_VERSION=$(get_current_version)
CURRENT_CODE=$(get_current_code)

# Determine version
case "${1:-patch}" in
    v*) VERSION_NUM="${1#v}" ;;
    major|minor|patch) VERSION_NUM=$(bump_version "$CURRENT_VERSION" "$1") ;;
    *) VERSION_NUM=$(bump_version "$CURRENT_VERSION" "patch") ;;
esac

VERSION="v${VERSION_NUM}"
NEW_CODE=$((CURRENT_CODE + 1))
NOTES=${2:-"아라하루 ${VERSION} 업데이트"}

echo "==================================="
echo " 아라하루 릴리스: ${VERSION}"
echo "==================================="
echo " 현재: v${CURRENT_VERSION} (code ${CURRENT_CODE})"
echo " 새로: v${VERSION_NUM} (code ${NEW_CODE})"
echo ""

# === Update version in all files ===
echo "[1/4] 버전 업데이트..."

# package.json
node -e "
const pkg = require('./package.json');
pkg.version = '${VERSION_NUM}';
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# update-checker.ts - now reads from env, no hardcoded version to update

# service worker
sed -i "s/const APP_VERSION = .*/const APP_VERSION = \"${VERSION_NUM}\";/" public/sw.js

# Android build.gradle
sed -i "s/versionCode ${CURRENT_CODE}/versionCode ${NEW_CODE}/" android/app/build.gradle
sed -i "s/versionName \"${CURRENT_VERSION}\"/versionName \"${VERSION_NUM}\"/" android/app/build.gradle

echo "  package.json:  ${VERSION_NUM}"
echo "  sw.js:         ${VERSION_NUM}"
echo "  android:       ${VERSION_NUM} (code ${NEW_CODE})"

# === Git commit ===
echo ""
echo "[2/4] Git 커밋..."
git add package.json public/sw.js android/app/build.gradle
git add -A  # Include any other changes
git commit -m "$(cat <<EOF
release: ${VERSION}

${NOTES}

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)" 2>/dev/null || echo "  변경사항 없음 - 건너뜀"

# === Create tag ===
echo ""
echo "[3/4] Git 태그: ${VERSION}"
git tag -a "$VERSION" -m "$NOTES" 2>/dev/null || {
    echo "  [WARN] 태그 ${VERSION}이 이미 존재합니다. 재생성합니다."
    git tag -d "$VERSION" 2>/dev/null
    git tag -a "$VERSION" -m "$NOTES"
}

# === Push ===
echo ""
echo "[4/4] Push..."
echo "  master 브랜치 + 태그를 push하면 GitHub Actions가 자동으로:"
echo "    1. Cloudflare Pages에 웹 배포 + D1 마이그레이션"
echo "    2. Android APK 빌드"
echo "    3. GitHub Release 생성 (APK 첨부)"
echo "    4. 앱에서 업데이트 감지"
echo ""

read -p "push 하시겠습니까? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin master --tags
    echo ""
    echo "==================================="
    echo " Push 완료! GitHub Actions 실행 중..."
    echo "==================================="
    echo " 확인: https://github.com/insushim/iwdaystudy/actions"
    echo " 릴리스: https://github.com/insushim/iwdaystudy/releases"
else
    echo ""
    echo "==================================="
    echo " 준비 완료! 아래 명령으로 push하세요:"
    echo "==================================="
    echo "  git push origin master --tags"
fi
