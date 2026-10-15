# NagarSeva

NagarSeva is an open, accountable civic platform frontend designed for reporting neighbourhood issues, tracking municipal responses, and verifying civic resolutions.

## Features

- **Public Overview & Ward Dashboards**: Visual metrics, resolution performance, and community safety signals.
- **Civic Issue Reporting**: Step-by-step reporting workflow with category classification, urgency, and location tagging.
- **Accountable Resolution Tracking**: SLA monitoring, officer response history, and citizen-verified issue closures.
- **Interactive Map View**: Geo-located grievance reporting and neighborhood problem clusters.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ or v22+)
- `npm` (or `bun` / `pnpm` / `yarn`)

### Installation

Install dependencies using npm:

```sh
npm install
```

### Development

Run the local development server:

```sh
npm run dev
```

The application will be accessible at `http://localhost:5173` (or the port specified in console output).

### Production Build

Create a production build:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

### Quality & Testing

- **Linting**: `npm run lint`
- **Formatting**: `npm run format`
- **Unit & Integration Tests**: `npm run test`

## Project Structure

- `src/routes/`: TanStack Start file-based routes (`index.tsx`, `report.tsx`, `ward.tsx`, `officer.tsx`, `admin.tsx`, `map.tsx`, `complaint.$id.tsx`)
- `src/components/`: Shared application components and shell layouts
- `src/components/ui/`: UI component primitives (shadcn/ui, Radix UI)
- `src/lib/`: Civic datasets, error capture, and utility helpers
- `src/hooks/`: Reusable React hooks
- `src/test/`: Vitest test suites and setup

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start)
- **UI & Components**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **State & Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Testing**: [Vitest](https://vitest.dev/), Testing Library
- **Tooling**: [Vite](https://vite.dev/), TypeScript, ESLint, Prettier
