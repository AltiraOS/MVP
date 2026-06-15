import type {
  BriefAnswers,
  CardDef,
  CardCategory,
  CellAddr,
  Concept,
  Level,
  LevelId,
  Palette,
  Selections,
  SiteM,
} from './types'
import { PARTIS } from './partis'
import { cardsByCategory } from './cards'
import { cellKey, deriveBayGrid, sameCell } from './grid'
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

  // --- step 2: site -> siteM, derive grid ---
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
  const grid = deriveBayGrid(siteM, parti)

  // --- initialise levels from the parti skeleton ---
  const levels: Level[] = []
  const ground: Level = {
    id: 'ground',
    floorToFloorM: parti.groundFloorToFloorM,
    baseElevationM: parti.groundBaseElevationM,
    assignments: {},
    voids: [],
  }
  for (const f of parti.fixed) {
    ground.assignments[cellKey(f.addr)] = f.fill
  }
  levels.push(ground)

  for (const levelDef of parti.levels) {
    const level: Level = {
      id: levelDef.id,
      floorToFloorM: levelDef.floorToFloorM,
      baseElevationM: levelDef.baseElevationM,
      assignments: {},
      voids: [],
    }
    for (const f of levelDef.fixed) {
      level.assignments[cellKey(f.addr)] = f.fill
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
        if (op.fill) level.assignments[cellKey(op.addr)] = op.fill
        if (op.void && !level.voids.some((v) => sameCell(v, op.addr))) {
          level.voids.push(op.addr)
        }
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
        if (level.voids.some((v) => sameCell(v, op.addr))) continue
        level.assignments[cellKey(op.addr)] = op.fill
      }
    }
  }

  // --- step 3: courtyard -> open cells, cut as voids on every level they span ---
  const courtyardCard = resolveCard('courtyard')
  applyCellOps(courtyardCard, ['ground', 'upper'])
  const courtyard: CellAddr[] = (courtyardCard.cellOps ?? []).map((op) => op.addr)

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

  // --- step 9: tier, explanatory copy, validate ---
  const concept: Concept = {
    tier: 'core',
    archetypeId: parti.id,
    siteM,
    grid,
    levels,
    spine: { col: parti.spineCol },
    stair: stairAddr,
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
