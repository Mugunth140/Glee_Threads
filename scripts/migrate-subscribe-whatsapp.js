const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
  console.log('Loading .env.local');
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  console.log('Loading .env');
  dotenv.config({ path: envPath });
}

async function migrate() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '8220',
    database: process.env.DB_NAME || 'dress_shop',
    port: parseInt(process.env.DB_PORT || '3306')
  };

  console.log('Connecting to database...');
  try {
    const conn = await mysql.createConnection(config);

    // 1. Create table if it doesn't exist
    await conn.query(`
      CREATE TABLE IF NOT EXISTS subscribes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        whatsapp_number VARCHAR(20) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Check if 'email' column still exists, if so, we need to migrate or drop
    // For this request, we are switching to whatsapp. 
    // We'll check for 'whatsapp_number' column. If not present (but table exists), we alter.
    const [columns] = await conn.query(`SHOW COLUMNS FROM subscribes LIKE 'whatsapp_number'`);
    if (columns.length === 0) {
      console.log('Migrating subscribes table: replacing email with whatsapp_number...');
      // Ideally we would back up data, but here we'll just alter/drop for the transition
      // Check if email column exists to drop it or rename it? 
      // Let's just Add whatsapp_number and Drop email if it exists.
      
      const [emailCol] = await conn.query(`SHOW COLUMNS FROM subscribes LIKE 'email'`);
      if (emailCol.length > 0) {
         // Drop email column and truncate table to start fresh with phone numbers (since emails can't be converted to phones)
         await conn.query(`TRUNCATE TABLE subscribes`);
         await conn.query(`ALTER TABLE subscribes DROP COLUMN email`);
         await conn.query(`ALTER TABLE subscribes ADD COLUMN whatsapp_number VARCHAR(20) NOT NULL UNIQUE`);
         console.log('✅ Dropped email column and added whatsapp_number.');
      } else {
         await conn.query(`ALTER TABLE subscribes ADD COLUMN whatsapp_number VARCHAR(20) NOT NULL UNIQUE`);
         console.log('✅ Added whatsapp_number column.');
      }
    } else {
      console.log('ℹ️ subscribes table already has whatsapp_number.');
    }

    await conn.end();
    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
