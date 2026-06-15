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
