import type { CardCategory } from './types'

// Customer-facing names and descriptions for each choice category. Shown in
// the progress trail and above each card tray in the Shape step.
export const CATEGORY_LABELS: Record<CardCategory, string> = {
  archetype: 'Home style',
  site: 'Your block',
  courtyard: 'Courtyard',
  'indoor-living': 'Living spaces',
  sleeping: 'Bedrooms',
  'spine-stair': 'Stair',
  forecourt: 'Front garden',
  'rear-terrace': 'Back garden',
  'outdoor-rooms': 'Extra room',
  'upper-terrace': 'Upstairs outdoor space',
  palette: 'Colours & materials',
}

export const CATEGORY_DESCRIPTIONS: Record<CardCategory, string> = {
  archetype: 'The overall shape of your home.',
  site: 'The size and shape of your block.',
  courtyard: 'Where the open-air heart of your home sits.',
  'indoor-living': 'How living, dining and the kitchen come together.',
  sleeping: 'How the bedrooms upstairs are arranged.',
  'spine-stair': 'Where the stair connects the floors.',
  forecourt: 'What greets you at the front door.',
  'rear-terrace': 'How the back of the home meets the garden.',
  'outdoor-rooms': 'Whether this room opens to the outdoors.',
  'upper-terrace': 'What sits at the top of the stairs.',
  palette: 'The colours and materials of your home.',
}

// Grade-8, calm, design-led copy is the standard for everything the
// customer sees. These words leak internal mechanics and must never appear
// in customer-facing strings (brief §10).
export const BANNED_WORDS = [
  'schema',
  'packet',
  'logic matrix',
  'parametric',
  'component orchestration',
  'spatial program',
  'vertical role structure',
  'dashboard',
  'software tier',
  'bay',
  'slot',
  'cell',
] as const

export interface BannedWordHit {
  word: string
  text: string
}

// Scans a list of customer-facing strings for banned words. Whole-word,
// case-insensitive match so "cell" doesn't also flag "cellar" etc.
export function findBannedWords(strings: string[]): BannedWordHit[] {
  const hits: BannedWordHit[] = []
  for (const text of strings) {
    for (const word of BANNED_WORDS) {
      const pattern = new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'i')
      if (pattern.test(text)) {
        hits.push({ word, text })
      }
    }
  }
  return hits
}
