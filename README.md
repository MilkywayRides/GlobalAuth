# BlazeNeuro Developer Portal

A production-ready developer portal for BlazeNeuro, built with Next.js 16, TypeScript, and modern authentication with end-to-end encryption.

## 🚀 Features

- **Secure Authentication**: Multi-provider OAuth (Google, GitHub) with Better Auth
- **Custom OAuth Provider**: Full OAuth 2.0 server implementation with E2E encryption
- **Modern UI**: Responsive design with Tailwind CSS and Radix UI components
- **Database Integration**: PostgreSQL with Drizzle ORM
- **Developer Tools**: API management, user analytics, and admin dashboard
- **Production Ready**: Docker support, security headers, and performance optimizations
- **Type Safety**: Full TypeScript support with strict type checking
- **End-to-End Encryption**: Secure data transmission with AES-256-GCM encryption

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Custom components
- **Authentication**: Better Auth + Custom OAuth 2.0 Server
- **Database**: PostgreSQL with Drizzle ORM
- **Encryption**: AES-256-GCM end-to-end encryption
- **Deployment**: Docker + Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- npm 8+
- PostgreSQL database (or use Neon/Supabase)
- OAuth app credentials (Google, GitHub)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd blazeneuro-dev-portal
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL='postgresql://username:password@host:port/database?sslmode=require'

# Auth
BETTER_AUTH_SECRET=your-super-secret-key-here-min-32-chars
BETTER_AUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 3. Database Setup

```bash
# Generate database schema
npm run db:generate

# Run migrations
npm run db:migrate

# Optional: Open Drizzle Studio
npm run db:studio
```

### 4. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🔐 OAuth 2.0 Server

BlazeNeuro includes a complete OAuth 2.0 server implementation with enterprise-grade security features.

### OAuth Endpoints

#### Authorization Endpoint
```
GET /api/oauth/authorize
```

**Parameters:**
- `client_id` - Your application's client ID
- `redirect_uri` - Callback URL for your application
- `scope` - Requested permissions (profile, email)
- `state` - CSRF protection token

**Example:**
```
http://localhost:3000/api/oauth/authorize?client_id=bn_8d9c693efa613db2692a8cde42c5ecf8&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fcallback&scope=profile,email&state=xyz123
```

#### Token Exchange Endpoint
```
POST /api/oauth/token
```

**Request Body:**
```json
{
  "code": "authorization_code",
  "client_id": "your_client_id",
  "redirect_uri": "your_callback_url"
}
```

**Response:**
```json
{
  "access_token": "access_token_here",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "profile,email",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://example.com/avatar.jpg"
  }
}
```

### OAuth Application Management

#### Create OAuth Application
1. Navigate to `/admin/oauth`
2. Click "New Application"
3. Fill in application details:
   - **Name**: Your application name
   - **Homepage URL**: Your application's website
   - **Redirect URIs**: Allowed callback URLs
   - **Application Type**: Web Application, Mobile App, etc.

#### Manage Applications
- **View Applications**: See all registered OAuth apps
- **Copy Client ID**: Quick copy functionality
- **Delete Applications**: Remove unused applications
- **Edit Settings**: Update application configuration

### Security Features

#### End-to-End Encryption
- **Algorithm**: AES-256-GCM encryption
- **Key Management**: Secure key generation and rotation
- **Data Protection**: All OAuth data encrypted in transit
- **Authentication**: Additional authenticated encryption (AAD)

#### Security Headers
```typescript
{
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
}
```

#### CSRF Protection
- State parameter validation
- Origin header verification
- Secure token generation

## 🏗️ Project Structure

```
blazeneuro-dev-portal/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── admin/             # Admin panel
│   │   └── oauth/         # OAuth app management
│   ├── api/               # API routes
│   │   └── oauth/         # OAuth 2.0 endpoints
│   └── oauth/             # OAuth authorization pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── oauth/            # OAuth-specific components
├── lib/                  # Utility functions
│   ├── auth.ts           # Auth configuration
│   ├── encryption.ts     # E2E encryption utilities
│   ├── db/               # Database schema
│   └── utils.ts          # Helper functions
├── oauth-demo/           # OAuth demo application
└── public/               # Static assets
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run preview         # Build and start locally

# Code Quality
npm run lint            # Run ESLint with auto-fix
npm run lint:check      # Check linting without fixing
npm run type-check      # TypeScript type checking

# Database
npm run db:generate     # Generate migrations
npm run db:migrate      # Run migrations
npm run db:push         # Push schema changes
npm run db:studio       # Open Drizzle Studio

# Production
npm run build:analyze   # Build with bundle analyzer
npm run clean           # Clean build artifacts
```

## ⚡ Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component with WebP
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Tree Shaking**: Unused code elimination
- **Compression**: Gzip and Brotli compression

### Backend Optimizations
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis-ready caching layer
- **Rate Limiting**: API endpoint protection
- **Response Compression**: Automatic response compression

### Security Optimizations
- **CSP Headers**: Content Security Policy implementation
- **HSTS**: HTTP Strict Transport Security
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Output encoding and sanitization

## 🐳 Docker Deployment

### Development with Docker

```bash
# Build and run
docker-compose up --build

# With local database
docker-compose --profile local-db up --build

# With caching
docker-compose --profile cache up --build
```

### Production Deployment

```bash
# Build production image
docker build -t blazeneuro-dev-portal .

# Run production container
docker run -p 3000:3000 --env-file .env.local blazeneuro-dev-portal
```

## 🔐 OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/api/auth/callback/google`

### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret

### BlazeNeuro OAuth (Custom)

1. Navigate to `/admin/oauth`
2. Create a new OAuth application
3. Configure redirect URIs for your application
4. Use the generated Client ID in your application

## 📊 Features Overview

### Authentication
- Multi-provider OAuth (Google, GitHub, BlazeNeuro)
- Secure session management with E2E encryption
- Role-based access control
- Admin user management

### OAuth 2.0 Server
- Complete OAuth 2.0 implementation
- Authorization code flow
- Secure token exchange
- Application management
- End-to-end encryption

### Dashboard
- User analytics and metrics
- API usage statistics
- Interactive charts and graphs
- Real-time data updates

### Admin Panel
- User management
- OAuth application management
- System configuration
- Analytics dashboard
- Security monitoring

### Developer Tools
- API documentation
- SDK downloads
- Code examples
- Integration guides
- OAuth playground

## 🔒 Security Features

- **End-to-End Encryption**: AES-256-GCM encryption for all sensitive data
- **CSRF Protection**: State parameter validation and secure tokens
- **XSS Prevention**: Output encoding and Content Security Policy
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM
- **Rate Limiting**: API endpoint protection
- **Secure Headers**: Comprehensive security header implementation
- **Input Validation**: Server-side validation for all inputs
- **Session Security**: Secure session management with httpOnly cookies

## 🚀 Performance Features

- **Image Optimization**: Next.js Image component with WebP support
- **Bundle Splitting**: Automatic code splitting and lazy loading
- **Static Generation**: Pre-rendered pages where possible
- **Caching Strategies**: Multi-layer caching implementation
- **Compression**: Gzip and Brotli compression enabled
- **Tree Shaking**: Unused code elimination
- **Database Optimization**: Indexed queries and connection pooling

## 📈 Monitoring & Analytics

- Built-in analytics dashboard
- User behavior tracking
- Performance monitoring
- Error tracking (ready for Sentry)
- Health check endpoints
- OAuth usage metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run type checking: `npm run type-check`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the BlazeNeuro development team
- Check the documentation in `/docs`
- OAuth integration help: `/admin/oauth`

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## 🎯 Roadmap

- [ ] OAuth 2.1 compliance
- [ ] PKCE support for mobile apps
- [ ] JWT token support
- [ ] Refresh token rotation
- [ ] Multi-tenant support
- [ ] Advanced analytics
- [ ] API versioning
- [ ] Webhook support
