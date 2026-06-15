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
