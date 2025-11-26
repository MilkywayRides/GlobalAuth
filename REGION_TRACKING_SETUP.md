# Region Tracking Setup

## Database Migration

Run these SQL commands in your database (Neon/Supabase console or via psql):

```sql
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "country" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "region" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "city" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "timezone" text;
```

Or use Drizzle Studio:
```bash
npm run db:studio
```

## How It Works

### Automatic Tracking
When users sign up or log in via OAuth, their geographic location is automatically detected and stored:
- **Country**: e.g., "United States", "India", "United Kingdom"
- **Region**: e.g., "California", "Maharashtra", "England"
- **City**: e.g., "San Francisco", "Mumbai", "London"
- **Timezone**: e.g., "America/Los_Angeles", "Asia/Kolkata"

### Data Source
Uses ip-api.com (free tier: 45 requests/minute) to geolocate users based on their IP address.

### API Endpoint
Access region analytics at `/api/analytics/regions` (admin only):

```json
{
  "byCountry": [
    { "country": "United States", "count": 150 },
    { "country": "India", "count": 89 }
  ],
  "byRegion": [
    { "country": "United States", "region": "California", "count": 75 },
    { "country": "India", "region": "Maharashtra", "count": 45 }
  ],
  "total": 239
}
```

## Files Modified

1. **lib/db/schema.ts** - Added region fields to user table
2. **lib/geolocation.ts** - IP geolocation utility
3. **lib/auth.ts** - Hook to capture location on signup/login
4. **app/api/analytics/regions/route.ts** - Analytics API endpoint

## Usage Example

```typescript
// Fetch region data in your admin dashboard
const response = await fetch('/api/analytics/regions');
const data = await response.json();

console.log(`Users from ${data.byCountry[0].country}: ${data.byCountry[0].count}`);
```

## Privacy Note

Only country, region, city, and timezone are stored. No precise coordinates or detailed tracking data is collected.
