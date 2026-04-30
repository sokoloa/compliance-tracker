# Compliance Tracker

SOC 2 Type II & HIPAA compliance task tracker. Self-hosted on a single Ubuntu machine via Docker Compose.

---

## Starting the app (Docker — Ubuntu)

### Prerequisites

Install Docker and Docker Compose on your Ubuntu machine:

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to the docker group so you don't need sudo
sudo usermod -aG docker $USER

# Log out and back in, then verify
docker --version
docker compose version
```

---

### Step 1 — Copy the project to your server

If you're on Windows, copy the folder to your Ubuntu machine:

```bash
# From Windows PowerShell (replace IP and path as needed)
scp -r C:\Users\asokolowski\code\compliance-tracker user@your-server-ip:/home/user/compliance-tracker
```

Or clone from git if you've pushed it there.

---

### Step 2 — Create your environment file

```bash
cd /home/user/compliance-tracker

cp .env.example .env
```

Open `.env` and set a strong secret:

```bash
nano .env
```

Replace the `AUTH_SECRET` value with a real random string:

```bash
# Run this to generate one, then paste it into .env
openssl rand -base64 32
```

Your `.env` should look like:

```env
DATABASE_URL=postgresql://compliance:compliance@db:5432/compliance_tracker
AUTH_SECRET=paste-your-generated-secret-here
UPLOAD_DIR=/uploads
NEXTAUTH_URL=http://your-server-ip:3000
```

> Change `your-server-ip` to the actual IP or hostname of your Ubuntu machine.

---

### Step 3 — Build and start

```bash
docker compose up -d --build
```

This will:
1. Pull PostgreSQL 16
2. Build the Next.js app image
3. Run database schema migrations
4. Seed the 50-task compliance library
5. Start both containers in the background

First build takes 2–5 minutes. Check progress with:

```bash
docker compose logs -f
```

Wait until you see: `Starting application...`

---

### Step 4 — Create your admin account

Open your browser and go to:

```
http://your-server-ip:3000/setup
```

Fill in your name, email, and password. This page is only accessible once — it locks itself after the first account is created.

---

### Step 5 — Log in

Go to:

```
http://your-server-ip:3000
```

You'll be redirected to the login page. Use the credentials you just created.

---

### Done. You're in.

From here the app auto-generates task instances for the current and next year. Your dashboard will immediately show what's overdue and what's coming up.

---

## Day-to-day commands

```bash
# Start (after a reboot)
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f

# Restart just the app (after config changes)
docker compose restart app

# Check what's running
docker compose ps
```

---

## Auto-start on server reboot

The containers are set to `restart: unless-stopped`, so they come back automatically after a reboot with no extra configuration needed.

---

## Backups

```bash
# Backup the database
docker compose exec db pg_dump -U compliance compliance_tracker > backup_$(date +%Y%m%d).sql

# Restore from backup
docker compose exec -T db psql -U compliance compliance_tracker < backup_20260101.sql

# Backup uploaded evidence files
docker compose cp app:/uploads ./uploads_backup
```

---

## Moving to another machine

```bash
# 1. Back up data on the old machine
docker compose exec db pg_dump -U compliance compliance_tracker > backup.sql
docker compose cp app:/uploads ./uploads_backup

# 2. Copy project + backups to new machine
scp -r compliance-tracker backup.sql uploads_backup user@new-server:/home/user/

# 3. On the new machine — start fresh stack
cd /home/user/compliance-tracker
docker compose up -d --build

# 4. Restore data
docker compose exec -T db psql -U compliance compliance_tracker < /home/user/backup.sql
docker compose cp /home/user/uploads_backup/ app:/uploads/
```

---

## Running locally for development (no Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ running locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL to your local postgres, e.g.:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/compliance_tracker

# 3. Push schema + seed task library
npm run setup

# 4. Start dev server
npm run dev
```

Open `http://localhost:3000/setup` to create your account.

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string — points to `db` inside Docker |
| `AUTH_SECRET` | Random secret for JWT signing — generate with `openssl rand -base64 32` |
| `UPLOAD_DIR` | Where evidence files are stored — `/uploads` inside Docker (mounted volume) |
| `NEXTAUTH_URL` | Public URL of the app, e.g. `http://your-server-ip:3000` |
