# Email Verification System

## Overview
Secure email verification system with Better Auth integration, rate limiting, and automatic cleanup.

## Features

### 1. **Secure Token Generation**
- 32-byte cryptographically secure random tokens
- Base64URL encoding for URL safety
- 10-minute expiration
- Automatic cleanup of expired tokens

### 2. **Rate Limiting**
- 60-second cooldown between verification emails
- Prevents spam and abuse
- Returns 429 status when rate limited

### 3. **Auto-Verification Flow**
- Signup → Verification email sent automatically
- User clicks link → Auto-verifies → Redirects to dashboard
- No manual OTP entry required

### 4. **Security Measures**
- Tokens stored with user ID as identifier
- One-time use tokens (deleted after verification)
- Expired tokens automatically cleaned up
- CSRF protection via Better Auth
- Secure email templates

### 5. **User Experience**
- Clear verification status messages
- Resend functionality with rate limiting
- Loading states and error handling
- Automatic redirect after verification

## API Endpoints

### POST `/api/send-verification`
Sends verification email to authenticated user.

**Authentication:** Required (session)

**Rate Limit:** 1 request per 60 seconds

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent",
  "expiresIn": 600
}
```

**Errors:**
- `401`: Not authenticated
- `400`: Email already verified
- `429`: Rate limit exceeded
- `500`: Server error

### GET `/api/auth/verify-email?token={token}`
Verifies email with token (handled by Better Auth).

**Parameters:**
- `token`: Verification token from email
- `callbackURL`: Optional redirect URL (default: `/dashboard`)

**Response:** 302 redirect to callback URL

### POST `/api/cleanup-verifications`
Removes expired verification tokens (cron job).

## Flow Diagrams

### Signup Flow
```
User signs up
    ↓
Account created (emailVerified: false)
    ↓
Verification email sent automatically
    ↓
User redirected to /verify-email
    ↓
User clicks link in email
    ↓
Token verified → emailVerified: true
    ↓
Redirect to /dashboard
```

### Resend Flow
```
User on /verify-email page
    ↓
Clicks "Resend"
    ↓
Rate limit check (60s cooldown)
    ↓
New token generated
    ↓
Old tokens deleted
    ↓
Email sent
    ↓
User clicks new link
    ↓
Verified → Dashboard
```

### Login Flow (Unverified User)
```
User logs in
    ↓
Session created
    ↓
Check emailVerified status
    ↓
If false → Redirect to /verify-email
    ↓
If true → Redirect to /dashboard
```

## Database Schema

### verification table
```sql
CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,  -- User ID
  value TEXT NOT NULL,        -- Token (base64url)
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

## Configuration

### Environment Variables
```env
RESEND_API_KEY=your_resend_api_key
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_secret_key
```

### Auth Config (`lib/auth.ts`)
```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: false,  // Handled by middleware
  autoSignIn: true,
  sendVerificationEmail: async ({ user, url, token }) => {
    // Send email via Resend
  }
}
```

## Middleware Protection

Routes protected by email verification:
- `/dashboard/*` - Requires verified email
- `/admin/*` - Requires verified email + admin role

Unverified users are redirected to `/verify-email`.

## Security Best Practices

1. **Token Security**
   - Cryptographically secure random generation
   - URL-safe encoding
   - Short expiration (10 minutes)
   - One-time use

2. **Rate Limiting**
   - Prevents email bombing
   - 60-second cooldown
   - Per-user enforcement

3. **Database Cleanup**
   - Expired tokens removed automatically
   - Old tokens deleted before new ones created
   - Prevents token accumulation

4. **Email Security**
   - SPF/DKIM configured via Resend
   - Clear sender identity
   - Warning about unsolicited emails

5. **Session Management**
   - Verification doesn't require re-login
   - Session persists through verification
   - Automatic session refresh after verification

## Testing

### Manual Testing
1. Sign up with new email
2. Check email for verification link
3. Click link → Should redirect to dashboard
4. Try resending → Should respect rate limit
5. Try expired token → Should show error

### Automated Cleanup
Set up cron job to call `/api/cleanup-verifications` daily:
```bash
0 0 * * * curl -X POST http://localhost:3000/api/cleanup-verifications
```

## Troubleshooting

### Email not received
- Check spam folder
- Verify RESEND_API_KEY is set
- Check Resend dashboard for delivery status
- Ensure "from" email is verified in Resend

### Verification fails
- Check token hasn't expired (10 min)
- Ensure user is logged in
- Check database for verification record
- Verify Better Auth configuration

### Rate limit issues
- Wait 60 seconds between requests
- Check database for recent verification records
- Clear old tokens if needed

### Redirect loop
- Clear browser cache/cookies
- Check middleware configuration
- Verify session is updating after verification
- Check emailVerified field in database

## Future Enhancements

- [ ] Email verification via OTP code (6-digit)
- [ ] SMS verification option
- [ ] Configurable expiration times
- [ ] Email template customization
- [ ] Verification analytics
- [ ] Multi-language support
- [ ] Webhook notifications
