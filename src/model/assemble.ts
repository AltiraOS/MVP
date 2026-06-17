import type {
  BriefAnswers,
  CardDef,
  CardCategory,
  CardPlacement,
  CellFill,
  Concept,
  Level,
  LevelId,
  Palette,
  Selections,
  SiteM,
} from './types'
import { PARTIS } from './partis'
import { cardsByCategory } from './cards'
import { cellKey, cellRectM, deriveBoard } from './grid'
import { determineTier } from './routing'
import { validate } from './validate'

// assembleConcept(brief, selections) -> Concept. Pure: same inputs always
// produce a byte-identical concept. See brief §6 for the pipeline order.
export function assembleConcept(brief: BriefAnswers, selections: Selections): Concept {
  const warnings: string[] = []

  function resolveCard(category: CardCategory): CardDef {
    const candidates = cardsByCategory(category)
    const ctx = { brief, selections }
    const selectedId = selections[category]
    let card = selectedId ? candidates.find((c) => c.id === selectedId) : undefined

    if (card?.availableWhen && !card.availableWhen(ctx)) {
      warnings.push(
        `"${card.title}" isn't offered for this site, so we used the suggested option instead.`,
      )
      card = undefined
    }

    if (!card) {
      card = candidates.find((c) => !c.availableWhen || c.availableWhen(ctx)) ?? candidates[0]
      if (selectedId && selectedId !== card.id) {
        warnings.push(`No option was chosen for "${category}", so we used "${card.title}".`)
      }
    }

    return card
  }

  // --- step 1: archetype -> parti ---
  const archetypeCard = resolveCard('archetype')
  const partiId = String(archetypeCard.params.partiId)
  const parti = PARTIS[partiId]
  if (!parti) throw new Error(`Unknown parti: ${partiId}`)

  // --- step 2: site -> siteM, create the 1m board with fixed depth bands ---
  const siteCard = resolveCard('site')
  const siteM: SiteM = {
    frontageM: Number(siteCard.params.frontageM),
    depthM: Number(siteCard.params.depthM),
    northDeg: Number(siteCard.params.northDeg),
    setbacks: {
      front: Number(siteCard.params.setbackFront),
      rear: Number(siteCard.params.setbackRear),
      side: Number(siteCard.params.setbackSide),
    },
    cornerLot: Boolean(siteCard.params.cornerLot),
  }
  const board = deriveBoard(siteM, parti)

  // Places a single fixed-size card op onto the board, overwriting any
  // existing placement at the same address (later steps may intentionally
  // replace an earlier step's fill at the same cell).
  function placeOp(level: Level, addr: { col: number; band: number }, cardId: string, fill?: CellFill, isVoid?: boolean): void {
    const rect = cellRectM(board, addr)
    const key = cellKey(addr)
    level.placements = level.placements.filter((p) => cellKey({ col: p.colStart, band: p.bandStart }) !== key)
    level.placements.push({
      cardId,
      level: level.id,
      xM: rect.x,
      yM: rect.y,
      widthM: rect.w,
      depthM: rect.h,
      colStart: addr.col,
      colSpan: 1,
      bandStart: addr.band,
      bandSpan: 1,
      fill,
      void: isVoid,
    })
  }

  // --- initialise levels from the parti skeleton ---
  const levels: Level[] = []
  const ground: Level = {
    id: 'ground',
    floorToFloorM: parti.groundFloorToFloorM,
    baseElevationM: parti.groundBaseElevationM,
    placements: [],
  }
  for (const f of parti.fixed) {
    placeOp(ground, f.addr, 'parti-fixed', f.fill)
  }
  levels.push(ground)

  for (const levelDef of parti.levels) {
    const level: Level = {
      id: levelDef.id,
      floorToFloorM: levelDef.floorToFloorM,
      baseElevationM: levelDef.baseElevationM,
      placements: [],
    }
    for (const f of levelDef.fixed) {
      placeOp(level, f.addr, 'parti-fixed', f.fill)
    }
    levels.push(level)
  }

  const levelById = (id: LevelId) => levels.find((l) => l.id === id)

  // Fill (or void) cells from a card's cellOps. `defaultLevels` applies when
  // an op doesn't specify which levels it targets.
  function applyCellOps(card: CardDef, defaultLevels: LevelId[]): void {
    for (const op of card.cellOps ?? []) {
      const targetLevels = op.levels ?? defaultLevels
      for (const levelId of targetLevels) {
        const level = levelById(levelId)
        if (!level) continue
        if (op.fill) placeOp(level, op.addr, card.id, op.fill, op.void)
      }
    }
  }

  // Like applyCellOps, but never fills a cell that's already a courtyard void.
  function applyFillUnlessVoid(card: CardDef, defaultLevels: LevelId[]): void {
    for (const op of card.cellOps ?? []) {
      if (!op.fill) continue
      const targetLevels = op.levels ?? defaultLevels
      for (const levelId of targetLevels) {
        const level = levelById(levelId)
        if (!level) continue
        const existing = level.placements.find(
          (p) => p.colStart === op.addr.col && p.bandStart === op.addr.band,
        )
        if (existing?.void) continue
        placeOp(level, op.addr, card.id, op.fill)
      }
    }
  }

  // --- step 3: courtyard -> open cells, cut as voids on every level they span ---
  const courtyardCard = resolveCard('courtyard')
  applyCellOps(courtyardCard, ['ground', 'upper'])
  const courtyardAddrs = (courtyardCard.cellOps ?? []).map((op) => op.addr)
  const courtyard: CardPlacement[] = courtyardAddrs.map((addr) => {
    const rect = cellRectM(board, addr)
    return {
      cardId: courtyardCard.id,
      level: 'ground',
      xM: rect.x,
      yM: rect.y,
      widthM: rect.w,
      depthM: rect.h,
      colStart: addr.col,
      colSpan: 1,
      bandStart: addr.band,
      bandSpan: 1,
      fill: { kind: 'open', label: 'Courtyard' },
      void: true,
    }
  })

  // --- step 4: indoor-living -> ground slot cells ---
  const indoorLivingCard = resolveCard('indoor-living')
  applyFillUnlessVoid(indoorLivingCard, ['ground'])

  // --- step 5: sleeping -> upper slot cells ---
  const sleepingCard = resolveCard('sleeping')
  applyFillUnlessVoid(sleepingCard, ['upper'])

  // --- step 6: spine-stair -> stair cell on the spine ---
  const stairCard = resolveCard('spine-stair')
  applyCellOps(stairCard, ['ground', 'upper'])
  const stairAddr = stairCard.cellOps?.[0]?.addr
  if (!stairAddr) throw new Error('spine-stair card must define a target cell')
  if (stairAddr.col !== parti.spineCol) {
    throw new Error('spine-stair card must target the spine column')
  }
  const stairRect = cellRectM(board, stairAddr)
  const stair: CardPlacement = {
    cardId: stairCard.id,
    level: 'ground',
    xM: stairRect.x,
    yM: stairRect.y,
    widthM: stairRect.w,
    depthM: stairRect.h,
    colStart: stairAddr.col,
    colSpan: 1,
    bandStart: stairAddr.band,
    bandSpan: 1,
    fill: { kind: 'circulation', label: 'Stair' },
  }

  // --- step 7: forecourt / rear-terrace / outdoor-rooms / upper-terrace ---
  const forecourtCard = resolveCard('forecourt')
  applyFillUnlessVoid(forecourtCard, ['ground'])

  const rearTerraceCard = resolveCard('rear-terrace')
  applyFillUnlessVoid(rearTerraceCard, ['ground'])

  const outdoorRoomsCard = resolveCard('outdoor-rooms')
  applyFillUnlessVoid(outdoorRoomsCard, ['ground'])

  const upperTerraceCard = resolveCard('upper-terrace')
  applyFillUnlessVoid(upperTerraceCard, ['upper'])

  // --- step 8: palette ---
  const paletteCard = resolveCard('palette')
  const palette: Palette = {
    name: String(paletteCard.params.name),
    wall: String(paletteCard.params.wall),
    roof: String(paletteCard.params.roof),
    ground: String(paletteCard.params.ground),
    accent: String(paletteCard.params.accent),
  }

  // --- step 9: spine, tier, explanatory copy, validate ---
  const spineColWidthM = board.colWidthM
  const concept: Concept = {
    tier: 'core',
    archetypeId: parti.id,
    siteM,
    board,
    levels,
    spine: { xM: board.originM.x + parti.spineCol * spineColWidthM, widthM: spineColWidthM },
    stair,
    courtyard,
    palette,
    title: '',
    direction: '',
    layoutLogic: [],
    tradeoffs: [],
    warnings,
  }

  concept.tier = determineTier(concept, brief).tier

  const cardsUsed = [
    archetypeCard,
    siteCard,
    courtyardCard,
    indoorLivingCard,
    sleepingCard,
    stairCard,
    forecourtCard,
    rearTerraceCard,
    outdoorRoomsCard,
    upperTerraceCard,
    paletteCard,
  ]

  concept.title = brief.householdName.trim() || archetypeCard.title
  concept.direction = deriveDirection(brief, archetypeCard, courtyardCard)
  concept.layoutLogic = deriveLayoutLogic(courtyardCard, stairCard, indoorLivingCard)
  concept.tradeoffs = cardsUsed.map((c) => c.tradeoff).filter((t): t is string => !!t)

  validate(concept)
  return concept
}

function deriveDirection(brief: BriefAnswers, archetypeCard: CardDef, courtyardCard: CardDef): string {
  const sentences = [archetypeCard.blurb, courtyardCard.blurb]
  if (brief.who.trim()) {
    sentences.push(`This concept is shaped around ${brief.who.trim()}.`)
  }
  return sentences.join(' ')
}

function deriveLayoutLogic(courtyardCard: CardDef, stairCard: CardDef, indoorLivingCard: CardDef): string[] {
  const logic: string[] = []

  logic.push(
    courtyardCard.id === 'courtyard-deep'
      ? 'A deep courtyard runs through the middle of the home, bringing light and air to the rooms around it.'
      : 'A courtyard opens at the heart of the home, bringing light into the rooms around it.',
  )

  logic.push(
    stairCard.id === 'stair-rear'
      ? 'The stair sits toward the back of the home, so the centre stays open and calm.'
      : 'The stair runs through the centre of the home, connecting both floors without cutting through living spaces.',
  )

  logic.push("Bedrooms sit upstairs, away from the street, for a quieter night's sleep.")

  if (indoorLivingCard.id === 'living-work') {
    logic.push('A home office near the entry keeps work separate from everyday living.')
  }

  return logic
}
