#!/bin/bash

echo "🔨 Building BlazeNeuro Developer APK..."

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME not set. Please install Android Studio first."
    echo ""
    echo "📋 To build APK, you need:"
    echo "1. Install Android Studio"
    echo "2. Set ANDROID_HOME environment variable"
    echo "3. Run this script again"
    echo ""
    echo "🔗 Alternative methods to get APK:"
    echo ""
    echo "Method 1 - Android Studio (Recommended):"
    echo "1. Open Android Studio"
    echo "2. Import this project folder"
    echo "3. Build → Build Bundle(s)/APK(s) → Build APK(s)"
    echo "4. APK will be in: app/build/outputs/apk/debug/"
    echo ""
    echo "Method 2 - Command Line (if Android SDK installed):"
    echo "cd android/"
    echo "./gradlew assembleDebug"
    echo ""
    echo "Method 3 - GitHub Actions (CI/CD):"
    echo "Push to GitHub and use automated build"
    exit 1
fi

echo "✅ Android SDK found at: $ANDROID_HOME"

# Build debug APK
echo "🔨 Building debug APK..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ APK built successfully!"
    echo ""
    echo "📱 APK Location:"
    echo "app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "📋 Install on device:"
    echo "adb install app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "🔗 Or drag & drop the APK file to your Android device"
else
    echo "❌ Build failed. Check Android Studio for detailed errors."
fi
