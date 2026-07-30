const Database = require("better-sqlite3");

const db = new Database("tasks.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT,
    done BOOLEAN
  )
`).run();

const count = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();



if (count.count === 0) {
const insert = db.prepare(
"INSERT INTO tasks (title, done) VALUES (?, ?)"
);
insert.run("Buy milk", 0);
insert.run("Learn Node.js", 0);
insert.run("Build API", 0);
}

module.exports = db;