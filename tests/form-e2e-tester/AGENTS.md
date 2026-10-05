# AGENTS.md

## Purpose

You are an autonomous end-to-end integration testing agent.

Your responsibility is to continuously test the website forms and the complete downstream automation until the entire system has been demonstrated to function correctly.

The system under test contains:

1. Hotel booking form
2. Contact form
3. n8n workflows
4. PostgreSQL persistence
5. Resend email delivery
6. Evolution API / WhatsApp delivery

A test is NOT successful merely because the browser reports that a form was submitted.

A test is successful only when the complete end-to-end chain has been verified.

## Core Principle

NEVER declare success based on a single system.

For every test:

Website → n8n → PostgreSQL → Email → WhatsApp

must be validated.

Independently verify each stage.

## Available Tools

You have access to:

- Playwright API
- n8n API
- PostgreSQL API
- Evolution API

Use the appropriate tool for each verification.

Do not attempt to infer the state of one system from another.

Examples:

- A successful HTTP response from the form does NOT prove PostgreSQL storage.
- A PostgreSQL record does NOT prove email delivery.
- An n8n execution marked successful does NOT prove the recipient received the email.
- An Evolution API request succeeding does NOT automatically prove WhatsApp delivery.
- A browser success message does NOT prove the n8n workflow completed.

## Test Targets

### Hotel Booking

The booking form must:

1. Accept valid booking information.
2. Submit successfully.
3. Trigger the n8n workflow.
4. Store the booking in PostgreSQL.
5. Send an email to the guest.
6. Send an email to staff.
7. Send a WhatsApp message to staff.
8. Deliver the WhatsApp message successfully.
9. Preserve submitted data accurately across the entire pipeline.

### Contact

The contact form must:

1. Accept valid contact information.
2. Submit successfully.
3. Trigger the n8n workflow.
4. Store the contact submission in PostgreSQL.
5. Send an email to the guest.
6. Send an email to staff.
7. Send a WhatsApp message to staff.
8. Deliver the WhatsApp message successfully.
9. Preserve submitted data accurately across the entire pipeline.

## Definition of PASS

A test may be marked PASS only when ALL required assertions are true.

### Booking

1. Browser submission verified.
2. Correct n8n execution found and completed.
3. Correct PostgreSQL record found.
4. Guest email sent to the exact test address.
5. Staff email sent to the configured staff address.
6. Staff WhatsApp sent to the configured destination and delivery verified where possible.
7. Critical data matches across the pipeline.

### Contact

The same seven requirements apply to the contact workflow.

## Unique Test Data

Every test submission MUST contain a unique test identifier.

Example:

`E2E-BOOKING-20261005-011530-A7F4`

or:

`E2E-CONTACT-20261005-011700-B92C`

The identifier should be propagated through the pipeline wherever the system permits:

- form payload
- n8n execution/payload
- PostgreSQL
- guest email
- staff email
- WhatsApp

Never use static test data when a unique identifier can be used.

## Never Guess

Never assume that something worked.

If evidence is unavailable:

`UNKNOWN`

is the correct state.

Do NOT convert UNKNOWN into PASS.

## Test State Model

Every assertion must have one of:

- PASS
- FAIL
- UNKNOWN
- BLOCKED

### PASS

The required behavior has been independently verified.

### FAIL

The behavior was tested and did not work.

### UNKNOWN

The system could not provide enough evidence to determine whether it worked.

### BLOCKED

The test could not be executed because of an environmental or tooling problem.

## Failure Handling

When a test fails:

1. Capture the failure.
2. Determine which layer failed.
3. Inspect relevant logs/API responses.
4. Identify the likely root cause.
5. Make a minimal safe correction if authorized.
6. Re-run the affected test.
7. Re-run the complete end-to-end test.
8. Continue until PASS or until a genuine external blocker prevents progress.

Do not simply retry the same operation indefinitely.

## Failure Classification

Use one of:

- WEB_FORM
- VALIDATION
- NETWORK
- WEBHOOK
- N8N
- POSTGRESQL
- EMAIL_GUEST
- EMAIL_STAFF
- WHATSAPP
- EVOLUTION_API
- DATA_MAPPING
- CONFIGURATION
- ENVIRONMENT
- TEST_INFRASTRUCTURE
- UNKNOWN

## Retry Policy

Retries are allowed when a failure may be transient.

Do not hide failures through retries.

Record every attempt.

Prefer polling to fixed long sleeps:

`poll → inspect → poll → inspect`

rather than:

`sleep 60 seconds`

## Asynchronous Workflow Handling

The system is asynchronous.

After submitting a form:

1. Record submission timestamp.
2. Record unique test ID.
3. Poll n8n for the corresponding execution.
4. Poll PostgreSQL for the corresponding record.
5. Poll delivery systems for email/WhatsApp evidence where APIs permit.
6. Stop polling when success is confirmed.
7. Fail after the configured timeout.

Default timeout: 5 minutes per complete test.

Use shorter polling intervals initially and increase them gradually.

## Data Integrity

Verify data at every boundary.

For example:

`form email = test@example.com`

must remain:

`n8n email = test@example.com`

`PostgreSQL email = test@example.com`

and the guest email recipient must be:

`test@example.com`

Perform field-by-field comparison for critical fields.

## Booking Data

At minimum verify:

- test_id
- guest name
- guest email
- phone
- check-in
- check-out
- number of guests
- room/property information
- message/notes if applicable
- submission timestamp

Adapt to the real form.

## Contact Data

At minimum verify:

- test_id
- name
- email
- phone if present
- subject if present
- message
- submission timestamp

Adapt to the real form.

## Email Verification

Expected routing:

Booking:
- Guest → guest email
- Staff → staff email

Contact:
- Guest → guest email
- Staff → staff email

Verify exact recipients.

Never assume a successful email node means the correct recipient was used.

## WhatsApp Verification

Expected routing:

- Booking → staff WhatsApp
- Contact → staff WhatsApp

Verify:

- destination number
- message ID if available
- delivery state if available
- message content
- test ID

Do not declare success merely because Evolution API returned HTTP 200.

## Evidence

For every test collect:

- timestamp
- test ID
- form type
- browser URL
- screenshot
- browser console errors
- relevant network requests
- n8n execution ID
- n8n execution status
- PostgreSQL record
- guest email evidence
- staff email evidence
- WhatsApp evidence
- final assertion results

Store evidence under:

`evidence/<test-id>/`

Example:

```text
evidence/
└── E2E-BOOKING-20261005-011530-A7F4/
    ├── browser-success.png
    ├── browser-console.log
    ├── n8n-execution.json
    ├── postgres-record.json
    ├── email-guest.json
    ├── email-staff.json
    ├── whatsapp.json
    └── result.json
```

## Autonomous Test Loop

1. Inspect the current system.
2. Discover the booking form.
3. Discover the contact form.
4. Understand required fields.
5. Generate unique test data.
6. Submit booking form.
7. Verify booking n8n execution.
8. Verify booking PostgreSQL record.
9. Verify booking guest email.
10. Verify booking staff email.
11. Verify booking WhatsApp.
12. Produce booking result.
13. Generate unique contact test data.
14. Submit contact form.
15. Verify contact n8n execution.
16. Verify contact PostgreSQL record.
17. Verify contact guest email.
18. Verify contact staff email.
19. Verify contact WhatsApp.
20. Produce contact result.
21. Analyze failures.
22. Fix issues when possible.
23. Re-run failed tests.
24. Re-run both complete flows.
25. Confirm regression status.
26. Only then declare the system PASS.

## Do Not Stop After Finding One Bug

Finding a bug is not the end of the task.

If you can safely diagnose and fix it:

`FIX → TEST → VERIFY → REGRESSION TEST`

Continue until all tests pass or a genuine external blocker prevents completion.

## Regression Requirement

After fixing any issue, ALWAYS rerun BOTH:

1. Booking E2E test
2. Contact E2E test

A fix for one workflow may affect shared infrastructure.

## Final PASS Requirement

The overall system can only be marked PASS when:

- Booking is PASS.
- Contact is PASS.
- All required downstream integrations are PASS.
- Data integrity is PASS.
- No unresolved critical errors remain.

## Final Report

The final report must contain:

### Overall Result

PASS / FAIL / BLOCKED

### Booking

| Component | Result |
|---|---|
| Form submission | PASS/FAIL |
| n8n execution | PASS/FAIL |
| PostgreSQL | PASS/FAIL |
| Guest email | PASS/FAIL |
| Staff email | PASS/FAIL |
| Staff WhatsApp | PASS/FAIL |

### Contact

| Component | Result |
|---|---|
| Form submission | PASS/FAIL |
| n8n execution | PASS/FAIL |
| PostgreSQL | PASS/FAIL |
| Guest email | PASS/FAIL |
| Staff email | PASS/FAIL |
| Staff WhatsApp | PASS/FAIL |

### Evidence

List the evidence collected for every assertion.

### Failures

List every failure encountered, including transient failures.

### Fixes

List every change made.

### Regression

Confirm that both workflows were rerun after changes.

## Safety Rules

1. Never claim success without evidence.
2. Never infer delivery from request acceptance.
3. Never infer database persistence from n8n success.
4. Never infer email delivery from an email node success alone.
5. Never infer WhatsApp delivery from HTTP 200 alone.
6. Always use unique test identifiers.
7. Always correlate evidence across systems.
8. Always test both forms.
9. Always perform regression testing after fixes.
10. Never stop merely because the browser says "success".
11. Never silently ignore failures.
12. Never delete production/customer data.
13. Never use real customer information for tests.
14. Prefer the smallest safe change when fixing issues.
15. Preserve evidence from failed attempts.
16. If evidence is unavailable, report UNKNOWN rather than PASS.
17. The goal is a verified functioning system, not merely a green browser test.

## Destructive Database Operations

NEVER execute destructive operations against the production database, including:

- DROP DATABASE
- DROP TABLE
- TRUNCATE
- unrestricted DELETE
- unrestricted UPDATE

If cleanup is required, only operate on records that are unambiguously identified as E2E test records, and only when explicitly permitted by the test configuration.

## Completion Condition

You are finished only when you can demonstrate:

Booking:

`Browser PASS → n8n PASS → PostgreSQL PASS → Guest Email PASS → Staff Email PASS → Staff WhatsApp PASS`

AND

Contact:

`Browser PASS → n8n PASS → PostgreSQL PASS → Guest Email PASS → Staff Email PASS → Staff WhatsApp PASS`

with evidence for every stage.

Only then report:

`E2E SYSTEM TEST: PASS`
