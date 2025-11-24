#!/bin/bash

echo "🔨 Manual APK Build Process"
echo "=========================="

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
echo "Java version: $JAVA_VERSION"

if [ "$JAVA_VERSION" -gt "17" ]; then
    echo "⚠️  Java $JAVA_VERSION detected. Android build requires Java 8-17."
    echo ""
    echo "🔧 Solutions:"
    echo "1. Install Java 17: sudo apt install openjdk-17-jdk"
    echo "2. Use JAVA_HOME: export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64"
    echo "3. Use Android Studio (handles Java automatically)"
    echo ""
fi

# Check for Android SDK
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME not set"
    echo ""
    echo "📋 To build APK manually:"
    echo "1. Download Android SDK Command Line Tools"
    echo "2. Set ANDROID_HOME environment variable"
    echo "3. Install build-tools and platform"
    echo ""
    echo "🚀 Easier option: Use Android Studio"
    echo "   - Download: https://developer.android.com/studio"
    echo "   - Open project folder"
    echo "   - Build → Build APK"
    echo ""
else
    echo "✅ ANDROID_HOME: $ANDROID_HOME"
fi

# Create a simple APK info file
cat > APK_INFO.txt << EOF
📱 BlazeNeuro Developer APK Information
=====================================

Package Name: com.blazeneuro.developer
App Name: BlazeNeuro Developer
Version: 1.0 (1)
Min SDK: 24 (Android 7.0)
Target SDK: 34 (Android 14)

Features:
✅ Email/Password Login
✅ Account Registration  
✅ QR Code Scanner
✅ User Dashboard
✅ Session Management
✅ API Integration

Build Requirements:
- Java 8-17 (currently: $JAVA_VERSION)
- Android SDK
- Gradle 8.0

APK Size (estimated): 8-12 MB

To build:
1. Install Android Studio
2. Open this project folder
3. Build → Build Bundle(s)/APK(s) → Build APK(s)
4. APK location: app/build/outputs/apk/debug/app-debug.apk

Alternative: Direct install via Android Studio (no APK file needed)
EOF

echo "📄 Created APK_INFO.txt with build details"
echo ""
echo "🎯 Recommended: Use Android Studio for easiest APK build"
echo "   Download: https://developer.android.com/studio"
