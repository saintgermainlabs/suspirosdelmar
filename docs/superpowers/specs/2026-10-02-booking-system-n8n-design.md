# Booking & Form Submission System Design Specification

**Date:** 2026-10-02  
**Status:** Approved  
**Target Application:** Los Suspiros del Mar (`suspiros`)  

---

## 1. Overview & Objective

Build a reusable, multi-tenant capable backend automation system to handle online bookings and generic form submissions (contact forms, inquiries). 

Incoming requests are ingested via an n8n webhook, stored in a PostgreSQL database, and processed to dispatch confirmation emails (via Resend/Postmark) and WhatsApp notifications (via Evolution API). The production environment will be deployed using Coolify, with local development supported via standard Docker Compose.

---

## 2. Architecture & Data Flow

```
[React Frontend] ──(POST /webhook/submit)──> [n8n Webhook Router]
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 ▼                                                                     ▼
     [form_type == "booking"]                                              [form_type == "contact"]
                 │                                                                     │
  1. Insert into PostgreSQL                                             1. Insert into PostgreSQL
     (`submissions` & `bookings`)                                          (`submissions`)
  2. Send Email (Resend API)                                            2. Send Email (Resend API)
  3. Send WhatsApp (Evolution API)                                      3. Send WhatsApp (Evolution API)
                 │                                                                     │
                 └──────────────────────────────────┬──────────────────────────────────┘
                                                    │
                                                    ▼
                                     HTTP 200 Response to Frontend
```

### Components:
- **Frontend Website:** React + TypeScript app (`suspiros`) posting booking/contact payloads to n8n.
- **n8n Automation Engine:** Orchestrates webhook ingestion, SQL persistence, email API calls, and WhatsApp API calls.
- **PostgreSQL Database:** Primary datastore containing `submissions` (generic form table) and `bookings` (reservation details table).
- **Evolution API:** Self-hosted WhatsApp gateway container communicating directly with WhatsApp numbers via QR code session.
- **Resend / Postmark API:** Transactional email service for HTML notifications.
- **Coolify / Docker Compose:** Orchestrates containers locally (Docker Compose) and in production (Coolify stack).

---

## 3. Database Schema (PostgreSQL)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: Universal Submissions Table (stores all incoming form entries)
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_type VARCHAR(50) NOT NULL,            -- 'booking', 'contact', 'inquiry'
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',        -- 'pending', 'processed', 'archived'
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,  -- dynamic/custom form fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Dedicated Bookings Table (structured for date range & availability queries)
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
    status VARCHAR(50) DEFAULT 'pending',        -- 'pending', 'confirmed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_type_date ON submissions(form_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(checkin_date, checkout_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
```

---

## 4. n8n Workflow & Notifications

### Webhook Payload Specification (`POST /webhook/submit`)
```json
{
  "form_type": "booking",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+573001234567",
  "checkin": "2026-11-01",
  "checkout": "2026-11-05",
  "guests": "2",
  "room": "Master Suite",
  "message": "Looking forward to our stay!"
}
```

### Evolution API Payload (WhatsApp Outbound)
- **Endpoint:** `http://evolution-api:8080/message/sendText/${EVOLUTION_INSTANCE_NAME}`
- **Headers:** `apikey: ${EVOLUTION_API_KEY}`
- **Message Content:** Custom greeting with guest name, check-in, check-out, guest count, and confirmation text.

---

## 5. Deployment Stack (Coolify & Local Docker Compose)

### Services Definition (`docker-compose.yml`)
- `postgres`: PostgreSQL 16 Alpine datastore with healthcheck.
- `n8n`: Workflow engine connected to `postgres` with persistent volume `/home/node/.n8n`.
- `evolution-api`: WhatsApp gateway v2.1.1 connected to PostgreSQL `evolution` schema and persistent volume `/evolution/instances`.

---

## 6. Frontend Integration

Updating `src/pages/Contact.tsx` in `suspiros` to POST payload to `import.meta.env.VITE_N8N_WEBHOOK_URL || "http://localhost:5678/webhook/submit"`.

---

## 7. Verification Plan

1. **Local Docker Stack Launch:** `docker compose up -d` verifying all 3 containers are healthy.
2. **Database Migration Verification:** Run initial SQL schema against `postgres`.
3. **n8n Webhook Workflow Import:** Import n8n JSON workflow and configure nodes.
4. **End-to-End Submission Test:** Submit a test booking from the frontend, verify record in PostgreSQL `submissions` & `bookings` tables, inspect Resend email trigger, and verify WhatsApp message dispatch.
