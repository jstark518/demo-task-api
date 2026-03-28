# Demo Task API

A simple Task Manager REST API built with Express.js. Used as a demo target for [AI Pipeline](https://github.com/jstark518/ai-pipeline).

This API intentionally has bugs and missing features — the AI Pipeline is designed to find, plan, and fix them automatically.

## Running

```bash
npm install
npm run dev
```

Server starts on http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and get a token |
| `GET` | `/tasks` | List tasks for the authenticated user |
| `POST` | `/tasks` | Create a new task |
| `GET` | `/tasks/:id` | Get a specific task |
| `PUT` | `/tasks/:id` | Update a task |
| `DELETE` | `/tasks/:id` | Delete a task |

## Auth

Pass the token from login as a header: `Authorization: Bearer <token>`
