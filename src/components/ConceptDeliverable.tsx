import type { Concept } from '../model/types'
import { PlanView } from '../render/PlanView'
import { SectionView } from '../render/SectionView'

export interface ConceptDeliverableProps {
  concept: Concept
}

// The on-screen concept: title, direction, the thinking behind the layout,
// the Plan (large) and Section (smaller), and any trade-offs made along the
// way — the calm write-up the customer takes away from Shape.
export function ConceptDeliverable({ concept }: ConceptDeliverableProps) {
  return (
    <article>
      <h2 className="text-xl font-semibold tracking-tight">{concept.title}</h2>
      <p className="mt-2 text-ink-soft">{concept.direction}</p>

      <ul className="mt-4 space-y-2 text-sm">
        {concept.layoutLogic.map((line) => (
          <li key={line} className="flex gap-2">
            <span aria-hidden="true" className="text-accent">
              •
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-xl border border-line bg-panel p-4">
        <PlanView concept={concept} className="w-full" />
      </div>
      <div className="mt-4 rounded-xl border border-line bg-panel p-4">
        <SectionView concept={concept} className="w-full max-h-48" />
      </div>

      {concept.tradeoffs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium">Trade-offs</h3>
          <ul className="mt-2 space-y-2 text-sm text-ink-soft">
            {concept.tradeoffs.map((tradeoff) => (
              <li key={tradeoff}>{tradeoff}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}
