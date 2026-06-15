import type { BriefAnswers, Selections } from './types'
import { cardsByCategory } from './cards'

export const FEELING_OPTIONS = [
  'Warm and welcoming',
  'Calm and airy',
  'Bold and modern',
  'Quiet and private',
] as const

export const PRIORITY_OPTIONS = [
  'Light and air',
  'A private outdoor space',
  'A home office',
  'Room for guests',
  'Easy upkeep',
] as const

export const DEFAULT_BRIEF: BriefAnswers = {
  householdName: '',
  who: '',
  feeling: FEELING_OPTIONS[0],
  priorities: [],
  levels: 2,
  uses: 'single',
  publicFrontage: false,
}

// Pre-derives a starting concept from the brief. Picks one card per category
// — the assembler falls back to the parti default for anything unavailable.
export function deriveInitialSelections(brief: BriefAnswers): Selections {
  const wantsHomeOffice = brief.priorities.includes('A home office')
  const wantsGuestRoom = brief.priorities.includes('Room for guests')
  const wantsOutdoorRoom = brief.priorities.includes('A private outdoor space')
  const calm = brief.feeling === 'Calm and airy' || brief.feeling === 'Quiet and private'

  const selections: Selections = {
    archetype: 'archetype-family-courtyard',
    site: 'site-standard',
    courtyard: 'courtyard-centre',
    'indoor-living': brief.uses === 'multiple' || wantsHomeOffice ? 'living-work' : 'living-open',
    sleeping: wantsGuestRoom ? 'sleeping-guest' : 'sleeping-family',
    'spine-stair': 'stair-central',
    forecourt: brief.publicFrontage ? 'forecourt-court' : 'forecourt-garden',
    'rear-terrace': 'terrace-standard',
    'outdoor-rooms': wantsOutdoorRoom ? 'outdoor-rooms-deck' : 'outdoor-rooms-none',
    'upper-terrace': 'upper-terrace-open',
    palette: calm ? 'palette-cool' : 'palette-warm',
  }

  // Make sure every category has a real card id (fall back to the first
  // card in that category if our heuristic picked something odd).
  for (const category of Object.keys(selections) as (keyof Selections)[]) {
    const id = selections[category]
    const valid = cardsByCategory(category).some((c) => c.id === id)
    if (!valid) {
      selections[category] = cardsByCategory(category)[0]?.id
    }
  }

  return selections
}
