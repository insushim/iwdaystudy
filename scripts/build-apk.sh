#!/bin/bash
# Build APK using WSL (Android SDK must be installed in WSL)
# Usage: wsl bash scripts/build-apk.sh

set -e

echo "아라하루 APK 빌드 시작..."

# Navigate to android directory
cd "$(dirname "$0")/../android"

# Check if ANDROID_HOME is set
if [ -z "$ANDROID_HOME" ]; then
    export ANDROID_HOME=$HOME/Android/Sdk
    echo "ANDROID_HOME set to $ANDROID_HOME"
fi

# Check if gradle wrapper exists, if not create it
if [ ! -f "gradlew" ]; then
    echo "Generating Gradle wrapper..."
    gradle wrapper --gradle-version 8.2
fi

chmod +x gradlew

# Clean and build release APK
echo "Building release APK..."
./gradlew clean assembleRelease

# Copy APK to output
APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
OUTPUT_PATH="../dist/araharu.apk"

mkdir -p ../dist

if [ -f "$APK_PATH" ]; then
    cp "$APK_PATH" "$OUTPUT_PATH"
    echo "APK 빌드 완료: $OUTPUT_PATH"
    echo "파일 크기: $(du -h $OUTPUT_PATH | cut -f1)"
else
    echo "APK 빌드 실패"
    exit 1
fi
