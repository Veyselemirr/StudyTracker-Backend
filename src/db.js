// src/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.connect((err) => {
  if (err) {
    console.error('Veritabanına bağlanılamadı!', err.stack);
  } else {
    console.log('PostgreSQL veritabanına başarıyla bağlanıldı.');
  }
});

module.exports = pool;