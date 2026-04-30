# Compliance Tracker

SOC 2 Type II & HIPAA compliance task tracker. Self-hosted, runs on a single Ubuntu machine via Docker Compose.

## Quick Start (Docker — recommended)

### 1. Clone and configure

```bash
cp .env.example .env
```

Edit `.env` and set a strong `AUTH_SECRET`:

```bash
# Generate a secret:
openssl rand -base64 32
```

### 2. Start the stack

```bash
docker compose up -d
```

This starts PostgreSQL and the Next.js app. On first boot, it runs database migrations and seeds the task library automatically.

### 3. First-time setup

Open `http://localhost:3000/setup` in your browser to create your admin account.

After that, visit `http://localhost:3000` and log in.

---

## Running without Docker (development)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ running locally

### Setup

```bash
npm install

# Set your DATABASE_URL in .env
cp .env.example .env

# Push schema and seed task library
npm run setup

npm run dev
```

Visit `http://localhost:3000/setup` to create your admin account.

---

## Moving to another machine

```bash
# On source machine — export data
docker compose exec db pg_dump -U compliance compliance_tracker > backup.sql

# Copy docker-compose.yml, .env, and backup.sql to target machine
# On target machine:
docker compose up -d
docker compose exec -T db psql -U compliance compliance_tracker < backup.sql

# To also move uploaded evidence files:
docker compose cp app:/uploads ./uploads_backup       # export
docker compose cp ./uploads_backup/ app:/uploads/     # import on target
```

---

## Features

- **Dashboard** — Overdue tasks, upcoming (90-day window), completion stats
- **Tasks** — Filter by framework, frequency, category, status; search
- **Task detail** — Complete tasks with notes and/or evidence files; track approver name, title, team, and date
- **Evidence preview** — PDFs, images, CSVs (as table), and Word docs (.docx) all preview in-browser; download any file
- **Task Library** — View all 50 pre-loaded SOC 2 + HIPAA tasks; activate/deactivate individual tasks
- **Audit Log** — Full audit trail: who completed what, when, with how many files and whether approval was recorded

## Framework coverage

| Area | Tasks |
|------|-------|
| SOC 2 CC1–CC9 | Control environment, communication, risk, monitoring, access, operations, change management, risk mitigation |
| SOC 2 A1 | Availability |
| SOC 2 C1 | Confidentiality |
| SOC 2 PI1 | Processing Integrity |
| SOC 2 P | Privacy |
| HIPAA Administrative | Risk analysis, training, BAAs, policies, sanctions |
| HIPAA Physical | Facility access, workstation, device controls |
| HIPAA Technical | Access controls, encryption, audit logs, emergency access |

Tasks that satisfy both SOC 2 and HIPAA are tagged **SOC 2 + HIPAA**.

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for JWT signing (use `openssl rand -base64 32`) |
| `UPLOAD_DIR` | Directory for uploaded evidence files (default: `./uploads`) |
| `NEXTAUTH_URL` | Public URL of the app (e.g., `http://your-server:3000`) |
# compliance-tracker
