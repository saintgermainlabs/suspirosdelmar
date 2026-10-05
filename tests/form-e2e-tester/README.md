# Form E2E Tester

Reusable autonomous end-to-end testing scaffold for web forms and downstream automation.

## System under test

```text
Website
   ↓
n8n
   ├── PostgreSQL
   ├── Resend → Guest
   ├── Resend → Staff
   └── Evolution API → Staff WhatsApp
```

## Supported forms

- Hotel booking
- Contact

## Available integrations

The intended test agent has access to:

- Playwright
- n8n API
- PostgreSQL API
- Evolution API

## Test philosophy

A browser submission is only the beginning of a test.

A complete PASS requires independent evidence that:

1. The form submitted.
2. n8n received and processed it.
3. PostgreSQL stored the data.
4. The guest email was sent to the correct address.
5. The staff email was sent to the correct address.
6. The staff WhatsApp message was sent and delivered where delivery status is available.
7. Data remained correct across the pipeline.

See `AGENTS.md` for the autonomous agent rules and `TESTING.md` for the operating procedure.

## Configuration

Copy:

```text
config/test-environment.example.yaml
```

to a local/private configuration file and fill in environment-specific values.

Do not commit credentials, API tokens, passwords, or private phone numbers.

## Evidence

Test evidence belongs under:

```text
evidence/<test-id>/
```

## Reports

Final and intermediate test reports belong under:

```text
reports/
```

## Important

This repository is a testing scaffold. It intentionally does not contain production credentials or hard-coded customer data.
