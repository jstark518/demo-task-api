const { users } = require("./db");

// Simple auth middleware — looks up user by token (which is just the user ID)
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header" });
  }

  // BUG: Doesn't properly parse "Bearer <token>" — just uses the whole header
  const token = authHeader;
  const user = users.find((u) => u.id === token);

  if (!user) {
    // Try stripping "Bearer " prefix
    const stripped = authHeader.replace("Bearer ", "");
    const userRetry = users.find((u) => u.id === stripped);
    if (!userRetry) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = userRetry;
  } else {
    req.user = user;
  }

  next();
}

module.exports = { authenticate };
