// Core data model. See altira-mvp-oneshot-brief.md §5 — these types are the
// single source of truth; renderers and the assembler only ever read them.

// --- the grid: the ONLY way to locate anything ---
export interface BayGrid {
  bayCount: number; // columns across frontage
  bandCount: number; // depth bands front -> back
  originM: { x: number; y: number };
  bayWidthM: number; // DERIVED = usableFrontageM / bayCount
  bandDepthsM: number[]; // length === bandCount, sums to usable depth
}

export interface CellAddr {
  col: number;
  band: number;
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

export interface Level {
  id: LevelId
  floorToFloorM: number
  baseElevationM: number
  assignments: Record<string, CellFill> // key = `${col}:${band}`; absent = unbuilt
  voids: CellAddr[] // open-to-sky / double-height cells (courtyard)
}

export interface Spine {
  col: number
} // spine runs down one bay column, all levels

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
  grid: BayGrid
  levels: Level[] // ground first
  spine: Spine
  stair: CellAddr // INVARIANT: stair.col === spine.col
  courtyard?: CellAddr[] // open cells; appear in every level's voids
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

export interface Parti {
  id: string // matches an archetype emphasis
  bayCount: number
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
// cells with these kinds/labels" or "make these cells voids". `cellOps`
// carries that structured intent; `params` stays for scalar settings
// (site dimensions, palette colours, archetype levels).
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
