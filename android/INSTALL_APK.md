# Install APK on Android Device

## Method 1: ADB over WiFi (Recommended)

### Step 1: Enable Developer Options on Android
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Enable **Wireless Debugging** (Android 11+)

### Step 2: Connect via WiFi

#### For Android 11+ (Wireless Debugging):
1. On your phone: **Settings** → **Developer Options** → **Wireless Debugging**
2. Tap **Pair device with pairing code**
3. Note the IP address and port (e.g., 192.168.1.100:37891)

On your computer:
```bash
# Pair device (use the pairing code from phone)
adb pair 192.168.1.100:37891

# Connect to device
adb connect 192.168.1.100:5555

# Verify connection
adb devices
```

#### For Android 10 and below:
1. Connect phone via USB cable first
2. Enable USB Debugging
3. Run:
```bash
adb tcpip 5555
adb connect <phone-ip>:5555
# Now disconnect USB cable
```

### Step 3: Install APK
```bash
cd /home/ankit/Documents/Code/auth/android
adb install -r apk/v1.0.0/blazeneuro-mobile-v1.0.0-oauth-final.apk
```

## Method 2: Direct File Transfer

### Via File Manager:
1. Copy APK to phone via USB/WiFi
2. Open file manager on phone
3. Tap the APK file
4. Allow "Install from Unknown Sources" if prompted
5. Tap Install

### Quick Transfer:
```bash
# If device is connected
adb push apk/v1.0.0/blazeneuro-mobile-v1.0.0-oauth-final.apk /sdcard/Download/
```

Then open Downloads folder on phone and tap the APK.

## Method 3: QR Code / Link

Upload APK to cloud storage and scan QR code on phone to download.

## Troubleshooting

### Device not showing up:
```bash
# Restart ADB server
adb kill-server
adb start-server
adb devices
```

### Permission denied:
- Check if USB Debugging is enabled
- Accept the authorization prompt on phone
- Try revoking and re-authorizing USB debugging

### Install failed:
```bash
# Uninstall old version first
adb uninstall com.blazeneuro.developer

# Then install
adb install -r apk/v1.0.0/blazeneuro-mobile-v1.0.0-oauth-final.apk
```

## Quick Commands

```bash
# Check connected devices
adb devices

# Install APK
adb install -r apk/v1.0.0/blazeneuro-mobile-v1.0.0-oauth-final.apk

# Uninstall app
adb uninstall com.blazeneuro.developer

# View logs
adb logcat | grep BlazeNeuro

# Take screenshot
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png
```
