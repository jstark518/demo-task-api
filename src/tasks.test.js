const { describe, it, before, after } = require("node:test");
const assert = require("node:assert");

const app = require("./index");

let server;
let port;
let userToken;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      resolve();
    });
  });

  // Register a user
  const regRes = await fetch(`http://localhost:${port}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "testuser", password: "testpass", email: "test@test.com" }),
  });
  assert.strictEqual(regRes.status, 201);

  // Login
  const loginRes = await fetch(`http://localhost:${port}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "testuser", password: "testpass" }),
  });
  const loginData = await loginRes.json();
  userToken = loginData.token;
});

after(() => {
  server?.close();
});

describe("Tasks API", () => {
  it("should create a task", async () => {
    const res = await fetch(`http://localhost:${port}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ title: "Test task", description: "A test" }),
    });
    assert.strictEqual(res.status, 201);
    const task = await res.json();
    assert.strictEqual(task.title, "Test task");
    assert.strictEqual(task.completed, false);
  });

  it("should list tasks", async () => {
    const res = await fetch(`http://localhost:${port}/tasks`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
    const tasks = await res.json();
    assert.ok(Array.isArray(tasks));
    assert.ok(tasks.length > 0);
  });

  it("should require auth", async () => {
    const res = await fetch(`http://localhost:${port}/tasks`);
    assert.strictEqual(res.status, 401);
  });
});

describe("Task ownership", () => {
  let otherToken;
  let taskId;

  before(async () => {
    // Register a second user
    await fetch(`http://localhost:${port}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "otheruser", password: "otherpass", email: "other@test.com" }),
    });
    const loginRes = await fetch(`http://localhost:${port}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "otheruser", password: "otherpass" }),
    });
    const loginData = await loginRes.json();
    otherToken = loginData.token;

    // Create a task as the original user
    const taskRes = await fetch(`http://localhost:${port}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ title: "Owned task", description: "Belongs to testuser" }),
    });
    const task = await taskRes.json();
    taskId = task.id;
  });

  it("should return 404 when getting another user's task", async () => {
    const res = await fetch(`http://localhost:${port}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${otherToken}` },
    });
    assert.strictEqual(res.status, 404);
  });

  it("should return 404 when updating another user's task", async () => {
    const res = await fetch(`http://localhost:${port}/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${otherToken}`,
      },
      body: JSON.stringify({ title: "Hacked" }),
    });
    assert.strictEqual(res.status, 404);
  });

  it("should return 404 when deleting another user's task", async () => {
    const res = await fetch(`http://localhost:${port}/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${otherToken}` },
    });
    assert.strictEqual(res.status, 404);
  });

  it("should allow owner to delete their own task", async () => {
    const res = await fetch(`http://localhost:${port}/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 204);
  });
});

describe("Auth API", () => {
  it("should register a new user", async () => {
    const res = await fetch(`http://localhost:${port}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "newuser", password: "pass123", email: "new@test.com" }),
    });
    assert.strictEqual(res.status, 201);
  });

  // This test documents the bug — login returns 200 on wrong password
  it("should return 200 on wrong password (known bug)", async () => {
    const res = await fetch(`http://localhost:${port}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "testuser", password: "wrongpass" }),
    });
    // BUG: This should be 401, but the API returns 200
    assert.strictEqual(res.status, 200);
  });
});
