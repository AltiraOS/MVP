import type { Concept } from './types'

// The Activated Project Room: the same Concept the customer shaped, now
// re-solved onto their real site and developed further. baseline is frozen
// at activation — nothing here ever hand-edits a Concept; every entry is the
// output of a pure derivation or the one assembler (brief §4, §5).
export interface SiteCapture {
  frontageM: number
  depthM: number
  orientationDeg: number
  setbacks: { front: number; rear: number; side: number }
  cornerLot: boolean
  surveyRef?: string
  notes?: string
}

export interface ProjectRoom {
  baseline: Concept
  site?: SiteCapture
  resolved?: Concept
  revisions: Concept[]
}
