# Task 2 Brief: n8n Workflow JSON & Template Definition

**Plan:** `docs/superpowers/plans/2026-10-02-booking-system-n8n.md`  
**Report File:** `.superpowers/sdd/2026-10-02-booking-system-n8n/task-2-report.md`  

## Requirements

1. Create `backend/n8n/workflows/booking_submission_pipeline.json` containing the n8n JSON workflow template.
2. The workflow must define the following node pipeline:
   - **Webhook Trigger Node:** Method `POST`, Path `/webhook/submit`.
   - **Switch Node (Router):** Evaluates `form_type` in the incoming payload (`"booking"` vs `"contact"`).
   - **PostgreSQL Node:** Inserts into `submissions` table (returning `id`) and inserts into `bookings` table when `form_type == "booking"`.
   - **Resend Email Node:** Sends confirmation email via `POST https://api.resend.com/emails`.
   - **Evolution API Node:** Sends WhatsApp message via `POST http://evolution-api:8080/message/sendText/suspiros_instance`.
   - **Respond to Webhook Node:** Returns HTTP 200 with `{ "success": true, "submission_id": "..." }`.

## Deliverables
- `backend/n8n/workflows/booking_submission_pipeline.json`
- Report written to `.superpowers/sdd/2026-10-02-booking-system-n8n/task-2-report.md`
