import type { SourceBundle, SourceRecord } from "@/lib/source-registry"

/** Re-checked against CIRCLE hub 2026-11-08 (America/Chicago). */
export const MIDTERMS_HOUSE_CHECKED_DATE = "2026-11-08"

/** Explicit NORC timestamp stated only in CIRCLE’s “The Youth Shifts…” section. */
export const YOUTH_SHIFTS_NORC_SNAPSHOT =
  "November 6, 2026, 9 a.m. ET (NORC Civic Health & Elections Project — CIRCLE “The Youth Shifts…” section)"

const CIRCLE_HUB = "https://circle.tufts.edu/2026-election"

const AP_VOTECAST_CONTEXT =
  "2024 presidential comparisons on the hub cite AP VoteCast (conducted by NORC for the Associated Press) — not the 2026 House NORC series."

type HouseRecord = Omit<SourceRecord, "id" | "checkedDate" | "primaryUrl" | "releaseDate"> & {
  releaseDate?: string | null
}

function houseRecord(id: string, fields: HouseRecord): SourceRecord {
  return {
    id,
    checkedDate: MIDTERMS_HOUSE_CHECKED_DATE,
    primaryUrl: CIRCLE_HUB,
    releaseDate: fields.releaseDate ?? null,
    ...fields,
  }
}

/** House vote-choice rows published on the CIRCLE 2026 hub from NORC data. */
const voteChoiceRecords: SourceRecord[] = [
  houseRecord("midterms-2026-house-youth-national", {
    claim: "66% of voters ages 18–29 chose a Democratic U.S. House candidate; 31% Republican",
    measure: "vote_choice",
    population: "Voters ages 18–29 who cast a ballot",
    geography: "United States (national)",
    office: "U.S. House of Representatives",
    dataPeriod: "2026 general election",
    hubSection: "Historic youth House vote choice for Democrats",
    dataSnapshotDate: null,
    provisional: "preliminary",
    upstreamNotes: `CIRCLE analysis of NORC Civic Health & Elections Project. ${AP_VOTECAST_CONTEXT}`,
    democraticPct: 66,
    republicanPct: 31,
    marginDemMinusRep: 35,
  }),
  houseRecord("midterms-2026-house-age-30-44-dem", {
    claim: "56% of voters ages 30–44 chose a Democratic House candidate",
    measure: "vote_choice",
    population: "Voters ages 30–44",
    geography: "United States (national)",
    office: "U.S. House of Representatives",
    dataPeriod: "2026 general election",
    hubSection: "Youth support vs. older age groups",
    dataSnapshotDate: null,
    provisional: "preliminary",
    upstreamNotes: "Republican House share not stated separately on the checked hub passage.",
    democraticPct: 56,
    republicanPct: null,
    marginDemMinusRep: null,
  }),
  houseRecord("midterms-2026-house-age-45-64", {
    claim: "51% Democratic / 46% Republican House vote among voters ages 45–64",
    measure: "vote_choice",
    population: "Voters ages 45–64",
    geography: "United States (national)",
    office: "U.S. House of Representatives",
    dataPeriod: "2026 general election",
    hubSection: "Youth support vs. older age groups",
    dataSnapshotDate: null,
    provisional: "preliminary",
    upstreamNotes: "CIRCLE analysis of NORC.",
    democraticPct: 51,
    republicanPct: 46,
    marginDemMinusRep: 5,
  }),
  houseRecord("midterms-2026-house-age-65-plus", {
    claim: "53% Democratic / 46% Republican House vote among voters ages 65+",
    measure: "vote_choice",
    population: "Voters ages 65 and older",
    geography: "United States (national)",
    office: "U.S. House of Representatives",
    dataPeriod: "2026 general election",
    hubSection: "Youth support vs. older age groups",
    dataSnapshotDate: null,
    provisional: "preliminary",
    upstreamNotes: "CIRCLE analysis of NORC.",
    democraticPct: 53,
    republicanPct: 46,
    marginDemMinusRep: 7,
  }),
  houseRecord("midterms-2026-house-youth-women", {
    claim: "70% of women ages 18–29 chose a Democratic House candidate",
    measure: "vote_choice",
    population: "Female voters ages 18–29",
    geography: "United States (national)",
    office: "U.S. House of Representatives",
    dataPeriod: "2026 general election",
    hubSection: "In a shift from 2024, young men and white youth vote Democratic",
    dataSnapshotDate: null,
    provisional: "preliminary",
    upstreamNotes: "Republican share not stated separately on the checked hub passage.",
    democraticPct: 70,
    republicanPct: null,
    marginDemMinusRep: null,
  }),
  houseRecord("midterms-2026-house-youth-men", {
    claim: "59% of men ages 18–29 chose a Democratic House candidate; 37% Republican",
    measure: "vote_choice",
    population: "Male voters ages 18–29 (not all men under 30)",
    geography: "United States (national)",
    office: "U.S. House of Representatives",
    dataPeriod: "2026 general election",
    hubSection: "The Youth Shifts — Young men swing back toward Democrats",
    dataSnapshotDate: YOUTH_SHIFTS_NORC_SNAPSHOT,
    provisional: "preliminary",
    upstreamNotes: `CIRCLE analysis of NORC under Youth Shifts (explicit snapshot). ${AP_VOTECAST_CONTEXT}`,
    democraticPct: 59,
    republicanPct: 37,
    marginDemMinusRep: 22,
  }),
  houseRecord("midterms-2026-house-youth-aapi", {
    claim: "81% of AAPI youth chose a Democratic House candidate",
    measure: "vote_choice",
    population: "AAPI voters ages 18–29",
    geography: "United States (national)",
    office: "U.S. House of Representatives",
    dataPeriod: "2026 general election",
    hubSection: "In a shift from 2024, young men and white youth vote Democratic",
    dataSnapshotDate: null,
    provisional: "preliminary",
    upstreamNotes: "Republican share not stated separately on the checked hub passage.",
    democraticPct: 81,
    republicanPct: null,
    marginDemMinusRep: null,
  }),
  houseRecord("midterms-2026-house-youth-black", {
    claim: "79% of Black youth chose a Democratic House candidate",
    measure: "vote_choice",
    population: "Black voters ages 18–29",
    geography: "United States (national)",
    office: "U.S. House of Representatives",
    dataPeriod: "2026 general election",
    hubSection: "In a shift from 2024, young men and white youth vote Democratic",
    dataSnapshotDate: null,
    provisional: "preliminary",
    upstreamNotes: "Republican share not stated separately on the checked hub passage.",
    democraticPct: 79,
    republicanPct: null,
    marginDemMinusRep: null,
  }),
  houseRecord("midterms-2026-house-youth-latino", {
    claim: "71% of Latino youth chose a Democratic House candidate",
    measure: "vote_choice",
    population: "Latino voters ages 18–29",
    geography: "United States (national)",
    office: "U.S. House of Representatives",
    dataPeriod: "2026 general election",
    hubSection: "In a shift from 2024, young men and white youth vote Democratic",
    dataSnapshotDate: null,
    provisional: "preliminary",
    upstreamNotes: "Republican share not stated separately on the checked hub passage.",
    democraticPct: 71,
    republicanPct: null,
    marginDemMinusRep: null,
  }),
  houseRecord("midterms-2026-house-youth-white", {
    claim: "61% of white youth chose a Democratic House candidate; 36% Republican",
    measure: "vote_choice",
    population: "White voters ages 18–29",
    geography: "United States (national)",
    office: "U.S. House of Representatives",
    dataPeriod: "2026 general election",
    hubSection: "In a shift from 2024, young men and white youth vote Democratic",
    dataSnapshotDate: null,
    provisional: "preliminary",
    upstreamNotes: "CIRCLE analysis of NORC.",
    democraticPct: 61,
    republicanPct: 36,
    marginDemMinusRep: 25,
  }),
  houseRecord("midterms-2026-house-youth-white-men", {
    claim: "54% of white men ages 18–29 chose a Democratic House candidate; 43% Republican",
    measure: "vote_choice",
    population: "White male voters ages 18–29",
    geography: "United States (national)",
    office: "U.S. House of Representatives",
    dataPeriod: "2026 general election",
    hubSection: "The Youth Shifts — Young men swing back toward Democrats",
    dataSnapshotDate: YOUTH_SHIFTS_NORC_SNAPSHOT,
    provisional: "preliminary",
    upstreamNotes: `Race × gender; Youth Shifts section with explicit NORC snapshot. ${AP_VOTECAST_CONTEXT}`,
    democraticPct: 54,
    republicanPct: 43,
    marginDemMinusRep: 11,
  }),
  houseRecord("midterms-2026-house-youth-latino-men", {
    claim: "65% of Latino men ages 18–29 chose a Democratic House candidate; 28% Republican",
    measure: "vote_choice",
    population: "Latino male voters ages 18–29",
    geography: "United States (national)",
    office: "U.S. House of Representatives",
    dataPeriod: "2026 general election",
    hubSection: "The Youth Shifts — Young men swing back toward Democrats",
    dataSnapshotDate: YOUTH_SHIFTS_NORC_SNAPSHOT,
    provisional: "preliminary",
    upstreamNotes: "Race × gender; Youth Shifts section with explicit NORC snapshot.",
    democraticPct: 65,
    republicanPct: 28,
    marginDemMinusRep: 37,
  }),
  houseRecord("midterms-2026-house-youth-straight", {
    claim: "57% of straight youth chose Democratic House candidates; 39% Republican",
    measure: "vote_choice",
    population: "Straight-identified voters ages 18–29",
    geography: "United States (national)",
    office: "U.S. House of Representatives",
    dataPeriod: "2026 general election",
    hubSection: "In a shift from 2024, young men and white youth vote Democratic",
    dataSnapshotDate: null,
    provisional: "preliminary",
    upstreamNotes: "Sexual orientation breakdown on hub.",
    democraticPct: 57,
    republicanPct: 39,
    marginDemMinusRep: 18,
  }),
  houseRecord("midterms-2026-house-youth-share", {
    claim: "11% of all 2026 midterm votes were cast by voters ages 18–29",
    measure: "electorate_composition",
    population: "Share of all ballots cast",
    geography: "United States (national)",
    office: "2026 midterm electorate (all offices on ballot)",
    dataPeriod: "2026 general election",
    hubSection: "Historic youth House vote choice for Democrats",
    dataSnapshotDate: null,
    provisional: "preliminary",
    upstreamNotes: "Electorate composition, not turnout. Compared to 12% youth share in 2022 on hub.",
    democraticPct: null,
    republicanPct: null,
    marginDemMinusRep: null,
    qualitativeNote: "11% of all votes",
  }),
]

const turnoutRecords: SourceRecord[] = [
  houseRecord("midterms-2026-youth-turnout-estimate", {
    claim: "CIRCLE estimates 27% of young people (ages 18–29) voted in the 2026 midterms (±2 points)",
    measure: "turnout",
    population: "Young eligible voters ages 18–29",
    geography: "United States (national)",
    office: "Midterm electorate (turnout rate, not House vote choice)",
    dataPeriod: "2026 general election",
    hubSection: "Youth voter turnout estimate",
    dataSnapshotDate: "CIRCLE early estimate on hub; voter-file revision expected spring 2027",
    provisional: "estimate",
    upstreamNotes:
      "The Voter Poll by SSRS plus CIRCLE population modeling — not the NORC House vote-choice series.",
    democraticPct: null,
    republicanPct: null,
    marginDemMinusRep: null,
    qualitativeNote: "27% (range 25–29%)",
  }),
  houseRecord("midterms-2026-youth-turnout-battleground", {
    claim: "Estimated 30% youth turnout in aggregate across listed 2026 battleground states (±3 points)",
    measure: "turnout",
    population: "Young eligible voters in FL, GA, IA, ME, MI, MN, NC, NE, NH, NV, OH, PA, TX, WI",
    geography: "Battleground states (CIRCLE definition)",
    office: "Midterm electorate",
    dataPeriod: "2026 general election",
    hubSection: "Youth voter turnout estimate — battleground states",
    dataSnapshotDate: null,
    provisional: "estimate",
    upstreamNotes: "SSRS / CIRCLE turnout model; separate from NORC vote choice.",
    democraticPct: null,
    republicanPct: null,
    marginDemMinusRep: null,
    qualitativeNote: "30% (range 27–33%)",
  }),
]

export const midterms2026HouseBundle: SourceBundle = {
  id: "midterms-2026-house-norc-circle",
  label: "2026 U.S. House vote — CIRCLE / NORC (preliminary)",
  description:
    "Vote-choice and composition figures come from CIRCLE's analysis of the NORC Civic Health & Elections Project. Turnout estimates use CIRCLE modeling with SSRS's Voter Poll — a related but separate pipeline from the House vote-choice tables.",
  dependency:
    "House vote choice is CIRCLE's packaging of NORC Civic Health & Elections Project data. AP VoteCast (conducted by NORC for the Associated Press) appears only in CIRCLE's comparative prose about the 2024 presidential vote — not as a second independent 2026 House poll.",
  records: [...voteChoiceRecords, ...turnoutRecords],
}

export type DemographicsViewId = "age" | "gender" | "race" | "race_gender"

export const demographicsViews: {
  id: DemographicsViewId
  label: string
  description: string
  recordIds: string[]
}[] = [
  {
    id: "age",
    label: "Age",
    description: "House vote choice by voter age group (national).",
    recordIds: [
      "midterms-2026-house-youth-national",
      "midterms-2026-house-age-30-44-dem",
      "midterms-2026-house-age-45-64",
      "midterms-2026-house-age-65-plus",
    ],
  },
  {
    id: "gender",
    label: "Gender (ages 18–29)",
    description: "House vote choice among young women and young men who voted.",
    recordIds: ["midterms-2026-house-youth-women", "midterms-2026-house-youth-men"],
  },
  {
    id: "race",
    label: "Race / ethnicity (ages 18–29)",
    description: "House vote choice among youth by race/ethnicity where CIRCLE reports NORC splits.",
    recordIds: [
      "midterms-2026-house-youth-white",
      "midterms-2026-house-youth-black",
      "midterms-2026-house-youth-latino",
      "midterms-2026-house-youth-aapi",
    ],
  },
  {
    id: "race_gender",
    label: "Race × gender (ages 18–29)",
    description: "Only combinations with exact Democratic and Republican shares on the hub.",
    recordIds: [
      "midterms-2026-house-youth-white-men",
      "midterms-2026-house-youth-latino-men",
    ],
  },
]

export function recordById(id: string): SourceRecord | undefined {
  return midterms2026HouseBundle.records.find((r) => r.id === id)
}

export function recordsForView(viewId: DemographicsViewId): SourceRecord[] {
  const view = demographicsViews.find((v) => v.id === viewId)
  if (!view) return []
  return view.recordIds
    .map((id) => recordById(id))
    .filter((r): r is SourceRecord => Boolean(r))
}

export function chartableVoteChoiceRecords(records: SourceRecord[]): SourceRecord[] {
  return records.filter((r) => r.measure === "vote_choice" && r.democraticPct != null)
}

export function assertMidtermDataInvariants(): void {
  for (const r of midterms2026HouseBundle.records) {
    if (r.democraticPct != null && (r.democraticPct < 0 || r.democraticPct > 100)) {
      throw new Error(`Invalid democraticPct for ${r.id}`)
    }
    if (r.republicanPct != null && (r.republicanPct < 0 || r.republicanPct > 100)) {
      throw new Error(`Invalid republicanPct for ${r.id}`)
    }
    if (
      r.democraticPct != null &&
      r.republicanPct != null &&
      r.democraticPct + r.republicanPct > 102
    ) {
      throw new Error(`D+R exceeds 100 for ${r.id}`)
    }
  }
}

assertMidtermDataInvariants()

export const midtermsHouseChartColors = {
  democratic: "#2563eb",
  republican: "#dc2626",
}
