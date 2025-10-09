# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed by `pnpm`; web app lives in `apps/web` (Next.js App Router) with UI under `components/`, shared logic via `lib/`, `hooks/`, and `store/`.
- Mobile client is in `apps/mobile` (Expo Router). Firebase Cloud Functions reside in `functions/`, and cross-cutting TypeScript utilities sit in `packages/shared/src`.
- Firebase helpers live in `packages/firebase-config`; consult `docs/` for deep dives and `scripts/` for maintenance tooling such as seeds and emulator setups.

## Build, Test, and Development Commands
- `pnpm install` once to bootstrap workspaces; `pnpm dev` launches web, mobile, and functions together.
- Target surfaces with `pnpm dev:web`, `pnpm dev:mobile`, or `pnpm dev:functions`. Build production bundles via `pnpm build` or `pnpm build:web`.
- Quality gates: `pnpm lint`, `pnpm lint:fix`, and `pnpm format`. Test runners: `pnpm test` or `pnpm test:watch`. Start local Firebase emulators with `pnpm emulators` before hitting Firestore/Auth.

## Coding Style & Naming Conventions
- TypeScript with strict null checks. Keep two-space indentation; rely on Prettier (`pnpm format`) before pushing.
- React component files use PascalCase (e.g., `PizzaCard.tsx`); hooks use camelCase (`useCart.ts`); Next.js route folders stay kebab-case (`order-tracking`).
- Tailwind drives styling—extend tokens in `tailwind.config.ts` instead of hardcoding colors. Shared constants belong in `packages/shared/src/constants`.

## Testing Guidelines
- Web unit tests neighbor components as `*.test.tsx`; integration specs live in `apps/web/tests`.
- Mobile logic uses Jest/Expo Testing Library within `apps/mobile/__tests__`. Functions tests mirror `functions/src` structure (e.g., `orders.test.ts`).
- Stub Firebase with `pnpm emulators`; seed required data via `pnpm seed`. Block merges that reduce coverage for new rules.

## Commit & Pull Request Guidelines
- Write imperative commit subjects under 60 characters (e.g., `Add loyalty tier calculations`). Group related changes together.
- PRs must state user impact, list validation (`pnpm test`, `pnpm lint`), and link tracking issues. Attach screenshots or recordings for UI changes and list any new env vars.
