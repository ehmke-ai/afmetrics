"use client"

import { useMemo, useState } from "react"

import { ColorChooser } from "@/components/color-chooser"
import { useCountyGeometry, type CountyMapState } from "@/components/county-map-geometry"
import {
  CountyChoropleth,
  TooltipRows,
  type UsCountyRow,
} from "@/components/maps/county-choropleth"
import { GradientLegend } from "@/components/maps/legends"
import { shade, SHADE_RANGE, shadeGradient, shadeStops } from "@/components/us-county-map-export"
import { YearSlider } from "@/components/year-slider"
import { useJson } from "@/lib/fetch-json"

/** % of population in each tradition, in CATEGORIES order (less Unclaimed), from scripts/build-county-religion.py */
type CountyShares = number[]
/** Census year -> FIPS -> shares */
export type CountyReligion = Record<string, Record<string, CountyShares>>

const DATA_URL = "/data/county-religion.json"

/** The leading tradition's share of population at the palest and deepest shades */
const SHARE_FLOOR = 10
const SHARE_CAP = 60

/** In the order of the data file's arrays, then Unclaimed, which is whatever share they leave */
const CATEGORIES = [
  { key: "evangelical", label: "Evangelical Protestant", color: "#1565c0" },
  { key: "mainline", label: "Mainline Protestant", color: "#29b6f6" },
  { key: "blackProtestant", label: "Black Protestant", color: "#1a237e" },
  { key: "catholic", label: "Catholic", color: "#c62828" },
  { key: "orthodox", label: "Orthodox", color: "#8d6e63" },
  { key: "lds", label: "Latter-day Saints", color: "#ef6c00" },
  { key: "jewish", label: "Jewish", color: "#7b1fa2" },
  { key: "muslim", label: "Muslim", color: "#00897b" },
  { key: "other", label: "Other religions", color: "#9e9d24" },
  { key: "unclaimed", label: "Unclaimed", color: "#424242" },
] as const

const UNCLAIMED = CATEGORIES.length - 1

/** Source line under the map, so a screenshot carries its citation */
const YEAR_SOURCES: Record<string, string> = {
  1990: "Churches and Church Membership in the United States 1990 (Glenmary Research Center)",
  2000: "Religious Congregations and Membership Study 2000 (ASARB)",
  2010: "2010 U.S. Religion Census (ASARB)",
  2020: "2020 U.S. Religion Census (ASARB)",
}

/** Each tradition's share, then the unclaimed rest (none when adherents exceed residents) */
function withUnclaimed(shares: CountyShares): number[] {
  const total = shares.reduce((t, v) => t + v, 0)
  return [...shares, Math.max(0, 100 - total)]
}

/** The largest category, counting Unclaimed only while it is shown */
function leaderOf(shares: CountyShares, showUnclaimed: boolean): { index: number; value: number } {
  const values = withUnclaimed(shares)
  const last = showUnclaimed ? UNCLAIMED : UNCLAIMED - 1
  let index = 0
  for (let i = 1; i <= last; i++) if (values[i] > values[index]) index = i
  return { index, value: values[index] }
}

function fillFor(shares: CountyShares | undefined, colors: string[], showUnclaimed: boolean) {
  if (!shares) return "var(--border)"
  const { index, value } = leaderOf(shares, showUnclaimed)
  const t = Math.min(1, Math.max(0, (value - SHARE_FLOOR) / (SHARE_CAP - SHARE_FLOOR)))
  return shade(colors[index], Math.round(SHADE_RANGE[0] + t * (SHADE_RANGE[1] - SHADE_RANGE[0])))
}

export function UsCountyReligionMap({
  counties: rows,
  states,
  state,
  onOpenCounty,
  data,
}: {
  counties: UsCountyRow[]
  /** State FIPS -> USPS abbreviation, for the tooltip heading */
  states: Record<string, string>
  /** Draw only this state's counties, with the legend limited to traditions leading there */
  state?: CountyMapState
  /** Opens a county's page; with it, the counties in `counties` are clickable links */
  onOpenCounty?: (fips: string) => void
  /** This state's slice of the data file, read on the server; skips the national download */
  data?: CountyReligion
}) {
  const geometry = useCountyGeometry(state)
  const religionFile = useJson<CountyReligion>(data ? null : DATA_URL)
  const religion = data ?? religionFile.data
  const [colors, setColors] = useState<string[]>(() => CATEGORIES.map((c) => c.color))
  const [showUnclaimed, setShowUnclaimed] = useState(false)
  const [year, setYear] = useState<number | null>(null)


  const years = useMemo(() => Object.keys(religion ?? {}).map(Number).sort((a, b) => a - b), [religion])
  // Start on the latest year once the data arrives
  const shownYear = year ?? years[years.length - 1] ?? 2020
  const yearShares = useMemo(() => religion?.[shownYear] ?? {}, [religion, shownYear])

  // Every study reports Connecticut by its old counties, which the county outlines draw
  const outlines = geometry.counties

  const shapes = useMemo(
    () =>
      outlines.map((o) => ({ ...o, fill: fillFor(yearShares[o.fips], colors, showUnclaimed) })),
    [outlines, yearShares, colors, showUnclaimed]
  )

  // Only categories that lead somewhere on the map this year get a legend entry
  const leading = useMemo(() => {
    const seen = new Set<number>()
    for (const { fips } of outlines) {
      const shares = yearShares[fips]
      if (shares) seen.add(leaderOf(shares, showUnclaimed).index)
    }
    return CATEGORIES.flatMap((_, i) => (seen.has(i) ? [i] : []))
  }, [outlines, yearShares, showUnclaimed])

  function tooltipRows(shares: CountyShares) {
    return withUnclaimed(shares)
      .map((value, i) => ({ ...CATEGORIES[i], color: colors[i], value }))
      .filter((c) => c.value > 0 && (showUnclaimed || c.key !== "unclaimed"))
      .sort((a, b) => b.value - a.value)
  }

  const low = `${SHARE_FLOOR}%`
  const high = `${SHARE_CAP}%+`

  const place = state ? ` in ${state.state}` : ""
  const title = `Largest religious ${showUnclaimed ? "group" : "tradition"} by county${place}, ${shownYear}`
  const subtitle = showUnclaimed
    ? "Each county is colored by its largest tradition, or Unclaimed where more residents belong to no congregation; deeper means a larger share of residents."
    : "Each county is colored by the tradition with the most adherents; deeper means a larger share of residents."
  const source = `Source: ${YEAR_SOURCES[shownYear] ?? "U.S. Religion Census (ASARB)"}`

  return (
    <div className="space-y-5">
      <CountyChoropleth
        title={title}
        subtitle={subtitle}
        source={source}
        geometry={geometry}
        shapes={shapes}
        rows={rows}
        states={states}
        state={state}
        onOpenCounty={onOpenCounty}
        hasData={(fips) => !!yearShares[fips]}
        tooltipWidth={13}
        tooltip={(fips) => (
          <>
            <TooltipRows
              rows={tooltipRows(yearShares[fips]).map(({ key, label, color, value }) => ({
                key,
                label,
                color,
                value: `${value.toFixed(1)}%`,
              }))}
            />
            {yearShares[fips].reduce((t, v) => t + v, 0) > 100 && (
              <div className="mt-1.5 max-w-[14rem] text-xs text-muted-foreground">
                Adherents exceed residents (congregations draw from outside the county)
              </div>
            )}
          </>
        )}
        legend={leading.map((i) => (
          <GradientLegend
            key={CATEGORIES[i].key}
            className="w-40"
            name={`Most ${CATEGORIES[i].label}`}
            background={shadeGradient(colors[i])}
            low={low}
            high={high}
          />
        ))}
        exportLegend={leading.map((i) => ({
          name: `Most ${CATEGORIES[i].label}`,
          stops: shadeStops(colors[i]),
          low,
          high,
        }))}
        dataLoading={!religion && !religionFile.error}
        dataError={religionFile.error}
        onRetryData={religionFile.retry}
        statusLabel="religion data"
      />

      <YearSlider
        years={years.length ? years : [shownYear]}
        year={shownYear}
        onChange={setYear}
        disabled={!religion}
      />

      <div className="rounded-lg border border-border bg-card/40 px-4 py-3 text-sm">
        <div className="grid gap-x-6 gap-y-2 sm:grid-cols-3">
          {CATEGORIES.map(({ key, label }, i) => {
            const hidden = key === "unclaimed" && !showUnclaimed
            return (
              <div key={key} className="flex items-center gap-2">
                <ColorChooser
                  color={colors[i]}
                  onChange={(next) =>
                    setColors((prev) => prev.map((c, j) => (j === i ? next : c)))
                  }
                  label={`${label} color`}
                />
                <span className={hidden ? "text-muted-foreground line-through" : "text-foreground"}>
                  {label}
                </span>
                {key === "unclaimed" && (
                  <button
                    type="button"
                    onClick={() => setShowUnclaimed((prev) => !prev)}
                    aria-pressed={showUnclaimed}
                    className="ml-auto text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    {showUnclaimed ? "Remove" : "Add back"}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Adherents of each tradition as a share of the county&apos;s population, from the
        decennial church membership studies (1990: Glenmary Research Center; 2000–2020: ASARB,
        the U.S. Religion Census), each covering a few hundred religious bodies. Denominations are
        grouped into traditions following the ASARB and Pew families; non-denominational churches count as
        Evangelical Protestant, and Jehovah&apos;s Witnesses, Unitarian Universalists, Hindus,
        Buddhists, Baha&apos;is, and other faiths as Other religions. Unclaimed residents are those
        not counted as adherents of any participating group — not the same as atheist or
        agnostic, as it includes believers who belong to no congregation and members of groups
        that didn&apos;t take part. Each county is colored by its largest tradition; add Unclaimed back to color it Unclaimed where more residents belong to no congregation. Adherents are counted where their
        congregation meets, so a county whose churches draw from its neighbors can exceed 100%.
        Coverage changes between studies, so compare years with care: historically Black
        denominations are absent from 2000 and incomplete in other years (1990 has a single Black
        Baptists estimate), so Black Protestant figures are undercounts; Muslims are first
        estimated in 2000. Leading shares of {SHARE_CAP}% or more take the deepest shade. The 1990
        study folds Virginia&apos;s independent cities into their counties, Alaska boroughs created
        after a study show no data for it, and Loving County, TX and Alpine County, CA
        reported no congregations in some years.
      </p>
    </div>
  )
}
