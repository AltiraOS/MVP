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
        { col: 2, band: 1 },
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
// band1      secondary bedroom  hall            dining         family / dining
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
        { col: 2, band: 1 },
        { col: 2, band: 2 },
      ],
    },
  ],
}

// The narrow-lot parti: a tighter 3-bay-wide skeleton for blocks under ~12 m.
// Depth compensates for the reduced frontage; the spine (col 1) and courtyard
// (col 2, band 1) still deliver cross-ventilation and borrowed light.
//
//            col0          col1 (spine)   col2
// band0      forecourt     entry          living / home office
// band1      kitchen       hall           courtyard (open candidate)
// band2      utility       hall/stair     rear terrace
//
// Upper: band2/col0 is unbuilt (reads as rear eave); col2 upper terrace.
export const narrowLotParti: Parti = {
  id: 'narrow-lot',
  bayCount: 3,
  bandCount: 3,
  bandRatios: [0.28, 0.44, 0.28],
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
        { col: 0, band: 1 },
        { col: 2, band: 1 },
      ],
    },
    { category: 'forecourt', targets: [{ col: 0, band: 0 }] },
    { category: 'rear-terrace', targets: [{ col: 2, band: 2 }] },
    { category: 'spine-stair', targets: [{ col: 1, band: 1 }, { col: 1, band: 2 }] },
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
            { col: 0, band: 1 },
          ],
        },
        {
          category: 'upper-terrace',
          targets: [
            { col: 2, band: 1 },
            { col: 2, band: 2 },
          ],
        },
        { category: 'spine-stair', targets: [{ col: 1, band: 1 }, { col: 1, band: 2 }] },
      ],
      unbuilt: [{ col: 0, band: 2 }],
    },
  ],
}

// The corner-residential parti: a 4-bay-wide, 3-band-deep skeleton for a
// block with two public frontages (front street + side street at col 3).
// The spine shifts to col 2, placing the stair behind the corner forecourt.
// No courtyard is needed — cross-light arrives from both street directions.
//
//            col0 (private)  col1          col2 (spine)    col3 (side-street)
// band0      living          living        corner entry    corner forecourt
// band1      kitchen         dining        hall            outdoor room
// band2      inner garden    inner garden  hall/stair      utility
//
// Upper: cols 0-1 band 2 are unbuilt (lower eave over inner garden).
// Upper-terrace reads toward the side street at (3,1)/(3,2).
export const cornerResidentialParti: Parti = {
  id: 'corner-residential',
  bayCount: 4,
  bandCount: 3,
  bandRatios: [0.30, 0.38, 0.32],
  spineCol: 2,
  groundFloorToFloorM: 3.2,
  groundBaseElevationM: 0,
  fixed: [
    { addr: { col: 2, band: 0 }, fill: { kind: 'circulation', label: 'Corner Entry' } },
    { addr: { col: 2, band: 1 }, fill: { kind: 'circulation', label: 'Hall' } },
    { addr: { col: 2, band: 2 }, fill: { kind: 'circulation', label: 'Hall' } },
    { addr: { col: 3, band: 2 }, fill: { kind: 'service', label: 'Utility' } },
  ],
  openCandidates: [],
  slots: [
    {
      category: 'indoor-living',
      targets: [
        { col: 0, band: 0 },
        { col: 1, band: 0 },
        { col: 0, band: 1 },
        { col: 1, band: 1 },
      ],
    },
    { category: 'forecourt', targets: [{ col: 3, band: 0 }] },
    {
      category: 'rear-terrace',
      targets: [
        { col: 0, band: 2 },
        { col: 1, band: 2 },
      ],
    },
    { category: 'spine-stair', targets: [{ col: 2, band: 1 }, { col: 2, band: 2 }] },
    { category: 'outdoor-rooms', targets: [{ col: 3, band: 1 }] },
  ],
  levels: [
    {
      id: 'upper',
      floorToFloorM: 3.0,
      baseElevationM: 3.2,
      fixed: [
        { addr: { col: 2, band: 0 }, fill: { kind: 'circulation', label: 'Landing' } },
        { addr: { col: 2, band: 1 }, fill: { kind: 'circulation', label: 'Hall' } },
        { addr: { col: 2, band: 2 }, fill: { kind: 'circulation', label: 'Hall' } },
      ],
      slots: [
        {
          category: 'sleeping',
          targets: [
            { col: 0, band: 0 },
            { col: 1, band: 0 },
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
        { category: 'spine-stair', targets: [{ col: 2, band: 1 }, { col: 2, band: 2 }] },
      ],
      unbuilt: [
        { col: 0, band: 2 },
        { col: 1, band: 1 },
        { col: 1, band: 2 },
      ],
    },
  ],
}

// The live-work parti: a four-bay-wide, three-level skeleton that combines a
// commercial-height ground floor (studio / shop) with a full private home above.
// Spine at col 1 — same column as family-courtyard — so existing stair cards
// apply without modification. No courtyard: the taller ground floor provides
// internal volume and borrowed light from front and rear.
//
//            col0 (work)    col1 (spine)   col2 (work)    col3 (work)
// band0      studio/shop    entry          work area      display/reception
// band1      back studio    hall           work prep      covered deck
// band2      utility        hall/stair     rear terrace   rear terrace
//
// Upper (living floor): col 0+2+3 band 0 + col 0 band 1 → kitchen / living / dining.
// Level2plus (sleeping): same footprint → bedrooms.
// col 2 band 1, col 0+2 band 2 are unbuilt on both upper levels.
export const liveWorkParti: Parti = {
  id: 'live-work',
  bayCount: 4,
  bandCount: 3,
  bandRatios: [0.30, 0.38, 0.32],
  spineCol: 1,
  groundFloorToFloorM: 3.6,
  groundBaseElevationM: 0,
  fixed: [
    { addr: { col: 1, band: 0 }, fill: { kind: 'circulation', label: 'Entry' } },
    { addr: { col: 1, band: 1 }, fill: { kind: 'circulation', label: 'Hall' } },
    { addr: { col: 1, band: 2 }, fill: { kind: 'circulation', label: 'Hall' } },
    { addr: { col: 0, band: 2 }, fill: { kind: 'service', label: 'Utility' } },
  ],
  openCandidates: [],
  slots: [
    {
      category: 'indoor-living',
      targets: [
        { col: 0, band: 0 },
        { col: 2, band: 0 },
        { col: 3, band: 0 },
        { col: 0, band: 1 },
        { col: 2, band: 1 },
      ],
    },
    { category: 'outdoor-rooms', targets: [{ col: 3, band: 1 }] },
    {
      category: 'rear-terrace',
      targets: [
        { col: 2, band: 2 },
        { col: 3, band: 2 },
      ],
    },
    { category: 'spine-stair', targets: [{ col: 1, band: 1 }, { col: 1, band: 2 }] },
  ],
  levels: [
    // Living floor — kitchen, living, dining
    {
      id: 'upper',
      floorToFloorM: 3.0,
      baseElevationM: 3.6,
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
        { col: 2, band: 1 },
        { col: 0, band: 2 },
        { col: 2, band: 2 },
      ],
    },
    // Sleeping floor — bedrooms
    {
      id: 'level2plus',
      floorToFloorM: 2.8,
      baseElevationM: 6.6,
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
        { col: 2, band: 1 },
        { col: 0, band: 2 },
        { col: 2, band: 2 },
      ],
    },
  ],
}

// The mixed-use-lowrise parti: a four-bay-wide, three-level shop-top building.
// A commercial ground floor (4.2 m, room for a proper shopfit) is accessed from
// the street; a shared stair behind the spine delivers two self-contained
// residential flats on floors 2 and 3.
//
//            col0 (retail)   col1 (spine)   col2 (retail)   col3 (retail)
// band0      retail front    lobby          retail front    display/reception
// band1      prep / back     hall           storage         outdoor seating
// band2      services        hall/stair     rear service    rear terrace
//
// Upper (Flat 1, floor 2) and Level2plus (Flat 2, floor 3) share the same
// footprint: living / kitchen / bedroom(s) fill cols 0, 2, 3.
export const mixedUseLowriseParti: Parti = {
  id: 'mixed-use-lowrise',
  bayCount: 4,
  bandCount: 3,
  bandRatios: [0.30, 0.38, 0.32],
  spineCol: 1,
  groundFloorToFloorM: 4.2,
  groundBaseElevationM: 0,
  fixed: [
    { addr: { col: 1, band: 0 }, fill: { kind: 'circulation', label: 'Lobby' } },
    { addr: { col: 1, band: 1 }, fill: { kind: 'circulation', label: 'Hall' } },
    { addr: { col: 1, band: 2 }, fill: { kind: 'circulation', label: 'Hall' } },
    { addr: { col: 0, band: 2 }, fill: { kind: 'service', label: 'Services' } },
  ],
  openCandidates: [],
  slots: [
    {
      category: 'indoor-living',
      targets: [
        { col: 0, band: 0 },
        { col: 2, band: 0 },
        { col: 3, band: 0 },
        { col: 0, band: 1 },
        { col: 2, band: 1 },
      ],
    },
    { category: 'outdoor-rooms', targets: [{ col: 3, band: 1 }] },
    {
      category: 'rear-terrace',
      targets: [
        { col: 2, band: 2 },
        { col: 3, band: 2 },
      ],
    },
    { category: 'spine-stair', targets: [{ col: 1, band: 1 }, { col: 1, band: 2 }] },
  ],
  levels: [
    // Flat 1 — floor 2
    {
      id: 'upper',
      floorToFloorM: 3.0,
      baseElevationM: 4.2,
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
        { col: 2, band: 1 },
        { col: 0, band: 2 },
        { col: 2, band: 2 },
      ],
    },
    // Flat 2 — floor 3
    {
      id: 'level2plus',
      floorToFloorM: 2.8,
      baseElevationM: 7.2,
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
        { col: 2, band: 1 },
        { col: 0, band: 2 },
        { col: 2, band: 2 },
      ],
    },
  ],
}

// The stacked-roles parti: a four-bay-wide, three-storey skeleton for two
// genuinely separate households on distinct floors. The entire ground floor
// is a self-contained accessible home (e.g. older parents) — NOT a suite
// carved off a shared plan. The two upper levels form a complete family
// home: a day zone on the middle floor, sleeping zone at the top.
//
// Distinct from:
//   intergenerational — one bay carved off a shared ground floor
//   live-work         — one owner's studio + their own home
//   mixed-use-lowrise — commercial tenancy + separate flats; not family
//   dual-key          — two-level split; neither party gets a complete floor
//
//            col0               col1 (spine)   col2              col3
// ground:
// band0      garden entry       shared entry   bedroom (parents) ensuite (parents)
// band1      living (parents)   hall           kitchen (parents) dining (parents)
// band2      utility            hall/stair     rear garden       rear terrace
//
// upper (family day zone):
// band0      kitchen (family)   landing        living (family)   dining (family)
// band1      family room        hall           [unbuilt]         terrace
// band2      [unbuilt]          hall           [unbuilt]         terrace
//
// level2plus (family sleep zone):
// band0      main bedroom       landing        bedroom 2         bathroom
// band1      bedroom 3          hall           [unbuilt]         roof terrace
// band2      [unbuilt]          hall           [unbuilt]         roof terrace
export const stackedRolesParti: Parti = {
  id: 'stacked-roles',
  bayCount: 4,
  bandCount: 3,
  bandRatios: [0.30, 0.40, 0.30],
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
        { col: 2, band: 1 },
        { col: 3, band: 1 },
      ],
    },
    { category: 'forecourt', targets: [{ col: 0, band: 0 }] },
    {
      category: 'rear-terrace',
      targets: [
        { col: 2, band: 2 },
        { col: 3, band: 2 },
      ],
    },
    { category: 'spine-stair', targets: [{ col: 1, band: 1 }, { col: 1, band: 2 }] },
    // No outdoor-rooms slot: (3,1) is the parents' dining room filled by
    // indoor-living. A no-op outdoor-rooms card prevents generic cards from
    // overwriting that cell at assembler step 7.
  ],
  levels: [
    // Family day zone — kitchen, living, dining, family room
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
        { col: 2, band: 1 },
        { col: 0, band: 2 },
        { col: 2, band: 2 },
      ],
    },
    // Family sleep zone — bedrooms, bathroom, roof terrace
    {
      id: 'level2plus',
      floorToFloorM: 2.8,
      baseElevationM: 6.2,
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
        { col: 2, band: 1 },
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
  'narrow-lot': narrowLotParti,
  'corner-residential': cornerResidentialParti,
  'live-work': liveWorkParti,
  'mixed-use-lowrise': mixedUseLowriseParti,
  'stacked-roles': stackedRolesParti,
}
