const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
  console.log("🚀 Memulai koneksi ke database online...");
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
      multipleStatements: true,
      ssl: {
        rejectUnauthorized: false
      } // Penting untuk koneksi ke layanan Cloud seperti Aiven
    });
    
    console.log("✅ Terkoneksi! Membuat database laot_niaga jika belum ada...");
    await connection.query('CREATE DATABASE IF NOT EXISTS laot_niaga');
    await connection.query('USE laot_niaga');
    
    console.log("⏳ Membaca file schema.sql dan mengeksekusinya...");
    const sqlPath = path.join(__dirname, 'models', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await connection.query(sql);
    
    console.log("🎉 SELESAI! Database berhasil di-setup dan data demo sudah dimasukkan!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Terjadi kesalahan:", error.message);
    process.exit(1);
  }
}

run();
