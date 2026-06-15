# CLAUDE.md — Altira MVP

You are building the Altira MVP: a card-based whole-property concept tool. The customer
never draws; they start from a pre-filled suggested concept and make small swaps, and the
board updates live. Output is one architectural Plan and one Section plus a calm concept
write-up.

**The full spec is `./altira-mvp-oneshot-brief.md`. Read it before writing code, and treat
its §2–§6 as locked. This file is the short, always-loaded version — when they conflict, the
brief wins.**

-----

## Working rules

- **Read the brief first**, then build in the brief’s §11 order. Do not skip ahead.
- **Commit per gate.** One commit per numbered build step in §11, message `phase N: <gate>`.
  Do not start a phase until the previous phase’s gate passes.
- **Tests before advancing.** Run the full test suite before each commit. A failing
  invariant or copy-lint test means the phase is not done — fix it, don’t move on.
- **Build one path end-to-end first.** Get the `family-courtyard` parti through gate 6
  before adding other partis/cards. Don’t try to author the whole catalog in one pass.
- **Ask nothing of the customer that the system can decide.** Limits are enforced by what’s
  offered, never by an error message.
- If a decision isn’t covered by the brief, pick the simplest option that preserves the
  invariants below, leave a `// DECISION:` comment, and keep going.

## Architecture you must not violate

1. **Bay grid is the single source of truth.** Everything is located by a bay address
   `(col, band)` — never pixels. `bayWidthM = usableFrontageM / bayCount`, in meters.
   Pixels exist only at render time via one viewBox transform.
1. **One model → pure renderers.** `PlanView` and `SectionView` are pure functions of one
   `Concept`. Renderers never compute placement. If plan and section disagree, that’s a bug.
1. **Deterministic assembly.** `assembleConcept` is pure: no `Math.random`, no input
   mutation, no key-order dependence. Same inputs → identical output.
1. **Cards are intent.** A card fills/modifies a bay cell or sets a parameter. It never draws
   or positions geometry. The assembler resolves placement against the parti.
1. **Partis give the bones.** Each archetype → a curated skeleton (bay count, band ratios,
   spine column, fixed cells). Cards vary the fill, not the skeleton.
1. **Card thumbnails are the real renderers at small scale** — never hand-drawn art.

## Invariants (asserted in `validate()`, covered by tests)

- `stair.col === spine.col` — the stair is always on the spine.
- A courtyard is **open cells** cut as a **void through every level it spans** — never a
  filled room. It must read as open in section.
- A cell holds at most one fill per level. Built cells stay within setbacks.
- All levels share the ground bay columns.
- The board is always **complete**: a missing card → parti default + a warning, never a hole.
- Pro ⇒ levels ≥ 3 or a `work`/`retail` cell exists.

## Anti-patterns (these sank the previous build — do not repeat)

- Bays/positions in pixels • two owners of cell assignment • renderers recomputing geometry •
  stair placed by coordinate • courtyard as a filled block • per-level independent grids •
  randomness or shared mutation in assembly • shipping the happy path with no `validate()`.

## Copy

Grade-8, calm, design-led, customer-facing. Trade-offs are stated as calm copy, not errors.
Banned in customer-facing strings (internal terms only): `schema`, `packet`, `logic matrix`,
`parametric`, `component orchestration`, `spatial program`, `vertical role structure`,
`dashboard`, `software tier`, **`bay`, `slot`, `cell`**. A dev-time lint test fails the build
on any hit.

## Stack & commands

React 18 + TypeScript + Vite + Tailwind + Zustand + react-router. Hand-authored SVG (no
CAD/floor-plan library). Vitest + React Testing Library. Client-only; localStorage
persistence; no backend/auth/payments.

```bash
npm install
npm run dev      # local dev
npm test         # run before every commit
npm run build    # production build
npm run lint     # includes the customer-copy banned-words check
```

## Out of scope (keep model compatible, build nothing now)

Axonometric view and PDF export are future stages. The model already carries per-level cell
occupancy + floor heights and the deliverable is a self-contained component, so both slot in
later without a refactor. Do not start either.