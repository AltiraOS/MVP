import type { CellAddr, Concept } from '../model/types'
import { bandOffsetM, cellKey } from '../model/grid'
import { cellRectM, fitFontSizeM, gridBoundsM } from './geometry'
import { DimensionLine, NorthMark, ScaleBar, SharedDefs, StreetMark } from './primitives'
import { FONT_SIZE_M, INK, INK_SOFT, LINE_WEIGHT_M, MARGIN_M } from './tokens'

export interface PlanViewProps {
  concept: Concept
  className?: string
  /** When set, only this cell's label/fill is drawn at full strength and the
   * rest of the board is dimmed — used for card thumbnails. */
  highlight?: CellAddr[]
  /** Adds dimension strings (overall, per-column width, per-row depth) over
   * the same geometry — never changes placement. Only meaningful once the
   * concept has been resolved onto the customer's real site (brief §3). */
  dimensioned?: boolean
}

export function PlanView({ concept, className, highlight, dimensioned }: PlanViewProps) {
  const { grid, siteM, levels, spine, stair, palette, title } = concept
  const ground = levels.find((l) => l.id === 'ground')
  // Use the topmost level for the upper-footprint overlay so the dashed outline
  // always reflects the highest part of the building regardless of level count.
  const upper = levels.length > 1 ? levels[levels.length - 1] : undefined
  if (!ground) return null

  const bounds = gridBoundsM(grid)
  const highlightKeys = highlight ? new Set(highlight.map(cellKey)) : null

  const viewMinX = -MARGIN_M
  const viewMinY = -MARGIN_M
  const viewW = siteM.frontageM + MARGIN_M * 2
  const viewH = siteM.depthM + MARGIN_M * 2.4

  const spineX = bounds.x + (spine.col + 0.5) * grid.bayWidthM

  const cells: { addr: CellAddr; key: string }[] = []
  for (let band = 0; band < grid.bandCount; band++) {
    for (let col = 0; col < grid.bayCount; col++) {
      cells.push({ addr: { col, band }, key: cellKey({ col, band }) })
    }
  }

  // Upper-level overlay: cells the ground floor builds but the upper level
  // doesn't reach (a flat roof below) get a dashed outline, so the upper
  // footprint reads as different from the ground floor where it actually is.
  const upperGaps = upper
    ? cells
        .filter(({ key }) => ground.assignments[key] && !upper.assignments[key])
        .map(({ addr }) => cellRectM(grid, addr))
    : []

  const stairRect = cellRectM(grid, stair)

  return (
    <svg
      viewBox={`${viewMinX} ${viewMinY} ${viewW} ${viewH}`}
      className={className}
      role="img"
      aria-label={`Floor plan of ${title}`}
    >
      <SharedDefs />

      {/* site boundary */}
      <rect
        x={0}
        y={0}
        width={siteM.frontageM}
        height={siteM.depthM}
        fill="none"
        stroke={INK_SOFT}
        strokeWidth={LINE_WEIGHT_M.hairline}
      />

      {/* setbacks (dashed hairline) */}
      <rect
        x={siteM.setbacks.side}
        y={siteM.setbacks.front}
        width={siteM.frontageM - 2 * siteM.setbacks.side}
        height={siteM.depthM - siteM.setbacks.front - siteM.setbacks.rear}
        fill="none"
        stroke={INK_SOFT}
        strokeWidth={LINE_WEIGHT_M.hairline}
        strokeDasharray="0.2 0.15"
      />

      {/* ground cells: poche walls, courtyard as open void with accent fill */}
      {cells.map(({ addr, key }) => {
        const fill = ground.assignments[key]
        if (!fill) return null
        const r = cellRectM(grid, addr)
        const isVoid = fill.kind === 'open'
        const dimmed = highlightKeys ? !highlightKeys.has(key) : false
        const fontSize = fitFontSizeM(fill.label, r.w, FONT_SIZE_M.label)

        return (
          <g key={key} opacity={dimmed ? 0.35 : 1}>
            {isVoid ? (
              <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={palette.accent} fillOpacity={0.18} />
            ) : (
              <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke={INK} strokeWidth={LINE_WEIGHT_M.secondary} />
            )}
            <text
              x={r.x + r.w / 2}
              y={r.y + r.h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize}
              fill={isVoid ? INK_SOFT : INK}
            >
              {fill.label}
            </text>
          </g>
        )
      })}

      {/* building envelope (cut weight) */}
      <rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.w}
        height={bounds.h}
        fill="none"
        stroke={INK}
        strokeWidth={LINE_WEIGHT_M.cut}
      />

      {/* spine */}
      <line
        x1={spineX}
        y1={bounds.y}
        x2={spineX}
        y2={bounds.y + bounds.h}
        stroke={INK_SOFT}
        strokeWidth={LINE_WEIGHT_M.secondary}
        strokeDasharray="0.12 0.18"
      />

      {/* stair treads, on the spine */}
      <g aria-label="Stair">
        {Array.from({ length: 5 }).map((_, i) => {
          const ty = stairRect.y + (stairRect.h * (i + 1)) / 6
          return (
            <line
              key={i}
              x1={stairRect.x + stairRect.w * 0.15}
              x2={stairRect.x + stairRect.w * 0.85}
              y1={ty}
              y2={ty}
              stroke={INK}
              strokeWidth={LINE_WEIGHT_M.hairline}
            />
          )
        })}
      </g>

      {/* upper-level overlay: dashed outline where the upper floor stops */}
      {upperGaps.map((r, i) => (
        <rect
          key={i}
          x={r.x}
          y={r.y}
          width={r.w}
          height={r.h}
          fill="none"
          stroke={INK_SOFT}
          strokeWidth={LINE_WEIGHT_M.secondary}
          strokeDasharray="0.2 0.15"
          aria-label="Upper level outline"
        />
      ))}

      {/* dimension strings: overall frontage, per-column width, per-row depth */}
      {dimensioned && (
        <g aria-label="Dimensions">
          <DimensionLine
            x1={bounds.x}
            y1={bounds.y - 0.7}
            x2={bounds.x + bounds.w}
            y2={bounds.y - 0.7}
            label={`${bounds.w.toFixed(2)} m overall`}
          />
          {Array.from({ length: grid.bayCount }).map((_, col) => (
            <DimensionLine
              key={col}
              x1={bounds.x + col * grid.bayWidthM}
              y1={bounds.y - 0.35}
              x2={bounds.x + (col + 1) * grid.bayWidthM}
              y2={bounds.y - 0.35}
              label={`${grid.bayWidthM.toFixed(2)} m`}
            />
          ))}
          {grid.bandDepthsM.map((depthM, band) => (
            <DimensionLine
              key={band}
              x1={bounds.x - 0.5}
              y1={grid.originM.y + bandOffsetM(grid, band)}
              x2={bounds.x - 0.5}
              y2={grid.originM.y + bandOffsetM(grid, band + 1)}
              label={`${depthM.toFixed(2)} m`}
            />
          ))}
        </g>
      )}

      {/* north mark */}
      <NorthMark x={siteM.frontageM + MARGIN_M * 0.55} y={0.6} northDeg={siteM.northDeg} />

      {/* street mark */}
      <StreetMark x={bounds.x} y={-MARGIN_M * 0.85} widthM={bounds.w} />

      {/* scale bar */}
      <ScaleBar x={0} y={siteM.depthM + MARGIN_M * 1.5} />
    </svg>
  )
}
