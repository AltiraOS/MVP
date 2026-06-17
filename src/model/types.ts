// Core data model. See altira-mvp-oneshot-brief.md §5 — these types are the
// single source of truth; renderers and the assembler only ever read them.

// --- the board: the ONLY way to locate anything, at 1m resolution ---
export interface Board {
  widthM: number // usable building width, metres (1m resolution)
  depthM: number // usable building depth, metres (1m resolution)
  originM: { x: number; y: number }
  colCount: number // columns across the frontage
  colWidthM: number // DERIVED = widthM / colCount
  bandCount: number // depth bands front -> back, nominally ~4m each
  bandDepthsM: number[] // length === bandCount, sums to depthM
}

// CellAddr is an authoring-time coordinate into the board's column/band
// grid — never a customer-facing concept and never exposed as free 1m
// placement. The assembler resolves every CellAddr into a real metre
// rectangle exactly once, via cellRectM; nothing downstream re-derives it.
export interface CellAddr {
  col: number
  band: number
}

export type FormKind =
  | 'living'
  | 'kitchen'
  | 'dining'
  | 'master'
  | 'bedroom'
  | 'bath'
  | 'service'
  | 'work'
  | 'retail'
  | 'circulation'
  | 'outdoor-room'
  | 'open' // 'open' = void/court

export interface CellFill {
  kind: FormKind
  label: string // Grade-8 label
}

export type LevelId = 'ground' | 'upper' | 'level1' | 'level2plus'

// A card placement: a fixed-size rectangle, in metres, occupying one or
// more 1m cells on one level. This is the ONLY record of what's built —
// renderers draw placements exactly as given, never recomputing position
// from an address.
export interface CardPlacement {
  cardId: string
  level: LevelId
  xM: number
  yM: number
  widthM: number
  depthM: number
  colStart: number
  colSpan: number
  bandStart: number
  bandSpan: number
  fill?: CellFill // omit for a void (courtyard) placement
  void?: boolean
}

export interface Level {
  id: LevelId
  floorToFloorM: number
  baseElevationM: number
  placements: CardPlacement[] // the only record of what's built on this level
}

export interface Spine {
  xM: number
  widthM: number
} // a strip street-to-rear, all levels

export interface SiteM {
  frontageM: number
  depthM: number
  northDeg: number
  setbacks: { front: number; rear: number; side: number }
  cornerLot: boolean
}

export interface Palette {
  name: string
  wall: string
  roof: string
  ground: string
  accent: string
}

export interface Concept {
  tier: 'core' | 'pro'
  archetypeId: string
  siteM: SiteM
  board: Board
  levels: Level[] // ground first
  spine: Spine
  stair: CardPlacement // INVARIANT: stair.xM within [spine.xM, spine.xM + spine.widthM)
  courtyard?: CardPlacement[] // void placements; each appears on every level it spans
  palette: Palette

  // explanatory (Grade 8), filled by assemble + validate:
  title: string
  direction: string
  layoutLogic: string[]
  tradeoffs: string[]
  warnings: string[] // internal, never shown raw
}

// --- a parti: the curated skeleton ---
// DECISION: the brief's Parti shape (bayCount/bandCount/bandRatios/spineCol/
// fixed/openCandidates/slots) describes the ground level. Upper levels need
// their own fixed cells, slot targets, floor heights and "unbuilt" cells, so
// we add `levels` for everything beyond ground rather than redesigning the
// locked top-level shape.
export interface PartiLevelDef {
  id: LevelId
  floorToFloorM: number
  baseElevationM: number
  fixed: { addr: CellAddr; fill: CellFill }[]
  slots: { category: CardCategory; targets: CellAddr[] }[]
  unbuilt?: CellAddr[] // cells with no default assignment (roof/terrace over below)
}

// DECISION: a parti is authored once and resolved onto whatever site the
// customer picks, so its slots/fixed cells are addressed by (col, band) —
// the same 1m-grid coordinate the board itself uses — rather than baked
// metres for one nominal site. assembleConcept (and resolveOnSite, against
// the same real board) is the only place a CellAddr becomes a real metre
// rectangle, via cellRectM in grid.ts.
export interface Parti {
  id: string // matches an archetype emphasis
  colCount: number
  bandCount: number
  bandRatios: number[]
  spineCol: number
  groundFloorToFloorM: number
  groundBaseElevationM: number
  fixed: { addr: CellAddr; fill: CellFill }[]
  openCandidates: CellAddr[] // where courtyards may sit
  slots: { category: CardCategory; targets: CellAddr[] }[] // which cells each category fills
  levels: PartiLevelDef[] // additional levels beyond ground, ground-first overall
}

// --- a card: intent, not geometry ---
export type CardCategory =
  | 'archetype'
  | 'site'
  | 'forecourt'
  | 'courtyard'
  | 'rear-terrace'
  | 'indoor-living'
  | 'sleeping'
  | 'spine-stair'
  | 'outdoor-rooms'
  | 'upper-terrace'
  | 'palette'

// DECISION: a flat Record<string, primitive> can't express "fill these
// cells with these kinds/labels" or "make these cells voids", and a single
// card can resolve into several rooms at once (e.g. "Family bedrooms" fills
// four cells). `cellOps` carries that structured intent as a list of
// fixed-size placements-to-be, addressed by (col, band); `params` stays for
// scalar settings (site dimensions, palette colours, archetype levels).
export interface CellOp {
  addr: CellAddr
  fill?: CellFill // omit + void:true to cut a void instead
  void?: boolean
  levels?: LevelId[] // which levels this op applies to; default ['ground']
}

export interface CardDef {
  id: string
  category: CardCategory
  title: string
  blurb: string // Grade-8, customer-facing
  tiers: ('core' | 'pro')[]
  params: Record<string, number | string | boolean>
  cellOps?: CellOp[]
  tradeoff?: string // calm, customer-facing trade-off copy (optional)
  availableWhen?: (ctx: SelectionContext) => boolean
}

export interface BriefAnswers {
  householdName: string
  who: string // who the home is for
  feeling: string // the feeling they want it to have
  priorities: string[] // what matters most to them
  levels: 1 | 2 | 3 // rough levels
  uses: 'single' | 'multiple' // single vs multiple uses
  publicFrontage: boolean // public-facing frontage (shop, studio, etc.)
}

export type Selections = Partial<Record<CardCategory, string>>

export interface SelectionContext {
  brief: BriefAnswers
  selections: Selections
}
