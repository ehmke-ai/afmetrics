"use client"

import { geoPath, type GeoPermissibleObjects } from "d3-geo"
import Link from "next/link"
import { useMemo, useState, type MouseEvent, type ReactNode } from "react"
import type { Feature, Geometry, Polygon } from "geojson"

import { useStateFeatures } from "@/components/county-map-geometry"
import { LegendSwatch } from "@/components/maps/legends"
import { MapStatus } from "@/components/maps/map-status"
import { COST_HIGH_COLOR, COST_LOW_COLOR } from "@/components/us-county-cost-map"
import {
  ANTI_IMMIG_COLOR,
  DEM_BLUE,
  divergingGradient,
  divergingShade,
  MAP_FOCUS,
  ECON_BAD_COLOR,
  ECON_GOOD_COLOR,
  MAP_HOVER,
  MAP_LABEL_HALO,
  MAP_GRAY,
  MAP_LABEL_INK,
  MID_PURPLE,
  MAP_RED,
  NO_DATA_FILL,
  PRO_IMMIG_COLOR,
  REP_RED,
  shade,
  SHADE_RANGE,
  shadeGradient,
} from "@/components/maps/map-colors"
import { formatDollars, formatRatio, formatRent, formatRpp, RPP_SOURCE } from "@/lib/cost-of-living"
import { COLORS } from "@/lib/demographics"
import {
  formatHouseDelegation,
  formatSenateRace,
  houseRepShare,
  midterms2026,
  MIDTERMS_AS_OF,
  senateMargin,
} from "@/lib/midterms-2026"
import {
  ELECTION_MARGIN_CAP,
  election2024Intensity,
  ENFORCEMENT_TIER_LABELS,
  enforcementIntensity,
  formatElection2024,
  maxStateAntiImmig,
  maxStateNative,
  maxStateRpp,
  maxStateThirtyMarriedHomeowner,
  maxStateWealthShareUnder30,
  minStateAntiImmig,
  minStateNative,
  minStateRpp,
  minStateThirtyMarriedHomeowner,
  minStateWealthShareUnder30,
  rangeIntensity,
  stateNavByAbbr,
  stateMapByAbbr,
  statePriceToIncome,
  stateMapData,
  type StateMapMetrics,
} from "@/lib/states"

export type MapMetric =
  | "election2024"
  | "senate2026"
  | "house2026"
  | "costOfLiving"
  | "antiImmig"
  | "enforcement"
  | "native"
  | "thirtyMarriedHomeowner"
  | "wealthShareUnder30"

type StateFeature = Feature<Geometry, { name: string }> & { id?: string | number }

const WIDTH = 960
const HEIGHT = 600

/** FIPS state code -> USPS abbreviation */
const FIPS_TO_ABBR: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO",
  "09": "CT", "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI",
  "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY",
  "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
  "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY",
}

const ABBR_TO_FIPS: Record<string, string> = Object.fromEntries(
  Object.entries(FIPS_TO_ABBR).map(([fips, abbr]) => [abbr, fips])
)

/** States too small to hold an inline label — listed in a sidebar instead, top to bottom like Kalshi's. */
const SIDEBAR_ABBRS = ["VT", "NH", "MA", "RI", "CT", "NJ", "DE", "MD", "DC"]
/** States that get neither an inline label nor a sidebar row (too small / disjoint to letter). */
const UNLABELED_ABBRS = new Set([...SIDEBAR_ABBRS, "HI"])

function isoKey(id: string | number | undefined) {
  if (id == null) return ""
  return String(id).padStart(2, "0")
}

/** For multipart states (e.g. Michigan's two peninsulas), label the largest piece rather than the area-weighted centroid of all of them. */
function labelCentroid(
  path: ReturnType<typeof geoPath>,
  f: StateFeature
): [number, number] | null {
  if (f.geometry.type !== "MultiPolygon") {
    const c = path.centroid(f as GeoPermissibleObjects)
    return Number.isFinite(c[0]) && Number.isFinite(c[1]) ? c : null
  }

  let largest: Polygon | null = null
  let largestArea = -Infinity
  for (const coordinates of f.geometry.coordinates) {
    const candidate: Feature<Polygon> = {
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates },
    }
    const area = Math.abs(path.area(candidate as GeoPermissibleObjects))
    if (area > largestArea) {
      largestArea = area
      largest = candidate.geometry
    }
  }
  if (!largest) return null
  const c = path.centroid({ type: "Feature", properties: {}, geometry: largest } as GeoPermissibleObjects)
  return Number.isFinite(c[0]) && Number.isFinite(c[1]) ? c : null
}

const NO_DATA_HOVER_FILL = `color-mix(in oklch, var(--foreground) 10%, ${NO_DATA_FILL})`

type MetricConfig = {
  title: string
  subtitle: string
  /** Legend heading, and the figure's name in the tooltip */
  name: string
  low: string
  high: string
  source: string
  /** The fixed map color (the high end, on a diverging scale) */
  color: string
  /** When set, the scale diverges: this low-end color, the dark base mid-range, `color` at the high end */
  lowColor?: string
  /** The middle of a diverging scale, when it isn't the white map base */
  midColor?: string
  /** Position in the color scale, 0 (palest) to 1 (deepest); null when the state has no figure */
  intensity: (d: StateMapMetrics) => number | null
  /** States with a result still being counted, drawn in UNCALLED_FILL instead of the scale */
  uncalled?: (d: StateMapMetrics) => boolean
  value: (d: StateMapMetrics) => string
}

/** States whose 2026 race is still being counted */
const UNCALLED_FILL = MAP_GRAY

const MIDTERMS_SOURCE = `Source: AP calls and state counts as compiled by Wikipedia, as of ${MIDTERMS_AS_OF} (provisional)`

const METRICS: Record<MapMetric, MetricConfig> = {
  senate2026: {
    title: "2026 Senate elections by state",
    subtitle:
      "Margin between the Republican and the leading opponent (a Democrat, or an independent where one led the challenge); deeper means a wider win. Results are provisional.",
    name: "2026 Senate margin",
    low: `D/I +${ELECTION_MARGIN_CAP}`,
    high: `R +${ELECTION_MARGIN_CAP}`,
    source: MIDTERMS_SOURCE,
    color: REP_RED,
    lowColor: DEM_BLUE,
    midColor: MID_PURPLE,
    intensity: (d) => {
      const race = midterms2026.senate[d.abbr]
      const margin = race ? senateMargin(race) : null
      return margin == null ? null : rangeIntensity(margin, -ELECTION_MARGIN_CAP, ELECTION_MARGIN_CAP)
    },
    uncalled: (d) => midterms2026.senate[d.abbr]?.status === "uncalled",
    value: (d) => {
      const race = midterms2026.senate[d.abbr]
      if (!race) return "no race in 2026"
      return `${formatSenateRace(race)}${race.special ? " (special)" : ""}`
    },
  },
  house2026: {
    title: "2026 House elections by state",
    subtitle:
      "Party split of each state's House delegation after the 2026 midterms; deeper means more one-sided. Results are provisional.",
    name: "2026 House seats won",
    low: "All Democratic",
    high: "All Republican",
    source: MIDTERMS_SOURCE,
    color: REP_RED,
    lowColor: DEM_BLUE,
    midColor: MID_PURPLE,
    intensity: (d) => {
      const delegation = midterms2026.house[d.abbr]
      return delegation ? houseRepShare(delegation) : null
    },
    uncalled: (d) => {
      const delegation = midterms2026.house[d.abbr]
      return !!delegation && delegation.uncalled === delegation.seats
    },
    value: (d) => {
      const delegation = midterms2026.house[d.abbr]
      return delegation ? formatHouseDelegation(delegation) : "no voting member"
    },
  },
  election2024: {
    title: "2024 presidential election by state",
    subtitle:
      "Statewide popular-vote margin between Donald Trump and Kamala Harris; deeper means a wider win.",
    name: "2024 margin",
    low: `Harris +${ELECTION_MARGIN_CAP}`,
    high: `Trump +${ELECTION_MARGIN_CAP}`,
    source: "Source: certified 2024 general election results (state election offices)",
    color: REP_RED,
    lowColor: DEM_BLUE,
    midColor: MID_PURPLE,
    intensity: election2024Intensity,
    value: formatElection2024,
  },
  costOfLiving: {
    title: "Cost of living by state",
    subtitle:
      "Regional Price Parity: how far prices for goods, rents, and services sit above or below the national average (US = 100).",
    name: "Price level",
    low: `${minStateRpp.toFixed(1)}`,
    high: `${maxStateRpp.toFixed(1)}`,
    source: RPP_SOURCE,
    color: COST_HIGH_COLOR,
    lowColor: COST_LOW_COLOR,
    intensity: (d) => rangeIntensity(d.cost.rpp, minStateRpp, maxStateRpp),
    value: (d) => formatRpp(d.cost.rpp),
  },
  antiImmig: {
    title: "Immigration sentiment by state",
    subtitle:
      "Share saying newcomers from other countries threaten traditional American customs and values; the scale runs from the most pro-immigration states to the most anti.",
    name: "Immigration sentiment",
    low: `Pro (${minStateAntiImmig}%)`,
    high: `Anti (${maxStateAntiImmig}%)`,
    source: "Source: PRRI 2015 American Values Atlas (DC not surveyed)",
    color: ANTI_IMMIG_COLOR,
    lowColor: PRO_IMMIG_COLOR,
    midColor: MID_PURPLE,
    intensity: (d) =>
      d.antiImmig == null ? null : rangeIntensity(d.antiImmig, minStateAntiImmig, maxStateAntiImmig),
    value: (d) => (d.antiImmig == null ? "no data" : `${d.antiImmig}% opposed`),
  },
  enforcement: {
    title: "Immigration enforcement laws by state",
    subtitle:
      "State laws on ICE detainers, 287(g), information sharing, anti-sanctuary mandates, and state immigration crimes; the scale runs from the most protective states to the most enforcement.",
    name: "ICE cooperation",
    low: "Sanctuary protections",
    high: "Heavy ICE cooperation",
    source: "Source: ILRC State Map on Immigration Enforcement, July 2026",
    color: ANTI_IMMIG_COLOR,
    lowColor: PRO_IMMIG_COLOR,
    midColor: MID_PURPLE,
    intensity: (d) => enforcementIntensity(d.enforcementScore),
    value: enforcementLabel,
  },
  thirtyMarriedHomeowner: {
    title: "Fishback benchmark by state",
    subtitle:
      "Share of 30-year-olds who are married with spouse present and own their home; the scale runs from the lowest states to the highest. DC is excluded.",
    name: "30, married & homeowner",
    low: `${minStateThirtyMarriedHomeowner}%`,
    high: `${maxStateThirtyMarriedHomeowner}%`,
    source: "Source: U.S. Census Bureau, ACS 2024 1-year estimates (DC excluded)",
    color: ECON_GOOD_COLOR,
    lowColor: ECON_BAD_COLOR,
    intensity: (d) =>
      d.abbr === "DC"
        ? null
        : rangeIntensity(
            d.thirtyMarriedHomeowner,
            minStateThirtyMarriedHomeowner,
            maxStateThirtyMarriedHomeowner
          ),
    value: (d) => (d.abbr === "DC" ? "excluded" : `${d.thirtyMarriedHomeowner}%`),
  },
  wealthShareUnder30: {
    title: "Wealth share held by residents 30 and under, by state",
    subtitle:
      "Estimated share of total household net wealth; the scale runs from the lowest states to the highest. DC is excluded.",
    name: "Wealth share, 30 & under",
    low: `${minStateWealthShareUnder30}%`,
    high: `${maxStateWealthShareUnder30}%`,
    source:
      "Sources: Fishback benchmark (ACS 2024); Federal Reserve Distributional Financial Accounts (DC excluded)",
    color: ECON_GOOD_COLOR,
    lowColor: ECON_BAD_COLOR,
    intensity: (d) =>
      d.abbr === "DC"
        ? null
        : rangeIntensity(d.wealthShareUnder30, minStateWealthShareUnder30, maxStateWealthShareUnder30),
    value: (d) => (d.abbr === "DC" ? "excluded" : `${d.wealthShareUnder30}%`),
  },
  native: {
    title: "Non-Hispanic White share by state",
    subtitle: "Non-Hispanic White minus Arab ancestry, as a share of population; deeper means higher.",
    name: "Non-Hispanic White",
    low: `${minStateNative}%`,
    high: `${maxStateNative}%`,
    source: "Source: U.S. Census Bureau (Vintage 2025 estimates, ACS 2024)",
    color: MAP_RED,
    intensity: (d) => rangeIntensity(d.native, minStateNative, maxStateNative),
    value: (d) => `${d.native}%`,
  },
}

// Scaled like the county map: 15% of the metric's color at the low end, full color at the high.
// Diverging metrics (given a `lowColor`) run from full low color through the map base (or
// `midColor`) to full color.
function fillFor(
  data: StateMapMetrics | undefined,
  metric: MapMetric,
  hovered = false,
  selected = false
) {
  const { color, lowColor, midColor, intensity, uncalled } = METRICS[metric]
  if (data && uncalled?.(data)) {
    const boost = selected ? 15 : hovered ? 8 : 0
    return boost ? `color-mix(in oklch, var(--foreground) ${boost}%, ${UNCALLED_FILL})` : UNCALLED_FILL
  }
  const t = data ? intensity(data) : null
  if (t == null) return hovered ? NO_DATA_HOVER_FILL : NO_DATA_FILL
  const boost = selected ? 15 : hovered ? 8 : 0
  if (lowColor) return divergingShade(lowColor, color, t, boost, midColor)
  const pct = Math.round(SHADE_RANGE[0] + t * (SHADE_RANGE[1] - SHADE_RANGE[0]))
  return shade(color, Math.min(100, pct + boost))
}

function metricLabel(data: StateMapMetrics, metric: MapMetric): string {
  return METRICS[metric].value(data)
}

function enforcementLabel(data: StateMapMetrics): string {
  return `${ENFORCEMENT_TIER_LABELS[data.enforcementTier]} (${data.enforcementScore.toFixed(1)})`
}

// Light states on the black page: borders are the page color, and focus is flag red
function strokeFor(selected: boolean, hovered: boolean): string {
  if (selected) return MAP_FOCUS
  if (hovered) return MAP_HOVER
  return "var(--background)"
}

/** The map tabs: the state metrics, plus views that only exist at county level */

/** The state-level choropleth for one metric, with the small-state list, details, and colors */
export function UsStateMap({
  metric,
  legendExtra,
}: {
  metric: MapMetric
  /** Drawn beside the legend (the county/state toggle) */
  legendExtra?: ReactNode
}) {
  const { features, loading, error: shapesError, retry: retryShapes } = useStateFeatures()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)
  const config = METRICS[metric]
  const { color, lowColor, midColor } = config

  function updatePointer(e: MouseEvent<SVGPathElement>) {
    const svg = e.currentTarget.ownerSVGElement
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    setPointer({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  // Coordinates are pre-projected (Albers USA), so no projection is applied here.
  const path = useMemo(() => geoPath(null), [])

  // Draw selected/hovered states last so their strokes sit on top
  const orderedFeatures = useMemo(() => {
    if (!hoveredId && !selectedId) return features
    return [...features].sort((a, b) => {
      const aId = isoKey(a.id)
      const bId = isoKey(b.id)
      const aBoost = (aId === selectedId ? 2 : 0) + (aId === hoveredId ? 1 : 0)
      const bBoost = (bId === selectedId ? 2 : 0) + (bId === hoveredId ? 1 : 0)
      return aBoost - bBoost
    })
  }, [features, hoveredId, selectedId])

  const hovered = hoveredId ? stateMapByAbbr[FIPS_TO_ABBR[hoveredId]] : undefined
  const selected = selectedId ? stateMapByAbbr[FIPS_TO_ABBR[selectedId]] : undefined
  const detail = selected ?? hovered
  const detailPage = detail ? stateNavByAbbr[detail.abbr] : undefined

  const labels = useMemo(
    () =>
      features.flatMap((f) => {
        const abbr = FIPS_TO_ABBR[isoKey(f.id)]
        if (!abbr || UNLABELED_ABBRS.has(abbr)) return []
        const centroid = labelCentroid(path, f)
        return centroid ? [{ abbr, x: centroid[0], y: centroid[1] }] : []
      }),
    [features, path]
  )

  return (
    <div className="space-y-4">
      {/* Title, map, legend, and source sit together so a screenshot of this block stands alone */}
      <figure className="space-y-3 bg-background">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-balance text-foreground sm:text-lg">
              {config.title}
            </h3>
            <p className="text-xs text-muted-foreground">{config.subtitle}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="relative">
            <MapStatus loading={loading} error={shapesError} onRetry={retryShapes} />
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="h-auto w-full touch-pan-y"
              role="img"
              aria-label={`Map: ${config.title}`}
            >
              {orderedFeatures.map((f) => {
                const id = isoKey(f.id)
                const abbr = FIPS_TO_ABBR[id]
                const data = abbr ? stateMapByAbbr[abbr] : undefined
                const isHovered = hoveredId === id
                const isSelected = selectedId === id
                const d = path(f as GeoPermissibleObjects)
                if (!d) return null

                return (
                  <path
                    key={id || f.properties.name}
                    d={d}
                    fill={fillFor(data, metric, isHovered, isSelected)}
                    stroke={strokeFor(isSelected, isHovered)}
                    strokeWidth={isSelected ? 1.75 : isHovered ? 1.5 : 1}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    className={`${data ? "cursor-pointer" : "cursor-default"} transition-[fill,stroke-width] duration-150`}
                    onMouseEnter={(e) => {
                      setHoveredId(id)
                      updatePointer(e)
                    }}
                    onMouseMove={updatePointer}
                    onMouseLeave={() => {
                      setHoveredId(null)
                      setPointer(null)
                    }}
                    onClick={() => {
                      if (!data) return
                      setSelectedId((prev) => (prev === id ? null : id))
                    }}
                  >
                    <title>
                      {data
                        ? `${data.state}: ${metricLabel(data, metric)}`
                        : `${f.properties.name}: no data`}
                    </title>
                  </path>
                )
              })}

              {/* Labels in a separate pass so hovered/selected states drawn later don't cover them */}
              {labels.map(({ abbr, x, y }) => (
                <text
                  key={abbr}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  paintOrder="stroke"
                  stroke={MAP_LABEL_HALO}
                  strokeWidth={3}
                  strokeLinejoin="round"
                  className="pointer-events-none select-none font-mono font-bold uppercase"
                  style={{ fontSize: 12, fill: MAP_LABEL_INK }}
                >
                  {abbr}
                </text>
              ))}
            </svg>

            {hoveredId && pointer && (
              <div
                className="pointer-events-none absolute z-10 border border-border bg-popover px-3 py-2 text-sm shadow-md"
                style={{
                  left: `min(${pointer.x}%, calc(100% - 10rem))`,
                  top: `max(${pointer.y - 2}%, 0.5rem)`,
                  transform: "translateY(-100%)",
                }}
              >
                {hovered ? (
                  <>
                    <div className="font-medium text-foreground">{hovered.state}</div>
                    <div className="tabular-nums text-muted-foreground">
                      {config.name}{" "}
                      <span className="font-medium text-foreground">{metricLabel(hovered, metric)}</span>
                    </div>
                  </>
                ) : (
                  <div className="font-medium text-foreground">No data</div>
                )}
              </div>
            )}
          </div>

          <div className="overflow-hidden border border-border sm:w-32">
            {SIDEBAR_ABBRS.map((abbr) => {
              const id = ABBR_TO_FIPS[abbr]
              const data = stateMapByAbbr[abbr]
              const isHovered = hoveredId === id
              const isSelected = selectedId === id
              return (
                <button
                  key={abbr}
                  type="button"
                  title={data ? `${data.state}: ${metricLabel(data, metric)}` : abbr}
                  className="block w-full cursor-pointer border-b border-border/60 px-3 py-1.5 text-left text-xs font-bold uppercase tracking-wide text-foreground transition-colors last:border-b-0"
                  style={{ background: fillFor(data, metric, isHovered, isSelected) }}
                  onMouseEnter={() => setHoveredId(id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedId((prev) => (prev === id ? null : id))}
                >
                  <span
                    className="px-1"
                    style={{ background: "color-mix(in oklch, var(--background) 70%, transparent)" }}
                  >
                    {abbr}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <figcaption className="flex flex-wrap items-end gap-x-6 gap-y-3 text-xs">
          <div className="w-48 space-y-1">
            <div className="font-medium text-foreground">{config.name}</div>
            <div
              className="h-2.5 border border-border"
              style={{
                background: lowColor
                  ? divergingGradient(lowColor, color, midColor)
                  : shadeGradient(color),
              }}
            />
            <div className="flex justify-between gap-2 tabular-nums text-muted-foreground">
              <span>{config.low}</span>
              <span className="text-right">{config.high}</span>
            </div>
          </div>
          {(metric === "antiImmig" ||
            metric === "thirtyMarriedHomeowner" ||
            metric === "wealthShareUnder30") && (
            <LegendSwatch color={NO_DATA_FILL}>{metric === "antiImmig" ? "No data" : "DC excluded"}</LegendSwatch>
          )}
          {(metric === "senate2026" || metric === "house2026") && (
            <>
              <LegendSwatch color={UNCALLED_FILL}>Uncalled</LegendSwatch>
              <LegendSwatch color={NO_DATA_FILL}>
                {metric === "senate2026" ? "No race" : "No voting member"}
              </LegendSwatch>
            </>
          )}
          {legendExtra}
          <span className="ml-auto text-muted-foreground">{config.source}</span>
        </figcaption>
      </figure>

      <div>
        <div className="border border-border bg-card/40 px-4 py-3 text-sm">
          {detail ? (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">
                  {detailPage ? (
                    <Link href={`/united-states/${detailPage.slug}`} className="hover:underline">
                      {detail.state}
                    </Link>
                  ) : (
                    detail.state
                  )}
                </h3>
                <div className="flex items-center gap-3">
                  {detailPage && (
                    <Link
                      href={`/united-states/${detailPage.slug}`}
                      className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                    >
                      Full profile →
                    </Link>
                  )}
                  {selected && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                      onClick={() => setSelectedId(null)}
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 tabular-nums sm:grid-cols-4">
                <Stat
                  label="2024 presidential vote"
                  value={formatElection2024(detail)}
                  color={detail.trump2024 >= detail.harris2024 ? REP_RED : DEM_BLUE}
                />
                <Stat
                  label="2026 Senate"
                  value={METRICS.senate2026.value(detail)}
                  color={midtermColor(METRICS.senate2026, detail)}
                />
                <Stat
                  label="2026 House seats"
                  value={METRICS.house2026.value(detail)}
                  color={midtermColor(METRICS.house2026, detail)}
                />
                <Stat
                  label="Anti-immigration sentiment"
                  value={detail.antiImmig == null ? "—" : `${detail.antiImmig}%`}
                  color={COLORS.anti}
                />
                <Stat
                  label="Enforcement laws & ICE"
                  value={enforcementLabel(detail)}
                  color={COLORS.enforcement}
                />
                <Stat label="Non-Hispanic White" value={`${detail.native}%`} color={COLORS.native} />
                <Stat
                  label="30, married & homeowner"
                  value={detail.abbr === "DC" ? "—" : `${detail.thirtyMarriedHomeowner}%`}
                  color={COLORS.thirtyMarriedHomeowner}
                />
                <Stat
                  label="Wealth share, 30 & under"
                  value={detail.abbr === "DC" ? "—" : `${detail.wealthShareUnder30}%`}
                  color={COLORS.wealthShareUnder30}
                />
                <Stat
                  label="Price level (US = 100)"
                  value={formatRpp(detail.cost.rpp)}
                  color={COLORS.costOfLiving}
                />
                <Stat
                  label="Median household income"
                  value={formatDollars(detail.cost.medianIncome)}
                  color={COLORS.costOfLiving}
                />
                <Stat
                  label="Median home value"
                  value={`${formatDollars(detail.cost.medianHomeValue)} (${formatRatio(statePriceToIncome(detail))} income)`}
                  color={COLORS.costOfLiving}
                />
                <Stat
                  label="Median rent"
                  value={formatRent(detail.cost.medianRent)}
                  color={COLORS.costOfLiving}
                />
              </dl>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Hover or select one of {stateMapData.length} states (including DC) to inspect its
              figures.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/** Party color of a 2026 result's winning side, or muted text when there isn't one yet */
function midtermColor(config: MetricConfig, d: StateMapMetrics): string {
  const t = config.uncalled?.(d) ? null : config.intensity(d)
  if (t == null || t === 0.5) return "var(--muted-foreground)"
  return t > 0.5 ? REP_RED : DEM_BLUE
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium" style={{ color }}>
        {value}
      </dd>
    </div>
  )
}
