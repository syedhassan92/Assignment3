# Task API

An Express CRUD API backed by PostgreSQL. The database and API run together with Docker Compose.

## Prerequisites

- Docker Desktop
- Git

## Run The Stack

Copy the example environment file, then start the API and PostgreSQL:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

The API is available at http://localhost:3000 and Swagger is available at http://localhost:3000/docs.

The database password is read from `.env`, which is ignored by Git. Only `.env.example` is committed.

## Database

PostgreSQL creates the `tasks` table on startup and seeds three tasks only when the table is empty. The named `taskdata` volume keeps rows after `docker compose down` and `docker compose up`.

Inspect the database:

```powershell
docker compose exec db psql -U postgres -d tasks -c "SELECT * FROM tasks;"
```

![Database viewer screenshot](dbviewer.png)

## Endpoints

| Method | Path | Description | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/` | API metadata | 200 | - |
| GET | `/health` | API and database health | 200 | 503 |
| GET | `/tasks` | List all tasks | 200 | - |
| GET | `/tasks/:id` | Get one task | 200 | 404 |
| POST | `/tasks` | Create a task | 201 | 400 |
| PUT | `/tasks/:id` | Update a task | 200 | 400, 404 |
| DELETE | `/tasks/:id` | Delete a task | 204 | 404 |

All database queries use PostgreSQL parameter placeholders such as `$1`; user input is never concatenated into SQL.

## CRUD Checks

```powershell
curl.exe -i http://localhost:3000/tasks
curl.exe -i http://localhost:3000/tasks/999
curl.exe -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Learn Docker","done":false}'
curl.exe -i -X PUT http://localhost:3000/tasks/1 -H "Content-Type: application/json" -d '{"done":true}'
curl.exe -i -X DELETE http://localhost:3000/tasks/1
```

The expected success statuses are `200`, `201`, `200`, and `204`. Unknown task IDs return `404` with `{ "error": "Task not found" }`.

## Persistence Check

Create a task, stop the stack, start it again, and request the list:

```powershell
docker compose down
docker compose up -d
curl.exe http://localhost:3000/tasks
```

The task remains because PostgreSQL uses the `taskdata` volume.

## Development Without Docker

Install dependencies and provide a local PostgreSQL connection string in `.env`:

```powershell
npm install
npm start
```

The API keeps the same routes and response behavior while the storage engine changes from SQLite to PostgreSQL.
