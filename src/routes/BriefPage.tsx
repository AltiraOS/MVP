import { useAppStore } from '../store/useAppStore'

export default function BriefPage() {
  const name = useAppStore((s) => s.briefAnswers.householdName ?? '')
  const setBriefAnswer = useAppStore((s) => s.setBriefAnswer)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Tell us about your home</h1>
      <p className="mt-2 text-ink-soft">
        A few plain questions help us put together a starting concept.
      </p>
      <label className="mt-8 block text-sm font-medium" htmlFor="householdName">
        What should we call this project?
      </label>
      <input
        id="householdName"
        type="text"
        value={String(name)}
        onChange={(e) => setBriefAnswer('householdName', e.target.value)}
        placeholder="e.g. The Hill Street House"
        className="mt-2 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
      />
    </div>
  )
}
