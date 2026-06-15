import { FEELING_OPTIONS, PRIORITY_OPTIONS } from '../model/brief'
import { useConceptStore } from '../store/useConceptStore'

const LEVEL_OPTIONS = [1, 2, 3] as const

const USE_OPTIONS = [
  { value: 'single', label: 'Just a home' },
  { value: 'multiple', label: 'A home and a workspace' },
] as const

export default function BriefPage() {
  const brief = useConceptStore((s) => s.brief)
  const setBriefAnswer = useConceptStore((s) => s.setBriefAnswer)

  function togglePriority(option: string) {
    const has = brief.priorities.includes(option)
    const next = has ? brief.priorities.filter((p) => p !== option) : [...brief.priorities, option]
    setBriefAnswer('priorities', next)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Tell us about your home</h1>
      <p className="mt-2 text-ink-soft">
        A few plain questions help us put together a starting concept. You can change any of this later.
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <label className="block text-sm font-medium" htmlFor="householdName">
            What should we call this project?
          </label>
          <input
            id="householdName"
            type="text"
            value={brief.householdName}
            onChange={(e) => setBriefAnswer('householdName', e.target.value)}
            placeholder="e.g. The Hill Street House"
            className="mt-2 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="who">
            Who is this home for?
          </label>
          <input
            id="who"
            type="text"
            value={brief.who}
            onChange={(e) => setBriefAnswer('who', e.target.value)}
            placeholder="e.g. a family of four, with room for visiting grandparents"
            className="mt-2 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium">What feeling do you want it to have?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {FEELING_OPTIONS.map((option) => (
              <label
                key={option}
                className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition ${
                  brief.feeling === option ? 'border-accent bg-accent-soft' : 'border-line bg-panel'
                }`}
              >
                <input
                  type="radio"
                  name="feeling"
                  value={option}
                  checked={brief.feeling === option}
                  onChange={() => setBriefAnswer('feeling', option)}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">What matters most to you? (choose any)</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRIORITY_OPTIONS.map((option) => (
              <label
                key={option}
                className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition ${
                  brief.priorities.includes(option) ? 'border-accent bg-accent-soft' : 'border-line bg-panel'
                }`}
              >
                <input
                  type="checkbox"
                  checked={brief.priorities.includes(option)}
                  onChange={() => togglePriority(option)}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">How many levels?</legend>
          <div className="mt-2 flex gap-2">
            {LEVEL_OPTIONS.map((option) => (
              <label
                key={option}
                className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition ${
                  brief.levels === option ? 'border-accent bg-accent-soft' : 'border-line bg-panel'
                }`}
              >
                <input
                  type="radio"
                  name="levels"
                  value={option}
                  checked={brief.levels === option}
                  onChange={() => setBriefAnswer('levels', option)}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">Will this home serve one use, or more than one?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {USE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition ${
                  brief.uses === option.value ? 'border-accent bg-accent-soft' : 'border-line bg-panel'
                }`}
              >
                <input
                  type="radio"
                  name="uses"
                  value={option.value}
                  checked={brief.uses === option.value}
                  onChange={() => setBriefAnswer('uses', option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={brief.publicFrontage}
            onChange={(e) => setBriefAnswer('publicFrontage', e.target.checked)}
          />
          The front of the home should welcome visitors or clients
        </label>
      </div>
    </div>
  )
}
