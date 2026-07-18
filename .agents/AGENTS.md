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
- [x] Task 1.1 - 1.7: Scaffolding & Auth
- [x] Task 2.1 - 2.3: Investor Profile & KYC
- [x] Task 3.1: Bond CRUD API
- [x] Task 3.2: Bond Issuance UI (Broker)
- [x] Task 3.3: Marketplace UI (Investor)
- [x] Task 4.1: Order Submission API
- [x] Task 4.2: Order Management UI
- [x] Task 5.1: Payment Receipt Upload & Verification
- [x] Task 5.2: Pro-Rata Allocation Engine & Broker UI
- [x] Task 5.3: Real-Time Notification System
- [x] Task 6.1: Portfolio API & Dashboard UI
- [x] Task 6.2: Mock Coupon Payment Engine
- [x] Task 7.1: Broker Dashboard UI
- [x] Task 7.2: Reports Module
- [x] UI Polish: Logo Redesign & Landing Page Enhancements
- [x] Task 10.1: E2E Testing
- [x] Task 10.2: Platform Localization (next-intl)
- [x] Task 10.3: UI Translations (Investor, Broker, Admin portals fully localized)
