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
  // Gate 0 stub: exercises the registry-driven test suite with a second
  // registered parti. Hidden from the Shape tray (availableWhen returns
  // false unless it is already selected). Replaced by the first real parti
  // (dual-key) in the next commit.
  {
    id: 'archetype-gate0-stub',
    category: 'archetype',
    title: 'Compact courtyard home',
    blurb: 'A smaller home arranged around a central garden, suited to a tighter block.',
    tiers: ['core', 'pro'],
    params: { partiId: 'gate0-stub', levels: 2 },
    // DECISION: self-referential guard keeps this invisible in the real UI
    // while still being resolvable by the assembler when directly selected
    // in tests (availableWhen passes when the card is already chosen).
    availableWhen: (ctx) => ctx.selections.archetype === 'archetype-gate0-stub',
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
  },

  // --- indoor-living (fill) ---
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
  },

  // --- sleeping (fill, upper level) ---
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
    availableWhen: (ctx) => ctx.selections.site !== 'site-narrow',
  },

  // --- upper-terrace (fill) ---
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
