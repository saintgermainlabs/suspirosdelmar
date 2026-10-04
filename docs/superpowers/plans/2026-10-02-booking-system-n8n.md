# Booking & Form Submission System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a reusable backend service stack (n8n + PostgreSQL + Evolution API + Resend Email) deployed via Docker Compose / Coolify, and connect it to the React website booking & contact form.

**Architecture:** A unified HTTP POST webhook endpoint (`/webhook/submit`) receives booking or contact form entries from the frontend. n8n routes the request based on `form_type`, persists the data into PostgreSQL `submissions` and `bookings` tables, sends a transactional HTML email via Resend, and triggers an automated WhatsApp message via Evolution API.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Docker Compose, PostgreSQL 16, n8n, Evolution API v2.1.1, Resend / Postmark API.

**Spec:** [`docs/superpowers/specs/2026-10-02-booking-system-n8n-design.md`](file:///home/god/websites/suspiros/docs/superpowers/specs/2026-10-02-booking-system-n8n-design.md)

## Global Constraints

- Database: PostgreSQL 16 Alpine with `uuid-ossp` extension.
- Workflow: n8n webhook path `/webhook/submit` accepting JSON body with `form_type` (`"booking"` | `"contact"`).
- WhatsApp: Evolution API v2.1.1 POST endpoint `/message/sendText/{instance_name}`.
- Frontend: `src/pages/Contact.tsx` fallback to local `http://localhost:5678/webhook/submit` if `VITE_N8N_WEBHOOK_URL` is undefined.

---

### Task 1: Docker Compose Local Stack & Database Initialization

**Files:**
- Create: `backend/docker-compose.yml`
- Create: `backend/init.sql`
- Create: `backend/.env.example`

**Interfaces:**
- Consumes: PostgreSQL 16 image, n8n image, Evolution API v2.1.1 image.
- Produces: Local container infrastructure running on ports 5678 (n8n), 8080 (Evolution API), 5432 (PostgreSQL) with pre-initialized `submissions` and `bookings` tables.

- [ ] **Step 1: Create `backend/init.sql` with database schema**

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    guests_count INT DEFAULT 1,
    room_name VARCHAR(255),
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_submissions_type_date ON submissions(form_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(checkin_date, checkout_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
```

- [ ] **Step 2: Create `backend/docker-compose.yml`**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: suspiros_postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-suspiros_admin}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-suspiros_secret_pass}
      POSTGRES_DB: ${POSTGRES_DB:-suspiros_db}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-suspiros_admin} -d ${POSTGRES_DB:-suspiros_db}"]
      interval: 10s
      timeout: 5s
      retries: 5

  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    container_name: suspiros_n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${POSTGRES_DB:-suspiros_db}
      - DB_POSTGRESDB_USER=${POSTGRES_USER:-suspiros_admin}
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD:-suspiros_secret_pass}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY:-a_very_secret_32_character_key_12}
      - N8N_HOST=${N8N_DOMAIN:-localhost}
      - WEBHOOK_URL=http://${N8N_DOMAIN:-localhost}:5678/
      - GENERIC_TIMEZONE=America/Bogota
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy

  evolution-api:
    image: atendai/evolution-api:v2.1.1
    container_name: suspiros_evolution_api
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=http://${EVOLUTION_DOMAIN:-localhost}:8080
      - AUTHENTICATION_API_KEY=${EVOLUTION_API_KEY:-evolution_secret_key_123}
      - DATABASE_ENABLED=true
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgres://${POSTGRES_USER:-suspiros_admin}:${POSTGRES_PASSWORD:-suspiros_secret_pass}@postgres:5432/${POSTGRES_DB:-suspiros_db}?schema=evolution
      - DATABASE_SAVE_DATA_INSTANCE=true
      - DATABASE_SAVE_DATA_NEW_MESSAGE=true
    volumes:
      - evolution_instances:/evolution/instances
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
  n8n_data:
  evolution_instances:
```

- [ ] **Step 3: Create `backend/.env.example`**

```env
POSTGRES_USER=suspiros_admin
POSTGRES_PASSWORD=suspiros_secret_pass
POSTGRES_DB=suspiros_db
N8N_ENCRYPTION_KEY=a_very_secret_32_character_key_12
N8N_DOMAIN=localhost
EVOLUTION_DOMAIN=localhost
EVOLUTION_API_KEY=evolution_secret_key_123
RESEND_API_KEY=re_123456789
```

- [ ] **Step 4: Verify Docker Compose syntax**

Run: `docker compose -f backend/docker-compose.yml config`
Expected: Valid YAML output without syntax errors.

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat(backend): add docker compose stack and postgres init schema"
```

---

### Task 2: n8n Workflow JSON & Template Definition

**Files:**
- Create: `backend/n8n/workflows/booking_submission_pipeline.json`

**Interfaces:**
- Consumes: HTTP POST payload from website (`form_type`, `name`, `email`, `phone`, `checkin`, `checkout`, `guests`, `room`, `message`).
- Produces: SQL queries to PostgreSQL `submissions` & `bookings` tables, HTTP POST to Resend Email API, and HTTP POST to Evolution API.

- [ ] **Step 1: Create n8n Workflow JSON blueprint file**

Create `backend/n8n/workflows/booking_submission_pipeline.json` containing the n8n JSON schema for:
1. **Webhook Node:** `POST /webhook/submit`
2. **Switch Node:** Evaluate `form_type`
3. **PostgreSQL Node:** `INSERT INTO submissions ... RETURNING id` followed by `INSERT INTO bookings ...`
4. **Resend Email Node:** `POST https://api.resend.com/emails`
5. **Evolution API Node:** `POST http://evolution-api:8080/message/sendText/suspiros_instance`
6. **Respond to Webhook Node:** `HTTP 200 { "success": true, "submission_id": "..." }`

- [ ] **Step 2: Commit**

```bash
git add backend/n8n/
git commit -m "feat(n8n): add booking and submission workflow template"
```

---

### Task 3: Frontend Webhook Integration in Website

**Files:**
- Modify: `src/pages/Contact.tsx`
- Create: `.env.example`

**Interfaces:**
- Consumes: Form state in `Contact.tsx` (`name`, `email`, `phone`, `checkin`, `checkout`, `guests`, `roomIndex`, `message`).
- Produces: HTTP POST request to `import.meta.env.VITE_N8N_WEBHOOK_URL || "http://localhost:5678/webhook/submit"`.

- [ ] **Step 1: Create top-level `.env.example`**

```env
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/submit
```

- [ ] **Step 2: Update `src/pages/Contact.tsx` form submit handler**

Update `Contact.tsx` line 33-70 to submit the form state to `VITE_N8N_WEBHOOK_URL` with payload `form_type: "booking"`, displaying loading state and success feedback.

- [ ] **Step 3: Run static analysis & build check**

Run: `npm run build`
Expected: Successful Vite build without TypeScript or JSX errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Contact.tsx .env.example
git commit -m "feat(frontend): integrate contact and booking form with n8n webhook"
```
