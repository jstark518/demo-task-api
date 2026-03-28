const express = require("express");
const { v4: uuid } = require("uuid");
const { users } = require("./db");

const router = express.Router();

// BUG: No password hashing — stores plaintext passwords
// BUG: No input validation — accepts empty strings

router.post("/register", (req, res) => {
  const { username, password, email } = req.body;

  // BUG: Doesn't check if username already exists
  const user = {
    id: uuid(),
    username,
    password, // BUG: plaintext password storage
    email,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  res.status(201).json({ id: user.id, username: user.username });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);

  // BUG: Returns 200 even on invalid password — just returns different message
  if (!user) {
    return res.status(200).json({ message: "User not found" });
  }

  if (user.password !== password) {
    return res.status(200).json({ message: "Invalid password" });
  }

  // BUG: Token is just the user ID — no actual JWT or signing
  const token = user.id;
  res.json({ token, username: user.username });
});

module.exports = router;
