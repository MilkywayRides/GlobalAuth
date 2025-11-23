# OAuth 2.0 Demo App

This is a simple demo application to test your OAuth 2.0 provider implementation.

## Setup

1. **Create an OAuth Application** in your auth server admin panel (`http://localhost:3000/admin/oauth`)
   - Set the redirect URI to: `http://localhost:5173`
   - Copy the Client ID and Client Secret

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the demo app**:
   ```bash
   npm run dev
   ```

4. **Open** `http://localhost:5173` in your browser

## How to Use

1. Enter your **Auth Server URL** (default: `http://localhost:3000`)
2. Paste your **Client ID** (starts with `bn_`)
3. Paste your **Client Secret** (starts with `bn_`)
4. Click **Log in with OAuth**
5. You'll be redirected to the auth server to authorize
6. After authorization, you'll be redirected back and see your user info

## Notes

- This demo stores credentials in localStorage for convenience
- In production, never expose client secrets in client-side apps
- Consider using PKCE flow for public clients (SPAs, mobile apps)
