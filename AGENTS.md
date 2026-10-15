# NagarSeva Project Guidelines

## Project Overview

NagarSeva is an independent civic engagement and municipal grievance tracking frontend built with TanStack Start, React 19, TypeScript, and Tailwind CSS.

## Architecture

- **Framework**: TanStack Start with file-based routing (`src/routes/`)
- **UI Components**: shadcn/ui components (`src/components/ui/`) powered by Radix UI and Tailwind CSS
- **State & Query**: TanStack React Query (`@tanstack/react-query`)
- **Entry Points**: `src/router.tsx`, `src/start.ts`, `src/server.ts`, `src/routes/__root.tsx`

## Core Development Commands

- `npm run dev`: Start local development server
- `npm run build`: Production build with Vite and Nitro
- `npm run lint`: Lint code with ESLint
- `npm run test`: Run tests with Vitest
