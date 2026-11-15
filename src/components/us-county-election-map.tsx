"use client"

import { useMemo, useState, type ReactNode } from "react"

import {
  useCountyGeometry,
  withCtRegions,
  type CountyMapState,
} from "@/components/county-map-geometry"
import {
  CountyChoropleth,
  TooltipRows,
  type UsCountyRow,
} from "@/components/maps/county-choropleth"
import { ColorCard, GradientLegend } from "@/components/maps/legends"
import {
  ANTI_IMMIG_COLOR,
  divergingGradient,
  divergingShade,
  divergingStops,
  PRO_IMMIG_COLOR,
} from "@/components/us-county-map-export"
import { useJson } from "@/lib/fetch-json"

/** [trump %, harris %, total votes], from scripts/build-county-election-2024.py */
type CountyResult = [number, number, number]
export type CountyResults = Record<string, CountyResult>

const RESULTS_URL = "/data/county-election-2024.json"

/** Margins at or beyond this many points take the deepest shade */
const MARGIN_CAP = 60

const SUBTITLE =
  "Popular-vote margin between Donald Trump and Kamala Harris; deeper means a wider win."
const SOURCE = "Source: county results compiled from state and county election offices (tonmcg)"

/** Trump-minus-Harris margin in points: positive is a Trump win */
function marginOf([trump, harris]: CountyResult): number {
  return trump - harris
}

function fillFor(result: CountyResult | undefined, harrisColor: string, trumpColor: string) {
  if (!result) return "var(--border)"
  const t = Math.min(1, Math.max(0, (marginOf(result) / MARGIN_CAP + 1) / 2))
  return divergingShade(harrisColor, trumpColor, t)
}

export function UsCountyElectionMap({
  counties: rows,
  states,
  legendExtra,
  state,
  onOpenCounty,
  data,
}: {
  counties: UsCountyRow[]
  /** State FIPS -> USPS abbreviation, for the tooltip heading */
  states: Record<string, string>
  /** Drawn beside the legend (UsMap's county/state toggle) */
  legendExtra?: ReactNode
  /** Draw only this state's counties */
  state?: CountyMapState
  /** Opens a county's page; with it, the counties in `counties` are clickable links */
  onOpenCounty?: (fips: string) => void
  /** This state's slice of the data file, read on the server; skips the national download */
  data?: CountyResults
}) {
  const geometry = useCountyGeometry(state)
  const file = useJson<CountyResults>(data ? null : RESULTS_URL)
  const results = data ?? file.data
  const [harrisColor, setHarrisColor] = useState(PRO_IMMIG_COLOR)
  const [trumpColor, setTrumpColor] = useState(ANTI_IMMIG_COLOR)

  // Connecticut reports 2024 results by planning region, so draw those in place of its old counties
  const { counties: countyOutlines, ctRegions } = geometry
  const outlines = useMemo(
    () => (ctRegions.length ? withCtRegions(countyOutlines, ctRegions) : countyOutlines),
    [countyOutlines, ctRegions]
  )
  const shapes = useMemo(
    () =>
      outlines.map((o) => ({ ...o, fill: fillFor(results?.[o.fips], harrisColor, trumpColor) })),
    [outlines, results, harrisColor, trumpColor]
  )

  const title = `2024 presidential election by county${state ? ` in ${state.state}` : ""}`
  const low = `Harris +${MARGIN_CAP}`
  const high = `Trump +${MARGIN_CAP}`

  return (
    <div className="space-y-5">
      <CountyChoropleth
        title={title}
        subtitle={SUBTITLE}
        source={SOURCE}
        geometry={geometry}
        shapes={shapes}
        rows={rows}
        states={states}
        state={state}
        onOpenCounty={onOpenCounty}
        hasData={(fips) => !!results?.[fips]}
        // Alaska reports by house district, so every borough shows the statewide result
        tooltipTitle={(fips) => (fips.startsWith("02") ? "Alaska (statewide)" : undefined)}
        tooltip={(fips) => {
          const result = results![fips]
          const margin = marginOf(result)
          return (
            <>
              <TooltipRows
                rows={[
                  { key: "trump", label: "Trump", value: `${result[0].toFixed(1)}%`, color: trumpColor },
                  { key: "harris", label: "Harris", value: `${result[1].toFixed(1)}%`, color: harrisColor },
                ]}
              />
              <div className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                {margin >= 0 ? "Trump" : "Harris"} +{Math.abs(margin).toFixed(1)} ·{" "}
                {result[2].toLocaleString()} votes
              </div>
            </>
          )
        }}
        legend={
          <GradientLegend
            name="2024 margin"
            background={divergingGradient(harrisColor, trumpColor)}
            low={low}
            high={high}
          />
        }
        legendExtra={legendExtra}
        exportLegend={[
          { name: "2024 margin", stops: divergingStops(harrisColor, trumpColor), low, high },
        ]}
        dataLoading={!results && !file.error}
        dataError={file.error}
        onRetryData={file.retry}
        statusLabel="election results"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <ColorCard label="Harris color" color={harrisColor} onChange={setHarrisColor} />
        <ColorCard label="Trump color" color={trumpColor} onChange={setTrumpColor} />
      </div>

      <p className="text-xs text-muted-foreground">
        Share of all votes cast for president in each county in the 2024 general election;
        third-party votes make up the remainder. Margins of {MARGIN_CAP} points or more take the
        deepest shade. Connecticut is shown by its nine planning regions and DC&apos;s wards are
        combined. Alaska reports results by state house district rather than borough, so the
        whole state is shaded by its statewide result.
      </p>
    </div>
  )
}
