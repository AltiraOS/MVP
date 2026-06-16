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

// The dual-key parti: two self-contained dwellings under one roof.
// Ground floor = Unit 1 (main dwelling: living, dining, kitchen).
// Upper floor  = Unit 2 (secondary dwelling: its own living, kitchen, bedrooms).
// Col 1 (spine) carries shared circulation from street to Unit 2's private entry
// at the top of the stair.
//
//            col0           col1 (spine)    col2             col3
// band0      forecourt      shared entry    unit1 living     unit1 dining
// band1      unit1 kitchen  shared hall     extra room       unit1 family
// band2      utility        hall/stair      rear garden      rear terrace
//
// Upper (Unit 2):
// band0      unit2 bedroom  unit2 entry     unit2 living     unit2 kitchen
// band1      unit2 bed 2    unit2 hall      [unbuilt]        terrace
// band2      [unbuilt]      hall            [unbuilt]        terrace
export const dualKeyParti: Parti = {
  id: 'dual-key',
  bayCount: 4,
  bandCount: 3,
  bandRatios: [0.33, 0.34, 0.33],
  spineCol: 1,
  groundFloorToFloorM: 3.2,
  groundBaseElevationM: 0,
  fixed: [
    { addr: { col: 1, band: 0 }, fill: { kind: 'circulation', label: 'Shared Entry' } },
    { addr: { col: 1, band: 1 }, fill: { kind: 'circulation', label: 'Shared Hall' } },
    { addr: { col: 1, band: 2 }, fill: { kind: 'circulation', label: 'Hall' } },
    { addr: { col: 0, band: 2 }, fill: { kind: 'service', label: 'Utility' } },
  ],
  openCandidates: [],
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
        { addr: { col: 1, band: 0 }, fill: { kind: 'circulation', label: 'Unit 2 Entry' } },
        { addr: { col: 1, band: 1 }, fill: { kind: 'circulation', label: 'Unit 2 Hall' } },
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

// The intergenerational parti: a main family dwelling alongside a private,
// accessible suite for a parent or grandparent on the ground floor.
// The secondary suite occupies (0,1) ground — the slot that holds "Kitchen"
// in family-courtyard — with the kitchen moved to (3,0). The upper floor is
// entirely main family bedrooms. No courtyard (open garden front and rear).
//
//            col0               col1 (spine)    col2           col3
// band0      forecourt          shared entry    living         dining / kitchen
// band1      secondary bedroom  hall            [courtyard     family / dining
//                                               candidate]
// band2      utility            hall/stair      rear garden    rear terrace
//
// Upper (main family only):
// band0      main bedroom       landing         bedroom 2      bathroom
// band1      bedroom 3          hall            [unbuilt]      terrace
// band2      [unbuilt]          hall            [unbuilt]      terrace
export const intergenerationalParti: Parti = {
  id: 'intergenerational',
  bayCount: 4,
  bandCount: 3,
  bandRatios: [0.30, 0.42, 0.28],
  spineCol: 1,
  groundFloorToFloorM: 3.2,
  groundBaseElevationM: 0,
  fixed: [
    { addr: { col: 1, band: 0 }, fill: { kind: 'circulation', label: 'Shared Entry' } },
    { addr: { col: 1, band: 1 }, fill: { kind: 'circulation', label: 'Hall' } },
    { addr: { col: 1, band: 2 }, fill: { kind: 'circulation', label: 'Hall' } },
    { addr: { col: 0, band: 2 }, fill: { kind: 'service', label: 'Utility' } },
  ],
  openCandidates: [],
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

export const PARTIS: Record<string, Parti> = {
  'family-courtyard': familyCourtyardParti,
  'dual-key': dualKeyParti,
  'intergenerational': intergenerationalParti,
}
