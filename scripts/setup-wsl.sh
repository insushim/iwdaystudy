#!/bin/bash
# WSL에서 Android APK 빌드 환경 설정
# Usage: wsl bash scripts/setup-wsl.sh
#
# 이 스크립트는 WSL Ubuntu에서 실행하세요.
# Windows에서: wsl bash scripts/setup-wsl.sh

set -e

echo "==================================="
echo " 아라하루 APK 빌드 환경 설정 (WSL)"
echo "==================================="

# 1. System packages
echo ""
echo "[1/5] 시스템 패키지 설치..."
sudo apt update -qq
sudo apt install -y -qq openjdk-17-jdk unzip wget curl > /dev/null 2>&1
echo "  JDK $(java -version 2>&1 | head -1)"

# 2. Android SDK
ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
echo ""
echo "[2/5] Android SDK 설정 ($ANDROID_HOME)..."

if [ -d "$ANDROID_HOME/cmdline-tools/latest" ]; then
    echo "  이미 설치됨 - 건너뜀"
else
    mkdir -p "$ANDROID_HOME/cmdline-tools"
    cd "$ANDROID_HOME/cmdline-tools"

    CMDTOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    echo "  다운로드: commandlinetools..."
    wget -q "$CMDTOOLS_URL" -O cmdtools.zip
    unzip -q cmdtools.zip
    mv cmdline-tools latest
    rm cmdtools.zip
    echo "  설치 완료"
fi

export ANDROID_HOME
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

# 3. Accept licenses and install SDK packages
echo ""
echo "[3/5] SDK 패키지 설치..."
yes | sdkmanager --licenses > /dev/null 2>&1 || true
sdkmanager "platforms;android-34" "build-tools;34.0.0" > /dev/null 2>&1
echo "  platforms;android-34 ✓"
echo "  build-tools;34.0.0 ✓"

# 4. Add to shell profile
echo ""
echo "[4/5] 환경변수 설정..."
PROFILE="$HOME/.bashrc"
if ! grep -q "ANDROID_HOME" "$PROFILE" 2>/dev/null; then
    cat >> "$PROFILE" << EOF

# Android SDK (added by araharu setup)
export ANDROID_HOME=\$HOME/Android/Sdk
export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools:\$ANDROID_HOME/build-tools/34.0.0
EOF
    echo "  ~/.bashrc에 ANDROID_HOME 추가됨"
else
    echo "  이미 설정됨 - 건너뜀"
fi

# 5. Verify
echo ""
echo "[5/5] 검증..."
echo "  Java: $(java -version 2>&1 | head -1)"
echo "  ANDROID_HOME: $ANDROID_HOME"
echo "  sdkmanager: $(sdkmanager --version 2>/dev/null || echo 'OK')"

echo ""
echo "==================================="
echo " 설정 완료!"
echo "==================================="
echo ""
echo " APK 빌드:"
echo "   wsl bash scripts/build-apk.sh"
echo ""
echo " 릴리스 (버전 업데이트 + 빌드 + 배포):"
echo "   wsl bash scripts/create-release.sh patch \"버그 수정\""
echo "   wsl bash scripts/create-release.sh minor \"새 기능\""
echo ""
echo " 또는 그냥 git push하면 GitHub Actions에서 자동 빌드됩니다!"
echo "==================================="
