#!/bin/bash

echo "🔍 Checking for connected devices..."
adb devices

echo ""
echo "📱 Installing BlazeNeuro APK..."
adb install -r apk/v1.0.0/blazeneuro-mobile-v1.0.0-oauth-final.apk

if [ $? -eq 0 ]; then
    echo "✅ APK installed successfully!"
    echo "🚀 Launching app..."
    adb shell am start -n com.blazeneuro.developer/.auth.SplashActivity
else
    echo "❌ Installation failed. Make sure device is connected."
    echo ""
    echo "To connect via WiFi:"
    echo "1. Enable Wireless Debugging on your phone"
    echo "2. Run: adb pair <ip>:<port>"
    echo "3. Run: adb connect <ip>:5555"
fi
