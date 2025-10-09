# Repository Guidelines

## Project Structure & Module Organization
Pizza King runs as a pnpm-managed monorepo. Web assets live in `apps/web` (Next.js App Router) with UI elements under `components/` and shared utilities in `lib/`, `hooks/`, and `store/`. The mobile Expo app resides in `apps/mobile` with screens defined via Expo Router. Serverless logic is kept in `functions/` for Firebase Cloud Functions. Cross-cutting TypeScript types, hooks, and constants belong in `packages/shared/src`, while Firebase config helpers sit in `packages/firebase-config`. Reference `docs/` for deep dives and `scripts/` for maintenance tooling (seeding, emulators).

## Build, Test, and Development Commands
Use `pnpm install` once, then `pnpm dev` to launch web, mobile, and functions together. Target a single surface with `pnpm dev:web`, `pnpm dev:mobile`, or `pnpm dev:functions`. Produce production artifacts through `pnpm build` or `pnpm build:web`. Quality gates run with `pnpm lint`, `pnpm lint:fix`, and `pnpm format`. Execute test suites via `pnpm test`; `pnpm test:watch` keeps Vitest/Jest runners hot during feature work. For local infrastructure, run `pnpm emulators` before hitting Firestore or Auth.

## Coding Style & Naming Conventions
All code is TypeScript-first with strict null checks (see each `tsconfig.json`). Keep two-space indentation and rely on Prettier (`pnpm format`) before pushing. React components use PascalCase filenames (`PizzaCard.tsx`), hooks use camelCase (`useCart.ts`), and route folders in `app/` follow kebab-case (`order-tracking`). Tailwind classes power styling; extend tokens in `tailwind.config.ts` rather than inlined hex values. Shared constants live in `packages/shared/src/constants`; reuse them instead of redefining literals.

## Testing Guidelines
Place web unit tests beside components as `*.test.tsx`; integration specs can live under `apps/web/tests`. Mobile logic should be covered with Jest or Expo Testing Library in `apps/mobile/__tests__`. Functions belong under `functions/src` with Vitest tests mirroring folder names (`orders.test.ts`). Stub Firebase via the emulators and seed data with `pnpm seed` when asserting data flows. Block merges lacking coverage for new business rules or regressions.

## Commit & Pull Request Guidelines
Write imperative subject lines under 60 characters (for example, `Add loyalty tier calculations`). Bundle related changes per commit. PRs should describe the user impact, outline test evidence (`pnpm test`, `pnpm lint`), and link any tracking issues. Include screenshots or screen recordings for UI updates and note required environment variables when touching config.
