# BlazeNeuro Developer Android App

Android companion app for testing authentication and QR code login with the BlazeNeuro Developer Portal.

## Features

- **Email/Password Authentication**: Login and signup using the same database as web app
- **QR Code Scanner**: Scan QR codes from web browser for instant login
- **Material Design 3**: Modern UI following Android design guidelines
- **Session Management**: Persistent login sessions with secure storage

## Setup

### Prerequisites
- Android Studio Arctic Fox or later
- Android SDK 24+ (Android 7.0)
- Device or emulator with camera for QR scanning

### Installation

1. **Open in Android Studio**:
   ```bash
   cd android
   # Open this folder in Android Studio
   ```

2. **Configure API URL**:
   - For emulator: Uses `http://10.0.2.2:3000` (localhost)
   - For physical device: Update `BASE_URL` in `ApiClient.kt` to your computer's IP

3. **Build and Run**:
   - Click "Run" in Android Studio
   - Or use command line: `./gradlew installDebug`

## Usage

### Testing Authentication
1. **Create Account**: Use signup screen to create new account
2. **Login**: Use existing credentials from web app
3. **QR Login**: Scan QR code from web browser login page

### QR Code Flow
1. Open web browser to `http://localhost:3000/login`
2. Click "QR Code" tab to generate QR code
3. Open Android app and tap "Scan QR Code"
4. Point camera at QR code on screen
5. Confirm login on mobile device
6. Web browser automatically logs in

## API Endpoints

The app connects to these endpoints:
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/qr/status/{sessionId}` - Confirm QR login
- `GET /api/auth/qr/status/{sessionId}` - Check QR status

## Architecture

```
app/
├── api/                 # Retrofit API interfaces
├── utils/              # Utilities (PreferenceManager)
├── MainActivity.kt     # Landing screen
├── LoginActivity.kt    # Email/password login
├── SignupActivity.kt   # Account creation
├── QRScanActivity.kt   # QR code scanner
└── DashboardActivity.kt # User dashboard
```

## Dependencies

- **Retrofit**: HTTP client for API calls
- **ZXing**: QR code scanning
- **Material Components**: UI components
- **Kotlin Coroutines**: Async operations

## Network Configuration

### Emulator
- Uses `10.0.2.2:3000` to access host machine's localhost
- No additional configuration needed

### Physical Device
1. Connect device to same WiFi as development machine
2. Find your computer's IP address:
   ```bash
   # Linux/Mac
   ifconfig | grep inet
   
   # Windows
   ipconfig
   ```
3. Update `BASE_URL` in `ApiClient.kt`:
   ```kotlin
   private const val BASE_URL = "http://YOUR_IP:3000/"
   ```

## Testing

1. **Start Web Server**: Ensure Next.js app is running on port 3000
2. **Test Login**: Create account on web, login on mobile
3. **Test QR Flow**: Generate QR on web, scan with mobile
4. **Verify Database**: Check that same user appears in both web and mobile

## Troubleshooting

### Network Issues
- Ensure web server is running on port 3000
- Check firewall allows connections on port 3000
- Verify device and computer are on same network

### QR Scanning Issues
- Grant camera permission to app
- Ensure good lighting when scanning
- QR code should be clearly visible on screen

### Authentication Issues
- Check API endpoints are responding
- Verify database connection in web app
- Check Android logs for error details

## Production Deployment

For production use:
1. Update `BASE_URL` to production server
2. Add proper SSL certificate handling
3. Implement proper token refresh logic
4. Add error handling and retry mechanisms
5. Enable ProGuard for code obfuscation
