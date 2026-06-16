import { FONT_SIZE_M, INK, INK_SOFT, LINE_WEIGHT_M } from './tokens'

// A scale bar in metres: 0, 1 and 5 m ticks on a short ruler. Always present.
export function ScaleBar({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`} aria-label="Scale: 5 metres">
      <line x1={0} y1={0} x2={5} y2={0} stroke={INK} strokeWidth={LINE_WEIGHT_M.hairline} />
      {[0, 1, 5].map((m) => (
        <line
          key={m}
          x1={m}
          y1={-0.15}
          x2={m}
          y2={0.15}
          stroke={INK}
          strokeWidth={LINE_WEIGHT_M.hairline}
        />
      ))}
      <text x={0} y={0.55} fontSize={FONT_SIZE_M.small} fill={INK}>
        0
      </text>
      <text x={1} y={0.55} fontSize={FONT_SIZE_M.small} fill={INK} textAnchor="middle">
        1
      </text>
      <text x={5} y={0.55} fontSize={FONT_SIZE_M.small} fill={INK} textAnchor="end">
        5 m
      </text>
    </g>
  )
}

// A vertical scale bar in metres, for SectionView: 0, 1 and 5 m ticks
// rising from (x, y).
export function HeightScale({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`} aria-label="Height scale: 5 metres">
      <line x1={0} y1={0} x2={0} y2={-5} stroke={INK} strokeWidth={LINE_WEIGHT_M.hairline} />
      {[0, 1, 5].map((m) => (
        <line
          key={m}
          x1={-0.15}
          y1={-m}
          x2={0.15}
          y2={-m}
          stroke={INK}
          strokeWidth={LINE_WEIGHT_M.hairline}
        />
      ))}
      <text x={0.25} y={0.1} fontSize={FONT_SIZE_M.small} fill={INK}>
        0
      </text>
      <text x={0.25} y={-1 + 0.1} fontSize={FONT_SIZE_M.small} fill={INK}>
        1
      </text>
      <text x={0.25} y={-5 + 0.1} fontSize={FONT_SIZE_M.small} fill={INK}>
        5 m
      </text>
    </g>
  )
}

// North arrow, rotated by the site's north angle.
export function NorthMark({ x, y, northDeg }: { x: number; y: number; northDeg: number }) {
  return (
    <g transform={`translate(${x},${y})`} aria-label="North">
      <g transform={`rotate(${northDeg})`}>
        <line x1={0} y1={0.6} x2={0} y2={-0.6} stroke={INK} strokeWidth={LINE_WEIGHT_M.secondary} />
        <path d="M 0 -0.6 L -0.18 -0.2 L 0.18 -0.2 Z" fill={INK} />
      </g>
      <text x={0} y={1.05} textAnchor="middle" fontSize={FONT_SIZE_M.small} fill={INK}>
        N
      </text>
    </g>
  )
}

// A small marker on the street-facing edge of the site.
export function StreetMark({ x, y, widthM }: { x: number; y: number; widthM: number }) {
  const centerX = x + widthM / 2
  return (
    <g aria-label="Street">
      <text x={centerX} y={y} textAnchor="middle" fontSize={FONT_SIZE_M.small} fill={INK_SOFT}>
        Street
      </text>
      <line
        x1={centerX}
        y1={y + 0.15}
        x2={centerX}
        y2={y + 0.55}
        stroke={INK_SOFT}
        strokeWidth={LINE_WEIGHT_M.hairline}
        markerEnd="url(#altira-street-arrow)"
      />
    </g>
  )
}

// A dimension string between two points: an extension line with end ticks
// and a centred label. Purely additive over geometry already computed
// elsewhere (gridBoundsM, grid.bayWidthM, bandDepthsM, slab heights) —
// it never works out a position itself.
export function DimensionLine({
  x1,
  y1,
  x2,
  y2,
  label,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
}) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const tickLen = 0.12
  const px = (-dy / len) * tickLen
  const py = (dx / len) * tickLen
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  const isHorizontal = Math.abs(dy) <= Math.abs(dx)

  return (
    <g aria-label={`Dimension: ${label}`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK_SOFT} strokeWidth={LINE_WEIGHT_M.hairline} />
      <line
        x1={x1 - px}
        y1={y1 - py}
        x2={x1 + px}
        y2={y1 + py}
        stroke={INK_SOFT}
        strokeWidth={LINE_WEIGHT_M.hairline}
      />
      <line
        x1={x2 - px}
        y1={y2 - py}
        x2={x2 + px}
        y2={y2 + py}
        stroke={INK_SOFT}
        strokeWidth={LINE_WEIGHT_M.hairline}
      />
      <text
        x={midX + (isHorizontal ? 0 : 0.12)}
        y={midY - (isHorizontal ? 0.08 : 0)}
        textAnchor="middle"
        fontSize={FONT_SIZE_M.small}
        fill={INK_SOFT}
      >
        {label}
      </text>
    </g>
  )
}

// Shared <defs> for marker arrowheads. Render once per SVG.
export function SharedDefs() {
  return (
    <defs>
      <marker
        id="altira-street-arrow"
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        markerWidth="4"
        markerHeight="4"
        markerUnits="strokeWidth"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill={INK_SOFT} />
      </marker>
    </defs>
  )
}
