# Universal Form QA System Design Specification

## Overview & Vision

The **Universal Form QA System** (`universal-form-tester`) is a reusable, framework-independent, IDE-agnostic web form QA platform.

It is designed to test forms across any frontend tech stack (React, Next.js, Vue, Svelte, plain HTML, WordPress, WooCommerce, Express, etc.) without generating bespoke Playwright test code for every form.

### Core Design Principle

> **Discovery is dynamic. Test execution is deterministic.**

- **Playwright MCP**: Used as an AI-assisted interactive exploration, discovery, and failure investigation layer.
- **Universal Form Schema**: The normalized JSON source of truth describing form structure, locators, validation rules, and endpoints.
- **Universal Playwright Engine**: A deterministic TypeScript execution layer that runs standard QA scenarios against form schemas, validating client DOM states, HTTP traffic, and downstream n8n webhook delivery.

---

## IDE Independence & Portability

The core testing system strictly avoids dependencies on any single IDE or AI vendor (Antigravity, Cursor, Kilo Code, Claude Code, VS Code, Windsurf, etc.).

- The core CLI and testing engine run natively via Node.js, TypeScript, and Playwright.
- AI instruction files (`AGENTS.md`, `.agents/*`, `CLAUDE.md`, `README.md`, `PROJECT_CONTEXT.md`) act as optional orchestration adapters around the core CLI engine.

---

## Three-Layer Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    AI / IDE Layer                       │
│    (Antigravity / Cursor / Claude Code / Kilo / etc.)   │
└────────────────────────────┬────────────────────────────┘
                             │ Orchestration & Reasoning
┌────────────────────────────▼────────────────────────────┐
│                    Playwright MCP                       │
│    (Discovery / Exploration / Debugging / Audit)        │
└────────────────────────────┬────────────────────────────┘
                             │ Discovered Schema Structure
┌────────────────────────────▼────────────────────────────┐
│                Universal Form Schema                    │
│    (Forms / Fields / Scenarios / Webhooks / Metadata)   │
└────────────────────────────┬────────────────────────────┘
                             │ Deterministic Execution Input
┌────────────────────────────▼────────────────────────────┐
│           Universal Playwright Test Engine              │
│    (Field Filling / Scenarios / Network / n8n)          │
└────────────────────────────┬────────────────────────────┘
                             │ Observability & Evidence
┌────────────────────────────▼────────────────────────────┐
│                       Reports                           │
│  (Pass / Fail / Skip / N/A / Drift / Screenshots)       │
└─────────────────────────────────────────────────────────┘
```

---

## Repository & Project Directory Structure

### 1. Central Engine Repository (`universal-form-tester/`)

```text
universal-form-tester/
├── src/
│   ├── discovery/
│   │   ├── page-scanner.ts          # Page crawler & internal link discovery
│   │   ├── form-scanner.ts          # DOM inspector for forms & input controls
│   │   └── form-normalizer.ts       # Converts DOM forms to normalized JSON schemas
│   ├── schema/
│   │   ├── form-schema.ts           # Zod runtime schema definitions & TypeScript types
│   │   └── schema-validator.ts      # Schema drift detection & diff generator
│   ├── engine/
│   │   ├── form-runner.ts           # Universal scenario execution engine
│   │   ├── field-filler.ts          # Type-aware field interaction handler
│   │   └── scenario-runner.ts       # Individual scenario runner
│   ├── data/
│   │   ├── test-data-generator.ts   # Deterministic synthetic test data generator
│   │   ├── semantic-generators.ts   # Value generators by semantic type
│   │   ├── invalid-data.ts          # Invalid/boundary test value generators
│   │   └── fixtures.ts              # Playwright test fixtures & environment
│   ├── scenarios/
│   │   ├── scenario-generator.ts    # Applicable scenario builder for a form
│   │   └── standard-scenarios.ts    # Scenario definitions (valid, invalid, boundary, etc.)
│   ├── validation/
│   │   ├── browser-validator.ts     # Client-side DOM & console error checks
│   │   ├── network-validator.ts     # HTTP request/response & payload inspection
│   │   ├── n8n-validator.ts         # Downstream n8n webhook execution verifier
│   │   └── accessibility-validator.ts # Form a11y & label validation
│   ├── reporting/
│   │   ├── result-reporter.ts      # Console, JSON, & HTML report generator
│   │   └── failure-reporter.ts     # Screenshot, trace, & network error logger
│   └── adapters/
│       ├── n8n-adapter.ts           # n8n API & webhook payload correlation
│       └── generic-http-adapter.ts  # REST/JSON HTTP submission verifier
├── schemas/
│   └── form.schema.json             # Formal JSON Schema definition
├── fixtures/
│   └── files/                       # Sample test upload files (.pdf, .jpg, .png)
├── templates/
│   ├── AGENTS.md                    # Root template AGENTS.md copied to target websites
│   ├── CLAUDE.md                    # Claude Code context adapter
│   └── agents/
│       ├── form-qa.md               # Dedicated Form QA Engineer role definition
│       ├── form-discovery.md        # Form discovery agent instruction
│       ├── form-debugger.md         # Failure diagnostic agent instruction
│       └── form-schema.md           # Schema maintenance instruction
├── .agents/
│   └── workflows/
│       ├── discover.md              # Discovery workflow
│       ├── test.md                  # Testing workflow
│       ├── debug.md                 # Failure diagnosis workflow
│       ├── onboard.md               # Site onboarding workflow
│       └── regression.md            # Regression testing workflow
├── docs/
├── tests/                           # Unit tests for the engine
├── playwright.config.ts             # Default Playwright configuration
├── package.json
├── PROJECT_CONTEXT.md
├── AGENTS.md
└── README.md
```

### 2. Onboarded Target Website Structure (`.formtest/` & `.agents/`)

Each target project using `universal-form-tester` receives:

```text
<target-website-root>/
├── .agents/
│   ├── form-qa/
│   │   └── AGENT.md                 # Universal Form QA Engineer agent definition
│   └── workflows/
│       ├── discover.md
│       ├── test.md
│       └── debug.md
├── .formtest/
│   ├── config.json                  # Target URL, timeouts, & n8n environment config
│   ├── forms/                       # Source of truth normalized form schemas
│   │   ├── contact.json
│   │   ├── booking.json
│   │   └── quote.json
│   ├── test-data/                   # Custom test data overrides
│   ├── fixtures/                    # Project-specific file upload test files
│   └── reports/                     # Output JSON test results & Playwright HTML reports
└── AGENTS.md                        # Root project rules for universal form compatibility
```

---

## Universal Form & Field JSON Schema

### 1. Form Schema Specification (`form.schema.json` & Zod Definition)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "UniversalFormSchema",
  "type": "object",
  "required": ["schemaVersion", "formId", "name", "page", "selector", "submission", "fields"],
  "properties": {
    "schemaVersion": { "type": "string", "default": "1.0" },
    "formId": { "type": "string" },
    "name": { "type": "string" },
    "page": {
      "type": "object",
      "required": ["url"],
      "properties": {
        "url": { "type": "string" },
        "title": { "type": "string" }
      }
    },
    "selector": {
      "type": "object",
      "required": ["strategy", "value"],
      "properties": {
        "strategy": {
          "type": "string",
          "enum": ["data-form-id", "data-testid", "id", "name", "css", "xpath"]
        },
        "value": { "type": "string" }
      }
    },
    "submission": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": { "type": "string", "enum": ["n8n", "rest", "form-post", "custom-js", "unknown"] },
        "method": { "type": "string", "enum": ["POST", "PUT", "GET"], "default": "POST" },
        "endpoint": { "type": "string" },
        "webhook": { "type": "string" }
      }
    },
    "steps": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "fields"],
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "fields": { "type": "array", "items": { "type": "string" } },
          "nextStepButton": {
            "type": "object",
            "properties": {
              "strategy": { "type": "string" },
              "value": { "type": "string" }
            }
          },
          "prevStepButton": {
            "type": "object",
            "properties": {
              "strategy": { "type": "string" },
              "value": { "type": "string" }
            }
          }
        }
      }
    },
    "fields": {
      "type": "array",
      "items": { "$ref": "#/definitions/FieldSchema" }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "discoveredAt": { "type": "string" },
        "lastVerifiedAt": { "type": "string" },
        "framework": { "type": "string" }
      }
    }
  }
}
```

### 2. Field Schema (HTML Controls vs Semantic Meaning)

```json
{
  "definitions": {
    "FieldSchema": {
      "type": "object",
      "required": ["id", "name", "htmlType", "semanticType", "required", "locator"],
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "htmlType": {
          "type": "string",
          "enum": [
            "text", "email", "password", "tel", "number", "date", "time", 
            "datetime", "url", "textarea", "select", "multiselect", "radio", 
            "checkbox", "checkbox-group", "file", "custom"
          ]
        },
        "semanticType": {
          "type": "string",
          "enum": [
            "name", "firstName", "lastName", "email", "phone", "company", 
            "jobTitle", "address", "city", "state", "country", "postcode", 
            "date", "time", "message", "comment", "description", "url", 
            "currency", "percentage", "number", "password", "file", "unknown"
          ]
        },
        "required": { "type": "boolean" },
        "locator": {
          "type": "object",
          "required": ["strategy", "value"],
          "properties": {
            "strategy": {
              "type": "string",
              "enum": [
                "data-form-field", "data-testid", "id", "name", "label", 
                "aria-label", "role", "placeholder", "css"
              ]
            },
            "value": { "type": "string" }
          }
        },
        "defaultValue": { "type": "string" },
        "options": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["label", "value"],
            "properties": {
              "label": { "type": "string" },
              "value": { "type": "string" }
            }
          }
        },
        "validationRules": {
          "type": "object",
          "properties": {
            "minLength": { "type": "integer" },
            "maxLength": { "type": "integer" },
            "pattern": { "type": "string" },
            "min": { "type": "number" },
            "max": { "type": "number" },
            "allowedFileExtensions": { "type": "array", "items": { "type": "string" } }
          }
        },
        "visibleWhen": {
          "type": "object",
          "required": ["field", "operator", "value"],
          "properties": {
            "field": { "type": "string" },
            "operator": { "type": "string", "enum": ["equals", "notEquals", "contains", "isTrue", "isFalse"] },
            "value": { "type": "string" }
          }
        }
      }
    }
  }
}
```

---

## Core Engine Modules

### 1. Discovery & Normalization (`src/discovery/`)

- **`page-scanner.ts`**: Uses Playwright to navigate internal links, await hydration (SPAs and SSR), and discover page URLs containing forms.
- **`form-scanner.ts`**: Inspects dynamic DOM trees, extracting field tags, ARIA attributes, validation rules, select options, and network endpoints.
- **`form-normalizer.ts`**: Converts discovered DOM controls into normalized JSON definitions.

### 2. Schema Drift Verification (`src/schema/schema-validator.ts`)

Invoked via `npm run formtest:verify`. Compares saved `.formtest/forms/*.json` schemas against live website DOMs:

- `[+] NEW FIELD`: Detects unmapped inputs.
- `[-] FIELD REMOVED`: Detects deleted inputs.
- `[~] FIELD TYPE CHANGED`: Detects control mutations.
- `[~] REQUIRED CHANGED`: Detects validation rule changes.
- Exits with status code `1` if drift is detected. **Schemas are never silently rewritten**.

### 3. Locator Ranking Hierarchy (`src/engine/locator-strategy.ts`)

Resolves element locators deterministically:

1. `data-testid`
2. `data-form-id` (for `<form>`)
3. `data-form-field`
4. Accessible label
5. `aria-label`
6. `name`
7. `role`
8. `placeholder`
9. `css` selector (fallback)

### 4. Deterministic Synthetic Test Data & Correlation ID (`src/data/`)

Generates synthetic data per semantic type (e.g. `Maria Test`, `formtest@example.com`, `+51999999999`).

Injects test correlation metadata into payloads:
```json
{
  "_formTest": true,
  "_testRunId": "FORMTEST-20261003-001",
  "_formId": "contact",
  "_scenario": "valid"
}
```

### 5. Scenario Generation & Status Classification (`src/scenarios/`)

Generates only applicable scenarios based on present fields:
- `valid`, `empty-submit`, `required-fields`, `invalid-email`, `invalid-phone`, `invalid-url`, `boundary-min`, `boundary-max`, `special-unicode`, `conditional-branching`, `multistep-navigation`, `file-upload`.

Status classification per scenario:
- **`PASS`**: Successful evidence gathered.
- **`FAIL`**: Unexpected DOM/network error or missing confirmation.
- **`SKIP`**: Blocked by safety guardrails or CAPTCHA.
- **`NOT_APPLICABLE`**: Scenario irrelevance (e.g. no email field).

### 6. Network, n8n, Security & Accessibility Validation (`src/validation/`)

- **Network Validation**: Monitors `page.on('request')` and `page.on('response')`. Redacts sensitive secrets (`passwords`, `tokens`, `cookies`, `authorization headers`).
- **n8n Webhook Adapter**: Routes through `N8N_BASE_URL`. Correlates `FORMTEST-*` execution IDs to verify downstream n8n execution when `N8N_TEST_TOKEN` or execution APIs are available.
- **CAPTCHA Safety**: Never silently bypasses CAPTCHA. Uses official test mode keys if present; otherwise marks affected scenarios as `SKIP` with explicit reasoning.
- **Custom Control Adapters**: Uses extensible control handlers (`src/engine/field-filler.ts`) for non-standard shadow-DOM or custom widgets rather than duplicating test engine logic.
- **Accessibility Checks**: Validates accessible labels, ARIA names, keyboard navigation reachability, and visible error message associations.

### 7. Evidence-Based Reporting (`src/reporting/`)

Produces structured results output to `.formtest/reports/result-<timestamp>.json`:

```json
{
  "testRunId": "FORMTEST-20261003-001",
  "formId": "contact",
  "scenario": "valid",
  "status": "passed",
  "evidence": {
    "formLocated": true,
    "fieldsFilled": true,
    "validationPassed": true,
    "requestSent": true,
    "responseStatus": 200,
    "confirmationFound": true,
    "n8nDelivered": true
  }
}
```

---

## 8-Phase Development Roadmap

1. **Phase 1 — Foundation**: TypeScript project setup, Playwright configuration, Zod schema types, JSON schema generation, and CLI skeleton.
2. **Phase 2 — Data Engine**: Semantic data generators, deterministic synthetic fixtures, invalid value generators, and `FORMTEST-*` correlation ID generation.
3. **Phase 3 — Execution Engine**: Type-aware generic field filler, form runner engine, scenario runner, and client DOM validation.
4. **Phase 4 — Discovery System**: Playwright MCP interaction workflows, DOM form scanner, schema normalizer, and schema file generator.
5. **Phase 5 — Integrations & Adapters**: Network request interception, payload secret redaction, n8n webhook adapter, and basic accessibility auditing.
6. **Phase 6 — Schema Drift System**: Live website vs. stored schema comparison, `npm run formtest:verify` command, and diff reporter.
7. **Phase 7 — Reporting & Artifacts**: Machine-readable JSON test reports, Playwright HTML report generation, screenshot capture on failure, and trace logging.
8. **Phase 8 — Packaging & Distribution**: Publishable npm package (`@sg-labs/universal-form-tester`), project onboarding template CLI (`npx universal-form-tester init`), and CI/CD integration.

---

## Definition of Done Checklist

Every feature and contribution must meet these criteria before completion:

```text
[ ] Read PROJECT_CONTEXT.md and AGENTS.md
[ ] Code compiles cleanly without TypeScript warnings
[ ] Core unit tests written and passing (`npm test`)
[ ] Playwright scenarios execute deterministically
[ ] Universal architecture preserved (no bespoke form functions)
[ ] Stable locators prioritized (data-testid, data-form-id, data-form-field)
[ ] Synthetic test data used exclusively
[ ] Secrets, passwords, and tokens redacted from logs/reports
[ ] Production safety controls enforced (no destructive actions)
[ ] Schema drift verified before schema updates
[ ] Failures investigated and evidence captured (screenshot, trace, network log)
[ ] Documentation and README updated
```

---

## Command Line Interface (CLI)

```bash
# Discovery
npm run formtest:discover -- --url=https://example.com

# Schema Drift Verification
npm run formtest:verify

# Execution
npm run formtest
npm run formtest -- --form=contact
npm run formtest -- --scenario=valid
npm run formtest -- --form=contact --scenario=invalid-email

# Reporting & n8n Audit
npm run formtest:report
npm run formtest:n8n
```

---

## Universal Form QA Engineer Subagent Definition (`.agents/form-qa/AGENT.md`)

```markdown
# Form QA Agent

## Role

You are the Universal Form QA Engineer.

Your responsibility is to discover, understand, test, diagnose and maintain forms across web applications using the Universal Form QA framework.

You specialize in:
- Playwright
- Playwright MCP
- browser automation
- HTML forms
- accessibility
- client-side validation
- network inspection
- n8n webhook submissions
- automated test data
- regression testing

## Core Principle

Never build a bespoke testing system for one form when the universal framework can be extended.

The universal schema is the source of truth.

The Playwright TypeScript engine executes the schema.

Playwright MCP is used for discovery and investigation.

## Responsibilities

### Discovery
Find: forms, fields, buttons, validation, conditional controls, multi-step behavior, submission mechanisms, network endpoints, n8n webhooks.

### Normalization
Convert discovered forms into the universal schema.

### Scenario Generation
Generate applicable scenarios automatically.

### Execution
Run the generic Playwright engine.

### Investigation
Use Playwright MCP when tests fail. Inspect: DOM, console, network, browser state, validation, requests, responses.

### Diagnosis
Determine whether a failure is: application bug, test bug, schema drift, environment issue, network issue, n8n issue, authentication issue, CAPTCHA, or expected behavior.

### Repair
When authorized to repair: identify root cause, make smallest appropriate change, run affected test, run regression tests.

## Output
Provide a concise final report: forms discovered, scenarios executed, passed, failed, skipped, schema changes, application changes, remaining issues.
```
