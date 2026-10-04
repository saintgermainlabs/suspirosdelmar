# Task 3 Brief: Frontend Webhook Integration in Website

**Plan:** `docs/superpowers/plans/2026-10-02-booking-system-n8n.md`  
**Report File:** `.superpowers/sdd/2026-10-02-booking-system-n8n/task-3-report.md`  

## Requirements

1. Create top-level `.env.example` in the project root with `VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/submit`.
2. Modify `src/pages/Contact.tsx`:
   - Update `handleSubmit` to POST payload to `import.meta.env.VITE_N8N_WEBHOOK_URL || "http://localhost:5678/webhook/submit"`.
   - Send `form_type: "booking"` (or `"contact"` based on form selection), `name`, `email`, `phone`, `checkin`, `checkout`, `guests`, `room`, `message`.
   - Implement loading indicator state during submit (`isSubmitting`), error message display, and success state (`sent`).

## Deliverables
- `.env.example` (root)
- `src/pages/Contact.tsx`
- Report written to `.superpowers/sdd/2026-10-02-booking-system-n8n/task-3-report.md`
