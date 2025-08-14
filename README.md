# Windows Explorer (Vue 3 + Bun + Elysia + Prisma + Postgres)

A Windows Explorer-like web app:
- Left: folder tree (lazy loaded, expandable)
- Right: direct subfolders + files (paginated)
- CRUD folder (create / rename / delete)
- Clean-ish architecture (controller → service → repo)
- Bun runtime for FE/BE, Prisma ORM, PostgreSQL

## Tech
- Frontend: Vue 3 (Composition API), Vite, Axios
- Backend: Bun + Elysia, Prisma ORM
- DB: PostgreSQL 16


---

## Quick Start (Docker)

> Butuh Docker & Docker Compose.

1. Buat `.env`:
   - **apps/backend/.env**
     ```
     DATABASE_URL=postgresql://postgres:postgres@db:5432/windows_explorer
     PORT=3002
     ```
   - **apps/frontend/.env**
     ```
     VITE_API_BASE=http://localhost:3002
     ```

2. Jalankan:
   ```bash
   backend
    bun install
    bunx prisma generate
    bunx prisma migrate dev --name init
    bunx tsx prisma/seed.ts
    bun run dev
   Frontend
    cd apps/frontend
    echo VITE_API_BASE="http://localhost:3002" > .env
    bun install
    bun run dev


3. Buka:
Frontend: http://localhost:5173
Backend: http://localhost:3002