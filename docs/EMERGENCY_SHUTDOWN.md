# Emergency Shutdown System

## Overview
The emergency shutdown system allows administrators to instantly disable all user-facing services while keeping the admin panel accessible.

## Database Schema

### SystemStatus Table
```sql
CREATE TABLE "system_status" (
  "id" text PRIMARY KEY DEFAULT 'system' NOT NULL,
  "status" text DEFAULT 'on' NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "updated_by" text REFERENCES "user"("id")
);
```

## Status Values
- **"on"** - System is operational (switch OFF)
- **"poweroff"** - System is shut down (switch ON)

## How It Works

### 1. Admin Toggle
- Navigate to admin panel
- Toggle the emergency shutdown switch
- Confirm the action in the dialog

### 2. Middleware Protection
When system status is "poweroff":
- All routes except `/admin/*` and `/api/admin/*` return 503
- Users see: "System is currently powered off. Please contact administrator."
- Login, signup, OAuth, and API requests are blocked

### 3. Allowed During Shutdown
- Admin panel access (`/admin/*`)
- Admin API endpoints (`/api/admin/*`)
- Static assets and Next.js internals

## API Endpoints

### GET /api/admin/emergency-shutdown
Check current system status (admin only)

**Response:**
```json
{
  "shutdown": false  // true if powered off
}
```

### POST /api/admin/emergency-shutdown
Toggle system status (admin only)

**Request:**
```json
{
  "shutdown": true  // true to power off, false to power on
}
```

**Response:**
```json
{
  "success": true,
  "shutdown": true
}
```

## Implementation Files

- `/lib/db/schema.ts` - SystemStatus table definition
- `/lib/shutdown-state.ts` - Status management functions
- `/middleware.ts` - Request interception and blocking
- `/app/api/admin/emergency-shutdown/route.ts` - API endpoints
- `/components/admin/emergency-shutdown.tsx` - UI component

## Usage

```typescript
import { isSystemOn, setSystemStatus, getSystemStatus } from '@/lib/shutdown-state';

// Check if system is operational
const operational = await isSystemOn();

// Get current status
const status = await getSystemStatus(); // "on" | "poweroff"

// Set status (admin only)
await setSystemStatus("poweroff", userId);
await setSystemStatus("on", userId);
```

## Security
- Only users with `role: "admin"` can toggle the system
- Status changes are logged with user ID and timestamp
- Middleware runs on every request for instant protection
