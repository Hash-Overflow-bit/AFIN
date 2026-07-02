# AFIN — African Fixed Income Network

## Mozambique Government Bond Exchange Platform

AFIN is a fintech infrastructure platform designed to modernize how government bonds are distributed, purchased, managed, and traded across Africa.

### Phase 1 — Mozambique Broker Platform

The initial objective is to operate as a technology platform that enables an existing licensed brokerage in Mozambique to digitize its operations and provide a significantly better experience for both the brokerage and its investors.

---

## Documentation

- [Enhanced Workflow & Architecture Guide](docs/AFIN_Enhanced_Workflow_Guide.md) — RBAC, Rate Limiting, pg-boss Queues, DSA Algorithms, Load Balancer Topology
- [MVP Implementation Plan](docs/MVP_Implementation_Plan.md) — 2-Week Agile Sprint Plan with day-by-day task breakdown

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | NestJS, Node.js, REST API, JWT Auth |
| Database | PostgreSQL |
| ORM | Prisma |
| Storage | Local (S3-ready architecture) |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Hash-Overflow-bit/AFIN.git
cd AFIN

# Install dependencies (once project is scaffolded)
npm install

# Start development servers
npm run dev
```

---

## Project Structure

```
AFIN/
├── apps/
│   ├── web/          # Next.js Frontend
│   └── api/          # NestJS Backend
├── docs/
│   ├── AFIN_Enhanced_Workflow_Guide.md
│   └── MVP_Implementation_Plan.md
├── .gitignore
└── README.md
```

---

## User Roles

| Role | Access |
|------|--------|
| **Investor** | Register, KYC, browse bonds, invest, view portfolio |
| **Broker** | Manage investors, bonds, orders, allocations, payments |
| **Admin** | Full system access, user management, settings |

---

## License

Proprietary — All rights reserved.
