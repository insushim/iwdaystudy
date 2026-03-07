#!/bin/bash
# Create a new GitHub Release with APK and auto-update version
# Usage: bash scripts/create-release.sh [version] [notes]
# Examples:
#   bash scripts/create-release.sh v1.1.0 "새로운 콘텐츠 추가"
#   bash scripts/create-release.sh patch "버그 수정"        # auto-bump patch
#   bash scripts/create-release.sh minor "새 기능 추가"      # auto-bump minor

set -e

# === Version bumping ===
get_current_version() {
    grep 'versionName' android/app/build.gradle | head -1 | sed 's/.*"\(.*\)".*/\1/'
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
    v*) VERSION="$1" ;;
    major|minor|patch)
        NEW_VER=$(bump_version "$CURRENT_VERSION" "$1")
        VERSION="v${NEW_VER}"
        ;;
    *) VERSION="v${1:-$(bump_version "$CURRENT_VERSION" "patch")}" ;;
esac

VERSION_NUM=${VERSION#v}
NEW_CODE=$((CURRENT_CODE + 1))
NOTES=${2:-"아라하루 ${VERSION} 업데이트"}

echo "==================================="
echo " 아라하루 릴리스: ${VERSION}"
echo "==================================="
echo " 현재: v${CURRENT_VERSION} (${CURRENT_CODE})"
echo " 새로: v${VERSION_NUM} (${NEW_CODE})"
echo ""

# === Update version in files ===
echo "[1/6] 버전 업데이트..."

# Update Android build.gradle
sed -i "s/versionCode ${CURRENT_CODE}/versionCode ${NEW_CODE}/" android/app/build.gradle
sed -i "s/versionName \"${CURRENT_VERSION}\"/versionName \"${VERSION_NUM}\"/" android/app/build.gradle

# Update update-checker.ts
sed -i "s/const CURRENT_VERSION = '${CURRENT_VERSION}'/const CURRENT_VERSION = '${VERSION_NUM}'/" src/lib/update-checker.ts

# Update service worker version
sed -i "s/const APP_VERSION = \"${CURRENT_VERSION}\"/const APP_VERSION = \"${VERSION_NUM}\"/" public/sw.js

# Update package.json version
sed -i "s/\"version\": \"${CURRENT_VERSION}\"/\"version\": \"${VERSION_NUM}\"/" package.json

echo "  build.gradle: v${VERSION_NUM} (code ${NEW_CODE})"
echo "  update-checker.ts: ${VERSION_NUM}"
echo "  sw.js: ${VERSION_NUM}"
echo "  package.json: ${VERSION_NUM}"

# === Build web ===
echo ""
echo "[2/6] 웹 빌드..."
npm run build 2>&1 | tail -3

# === Build APK (if WSL available) ===
APK_PATH=""
echo ""
echo "[3/6] APK 빌드..."
if command -v wsl &> /dev/null || [ "$(uname -s)" = "Linux" ]; then
    if [ "$(uname -s)" = "Linux" ]; then
        bash scripts/build-apk.sh
    else
        wsl bash scripts/build-apk.sh
    fi
    APK_PATH="dist/araharu-v${VERSION_NUM}.apk"
    if [ ! -f "$APK_PATH" ]; then
        APK_PATH="dist/araharu.apk"
    fi
else
    echo "  [WARN] WSL 없음 - APK는 GitHub Actions에서 빌드됩니다"
fi

# === Git commit ===
echo ""
echo "[4/6] Git 커밋..."
git add -A
git commit -m "$(cat <<EOF
release: ${VERSION}

${NOTES}

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)" 2>/dev/null || echo "  변경사항 없음"

# === Create tag ===
echo ""
echo "[5/6] Git 태그 생성..."
git tag -a "$VERSION" -m "$NOTES" 2>/dev/null || {
    echo "  [WARN] 태그 ${VERSION}이 이미 존재합니다"
}

# === Push & Release ===
echo ""
echo "[6/6] Push & Release..."

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "  [INFO] GitHub CLI (gh) 없음 - 수동으로 push 후 릴리스하세요:"
    echo "    git push origin master"
    echo "    git push origin ${VERSION}"
    echo "  → CI/CD가 자동으로 릴리스를 생성합니다"
    exit 0
fi

echo "  Push to origin..."
git push origin master 2>/dev/null
git push origin "$VERSION" 2>/dev/null

# Create release
RELEASE_ARGS=(
    "$VERSION"
    --title "아라하루 ${VERSION}"
    --notes "$(cat <<EOF
## 아라하루 ${VERSION}

${NOTES}

### 설치 방법
- **Android**: 아래 APK 파일을 다운로드하여 설치하세요
- **iOS**: https://araharu.pages.dev → 공유(□↑) → "홈 화면에 추가"
- **웹**: https://araharu.pages.dev

### 업데이트
- Android 앱: 자동으로 업데이트를 감지합니다
- iOS/웹: 새로고침 시 자동 업데이트
EOF
)"
)

if [ -f "$APK_PATH" ]; then
    RELEASE_ARGS+=("$APK_PATH#아라하루-${VERSION}.apk")
fi

gh release create "${RELEASE_ARGS[@]}"

echo ""
echo "==================================="
echo " 릴리스 완료: ${VERSION}"
echo "==================================="
echo " https://github.com/insushim/iwdaystudy/releases/tag/${VERSION}"
echo ""
echo " 앱에서 자동 업데이트 알림이 표시됩니다!"
echo "==================================="
