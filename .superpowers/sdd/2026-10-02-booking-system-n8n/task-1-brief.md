# Task 1 Brief: Docker Compose Local Stack & Database Initialization

**Plan:** `docs/superpowers/plans/2026-10-02-booking-system-n8n.md`  
**Report File:** `.superpowers/sdd/2026-10-02-booking-system-n8n/task-1-report.md`  

## Requirements

1. Create `backend/init.sql` containing PostgreSQL database initialization schema with `uuid-ossp` extension, `submissions` table (with `id`, `form_type`, `name`, `email`, `phone`, `status`, `payload` JSONB, `created_at`, `updated_at`), `bookings` table (with `id`, `submission_id`, `guest_name`, `guest_email`, `guest_phone`, `checkin_date`, `checkout_date`, `guests_count`, `room_name`, `special_requests`, `status`, `created_at`), and performance indexes.
2. Create `backend/docker-compose.yml` with `postgres` (PostgreSQL 16 Alpine with healthcheck and init.sql mount), `n8n` (latest, connected to postgres database `suspiros_db`, port 5678), and `evolution-api` (atendai/evolution-api:v2.1.1, connected to postgres, port 8080).
3. Create `backend/.env.example` with environment variable defaults (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `N8N_ENCRYPTION_KEY`, `N8N_DOMAIN`, `EVOLUTION_DOMAIN`, `EVOLUTION_API_KEY`, `RESEND_API_KEY`).

## Deliverables
- `backend/init.sql`
- `backend/docker-compose.yml`
- `backend/.env.example`
- Report written to `.superpowers/sdd/2026-10-02-booking-system-n8n/task-1-report.md`
