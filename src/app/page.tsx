import type { Metadata } from "next"
import Link from "next/link"

import { ChartCard } from "@/components/layout/chart-card"
import { SectionHeading } from "@/components/layout/section"
import { SourceNote } from "@/components/layout/source-note"
import { StatTile } from "@/components/layout/stat-tile"
import { LeaderboardCard, type Leaderboard } from "@/components/leaderboard-card"
import { NativeShareTrendChart } from "@/components/native-share-trend-chart"
import { PlaceSearch } from "@/components/place-search"
import { PoliticalLeanTrendChart } from "@/components/political-lean-trend-chart"
import { PageHeader } from "@/components/topic-page"
import { UsCountyMap } from "@/components/us-county-map"
import { UsMap } from "@/components/us-map"
import { formatRatio } from "@/lib/cost-of-living"
import { COUNTY_HISTORY_YEARS } from "@/lib/county-history"
import { COLORS, US, usNativeShareHistory, usPoliticalLeanHistory } from "@/lib/demographics"
import { queryValue } from "@/lib/map-view"
import { usCountyMapData } from "@/lib/state-data"
import {
  election2024Margin,
  ENFORCEMENT_TIER_LABELS,
  maxStateEnforcementScore,
  maxStateNative,
  maxStateThirtyMarriedHomeowner,
  minStateEnforcementScore,
  rangeIntensity,
  stateMapData,
  stateNavByAbbr,
  statePriceToIncome,
  type StateMapMetrics,
} from "@/lib/states"

export const metadata: Metadata = {
  title: { absolute: "afmetrics.com — America by the numbers" },
}

const LEADERBOARD_SIZE = 10

function stateHref(s: StateMapMetrics): string {
  return `/united-states/${stateNavByAbbr[s.abbr].slug}`
}

function top(compare: (a: StateMapMetrics, b: StateMapMetrics) => number): StateMapMetrics[] {
  return [...stateMapData].sort(compare).slice(0, LEADERBOARD_SIZE)
}

const maxTrumpMargin = Math.max(...stateMapData.map(election2024Margin))
const maxPriceToIncome = Math.max(...stateMapData.map(statePriceToIncome))

const leaderboards: Leaderboard[] = [
  {
    id: "native",
    label: "Non-Hispanic White",
    title: "Highest non-Hispanic White share",
    valueLabel: "Share",
    color: COLORS.native,
    rows: top((a, b) => b.native - a.native).map((s) => ({
      name: s.state,
      href: stateHref(s),
      value: `${s.native}%`,
      intensity: s.native / maxStateNative,
    })),
  },
  {
    id: "enforcement",
    label: "ICE cooperation",
    title: "Most ICE cooperation",
    valueLabel: "Tier",
    color: COLORS.enforcement,
    rows: top((a, b) => a.enforcementScore - b.enforcementScore).map((s) => ({
      name: s.state,
      href: stateHref(s),
      value: ENFORCEMENT_TIER_LABELS[s.enforcementTier],
      intensity:
        1 - rangeIntensity(s.enforcementScore, minStateEnforcementScore, maxStateEnforcementScore),
    })),
  },
  {
    id: "trump",
    label: "Trump margin",
    title: "Largest Trump margin, 2024",
    valueLabel: "Margin",
    color: COLORS.rightWing,
    rows: top((a, b) => election2024Margin(b) - election2024Margin(a)).map((s) => ({
      name: s.state,
      href: stateHref(s),
      value: `R+${election2024Margin(s).toFixed(1)}`,
      intensity: election2024Margin(s) / maxTrumpMargin,
    })),
  },
  {
    id: "family",
    label: "Married homeowners at 30",
    title: "Most married homeowners at 30",
    valueLabel: "Share",
    color: COLORS.thirtyMarriedHomeowner,
    rows: top((a, b) => b.thirtyMarriedHomeowner - a.thirtyMarriedHomeowner).map((s) => ({
      name: s.state,
      href: stateHref(s),
      value: `${s.thirtyMarriedHomeowner}%`,
      intensity: s.thirtyMarriedHomeowner / maxStateThirtyMarriedHomeowner,
    })),
  },
  {
    id: "affordable",
    label: "Most affordable",
    title: "Most affordable homes",
    valueLabel: "Price ÷ income",
    color: COLORS.costOfLiving,
    rows: top((a, b) => statePriceToIncome(a) - statePriceToIncome(b)).map((s) => ({
      name: s.state,
      href: stateHref(s),
      value: formatRatio(statePriceToIncome(s)),
      intensity: statePriceToIncome(s) / maxPriceToIncome,
    })),
  },
  {
    id: "expensive",
    label: "Least affordable",
    title: "Least affordable homes",
    valueLabel: "Price ÷ income",
    color: COLORS.costOfLiving,
    rows: top((a, b) => statePriceToIncome(b) - statePriceToIncome(a)).map((s) => ({
      name: s.state,
      href: stateHref(s),
      value: formatRatio(statePriceToIncome(s)),
      intensity: statePriceToIncome(s) / maxPriceToIncome,
    })),
  },
]

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[]; level?: string | string[] }>
}) {
  const query = await searchParams
  const countyMapData = usCountyMapData()

  const latestNative = usNativeShareHistory[usNativeShareHistory.length - 1]
  const firstNative = usNativeShareHistory[0]
  // The last row is the 2024 election (the series keys it as 2025, its snapshot year)
  const latestVote = usPoliticalLeanHistory[usPoliticalLeanHistory.length - 1]

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 pt-6 pb-10 sm:px-6">
      <PageHeader
        title="America by the numbers"
        description="Who lives where, what they believe, how they vote, what it costs to live there, and whether young Americans can still marry and buy a home — for every state and county."
      >
        <PlaceSearch className="mt-5 max-w-md" />
      </PageHeader>

      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Non-Hispanic White"
          value={`${latestNative.native}%`}
          note={`${firstNative.native}% in ${firstNative.year}`}
          color={COLORS.native}
        />
        <StatTile label="Foreign-born" value={`${US.foreignBorn}%`} note="ACS 2023 1-year" />
        <StatTile
          label="Married homeowners at 30"
          value={`${US.thirtyMarriedHomeowner}%`}
          note="Share of 30-year-olds"
          color={COLORS.thirtyMarriedHomeowner}
        />
        <StatTile
          label="Popular vote, 2024"
          value={`R ${latestVote.rightOfCenter}% · D ${latestVote.leftOfCenter}%`}
          note="Presidential, nationwide"
          color={COLORS.rightOfCenter}
        />
      </div>

      <UsMap
        countyMap={<UsCountyMap {...countyMapData} years={COUNTY_HISTORY_YEARS} />}
        electionCounties={countyMapData}
        viewQuery={queryValue(query.view)}
        levelQuery={queryValue(query.level)}
      />

      <SectionHeading
        id="leaderboards"
        title="Leaderboards"
        description={
          <>
            The top {LEADERBOARD_SIZE} states on each measure.{" "}
            <Link href="/states" className="underline-offset-2 hover:underline">
              Compare all states →
            </Link>
          </>
        }
      />
      <LeaderboardCard boards={leaderboards} />

      <SectionHeading
        id="trends"
        title="Trends"
        description="Non-Hispanic White share of the population and the presidential popular vote since 1960."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Non-Hispanic White share"
          description="Census, 1960 to 2025"
          legend={[{ color: COLORS.native, label: "Non-Hispanic White share" }]}
          csv={{
            rows: usNativeShareHistory.map((p) => ({
              year: p.year,
              non_hispanic_white_pct: p.native,
            })),
          }}
        >
          <NativeShareTrendChart />
        </ChartCard>
        <ChartCard
          title="Presidential popular vote"
          description="Democratic vs. Republican, 1960 to 2024"
          legend={[
            { color: COLORS.leftOfCenter, label: "Democratic" },
            { color: COLORS.rightOfCenter, label: "Republican" },
          ]}
          csv={{
            rows: usPoliticalLeanHistory.map((p) => ({
              year: p.year,
              democratic_pct: p.leftOfCenter,
              republican_pct: p.rightOfCenter,
            })),
          }}
        >
          <PoliticalLeanTrendChart />
        </ChartCard>
      </div>

      <SourceNote
        datasets={[
          "state-demographics",
          "state-religion",
          "enforcement",
          "family-formation",
          "cost-of-living",
          "state-election",
          "midterms-2026",
        ]}
      >
        Non-Hispanic White is 2023 nationally and Vintage 2025 less Arab ancestry by state. Home
        affordability is median home value over median household income. Values are rounded.{" "}
        <Link href="/methodology" className="underline underline-offset-2">
          Methodology and downloads
        </Link>
      </SourceNote>
    </main>
  )
}
