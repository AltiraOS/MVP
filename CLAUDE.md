# CLAUDE.md — Altira MVP

You are building the Altira MVP: a card-based whole-property concept tool. The customer
never draws; they start from a pre-filled suggested concept and make small swaps, and the
board updates live. Output is one architectural Plan and one Section plus a calm concept
write-up.

**The full spec for the 5-step journey (Brief → Activate) is `./altira-mvp-oneshot-brief.md`.
The full spec for everything past Activate — the Project Room — is
`./altira-project-room-oneshot-brief.md`. Read the relevant one before writing code, and
treat their locked sections as locked. This file is the short, always-loaded version — when
they conflict, the relevant brief wins.**

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

1. **The board is the single source of truth, at 1m resolution.** Every placement is
   located in metres on a 1m × 1m board (`widthM` columns × `depthM` rows) — never pixels.
   Depth is organized in fixed **4m bands** front-to-back (`bandIndex = floor(yM / 4)`);
   width comes from the site frontage. The 1m grid is internal measurement/snapping
   precision only — **never** expose free 1m placement to the customer. Pixels exist only
   at render time via one viewBox transform.
1. **Cards are fixed-size placements, not free cells.** A card has a fixed `widthM` /
   `depthM` footprint (most align to whole 4m bands) and is placed as
   `{ cardId, level, xM, yM, widthM, depthM, bandStart, bandSpan }`. A card never draws or
   positions itself — the assembler places it into one of the parti's allowed slots.
1. **One model → pure renderers.** `PlanView` and `SectionView` are pure functions of one
   `Concept`, drawing only from its placed cards. Renderers never compute or invent
   placement. If plan and section disagree, that's a bug.
1. **Deterministic assembly.** `assembleConcept` is pure: no `Math.random`, no input
   mutation, no key-order dependence. Same inputs → identical output.
1. **Partis give the bones.** Each archetype → a curated skeleton (nominal board size, fixed
   4m bands, spine position, fixed placements). Cards vary the fill, not the skeleton.
1. **Card thumbnails are the real renderers at small scale** — never hand-drawn art.

## Invariants (asserted in `validate()`, covered by tests)

- The stair's placement `xM` falls within the spine's x-range, on every level — the stair is
  always on the spine.
- A courtyard is a **void rectangle** cut through **every level it spans** — never a filled
  room, never a card placement with a fill. It must read as open in section.
- No two card placements overlap on the same level. Built placements stay within setbacks.
- All levels share the same board (`widthM` / `depthM` / band layout).
- The board is always **complete**: a missing card → parti default + a warning, never a hole.
- Pro ⇒ levels ≥ 3 or a `work`/`retail` placement exists.

## Anti-patterns (these sank the previous build — do not repeat)

- Board positions in pixels • free 1m placement exposed to the customer • two owners of
  placement state • renderers recomputing or inventing geometry • stair placed off-spine •
  courtyard as a filled block • per-level independent boards • randomness or shared mutation
  in assembly • shipping the happy path with no `validate()`.

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