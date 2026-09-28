require("dotenv").config();

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM tasks");
  if (rows[0].count === 0) {
    await pool.query(
      "INSERT INTO tasks (title, done) VALUES ($1, $2), ($3, $4), ($5, $6)",
      ["Buy milk", false, "Learn Node.js", false, "Build API", false]
    );
  }
}

module.exports = { pool, initializeDatabase };