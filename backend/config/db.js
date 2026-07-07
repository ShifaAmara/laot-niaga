const mysql = require('mysql2');
require('dotenv').config();

// Membuat koneksi bersama (connection pool) ke MySQL XAMPP
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Mengubah pool menjadi format Promise agar kita bisa menggunakan async/await nanti
module.exports = pool.promise();