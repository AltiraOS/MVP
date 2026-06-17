# Altira MVP — One-Shot Build Brief for Claude Code

Build a card-based whole-property concept tool for Altira. The customer never draws.
They start from a **pre-filled suggested concept** and make a series of small **swaps**;
the board updates live. The output is one architectural **Plan** and one **Section**,
plus a calm concept write-up. Build the whole thing in one pass following §11.

> This brief is deliberately opinionated. The locked decisions in §2–§6 are what prevent
> the bugs a previous build hit (§3). Do not redesign them. Axonometric view and PDF export
> are **out of scope** — but keep the model compatible with both (see §4).

-----

## 1. The product in one paragraph

A guided 5-step journey: **Brief → Shape → Summary → Pricing → Activate**. In Shape, the
customer sees a board that is *already a complete, valid house* (the suggested concept).
They walk through choice categories one at a time, swapping cards. Each swap is previewed
on the board, then committed. The board is always valid and always complete, so they can
stop anywhere and still have a real concept. The system decides Core vs Pro and explains
why in plain language.

-----

## 2. Non-negotiable architecture (the spine)

**A. One source of truth: the 1m board.**
The site is organized into a **board**: `widthM` columns × `depthM` rows, each cell exactly
1m × 1m. The 1m grid is internal measurement and snapping precision only — it is **never**
exposed to the customer as free placement. Depth is organized in fixed **4m bands**,
front-to-back (`bandIndex = floor(yM / 4)`); width comes from the site frontage. Every
element in the building is located by a **card placement** in metres —
`{ cardId, level, xM, yM, widthM, depthM, bandStart, bandSpan }` — never by pixel
coordinates. The design grammar stays card-based: cards have fixed metre dimensions and may
span several 1m cells, but the customer places cards, never individual cells. All levels
share the same board. Both renderers and all card thumbnails read this one board, drawing
only from placed cards — never inventing geometry.

**B. One model → pure renderers.**
A single `ConceptModel` (built deterministically) is the only input to `PlanView` and
`SectionView`. Renderers compute nothing about *where* things are; they only draw what the
model says. If plan and section ever disagree, the cause is a renderer doing its own
geometry — that is a bug, not a feature.

**C. Deterministic assembly.**
`assembleConcept(brief, selections) → ConceptModel` is a **pure function**. Same inputs →
byte-identical output. No `Math.random`, no reliance on object-key order, no shared-mutable
state across pipeline steps. This is what makes it testable and stable.

**D. Cards are intent, not drawing.**
A card never draws or positions a rectangle. It has a **fixed footprint in metres**
(`widthM` × `depthM`, usually a whole number of 4m bands deep) and carries a fill or
parameter (like palette). Placement is resolved by the assembler against the parti's
allowed slots, not by the card.

**E. Parti skeletons give the bones.**
Each archetype maps to a hand-tuned **parti**: a nominal board size, the fixed 4m band
layout, a spine position, and which rectangles are structure / spine / open. Cards fill the
parti's slots. The customer inherits architect-quality proportions for free; cards vary the
fill, not the skeleton.

-----

## 3. Codex failure modes → hard guardrails

Do **not** reproduce these. Each has a one-line rule:

1. **Board positions in pixels.** → All placement is in metres on the 1m board; pixels
   only exist at render time via a single viewBox transform. Never expose 1m cell editing
   to the customer — the design grammar is fixed-size cards snapping to 4m bands.
1. **No single owner of placement state.** → Exactly one `Board` with one
   `placements` list per level; placements never overlap; assignment is resolved, not
   overwritten in a loop.
1. **Renderers recomputing or inventing geometry.** → Renderers are pure read-only
   functions of `ConceptModel`, drawing only from its placed cards. No positioning math
   inside a renderer.
1. **Stair placed off-spine.** → The stair's `CardPlacement.xM` must fall within the
   spine's x-range (`spine.xM` to `spine.xM + spine.widthM`), on every level. Assert it.
1. **Courtyard as a filled room.** → Courtyard is a **void rectangle** cut through **every
   level** it touches — never a card placement with a fill. It is absence, not a block. It
   must read as open in section.
1. **Levels with independent boards.** → Upper levels share the same board (`widthM` /
   `depthM` / band layout) as ground; only which cards are placed differs.
1. **Determinism leaks.** → No randomness, no mutation of inputs, no key-order dependence.
1. **Validation skipped.** → `validate()` runs at the end of assembly and asserts every
   invariant in §5 — including overlaps, boundaries, spine contact, courtyard voids, and
   level stacking. The build is not done until these pass in tests.

-----

## 4. Scope

**In:** the 5-step journey; 1m board + card-placement model; parti library; card catalog; Core/Pro routing;
deterministic `assembleConcept`; `PlanView` + `SectionView`; card thumbnails rendered by
the same renderers at small scale; the pre-fill-and-swap Shape UX; an on-screen concept
deliverable; localStorage persistence.

**Out (future stages — keep model compatible, build nothing now):**

- **Axonometric view.** The model already stores per-level cell occupancy + floor heights,
  so a future axon is a pure add-on. Don’t let any decision block it.
- **PDF export.** Keep the deliverable inside a self-contained `ConceptDeliverable`
  component so a later `exportConcept()` can consume it untouched.
- Accounts, backend, payments. “Activate” is a hand-off link only.

-----

## 5. Data model (concrete — build these types first)

```ts
// --- the board: the ONLY way to locate anything ---
export interface Board {
  widthM: number;         // columns across frontage, 1m each
  depthM: number;         // rows front -> back, 1m each
  originM: { x: number; y: number };
  bandDepthM: number;     // fixed: 4
  bandCount: number;      // = Math.ceil(depthM / bandDepthM)
}

export type FormKind =
  | 'living' | 'kitchen' | 'dining' | 'master' | 'bedroom' | 'bath'
  | 'service' | 'work' | 'retail' | 'circulation' | 'outdoor-room' | 'open'; // 'open' = void/court

export interface CellFill { kind: FormKind; label: string; } // Grade-8 label

// A card placement: a fixed-size card occupying a metre rectangle on one level.
// Cards may span several 1m cells; the customer never places individual cells.
export interface CardPlacement {
  cardId: string;
  level: LevelId;
  xM: number; yM: number;          // top-left, in metres, from board origin
  widthM: number; depthM: number;  // the card's fixed footprint
  bandStart: number;                // = Math.floor(yM / bandDepthM)
  bandSpan: number;                 // number of 4m bands this placement crosses
  fill?: CellFill;                  // omit for a void (courtyard) placement
  void?: boolean;
}

export type LevelId = 'ground' | 'upper' | 'level1' | 'level2plus';
export interface Level {
  id: LevelId;
  floorToFloorM: number;
  baseElevationM: number;
  placements: CardPlacement[];      // the only record of what's built on this level
}

export interface Spine { xM: number; widthM: number; } // a strip street-to-rear, all levels
export interface Concept {
  tier: 'core' | 'pro';
  archetypeId: string;
  siteM: { frontageM: number; depthM: number; northDeg: number;
           setbacks: { front: number; rear: number; side: number }; cornerLot: boolean; };
  board: Board;
  levels: Level[];                         // ground first
  spine: Spine;
  stair: CardPlacement;                    // INVARIANT: stair.xM within spine's x-range
  courtyard?: { xM: number; yM: number; widthM: number; depthM: number }[]; // void rects; each appears on every level it spans
  palette: { name: string; wall: string; roof: string; ground: string; accent: string; };

  // explanatory (Grade 8), filled by assemble + validate:
  title: string; direction: string; layoutLogic: string[]; tradeoffs: string[];
  warnings: string[]; // internal, never shown raw
}

// --- a parti: the curated skeleton ---
export interface PartiSlot {
  category: CardCategory;
  targets: { xM: number; yM: number; widthM: number; depthM: number }[]; // allowed placement rects
}
export interface Parti {
  id: string;                          // matches an archetype emphasis
  widthM: number; depthM: number;      // nominal board this parti is tuned for
  bandDepthM: number;                  // fixed: 4
  spineXM: number; spineWidthM: number;
  fixed: CardPlacement[];              // structural / circulation placements
  openCandidates: { xM: number; yM: number; widthM: number; depthM: number }[]; // where courtyards may sit
  slots: PartiSlot[];                  // which rects each category may place into
}

// --- a card: intent, not geometry ---
export type CardCategory =
  | 'archetype' | 'site' | 'forecourt' | 'courtyard' | 'rear-terrace'
  | 'indoor-living' | 'sleeping' | 'spine-stair'
  | 'outdoor-rooms' | 'upper-terrace' | 'palette';
export interface CardDef {
  id: string; category: CardCategory;
  title: string; blurb: string;          // Grade-8, customer-facing
  tiers: ('core'|'pro')[];
  widthM: number; depthM: number;        // the card's fixed footprint, in metres
  params: Record<string, number|string|boolean>; // interpreted by the assembler
  availableWhen?: (ctx: SelectionContext) => boolean;
}
```

**Invariants `validate()` must assert** (failing test = unfinished build):

- `stair.xM` falls within `[spine.xM, spine.xM + spine.widthM)`, on every level.
- Every courtyard rect is cut as a void placement on **every** level it spans, never a fill.
- No two placements overlap on the same level.
- All built placements lie within frontage × depth minus setbacks.
- Board is **complete**: no required category left unfilled (assembler inserts parti default
  - a warning instead of leaving a hole).
- Pro ⇒ levels ≥ 3 **or** a `work`/`retail` placement exists.

-----

## 6. Assembly pipeline (pure, ordered, tested)

```
assembleConcept(brief, selections):
  1. pick parti from archetype card -> nominal board size, spineXM, fixed placements
  2. set siteM from site card + brief; create the 1m board (widthM, depthM) from site
     meters; create fixed 4m depth bands (bandDepthM = 4)
  3. courtyard card  -> choose an open rect from parti.openCandidates -> void placements
     on all levels
  4. indoor-living   -> place fixed-size cards into ground slot targets
  5. sleeping        -> place fixed-size cards into upper/level slot targets
  6. spine-stair     -> place the stair card within the spine's x-range (assert on-spine)
  7. forecourt / rear-terrace / outdoor-rooms / upper-terrace -> place into their slot targets
  8. palette         -> colors
  9. derive title/direction/layoutLogic/tradeoffs (Grade 8);
     validate() -> overlaps, boundaries, spine contact, courtyard voids, level stacking
  return concept
```

Each step is `(concept, card, ctx) => concept`, pure. Later steps read earlier results.
Missing card ⇒ parti default + warning, never a hole. The renderer draws only from placed
cards — it never invents geometry.

-----

## 7. The two renderers + card thumbnails

`PlanView` and `SectionView` are pure: `({ concept }) => SVG`. Shared primitives, shared
line-weight tokens (cut/structure 2px, secondary 1px, hairline 0.5px), monochrome linework

- single accent fill, no shadows/gradients, always a scale bar.

**PlanView** (top-down): site boundary; north mark rotated by `northDeg` + street arrow;
setbacks (dashed hairline); built placements as poché walls drawn at their metre rectangle;
courtyard rect as open void; spine line down `spine.xM`; **stair drawn as treads at its
placement on the spine**; zone labels in a collision-avoiding gutter; upper-level outline as
a dashed overlay.

**SectionView** (cut along the spine column through the courtyard): floor slabs at correct
elevations/heights; courtyard/void shown as open air between slabs; stair connecting levels
along the spine; roof above top level; ground line + height scale.

**Card thumbnails = the same renderers at small scale.** A thumbnail runs `PlanView` (or
`SectionView` for section-relevant categories) on a tiny sample concept showing **only that
card’s contribution**: hold the house envelope constant across all cards in a category,
dim everything, and highlight just the cell(s)/element the card changes. Result: card,
live board, and final deliverable are visually identical systems — what they pick is what
they get. Never hand-draw separate card art.

-----

## 8. Shape step UX (the “game”)

Collapse “suggested concept” and “selection” into **one pre-filled board the customer
edits**. Rules:

1. **Pre-fill.** On entering Shape, the board is already a complete valid concept from the
   brief. No blank slate.
1. **Structure before fill.** Order categories by impact: archetype → site → courtyard
   (the bones) first, then the fills (living, sleeping, outdoor rooms, palette).
1. **One category open at a time.** Show 2–4 cards for the open category (top picks for this
   brief/site if more exist, behind a quiet “more”). Closed categories collapse to a chip
   showing the current choice. **The board is the hero**, not the card tray.
1. **Preview then commit.** Tapping a card ghosts its change onto the live board; commit
   animates the new form sliding into its bay. This preview moment is the core mechanic.
1. **Always valid, always complete.** `availableWhen` hides cards that don’t fit the site or
   prior picks, so an invalid combination is never offered. No error states, ever — limits
   appear only as what’s on the tray.
1. **Trade-offs as calm copy, not failure.** When a fill forces a compromise, surface a
   Grade-8 line, e.g. *“To keep a private retreat on this narrow lot, the courtyard sits to
   one side rather than the centre.”*
1. **Progress + reward.** Slim progress trail; a board that visibly completes as they go.

Mobile-first: board on top, the single open category’s cards below in a swipeable row.

-----

## 9. Journey + routing

- **01 Brief** — plain questions: who it’s for, the feeling, what matters, plus the few facts
  routing needs (rough levels; single vs multiple uses; public frontage y/n). Pre-derives a
  starting concept.
- **02 Shape** — §8.
- **03 Summary** — concept deliverable: title, 2–3 sentence direction, layout-logic bullets,
  Plan (large) + Section (smaller), trade-offs.
- **04 Pricing** — Core or Pro + the reason (Grade 8).
- **05 Activate** — single hand-off CTA. No payment.

**Routing (pure fn, default Core):** promote to Pro if any of — levels ≥ 3, mixed-use,
live-work, stacked roles, public frontage. The reason string is customer-facing copy.

-----

## 10. Copy standard (enforced)

Grade-8 reading level for all customer-facing strings; calm, design-led voice.
Good: *“This option brings light into the middle of the home.”*
**Banned words** (must never appear in customer-facing text): `schema`, `packet`,
`logic matrix`, `parametric`, `component orchestration`, `spatial program`,
`vertical role structure`, `dashboard`, `software tier`, `bay`, `slot`, `cell`.
(Yes — `bay`/`slot`/`cell` are internal only; describe layouts to the customer as bands or
zones in plain language.) Enforce with a dev-time lint test that scans exported
customer-facing strings and fails the build on a hit.

-----

## 11. Build order (one pass) + gates

1. **Scaffold:** Vite + React + TS + Tailwind + Zustand + react-router. 5 empty routes,
   layout shell, theme tokens, localStorage persistence. *Gate:* click through all 5; a
   refresh preserves state.
1. **Model + data:** §5 types, one parti (`family-courtyard`), minimum card catalog,
   routing, `assembleConcept`, `validate`, copy-lint. Unit tests. *Gate:* a sample selection
   produces a valid `Concept`; all §5 invariants + routing + copy-lint tests pass.
1. **PlanView:** render the sample concept. *Gate:* central-courtyard plan reads as walls
   around an open middle, stair on the spine, north + street marks, labels non-overlapping.
1. **Shape UX:** pre-filled board, one-category-open loop, preview/commit, live re-derive,
   `availableWhen` filtering, card thumbnails via PlanView-at-small-scale. *Gate:* swapping a
   card visibly and correctly changes the board; board never enters an invalid state.
1. **SectionView** (+ section thumbnails for spine/stair, sleeping, upper-terrace). *Gate:*
   floor-to-floor visible, void reads as open, stair connects levels along the spine.
1. **Brief / Summary / Pricing / Activate** + `ConceptDeliverable`. *Gate:* full journey
   runs end-to-end to a complete on-screen concept.
1. **Polish + copy sweep.** *Gate:* the done test below.

Add the remaining partis (one per archetype) and remaining cards once the
`family-courtyard` path passes gate 6, reusing the same machinery.

-----

## 12. Definition of done

A sample journey runs Brief → Activate without a blank slate or an error state; the board
stays valid and complete throughout; Plan and Section are pure functions of one board
model and agree with each other; the stair sits on the spine; the courtyard reads as open in
both views; card thumbnails are the same renderer at small scale; all §5 invariants and the
copy-lint pass in tests.

**Founder gate:** would we confidently show this Plan and Section to an informed customer?
If yes, ship.