# BlazeNeuro Developer Portal - Build Notes

**Current Version:** 1.0.0

---

## 📋 Strict Commands

### Development
```bash
npm run dev              # Start development server with Turbo
npm run dev:debug        # Start with Node.js inspector
npm run dev:fast         # Start with Turbo + experimental HTTPS
```

### Build & Production
```bash
npm run build            # Build for production
npm run start            # Start production server
npm run preview          # Build and start locally
npm run build:analyze    # Build with bundle analyzer
```

### Code Quality
```bash
npm run lint             # Run ESLint with auto-fix
npm run lint:check       # Check linting without fixing
npm run type-check       # TypeScript type checking
```

### Database
```bash
npm run db:generate      # Generate migrations from schema
npm run db:migrate       # Run migrations
npm run db:push          # Push schema changes directly
npm run db:studio        # Open Drizzle Studio
npm run db:migrate:prod  # Run production migrations
```

### Maintenance
```bash
npm run clean            # Clean build artifacts
npm install              # Install dependencies (runs db:generate)
```

---

## 🔐 Environment Variables Required

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=min-32-chars
BETTER_AUTH_URL=https://developer.blazeneuro.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
RESEND_API_KEY=re_...
```

---

## 📝 Changelog

### Version 1.0.0 (2025-11-29)
**Initial Production Release**

#### Features Added:
- ✅ Multi-provider OAuth authentication (Google, GitHub, BlazeNeuro)
- ✅ Custom OAuth 2.0 server with E2E encryption (AES-256-GCM)
- ✅ Email OTP verification system with Resend
- ✅ Admin panel with role-based access control
- ✅ User dashboard with analytics
- ✅ API key management system
- ✅ OAuth application management
- ✅ Secure admin validation with HMAC-SHA256 tokens
- ✅ Multi-layer security protection
- ✅ Email verification enforcement on protected routes
- ✅ Middleware-based route protection
- ✅ PostgreSQL database with Drizzle ORM
- ✅ Responsive UI with Tailwind CSS v4
- ✅ Type-safe with TypeScript

#### Security Implementations:
- HMAC-SHA256 token generation for admin validation
- Server-side session validation
- Email verification requirement for protected routes
- Role-based access control (admin/user)
- CSRF protection with state parameters
- Secure headers (CSP, HSTS, X-Frame-Options)
- End-to-end encryption for OAuth data

#### Database Schema:
- Users table with role and email verification
- OAuth applications table
- Verification tokens table
- Activity logs table
- System status table

#### API Endpoints:
- `/api/auth/*` - Authentication endpoints
- `/api/oauth/*` - OAuth 2.0 server endpoints
- `/api/admin/*` - Admin-only endpoints
- `/api/analytics` - Analytics data
- `/api/keys` - API key management

#### Pages:
- `/` - Landing page
- `/login` - Sign in page
- `/signup` - Sign up page
- `/verify-email` - Email verification page
- `/dashboard` - User dashboard (protected)
- `/admin` - Admin panel (admin-only)
- `/admin/oauth` - OAuth app management
- `/admin/users` - User management

---

## 🎯 Version Numbering System

**Format:** `a.b.c`

### a (Major Version)
- Complete redesign/rebuild
- Breaking changes
- Major architecture changes
- New core features that change app fundamentally

### b (Minor Version)
- New pages added
- New major features
- UI/UX upgrades
- New integrations
- Database schema changes

### c (Patch Version)
- Bug fixes
- Small feature improvements
- Performance optimizations
- Security patches
- Documentation updates

---

## 🚀 Deployment Notes

### Vercel Deployment
- Domain: `developer.blazeneuro.com`
- Framework: Next.js 16
- Node Version: 20+
- Build Command: `npm run build`
- Install Command: `npm install`

### Database
- Provider: Neon/Supabase PostgreSQL
- Connection: SSL required
- Migrations: Run `npm run db:migrate:prod` after deployment

### Email Service
- Provider: Resend
- Domain: `blazeneuro.com` (verified)
- Sender: `noreply@blazeneuro.com`

---

## 🔧 Build Prompt

**Project:** BlazeNeuro Developer Portal  
**Purpose:** Production-ready authentication and OAuth 2.0 server with developer tools  
**Stack:** Next.js 16, TypeScript, PostgreSQL, Drizzle ORM, Better Auth, Resend  
**Security:** Multi-layer protection, HMAC tokens, E2E encryption, email verification  
**Features:** OAuth server, admin panel, user dashboard, API management, analytics  

**Key Requirements:**
1. Secure authentication with multiple providers
2. Custom OAuth 2.0 server implementation
3. Role-based access control (admin/user)
4. Email verification with OTP
5. Admin panel with secure validation
6. User dashboard with analytics
7. API key management
8. OAuth application management
9. End-to-end encryption for sensitive data
10. Production-ready with Docker support

---

## 📊 Project Statistics

- **Total Routes:** 15+
- **API Endpoints:** 20+
- **Database Tables:** 8
- **Authentication Methods:** 3 (Email, Google, GitHub)
- **Security Layers:** 4
- **Supported OAuth Flows:** Authorization Code

---

## 🐛 Known Issues

None currently.

---

## 📅 Next Planned Features (v1.1.0)

- [ ] OAuth 2.1 compliance
- [ ] PKCE support for mobile apps
- [ ] JWT token support
- [ ] Refresh token rotation
- [ ] Multi-tenant support
- [ ] Advanced analytics dashboard
- [ ] API versioning
- [ ] Webhook support
- [ ] Rate limiting per user
- [ ] Two-factor authentication (2FA)

---

## 👥 Contributors

- Ankit (Lead Developer)

---

**Last Updated:** 2025-11-29 18:47 IST
