# Task 2 Report: n8n Workflow JSON & Template Definition

**Status:** DONE  
**Completed At:** 2026-10-02T20:56:10-05:00  
**Deliverable Created:** `backend/n8n/workflows/booking_submission_pipeline.json`

---

## Summary of Implementation

Created the complete n8n workflow definition (`booking_submission_pipeline.json`) for ingesting, persisting, and processing form submissions and booking requests for Los Suspiros del Mar.

### Node Pipeline Specifications:

1. **Webhook Trigger Node (`Webhook Trigger`):**
   - Type: `n8n-nodes-base.webhook`
   - Method: `POST`
   - Path: `/webhook/submit` (`submit` path parameter)
   - Mode: `responseNode` (waits for final response before returning HTTP 200 to client)

2. **Switch Router Node (`Switch Form Type`):**
   - Type: `n8n-nodes-base.switch`
   - Rule Evaluation: Checks `form_type` in payload (`"booking"` vs `"contact"`).
   - Output 0: Routes to `Insert Submission (Booking)` -> `Insert Booking`
   - Output 1: Routes to `Insert Submission (Contact)`

3. **PostgreSQL Nodes:**
   - **`Insert Submission (Booking)` / `Insert Submission (Contact)`:**
     - Query: `INSERT INTO submissions (form_type, name, email, phone, status, payload) VALUES (...) RETURNING id AS submission_id...`
   - **`Insert Booking`:**
     - Query: `INSERT INTO bookings (submission_id, guest_name, guest_email, guest_phone, checkin_date, checkout_date, guests_count, room_name, special_requests, status) VALUES (...) RETURNING id AS booking_id, submission_id;`

4. **Resend Email Node (`Send Resend Email`):**
   - Type: `n8n-nodes-base.httpRequest`
   - Endpoint: `POST https://api.resend.com/emails`
   - Headers: `Authorization: Bearer {{ $env.RESEND_API_KEY }}`, `Content-Type: application/json`
   - Body: Sends transactional HTML confirmation email to the user.

5. **Evolution API Node (`Send WhatsApp Notification`):**
   - Type: `n8n-nodes-base.httpRequest`
   - Endpoint: `POST http://evolution-api:8080/message/sendText/suspiros_instance`
   - Headers: `apikey: {{ $env.EVOLUTION_API_KEY }}`, `Content-Type: application/json`
   - Body: Sends automated WhatsApp notification via Evolution API gateway.

6. **Respond to Webhook Node (`Respond to Webhook`):**
   - Type: `n8n-nodes-base.respondToWebhook`
   - Status: `HTTP 200`
   - Payload: `{ "success": true, "submission_id": "...", "message": "Submission processed successfully" }`

---

## Verification & Status

- File created at `file:///home/god/websites/suspiros/backend/n8n/workflows/booking_submission_pipeline.json`
- Validated JSON structure and node connections.
- Status: **DONE**
