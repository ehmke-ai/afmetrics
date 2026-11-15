/**
 * Data colors, as hex. This is the one place a data color is defined.
 *
 * `src/app/globals.css` mirrors these as CSS tokens (`--chart-1..8`, `--party-*`, `--cost-*`,
 * `--visa-*`, `--religion-*`) so components and Tailwind use `var(--token)`; `palette.test.ts`
 * fails if the two drift. Hex stays here for what can't take a CSS variable: the color pickers'
 * starting values (react-colorful works in hex) and the PNG/PDF exports' fallbacks.
 *
 * The categorical set is the dataviz reference palette, validated with its
 * `validate_palette.js` against this site's surfaces (light #fbfaf7, dark #12151a): every
 * adjacent pair clears the colorblind (ΔE ≥ 8) and normal-vision (ΔE ≥ 15) floors in both
 * modes. In light mode aqua, yellow, and magenta sit under 3:1 against the page, so those
 * series always ship with a legend, tooltip, or table. Choropleths compare every pair, which
 * only the first three slots survive; maps with more categories lean on their legend and tooltip.
 */

export type ThemedColor = { light: string; dark: string }

/** Categorical slots, in fixed order: blue, orange, aqua, yellow, magenta, green, violet, red */
export const CATEGORICAL: ThemedColor[] = [
  { light: "#2a78d6", dark: "#3987e5" },
  { light: "#eb6834", dark: "#d95926" },
  { light: "#1baf7a", dark: "#199e70" },
  { light: "#eda100", dark: "#c98500" },
  { light: "#e87ba4", dark: "#d55181" },
  { light: "#008300", dark: "#0ca30c" },
  { light: "#6250d6", dark: "#9085e9" },
  { light: "#e34948", dark: "#e66767" },
]

const [blue, orange, aqua, yellow, magenta, green, violet, red] = CATEGORICAL

/** Muted neutrals for "other" and "none" categories */
export const NEUTRAL: ThemedColor = { light: "#898781", dark: "#898781" }
export const NEUTRAL_DEEP: ThemedColor = { light: "#52514e", dark: "#c3c2b7" }

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

/** Single-hue sequential ramp (blue), lightest to darkest; for magnitude */
export const SEQUENTIAL = [
  "#cde2fb",
  "#9ec5f4",
  "#6da7ec",
  "#3987e5",
  "#256abf",
  "#184f95",
  "#0d366b",
]
