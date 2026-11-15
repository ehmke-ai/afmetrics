/**
 * Data colors, as hex. This is the one place a data color is defined.
 *
 * `src/app/globals.css` mirrors these as CSS tokens (`--chart-1..8`, `--party-*`, `--cost-*`,
 * `--visa-*`, `--religion-*`) so components and Tailwind use `var(--token)`; `palette.test.ts`
 * fails if the two drift. Hex stays here for what can't take a CSS variable: the maps' fixed
 * colors (mixed with `color-mix`) and the PDF exports.
 *
 * The site is always dark, so `dark` is the color people see; `light` is only the PDF print
 * palette. The dark set is tuned to the brand (black, bone, flag red) and validated with the
 * dataviz `validate_palette.js` against the card surface #111111: every slot sits in the dark
 * lightness band with 3:1 contrast, and adjacent pairs clear the colorblind (ΔE ≥ 8) and
 * normal-vision (ΔE ≥ 15) floors. Choropleths compare every pair, which the first three slots
 * survive (worst CVD ΔE 12.6); maps with more categories lean on their legend and tooltip.
 *
 * Maps always shade on a light base (`--map-base`, even in dark mode), so they use the `light`
 * set. Maps use fixed colors. There is no color picker.
 */

export type ThemedColor = { light: string; dark: string }

/** Categorical slots, in fixed order: blue, orange, aqua, gold, rose, green, violet, red */
export const CATEGORICAL: ThemedColor[] = [
  { light: "#2a78d6", dark: "#4a7fd4" },
  { light: "#eb6834", dark: "#d96a2b" },
  { light: "#1baf7a", dark: "#1fa088" },
  { light: "#eda100", dark: "#b98613" },
  { light: "#e87ba4", dark: "#d4669a" },
  { light: "#008300", dark: "#4f9d4a" },
  { light: "#6250d6", dark: "#8f80e0" },
  { light: "#e34948", dark: "#e3342f" },
]

const [blue, orange, aqua, yellow, magenta, green, violet, red] = CATEGORICAL

/** Muted neutrals for "other" and "none" categories */
export const NEUTRAL: ThemedColor = { light: "#898781", dark: "#7d7770" }
export const NEUTRAL_DEEP: ThemedColor = { light: "#52514e", dark: "#bdb5a8" }

/** Bone white, the brand's type color: the single hue for magnitude maps on the dark base */
export const BONE: ThemedColor = { light: "#8a7f6e", dark: "#e8dfcf" }

/** Diverging poles: blue ↔ red, the US party convention */
export const PARTY = { dem: blue, rep: red }

/** Cost of living: affordable (cool) ↔ expensive (warm) */
export const COST = { low: aqua, high: orange }

/** Work-visa programs; the first three slots, which stay distinct even all-pairs on a map */
export const VISA = { h1b: blue, h2a: aqua, h2b: orange }

/** Religious traditions on the county map, by data key */
export const RELIGION = {
  evangelical: blue,
  mainline: aqua,
  blackProtestant: violet,
  catholic: red,
  orthodox: yellow,
  lds: orange,
  jewish: magenta,
  muslim: green,
  other: NEUTRAL,
  unclaimed: NEUTRAL_DEEP,
} satisfies Record<string, ThemedColor>
