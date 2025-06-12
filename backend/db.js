// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'busstops_db', // ← change to your actual DB name
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
