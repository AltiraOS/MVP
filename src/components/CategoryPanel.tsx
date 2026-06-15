import type { BriefAnswers, CardCategory, Selections } from '../model/types'
import { cardsByCategory } from '../model/cards'
import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS } from '../model/copy'
import { CardThumbnail } from './CardThumbnail'

export interface CategoryPanelProps {
  brief: BriefAnswers
  selections: Selections
  category: CardCategory
  onSelectCard: (cardId: string) => void
}

// The open category's title, description and the cards on offer for it.
// Cards that aren't valid for the current selections (availableWhen) are
// left out, so every visible option is a real, valid swap.
export function CategoryPanel({ brief, selections, category, onSelectCard }: CategoryPanelProps) {
  const ctx = { brief, selections }
  const cards = cardsByCategory(category).filter((card) => !card.availableWhen || card.availableWhen(ctx))
  const selectedId = selections[category]

  return (
    <section aria-label={CATEGORY_LABELS[category]}>
      <h2 className="text-lg font-semibold tracking-tight">{CATEGORY_LABELS[category]}</h2>
      <p className="mt-1 text-sm text-ink-soft">{CATEGORY_DESCRIPTIONS[category]}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <CardThumbnail
            key={card.id}
            brief={brief}
            selections={selections}
            card={card}
            selected={card.id === selectedId}
            onSelect={() => onSelectCard(card.id)}
          />
        ))}
      </div>
    </section>
  )
}
