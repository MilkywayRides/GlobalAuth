# BlazeNeuro Mobile v1.0.0

## Features
- ✅ Splash screen with animation
- ✅ Onboarding (3 screens, shown once)
- ✅ OAuth authentication with secure storage
- ✅ Light/dark theme support
- ✅ Network connectivity check
- ✅ User dashboard with logout

## Security
- 🔒 Android Keystore encryption
- 🔒 AES-256 secure storage
- 🔒 ProGuard code obfuscation
- 🔒 OAuth 2.0 with PKCE
- 🔒 HTTPS only (production ready)

## Installation
```bash
adb install blazeneuro-mobile-v1.0.0-production.apk
```

## Production Configuration
- **API URL**: https://developer.blazeneuro.com
- **Client ID**: `bn_b1ee0548f8d4488542f8d4d8f38d0a63`
- **Redirect URI**: `blazeneuro://auth`
- **Deep Link**: Supported

## Requirements
- Android 7.0+ (API 24)
- Internet connection
- Camera permission (for QR scanning)

## Files
- `blazeneuro-mobile-v1.0.0.apk` - Development version (localhost)
- `blazeneuro-mobile-v1.0.0-production.apk` - Production version (developer.blazeneuro.com)
