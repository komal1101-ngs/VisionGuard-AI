import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { config } from '../config/env.js';
import { isSupabaseConfigured } from '../config/supabase.js';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('================================================================');
  console.log('🚀 VisionGuard AI — Supabase Database Migration Runner');
  console.log('================================================================');

  const migrationFilePath = path.resolve(__dirname, '../../supabase/migrations/001_initial_schema.sql');

  if (!fs.existsSync(migrationFilePath)) {
    console.error(`❌ Migration file not found at: ${migrationFilePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
  console.log(`📄 Loaded migration file: 001_initial_schema.sql (${sqlContent.length} bytes)`);

  const dbUrl = config.supabase.databaseUrl || process.env.DATABASE_URL;

  if (dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('placeholder')) {
    console.log(`🔌 Connecting directly to PostgreSQL via DATABASE_URL...`);
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('✅ Connected to PostgreSQL database successfully.');

      console.log('⏳ Executing schema migration and seed data...');
      await client.query(sqlContent);
      console.log('🎉 Migration applied successfully!');

      // Verify tables
      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'inspections', 'detected_issues');
      `);
      console.log('📊 Verified created tables in public schema:', res.rows.map(r => r.table_name).join(', '));

      await client.end();
      process.exit(0);
    } catch (err) {
      console.error('❌ Migration failed via direct PostgreSQL connection:', err.message);
      await client.end().catch(() => {});
      process.exit(1);
    }
  } else {
    console.log('\n⚠️ No direct Supabase DATABASE_URL detected.');
    console.log('ℹ️ To run migrations directly from Node.js to your Supabase Cloud instance:');
    console.log('   1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('   2. Navigate to Project Settings -> Database -> Connection String -> URI');
    console.log('   3. Set DATABASE_URL in server/.env with your Supabase database password');
    console.log('   4. Run: npm --prefix server run migrate');
    console.log('\n💡 Alternatively, copy the contents of "supabase/migrations/001_initial_schema.sql"');
    console.log('   and paste it directly into the Supabase Dashboard SQL Editor!\n');
    process.exit(0);
  }
}

runMigrations().catch((err) => {
  console.error('Unexpected error running migration:', err);
  process.exit(1);
});
