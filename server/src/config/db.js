const { Pool } = require('pg');
const { DATABASE_URL } = require('./env');

const pool = new Pool({ connectionString: DATABASE_URL });

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error on idle client', err);
  process.exit(1);
});

/** Always use parameterized queries: query(text, params) */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
