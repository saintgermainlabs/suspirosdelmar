# End-to-End Form Testing Procedure

## Objective

Prove that the website's booking and contact forms work from the user's browser all the way through the automation infrastructure.

## Architecture Under Test

```text
Website
   │
   │ form submission
   ▼
n8n Webhook
   │
   ├── PostgreSQL
   │
   ├── Resend
   │    ├── Guest
   │    └── Staff
   │
   └── Evolution API
        └── Staff WhatsApp
```

## Phase 1 — Discover

Before testing:

1. Find the booking page.
2. Find the booking form.
3. Find the contact page.
4. Find the contact form.
5. Inspect form fields.
6. Identify required fields.
7. Identify submit buttons.
8. Identify success/error states.
9. Identify the n8n workflows involved.
10. Identify PostgreSQL tables.
11. Identify the relevant Evolution API destination.
12. Identify the configured staff email address.

Do not modify anything during discovery.

## Phase 2 — Booking Test

Generate a unique test ID.

Populate the booking form with realistic synthetic data.

Submit the form.

Capture:

- screenshot
- console errors
- network errors
- response information
- timestamp
- test ID

## Phase 3 — Locate n8n Execution

Use the n8n API.

Find the execution corresponding to the test.

Correlate using:

- timestamp
- webhook payload
- test ID
- email
- name
- other unique fields

Verify every relevant node.

## Phase 4 — Verify PostgreSQL

Use PostgreSQL API.

Search for the unique test ID.

Do not simply select the newest row.

Verify the exact record associated with this test.

Compare:

`FORM DATA vs n8n DATA vs DATABASE DATA`

## Phase 5 — Verify Guest Email

Determine the expected guest email address from the test payload.

Verify that the guest email was sent to that exact address.

Where provider delivery information is available, verify it.

Verify the message contains the test ID and expected booking/contact information.

## Phase 6 — Verify Staff Email

Verify:

`recipient = configured staff address`

Also verify:

- subject
- body
- test ID
- guest details
- booking/contact details

## Phase 7 — Verify WhatsApp

Verify:

`recipient = configured staff WhatsApp number`

Capture:

- Evolution API response
- message ID
- delivery status
- message content

Verify the unique test ID appears in the message.

## Phase 8 — Contact Test

Repeat the complete procedure using the contact form.

Use a different test ID.

## Phase 9 — Failure Investigation

When a failure occurs, inspect the layer immediately before and after the failure.

Example:

```text
PostgreSQL missing

Browser
  ↓
n8n webhook
  ↓
n8n PostgreSQL node
  ↓
PostgreSQL
```

Do not immediately assume PostgreSQL itself is broken.

## Phase 10 — Repair

If the cause is understood and the agent has permission to modify the system:

1. Make the smallest appropriate change.
2. Document the change.
3. Run the affected test.
4. Verify the result.
5. Run the complete booking test.
6. Run the complete contact test.

## Phase 11 — Final Verification

The system is green only when all twelve primary assertions pass.

### Booking

1. Browser
2. n8n
3. PostgreSQL
4. Guest email
5. Staff email
6. Staff WhatsApp

### Contact

7. Browser
8. n8n
9. PostgreSQL
10. Guest email
11. Staff email
12. Staff WhatsApp

## Important

Do not stop at:

> Form submitted successfully.

That is only the browser assertion.

The real test is:

```text
SUBMIT
  ↓
RECEIVE
  ↓
PROCESS
  ↓
STORE
  ↓
EMAIL GUEST
  ↓
EMAIL STAFF
  ↓
WHATSAPP STAFF
  ↓
VERIFY EVERYTHING
```

The system is not PASS until the entire chain is proven.
