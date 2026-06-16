import { useState } from 'react'
import type { SiteCapture } from '../model/project'

export interface SiteCaptureFormProps {
  initial?: SiteCapture
  onSubmit: (site: SiteCapture) => void
}

const DEFAULT_SITE: SiteCapture = {
  frontageM: 12.5,
  depthM: 30,
  orientationDeg: 0,
  setbacks: { front: 4.5, rear: 3, side: 1.5 },
  cornerLot: false,
}

// Captures the customer's real site so the activated concept can be
// re-solved onto it (brief §3) before any dimensioned output is shown.
export function SiteCaptureForm({ initial, onSubmit }: SiteCaptureFormProps) {
  const [site, setSite] = useState<SiteCapture>(initial ?? DEFAULT_SITE)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(site)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-ink-soft">
        Tell us about your real site so we can re-solve this concept onto it. You can update these
        figures later if your survey turns up something different.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium">
          Frontage width (m)
          <input
            type="number"
            min={1}
            step={0.1}
            value={site.frontageM}
            onChange={(e) => setSite({ ...site, frontageM: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm font-medium">
          Depth (m)
          <input
            type="number"
            min={1}
            step={0.1}
            value={site.depthM}
            onChange={(e) => setSite({ ...site, depthM: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm font-medium">
          Orientation (degrees from north)
          <input
            type="number"
            step={1}
            value={site.orientationDeg}
            onChange={(e) => setSite({ ...site, orientationDeg: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={site.cornerLot}
            onChange={(e) => setSite({ ...site, cornerLot: e.target.checked })}
          />
          This is a corner block
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Setbacks (m)</legend>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <label className="block text-sm">
            Front
            <input
              type="number"
              min={0}
              step={0.1}
              value={site.setbacks.front}
              onChange={(e) =>
                setSite({ ...site, setbacks: { ...site.setbacks, front: Number(e.target.value) } })
              }
              className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            Rear
            <input
              type="number"
              min={0}
              step={0.1}
              value={site.setbacks.rear}
              onChange={(e) =>
                setSite({ ...site, setbacks: { ...site.setbacks, rear: Number(e.target.value) } })
              }
              className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            Side
            <input
              type="number"
              min={0}
              step={0.1}
              value={site.setbacks.side}
              onChange={(e) =>
                setSite({ ...site, setbacks: { ...site.setbacks, side: Number(e.target.value) } })
              }
              className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
            />
          </label>
        </div>
      </fieldset>

      <label className="block text-sm font-medium">
        Notes for your survey or site information (optional)
        <textarea
          value={site.notes ?? ''}
          onChange={(e) => setSite({ ...site, notes: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
        />
      </label>

      <button
        type="submit"
        className="inline-block rounded-full bg-accent px-6 py-3 font-medium text-white"
      >
        Re-solve onto my site
      </button>
    </form>
  )
}
