#!/usr/bin/env node

const { migrate } = require('drizzle-orm/neon-serverless/migrator');
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');

async function runMigrations() {
  console.log('🗄️  Running production migrations...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);
    
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
