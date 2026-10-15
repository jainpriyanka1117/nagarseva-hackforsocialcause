# NagarSeva

NagarSeva is a modern, open, and accountable fullstack civic engagement and municipal grievance tracking platform built with TanStack Start, React 19, TypeScript, Tailwind CSS, and Drizzle ORM with LibSQL/SQLite.

It empowers citizens to report neighbourhood problems, monitors municipal response SLAs, provides officers with resolution workflows, displays geospatial safety signals, and enforces citizen-verified issue closures.

---

## Architecture Overview

NagarSeva runs as an integrated fullstack application powered by **TanStack Start**:

- **Frontend & Routing**: Type-safe file-based routing (`@tanstack/react-router`), server-side rendering (SSR), and loaders.
- **Backend Server Functions**: Direct type-safe RPCs using `createServerFn` from `@tanstack/react-start`.
- **RESTful API**: Standard HTTP endpoints under `/api/*` for mobile apps and third-party municipal integrations.
- **Database & ORM**: Pure JS/WASM compatible SQLite via `@libsql/client` and [Drizzle ORM](https://orm.drizzle.team/), supporting zero-config local files (`local.db`) or cloud Turso databases.
- **Authentication & Security**: Web Crypto API standard PBKDF2 password hashing with random salt and HMAC-SHA256 JWT sessions via `jose`.

---

## Features

- **Civic Issue Reporting**: Multi-step grievance submission with category categorization, severity priority, photo evidence attachment, and map coordinates.
- **Automated SLA Engine**: Dynamic resolution deadlines based on issue urgency (e.g., 12 hours for High priority hazards, 48h for Medium, 72h for Low) with remaining time calculations.
- **Officer Operations Dashboard**: Municipal officer workflow to inspect assigned complaints, advance issues to `In Progress`, record resolution notes, and submit photographic proof of completion.
- **Citizen Verification & Reopen Loop**: Issues are resolved conditionally as `Resolved — pending verification`. Citizens can confirm resolution (`Closed: verified`) or reopen with feedback (`Reopened`).
- **Interactive Geospatial Safety Map**: Coordinate mapping with category filters (All reports, Civic issues, Safety signals) and time decay.
- **Ward Accountability Analytics**: Aggregated resolution speeds, escalation rates, reopen rates, and volume breakdown across wards.
- **Comprehensive Audit Timeline**: Every status transition, note, and assignment is timestamped and recorded in the database.

---

## Seed Accounts & Role Credentials

When the server runs, the database (`local.db`) is automatically initialized and seeded with sample civic grievances, timelines, and pre-configured accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Citizen** | `citizen@nagarseva.org` | `Citizen123!` | Report issues, track personal grievances, verify or reopen closures |
| **Municipal Officer** | `officer@nagarseva.org` | `Officer123!` | Review ward queue, update statuses, upload resolution proof |
| **Platform Admin** | `admin@nagarseva.org` | `Admin123!` | Departmental oversight, trust & abuse reviews, audit preview |

---

## REST API Reference

NagarSeva exposes standard RESTful HTTP endpoints alongside TanStack Start server functions:

### Complaints & Lifecycle
- `GET /api/complaints` — Retrieve complaints with optional query filters (`?ward=...&status=...&category=...`).
- `POST /api/complaints` — Submit a new civic grievance.
- `GET /api/complaints/:id` — Retrieve full complaint details, timeline history, and evidence attachments.
- `PATCH /api/complaints/:id` — Transition status (`Accepted`, `In Progress`, `Resolved — pending verification`, `Closed: verified`, `Reopened`) with actor notes and evidence.

### Analytics & Safety Map
- `GET /api/stats` — Retrieve ward responsiveness metrics and geospatial safety coordinates (`?ward=Ward+82`).

### Authentication
- `POST /api/auth/register` — Create a new citizen or officer account with hashed credentials.
- `POST /api/auth/login` — Authenticate and receive a signed JWT session token.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ or v22+)
- `npm` (or `pnpm` / `bun`)

### Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/jainpriyanka1117/nagarseva-hackforsocialcause.git
cd nagarseva
npm install
```

### Local Development

Start the development server with live reload and integrated SQLite backend:

```sh
npm run dev
```

Open `http://localhost:5173` in your browser.

### Quality & Verification Suite

- **Unit & Integration Tests**: `npm test` (Runs 14 Vitest tests covering auth, CRUD, SLA, transitions, and routing)
- **Type Checking**: `npx tsc --noEmit`
- **Linting**: `npm run lint`
- **Production Build**: `npm run build`

---

## Project Structure

```
nagarseva/
├── src/
│   ├── db/                 # Drizzle schema, LibSQL connection, and seed scripts
│   │   ├── index.ts        # Client connection and schema initializer
│   │   ├── schema.ts       # Database schema (users, complaints, timeline, evidence)
│   │   └── seed.ts         # Initial complaints and test accounts seeder
│   ├── server/             # Fullstack server logic & TanStack Server Functions
│   │   ├── auth.ts         # Login, registration, profile server functions
│   │   ├── crypto.ts       # Web Crypto PBKDF2 hashing & jose JWT signing
│   │   ├── complaints.ts   # Civic grievance CRUD, SLA calculations, lifecycle
│   │   ├── stats.ts        # Ward analytics and geospatial safety data
│   │   └── upload.ts       # Evidence and image attachment persistence
│   ├── routes/             # TanStack Start file-based routes
│   │   ├── api/            # REST API endpoints (/api/complaints, /api/auth, etc.)
│   │   ├── index.tsx       # Landing page & public overview
│   │   ├── report.tsx      # Multi-step grievance reporting wizard
│   │   ├── citizen.tsx     # Citizen dashboard & grievance tracking
│   │   ├── officer.tsx     # Officer dispatch, resolution & evidence upload
│   │   ├── complaint.$id.tsx # Single complaint detail, timeline & verification
│   │   ├── ward.tsx        # Ward responsiveness and accountability analytics
│   │   ├── map.tsx         # Geospatial community safety map
│   │   └── admin.tsx       # Platform administration & trust reviews
│   ├── components/         # Shared UI shell, navigation, and maps
│   │   └── ui/             # Radix UI and Tailwind CSS components (shadcn/ui)
│   ├── lib/                # Static datasets, formatting, and utility helpers
│   └── test/               # Vitest test suite for backend, auth & components
├── vite.config.ts          # Vite build configuration with TanStack Start
├── drizzle.config.ts       # Drizzle kit configuration
└── package.json            # Project dependencies and development scripts
```

---

## License

This project is licensed under the MIT License.
