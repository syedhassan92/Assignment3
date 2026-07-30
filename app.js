const express = require("express");
const app = express();
const port = 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
const db = require("./db.js");

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/tasks", (req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks").all();
  res.json(tasks);
});

app.get("/tasks/:id", (req, res) => {
  const id = req.params.id;
  const tasks = db.prepare("SELECT * FROM tasks where id = ?").get(id);
  if (!tasks) {
    res.status(404).json({ error: `Task ${id} not found` });
    return;
  }
  res.json(tasks);
});

app.post("/tasks", (req, res) => {
  const { title, done } = req.body;
  if (!title || title.trim() === "") {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  const newTask = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)").run(title, done ? 1 : 0);
  res.status(201).json(db.prepare("SELECT * FROM tasks WHERE id = ?").get(newTask.lastInsertRowid));
});

app.put("/tasks/:id", (req, res) => {
    const id = req.params.id;
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    const title = req.body.title ?? task.title;
    const done = req.body.done ?? task.done;

    db.prepare("UPDATE tasks SET title = ?, done = ? WHERE id = ?").run(title, done ? 1 : 0, id);

    res.json(db.prepare("SELECT * FROM tasks WHERE id = ?").get(id));
});

app.delete("/tasks/:id", (req, res) => {
    const id = req.params.id;
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }
    db.prepare("DELETE FROM tasks WHERE id = ?").run(id);

    res.json({message: `Task ${id} deleted`});
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
