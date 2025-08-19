# Drone Dashboard Remediation Roadmap

This document outlines a comprehensive, phased plan to address issues identified across the project. Phases are prioritized by severity and impact.

## Phase 0 — Safety & Hygiene (Critical)

- [ ] Authorization guardrails on mutation endpoints
  - Description: Restrict `POST /api/drones` and `PATCH /api/drones/[serial]/components` to authenticated/authorized users.
  - Approach: Add middleware or route-handlers using a simple auth check (stub now, pluggable for real auth later).
  - Acceptance criteria: Unauthenticated requests receive 401; authorized requests succeed. Unit tests for both routes.
  - Files: `app/api/drones/route.ts`, `app/api/drones/[serial]/components/route.ts`, optionally `middleware.ts`.

- [ ] Component/drone integrity check (bug)
  - Description: Ensure `componentId` being updated belongs to the drone identified by `serial`.
  - Approach: Validate `componentId` via join: `droneComponent.droneCategory.droneId === drone.id`. Reject if mismatch.
  - Acceptance criteria: PATCH fails with 400 if `componentId` not part of the target drone. Test included.
  - Files: `app/api/drones/[serial]/components/route.ts`.

- [ ] Prisma logging
  - Description: Avoid noisy logs in production.
  - Approach: Condition logs on `NODE_ENV !== 'production'`.
  - Acceptance criteria: Production logs do not include per-query logs; development retains useful logs.
  - Files: `lib/prisma.ts`.

- [ ] Ignore local SQLite DB
  - Description: Prevent committing local database files.
  - Approach: Add `prisma/*.db` to `.gitignore`.
  - Acceptance criteria: `git status` shows no tracked DB files; existing committed DBs removed if any (in separate PR if needed).
  - Files: `.gitignore`.

## Phase 1 — Data & Domain Consistency (High)

- [ ] Canonicalize status values
  - Description: Align all UIs, mocks, and API to `pending | in-progress | completed`.
  - Approach: Update Dashboard and Fleet Detail to use canonical statuses; or adjust mocks to match API; add type-enforced enums.
  - Acceptance criteria: No references to `in-build`, `testing`, or `planning` where drone status is used; UI badges/colors mapped to canonical statuses.
  - Files: `app/(site)/page.tsx`, `app/(site)/fleet/[serial]/page.tsx`, `lib/types.ts`, `lib/mockBuildData.ts`.

- [ ] Strong status enum in DB & app
  - Description: Replace string statuses in Prisma with `enum`, mirror in TS.
  - Approach: Prisma `enum DroneStatus { pending in_progress completed }`; migration; transform API mapping.
  - Acceptance criteria: DB enforces enum; API and UI compile with enum types; migration runs cleanly.
  - Files: `prisma/schema.prisma`, new migration, `lib/types.ts`, API routes.

- [ ] Model naming consistency
  - Description: `BuildDrone.model` is limited to `'G1-M' | 'G1-C'`, but DB uses free-form strings.
  - Approach: Either widen TS to `string` or store a typed model code in DB; map human-readable name separately.
  - Acceptance criteria: No TS errors when consuming API responses; consistent display of model.
  - Files: `lib/types.ts`, API transformers.

- [ ] Unify data source across app
  - Description: Some pages use API; others use mock data.
  - Approach: Migrate Dashboard and Fleet Detail to fetch from `/api/drones`. Keep a feature flag for demo mode if needed.
  - Acceptance criteria: App uses a single data source by default; optional mock mode toggle.
  - Files: `app/(site)/page.tsx`, `app/(site)/fleet/[serial]/page.tsx`, `lib/mockBuildData.ts` (optional flag), `lib/types.ts`.

- [ ] Return build activities or drop heavy include
  - Description: `GET /api/drones` includes `buildActivities` but does not return them.
  - Approach: Either include `buildActivities` in response or remove from query; consider separate endpoint `/api/drones/[serial]/activity`.
  - Acceptance criteria: No unused overfetching; detail views obtain activities efficiently.
  - Files: `app/api/drones/route.ts`.

## Phase 2 — UX, A11y, and Theming (Medium)

- [ ] Language and theme alignment
  - Description: Root `html lang` should match English content; avoid forcing `bg-black text-white` globally; unify dark mode.
  - Approach: Change `lang` to `en`; remove hardcoded body colors; use `next-themes` for a single dark-mode source.
  - Acceptance criteria: Theme toggles work consistently across `app/layout.tsx` and `(site)` layout; no conflicting backgrounds.
  - Files: `app/layout.tsx`, `app/(site)/layout.tsx`.

- [ ] Accessibility for icon-only buttons
  - Description: Add `aria-label` to icon-only buttons and ensure focus rings are visible.
  - Approach: Pass `aria-label` where text is absent.
  - Acceptance criteria: Lighthouse/axe a11y shows no label violations on key pages.
  - Files: `app/(site)/*/page.tsx`.

- [ ] Accessible Select component
  - Description: Current `Select` lacks ARIA roles/keyboard support.
  - Approach: Add `role="combobox"`/`listbox` semantics and keyboard handling, or adopt a headless library (Radix Select/Headless UI).
  - Acceptance criteria: Keyboard navigable, screen-reader friendly, passes basic a11y checks.
  - Files: `components/ui/select.tsx`.

- [ ] Snappier Admin updates
  - Description: Admin page refetches entire fleet after PATCH.
  - Approach: Use SWR/React Query; optimistic updates for the specific component/drone; fallback to revalidation.
  - Acceptance criteria: Immediate UI feedback; server state reconciles; no visible jank.
  - Files: `app/(site)/admin/page.tsx`.

## Phase 3 — Performance & API Shaping (Medium/Low)

- [ ] Split list vs detail endpoints
  - Description: `/api/drones` returns deeply nested data for all drones.
  - Approach: Provide light list (serial, model, status, overallCompletion) and a detail endpoint returning categories/components.
  - Acceptance criteria: Fleet list loads quickly; detail view fetches on-demand.
  - Files: `app/api/drones/route.ts`, new `app/api/drones/[serial]/route.ts`.

- [ ] Cache & revalidation strategy
  - Description: Consider ISR or route segment caching for read endpoints, with revalidate on mutation.
  - Approach: Use `revalidateTag`/`revalidatePath` after POST/PATCH; tag `GET` routes.
  - Acceptance criteria: Stale reads minimized; consistent data without full refetches on client.
  - Files: API routes.

- [ ] Error and input validation
  - Description: Standardize error formats and validate input.
  - Approach: Introduce Zod schemas for request/response; return `{ error: { code, message } }` shapes.
  - Acceptance criteria: Typed handlers; helpful error messages; safer inputs.
  - Files: API routes, `lib/validators/*` (new).

## Phase 4 — Developer Experience (Low)

- [ ] Prettier and linting consistency
  - Description: Ensure consistent formatting alongside ESLint.
  - Approach: Add Prettier config; integrate with ESLint or run separately.
  - Acceptance criteria: Pre-commit hook or CI lints/_formats; clean diffs.
  - Files: `package.json`, `.prettierrc` (new), ESLint config.

- [ ] `.env.example` and scripts
  - Description: Document required env vars; streamline scripts.
  - Approach: Add `.env.example` with `DATABASE_URL`; add `db:push`, `db:migrate`, and `db:seed` scripts.
  - Acceptance criteria: New devs can set up in one copy/paste.
  - Files: `package.json`, `.env.example` (new), `README.md` updates.

- [ ] Testing baseline
  - Description: Establish minimal tests for API handlers and critical UI logic.
  - Approach: Add Jest/Vitest with TS; write tests for Phase 0/1 changes.
  - Acceptance criteria: CI green; basic regression protection.
  - Files: `package.json`, `tests/*` (new), config.

---

## Milestone acceptance

- Phase 0 complete when: unauthorized mutations blocked; component/drone mismatch prevented; prod logs quiet; DB ignored.
- Phase 1 complete when: statuses unified with enum; model type consistent; data source unified; activity fetch consistent.
- Phase 2 complete when: theme/a11y issues resolved; Select accessible; Admin UX responsive.
- Phase 3 complete when: list/detail endpoints split; caching strategy implemented; validation standardized.
- Phase 4 complete when: formatting/testing baselines in place; onboarding improved.

## Notes

- Consider feature flags to toggle mock vs API data during transition.
- Plan migrations carefully if adopting Prisma enums; provide scripts to update existing rows.
