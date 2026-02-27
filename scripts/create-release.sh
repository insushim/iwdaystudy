#!/bin/bash
# Create a new GitHub Release with APK
# Usage: bash scripts/create-release.sh v1.0.1 "Release notes here"

set -e

VERSION=${1:-"v1.0.0"}
NOTES=${2:-"아라하루 업데이트"}
APK_PATH="dist/araharu.apk"

echo "아라하루 v${VERSION} 릴리스 생성..."

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    echo "APK 파일이 없습니다. 먼저 build-apk.sh를 실행하세요."
    exit 1
fi

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh)가 필요합니다. https://cli.github.com/"
    exit 1
fi

# Create git tag
git tag -a "$VERSION" -m "$NOTES" 2>/dev/null || echo "Tag already exists"
git push origin "$VERSION" 2>/dev/null || echo "Tag already pushed"

# Create release with APK
gh release create "$VERSION" \
    --title "아라하루 ${VERSION}" \
    --notes "$NOTES" \
    "$APK_PATH#아라하루-${VERSION}.apk"

echo "릴리스 생성 완료: $VERSION"
echo "https://github.com/insushim/iwdaystudy/releases/tag/${VERSION}"
