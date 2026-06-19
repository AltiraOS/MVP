# Altira Project Room — One-Shot Build Brief for Claude Code

Build the **Project Room**: the Pro-tier continuation that begins the moment a customer
activates a concept. It is the same `Concept` they shaped, never redrawn, now **re-solved
onto their real site** and developed into the deliverables a specialist (builder, draftsperson,
engineer) can pick up. This brief governs everything behind `mode: 'project'`.

> This is brief #2. `./altira-mvp-oneshot-brief.md` (brief #1) governs the 5-step journey —
> Brief → Shape → Summary → Pricing → Activate — and is still locked. Read it first; its
> §2 architecture is inherited wholesale here, not re-decided. This brief picks up at
> Activate and is informed by what actually broke building the first pass of the Project
> Room (§3). Do not repeat those failures.

-----

## 1. The product in one paragraph

Activating a concept doesn't end the relationship with the model — it changes what's true
about the site. The board the customer shaped used a **representative** site; the Project
Room re-solves the same shaping decisions onto their **real** one, then carries that resolved
concept through seven tabs: **Concept → Dimensioned Plan → Section → Schedules →
Refinements → Handoff → Packs**. Nothing is redrawn by hand at any point — every tab is a
pure view or a pure derivation over one resolved `Concept`.

-----

## 2. Non-negotiable architecture (inherited + extended)

Brief #1 §2(A–E) hold without exception: one 1m board, one model, pure renderers,
deterministic assembly, parti skeletons. The Project Room adds exactly these rules on top:

**F. The baseline is frozen at Activate.** `activate()` snapshots the shaped `Concept` as
`ProjectRoom.baseline`. Nothing past this point ever hand-edits `baseline` — every later fact
(`resolved`, `revisions`) is the output of a pure derivation, never a mutation.

**G. `resolveOnSite` is the only function allowed to touch geometry after Activate, and it
is pure.** `resolveOnSite(concept, site) -> Concept` re-derives the board from the real
site via the same `deriveBoard` the assembler uses, then re-materializes every existing
placement onto it. It never invents a new placement, never drops one, and never throws —
a site that doesn't comfortably fit surfaces as a trade-off string, same as brief #1 §3.

**H. One conversion point, reused — not a second one.** `cellRectM` (or whatever the
current board's single col/band → metres function is) is called once per placement, by
the assembler the first time and by `resolveOnSite` the second time. Any new Project Room
feature that needs a position **calls this function**; it never recomputes x/y from
`colCount`/`bandDepthsM` inline. This is the rule that the original bay-grid build broke
(§3.1) — it is the single most important rule in this brief.

**I. Every tab reads `projectRoom.resolved`; none of them compute their own geometry or
their own room sizes.** `DimensionedPlanPage`, `ProjectSectionPage`, `SchedulesPage`,
`RefinementsPage`, `HandoffPage`, `PacksPage` are all thin views over `resolved` (or over a
pure query function of it, like `deriveSchedules`). If a tab needs a number the model
doesn't already expose, add a derivation function next to `schedules.ts`, not inline JSX
math.

**J. Mode is one switch, not two apps.** `AppMode = 'journey' | 'project'` lives in the one
store. `RequireProjectMode` is the only gate. There is no second store, no duplicate
selections, no parallel concept.

**K. Site capture is asked once per project and reused everywhere.** `SiteCapture` lives on
`ProjectRoom.site`. Every tab that needs the real site reads `projectRoom.site` /
`projectRoom.resolved` — none of them re-prompt independently or hold their own copy.

-----

## 3. What broke building this the first time → hard guardrails

The first pass (mode switch → site capture → dimensioned renderers → schedules) shipped on
top of a per-cell `BayGrid` (`Record<string, CellFill>` keyed by `col:band`, with `CellAddr`
as the addressable unit). It worked for the journey but strained immediately once the
Project Room needed to re-solve geometry onto a different site. Each failure below is now
fixed at the model layer (brief #1's `Board` + `CardPlacement` refactor) — **do not
reintroduce the pattern that caused it.**

1. **Geometry computed in more than one place.** The bay grid tempted every consumer
   (renderer, `resolveOnSite`, schedules) to walk cells and re-derive a rectangle from
   `col`/`band` itself. Two independent walks drift the moment one of them changes. →
   **Guardrail:** a placement's `xM/yM/widthM/depthM` is set once, by one function
   (§2.H), and every consumer reads those fields — never `col`/`band` directly.
1. **"Dimensioned" renderer mode invented its own dimension-line geometry.** It is tempting
   to compute dimension line endpoints from raw board metrics (`colWidthM`,
   `bandDepthsM`) independently of the placements already drawn. That is a second
   geometry source and will eventually disagree with the walls it's labeling. →
   **Guardrail:** every dimension annotation must originate from a placement, the board
   edge, or the spine/stair/courtyard rects already on the model — nothing recomputed.
1. **Schedules tempted to count cells instead of summing placements.** Room area is
   `widthM * depthM` per placement (`deriveSchedules` already does this correctly) — never
   a cell count times nominal cell area, which silently disagrees once bands are unequal
   depths. → **Guardrail:** any new schedule or quantity derivation sums placement
   rectangles, never grid cell counts.
1. **A real site can be smaller than the representative one the concept was first shown
   on.** `resolveOnSite` must never throw and never produce a negative/zero board. →
   **Guardrail:** clamp to a minimum usable footprint, then say so in plain trade-off
   copy (already implemented; extend, don't replace, this pattern for any new resolve
   step e.g. Refinements).
1. **Stub tabs got routes and nav before they had a data model.** `Refinements`,
   `Handoff`, `Packs` shipped as placeholder pages before their pure derivation functions
   existed — repeating brief #1 §3's "ship the happy path with no `validate()`"
   anti-pattern one layer up. → **Guardrail:** for each of §6's three remaining tabs,
   write the data type and pure derivation function **first**, prove it in a unit test,
   then build the page as a thin view over it — same order as brief #1 §11.
1. **Every parti needs to be stress-tested against re-resolution, not just its original
   board.** A parti that validates on its nominal site can still break once squeezed onto
   a real one. → **Guardrail:** any change to `resolveOnSite` or to a parti's slots is
   re-run through every archetype × a comfortable real site × a tight real site
   (the existing `projectRoom.test.tsx` pattern) before it ships.

-----

## 4. Scope

**Already built (keep, harden, do not re-architect):**
mode switch (`journey`/`project`) · 7-tab Project Room shell + nav guard · `SiteCapture` +
`resolveOnSite` · dimensioned `PlanView`/`SectionView` · `deriveSchedules` + Schedules tab ·
Concept tab (frozen baseline + tier/reason recap).

**To build this pass — Refinements, Handoff, Packs:**

### 4a. Refinements
Bounded, post-Activate swaps. Unlike Shape (brief #1 §8), the **site and archetype are no
longer open for revisit** — the real site is captured fact, not a choice. Only fill-level
categories that don't change the board's nominal size stay open (indoor-living, sleeping,
outdoor-rooms, palette — never archetype, site, or courtyard's footprint once a real site
has been captured). Each committed swap re-runs `assembleConcept` then `resolveOnSite` and
appends the new resolved `Concept` to `ProjectRoom.revisions`; `baseline` never changes.
*(DECISION: courtyard size/position stays closed in Refinements — it's load-bearing for the
spine/stair invariant and the parti's openCandidates were tuned for the original board; a
courtyard swap belongs in a future re-Shape, not a bounded refinement. Revisit if product
wants it sooner.)*

### 4b. Handoff
A specialist-ready package, **on-screen only** — PDF export is still out of scope (brief #1
§4) and Handoff must keep working without it. Bundles, read-only: the resolved `Concept`'s
dimensioned Plan + Section, the full `Schedules`, and the assumptions list, on one page,
labeled for a builder/draftsperson audience rather than the customer-facing Summary tone.
*(DECISION: "package" = a single aggregated view component, not a new file format. A later
`exportConcept()` can consume this same aggregation once PDF export is built — see brief #1
§4's compatibility requirement.)*

### 4c. Packs
A gated next-step offer, **CTA only — no payment, no accounts** (brief #1 §4 still applies
past Activate). Gate: `projectRoom.resolved` must exist (a captured, comfortably-resolved
site) before Packs is reachable; route guard mirrors `RequireProjectMode`. Packs present 2–4
named service bundles (e.g. engineering, planning lodgement) as plain copy + a "Talk to
Altira" hand-off, identical in spirit to Activate's CTA. *(DECISION: no real pack catalog or
pricing data exists yet — ship the CTA shell with placeholder pack names sourced from the
brief's tier/reason copy, not invented data. Revisit once product defines real packs.)*

**Out of scope, unchanged from brief #1 §4:** axonometric view, PDF export, accounts,
backend, payments.

-----

## 5. Data model additions (build these types first, per §3.5)

```ts
// already in src/model/project.ts — keep as-is, it's the pattern to extend:
export interface SiteCapture {
  frontageM: number; depthM: number; orientationDeg: number;
  setbacks: { front: number; rear: number; side: number };
  cornerLot: boolean; surveyRef?: string; notes?: string;
}
export interface ProjectRoom {
  baseline: Concept;
  site?: SiteCapture;
  resolved?: Concept;
  revisions: Concept[];     // currently always []  — Refinements is what fills this in
}

// new, for Refinements (src/model/refinements.ts):
export type RefinementCategory = 'indoor-living' | 'sleeping' | 'outdoor-rooms' | 'palette';
export interface RefinementSelections { [category: string]: string } // cardId per open category

// commitRefinement(projectRoom, category, cardId) -> ProjectRoom
//   pure: re-assembles from baseline's original brief + selections with the one category
//   swapped, re-resolves onto projectRoom.site, appends to revisions. Never mutates
//   baseline. Throws nothing — availableWhen (brief #1 §5/§8) still filters invalid cards.

// new, for Handoff (src/model/handoff.ts):
export interface HandoffPackage {
  concept: Concept;          // = projectRoom.resolved
  schedules: Schedules;      // = deriveSchedules(concept)
  assumptions: string[];     // = schedules.assumptions, surfaced once at the top level
}
// buildHandoffPackage(projectRoom) -> HandoffPackage | undefined (undefined until resolved)
// Pure aggregation only — no new facts, no new geometry.

// new, for Packs (src/model/packs.ts):
export interface Pack { id: string; title: string; blurb: string; } // Grade-8, CTA-only
// PACKS: Pack[] — static catalog, placeholder content per §4c's DECISION.
```

**Invariants to assert (extend `validate()`'s test suite, not `validate()` itself — these
are Project Room–level, not Concept-level):**

- Every `ProjectRoom.revisions` entry passes the same `validate()` as `baseline` and
  `resolved` — a Refinement can never produce an invalid concept (brief #1 §5 still binds).
- `commitRefinement` never changes `siteM`, `board`, `spine`, or any courtyard rect —
  only category fills change; geometry facts about the real site are immutable past capture.
- `HandoffPackage` is unreachable (route redirects, like `RequireProjectMode`) until
  `projectRoom.resolved` exists.
- `Packs` are unreachable until `projectRoom.resolved` exists.
- Copy-lint (brief #1 §10 banned words) runs over Refinements/Handoff/Packs strings too —
  the lint must scan the whole app's customer-facing surface, not just brief #1's pages.

-----

## 6. Build order (one pass) + gates

Continue the existing phase numbering for this brief (Project Room phases 1–4 — mode
switch, site capture, dimensioned renderers, schedules — are done and are brief #1
prerequisites for what follows):

5. **Refinements:** `RefinementSelections`, `commitRefinement`, bounded category UI reusing
   Shape's preview/commit mechanic (brief #1 §8) scoped to §4a's four categories only.
   *Gate:* swapping a refinement category visibly updates the resolved board; `baseline` is
   provably untouched (test asserts `projectRoom.baseline` reference/value unchanged);
   every revision validates.
6. **Handoff:** `buildHandoffPackage`, the aggregated on-screen view. *Gate:* Handoff shows
   the same dimensioned Plan/Section/Schedules already proven correct elsewhere, with zero
   new geometry or area computation in the page itself (code-review check, not just a test).
7. **Packs:** static `PACKS` catalog, gated route, CTA-only page. *Gate:* unreachable before
   `resolved` exists; reachable and renders placeholder packs after.
8. **Polish + copy sweep across the whole Project Room.** *Gate:* the done test below.

-----

## 7. Definition of done

A customer can Activate, capture a real site, see a dimensioned Plan and Section that agree
with each other and with the Schedules tab, make a bounded Refinement without ever reaching
an invalid board, view a Handoff package that is provably just an aggregation of facts
proven elsewhere, and reach a CTA-only Packs tab — all without a blank slate, an error
state, or a second source of geometry anywhere in the Project Room.

**Founder gate:** would we hand this Handoff package to a real builder? If yes, ship.
