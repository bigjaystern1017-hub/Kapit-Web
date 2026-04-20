# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: Anthropic Claude (via Replit AI Integrations, `@workspace/integrations-anthropic-ai`)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Kapit (mobile)
- **Type**: Expo mobile app
- **Path**: `artifacts/mobile/`
- **Preview**: `/` (root)
- **Description**: A location-based cocktail party weapon that serves fascinating historical factoids using the signature "suspender snap" drag interaction.

### API Server
- **Type**: Express API
- **Path**: `artifacts/api-server/`
- **Routes**:
  - `POST /api/kapit/factoids` — Generates 5 historical factoids for a given location using Anthropic Claude (`claude-sonnet-4-6`)

## Key Files

- `artifacts/mobile/app/index.tsx` — Main Kapit screen
- `artifacts/mobile/context/KapitContext.tsx` — State management (location, factoids, repertoire)
- `artifacts/mobile/components/SuspenderSnap.tsx` — The signature drag mechanic with spring physics
- `artifacts/mobile/components/SpinningWheel.tsx` — Slot machine teaser reveal + factoid card
- `artifacts/mobile/components/LocationSelector.tsx` — GPS + preset locations
- `artifacts/mobile/components/Repertoire.tsx` — Collected facts history
- `artifacts/mobile/constants/colors.ts` — Kapit's midcentury editorial color palette
- `artifacts/api-server/src/routes/kapit.ts` — AI factoid generation route with caching
- `lib/integrations-anthropic-ai/` — Anthropic AI client wrapper
