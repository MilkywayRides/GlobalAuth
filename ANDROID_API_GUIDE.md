# Android API Integration Guide

## Overview

This guide covers the secure API system for Android authentication with social login support.

## Backend API Endpoints

### 1. Login
```
POST /api/mobile/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "session_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "image": "https://..."
  }
}
```

### 2. Signup
```
POST /api/mobile/auth/signup
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}

Response: Same as login
```

### 3. Verify Token
```
POST /api/mobile/auth/verify
Authorization: Bearer <token>

Response:
{
  "valid": true,
  "user": { ... }
}
```

### 4. Social Auth URL
```
GET /api/mobile/auth/social?provider=google

Response:
{
  "authUrl": "https://your-domain.com/api/auth/signin/google"
}
```

### 5. Refresh Token
```
POST /api/mobile/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}

Response: Same as login
```

## Android Implementation

### 1. Add Dependencies

Update `android/app/build.gradle`:

```gradle
dependencies {
    // Security for encrypted storage
    implementation 'androidx.security:security-crypto:1.1.0-alpha06'
    
    // Coroutines for async operations
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    
    // Browser for OAuth
    implementation 'androidx.browser:browser:1.7.0'
    
    // Lifecycle
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
}
```

### 2. Update AndroidManifest.xml

Add internet permission and deep link handling:

```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application>
        <activity android:name=".auth.NewAuthActivity">
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="blazeneuro"
                    android:host="auth" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### 3. Usage Examples

#### Email/Password Login
```kotlin
val apiClient = AuthApiClient(context)

CoroutineScope(Dispatchers.Main).launch {
    val result = apiClient.login("user@example.com", "password123")
    
    result.onSuccess { authResponse ->
        // Token is automatically saved
        println("Logged in: ${authResponse.user.name}")
    }.onFailure { error ->
        println("Login failed: ${error.message}")
    }
}
```

#### Email/Password Signup
```kotlin
CoroutineScope(Dispatchers.Main).launch {
    val result = apiClient.signup("John Doe", "user@example.com", "password123")
    
    result.onSuccess { authResponse ->
        println("Signed up: ${authResponse.user.name}")
    }
}
```

#### Google Login
```kotlin
val socialAuthManager = SocialAuthManager(context)

CoroutineScope(Dispatchers.Main).launch {
    val result = socialAuthManager.startGoogleAuth()
    
    result.onSuccess { authUrl ->
        // Opens Chrome Custom Tab
        socialAuthManager.openAuthUrl(authUrl)
    }
}
```

#### GitHub Login
```kotlin
CoroutineScope(Dispatchers.Main).launch {
    val result = socialAuthManager.startGithubAuth()
    
    result.onSuccess { authUrl ->
        socialAuthManager.openAuthUrl(authUrl)
    }
}
```

#### Verify Token
```kotlin
CoroutineScope(Dispatchers.Main).launch {
    val result = apiClient.verifyToken()
    
    result.onSuccess { user ->
        println("Token valid for: ${user.name}")
    }.onFailure {
        // Token invalid, redirect to login
    }
}
```

#### Check Login Status
```kotlin
if (apiClient.isLoggedIn()) {
    // User is logged in
} else {
    // Show login screen
}
```

#### Logout
```kotlin
apiClient.logout()
```

## Security Features

### 1. Encrypted Token Storage
- Uses Android EncryptedSharedPreferences
- AES-256-GCM encryption
- Secure key management with MasterKey

### 2. HTTPS Only
- All API calls use HTTPS
- Certificate pinning recommended for production

### 3. Token-Based Authentication
- Secure session tokens
- Automatic token storage
- Token verification on each request

### 4. OAuth 2.0 Social Login
- Chrome Custom Tabs for secure OAuth flow
- State parameter for CSRF protection
- Automatic token exchange

## Configuration

Update the base URL in `AuthApiClient.kt`:

```kotlin
private val baseUrl = "https://your-domain.com/api/mobile/auth"
```

## OAuth Callback Handling

Add this to your activity that handles OAuth callbacks:

```kotlin
override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    
    intent?.data?.let { uri ->
        if (uri.scheme == "blazeneuro" && uri.host == "auth") {
            CoroutineScope(Dispatchers.Main).launch {
                val result = socialAuthManager.handleAuthCallback(uri)
                
                result.onSuccess { authResponse ->
                    // Navigate to home
                }.onFailure { error ->
                    // Show error
                }
            }
        }
    }
}
```

## Error Handling

All API methods return `Result<T>` for clean error handling:

```kotlin
result.onSuccess { data ->
    // Handle success
}.onFailure { error ->
    when (error) {
        is IOException -> // Network error
        is JSONException -> // Parse error
        else -> // Other errors
    }
}
```

## Testing

### Test Login
```bash
curl -X POST https://your-domain.com/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Token Verification
```bash
curl -X POST https://your-domain.com/api/mobile/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Production Checklist

- [ ] Update base URL to production domain
- [ ] Enable ProGuard/R8 obfuscation
- [ ] Implement certificate pinning
- [ ] Add rate limiting on backend
- [ ] Enable HTTPS only
- [ ] Add biometric authentication
- [ ] Implement token refresh logic
- [ ] Add analytics and error tracking
- [ ] Test on multiple Android versions
- [ ] Add network error handling

## Support

For issues or questions:
- Check the API logs in your backend
- Verify network connectivity
- Check token expiration
- Review Android logcat for errors
