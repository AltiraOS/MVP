import { describe, expect, it } from 'vitest'
import { assembleConcept } from './assemble'
import { DEFAULT_BRIEF, deriveInitialSelections, FEELING_OPTIONS, PRIORITY_OPTIONS } from './brief'
import { CARDS } from './cards'
import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS, findBannedWords } from './copy'
import { determineTier } from './routing'
import type { BriefAnswers } from './types'

function collectCardStrings(): string[] {
  const strings: string[] = []
  for (const card of CARDS) {
    strings.push(card.title, card.blurb)
    if (card.tradeoff) strings.push(card.tradeoff)
  }
  return strings
}

function collectConceptStrings(brief: BriefAnswers): string[] {
  const selections = deriveInitialSelections(brief)
  const concept = assembleConcept(brief, selections)
  const { reason } = determineTier(concept, brief)
  return [concept.title, concept.direction, ...concept.layoutLogic, ...concept.tradeoffs, reason]
}

describe('customer-facing copy', () => {
  it('contains no banned words in the card catalog', () => {
    expect(findBannedWords(collectCardStrings())).toEqual([])
  })

  it('contains no banned words in brief option labels', () => {
    expect(findBannedWords([...FEELING_OPTIONS, ...PRIORITY_OPTIONS])).toEqual([])
  })

  it('contains no banned words in category labels and descriptions', () => {
    expect(
      findBannedWords([...Object.values(CATEGORY_LABELS), ...Object.values(CATEGORY_DESCRIPTIONS)]),
    ).toEqual([])
  })

  it('contains no banned words in a derived concept (Core and Pro)', () => {
    const coreBrief = { ...DEFAULT_BRIEF, householdName: 'Sample House' }
    expect(findBannedWords(collectConceptStrings(coreBrief))).toEqual([])

    const proBrief: BriefAnswers = {
      ...DEFAULT_BRIEF,
      householdName: 'Sample House',
      priorities: ['A home office'],
      uses: 'multiple',
    }
    expect(findBannedWords(collectConceptStrings(proBrief))).toEqual([])
  })

  it('flags banned words when they appear', () => {
    expect(findBannedWords(['Each room sits in its own bay.'])).toHaveLength(1)
    expect(findBannedWords(['This uses a parametric layout.'])).toHaveLength(1)
    expect(findBannedWords(['A calm, sunlit courtyard home.'])).toEqual([])
  })
})
