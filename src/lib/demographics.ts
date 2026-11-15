/**
 * National (United States) profile shared by the home page and the state/county
 * comparisons, plus the site-wide color map and a few formatting helpers.
 */

export type NationalProfile = {
  /** Non-Hispanic White share, % (Census, 2023) */
  native: number
  /** Foreign-born share, % (Census ACS 2023 1-year) */
  foreignBorn: number
  /** Christian affiliation, % (Pew Religious Landscape Study 2023–24) */
  catholic: number
  protestant: number
  orthodox: number
  /** Median age of the non-Hispanic White population, years (Census) */
  medianAge: number
  /**
   * Share of 30-year-olds who are married with spouse present and own their home
   * ("Fishback benchmark"; ACS 1-year cross-tabulations by age, marital status, and tenure).
   */
  thirtyMarriedHomeowner: number
  /**
   * Share of total household net wealth held by people aged 30 and under
   * (Federal Reserve Distributional Financial Accounts, under-35 share scaled to under-30).
   */
  wealthShareUnder30: number
}

export const US: NationalProfile = {
  native: 58,
  foreignBorn: 14.3,
  catholic: 19,
  protestant: 40,
  orthodox: 1,
  medianAge: 44.2,
  thirtyMarriedHomeowner: 28,
  wealthShareUnder30: 5,
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Linear position of `value` within [min, max], clamped to [0, 1] */
export function rangeIntensity(value: number, min: number, max: number): number {
  if (max <= min) return 1
  return Math.min(1, Math.max(0, (value - min) / (max - min)))
}

export function formatMedianAge(years: number): string {
  return Number.isInteger(years) ? `${years}` : years.toFixed(1)
}

export type NativeSharePoint = {
  year: number
  /** Non-Hispanic White share, % */
  native: number
}

/** US non-Hispanic White share over time (Census); ends at `US.native`. */
export const usNativeShareHistory: NativeSharePoint[] = [
    { year: 1960, native: 85 },
    { year: 1970, native: 83 },
    { year: 1980, native: 80 },
    { year: 1990, native: 76 },
    { year: 2000, native: 69 },
    { year: 2010, native: 64 },
    { year: 2020, native: 58 },
    { year: 2025, native: 58 },
]

/**
 * Presidential popular vote by party. The field names are shared with the generated
 * `src/data/states.json`: Democratic is `leftOfCenter`, Republican is `rightOfCenter`, and the
 * wing bands are always 0.
 */
export type PoliticalLeanPoint = {
  year: number
  leftWing: number
  leftOfCenter: number
  rightOfCenter: number
  rightWing: number
}

/** US presidential popular vote, 1960–2024 */
export const usPoliticalLeanHistory: PoliticalLeanPoint[] = [
    { year: 1960, leftWing: 0, leftOfCenter: 50, rightOfCenter: 50, rightWing: 0 },
    { year: 1970, leftWing: 0, leftOfCenter: 43, rightOfCenter: 43, rightWing: 0 },
    { year: 1980, leftWing: 0, leftOfCenter: 41, rightOfCenter: 51, rightWing: 0 },
    { year: 1990, leftWing: 0, leftOfCenter: 46, rightOfCenter: 53, rightWing: 0 },
    { year: 2000, leftWing: 0, leftOfCenter: 48, rightOfCenter: 48, rightWing: 0 },
    { year: 2010, leftWing: 0, leftOfCenter: 53, rightOfCenter: 46, rightWing: 0 },
    { year: 2020, leftWing: 0, leftOfCenter: 51, rightOfCenter: 47, rightWing: 0 },
    { year: 2025, leftWing: 0, leftOfCenter: 48, rightOfCenter: 50, rightWing: 0 },
]

/** Topic colors for figures and swatches; CSS tokens defined in globals.css */
export const COLORS = {
  native: "var(--topic-native)",
  catholic: "var(--religion-catholic)",
  protestant: "var(--religion-evangelical)",
  orthodox: "var(--religion-orthodox)",
  anti: "var(--topic-sentiment)",
  enforcement: "var(--topic-enforcement)",
  medianAge: "var(--topic-age)",
  leftWing: "var(--party-dem)",
  leftOfCenter: "var(--party-dem)",
  rightOfCenter: "var(--party-rep)",
  rightWing: "var(--party-rep)",
  thirtyMarriedHomeowner: "var(--topic-family)",
  wealthShareUnder30: "var(--topic-wealth)",
  costOfLiving: "var(--topic-cost)",
} as const
