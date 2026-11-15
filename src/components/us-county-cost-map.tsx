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
import { ColorCard, GradientLegend, SegmentedButtons } from "@/components/maps/legends"
import {
  divergingGradient,
  divergingShade,
  divergingStops,
} from "@/components/us-county-map-export"
import {
  COUNTY_COST_SOURCE,
  COUNTY_COST_URL,
  formatDollarsShort,
  formatRatio,
  formatRent,
  priceToIncome,
  rentToIncome,
  type CountyCost,
} from "@/lib/cost-of-living"
import { useJson } from "@/lib/fetch-json"

export type CountyCosts = Record<string, CountyCost>

export type CostMetric = "priceToIncome" | "rentToIncome" | "homeValue" | "rent" | "income"

/** Affordable / low end of the scale */
export const COST_LOW_COLOR = "#1a8a5a"
/** Expensive / high end of the scale */
export const COST_HIGH_COLOR = "#c2410c"

type MetricConfig = {
  label: string
  /** Legend heading and tooltip row name */
  name: string
  subtitle: string
  value: (c: CountyCost) => number | null
  format: (v: number) => string
  /** Values at or beyond these take the palest / deepest shade */
  range: [number, number]
  /** Scale on log values, for dollar figures spanning an order of magnitude */
  log?: boolean
}

const METRICS: Record<CostMetric, MetricConfig> = {
  priceToIncome: {
    label: "Home price ÷ income",
    name: "Home price to income",
    subtitle:
      "Median home value as a multiple of median household income; deeper orange means homes are harder to afford.",
    value: ([income, home]) => priceToIncome(home, income),
    format: formatRatio,
    range: [2, 8],
  },
  rentToIncome: {
    label: "Rent ÷ income",
    name: "Rent to income",
    subtitle:
      "A year of median gross rent as a share of median household income; deeper orange means rent takes more of a typical paycheck.",
    value: ([income, , rent]) => rentToIncome(rent, income),
    format: (v) => `${v.toFixed(1)}%`,
    range: [12, 36],
  },
  homeValue: {
    label: "Home value",
    name: "Median home value",
    subtitle: "Median value of owner-occupied homes.",
    value: ([, home]) => home,
    format: formatDollarsShort,
    range: [75_000, 750_000],
    log: true,
  },
  rent: {
    label: "Rent",
    name: "Median gross rent",
    subtitle: "Median monthly gross rent (contract rent plus utilities).",
    value: ([, , rent]) => rent,
    format: formatRent,
    range: [600, 2400],
    log: true,
  },
  income: {
    label: "Household income",
    name: "Median household income",
    subtitle: "Median household income in 2024 dollars.",
    value: ([income]) => income,
    format: formatDollarsShort,
    range: [35_000, 140_000],
    log: true,
  },
}

const METRIC_KEYS = Object.keys(METRICS) as CostMetric[]

function intensity(config: MetricConfig, value: number): number {
  const f = config.log ? Math.log : (v: number) => v
  const [lo, hi] = config.range
  return Math.min(1, Math.max(0, (f(value) - f(lo)) / (f(hi) - f(lo))))
}

function fillFor(
  cost: CountyCost | undefined,
  config: MetricConfig,
  lowColor: string,
  highColor: string
) {
  const value = cost ? config.value(cost) : null
  if (value == null) return "var(--border)"
  return divergingShade(lowColor, highColor, intensity(config, value))
}

export function UsCountyCostMap({
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
  data?: CountyCosts
}) {
  const geometry = useCountyGeometry(state)
  const costsFile = useJson<CountyCosts>(data ? null : COUNTY_COST_URL)
  const costs = data ?? costsFile.data
  const [metric, setMetric] = useState<CostMetric>("priceToIncome")
  const [lowColor, setLowColor] = useState(COST_LOW_COLOR)
  const [highColor, setHighColor] = useState(COST_HIGH_COLOR)
  const config = METRICS[metric]

  // The 2024 ACS reports Connecticut by planning region, so draw those in place of its old counties
  const { counties: countyOutlines, ctRegions } = geometry
  const outlines = useMemo(
    () => (ctRegions.length ? withCtRegions(countyOutlines, ctRegions) : countyOutlines),
    [countyOutlines, ctRegions]
  )
  const shapes = useMemo(
    () =>
      outlines.map((o) => ({ ...o, fill: fillFor(costs?.[o.fips], config, lowColor, highColor) })),
    [outlines, costs, config, lowColor, highColor]
  )

  const title = `${config.name} by county${state ? ` in ${state.state}` : ""}`
  const low = `${config.format(config.range[0])} or less`
  const high = `${config.format(config.range[1])} or more`

  return (
    <div className="space-y-5">
      <SegmentedButtons
        label="Cost-of-living measure"
        options={METRIC_KEYS.map((key) => ({ key, label: METRICS[key].label }))}
        value={metric}
        onChange={setMetric}
      />

      <CountyChoropleth
        title={title}
        subtitle={config.subtitle}
        source={COUNTY_COST_SOURCE}
        geometry={geometry}
        shapes={shapes}
        rows={rows}
        states={states}
        state={state}
        onOpenCounty={onOpenCounty}
        hasData={(fips) => !!costs?.[fips]}
        tooltipWidth={13}
        tooltip={(fips) => (
          <TooltipRows
            rows={METRIC_KEYS.map((key) => {
              const value = METRICS[key].value(costs![fips])
              return {
                key,
                label: METRICS[key].name,
                value: value == null ? "—" : METRICS[key].format(value),
                active: key === metric,
              }
            })}
          />
        )}
        legend={
          <GradientLegend
            name={config.name}
            background={divergingGradient(lowColor, highColor)}
            low={low}
            high={high}
          />
        }
        legendExtra={legendExtra}
        exportLegend={[{ name: config.name, stops: divergingStops(lowColor, highColor), low, high }]}
        dataLoading={!costs && !costsFile.error}
        dataError={costsFile.error}
        onRetryData={costsFile.retry}
        statusLabel="cost data"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <ColorCard label="Low color" color={lowColor} onChange={setLowColor} />
        <ColorCard label="High color" color={highColor} onChange={setHighColor} />
      </div>
      <p className="text-xs text-muted-foreground">
        American Community Survey 2020–2024 5-year medians, the only ACS figures published for
        every county. Home price to income divides median owner-occupied home value by median
        household income; rent to income is twelve months of median gross rent over the same
        income. Connecticut is shown by its nine planning regions. Valdez-Cordova, Alaska, split
        in 2019 and its medians can&apos;t be recombined, so it shows no data, as do a few
        counties where the Census suppresses a figure.
      </p>
    </div>
  )
}
