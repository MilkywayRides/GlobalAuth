import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
    try {
        console.log('Running migration...');

        // Create api_key table
        console.log('Creating api_key table...');
        await sql`
            CREATE TABLE IF NOT EXISTS "api_key" (
                "id" text PRIMARY KEY NOT NULL,
                "user_id" text NOT NULL,
                "name" text NOT NULL,
                "key" text NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "last_used_at" timestamp,
                "expires_at" timestamp,
                CONSTRAINT "api_key_key_unique" UNIQUE("key")
            )
        `;

        // Create api_key_usage table
        console.log('Creating api_key_usage table...');
        await sql`
            CREATE TABLE IF NOT EXISTS "api_key_usage" (
                "id" text PRIMARY KEY NOT NULL,
                "api_key_id" text NOT NULL,
                "date" text NOT NULL,
                "request_count" integer DEFAULT 0 NOT NULL
            )
        `;

        // Fix oauth_consent table
        console.log('Updating oauth_consent table...');
        await sql`ALTER TABLE "oauth_consent" DROP CONSTRAINT IF EXISTS "oauth_consent_user_id_user_id_fk"`;
        await sql`ALTER TABLE "oauth_consent" DROP CONSTRAINT IF EXISTS "oauth_consent_client_id_oauth_application_client_id_fk"`;
        await sql`ALTER TABLE "oauth_consent" ALTER COLUMN "created_at" SET NOT NULL`;

        // Check if application_id column exists
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'oauth_consent' AND column_name = 'application_id'
        `;

        if (columns.length === 0) {
            await sql`ALTER TABLE "oauth_consent" ADD COLUMN "application_id" text NOT NULL DEFAULT ''`;
        }

        // Check if client_id column exists before dropping
        const clientIdExists = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'oauth_consent' AND column_name = 'client_id'
        `;

        if (clientIdExists.length > 0) {
            await sql`ALTER TABLE "oauth_consent" DROP COLUMN "client_id"`;
        }

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
