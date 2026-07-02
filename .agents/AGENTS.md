# AFIN Agent Instructions

This file contains the strict behavioral guidelines and context for Antigravity (and other agents) working on the African Fixed Income Network (AFIN) project.

## 1. Project Context
- **Name:** AFIN (African Fixed Income Network) - Phase 1 MVP
- **Goal:** Build a digital government bond exchange platform for a licensed broker in Mozambique.
- **Tech Stack:**
  - Frontend: Next.js 14 (App Router), React, Tailwind CSS.
  - Backend: NestJS, TypeScript.
  - Database: PostgreSQL (Hosted on Supabase).
  - ORM: Prisma (v5).
  - Queues/Background Jobs: `pg-boss` (Strictly NO Redis/BullMQ for queues).

## 2. Core Architectural Rules
- **Authentication & Authorization:** 
  - We are using **Custom JWT Authentication** in NestJS with `bcrypt` for password hashing.
  - We are **NOT** using Supabase Auth for backend logic, as business logic and role constraints are heavy and require full Node.js control.
  - Strict Role-Based Access Control (RBAC) must be implemented using NestJS Guards (`JwtAuthGuard`, `RolesGuard`, `OwnershipGuard`).
- **Database Access:** 
  - Always use Prisma.
  - Because Supabase uses connection pooling (Supavisor), `DATABASE_URL` (Port 6543) is for queries, and `DIRECT_URL` (Port 5432) is exclusively for `prisma db push` or migrations. (Note: Do NOT include trailing '=' in password URL strings).
- **State Management (Frontend):** 
  - Use React Context (`AuthContext`) for global auth state.
- **Background Tasks:** 
  - Use `pg-boss` for background allocations, notifications, and scheduled tasks.

## 3. Reference Documents
Always consult these blueprints before building major modules:
- `docs/MVP_Implementation_Plan.md` - Day-by-day task breakdown.
- `docs/AFIN_Enhanced_Workflow_Guide.md` - Architectural patterns and RBAC definitions.

## 4. Progress Tracking
- [x] Task 1.1: Scaffolding
- [x] Task 1.2: Database Schema
- [x] Task 1.3: User Registration API (NestJS, Bcrypt)
- [x] Task 1.4: Login + JWT
- [x] Task 1.5: RBAC Guards
- [x] Task 1.6: Frontend Auth Pages + Context
