# NagarSeva

NagarSeva is an open, accountable, fullstack civic engagement and municipal grievance tracking platform built with TanStack Start, React 19, TypeScript, Tailwind CSS, and Drizzle ORM with LibSQL/SQLite.

It empowers citizens to report neighbourhood problems, monitors municipal response SLAs, provides officers with resolution workflows, displays geospatial safety signals, and enforces citizen-verified issue closures.

---

## Documentation Quick Links

- 📐 **[Technical Design Document (including Architectural Diagrams)](./TECHNICAL_DESIGN.md)**
- 🧪 **[Sample Data & Testing Guide](./docs/TESTING.md)**
- 📄 **[MIT License](./LICENSE)**

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

When the server starts, the database (`local.db`) is automatically initialized and seeded with sample civic grievances, timelines, and pre-configured accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Citizen** | `citizen@nagarseva.org` | `Citizen123!` | Report issues, track personal grievances, verify or reopen closures |
| **Municipal Officer** | `officer@nagarseva.org` | `Officer123!` | Review ward queue, update statuses, upload resolution proof |
| **Platform Admin** | `admin@nagarseva.org` | `Admin123!` | Departmental oversight, trust & abuse reviews, audit preview |

---

## Environment Variables

NagarSeva works out of the box with zero required environment variables (defaults to a local SQLite database at `file:local.db`). For custom setups, create a `.env` file from the provided `.env.example`:

```sh
cp .env.example .env
```

| Variable | Required | Default Value | Description |
|---|---|---|---|
| `DATABASE_URL` | Optional | `file:local.db` | Connection URL for LibSQL/SQLite database. Can point to a local file or remote Turso database (`libsql://...`). |
| `DATABASE_AUTH_TOKEN` | Optional | `""` | Authentication token when connecting to a remote Turso database instance. Leave empty for local file SQLite. |
| `JWT_SECRET` | Optional | `nagarseva-default-dev-secret-key-change-in-production-123456` | Secret key used for signing and verifying HMAC-SHA256 JWT auth tokens. Always set a secure random string in production. |
| `PORT` | Optional | `5173` (dev) / `3000` (prod) | HTTP port on which the development server or production server listens. |
| `NODE_ENV` | Optional | `development` | Runtime environment (`development`, `test`, `production`). |

---

## Getting Started

### 1. Prerequisites

- **Node.js**: v20.0.0+ or v22.0.0+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or `pnpm` / `bun`
- **Git**

### 2. Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/jainpriyanka1117/nagarseva-hackforsocialcause.git
cd nagarseva
npm install
```

### 3. Environment Setup (Optional)

Copy the example environment configuration:

```sh
cp .env.example .env
```

### 4. Run the Development Server

Start the local server with hot module reloading and automatic database seeding:

```sh
npm run dev
```

Open your browser at **`http://localhost:5173`**. The local SQLite database (`local.db`) will be automatically created and populated on first run.

### 5. Production Build & Preview

Build the client and server production bundles:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

---

## Quality, Testing & Verification Suite

NagarSeva includes a comprehensive automated test suite and strict type-checking:

- **Run All Tests**:
  ```sh
  npm test
  ```
  Runs Vitest test suites covering database initialization, Web Crypto PBKDF2 hashing, JWT verification, grievance CRUD, SLA deadline calculation, citizen verification, reopening workflows, file uploads, and router rendering.

- **Type Checking**:
  ```sh
  npx tsc --noEmit
  ```
  Validates strict TypeScript types including `exactOptionalPropertyTypes: true` and `noPropertyAccessFromIndexSignature: true`.

- **Linting & Code Quality**:
  ```sh
  npm run lint
  ```

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
│   ├── data/               # Standalone sample data and fixture definitions
│   ├── lib/                # Static datasets, formatting, and utility helpers
│   └── test/               # Vitest test suite for backend, auth & components
├── docs/                   # Testing guides and technical documentation
├── TECHNICAL_DESIGN.md     # Architectural blueprints and Mermaid diagrams
├── .env.example            # Sample environment variables
├── LICENSE                 # MIT License
├── vite.config.ts          # Vite build configuration with TanStack Start
└── package.json            # Project dependencies and development scripts
```

---

## License

This project is licensed under the [MIT License](./LICENSE).
