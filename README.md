# BlazeNeuro Developer Portal

A production-ready developer portal for BlazeNeuro, built with Next.js 16, TypeScript, and modern authentication.

## 🚀 Features

- **Secure Authentication**: Multi-provider OAuth (Google, GitHub) with Better Auth
- **Modern UI**: Responsive design with Tailwind CSS and Radix UI components
- **Database Integration**: PostgreSQL with Drizzle ORM
- **Developer Tools**: API management, user analytics, and admin dashboard
- **Production Ready**: Docker support, security headers, and performance optimizations
- **Type Safety**: Full TypeScript support with strict type checking

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Custom components
- **Authentication**: Better Auth
- **Database**: PostgreSQL with Drizzle ORM
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

## 🏗️ Project Structure

```
blazeneuro-dev-portal/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   └── oauth/             # OAuth callbacks
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── oauth/            # OAuth-specific components
├── lib/                  # Utility functions
│   ├── auth.ts           # Auth configuration
│   ├── db/               # Database schema
│   └── utils.ts          # Helper functions
├── hooks/                # Custom React hooks
├── drizzle/              # Database migrations
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

## 📊 Features Overview

### Authentication
- Multi-provider OAuth (Google, GitHub)
- Secure session management
- Role-based access control
- Admin user management

### Dashboard
- User analytics and metrics
- API usage statistics
- Interactive charts and graphs
- Real-time data updates

### Admin Panel
- User management
- System configuration
- Analytics dashboard
- Security monitoring

### Developer Tools
- API documentation
- SDK downloads
- Code examples
- Integration guides

## 🔒 Security Features

- CSRF protection
- XSS prevention
- Secure headers
- Rate limiting
- Input validation
- SQL injection protection

## 🚀 Performance Optimizations

- Image optimization with Next.js
- Bundle splitting and code splitting
- Static generation where possible
- Caching strategies
- Compression enabled
- Tree shaking

## 📈 Monitoring & Analytics

- Built-in analytics dashboard
- User behavior tracking
- Performance monitoring
- Error tracking (ready for Sentry)
- Health check endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the BlazeNeuro development team
- Check the documentation in `/docs`

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.
