const express = require("express");
const { v4: uuid } = require("uuid");
const { tasks } = require("./db");
const { authenticate } = require("./middleware");

const router = express.Router();

// All task routes require auth
router.use(authenticate);

// List tasks — filtered to current user's tasks only
router.get("/", (req, res) => {
  res.json(tasks.filter((t) => t.userId === req.user.id));
});

// Create task
router.post("/", (req, res) => {
  const { title, description } = req.body;

  // BUG: Allows empty title
  const task = {
    id: uuid(),
    title: title || "",
    description: description || "",
    completed: false,
    userId: req.user.id,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  res.status(201).json(task);
});

// Get single task
router.get("/:id", (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  if (task.userId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json(task);
});

// Update task
router.put("/:id", (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  if (tasks[index].userId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { title, description, completed } = req.body;
  tasks[index] = {
    ...tasks[index],
    title: title !== undefined ? title : tasks[index].title,
    description: description !== undefined ? description : tasks[index].description,
    completed: completed !== undefined ? completed : tasks[index].completed,
    updatedAt: new Date().toISOString(),
  };

  res.json(tasks[index]);
});

// Delete task
// Delete task
router.delete("/:id", (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  if (tasks[index].userId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
