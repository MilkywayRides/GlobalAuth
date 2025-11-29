# Build an Embedded Vercel-like Deployment Platform for BlazeNeuro

## Project Overview
Build a complete deployment platform embedded within the BlazeNeuro Developer Portal that allows users to deploy Next.js applications directly from GitHub with custom subdomain support (e.g., project-one.blazeneuro.com), environment variable management, and automated builds using GitHub Actions.

## Core Requirements

### 1. GitHub Integration
- OAuth integration with GitHub API to list user repositories
- Repository selection interface with search and filtering
- Branch selection for deployment
- Webhook setup for automatic deployments on push
- Support for monorepo detection and subdirectory deployments

### 2. Build System (GitHub Actions)
- Auto-generate GitHub Actions workflow files for Next.js builds
- Support for different Node.js versions (18, 20, 22)
- Custom build commands configuration
- Build caching for faster deployments
- Build logs streaming in real-time to the UI
- Build status notifications (success, failure, in-progress)
- Artifact storage and management

### 3. Deployment Infrastructure
- Deploy built applications to subdomain structure (*.blazeneuro.com)
- Nginx reverse proxy configuration for routing
- SSL certificate automation with Let's Encrypt/Certbot
- Zero-downtime deployments with blue-green strategy
- Rollback capability to previous deployments
- Static file serving optimization
- CDN integration (optional for future)

### 4. Domain Management
- Automatic subdomain creation (project-name.blazeneuro.com)
- Custom domain support with DNS verification
- Domain validation and conflict checking
- SSL certificate management per domain
- Domain transfer between projects

### 5. Environment Variables Management
- Secure encrypted storage (AES-256-GCM like existing OAuth system)
- Environment-specific variables (development, preview, production)
- UI for adding/editing/deleting environment variables
- Bulk import/export functionality
- Secret masking in UI and logs
- Environment variable validation
- Automatic injection during build process

### 6. Deployment Dashboard
- List all user projects with status indicators
- Deployment history with timestamps
- Real-time build logs viewer with syntax highlighting
- Deployment metrics (build time, size, success rate)
- Quick actions (redeploy, rollback, delete)
- Project settings page
- Analytics integration (visits, performance)

### 7. Project Configuration
- Framework detection (Next.js, React, Vue, etc.)
- Build command customization
- Output directory configuration
- Install command override
- Node.js version selection
- Environment variable management
- Custom headers and redirects
- Preview deployments for PRs

## Technical Architecture

### Frontend Components
```
/app/deploy/
  ├── page.tsx                    # Main deployment dashboard
  ├── new/page.tsx               # Import from GitHub
  ├── [projectId]/
  │   ├── page.tsx               # Project overview
  │   ├── deployments/page.tsx   # Deployment history
  │   ├── settings/page.tsx      # Project settings
  │   ├── env/page.tsx           # Environment variables
  │   ├── domains/page.tsx       # Domain management
  │   └── logs/[deployId]/page.tsx # Build logs

/components/deploy/
  ├── github-repo-selector.tsx
  ├── deployment-card.tsx
  ├── build-logs-viewer.tsx
  ├── env-variable-manager.tsx
  ├── domain-configurator.tsx
  └── deployment-status.tsx
```

### Backend API Routes
```
/api/deploy/
  ├── github/
  │   ├── repos/route.ts         # List user repositories
  │   ├── branches/route.ts      # List branches
  │   └── webhook/route.ts       # GitHub webhook handler
  ├── projects/
  │   ├── route.ts               # CRUD for projects
  │   ├── [id]/route.ts          # Single project operations
  │   ├── [id]/deploy/route.ts   # Trigger deployment
  │   └── [id]/rollback/route.ts # Rollback deployment
  ├── deployments/
  │   ├── [id]/route.ts          # Deployment details
  │   ├── [id]/logs/route.ts     # Stream build logs
  │   └── [id]/status/route.ts   # Deployment status
  ├── env/
  │   ├── route.ts               # Manage environment variables
  │   └── [id]/route.ts          # Single env variable
  └── domains/
      ├── route.ts               # Domain management
      └── verify/route.ts        # Domain verification
```

### Database Schema (Drizzle ORM)
```typescript
// Add to lib/db/schema.ts

export const deployProjects = pgTable('deploy_projects', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  githubRepoUrl: text('github_repo_url').notNull(),
  githubRepoId: text('github_repo_id').notNull(),
  branch: text('branch').default('main'),
  framework: text('framework').default('nextjs'),
  buildCommand: text('build_command').default('npm run build'),
  outputDirectory: text('output_directory').default('.next'),
  installCommand: text('install_command').default('npm install'),
  nodeVersion: text('node_version').default('20'),
  subdomain: text('subdomain').unique().notNull(),
  customDomain: text('custom_domain'),
  status: text('status').default('active'), // active, paused, deleted
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const deployments = pgTable('deployments', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => deployProjects.id),
  commitSha: text('commit_sha').notNull(),
  commitMessage: text('commit_message'),
  branch: text('branch').notNull(),
  status: text('status').notNull(), // queued, building, success, failed, cancelled
  buildLogs: text('build_logs'),
  buildDuration: integer('build_duration'), // in seconds
  deployUrl: text('deploy_url'),
  isProduction: boolean('is_production').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const projectEnvVariables = pgTable('project_env_variables', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => deployProjects.id),
  key: text('key').notNull(),
  encryptedValue: text('encrypted_value').notNull(),
  iv: text('iv').notNull(),
  authTag: text('auth_tag').notNull(),
  environment: text('environment').notNull(), // development, preview, production, all
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const projectDomains = pgTable('project_domains', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => deployProjects.id),
  domain: text('domain').unique().notNull(),
  isVerified: boolean('is_verified').default(false),
  verificationToken: text('verification_token'),
  sslStatus: text('ssl_status').default('pending'), // pending, active, failed
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Infrastructure Components

#### 1. GitHub Actions Workflow Generator
```typescript
// lib/deploy/workflow-generator.ts
export function generateWorkflow(config: {
  nodeVersion: string;
  installCommand: string;
  buildCommand: string;
  outputDirectory: string;
  envVariables: Record<string, string>;
}): string;
```

#### 2. Nginx Configuration Manager
```typescript
// lib/deploy/nginx-manager.ts
export async function createSubdomain(subdomain: string, port: number): Promise<void>;
export async function removeSubdomain(subdomain: string): Promise<void>;
export async function reloadNginx(): Promise<void>;
```

#### 3. SSL Certificate Manager
```typescript
// lib/deploy/ssl-manager.ts
export async function generateSSL(domain: string): Promise<void>;
export async function renewSSL(domain: string): Promise<void>;
```

#### 4. Build Orchestrator
```typescript
// lib/deploy/build-orchestrator.ts
export async function triggerBuild(projectId: string, commitSha: string): Promise<string>;
export async function streamBuildLogs(deploymentId: string): AsyncGenerator<string>;
export async function cancelBuild(deploymentId: string): Promise<void>;
```

#### 5. Deployment Manager
```typescript
// lib/deploy/deployment-manager.ts
export async function deployBuild(deploymentId: string, artifactPath: string): Promise<void>;
export async function rollbackDeployment(projectId: string, deploymentId: string): Promise<void>;
```

## Security Requirements

1. **Environment Variables**: Use existing AES-256-GCM encryption from lib/encryption.ts
2. **GitHub Tokens**: Encrypt and store securely, never expose in logs
3. **Webhook Signatures**: Verify GitHub webhook signatures
4. **Domain Verification**: Implement DNS TXT record verification
5. **Rate Limiting**: Prevent abuse of deployment API
6. **Build Isolation**: Run builds in isolated containers/environments
7. **Access Control**: Users can only access their own projects
8. **Audit Logs**: Track all deployment actions

## Implementation Steps

### Phase 1: Foundation (Week 1)
1. Set up database schema and migrations
2. Create GitHub OAuth integration for repository access
3. Build repository selection UI
4. Implement project creation flow

### Phase 2: Build System (Week 2)
1. Create GitHub Actions workflow generator
2. Implement webhook handler for GitHub events
3. Build log streaming system
4. Create deployment status tracking

### Phase 3: Infrastructure (Week 3)
1. Set up Nginx reverse proxy configuration
2. Implement subdomain creation automation
3. Integrate Let's Encrypt for SSL certificates
4. Build deployment artifact storage

### Phase 4: Environment & Domains (Week 4)
1. Create encrypted environment variable storage
2. Build environment variable management UI
3. Implement domain management system
4. Add custom domain support with verification

### Phase 5: Dashboard & Polish (Week 5)
1. Build comprehensive deployment dashboard
2. Add real-time build logs viewer
3. Implement rollback functionality
4. Add deployment analytics and metrics

## Key Features to Implement

### Must-Have (MVP)
- ✅ GitHub repository import
- ✅ Automated Next.js builds via GitHub Actions
- ✅ Subdomain deployment (*.blazeneuro.com)
- ✅ Environment variable management with encryption
- ✅ Build logs viewer
- ✅ Basic deployment dashboard

### Nice-to-Have (V2)
- Preview deployments for pull requests
- Custom domain support
- Deployment rollback
- Build caching
- Analytics dashboard
- Team collaboration features
- API access for deployments

### Future Enhancements (V3)
- Multi-framework support (Vue, React, Svelte)
- Edge function support
- Database provisioning
- Monitoring and alerts
- Cost analytics
- CI/CD pipeline customization

## Technology Stack

### Core Technologies
- **Framework**: Next.js 16 (existing)
- **Database**: PostgreSQL with Drizzle ORM (existing)
- **Authentication**: Better Auth (existing)
- **Encryption**: AES-256-GCM (existing lib/encryption.ts)
- **UI**: Tailwind CSS + Radix UI (existing)

### New Dependencies
```json
{
  "@octokit/rest": "^20.0.0",           // GitHub API client
  "dockerode": "^4.0.0",                 // Docker API (for build isolation)
  "ws": "^8.16.0",                       // WebSocket for log streaming
  "node-cron": "^3.0.3",                 // SSL renewal scheduling
  "yaml": "^2.3.4",                      // GitHub Actions YAML generation
  "tar": "^6.2.0",                       // Build artifact compression
  "nanoid": "^5.0.4"                     // ID generation
}
```

### Infrastructure Requirements
- **Server**: VPS with Docker support (2GB+ RAM)
- **Nginx**: Reverse proxy for subdomain routing
- **Certbot**: SSL certificate automation
- **GitHub Actions**: Build execution (free tier)
- **Storage**: For build artifacts and logs

## Environment Variables to Add

```env
# GitHub Integration
GITHUB_APP_ID=your_github_app_id
GITHUB_APP_PRIVATE_KEY=your_private_key
GITHUB_OAUTH_CLIENT_ID=your_github_oauth_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_oauth_secret

# Deployment Configuration
DEPLOY_BASE_DOMAIN=blazeneuro.com
DEPLOY_NGINX_CONFIG_PATH=/etc/nginx/sites-available
DEPLOY_SSL_EMAIL=admin@blazeneuro.com
DEPLOY_ARTIFACTS_PATH=/var/www/deployments
DEPLOY_MAX_BUILD_TIME=600

# Docker Configuration (if using containers)
DOCKER_HOST=unix:///var/run/docker.sock
DOCKER_REGISTRY=registry.blazeneuro.com
```

## API Endpoints Documentation

### Create New Project
```
POST /api/deploy/projects
Body: {
  name: string,
  githubRepoUrl: string,
  branch: string,
  subdomain: string,
  framework: string,
  buildCommand?: string,
  outputDirectory?: string
}
```

### Trigger Deployment
```
POST /api/deploy/projects/[id]/deploy
Body: {
  branch?: string,
  commitSha?: string
}
```

### Stream Build Logs
```
GET /api/deploy/deployments/[id]/logs
Response: Server-Sent Events stream
```

### Manage Environment Variables
```
POST /api/deploy/env
Body: {
  projectId: string,
  key: string,
  value: string,
  environment: 'development' | 'preview' | 'production' | 'all'
}
```

## Testing Strategy

1. **Unit Tests**: Test encryption, workflow generation, domain validation
2. **Integration Tests**: Test GitHub API integration, deployment flow
3. **E2E Tests**: Test complete deployment from GitHub to live URL
4. **Load Tests**: Test concurrent deployments and build queue
5. **Security Tests**: Test encryption, access control, webhook verification

## Success Metrics

- Deployment time < 5 minutes for average Next.js app
- 99.9% uptime for deployed applications
- Zero environment variable leaks
- Successful SSL certificate automation
- Real-time log streaming with < 1s latency

## Additional Considerations

1. **Build Queue**: Implement queue system for managing concurrent builds
2. **Resource Limits**: Set CPU/memory limits per deployment
3. **Cleanup**: Automatic cleanup of old deployments and artifacts
4. **Monitoring**: Health checks for deployed applications
5. **Notifications**: Email/webhook notifications for deployment status
6. **Documentation**: User guide for deployment process
7. **Billing**: Prepare for future paid tiers (usage tracking)

## References

- GitHub Actions API: https://docs.github.com/en/rest/actions
- GitHub Webhooks: https://docs.github.com/en/webhooks
- Nginx Configuration: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/docs/
- Docker API: https://docs.docker.com/engine/api/

---

**Note**: This is a complex system. Start with MVP features and iterate. Prioritize security and user experience. Use existing BlazeNeuro infrastructure (auth, encryption, database) to accelerate development.
