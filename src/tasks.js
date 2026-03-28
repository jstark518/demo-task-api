const express = require("express");
const { v4: uuid } = require("uuid");
const { tasks } = require("./db");
const { authenticate } = require("./middleware");

const router = express.Router();

// All task routes require auth
router.use(authenticate);

// List tasks — returns ALL tasks, not just the user's
// BUG: No ownership filtering — any user can see all tasks
router.get("/", (req, res) => {
  res.json(tasks);
});

// Create task
router.post("/", (req, res) => {
  const { title, description } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required and cannot be empty" });
  }

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

  // BUG: No ownership check — any user can view any task
  res.json(task);
});

// Update task
router.put("/:id", (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  // BUG: No ownership check — any user can update any task
  const { title, description, completed } = req.body;

  if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
    return res.status(400).json({ error: "Title cannot be empty" });
  }

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
// BUG: Doesn't check ownership — any user can delete any task
// BUG: Returns 200 with empty body instead of 204
router.delete("/:id", (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(index, 1);
  res.status(200).json({});
});

module.exports = router;
