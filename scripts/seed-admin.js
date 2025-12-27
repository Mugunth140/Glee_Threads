#!/usr/bin/env node
/**
 * Seed script: Creates admin user for the admin panel
 * 
 * Usage: 
 *   node scripts/seed-admin.js
 * 
 * Environment variables:
 *   ADMIN_EMAIL    - Admin email (default: admin@example.com)
 *   ADMIN_PASSWORD - Admin password (default: admin123)
 *   ADMIN_NAME     - Admin name (default: Admin)
 *   DB_HOST        - Database host (default: localhost)
 *   DB_USER        - Database user (default: root)
 *   DB_PASSWORD    - Database password (default: 8220)
 *   DB_NAME        - Database name (default: dress_shop)
 *   DB_PORT        - Database port (default: 3306)
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database configuration from environment variables
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '8220',
  database: process.env.DB_NAME || 'dress_shop',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
});

// Admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gleethreads.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

async function ensureAdminTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role ENUM('admin', 'super_admin') DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.info('✓ Ensured admin_users table exists');
    
    // Try to add role column if it doesn't exist (for older tables)
    try {
      await db.query(`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role ENUM('admin', 'super_admin') DEFAULT 'admin'`);
    } catch (alterErr) {
      // Column might already exist or MySQL version doesn't support IF NOT EXISTS for columns
    }
  } catch (err) {
    console.error('✗ Failed to create admin_users table:', err.message || err);
    throw err;
  }
}

async function seedAdmin() {
  try {
    // Check if admin already exists
    const [existing] = await db.query(
      'SELECT id, email FROM admin_users WHERE email = ?',
      [ADMIN_EMAIL]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      console.info(`⚠ Admin user with email "${ADMIN_EMAIL}" already exists (ID: ${existing[0].id})`);
      console.info('  To update the password, delete the existing admin first or use a different email.');
      return existing[0];
    }

    // Hash password using bcryptjs (same as login route)
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, saltRounds);

    // Insert admin user (try with role first, fallback without)
    let result;
    try {
      [result] = await db.query(
        'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
        [ADMIN_EMAIL, passwordHash, ADMIN_NAME, 'admin']
      );
    } catch (insertErr) {
      // Fallback: insert without role column if it doesn't exist
      [result] = await db.query(
        'INSERT INTO admin_users (email, password_hash, name) VALUES (?, ?, ?)',
        [ADMIN_EMAIL, passwordHash, ADMIN_NAME]
      );
    }

    console.info('✓ Admin user created successfully!');
    console.info('  ────────────────────────────────');
    console.info(`  ID:       ${result.insertId}`);
    console.info(`  Email:    ${ADMIN_EMAIL}`);
    console.info(`  Name:     ${ADMIN_NAME}`);
    console.info(`  Password: ${ADMIN_PASSWORD}`);
    console.info('  ────────────────────────────────');
    console.info('  You can now login at /admin/login');

    return { id: result.insertId, email: ADMIN_EMAIL, name: ADMIN_NAME };
  } catch (err) {
    console.error('✗ Failed to seed admin user:', err.message || err);
    throw err;
  }
}

async function main() {
  console.info('\n🔐 Admin User Seed Script');
  console.info('═══════════════════════════\n');

  try {
    await ensureAdminTable();
    await seedAdmin();
    console.info('\n✓ Seed completed successfully!\n');
  } catch (err) {
    console.error('\n✗ Seed failed:', err.message || err);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
