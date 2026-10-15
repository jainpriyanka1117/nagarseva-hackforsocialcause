# NagarSeva — Testing & Sample Data Guide

This document describes the automated test suite, sample datasets, and testing methodology implemented in **NagarSeva**.

---

## 1. Quick Start

Run the entire test suite using Vitest:

```sh
npm test
```

Run tests in watch mode during development:

```sh
npx vitest
```

Run tests with code coverage:

```sh
npx vitest run --coverage
```

---

## 2. Test Suite Overview

NagarSeva utilizes [Vitest](https://vitest.dev/) for high-speed, isolated unit and integration testing. The test suite is located under `src/test/` and consists of two primary suites:

1. **`src/test/backend.test.ts`** — Backend integration, database initialization, cryptography, SLA calculation, and lifecycle verification (17 tests).
2. **`src/test/app-routing.test.tsx`** — Application shell, layout mounting, and client route navigation (2 tests).

### Summary of Automated Test Cases

| Category | Test Case | Description |
|---|---|---|
| **Database & Seeding** | `initializes tables and seeds default complaints` | Verifies that all SQLite tables are created and seeded with default complaints (e.g. `NS-24-01847`). |
| **Database & Seeding** | `seeds default users with hashed passwords` | Confirms officer and citizen accounts are seeded with PBKDF2 hashed credentials that authenticate properly. |
| **Authentication** | `authenticates existing user and returns JWT token` | Validates login flow, role retrieval, and JWT signing with embedded claims (`userId`, `role`, `ward`). |
| **Authentication** | `rejects invalid credentials` | Ensures incorrect passwords or unknown emails throw explicit authentication errors. |
| **Authentication** | `registers new citizen and issues token` | Validates registration of new citizen accounts and immediate session token issuance. |
| **Authentication** | `rejects duplicate email registration` | Ensures email uniqueness constraint and rejects duplicate user registration attempts. |
| **Authentication** | `handles invalid or expired tokens gracefully` | Verifies `verifyToken` returns `null` for malformed, tampered, or empty token strings. |
| **Lifecycle & CRUD** | `creates a new complaint with SLA and timeline` | Submits a new grievance, generates standard `NS-24-XXXXX` identifier, computes SLA deadline, and records timeline. |
| **Lifecycle & CRUD** | `allows officer to accept and resolve grievance` | Advances issue through `In Progress` to `Resolved — pending verification` with officer resolution notes and timestamp. |
| **Lifecycle & CRUD** | `allows citizen to verify closure` | Citizen inspects resolution and confirms satisfactory fix, transitioning issue to `Closed: verified`. |
| **Lifecycle & CRUD** | `allows citizen to reopen issue if dissatisfied` | Simulates failed resolution: citizen rejects fix with feedback, resetting state to `Reopened` and logging audit event. |
| **SLA Engine** | `calculates SLA deadlines accurately according to priority` | Validates SLA targets: `12h` for High priority/hazards, `48h` for Medium, `72h` for Low. |
| **SLA Engine** | `formats remaining SLA deadlines and detects overdue issues` | Tests `formatRemaining` for future deadlines (`Xh Ym remaining`) and past deadlines (`Overdue by Xh`). |
| **Grievance Queries** | `filters complaints by ward, category, and safety` | Validates query filters for ward scoping, category matching, and safety hazard flags. |
| **Analytics & Map** | `computes ward statistics and metrics` | Validates calculation of median resolution time, escalation rate, reopen rate, and category breakdowns. |
| **Analytics & Map** | `returns safety map coordinates` | Validates geospatial point projection (`x`, `y` coordinates) for community safety map rendering. |
| **Evidence & Upload** | `saves evidence attachment and attaches to complaint` | Simulates file upload, decodes Base64 image payload, saves to `public/uploads/`, and links to complaint. |

---

## 3. Sample Data Structure

A comprehensive fixture dataset is available in [`src/data/sample-data.json`](../src/data/sample-data.json). It provides:

- **Seed User Accounts**: Pre-configured citizen, officer, and admin profiles.
- **Sample Grievances**: Complaints across various stages (`Submitted`, `In Progress`, `Resolved — pending verification`, `Closed: verified`, `Reopened`).
- **Audit Timelines**: Step-by-step event history demonstrating officer assignments, field dispatches, and citizen reviews.
- **Sample REST Payloads**: Pre-formatted JSON bodies for `POST /api/complaints`, `PATCH /api/complaints/:id`, and `POST /api/auth/login`.

### Pre-Configured Test Accounts

| Role | Email | Password | Assigned Ward |
|---|---|---|---|
| **Citizen** | `citizen@nagarseva.org` | `Citizen123!` | Ward 82 (Indiranagar) |
| **Officer** | `officer@nagarseva.org` | `Officer123!` | Ward 82 (Indiranagar) |
| **Admin** | `admin@nagarseva.org` | `Admin123!` | Headquarters |

---

## 4. End-to-End Manual Testing Scenarios

### Scenario A: Citizen Grievance Submission
1. Open `http://localhost:5173/report`.
2. Select category **Blocked drain**, enter address **12th Cross**, and select **High priority**.
3. Submit the form.
4. Verify you are redirected to the complaint tracking receipt with an assigned identifier (`NS-24-XXXXX`) and active SLA counter.

### Scenario B: Officer Workflow
1. Open `http://localhost:5173/officer`.
2. Inspect the complaints table for Ward 82.
3. Click **Begin work** on a submitted grievance (status changes to `In Progress`).
4. Click **Submit evidence** and record completion notes (status changes to `Resolved — pending verification`).

### Scenario C: Citizen Verification & Reopen Loop
1. Open the resolved complaint detail page (`http://localhost:5173/complaint/:id`).
2. Verify the resolution notes submitted by the officer are visible.
3. To confirm: Click **Verify & Close** $\rightarrow$ Status becomes `Closed: verified`.
4. To contest: Click **Reopen Issue** and provide notes $\rightarrow$ Status becomes `Reopened`.
