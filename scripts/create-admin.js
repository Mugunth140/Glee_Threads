const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
  try {
    const password = 'Gleethreads@123';
    const hash = await bcrypt.hash(password, 10);
    
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '8220',
      database: 'dress_shop'
    });
    
    await conn.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)',
      ['Admin', 'root@gleethreads.com', hash, 'admin']
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: root@gleethreads.com');
    console.log('🔑 Password: Gleethreads@123');
    await conn.end();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
