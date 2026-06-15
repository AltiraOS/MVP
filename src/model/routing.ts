import type { BriefAnswers, Concept } from './types'

export interface TierResult {
  tier: 'core' | 'pro'
  reason: string
}

// DECISION: the §5 invariant requires Pro ⇒ levels >= 3 or a work/retail
// cell exists, so routing keys off the assembled concept itself (which is
// always consistent with that invariant) rather than brief answers alone.
// Brief signals that imply "more than one use" only promote the tier when
// they show up as a work/retail cell or extra level in the concept — with
// a single parti that's the only way those answers can actually change the
// building today.
export function determineTier(concept: Concept, brief: BriefAnswers): TierResult {
  const hasExtraLevels = concept.levels.length >= 3
  const hasWorkOrRetail = concept.levels.some((level) =>
    Object.values(level.assignments).some((fill) => fill.kind === 'work' || fill.kind === 'retail'),
  )

  if (!hasExtraLevels && !hasWorkOrRetail) {
    return {
      tier: 'core',
      reason:
        'This concept fits our Core package. It is one home across two floors, with everything close to the street.',
    }
  }

  const reasons: string[] = []
  if (hasExtraLevels) reasons.push('it spans three floors')
  if (hasWorkOrRetail) reasons.push('it includes a dedicated work space')
  if (brief.uses === 'multiple') reasons.push('it needs to support more than one use')
  if (brief.publicFrontage) reasons.push('part of it faces the street for visitors or clients')

  return {
    tier: 'pro',
    reason: `This concept calls for our Pro package because ${joinReasons(reasons)}.`,
  }
}

function joinReasons(reasons: string[]): string {
  if (reasons.length === 1) return reasons[0]
  if (reasons.length === 2) return `${reasons[0]} and ${reasons[1]}`
  return `${reasons.slice(0, -1).join(', ')}, and ${reasons[reasons.length - 1]}`
}
