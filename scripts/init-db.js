const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function initDatabase() {
  let connection;

  try {
    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    console.log('📦 Creating database...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'wedang_rempah_pos'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'wedang_rempah_pos'}`);

    console.log('📋 Creating tables...');

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'kasir') DEFAULT 'kasir',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(10),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Menu items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        cost_price DECIMAL(10, 2) DEFAULT 0,
        icon VARCHAR(10),
        image_url VARCHAR(255),
        is_available BOOLEAN DEFAULT true,
        is_popular BOOLEAN DEFAULT false,
        stock INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Transactions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_code VARCHAR(20) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        customer_name VARCHAR(100),
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_amount DECIMAL(10, 2) NOT NULL,
        change_amount DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        notes TEXT,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Transaction items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id INT NOT NULL,
        menu_item_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Discounts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS discounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        discount_type ENUM('percentage', 'fixed') NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL,
        min_purchase DECIMAL(10, 2) DEFAULT 0,
        start_date DATE,
        end_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('🌱 Seeding initial data...');

    // Insert default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT IGNORE INTO users (username, email, password, full_name, role) 
      VALUES ('admin', 'admin@wedangrempah.com', ?, 'Administrator', 'admin')
    `, [hashedPassword]);

    // Insert default kasir user
    const hashedPasswordKasir = await bcrypt.hash('kasir123', 10);
    await connection.query(`
      INSERT IGNORE INTO users (username, email, password, full_name, role) 
      VALUES ('kasir', 'kasir@wedangrempah.com', ?, 'Kasir 1', 'kasir')
    `, [hashedPasswordKasir]);

    // Insert categories
    const categories = [
      ['Wedang', 'Minuman wedang tradisional', '🫖'],
      ['Teh', 'Teh dengan berbagai varian', '🍵'],
      ['Kopi', 'Kopi dengan rempah', '☕'],
      ['Snack', 'Jajanan tradisional', '🍡']
    ];

    for (const cat of categories) {
      await connection.query(`
        INSERT IGNORE INTO categories (name, description, icon) 
        VALUES (?, ?, ?)
      `, cat);
    }

    // Insert menu items
    const menuItems = [
      [1, 'Wedang Jahe', 'Jahe merah pilihan dengan gula aren asli', 8000, 4000, '🫚', true, true, 100],
      [1, 'Wedang Uwuh', 'Rempah tradisional khas Yogyakarta', 10000, 5000, '🌿', true, false, 100],
      [1, 'Wedang Secang', 'Kayu secang dengan manfaat kesehatan', 9000, 4500, '🪵', true, true, 100],
      [1, 'Wedang Ronde', 'Bola-bola kacang dalam kuah jahe hangat', 12000, 6000, '🥟', true, false, 100],
      [1, 'Bajigur', 'Santan kelapa dengan gula aren', 11000, 5500, '🥥', true, true, 100],
      [1, 'Wedang Kencur', 'Kencur segar untuk kesehatan', 8000, 4000, '🌱', true, false, 100],
      [2, 'Teh Jahe', 'Teh hangat dengan jahe segar', 7000, 3500, '🍵', true, false, 100],
      [2, 'Teh Sereh', 'Teh dengan sereh wangi', 7000, 3500, '🌾', true, false, 100],
      [3, 'Kopi Jahe', 'Kopi robusta dengan jahe', 10000, 5000, '☕', true, false, 100],
      [4, 'Klepon', 'Kue klepon isi gula merah', 5000, 2500, '🍡', true, false, 100],
      [4, 'Onde-onde', 'Onde-onde wijen gurih', 5000, 2500, '🥮', true, false, 100],
      [4, 'Lemper', 'Lemper ayam tradisional', 6000, 3000, '🌯', true, false, 100]
    ];

    for (const item of menuItems) {
      await connection.query(`
        INSERT IGNORE INTO menu_items 
        (category_id, name, description, price, cost_price, icon, is_available, is_popular, stock) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, item);
    }

    console.log('✅ Database initialized successfully!');
    console.log('\n📝 Default credentials:');
    console.log('   Admin - username: admin, password: admin123');
    console.log('   Kasir - username: kasir, password: kasir123');
    console.log('\n🎉 You can now start the application!');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
