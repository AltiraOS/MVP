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
    // narrow-lot; DK and IG provide their own no-courtyard defaults above.
    availableWhen: (ctx) =>
      ctx.selections.archetype !== 'archetype-dual-key' &&
      ctx.selections.archetype !== 'archetype-intergenerational',
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
      ctx.selections.archetype !== 'archetype-intergenerational',
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
    availableWhen: (ctx) => ctx.selections.archetype !== 'archetype-narrow-lot',
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
    availableWhen: (ctx) => ctx.selections.archetype !== 'archetype-narrow-lot',
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
    availableWhen: (ctx) => ctx.selections.archetype !== 'archetype-narrow-lot',
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
    availableWhen: (ctx) => ctx.selections.archetype !== 'archetype-narrow-lot',
  },

  // --- spine-stair (fill) ---
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
  },

  // --- forecourt (fill) ---
  {
    id: 'forecourt-garden',
    category: 'forecourt',
    title: 'Garden entry',
    blurb: 'A small garden welcomes you in before you reach the front door.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [{ addr: { col: 0, band: 0 }, fill: { kind: 'outdoor-room', label: 'Garden Entry' } }],
  },
  {
    id: 'forecourt-court',
    category: 'forecourt',
    title: 'Entry court',
    blurb: 'A paved court gives the front door a sense of arrival from the street.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [{ addr: { col: 0, band: 0 }, fill: { kind: 'outdoor-room', label: 'Entry Court' } }],
  },

  // --- rear-terrace (fill) ---
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
    availableWhen: (ctx) => ctx.selections.archetype !== 'archetype-narrow-lot',
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
    availableWhen: (ctx) => ctx.selections.archetype !== 'archetype-narrow-lot',
  },

  // --- outdoor-rooms (fill) ---
  {
    id: 'outdoor-rooms-none',
    category: 'outdoor-rooms',
    title: 'Keep this as a family room',
    blurb: 'This space stays an indoor family room.',
    tiers: ['core', 'pro'],
    params: {},
    cellOps: [],
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
      ctx.selections.archetype !== 'archetype-narrow-lot',
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
    availableWhen: (ctx) => ctx.selections.archetype !== 'archetype-narrow-lot',
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
    availableWhen: (ctx) => ctx.selections.archetype !== 'archetype-narrow-lot',
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
