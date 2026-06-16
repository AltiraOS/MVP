import type { CardCategory, CardDef } from './types'

// Minimum card catalog for the family-courtyard path. Each category has at
// least two options so the Shape step has real swaps to offer; the rest of
// the catalog (other partis/archetypes) is added once gate 6 passes.
export const CARDS: CardDef[] = [
  // --- archetype (bones) ---
  {
    id: 'archetype-family-courtyard',
    category: 'archetype',
    title: 'Family courtyard home',
    blurb:
      'A two-storey home wrapped around a private courtyard that brings light into the middle of the plan.',
    tiers: ['core', 'pro'],
    params: { partiId: 'family-courtyard', levels: 2 },
  },
  {
    id: 'archetype-dual-key',
    category: 'archetype',
    title: 'Dual-key home',
    blurb:
      'A home designed as two complete, self-contained dwellings under one roof — each with its own entry, living areas and sleeping spaces.',
    tiers: ['core', 'pro'],
    params: { partiId: 'dual-key', levels: 2 },
  },
  {
    id: 'archetype-intergenerational',
    category: 'archetype',
    title: 'Intergenerational home',
    blurb:
      'A home designed to bring two generations under one roof — a main family dwelling alongside a private, accessible suite for a parent or grandparent on the ground floor.',
    tiers: ['core', 'pro'],
    params: { partiId: 'intergenerational', levels: 2 },
  },
  {
    id: 'archetype-narrow-lot',
    category: 'archetype',
    title: 'Narrow-lot home',
    blurb:
      'A two-storey home designed for a tighter block, with rooms stacked front to back and a private courtyard bringing light into the centre of the plan.',
    tiers: ['core', 'pro'],
    params: { partiId: 'narrow-lot', levels: 2 },
  },
  {
    id: 'archetype-corner-residential',
    category: 'archetype',
    title: 'Corner home',
    blurb:
      'A home designed to make the most of two street frontages — with the entry placed at the corner and living spaces that open toward both the front and side streets.',
    tiers: ['core', 'pro'],
    params: { partiId: 'corner-residential', levels: 2 },
  },
  {
    id: 'archetype-live-work',
    category: 'archetype',
    title: 'Live-work home',
    blurb:
      'A three-storey home where the ground floor is a working studio or shop, and the two floors above are a complete private home.',
    tiers: ['pro'],
    params: { partiId: 'live-work', levels: 3 },
  },

  // --- site (bones) ---
  {
    id: 'site-standard',
    category: 'site',
    title: 'Standard block',
    blurb: 'A typical street-facing block with room to breathe on both sides.',
    tiers: ['core', 'pro'],
    params: {
      frontageM: 15,
      depthM: 28,
      northDeg: 0,
      setbackFront: 6,
      setbackRear: 6,
      setbackSide: 1.5,
      cornerLot: false,
    },
  },
  {
    id: 'site-narrow',
    category: 'site',
    title: 'Narrow lot',
    blurb: 'A tighter block that asks for a more careful plan.',
    tiers: ['core', 'pro'],
    params: {
      frontageM: 10,
      depthM: 32,
      northDeg: 20,
      setbackFront: 4.5,
      setbackRear: 3,
      setbackSide: 0.9,
      cornerLot: false,
    },
  },
  {
    id: 'site-corner',
    category: 'site',
    title: 'Corner block',
    blurb: 'A block with two street frontages — giving the home more light, outlook and options for entry.',
    tiers: ['core', 'pro'],
    params: {
      frontageM: 15,
      depthM: 28,
      northDeg: 0,
      setbackFront: 6,
      setbackRear: 6,
      setbackSide: 1.5,
      cornerLot: true,
    },
  },

  // --- courtyard (bones) ---
  // Parti-specific "no courtyard" cards are listed first so each non-courtyard
  // archetype picks them as its default before reaching the family-courtyard
  // options below. Family-courtyard falls through to courtyard-centre.
  {
    id: 'courtyard-none-ig',
    category: 'courtyard',
    title: 'Garden between the homes',
    blurb:
      'A garden connects both parts of the home to the outdoors, with private outdoor space front and rear.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-intergenerational',
  },
  {
    id: 'courtyard-none-dk',
    category: 'courtyard',
    title: 'No shared courtyard',
    blurb: 'Each home has its own outdoor space front and rear, keeping both households private.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-dual-key',
  },
  {
    id: 'courtyard-none-cr',
    category: 'courtyard',
    title: 'Light from both streets',
    blurb: 'Cross-light arrives from two street frontages, so the plan stays open rather than turning inward.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-corner-residential',
  },
  {
    id: 'courtyard-none-lw',
    category: 'courtyard',
    title: 'Open plan, no courtyard',
    blurb: 'The tall working ground floor brings volume from within, so the plan stays open without a courtyard.',
    tiers: ['pro'],
    params: {},
    cellOps: [],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-live-work',
  },
  {
    id: 'courtyard-centre',
    category: 'courtyard',
    title: 'Courtyard, centred',
    blurb: 'This option brings light into the middle of the home.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      {
        addr: { col: 2, band: 1 },
        fill: { kind: 'open', label: 'Courtyard' },
        void: true,
        levels: ['ground', 'upper'],
      },
    ],
    // DECISION: courtyard cards are available for family-courtyard and
    // narrow-lot; DK, IG, CR and LW provide their own no-courtyard defaults.
    availableWhen: (ctx) =>
      ctx.selections.archetype !== 'archetype-dual-key' &&
      ctx.selections.archetype !== 'archetype-intergenerational' &&
      ctx.selections.archetype !== 'archetype-corner-residential' &&
      ctx.selections.archetype !== 'archetype-live-work',
  },
  {
    id: 'courtyard-none-nl',
    category: 'courtyard',
    title: 'Open garden, no courtyard',
    blurb: 'The plan opens to a garden at the rear instead of a central courtyard.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-narrow-lot',
  },
  {
    id: 'courtyard-deep',
    category: 'courtyard',
    title: 'Courtyard, full depth',
    blurb:
      'A deeper courtyard stretches toward the back garden, opening more rooms to the outdoors.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      {
        addr: { col: 2, band: 1 },
        fill: { kind: 'open', label: 'Courtyard' },
        void: true,
        levels: ['ground', 'upper'],
      },
      {
        addr: { col: 2, band: 2 },
        fill: { kind: 'open', label: 'Courtyard' },
        void: true,
        levels: ['ground', 'upper'],
      },
    ],
    availableWhen: (ctx) =>
      ctx.selections.archetype !== 'archetype-dual-key' &&
      ctx.selections.archetype !== 'archetype-intergenerational' &&
      ctx.selections.archetype !== 'archetype-corner-residential' &&
      ctx.selections.archetype !== 'archetype-live-work',
  },

  // --- indoor-living (fill) ---
  // Intergenerational specific: listed first so IG picks them before the
  // family-courtyard cards. (0,1) becomes the secondary bedroom rather than
  // the kitchen; kitchen moves to (3,0).
  {
    id: 'living-ig-standard',
    category: 'indoor-living',
    title: 'Open living with a secondary bedroom',
    blurb:
      'Living, kitchen and dining wrap around the garden, with a private ground-floor bedroom for a family member who lives alongside.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 2, band: 0 }, fill: { kind: 'living', label: 'Living' } },
      { addr: { col: 3, band: 0 }, fill: { kind: 'kitchen', label: 'Kitchen' } },
      { addr: { col: 0, band: 1 }, fill: { kind: 'bedroom', label: 'Secondary Bedroom' } },
      { addr: { col: 3, band: 1 }, fill: { kind: 'dining', label: 'Dining' } },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-intergenerational',
  },
  {
    id: 'living-ig-study',
    category: 'indoor-living',
    title: 'Open living with a study or retreat',
    blurb:
      'A quiet ground-floor room near the entry becomes a calm study or retreat — useful for a grandparent or family member who needs their own space.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 2, band: 0 }, fill: { kind: 'living', label: 'Living' } },
      { addr: { col: 3, band: 0 }, fill: { kind: 'kitchen', label: 'Kitchen' } },
      { addr: { col: 0, band: 1 }, fill: { kind: 'work', label: 'Study' } },
      { addr: { col: 3, band: 1 }, fill: { kind: 'dining', label: 'Dining' } },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-intergenerational',
  },
  // Corner-residential specific: spine at col 2 means living fills cols 0-1.
  {
    id: 'living-cr-open',
    category: 'indoor-living',
    title: 'Open living facing two streets',
    blurb:
      'Living and dining rooms face the front and side streets, with the kitchen tucked behind — catching light from both directions.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 0 }, fill: { kind: 'living', label: 'Living' } },
      { addr: { col: 1, band: 0 }, fill: { kind: 'dining', label: 'Dining' } },
      { addr: { col: 0, band: 1 }, fill: { kind: 'kitchen', label: 'Kitchen' } },
      { addr: { col: 1, band: 1 }, fill: { kind: 'living', label: 'Family Room' } },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-corner-residential',
  },
  {
    id: 'living-cr-work',
    category: 'indoor-living',
    title: 'Living with a home office',
    blurb:
      'A home office sits at the corner beside the entry, with the open living area and kitchen facing inward.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 0 }, fill: { kind: 'living', label: 'Living' } },
      { addr: { col: 1, band: 0 }, fill: { kind: 'work', label: 'Home Office' } },
      { addr: { col: 0, band: 1 }, fill: { kind: 'kitchen', label: 'Kitchen' } },
      { addr: { col: 1, band: 1 }, fill: { kind: 'dining', label: 'Dining' } },
    ],
    tradeoff: 'The home office takes a front room, keeping work near the entry and street.',
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-corner-residential',
  },

  // Narrow-lot specific: listed before the 4-bay cards so NL picks these as
  // defaults. NL has only 3 bays — col 3 would be out of bounds.
  {
    id: 'living-nl-open',
    category: 'indoor-living',
    title: 'Living and kitchen around the courtyard',
    blurb:
      'Living faces the street while the kitchen wraps around the courtyard, keeping both rooms filled with natural light.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 2, band: 0 }, fill: { kind: 'living', label: 'Living' } },
      { addr: { col: 0, band: 1 }, fill: { kind: 'kitchen', label: 'Kitchen' } },
      { addr: { col: 2, band: 1 }, fill: { kind: 'dining', label: 'Dining' } },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-narrow-lot',
  },
  {
    id: 'living-nl-work',
    category: 'indoor-living',
    title: 'Living with a home office',
    blurb:
      'A home office takes the front room beside the entry, with the kitchen and living area toward the courtyard.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 2, band: 0 }, fill: { kind: 'work', label: 'Home Office' } },
      { addr: { col: 0, band: 1 }, fill: { kind: 'kitchen', label: 'Kitchen' } },
      { addr: { col: 2, band: 1 }, fill: { kind: 'living', label: 'Living' } },
    ],
    tradeoff: 'The home office takes the front room, keeping work close to the entry.',
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-narrow-lot',
  },
  // Live-work specific: the ground floor is a working studio or shop.
  // All five non-spine ground cells become the work zone.
  {
    id: 'work-lw-studio',
    category: 'indoor-living',
    title: 'Open studio at street level',
    blurb:
      'An open studio faces the street with a display area up front and a working area behind — light from front and rear.',
    tiers: ['pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 0 }, fill: { kind: 'work', label: 'Studio' } },
      { addr: { col: 2, band: 0 }, fill: { kind: 'work', label: 'Work Area' } },
      { addr: { col: 3, band: 0 }, fill: { kind: 'work', label: 'Display' } },
      { addr: { col: 0, band: 1 }, fill: { kind: 'work', label: 'Back Studio' } },
      { addr: { col: 2, band: 1 }, fill: { kind: 'work', label: 'Prep' } },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-live-work',
  },
  {
    id: 'work-lw-retail',
    category: 'indoor-living',
    title: 'Retail shopfront with a workshop behind',
    blurb:
      'A shopfront faces the street with a display window, opening onto a retail floor and a workshop at the back.',
    tiers: ['pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 0 }, fill: { kind: 'retail', label: 'Shop' } },
      { addr: { col: 2, band: 0 }, fill: { kind: 'retail', label: 'Retail Floor' } },
      { addr: { col: 3, band: 0 }, fill: { kind: 'retail', label: 'Display' } },
      { addr: { col: 0, band: 1 }, fill: { kind: 'work', label: 'Workshop' } },
      { addr: { col: 2, band: 1 }, fill: { kind: 'work', label: 'Storeroom' } },
    ],
    tradeoff: 'A retail front gives the building a public address and a separate storage room behind.',
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-live-work',
  },
  {
    id: 'living-open',
    category: 'indoor-living',
    title: 'Open living, dining and kitchen',
    blurb:
      'Living, dining and the kitchen flow together as one bright space around the courtyard.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 2, band: 0 }, fill: { kind: 'living', label: 'Living' } },
      { addr: { col: 3, band: 0 }, fill: { kind: 'dining', label: 'Dining' } },
      { addr: { col: 0, band: 1 }, fill: { kind: 'kitchen', label: 'Kitchen' } },
      { addr: { col: 3, band: 1 }, fill: { kind: 'living', label: 'Family Room' } },
    ],
    availableWhen: (ctx) =>
      ctx.selections.archetype !== 'archetype-narrow-lot' &&
      ctx.selections.archetype !== 'archetype-corner-residential' &&
      ctx.selections.archetype !== 'archetype-live-work',
  },
  {
    id: 'living-work',
    category: 'indoor-living',
    title: 'Living with a home office',
    blurb:
      'A quiet home office sits near the entry, with living, dining and the kitchen toward the courtyard.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 2, band: 0 }, fill: { kind: 'living', label: 'Living' } },
      { addr: { col: 3, band: 0 }, fill: { kind: 'work', label: 'Home Office' } },
      { addr: { col: 0, band: 1 }, fill: { kind: 'kitchen', label: 'Kitchen' } },
      { addr: { col: 3, band: 1 }, fill: { kind: 'dining', label: 'Dining' } },
    ],
    tradeoff:
      'Adding a home office here moves dining next to the kitchen, closer to the courtyard.',
    availableWhen: (ctx) =>
      ctx.selections.archetype !== 'archetype-narrow-lot' &&
      ctx.selections.archetype !== 'archetype-corner-residential' &&
      ctx.selections.archetype !== 'archetype-live-work',
  },

  // --- sleeping (fill, upper level) ---
  // Dual-key specific: listed first so they are picked as the default for
  // dual-key (Unit 2 needs its own living + kitchen on the upper floor, not
  // family bedrooms). Family-courtyard falls through to sleeping-family below.
  {
    id: 'sleeping-upper-unit-two-bed',
    category: 'sleeping',
    title: 'Upper home: living area and two bedrooms',
    blurb:
      'The upper home has its own open living area, kitchen and two bedrooms — a complete, self-contained place to live.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 0 }, fill: { kind: 'master', label: 'Upper Bedroom' }, levels: ['upper'] },
      { addr: { col: 2, band: 0 }, fill: { kind: 'living', label: 'Upper Living' }, levels: ['upper'] },
      { addr: { col: 3, band: 0 }, fill: { kind: 'kitchen', label: 'Upper Kitchen' }, levels: ['upper'] },
      { addr: { col: 0, band: 1 }, fill: { kind: 'bedroom', label: 'Upper Bedroom 2' }, levels: ['upper'] },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-dual-key',
  },
  {
    id: 'sleeping-upper-unit-one-bed',
    category: 'sleeping',
    title: 'Upper home: living area and one bedroom',
    blurb: 'The upper home has an open living area with kitchen and one private bedroom — ideal for one or two people.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 0 }, fill: { kind: 'master', label: 'Upper Bedroom' }, levels: ['upper'] },
      { addr: { col: 2, band: 0 }, fill: { kind: 'living', label: 'Upper Living' }, levels: ['upper'] },
      { addr: { col: 3, band: 0 }, fill: { kind: 'kitchen', label: 'Upper Kitchen' }, levels: ['upper'] },
      { addr: { col: 0, band: 1 }, fill: { kind: 'bath', label: 'Upper Bathroom' }, levels: ['upper'] },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-dual-key',
  },
  // Narrow-lot specific sleeping: only 3 upper targets (no col 3).
  {
    id: 'sleeping-nl-three-bed',
    category: 'sleeping',
    title: 'Three bedrooms upstairs',
    blurb:
      'A main bedroom at the front and two further bedrooms make the most of the upper floor.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 0 }, fill: { kind: 'master', label: 'Main Bedroom' }, levels: ['upper'] },
      { addr: { col: 2, band: 0 }, fill: { kind: 'bedroom', label: 'Bedroom 2' }, levels: ['upper'] },
      { addr: { col: 0, band: 1 }, fill: { kind: 'bedroom', label: 'Bedroom 3' }, levels: ['upper'] },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-narrow-lot',
  },
  {
    id: 'sleeping-nl-two-bed',
    category: 'sleeping',
    title: 'Two bedrooms and a bathroom upstairs',
    blurb:
      'A main bedroom and a second bedroom share the upper floor with a dedicated bathroom.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 0 }, fill: { kind: 'master', label: 'Main Bedroom' }, levels: ['upper'] },
      { addr: { col: 2, band: 0 }, fill: { kind: 'bedroom', label: 'Bedroom 2' }, levels: ['upper'] },
      { addr: { col: 0, band: 1 }, fill: { kind: 'bath', label: 'Bathroom' }, levels: ['upper'] },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-narrow-lot',
  },
  // Live-work specific: the sleeping card fills BOTH upper levels.
  // Ops with levels:['upper'] fill the living floor (kitchen / living / dining).
  // Ops with levels:['level2plus'] fill the sleeping floor (bedrooms).
  {
    id: 'sleeping-lw-three-bed',
    category: 'sleeping',
    title: 'Living above the studio, sleeping at the top',
    blurb:
      'An open kitchen, living area and dining room fill the middle floor. Three bedrooms and a bathroom sit at the top.',
    tiers: ['pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 0 }, fill: { kind: 'kitchen', label: 'Kitchen' }, levels: ['upper'] },
      { addr: { col: 2, band: 0 }, fill: { kind: 'living', label: 'Living' }, levels: ['upper'] },
      { addr: { col: 3, band: 0 }, fill: { kind: 'dining', label: 'Dining' }, levels: ['upper'] },
      { addr: { col: 0, band: 1 }, fill: { kind: 'living', label: 'Family Room' }, levels: ['upper'] },
      { addr: { col: 0, band: 0 }, fill: { kind: 'master', label: 'Main Bedroom' }, levels: ['level2plus'] },
      { addr: { col: 2, band: 0 }, fill: { kind: 'bedroom', label: 'Bedroom 2' }, levels: ['level2plus'] },
      { addr: { col: 3, band: 0 }, fill: { kind: 'bath', label: 'Bathroom' }, levels: ['level2plus'] },
      { addr: { col: 0, band: 1 }, fill: { kind: 'bedroom', label: 'Bedroom 3' }, levels: ['level2plus'] },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-live-work',
  },
  {
    id: 'sleeping-lw-two-bed',
    category: 'sleeping',
    title: 'Living above the studio, two bedrooms at the top',
    blurb:
      'An open living area and dining room sit in the middle floor. Two bedrooms and a bathroom are at the top.',
    tiers: ['pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 0 }, fill: { kind: 'kitchen', label: 'Kitchen' }, levels: ['upper'] },
      { addr: { col: 2, band: 0 }, fill: { kind: 'living', label: 'Living' }, levels: ['upper'] },
      { addr: { col: 3, band: 0 }, fill: { kind: 'dining', label: 'Dining' }, levels: ['upper'] },
      { addr: { col: 0, band: 1 }, fill: { kind: 'living', label: 'Family Room' }, levels: ['upper'] },
      { addr: { col: 0, band: 0 }, fill: { kind: 'master', label: 'Main Bedroom' }, levels: ['level2plus'] },
      { addr: { col: 2, band: 0 }, fill: { kind: 'bath', label: 'Bathroom' }, levels: ['level2plus'] },
      { addr: { col: 3, band: 0 }, fill: { kind: 'bedroom', label: 'Bedroom 2' }, levels: ['level2plus'] },
      { addr: { col: 0, band: 1 }, fill: { kind: 'bedroom', label: 'Bedroom 3' }, levels: ['level2plus'] },
    ],
    tradeoff: 'Two bedrooms instead of three gives each room more space and a quieter corridor.',
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-live-work',
  },
  {
    id: 'sleeping-family',
    category: 'sleeping',
    title: 'Family bedrooms',
    blurb:
      'A private main bedroom sits apart from two further bedrooms and a shared bathroom.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 0 }, fill: { kind: 'master', label: 'Main Bedroom' }, levels: ['upper'] },
      { addr: { col: 2, band: 0 }, fill: { kind: 'bedroom', label: 'Bedroom 2' }, levels: ['upper'] },
      { addr: { col: 3, band: 0 }, fill: { kind: 'bath', label: 'Bathroom' }, levels: ['upper'] },
      { addr: { col: 0, band: 1 }, fill: { kind: 'bedroom', label: 'Bedroom 3' }, levels: ['upper'] },
    ],
    availableWhen: (ctx) =>
      ctx.selections.archetype !== 'archetype-narrow-lot' &&
      ctx.selections.archetype !== 'archetype-corner-residential' &&
      ctx.selections.archetype !== 'archetype-live-work',
  },
  {
    id: 'sleeping-guest',
    category: 'sleeping',
    title: 'Main bedroom with guest room',
    blurb:
      'The main bedroom and a separate guest room each get their own space, with a bathroom between.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 0 }, fill: { kind: 'master', label: 'Main Bedroom' }, levels: ['upper'] },
      { addr: { col: 2, band: 0 }, fill: { kind: 'bath', label: 'Bathroom' }, levels: ['upper'] },
      { addr: { col: 3, band: 0 }, fill: { kind: 'bedroom', label: 'Guest Room' }, levels: ['upper'] },
      { addr: { col: 0, band: 1 }, fill: { kind: 'bedroom', label: 'Bedroom 2' }, levels: ['upper'] },
    ],
    availableWhen: (ctx) =>
      ctx.selections.archetype !== 'archetype-narrow-lot' &&
      ctx.selections.archetype !== 'archetype-corner-residential' &&
      ctx.selections.archetype !== 'archetype-live-work',
  },

  // Corner-residential specific: spine at col 2 means bedrooms fill cols 0-1 and col 3.
  {
    id: 'sleeping-cr-four-bed',
    category: 'sleeping',
    title: 'Four bedrooms upstairs',
    blurb:
      'A main bedroom and three further bedrooms make full use of the upper floor, with the corner view shared between two rooms.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 0 }, fill: { kind: 'master', label: 'Main Bedroom' }, levels: ['upper'] },
      { addr: { col: 1, band: 0 }, fill: { kind: 'bedroom', label: 'Bedroom 2' }, levels: ['upper'] },
      { addr: { col: 3, band: 0 }, fill: { kind: 'bedroom', label: 'Bedroom 3' }, levels: ['upper'] },
      { addr: { col: 0, band: 1 }, fill: { kind: 'bedroom', label: 'Bedroom 4' }, levels: ['upper'] },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-corner-residential',
  },
  {
    id: 'sleeping-cr-three-bed',
    category: 'sleeping',
    title: 'Three bedrooms and a bathroom upstairs',
    blurb:
      'A main bedroom, two further bedrooms and a shared bathroom use the upper floor efficiently.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 0 }, fill: { kind: 'master', label: 'Main Bedroom' }, levels: ['upper'] },
      { addr: { col: 1, band: 0 }, fill: { kind: 'bedroom', label: 'Bedroom 2' }, levels: ['upper'] },
      { addr: { col: 3, band: 0 }, fill: { kind: 'bath', label: 'Bathroom' }, levels: ['upper'] },
      { addr: { col: 0, band: 1 }, fill: { kind: 'bedroom', label: 'Bedroom 3' }, levels: ['upper'] },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-corner-residential',
  },

  // --- spine-stair (fill) ---
  // Corner-residential specific: spine at col 2.
  {
    id: 'stair-central-cr',
    category: 'spine-stair',
    title: 'Stair at the centre',
    blurb: 'The stair sits in the middle of the home, just behind the corner entry.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 2, band: 1 }, fill: { kind: 'circulation', label: 'Stair' }, levels: ['ground', 'upper'] },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-corner-residential',
  },
  {
    id: 'stair-rear-cr',
    category: 'spine-stair',
    title: 'Stair toward the back',
    blurb: 'The stair sits toward the back of the home, keeping the central hall open.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 2, band: 2 }, fill: { kind: 'circulation', label: 'Stair' }, levels: ['ground', 'upper'] },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-corner-residential',
  },
  {
    id: 'stair-central',
    category: 'spine-stair',
    title: 'Stair at the centre',
    blurb: 'The stair sits in the middle of the home, right beside the courtyard.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 1, band: 1 }, fill: { kind: 'circulation', label: 'Stair' }, levels: ['ground', 'upper'] },
    ],
    availableWhen: (ctx) => ctx.selections.archetype !== 'archetype-corner-residential',
  },
  {
    id: 'stair-rear',
    category: 'spine-stair',
    title: 'Stair toward the back',
    blurb: 'The stair sits toward the back of the home, keeping the centre open.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 1, band: 2 }, fill: { kind: 'circulation', label: 'Stair' }, levels: ['ground', 'upper'] },
    ],
    availableWhen: (ctx) => ctx.selections.archetype !== 'archetype-corner-residential',
  },

  // --- forecourt (fill) ---
  // Corner-residential: forecourt at (3,0) activates the side-street corner.
  {
    id: 'forecourt-cr-corner',
    category: 'forecourt',
    title: 'Corner garden',
    blurb: 'A planted corner garden addresses both streets at once, giving the entry a generous, welcoming edge.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [{ addr: { col: 3, band: 0 }, fill: { kind: 'outdoor-room', label: 'Corner Garden' } }],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-corner-residential',
  },
  // Live-work specific: the studio already fills (0,0); the forecourt step is a no-op.
  {
    id: 'forecourt-lw-frontage',
    category: 'forecourt',
    title: 'Street entrance to the studio',
    blurb: 'The studio addresses the street directly — the working entrance is the front of the home.',
    tiers: ['pro'],
    params: {},
    cellOps: [],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-live-work',
  },
  {
    id: 'forecourt-garden',
    category: 'forecourt',
    title: 'Garden entry',
    blurb: 'A small garden welcomes you in before you reach the front door.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [{ addr: { col: 0, band: 0 }, fill: { kind: 'outdoor-room', label: 'Garden Entry' } }],
    availableWhen: (ctx) =>
      ctx.selections.archetype !== 'archetype-corner-residential' &&
      ctx.selections.archetype !== 'archetype-live-work',
  },
  {
    id: 'forecourt-court',
    category: 'forecourt',
    title: 'Entry court',
    blurb: 'A paved court gives the front door a sense of arrival from the street.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [{ addr: { col: 0, band: 0 }, fill: { kind: 'outdoor-room', label: 'Entry Court' } }],
    availableWhen: (ctx) =>
      ctx.selections.archetype !== 'archetype-corner-residential' &&
      ctx.selections.archetype !== 'archetype-live-work',
  },

  // --- rear-terrace (fill) ---
  // Corner-residential: inner-garden strip at (0,2),(1,2) — private rear face.
  {
    id: 'terrace-cr-garden',
    category: 'rear-terrace',
    title: 'Inner garden',
    blurb: 'A quiet garden at the back of the plan — sheltered from both streets and entirely private.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 2 }, fill: { kind: 'outdoor-room', label: 'Rear Garden' } },
      { addr: { col: 1, band: 2 }, fill: { kind: 'outdoor-room', label: 'Rear Garden' } },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-corner-residential',
  },
  {
    id: 'terrace-cr-standard',
    category: 'rear-terrace',
    title: 'Rear terrace',
    blurb: 'A paved terrace at the back gives the home a private outdoor space away from both street frontages.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 0, band: 2 }, fill: { kind: 'outdoor-room', label: 'Rear Terrace' } },
      { addr: { col: 1, band: 2 }, fill: { kind: 'outdoor-room', label: 'Rear Terrace' } },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-corner-residential',
  },

  // Narrow-lot specific: only one rear cell (col 2, band 2) — no col 3.
  {
    id: 'terrace-nl-standard',
    category: 'rear-terrace',
    title: 'Back terrace',
    blurb: 'A terrace at the back connects the home to the garden.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 2, band: 2 }, fill: { kind: 'outdoor-room', label: 'Terrace' } },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-narrow-lot',
  },
  {
    id: 'terrace-nl-garden',
    category: 'rear-terrace',
    title: 'Back garden room',
    blurb: 'An open garden room at the back gives the home extra outdoor space to enjoy.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 2, band: 2 }, fill: { kind: 'outdoor-room', label: 'Garden Room' } },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-narrow-lot',
  },
  {
    id: 'terrace-standard',
    category: 'rear-terrace',
    title: 'Back terrace',
    blurb: 'A covered terrace at the back connects living spaces to the garden.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 3, band: 2 }, fill: { kind: 'outdoor-room', label: 'Terrace' } },
      { addr: { col: 2, band: 2 }, fill: { kind: 'outdoor-room', label: 'Terrace' } },
    ],
    availableWhen: (ctx) =>
      ctx.selections.archetype !== 'archetype-narrow-lot' &&
      ctx.selections.archetype !== 'archetype-corner-residential',
  },
  {
    id: 'terrace-garden',
    category: 'rear-terrace',
    title: 'Back garden room',
    blurb: 'An open garden room at the back gives the family extra space to spread out.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 3, band: 2 }, fill: { kind: 'outdoor-room', label: 'Garden Room' } },
      { addr: { col: 2, band: 2 }, fill: { kind: 'outdoor-room', label: 'Garden Room' } },
    ],
    availableWhen: (ctx) =>
      ctx.selections.archetype !== 'archetype-narrow-lot' &&
      ctx.selections.archetype !== 'archetype-corner-residential',
  },

  // --- outdoor-rooms (fill) ---
  // CR: (3,1) faces the side street — needs an explicit fill since indoor-living
  // doesn't claim it. Listed first so it's CR's default for this category.
  {
    id: 'outdoor-rooms-cr-sitting',
    category: 'outdoor-rooms',
    title: 'Side room',
    blurb: 'An indoor sitting room faces the side street, giving the home a second address.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [{ addr: { col: 3, band: 1 }, fill: { kind: 'living', label: 'Sitting Room' } }],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-corner-residential',
  },
  // Live-work specific: (3,1) on the ground floor needs an explicit fill.
  {
    id: 'outdoor-rooms-lw-deck',
    category: 'outdoor-rooms',
    title: 'Covered deck off the studio',
    blurb: 'A covered deck at the back of the working floor gives the studio an outdoor space to spill into.',
    tiers: ['pro'],
    params: {},
    cellOps: [{ addr: { col: 3, band: 1 }, fill: { kind: 'outdoor-room', label: 'Covered Deck' } }],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-live-work',
  },
  {
    id: 'outdoor-rooms-lw-workroom',
    category: 'outdoor-rooms',
    title: 'Extra work room',
    blurb: 'A second work room beside the studio gives space for a workshop or storage away from the public floor.',
    tiers: ['pro'],
    params: {},
    cellOps: [{ addr: { col: 3, band: 1 }, fill: { kind: 'work', label: 'Work Room' } }],
    tradeoff: 'The extra work room replaces the covered deck, using the space indoors.',
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-live-work',
  },
  {
    id: 'outdoor-rooms-none',
    category: 'outdoor-rooms',
    title: 'Keep this as a family room',
    blurb: 'This space stays an indoor family room.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [],
    availableWhen: (ctx) =>
      ctx.selections.archetype !== 'archetype-corner-residential' &&
      ctx.selections.archetype !== 'archetype-live-work',
  },
  {
    id: 'outdoor-rooms-deck',
    category: 'outdoor-rooms',
    title: 'Open it to a covered deck',
    blurb: 'This space opens up as a covered deck right next to the courtyard.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [{ addr: { col: 3, band: 1 }, fill: { kind: 'outdoor-room', label: 'Covered Deck' } }],
    tradeoff: 'Opening this room to the courtyard trades one indoor room for a covered deck.',
    availableWhen: (ctx) =>
      ctx.selections.site !== 'site-narrow' &&
      ctx.selections.archetype !== 'archetype-narrow-lot' &&
      ctx.selections.archetype !== 'archetype-live-work',
  },

  // --- upper-terrace (fill) ---
  // Narrow-lot specific: upper terrace at col 2 (col 3 OOB for 3-bay grid).
  {
    id: 'upper-terrace-nl-open',
    category: 'upper-terrace',
    title: 'Roof terrace',
    blurb: 'An open roof terrace above the courtyard catches the afternoon sun.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 2, band: 1 }, fill: { kind: 'outdoor-room', label: 'Roof Terrace' }, levels: ['upper'] },
      { addr: { col: 2, band: 2 }, fill: { kind: 'outdoor-room', label: 'Roof Terrace' }, levels: ['upper'] },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-narrow-lot',
  },
  {
    id: 'upper-terrace-nl-studio',
    category: 'upper-terrace',
    title: 'Studio with a balcony',
    blurb: 'A studio sits above the courtyard and opens onto a small balcony at the rear.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 2, band: 1 }, fill: { kind: 'work', label: 'Studio' }, levels: ['upper'] },
      { addr: { col: 2, band: 2 }, fill: { kind: 'outdoor-room', label: 'Balcony' }, levels: ['upper'] },
    ],
    tradeoff: 'The studio replaces the roof terrace, giving you a separate work space above the courtyard.',
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-narrow-lot',
  },
  // Live-work specific: upper-terrace must fill both 'upper' and 'level2plus'
  // since both levels have an upper-terrace slot at (3,1) and (3,2).
  {
    id: 'upper-terrace-lw-open',
    category: 'upper-terrace',
    title: 'Terrace on the living floor and roof terrace above',
    blurb: 'A terrace off the living area becomes a private roof terrace above the bedrooms.',
    tiers: ['pro'],
    params: {},
    cellOps: [
      { addr: { col: 3, band: 1 }, fill: { kind: 'outdoor-room', label: 'Terrace' }, levels: ['upper', 'level2plus'] },
      { addr: { col: 3, band: 2 }, fill: { kind: 'outdoor-room', label: 'Terrace' }, levels: ['upper', 'level2plus'] },
    ],
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-live-work',
  },
  {
    id: 'upper-terrace-lw-studio',
    category: 'upper-terrace',
    title: 'Studio on the living floor, roof terrace above',
    blurb: 'A studio sits off the living area, opening onto a small balcony. The floor above has a private roof terrace.',
    tiers: ['pro'],
    params: {},
    cellOps: [
      { addr: { col: 3, band: 1 }, fill: { kind: 'work', label: 'Studio' }, levels: ['upper'] },
      { addr: { col: 3, band: 2 }, fill: { kind: 'outdoor-room', label: 'Balcony' }, levels: ['upper'] },
      { addr: { col: 3, band: 1 }, fill: { kind: 'outdoor-room', label: 'Roof Terrace' }, levels: ['level2plus'] },
      { addr: { col: 3, band: 2 }, fill: { kind: 'outdoor-room', label: 'Roof Terrace' }, levels: ['level2plus'] },
    ],
    tradeoff: 'The studio takes one room on the living floor, keeping a larger terrace above.',
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-live-work',
  },
  {
    id: 'upper-terrace-open',
    category: 'upper-terrace',
    title: 'Roof terrace',
    blurb: 'An open terrace upstairs catches the afternoon sun.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 3, band: 1 }, fill: { kind: 'outdoor-room', label: 'Terrace' }, levels: ['upper'] },
      { addr: { col: 3, band: 2 }, fill: { kind: 'outdoor-room', label: 'Terrace' }, levels: ['upper'] },
    ],
    availableWhen: (ctx) =>
      ctx.selections.archetype !== 'archetype-narrow-lot' &&
      ctx.selections.archetype !== 'archetype-live-work',
  },
  {
    id: 'upper-terrace-studio',
    category: 'upper-terrace',
    title: 'Studio with a balcony',
    blurb: 'A studio at the top of the stairs opens onto a small balcony.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [
      { addr: { col: 3, band: 1 }, fill: { kind: 'work', label: 'Studio' }, levels: ['upper'] },
      { addr: { col: 3, band: 2 }, fill: { kind: 'outdoor-room', label: 'Balcony' }, levels: ['upper'] },
    ],
    tradeoff: 'The studio takes the place of a roof terrace, giving you a separate work space upstairs.',
    availableWhen: (ctx) =>
      ctx.selections.archetype !== 'archetype-narrow-lot' &&
      ctx.selections.archetype !== 'archetype-live-work',
  },

  // --- palette (fill) ---
  {
    id: 'palette-warm',
    category: 'palette',
    title: 'Warm neutrals',
    blurb: 'Warm sand walls with a soft terracotta roof and a clay accent.',
    tiers: ['core', 'pro'],
    params: { name: 'Warm neutrals', wall: '#E4D9C8', roof: '#B5562E', ground: '#EFE9DF', accent: '#B5562E' },
  },
  {
    id: 'palette-cool',
    category: 'palette',
    title: 'Cool neutrals',
    blurb: 'Soft grey walls with a charcoal roof and a sage green accent.',
    tiers: ['core', 'pro'],
    params: { name: 'Cool neutrals', wall: '#DDE2E1', roof: '#3D4543', ground: '#EDEFEE', accent: '#5C7A6B' },
  },
]

export function getCard(id: string): CardDef {
  const card = CARDS.find((c) => c.id === id)
  if (!card) throw new Error(`Unknown card id: ${id}`)
  return card
}

export function cardsByCategory(category: CardCategory): CardDef[] {
  return CARDS.filter((c) => c.category === category)
}

// Pipeline order: structure (bones) first, then fills. See brief §6 and §8.
export const CATEGORY_ORDER: CardCategory[] = [
  'archetype',
  'site',
  'courtyard',
  'indoor-living',
  'sleeping',
  'spine-stair',
  'forecourt',
  'rear-terrace',
  'outdoor-rooms',
  'upper-terrace',
  'palette',
]
