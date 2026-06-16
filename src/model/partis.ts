import type { Parti } from './types'

// The family-courtyard parti: a 4-bay-wide, 3-band-deep skeleton.
// Columns (0-3) run across the frontage; bands (0-2) run front -> back.
// Column 1 is the spine (entry / hall / stair, every level).
// Column 2 holds the courtyard candidates (band 1, and band 2 for a deeper court).
//
//            col0          col1 (spine)   col2            col3
// band0      forecourt     entry          living          dining
// band1      kitchen       hall           courtyard       family / outdoor
// band2      utility       hall/stair     courtyard ext.  rear terrace
//
// Upper level mirrors the columns; band2/col0 and (if not courtyard) band2/col2
// are left unbuilt, reading as roof/terrace below the upper outline.
export const familyCourtyardParti: Parti = {
  id: 'family-courtyard',
  bayCount: 4,
  bandCount: 3,
  bandRatios: [0.32, 0.36, 0.32],
  spineCol: 1,
  groundFloorToFloorM: 3.2,
  groundBaseElevationM: 0,
  fixed: [
    { addr: { col: 1, band: 0 }, fill: { kind: 'circulation', label: 'Entry' } },
    { addr: { col: 1, band: 1 }, fill: { kind: 'circulation', label: 'Hall' } },
    { addr: { col: 1, band: 2 }, fill: { kind: 'circulation', label: 'Hall' } },
    { addr: { col: 0, band: 2 }, fill: { kind: 'service', label: 'Utility' } },
  ],
  openCandidates: [
    { col: 2, band: 1 },
    { col: 2, band: 2 },
  ],
  slots: [
    {
      category: 'indoor-living',
      targets: [
        { col: 2, band: 0 },
        { col: 3, band: 0 },
        { col: 0, band: 1 },
        { col: 3, band: 1 },
      ],
    },
    { category: 'forecourt', targets: [{ col: 0, band: 0 }] },
    {
      category: 'rear-terrace',
      targets: [
        { col: 3, band: 2 },
        { col: 2, band: 2 },
      ],
    },
    { category: 'spine-stair', targets: [{ col: 1, band: 1 }, { col: 1, band: 2 }] },
    { category: 'outdoor-rooms', targets: [{ col: 3, band: 1 }] },
  ],
  levels: [
    {
      id: 'upper',
      floorToFloorM: 3.0,
      baseElevationM: 3.2,
      fixed: [
        { addr: { col: 1, band: 0 }, fill: { kind: 'circulation', label: 'Landing' } },
        { addr: { col: 1, band: 1 }, fill: { kind: 'circulation', label: 'Hall' } },
        { addr: { col: 1, band: 2 }, fill: { kind: 'circulation', label: 'Hall' } },
      ],
      slots: [
        {
          category: 'sleeping',
          targets: [
            { col: 0, band: 0 },
            { col: 2, band: 0 },
            { col: 3, band: 0 },
            { col: 0, band: 1 },
          ],
        },
        {
          category: 'upper-terrace',
          targets: [
            { col: 3, band: 1 },
            { col: 3, band: 2 },
          ],
        },
        { category: 'spine-stair', targets: [{ col: 1, band: 1 }, { col: 1, band: 2 }] },
      ],
      unbuilt: [
        { col: 0, band: 2 },
        { col: 2, band: 2 },
      ],
    },
  ],
}

// Gate 0 stub: identical geometry to family-courtyard, registered solely to
// verify that the registry-driven test suite and zero-card guard scale to
// more than one parti. Replaced by the dual-key parti in the next commit.
export const gateZeroStubParti: Parti = {
  ...familyCourtyardParti,
  id: 'gate0-stub',
}

export const PARTIS: Record<string, Parti> = {
  'family-courtyard': familyCourtyardParti,
  'gate0-stub': gateZeroStubParti,
}
