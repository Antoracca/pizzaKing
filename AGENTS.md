# Repository Guidelines

## Project Structure & Module Organization

- Monorepo managed by pnpm workspaces.
- `apps/web` — Next.js 14 app (public assets in `public/`, pages in `app/`).
- `apps/mobile` — Expo (React Native) app using Expo Router.
- `functions` — Firebase Cloud Functions (TypeScript) with HTTPS, triggers, and scheduled jobs.
- `packages/shared` — Shared types, constants, utils, and React hooks.
- `packages/firebase-config` — Client/Admin Firebase wrappers and config.
- `scripts` — Operational scripts (seeding/clearing). Firebase config lives alongside `firebase.json`, `firestore.rules`, and `firestore.indexes.json`.

## Build, Test, and Development Commands

- Root (parallel app workflows):
  - `pnpm dev` / `pnpm build` — Run/build all apps in `apps/**`.
  - `pnpm dev:web` | `dev:mobile` | `dev:functions` — Scope to a target.
  - `pnpm lint` | `lint:fix` — Lint (Next/ESLint); fix issues.
  - `pnpm format` | `format:check` — Prettier write/check.
  - `pnpm emulators` — Start Firebase emulators; `pnpm seed`, `pnpm seed:firebase` to populate data.
  - Deploy: `pnpm deploy:web`, `pnpm deploy:functions`, or `pnpm deploy:all`.
- App-specific: `apps/web` uses `next dev/build/start`; `apps/mobile` uses `expo start` and EAS build scripts; `functions` uses `tsc`, `firebase deploy --only functions`.

## Coding Style & Naming Conventions

- TypeScript everywhere; 2-space indent; semi-colons; single quotes; no default exports (prefer named).
- React: functional components with hooks; components/types in `PascalCase`; variables/functions in `camelCase`.
- Files/folders: `kebab-case` (e.g., `pizza-card.tsx`); colocate feature code.
- Shared logic goes in `packages/shared` (`constants/`, `utils/`, `hooks/`, `types/`).
- Tools: ESLint (project presets), Prettier (root config) — run `pnpm lint` and `pnpm format` before PRs.

## Testing Guidelines

- Current repo has no committed tests. Add co-located tests as `*.test.ts(x)` or under `__tests__/`.
- Web: prefer Jest + `@testing-library/react`. Mobile: `@testing-library/react-native`.
- Functions: unit test pure modules; use Firebase emulator for integration.
- Aim for meaningful coverage on shared utils and critical flows (auth, orders, payments).

## Commit & Pull Request Guidelines

- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:` with optional scope (e.g., `feat(web): add cart drawer`).
- PRs must include: clear description, scope (web/mobile/functions/packages), linked issues, and screenshots/GIFs for UI.
- Ensure: builds pass, lint/format clean, no secrets committed. Reference emulator steps when relevant.

## Security & Configuration

- Never commit secrets. Use `apps/web/.env.local`, `functions/.env` (and `scripts/.env`) — see `*.env.example` files.
- Prefer Firebase emulators for local testing. Service-account keys should be stored securely and injected via CI/CD.
