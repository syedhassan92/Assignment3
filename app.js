const express = require("express");
const app = express();
const port = 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
const { pool, initializeDatabase } = require("./db.js");

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "OK", db: "ok" });
  } catch (error) {
    res.status(503).json({ status: "ERROR", db: "unavailable" });
  }
});

app.get("/tasks", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM tasks ORDER BY id");
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.get("/tasks/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.post("/tasks", async (req, res, next) => {
  const { title, done = 0 } = req.body;
  if (!title || title.trim() === "") {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *",
      [title.trim(), Boolean(done)]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.put("/tasks/:id", async (req, res, next) => {
  try {
    const existing = await pool.query("SELECT * FROM tasks WHERE id = $1", [req.params.id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const task = existing.rows[0];
    const title = req.body.title ?? task.title;
    if (!title || title.trim() === "") {
      res.status(400).json({ error: "Title is required" });
      return;
    }
    const done = req.body.done ?? task.done;
    const { rows } = await pool.query(
      "UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *",
      [title.trim(), Boolean(done), req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete("/tasks/:id", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
    if (rowCount === 0) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed", error);
    process.exitCode = 1;
  });
