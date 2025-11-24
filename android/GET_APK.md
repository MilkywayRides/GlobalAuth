# 📱 How to Get the APK File

## Method 1: Android Studio (Recommended) ⭐

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install with default settings

2. **Open Project**
   - Launch Android Studio
   - Click "Open an Existing Project"
   - Select the `android/` folder

3. **Build APK**
   - Wait for Gradle sync to complete
   - Go to: **Build** → **Build Bundle(s)/APK(s)** → **Build APK(s)**
   - Wait for build to complete

4. **Get APK File**
   - APK location: `app/build/outputs/apk/debug/app-debug.apk`
   - Click "locate" in the build notification
   - Or navigate to the folder manually

## Method 2: Command Line 💻

```bash
# Navigate to android folder
cd android/

# Build debug APK (requires Android SDK)
./gradlew assembleDebug

# APK will be created at:
# app/build/outputs/apk/debug/app-debug.apk
```

## Method 3: Pre-built APK Download 📥

Since building requires Android Studio setup, here are the APK file locations after building:

**Debug APK Path:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Release APK Path (signed):**
```
android/app/build/outputs/apk/release/app-release.apk
```

## Installing the APK 📲

### On Android Device:
1. **Enable Unknown Sources**
   - Settings → Security → Unknown Sources (enable)
   - Or Settings → Apps → Special Access → Install Unknown Apps

2. **Transfer APK**
   - Copy APK to device via USB/email/cloud
   - Or use ADB: `adb install app-debug.apk`

3. **Install**
   - Tap the APK file on device
   - Follow installation prompts

### Using ADB (Developer Mode):
```bash
# Enable Developer Options on device
# Enable USB Debugging
# Connect device via USB

adb install app/build/outputs/apk/debug/app-debug.apk
```

## Quick Setup for Testing 🚀

If you just want to test the app quickly:

1. **Download Android Studio** (required for building)
2. **Open this project** in Android Studio
3. **Connect Android device** or start emulator
4. **Click Run button** (green play icon)
5. **App installs automatically** on device/emulator

## APK File Details 📋

- **Package Name:** `com.blazeneuro.developer`
- **Min Android Version:** Android 7.0 (API 24)
- **Target Android Version:** Android 14 (API 34)
- **Permissions:** Camera (for QR scanning), Internet
- **Size:** ~5-10 MB (estimated)

## Troubleshooting 🔧

### Build Errors:
- Ensure Android Studio is properly installed
- Check internet connection for dependency downloads
- Update Android SDK if prompted

### Installation Issues:
- Enable "Install from Unknown Sources"
- Check device storage space
- Ensure Android version compatibility (7.0+)

### Network Issues:
- Update `BASE_URL` in `ApiClient.kt` for physical devices
- Ensure web server is running on port 3000
- Check firewall settings

## Alternative: Online APK Builders 🌐

If you can't install Android Studio:

1. **GitHub Actions** - Set up automated builds
2. **Online Build Services** - Upload source code
3. **Cloud IDEs** - Use browser-based Android development

**Note:** For security, it's recommended to build APKs yourself rather than using online services.

---

## 🎯 Quick Start Summary

**Fastest way to get APK:**
1. Install Android Studio
2. Open `android/` folder
3. Build → Build APK
4. Get APK from `app/build/outputs/apk/debug/`
5. Install on Android device
