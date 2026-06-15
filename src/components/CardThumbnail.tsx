import type { BriefAnswers, CardDef, Selections } from '../model/types'
import { assembleConcept } from '../model/assemble'
import { PlanView } from '../render/PlanView'

export interface CardThumbnailProps {
  brief: BriefAnswers
  selections: Selections
  card: CardDef
  selected: boolean
  onSelect: () => void
}

// A card option, rendered as the real board it would produce (at small
// scale) so the customer sees the actual change, not an icon standing in
// for it.
export function CardThumbnail({ brief, selections, card, selected, onSelect }: CardThumbnailProps) {
  const previewSelections: Selections = { ...selections, [card.category]: card.id }
  const concept = assembleConcept(brief, previewSelections)
  const highlight = card.cellOps?.length ? card.cellOps.map((op) => op.addr) : undefined

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex flex-col rounded-lg border p-2 text-left transition ${
        selected ? 'border-accent ring-1 ring-accent' : 'border-line hover:border-ink-soft'
      }`}
    >
      <PlanView concept={concept} highlight={highlight} className="w-full" />
      <span className="mt-2 text-sm font-medium">{card.title}</span>
      <span className="mt-1 text-xs text-ink-soft">{card.blurb}</span>
      {selected && card.tradeoff && <span className="mt-1 text-xs text-accent">{card.tradeoff}</span>}
    </button>
  )
}
