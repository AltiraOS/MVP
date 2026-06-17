import type { CellAddr, Concept } from '../model/types'
import { bandOffsetM, cellKey } from '../model/grid'
import { boardBoundsM, fitFontSizeM } from './geometry'
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
  const { board, siteM, levels, spine, stair, palette, title } = concept
  const ground = levels.find((l) => l.id === 'ground')
  // Use the topmost level for the upper-footprint overlay so the dashed outline
  // always reflects the highest part of the building regardless of level count.
  const upper = levels.length > 1 ? levels[levels.length - 1] : undefined
  if (!ground) return null

  const bounds = boardBoundsM(board)
  const highlightKeys = highlight ? new Set(highlight.map(cellKey)) : null

  const viewMinX = -MARGIN_M
  const viewMinY = -MARGIN_M
  const viewW = siteM.frontageM + MARGIN_M * 2
  const viewH = siteM.depthM + MARGIN_M * 2.4

  const spineX = spine.xM + spine.widthM / 2

  // Upper-level overlay: cells the ground floor builds but the upper level
  // doesn't reach (a flat roof below) get a dashed outline, so the upper
  // footprint reads as different from the ground floor where it actually is.
  const upperGaps = upper
    ? ground.placements.filter(
        (gp) => !upper.placements.some((up) => up.colStart === gp.colStart && up.bandStart === gp.bandStart),
      )
    : []

  const stairRect = { x: stair.xM, y: stair.yM, w: stair.widthM, h: stair.depthM }

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

      {/* ground placements: poche walls, courtyard as open void with accent fill */}
      {ground.placements.map((p) => {
        if (!p.fill) return null
        const key = cellKey({ col: p.colStart, band: p.bandStart })
        const isVoid = p.fill.kind === 'open'
        const dimmed = highlightKeys ? !highlightKeys.has(key) : false
        const fontSize = fitFontSizeM(p.fill.label, p.widthM, FONT_SIZE_M.label)

        return (
          <g key={key} opacity={dimmed ? 0.35 : 1}>
            {isVoid ? (
              <rect x={p.xM} y={p.yM} width={p.widthM} height={p.depthM} fill={palette.accent} fillOpacity={0.18} />
            ) : (
              <rect
                x={p.xM}
                y={p.yM}
                width={p.widthM}
                height={p.depthM}
                fill="none"
                stroke={INK}
                strokeWidth={LINE_WEIGHT_M.secondary}
              />
            )}
            <text
              x={p.xM + p.widthM / 2}
              y={p.yM + p.depthM / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize}
              fill={isVoid ? INK_SOFT : INK}
            >
              {p.fill.label}
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
      {upperGaps.map((p) => (
        <rect
          key={cellKey({ col: p.colStart, band: p.bandStart })}
          x={p.xM}
          y={p.yM}
          width={p.widthM}
          height={p.depthM}
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
          {Array.from({ length: board.colCount }).map((_, col) => (
            <DimensionLine
              key={col}
              x1={bounds.x + col * board.colWidthM}
              y1={bounds.y - 0.35}
              x2={bounds.x + (col + 1) * board.colWidthM}
              y2={bounds.y - 0.35}
              label={`${board.colWidthM.toFixed(2)} m`}
            />
          ))}
          {board.bandDepthsM.map((depthM, band) => (
            <DimensionLine
              key={band}
              x1={bounds.x - 0.5}
              y1={board.originM.y + bandOffsetM(board, band)}
              x2={bounds.x - 0.5}
              y2={board.originM.y + bandOffsetM(board, band + 1)}
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
