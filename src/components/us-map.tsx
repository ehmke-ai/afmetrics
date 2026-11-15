"use client"

import Link from "next/link"
import { useState, type ReactNode } from "react"

import { LevelToggle, OptionToggle } from "@/components/maps/legends"
import { UsStateMap, type MapMetric } from "@/components/maps/us-state-map"
import { Button } from "@/components/ui/button"
import { UsCountyCostMap } from "@/components/us-county-cost-map"
import { UsCountyElectionMap } from "@/components/us-county-election-map"
import { UsHouseDistrictMap } from "@/components/us-house-district-map"
import type { UsCountyRow } from "@/components/us-county-map"
import { UsCountyReligionMap } from "@/components/us-county-religion-map"
import { UsCountyVisaMap } from "@/components/us-county-visa-map"
import { mapLevel, nationalMapHref, nationalMapView, type MapLevel } from "@/lib/map-view"
import { MIDTERMS_AS_OF, SENATE_INDEPENDENT_CHALLENGE } from "@/lib/midterms-2026"
import { ELECTION_MARGIN_CAP, stateNavByAbbr } from "@/lib/states"

type MidtermView = "senate2026" | "house2026" | "house2026District"

const listFormat = new Intl.ListFormat("en-US", { style: "long", type: "conjunction" })

/**
 * `countyMap` replaces the state map while Demographics is selected (the county-level
 * UsCountyMap), the county-level UsCountyElectionMap while 2024 election is shown by county, and
 * UsCountyReligionMap while Religion is selected, and UsCountyVisaMap while Work visas is
 * selected. All stay mounted when hidden so they keep their state.
 */
export function UsMap({
  countyMap,
  electionCounties,
  viewQuery,
  levelQuery,
}: {
  countyMap: ReactNode
  /** County labels and state abbreviations for the county-level 2024 election and religion maps */
  electionCounties: { counties: UsCountyRow[]; states: Record<string, string> }
  /** `view` query, for example `fishback`. Omitted means Work visas. */
  viewQuery?: string
  /** `level` query. `state` shows the state map for Cost of living and 2024 election. */
  levelQuery?: string
}) {
  const level = mapLevel(levelQuery)
  const view = nationalMapView(viewQuery, levelQuery)
  // Which level the 2024 election and cost tabs show; remembered when switching away and back
  const [electionLevel, setElectionLevel] = useState<MapLevel>(
    view === "election2024" ? "state" : "county"
  )
  const [costLevel, setCostLevel] = useState<MapLevel>(view === "costOfLiving" ? "state" : "county")
  // Which 2026 race the midterms tab shows; remembered when switching away and back
  const [midtermRace, setMidtermRace] = useState<MidtermView>(
    view === "house2026" || view === "house2026District" ? view : "senate2026"
  )
  // Which level the House race shows; remembered when switching to the Senate and back
  const [houseLevel, setHouseLevel] = useState<"house2026" | "house2026District">(
    view === "house2026" ? "house2026" : "house2026District"
  )

  const [syncedView, setSyncedView] = useState({ view, level })
  if (syncedView.view !== view || syncedView.level !== level) {
    setSyncedView({ view, level })
    if (view === "election2024" || view === "election2024County") setElectionLevel(level)
    if (view === "costOfLiving" || view === "costCounty") setCostLevel(level)
    if (view === "senate2026" || view === "house2026" || view === "house2026District") {
      setMidtermRace(view)
    }
    if (view === "house2026" || view === "house2026District") setHouseLevel(view)
  }
  // County-only views hide the state map, so any state metric will do behind them
  const metric: MapMetric =
    view === "election2024County" ||
    view === "religion" ||
    view === "costCounty" ||
    view === "visas" ||
    view === "house2026District"
      ? "native"
      : view
  const electionActive = view === "election2024" || view === "election2024County"
  const costActive = view === "costOfLiving" || view === "costCounty"
  const midtermsActive = view === "senate2026" || view === "house2026" || view === "house2026District"

  const showCounties = view === "native"
  const showElection = view === "election2024County"
  const showReligion = view === "religion"
  const showCost = view === "costCounty"
  const showVisas = view === "visas"
  const showDistricts = view === "house2026District"
  // The district shapes are a large download, so mount that map the first time it's shown
  const [districtsMounted, setDistrictsMounted] = useState(showDistricts)
  if (showDistricts && !districtsMounted) setDistrictsMounted(true)
  const showStates =
    !showCounties && !showElection && !showReligion && !showCost && !showVisas && !showDistricts

  const electionLevelToggle = (
    <LevelToggle
      label="2024 election level"
      current={view === "election2024" ? "state" : "county"}
      hrefs={{ county: nationalMapHref("election2024County"), state: nationalMapHref("election2024") }}
    />
  )
  const costLevelToggle = (
    <LevelToggle
      label="Cost of living level"
      current={view === "costOfLiving" ? "state" : "county"}
      hrefs={{ county: nationalMapHref("costCounty"), state: nationalMapHref("costOfLiving") }}
    />
  )

  const midtermRaceToggle = (
    <OptionToggle
      prefix="Race"
      label="2026 midterm race"
      current={view === "senate2026" ? "senate2026" : "house"}
      options={[
        { key: "senate2026", label: "Senate", href: nationalMapHref("senate2026") },
        { key: "house", label: "House", href: nationalMapHref(houseLevel) },
      ]}
    />
  )
  const houseLevelToggle = (
    <OptionToggle
      prefix="Show by"
      label="2026 House level"
      current={view === "house2026" ? "house2026" : "house2026District"}
      options={[
        { key: "house2026District", label: "District", href: nationalMapHref("house2026District") },
        { key: "house2026", label: "State", href: nationalMapHref("house2026") },
      ]}
    />
  )

  return (
    <div className="space-y-4">
      {/* One scrolling row on phones, wrapping on wider screens */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {(
          [
            ["visas", "Work visas"],
            [costLevel === "county" ? "costCounty" : "costOfLiving", "Cost of living"],
            ["native", "Demographics"],
            [
              electionLevel === "county" ? "election2024County" : "election2024",
              "2024 election",
            ],
            [midtermRace, "2026 midterms"],
            ["religion", "Religion"],
            ["antiImmig", "Immigration sentiment"],
            ["enforcement", "Enforcement laws & ICE"],
            ["thirtyMarriedHomeowner", "Fishback benchmark"],
            ["wealthShareUnder30", "Wealth share (30 & under)"],
          ] as const
        ).map(([next, label]) => {
          const active =
            next === "visas"
              ? view === "visas"
              : next === "costCounty" || next === "costOfLiving"
                ? costActive
                : next === "election2024County" || next === "election2024"
                  ? electionActive
                  : next === "senate2026" || next === "house2026" || next === "house2026District"
                    ? midtermsActive
                    : view === next
          return (
            <Button key={label} asChild size="sm" className="shrink-0" variant={active ? "default" : "secondary"}>
              <Link href={nationalMapHref(next)} scroll={false} aria-pressed={active}>
                {label}
              </Link>
            </Button>
          )
        })}
      </div>

      <div className={showCounties ? undefined : "hidden"}>
        {/* Same columns as the state view, with an empty stand-in for the small-state list so
            the map renders at the same size in every view */}
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          {countyMap}
          <div className="hidden sm:block sm:w-32" aria-hidden />
        </div>
      </div>

      <div className={showElection ? undefined : "hidden"}>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <UsCountyElectionMap {...electionCounties} legendExtra={electionLevelToggle} />
          <div className="hidden sm:block sm:w-32" aria-hidden />
        </div>
      </div>

      <div className={showReligion ? undefined : "hidden"}>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <UsCountyReligionMap {...electionCounties} />
          <div className="hidden sm:block sm:w-32" aria-hidden />
        </div>
      </div>

      <div className={showCost ? undefined : "hidden"}>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <UsCountyCostMap {...electionCounties} legendExtra={costLevelToggle} />
          <div className="hidden sm:block sm:w-32" aria-hidden />
        </div>
      </div>

      <div className={showVisas ? undefined : "hidden"}>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <UsCountyVisaMap {...electionCounties} />
          <div className="hidden sm:block sm:w-32" aria-hidden />
        </div>
      </div>

      <div className={showDistricts ? undefined : "hidden"}>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          {districtsMounted && (
            <UsHouseDistrictMap
              states={electionCounties.states}
              legendExtra={
                <>
                  {midtermRaceToggle}
                  {houseLevelToggle}
                </>
              }
            />
          )}
          <div className="hidden sm:block sm:w-32" aria-hidden />
        </div>
      </div>

      <div className={showStates ? undefined : "hidden"}>
        <UsStateMap
          metric={metric}
          legendExtra={
            metric === "election2024"
              ? electionLevelToggle
              : metric === "costOfLiving"
                ? costLevelToggle
                : metric === "senate2026"
                  ? midtermRaceToggle
                  : metric === "house2026"
                    ? (
                        <>
                          {midtermRaceToggle}
                          {houseLevelToggle}
                        </>
                      )
                  : undefined
          }
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Anti-immigration sentiment: share saying newcomers from other countries threaten
        traditional American customs and values (PRRI 2015 American Values Atlas; DC not
        surveyed). Enforcement laws &amp; ICE: state legislation on ICE detainers, 287(g),
        information sharing, anti-sanctuary mandates, and state immigration crimes, averaged
        on ILRC&apos;s 1–5 scale (1 = most enforcement, 5 = most protective; ILRC State Map on
        Immigration Enforcement, July 2026). Cost of living: BEA Regional Price Parities for
        2024 (all goods and services, US = 100) by state; ACS 2020–2024 median household income,
        home value, and gross rent by county.
        Demographics: county shares of the same groups as the state ethnic chart — European
        (non-Hispanic White minus Arab ancestry), Hispanic, African (non-Hispanic Black), Indian,
        East Asian, Arab, Native American (non-Hispanic American Indian and Alaska Native), and
        Other (Census county estimates for 1990; decennial census and
        ancestry tables for 2000 and 2010; ACS 2016–2020 for 2020; Census Vintage 2025
        estimates with ACS 2020–2024 Asian-group and ancestry shares for 2025). The 1990 county data has no
        Indian, East Asian, or Arab figures (they are counted in Other and European that year),
        so a side made only of those groups shows no data for 1990. In 2025 Connecticut is
        shown by its nine planning regions, which replaced its counties in 2022 and are how the
        Census now reports it. Each
        county takes the color of whichever chosen side is largest, deeper the wider its lead
        over the next side. 30, married &amp; homeowner: among 30-year-olds, share who are married with
        spouse present and own their home, estimated from ACS 2024 1-year cross-tabulations by
        age, marital status, and tenure. DC is excluded from this map and its scale. Wealth share (30 &amp; under): estimated share of total
        household net wealth held by residents aged 30 and under, derived from the Fishback
        benchmark and Federal Reserve Distributional Financial Accounts under-35 wealth shares.
        DC is excluded from this map and its scale.
        2024 election (by state): statewide popular-vote shares for Donald Trump and Kamala
        Harris in the 2024 presidential general election (certified results; third-party votes
        make up the remainder). Margins of {ELECTION_MARGIN_CAP} points or more take the deepest
        shade. Maine and Nebraska split electoral votes by district; the map shows the statewide
        vote. State-level colors are scaled to the range across states.
        2026 midterms: provisional results of the November 3, 2026 general election as of{" "}
        {MIDTERMS_AS_OF} (AP race calls and state counts as compiled by Wikipedia); states certify
        through mid-December, and the counts will change until then. Senate: margin between the
        Republican and the leading opponent, a Democrat or, in{" "}
        {listFormat.format(SENATE_INDEPENDENT_CHALLENGE.map((a) => stateNavByAbbr[a].state))}, an
        independent; Florida and Ohio held special elections; margins of{" "}
        {ELECTION_MARGIN_CAP} points or more take the deepest shade. House: by district, the
        winner of each seat on the district lines used in 2026 (Census TIGER 2026, with
        Missouri&apos;s 2022 lines; see the note under the map); by state, the share of each
        state&apos;s called seats won by each party; Louisiana&apos;s runoffs and other undecided
        seats are listed as uncalled. A state whose races are all undecided is shaded gray.
      </p>
    </div>
  )
}
