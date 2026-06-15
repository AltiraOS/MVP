import type { CardCategory, Selections } from '../model/types'
import { CATEGORY_ORDER } from '../model/cards'
import { CATEGORY_LABELS } from '../model/copy'

export interface ProgressTrailProps {
  selections: Selections
  openCategory: CardCategory
  onSelectCategory: (category: CardCategory) => void
}

// A horizontal trail of every choice category, in pipeline order. The
// current category is highlighted; choices already made are marked done.
export function ProgressTrail({ selections, openCategory, onSelectCategory }: ProgressTrailProps) {
  return (
    <ol aria-label="Your choices" className="flex flex-wrap gap-2">
      {CATEGORY_ORDER.map((category) => {
        const isOpen = category === openCategory
        const isDone = Boolean(selections[category])
        return (
          <li key={category}>
            <button
              type="button"
              onClick={() => onSelectCategory(category)}
              aria-current={isOpen ? 'step' : undefined}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                isOpen
                  ? 'border-accent bg-accent-soft text-ink'
                  : isDone
                    ? 'border-line bg-panel text-ink'
                    : 'border-line bg-panel text-ink-soft'
              }`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
