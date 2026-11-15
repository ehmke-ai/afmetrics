import { NEUTRAL_DEEP, PARTY } from "@/lib/palette"

/** The map colors and shading helpers every US map (counties or states) draws with */

/** The base every choropleth shades up from (`--map-base` in globals.css) */
export const MAP_BASE = "var(--map-base)"

/**
 * The map colors are white and red. Maps of one number shade white to red; two-sided maps put
 * red on one side and gray on the other, each fading to white in the middle. Election and
 * immigration maps are the exception: Democratic blue and Republican red, purple in the middle.
 * Economic maps (cost of living, wealth, homeownership) run green on the good side and red on
 * the bad side, each fading to white in the middle.
 */
export const MAP_RED = "#cb1414"
export const MAP_GRAY = NEUTRAL_DEEP.light
export const MAP_WHITE = "#ffffff"
export const MAP_GREEN = "#1a9641"
export const DEM_BLUE = PARTY.dem.light
export const REP_RED = MAP_RED
export const MID_PURPLE = "#7b4fb4"

/** Hover and selection outlines on the light map shapes */
export const MAP_FOCUS = "var(--primary)"
export const MAP_HOVER = "color-mix(in oklch, var(--primary) 65%, var(--map-base))"

/** State labels: ink with a white halo, legible on pale and deep shades alike */
export const MAP_LABEL_INK = "#101010"
export const MAP_LABEL_HALO = "var(--map-base)"

/** Counties and states without a figure: a flat warm gray, lighter than any faint shade */
export const NO_DATA_FILL = "var(--map-nodata)"

/** A choropleth shade: `pct` percent of `color`, the rest `base` (the map base by default) */
export function shade(color: string, pct: number, base = MAP_BASE) {
  return `color-mix(in oklch, ${color} ${pct}%, ${base})`
}

/** The palest to deepest shades a map uses, for legend bars */
export const SHADE_RANGE = [15, 100] as const

export function shadeGradient(color: string) {
  return `linear-gradient(in oklch to right, ${shade(color, SHADE_RANGE[0])}, ${shade(color, SHADE_RANGE[1])})`
}

/** Low (blue: pro-immigration) end of the immigration scales, which meet in purple */
export const PRO_IMMIG_COLOR = DEM_BLUE

/** High (red: anti-immigration) end of the immigration scales */
export const ANTI_IMMIG_COLOR = REP_RED

/**
 * A two-sided shade for `t` in 0..1: `lowColor` deepest at 0, neutral at 0.5, `highColor`
 * deepest at 1. Each side fades toward `base` (the map base by default).
 */
export function divergingShade(
  lowColor: string,
  highColor: string,
  t: number,
  boost = 0,
  base = MAP_BASE
) {
  const side = t < 0.5 ? lowColor : highColor
  const pct = Math.round(Math.abs(t - 0.5) * 2 * 100)
  return shade(side, Math.min(100, pct + boost), base)
}

export function divergingGradient(lowColor: string, highColor: string, base = MAP_BASE) {
  return `linear-gradient(in oklch to right, ${[0, 0.25, 0.5, 0.75, 1].map((t) => divergingShade(lowColor, highColor, t, 0, base)).join(", ")})`
}

/** Good end of the economic scales (affordable, wealthier) */
export const ECON_GOOD_COLOR = MAP_GREEN

/** Bad end of the economic scales (expensive, poorer) */
export const ECON_BAD_COLOR = MAP_RED
