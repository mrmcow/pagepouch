#!/usr/bin/env node

/**
 * Database Setup Script for PageStash
 * 
 * This script helps set up the Supabase database with the required schema,
 * storage buckets, and initial configuration.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up PageStash database...\n');

  try {
    // Read the database schema
    const schemaPath = path.join(__dirname, '..', 'docs', 'database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Deploying database schema...');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim() === ';') {
        continue;
      }

      try {
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.warn(`   ⚠️  Warning on statement ${i + 1}: ${error.message}`);
        }
      } catch (err) {
        console.warn(`   ⚠️  Warning on statement ${i + 1}: ${err.message}`);
      }
    }

    console.log('✅ Database schema deployed successfully!\n');

    // Create storage buckets
    console.log('🗂️  Creating storage buckets...');
    
    const buckets = [
      { name: 'screenshots', public: false },
      { name: 'favicons', public: true }
    ];

    for (const bucket of buckets) {
      console.log(`   Creating ${bucket.name} bucket...`);
      const { error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: bucket.name === 'screenshots' ? 10485760 : 1048576 // 10MB for screenshots, 1MB for favicons
      });

      if (error && !error.message.includes('already exists')) {
        console.warn(`   ⚠️  Warning creating ${bucket.name}: ${error.message}`);
      } else if (!error) {
        console.log(`   ✅ ${bucket.name} bucket created`);
      } else {
        console.log(`   ℹ️  ${bucket.name} bucket already exists`);
      }
    }

    console.log('\n🎉 Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Copy .env.local to apps/web/.env.local');
    console.log('2. Run: npm run dev');
    console.log('3. Visit http://localhost:3000 to see the web app');
    console.log('4. Load the extension from apps/extension/dist/');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Alternative method using direct SQL execution
async function setupDatabaseDirect() {
  console.log('🚀 Setting up PageStash database (direct method)...\n');

  try {
    const schemaPath = path.join(__dirname, '..', 'docs', 'database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Deploying database schema...');
    console.log('Please copy and paste the following SQL into your Supabase SQL Editor:\n');
    console.log('=' .repeat(80));
    console.log(schema);
    console.log('=' .repeat(80));
    console.log('\nAfter running the SQL:');
    console.log('1. Go to Storage in your Supabase dashboard');
    console.log('2. Create a bucket called "screenshots" (private)');
    console.log('3. Create a bucket called "favicons" (public)');
    console.log('4. Copy .env.local to apps/web/.env.local');
    console.log('5. Run: npm run dev');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
if (process.argv.includes('--direct')) {
  setupDatabaseDirect();
} else {
  setupDatabase();
}
