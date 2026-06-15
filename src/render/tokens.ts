// Shared drawing tokens, in metres — the same units as the model. The SVG
// viewBox is set directly in metres, so these values ARE the line weights
// and font sizes on screen; there is no separate pixel conversion.
export const MARGIN_M = 2.5

export const LINE_WEIGHT_M = {
  cut: 0.06, // structure / cut lines
  secondary: 0.03, // internal divisions, spine
  hairline: 0.015, // setbacks, site boundary, scale bar
}

export const FONT_SIZE_M = {
  label: 0.34,
  small: 0.26,
  note: 0.3,
}

export const INK = '#2b2825'
export const INK_SOFT = '#9c958c'
