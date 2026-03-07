#!/bin/bash
# Build APK using WSL (Android SDK must be installed in WSL)
# Usage: wsl bash scripts/build-apk.sh
#
# Prerequisites (WSL Ubuntu):
#   sudo apt update && sudo apt install -y openjdk-17-jdk unzip wget
#   # Android SDK setup:
#   mkdir -p ~/Android/Sdk/cmdline-tools
#   cd ~/Android/Sdk/cmdline-tools
#   wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
#   unzip commandlinetools-linux-11076708_latest.zip
#   mv cmdline-tools latest
#   export ANDROID_HOME=$HOME/Android/Sdk
#   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
#   yes | sdkmanager --licenses
#   sdkmanager "platforms;android-34" "build-tools;34.0.0"

set -e

echo "==================================="
echo " 아라하루 APK 빌드 (WSL)"
echo "==================================="

# Navigate to android directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT/android"

# Check if ANDROID_HOME is set
if [ -z "$ANDROID_HOME" ]; then
    export ANDROID_HOME=$HOME/Android/Sdk
    echo "[INFO] ANDROID_HOME set to $ANDROID_HOME"
fi

# Verify Android SDK exists
if [ ! -d "$ANDROID_HOME/platforms" ]; then
    echo "[ERROR] Android SDK not found at $ANDROID_HOME"
    echo ""
    echo "설치 방법:"
    echo "  1. sudo apt install -y openjdk-17-jdk unzip wget"
    echo "  2. mkdir -p ~/Android/Sdk/cmdline-tools && cd ~/Android/Sdk/cmdline-tools"
    echo "  3. wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    echo "  4. unzip commandlinetools-linux-11076708_latest.zip && mv cmdline-tools latest"
    echo "  5. export ANDROID_HOME=\$HOME/Android/Sdk"
    echo "  6. \$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager 'platforms;android-34' 'build-tools;34.0.0'"
    exit 1
fi

export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/34.0.0

# Check if gradle wrapper exists, if not create it
if [ ! -f "gradlew" ]; then
    echo "[INFO] Generating Gradle wrapper..."
    if command -v gradle &> /dev/null; then
        gradle wrapper --gradle-version 8.2
    else
        echo "[INFO] Downloading Gradle wrapper directly..."
        mkdir -p gradle/wrapper
        cat > gradle/wrapper/gradle-wrapper.properties << 'PROPS'
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.2-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
PROPS
        # Download gradle-wrapper.jar
        wget -q -O gradle/wrapper/gradle-wrapper.jar \
            "https://raw.githubusercontent.com/gradle/gradle/v8.2.0/gradle/wrapper/gradle-wrapper.jar" || {
            echo "[ERROR] Gradle wrapper 다운로드 실패. gradle을 설치하세요: sudo apt install gradle"
            exit 1
        }
        cat > gradlew << 'GRADLEW'
#!/bin/sh
exec java -jar "$(dirname "$0")/gradle/wrapper/gradle-wrapper.jar" "$@"
GRADLEW
    fi
fi

chmod +x gradlew

# Read version from build.gradle
VERSION_NAME=$(grep 'versionName' app/build.gradle | head -1 | sed 's/.*"\(.*\)".*/\1/')
VERSION_CODE=$(grep 'versionCode' app/build.gradle | head -1 | sed 's/[^0-9]//g')
echo "[INFO] Building v${VERSION_NAME} (code: ${VERSION_CODE})"

# Clean and build release APK
echo "[BUILD] Building release APK..."
./gradlew clean assembleRelease 2>&1

# Find APK
APK_PATH=$(find app/build/outputs/apk/release -name "*.apk" 2>/dev/null | head -1)

if [ -z "$APK_PATH" ]; then
    echo "[ERROR] APK 빌드 실패 - APK 파일을 찾을 수 없습니다"
    exit 1
fi

# Copy APK to output with version name
OUTPUT_DIR="$PROJECT_ROOT/dist"
OUTPUT_PATH="$OUTPUT_DIR/araharu-v${VERSION_NAME}.apk"
mkdir -p "$OUTPUT_DIR"
cp "$APK_PATH" "$OUTPUT_PATH"

# Also copy as latest
cp "$APK_PATH" "$OUTPUT_DIR/araharu.apk"

echo ""
echo "==================================="
echo " APK 빌드 완료!"
echo "==================================="
echo " 파일: $OUTPUT_PATH"
echo " 크기: $(du -h "$OUTPUT_PATH" | cut -f1)"
echo " 버전: v${VERSION_NAME} (${VERSION_CODE})"
echo ""
echo " 다음 단계:"
echo "   bash scripts/create-release.sh v${VERSION_NAME}"
echo "==================================="
