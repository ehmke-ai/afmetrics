"use client"

import { geoPath } from "d3-geo"
import { useMemo, type ReactNode } from "react"
import { feature, mesh } from "topojson-client"
import type { FeatureCollection, Geometry } from "geojson"
import type { GeometryCollection, Topology } from "topojson-specification"

import { US_STATES_URL, type CountyGeometry } from "@/components/county-map-geometry"
import { CountyChoropleth, type UsCountyRow } from "@/components/maps/county-choropleth"
import { LegendSwatch } from "@/components/maps/legends"
import {
  DEM_BLUE,
  MAP_GRAY,
  MID_PURPLE,
  NO_DATA_FILL,
  REP_RED,
  shade,
} from "@/components/maps/map-colors"
import { useJson } from "@/lib/fetch-json"
import {
  midterms2026,
  MIDTERMS_AS_OF,
  PARTY_LETTER,
  type HouseDistrictResult,
  type MidtermParty,
} from "@/lib/midterms-2026"

/** From scripts/build-house-districts-2026.js, in the state map's 960×600 Albers space */
const DISTRICTS_URL = "/geo/us-house-districts-2026-albers.json"

type DistrictTopology = Topology<{ districts: GeometryCollection<{ name: string }> }>
type StatesTopology = Topology<{ states: GeometryCollection }>

const PARTY_COLOR: Record<MidtermParty, string> = {
  D: DEM_BLUE,
  R: REP_RED,
  I: MID_PURPLE,
  O: MID_PURPLE,
}
const PARTY_NAME: Record<MidtermParty, string> = {
  D: "Democratic",
  R: "Republican",
  I: "Independent",
  O: "Other",
}
/** Seats a party held get a lighter shade than seats it flipped */
const HOLD_SHADE = 55

function fillFor(result: HouseDistrictResult | undefined): string {
  if (!result) return NO_DATA_FILL
  if (!result.party) return MAP_GRAY
  const color = PARTY_COLOR[result.party]
  return result.flip ? color : shade(color, HOLD_SHADE)
}

function districtLabel(geoid: string, name: string) {
  return geoid.endsWith("00") ? name : `${name} district`
}

const projected = new WeakMap<object, { outlines: CountyGeometry["counties"]; rows: UsCountyRow[] }>()

export function UsHouseDistrictMap({
  states,
  legendExtra,
}: {
  /** State FIPS -> USPS abbreviation */
  states: Record<string, string>
  /** Drawn beside the legend (UsMap's race and level toggles) */
  legendExtra?: ReactNode
}) {
  const districts = useJson<DistrictTopology>(DISTRICTS_URL)
  const stateTopo = useJson<StatesTopology>(US_STATES_URL)

  const { outlines, rows } = useMemo(() => {
    const topo = districts.data
    if (!topo) return { outlines: [], rows: [] }
    let cached = projected.get(topo)
    if (!cached) {
      // Already projected, so an identity path draws them
      const path = geoPath()
      const features = (feature(topo, topo.objects.districts) as FeatureCollection<Geometry, { name: string }>)
        .features
      cached = {
        outlines: features.flatMap((f) => {
          const d = path(f)
          return d ? [{ fips: String(f.id), d }] : []
        }),
        rows: features.map((f) => [String(f.id), districtLabel(String(f.id), f.properties.name)] as UsCountyRow),
      }
      projected.set(topo, cached)
    }
    return cached
  }, [districts.data])

  const stateBorders = useMemo(() => {
    const topo = stateTopo.data
    return topo ? (geoPath()(mesh(topo, topo.objects.states, (a, b) => a !== b)) ?? undefined) : undefined
  }, [stateTopo.data])

  const shapes = useMemo(
    () => outlines.map((o) => ({ ...o, fill: fillFor(midterms2026.districts[o.fips]) })),
    [outlines]
  )

  const geometry: CountyGeometry = {
    width: 960,
    height: 600,
    counties: outlines,
    ctRegions: [],
    regionLabels: {},
    stateBorders,
    loading: districts.loading || stateTopo.loading,
    error: districts.error ?? stateTopo.error,
    retry: () => {
      districts.retry()
      stateTopo.retry()
    },
  }

  const labelByGeoid = useMemo(() => Object.fromEntries(rows), [rows])

  return (
    <div className="space-y-5">
      <CountyChoropleth
        title="2026 House elections by district"
        subtitle="Winner of each congressional district, drawn on the district lines used in the November 3, 2026 election. Deeper color marks a seat that changed parties. Results are provisional."
        source={`Source: Census TIGER 2026 districts; AP calls as compiled by Wikipedia, as of ${MIDTERMS_AS_OF} (provisional)`}
        geometry={geometry}
        shapes={shapes}
        rows={rows}
        states={states}
        hasData={(geoid) => !!midterms2026.districts[geoid]}
        tooltipTitle={(geoid) => labelByGeoid[geoid]}
        tooltipWidth={13}
        tooltip={(geoid) => <DistrictTooltip result={midterms2026.districts[geoid]} />}
        legend={
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <LegendSwatch color={shade(DEM_BLUE, HOLD_SHADE)}>D hold</LegendSwatch>
            <LegendSwatch color={DEM_BLUE}>D flip</LegendSwatch>
            <LegendSwatch color={shade(REP_RED, HOLD_SHADE)}>R hold</LegendSwatch>
            <LegendSwatch color={REP_RED}>R flip</LegendSwatch>
            <LegendSwatch color={MAP_GRAY}>Uncalled</LegendSwatch>
          </div>
        }
        noData={false}
        legendExtra={legendExtra}
        dataLoading={false}
        dataError={null}
        onRetryData={() => {}}
        statusLabel="district boundaries"
      />

      <p className="text-xs text-muted-foreground">
        District lines are the Census Bureau&apos;s TIGER 2026 boundaries for the 120th Congress,
        which include the maps redrawn after 2024 in Alabama, California, Florida, Louisiana,
        North Carolina, Ohio, Tennessee, Texas, and Utah. Missouri is the exception: its 2025 map
        was suspended by a pending referendum, and after the Supreme Court&apos;s September 25,
        2026 stay the state voted on its 2022 districts, which are shown instead. Districts are
        trimmed to the coastline. A &ldquo;flip&rdquo; is a seat won by a different party than
        the member who held it, or the member redistricted into it; newly created seats with no
        incumbent count as holds. A seat with no winner yet marked (including Louisiana&apos;s
        December runoffs) is shaded gray.
      </p>
    </div>
  )
}

function DistrictTooltip({ result }: { result: HouseDistrictResult }) {
  if (!result.party) {
    return (
      <div className="mt-1.5 text-xs text-muted-foreground">
        {result.runoff.length
          ? `Runoff: ${result.runoff.map((c) => `${c.name} (${PARTY_LETTER[c.party]})`).join(" vs. ")}`
          : "Uncalled"}
      </div>
    )
  }
  return (
    <div className="mt-1.5 space-y-0.5 text-sm">
      <div className="flex items-center gap-1.5 text-foreground">
        <i className="inline-block size-2" style={{ background: PARTY_COLOR[result.party] }} aria-hidden />
        <span className="font-medium">{result.winner}</span>
        <span className="text-muted-foreground">({PARTY_LETTER[result.party]})</span>
      </div>
      <div className="text-xs text-muted-foreground">
        {result.flip
          ? `${PARTY_NAME[result.party]} flip from ${result.incumbentParty}`
          : result.incumbentParty
            ? `${PARTY_NAME[result.party]} hold`
            : "New seat, no incumbent"}
      </div>
    </div>
  )
}
