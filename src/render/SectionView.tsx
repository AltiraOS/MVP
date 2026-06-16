import type { CellAddr, Concept } from '../model/types'
import { cellKey } from '../model/grid'
import { LEVEL_LABELS, ROOF_LABEL } from '../model/copy'
import { isFullyVoidCell, sectionHeightsM, sectionSegmentsM, sectionWidthM } from './geometry'
import { HeightScale, ScaleBar, SharedDefs } from './primitives'
import { FONT_SIZE_M, INK, INK_SOFT, LINE_WEIGHT_M, MARGIN_M } from './tokens'

const TOP_MARGIN_M = 1
const GROUND_MARGIN_M = 1.2
const STAIR_STEPS = 6

export interface SectionViewProps {
  concept: Concept
  className?: string
  /** When set, only these cells' segments are drawn at full strength and the
   * rest of the section is dimmed — used for card thumbnails. */
  highlight?: CellAddr[]
}

// A cut along the spine column, jogging to the courtyard's column for the
// band(s) where the courtyard sits and back to the spine where the stair
// sits. Shows floor slabs at their real elevations, the courtyard as open
// air through the full height of the building, and the stair connecting
// the levels.
export function SectionView({ concept, className, highlight }: SectionViewProps) {
  const { levels, spine, stair, palette, title } = concept
  const widthM = sectionWidthM(concept.grid)
  const { slabZs, roofTopM } = sectionHeightsM(concept)
  const segments = sectionSegmentsM(concept)
  const highlightKeys = highlight ? new Set(highlight.map(cellKey)) : null

  const viewMinX = -MARGIN_M
  const viewMinY = -TOP_MARGIN_M
  const viewW = widthM + MARGIN_M * 2
  const viewH = roofTopM + TOP_MARGIN_M + GROUND_MARGIN_M

  const yFor = (z: number) => roofTopM - z

  const stairSeg = segments.find(
    (seg) => seg.addr.col === spine.col && seg.addr.band === stair.band,
  )
  const stairRiseM = slabZs[slabZs.length - 1] ?? roofTopM
  const stairPoints: string[] = []
  if (stairSeg) {
    let z = 0
    stairPoints.push(`${stairSeg.x},${yFor(z)}`)
    for (let i = 1; i <= STAIR_STEPS; i++) {
      const nextX = stairSeg.x + (stairSeg.w * i) / STAIR_STEPS
      const nextZ = (stairRiseM * i) / STAIR_STEPS
      stairPoints.push(`${nextX},${yFor(z)}`)
      stairPoints.push(`${nextX},${yFor(nextZ)}`)
      z = nextZ
    }
  }

  return (
    <svg
      viewBox={`${viewMinX} ${viewMinY} ${viewW} ${viewH}`}
      className={className}
      role="img"
      aria-label={`Section through ${title}`}
    >
      <SharedDefs />

      {/* ground line, extends beyond the building */}
      <line
        x1={viewMinX}
        y1={yFor(0)}
        x2={viewMinX + viewW}
        y2={yFor(0)}
        stroke={INK_SOFT}
        strokeWidth={LINE_WEIGHT_M.hairline}
        aria-label="Ground line"
      />

      {/* segments: built mass with floor slabs, or open courtyard void */}
      {segments.map((seg, i) => {
        const isVoid = isFullyVoidCell(concept, seg.addr)
        const dimmed = highlightKeys ? !highlightKeys.has(cellKey(seg.addr)) : false

        return (
          <g key={i} opacity={dimmed ? 0.35 : 1}>
            {isVoid ? (
              <>
                <rect
                  x={seg.x}
                  y={yFor(roofTopM)}
                  width={seg.w}
                  height={roofTopM}
                  fill={palette.accent}
                  fillOpacity={0.12}
                />
                <line
                  x1={seg.x}
                  y1={yFor(roofTopM)}
                  x2={seg.x + seg.w}
                  y2={yFor(roofTopM)}
                  stroke={INK_SOFT}
                  strokeWidth={LINE_WEIGHT_M.secondary}
                  strokeDasharray="0.2 0.15"
                  aria-label="Open to sky"
                />
              </>
            ) : (
              <>
                <rect
                  x={seg.x}
                  y={yFor(roofTopM)}
                  width={seg.w}
                  height={roofTopM}
                  fill="none"
                  stroke={INK}
                  strokeWidth={LINE_WEIGHT_M.cut}
                />
                {slabZs.map((z) => (
                  <line
                    key={z}
                    x1={seg.x}
                    y1={yFor(z)}
                    x2={seg.x + seg.w}
                    y2={yFor(z)}
                    stroke={INK}
                    strokeWidth={LINE_WEIGHT_M.secondary}
                  />
                ))}
              </>
            )}
          </g>
        )
      })}

      {/* stair, rising from the ground floor to the floor above */}
      {stairSeg && (
        <g aria-label="Stair">
          <polyline points={stairPoints.join(' ')} fill="none" stroke={INK} strokeWidth={LINE_WEIGHT_M.hairline} />
        </g>
      )}

      {/* level labels */}
      <text x={widthM + 0.3} y={yFor(0) - 0.1} fontSize={FONT_SIZE_M.small} fill={INK_SOFT}>
        {LEVEL_LABELS.ground}
      </text>
      {levels.slice(1).map((level) => (
        <text
          key={level.id}
          x={widthM + 0.3}
          y={yFor(level.baseElevationM) - 0.1}
          fontSize={FONT_SIZE_M.small}
          fill={INK_SOFT}
        >
          {LEVEL_LABELS[level.id]}
        </text>
      ))}
      <text x={widthM + 0.3} y={yFor(roofTopM) + 0.3} fontSize={FONT_SIZE_M.small} fill={INK_SOFT}>
        {ROOF_LABEL}
      </text>

      {/* height scale */}
      <HeightScale x={viewMinX + MARGIN_M * 0.4} y={yFor(0)} />

      {/* depth scale */}
      <ScaleBar x={0} y={yFor(0) + GROUND_MARGIN_M * 0.6} />
    </svg>
  )
}
