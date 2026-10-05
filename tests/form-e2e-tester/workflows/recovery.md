# Failure Recovery Guide

## General rule

Do not patch blindly.

First establish which boundary failed.

```text
Browser
  ↓
Webhook
  ↓
n8n
  ↓
PostgreSQL
  ↓
Resend
  ↓
Evolution API
```

## Browser failure

Check:

- required fields
- client-side validation
- JavaScript console
- network request
- HTTP status
- server response
- CORS/CSP if applicable

## n8n failure

Check:

- workflow activation
- webhook endpoint
- execution history
- node errors
- credentials
- payload mapping

## PostgreSQL failure

Check:

- connection
- database/schema/table
- permissions
- transaction status
- field mapping
- constraints

Never solve a PostgreSQL problem by deleting data.

## Guest/staff email failure

Check:

- recipient mapping
- Resend node configuration
- sender/domain configuration
- provider response
- n8n execution data

A successful n8n node alone is insufficient if the available provider evidence says delivery failed.

## WhatsApp failure

Check:

- Evolution API connectivity
- instance state
- destination number
- message request
- Evolution response
- message ID
- delivery status

HTTP 200 alone is not enough when a delivery status can be queried.

## After every fix

Always:

```text
affected test
    ↓
booking E2E
    ↓
contact E2E
```

This is mandatory regression testing.
