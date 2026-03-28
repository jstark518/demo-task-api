const express = require("express");
const authRoutes = require("./auth");
const taskRoutes = require("./tasks");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// BUG: No global error handler — unhandled errors crash the server
// BUG: No CORS configuration
// BUG: No rate limiting

// Only listen when run directly (not when imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Task API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
