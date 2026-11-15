import data from "@/data/midterms-2026.json"

/** D includes Minnesota's DFL; I is an independent */
export type MidtermParty = "D" | "R" | "I" | "O"

export type SenateCandidate = {
  name: string
  party: MidtermParty
  votes: number | null
  /** % of the vote; null while the race has no reported count */
  pct: number | null
}

export type SenateRace = {
  status: "called" | "uncalled"
  /** A special election for the rest of a term */
  special: boolean
  /** Ordered by vote share once counted */
  candidates: SenateCandidate[]
}

export type HouseDelegation = {
  seats: number
  dem: number
  rep: number
  other: number
  uncalled: number
}

export type HouseDistrictResult = {
  /** Winning party; null while uncalled */
  party: MidtermParty | null
  winner: string | null
  /** The winner's party differs from the incumbent's */
  flip: boolean
  /** Party of the member who held the seat (or the incumbent it was redistricted from) */
  incumbentParty: "D" | "R" | null
  /** The two candidates in a pending runoff (Louisiana); empty otherwise */
  runoff: { name: string; party: MidtermParty }[]
}

type MidtermsFile = {
  asOf: string
  sources: { senate: string; house: string }
  senate: Record<string, SenateRace>
  house: Record<string, HouseDelegation>
  /** Keyed by Census district GEOID: state FIPS + 2-digit district, "00" at-large */
  districts: Record<string, HouseDistrictResult>
}

/** From scripts/build-midterms-2026.py; provisional until states certify */
export const midterms2026 = data as MidtermsFile

/** e.g. "November 14, 2026" */
export const MIDTERMS_AS_OF = new Date(`${midterms2026.asOf}T12:00:00`).toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
})

export const PARTY_LETTER: Record<MidtermParty, string> = { D: "D", R: "R", I: "I", O: "Other" }

/**
 * Republican share minus the leading non-Republican's share, in points: positive is a Republican
 * win. The leading opponent is usually the Democrat, but in states where an independent was the
 * main challenger (e.g. Nebraska, Idaho) it is that independent. Null while uncounted.
 */
export function senateMargin(race: SenateRace): number | null {
  const counted = race.candidates.filter((c) => c.pct != null)
  const rep = counted.find((c) => c.party === "R")
  const opp = counted.find((c) => c.party !== "R")
  if (!rep || !opp || race.status === "uncalled") return null
  return rep.pct! - opp.pct!
}

/** Winner first, e.g. "Colom (D) +0.5 (49.2% – 48.7%)"; "Uncalled" while counting */
export function formatSenateRace(race: SenateRace): string {
  const [first, second] = race.candidates
  if (race.status === "uncalled" || first?.pct == null || second?.pct == null) {
    return `Uncalled: ${race.candidates.map(candidateLabel).join(" vs. ")}`
  }
  return `${candidateLabel(first)} +${(first.pct - second.pct).toFixed(1)} (${first.pct.toFixed(1)}% – ${second.pct.toFixed(1)}%)`
}

/** States whose leading Senate challenger to the Republican was an independent */
export const SENATE_INDEPENDENT_CHALLENGE = Object.entries(midterms2026.senate)
  .filter(([, race]) => race.candidates.find((c) => c.party !== "R")?.party === "I")
  .map(([abbr]) => abbr)

function candidateLabel(c: SenateCandidate): string {
  const last = c.name.split(" ").at(-1)
  return `${last} (${PARTY_LETTER[c.party]})`
}

/** Republican share of the delegation's called seats, 0..1; null when none are called */
export function houseRepShare(d: HouseDelegation): number | null {
  const called = d.dem + d.rep + d.other
  return called ? d.rep / called : null
}

/** e.g. "D 48 · R 4" or "D 4 · R 3 · 1 uncalled" */
export function formatHouseDelegation(d: HouseDelegation): string {
  const parts = [`D ${d.dem}`, `R ${d.rep}`]
  if (d.other) parts.push(`other ${d.other}`)
  if (d.uncalled) parts.push(d.uncalled === d.seats ? "uncalled" : `${d.uncalled} uncalled`)
  return d.uncalled === d.seats ? "Uncalled" : parts.join(" · ")
}
