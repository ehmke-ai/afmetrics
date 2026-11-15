"use client"

import { useMemo, useState } from "react"

import { ColorChooser } from "@/components/color-chooser"
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
import { GradientLegend } from "@/components/maps/legends"
import { POPULATION_COLORS } from "@/components/population-stack-chart"
import { Button } from "@/components/ui/button"
import {
  shade,
  shadeGradient,
  shadeStops,
} from "@/components/us-county-map-export"
import { YearSlider } from "@/components/year-slider"
import {
  COUNTY_HISTORY_URL,
  foldedBreakdown,
  GROUPS,
  groupShare,
  type CountyHistory,
  type CountyValues,
  type GroupKey,
} from "@/lib/county-history"
import { useJson } from "@/lib/fetch-json"
import { CATEGORICAL } from "@/lib/palette"

/** [fips, display label] — the figures themselves come from county-history.json */
export type { UsCountyRow }

/** `id` is a stable React key, since sides can be removed from the middle */
type Side = { id: number; groups: GroupKey[]; color: string }

const DEFAULT_SIDES: Side[] = [
  { id: 0, groups: ["european"], color: CATEGORICAL[0].light },
  { id: 1, groups: ["hispanic", "african", "indian", "eastAsian", "arab", "nativeAmerican", "other"], color: CATEGORICAL[1].light },
]

// Starting colors for added sides: the remaining categorical slots, in order
export const NEW_SIDE_COLORS = CATEGORICAL.slice(2).map((c) => c.light)

// Groups are exclusive and every side needs one, so there can be at most one side per group
const MAX_SIDES = GROUPS.length

type Leader = { index: number; lead: number }

/**
 * The side with the largest combined share in a county, and its lead over the runner-up.
 * With two sides this is just "whichever is larger, and by how much".
 *
 * 1990 has no Indian, East Asian, or Arab figures; those residents are counted inside Other
 * and European that year. A group without a figure adds nothing to its side, and the county
 * is no data only when some side has nothing but such groups (e.g. Indian vs. European).
 */
function leaderOf(values: CountyValues, sides: Side[]): Leader | undefined {
  const shares = sides.map((side) => side.groups.map((g) => groupShare(values, g)))
  if (shares.some((side) => side.every((v) => v == null))) return undefined
  const sums = shares.map((side) => side.reduce<number>((t, v) => t + (v ?? 0), 0))
  let index = 0
  for (let i = 1; i < sums.length; i++) if (sums[i] > sums[index]) index = i
  const runnerUp = Math.max(...sums.filter((_, i) => i !== index))
  return { index, lead: sums[index] - runnerUp }
}

// Each county takes the color of its leading side, deeper the wider its lead. Scaled to the
// widest lead in any county in any year, so a shade means the same margin across the slider.
// Two sides share one scale, like immigration sentiment, but blend straight from the first
// side's color into the second's with no neutral middle.
function fillFor(
  leader: Leader | undefined,
  maxLead: number,
  sides: Side[]
) {
  if (!leader) return "var(--border)"
  const t = maxLead > 0 ? Math.min(1, leader.lead / maxLead) : 0
  if (sides.length === 2) {
    const signed = leader.index === 0 ? -t : t
    return blend(sides[0].color, sides[1].color, 0.5 + signed / 2)
  }
  return shade(sides[leader.index].color, Math.round(15 + t * 85))
}

/** `t` of the way from `from` (0) to `to` (1) */
export function blend(from: string, to: string, t: number) {
  return `color-mix(in oklch, ${from}, ${to} ${Math.round(t * 100)}%)`
}

export function blendStops(from: string, to: string) {
  return [0, 0.25, 0.5, 0.75, 1].map((t) => blend(from, to, t))
}

function sideLabel(side: Side): string {
  return side.groups.map((g) => GROUPS.find((x) => x.key === g)?.label).join(" + ")
}

// Short name for the title: a side holding every group but one reads as "Non-" that group
function sideTitle(side: Side, sides: Side[]): string {
  const rest = GROUPS.filter((g) => !side.groups.includes(g.key))
  const allAssigned = sides.flatMap((s) => s.groups).length === GROUPS.length
  if (side.groups.length > 2 && rest.length === 1 && allAssigned) return `Non-${rest[0].label}`
  return sideLabel(side)
}

/** Source line under the map, so a screenshot carries its citation */
const YEAR_SOURCES: Record<number, string> = {
  1990: "1990 county population estimates",
  2000: "2000 Census",
  2010: "2010 Census",
  2020: "ACS 2016–2020",
  2025: "Vintage 2025 estimates, ACS 2020–2024",
}

export function UsCountyMap({
  counties: rows,
  states,
  years,
  state,
  onOpenCounty,
  data,
}: {
  counties: UsCountyRow[]
  /** State FIPS -> USPS abbreviation, for the tooltip heading */
  states: Record<string, string>
  /** Slider years, oldest first; each must be a key of county-history.json */
  years: number[]
  /** Draw only this state's counties, with the shading scaled to them */
  state?: CountyMapState
  /** Opens a county's page; with it, the counties in `counties` are clickable links */
  onOpenCounty?: (fips: string) => void
  /** This state's slice of the data file, read on the server; skips the national download */
  data?: CountyHistory
}) {
  const latestYear = years[years.length - 1]
  const geometry = useCountyGeometry(state)
  const historyFile = useJson<CountyHistory>(data ? null : COUNTY_HISTORY_URL)
  const history = data ?? historyFile.data
  const [year, setYear] = useState(latestYear)
  const [sides, setSides] = useState<Side[]>(DEFAULT_SIDES)

  const stateFips = state ? rows[0]?.[0].slice(0, 2) : undefined

  const yearValues = useMemo(() => history?.[year] ?? {}, [history, year])

  // On a state map, only that state's counties set the scale
  const maxLead = useMemo(() => {
    let max = 0
    for (const values of Object.values(history ?? {})) {
      for (const [fips, v] of Object.entries(values)) {
        if (stateFips && !fips.startsWith(stateFips)) continue
        max = Math.max(max, leaderOf(v, sides)?.lead ?? 0)
      }
    }
    return max
  }, [history, sides, stateFips])

  // Clicking a group puts it on that side (taking it off whichever side had it), or takes it
  // off if it's already there. No side may be left empty.
  function toggleGroup(sideIndex: number, key: GroupKey) {
    setSides((prev) => {
      const own = prev[sideIndex]
      const holder = prev.find((side) => side.groups.includes(key))
      if (holder === own) {
        if (own.groups.length === 1) return prev
        return prev.map((side) =>
          side === own ? { ...side, groups: side.groups.filter((g) => g !== key) } : side
        )
      }
      if (holder && holder.groups.length === 1) return prev
      return prev.map((side) => {
        if (side === own) {
          const groups = GROUPS.map((g) => g.key).filter((g) => g === key || own.groups.includes(g))
          return { ...side, groups }
        }
        if (side === holder) return { ...side, groups: side.groups.filter((g) => g !== key) }
        return side
      })
    })
  }

  function setSideColor(sideIndex: number, color: string) {
    setSides((prev) => prev.map((side, i) => (i === sideIndex ? { ...side, color } : side)))
  }

  // A new side starts with an unassigned group if there is one, otherwise the last group of
  // the side holding the most, and the first starting color no side is using yet.
  function addSide() {
    setSides((prev) => {
      if (prev.length >= MAX_SIDES) return prev
      const assigned = new Set(prev.flatMap((side) => side.groups))
      let key = GROUPS.map((g) => g.key).find((g) => !assigned.has(g))
      let next = prev
      if (!key) {
        const donor = prev.reduce((a, b) => (b.groups.length > a.groups.length ? b : a))
        if (donor.groups.length < 2) return prev
        key = donor.groups[donor.groups.length - 1]
        next = prev.map((side) =>
          side === donor ? { ...side, groups: side.groups.slice(0, -1) } : side
        )
      }
      const used = new Set(prev.map((side) => side.color))
      const color = NEW_SIDE_COLORS.find((c) => !used.has(c)) ?? NEW_SIDE_COLORS[0]
      const id = Math.max(...prev.map((side) => side.id)) + 1
      return [...next, { id, groups: [key], color }]
    })
  }

  // A removed side's groups become unassigned rather than moving to another side
  function removeSide(sideIndex: number) {
    setSides((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== sideIndex) : prev))
  }

  const { counties: countyOutlines, ctRegions } = geometry

  // Connecticut replaced its counties with planning regions in 2022. For years whose data is
  // keyed by region (2025), draw the regions in place of CT's old counties.
  const useCtRegions = ctRegions.some((o) => yearValues[o.fips])
  const outlines = useMemo(
    () => (useCtRegions ? withCtRegions(countyOutlines, ctRegions) : countyOutlines),
    [useCtRegions, countyOutlines, ctRegions]
  )

  const shapes = useMemo(
    () =>
      outlines.map((o) => {
        const values = yearValues[o.fips]
        return { ...o, fill: fillFor(values && leaderOf(values, sides), maxLead, sides) }
      }),
    [outlines, yearValues, sides, maxLead]
  )

  // Mirrors addSide: there must be a group free, or a side with one to spare
  const canAddSide =
    sides.length < MAX_SIDES &&
    (sides.flatMap((side) => side.groups).length < GROUPS.length ||
      sides.some((side) => side.groups.length > 1))

  const place = state ? ` in ${state.state}` : ""
  const title = `${sides.map((side) => sideTitle(side, sides)).join(" vs. ")} by county${place}, ${year}`
  const leadLabel = `+${Math.round(maxLead)} pts`
  // Two sides blend into each other on one bar; more each get their own
  const diverging = sides.length === 2
  const subtitle = `Each county is colored by its ${sides.length > 2 ? "largest" : "larger"} side, as a share of population; deeper means a wider lead.`
  const source = `Source: U.S. Census Bureau${YEAR_SOURCES[year] ? ` (${YEAR_SOURCES[year]})` : ""}`

  const exportLegend = diverging
    ? [
        {
          name: "Lead",
          stops: blendStops(sides[0].color, sides[1].color),
          low: `${sideTitle(sides[0], sides)} ${leadLabel}`,
          high: `${sideTitle(sides[1], sides)} ${leadLabel}`,
        },
      ]
    : sides.map((side) => {
        const name = sideTitle(side, sides)
        return {
          name: `Most ${name}`,
          groups: name !== sideLabel(side) ? sideLabel(side) : undefined,
          stops: shadeStops(side.color),
          low: "Close",
          high: leadLabel,
        }
      })

  const legend = diverging ? (
    <GradientLegend
        className="w-64"
        name="Lead"
        background={`linear-gradient(in oklch to right, ${sides[0].color}, ${sides[1].color})`}
        low={`${sideTitle(sides[0], sides)} ${leadLabel}`}
        high={`${sideTitle(sides[1], sides)} ${leadLabel}`}
      />
  ) : (
    sides.map((side) => {
      const name = sideTitle(side, sides)
      return (
        <GradientLegend
          key={side.id}
          name={
            <>
              Most {name}
              {name !== sideLabel(side) && (
                <div className="font-normal text-muted-foreground">{sideLabel(side)}</div>
              )}
            </>
          }
          className="w-40"
          background={shadeGradient(side.color)}
          low="Close"
          high={leadLabel}
        />
      )
    })
  )

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
        hasData={(fips) => !!yearValues[fips]}
        tooltip={(fips) => (
          <TooltipRows
            rows={foldedBreakdown(yearValues[fips]).map(({ key, label, value }) => ({
              key,
              label,
              value: `${value}%`,
              color: POPULATION_COLORS[key]?.light ?? "var(--muted-foreground)",
            }))}
          />
        )}
        legend={legend}
        exportLegend={exportLegend}
        dataLoading={!history && !historyFile.error}
        dataError={historyFile.error}
        onRetryData={historyFile.retry}
        statusLabel="county data"
      />

      <YearSlider years={years} year={year} onChange={setYear} disabled={!history} />

      <div className="grid gap-3 sm:grid-cols-2">
        {sides.map((side, sideIndex) => (
          <div
            key={side.id}
            className="space-y-3 rounded-lg border border-border bg-card/40 px-4 py-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <i
                className="inline-block size-3 shrink-0 rounded-[3px] border border-border"
                style={{ background: side.color }}
                aria-hidden
              />
              <span className="font-medium text-foreground">
                {sides.length > 2 ? "Most" : "More"} {sideLabel(side)}
              </span>
              {sides.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeSide(sideIndex)}
                  aria-label={`Remove side ${sideIndex + 1}`}
                  className="ml-auto text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Side ${sideIndex + 1} groups`}>
              {GROUPS.map(({ key, label }) => {
                const active = side.groups.includes(key)
                const holder = sides.find((s) => s.groups.includes(key))
                // Can't take a side's only group, whether this side's or another's
                const locked = holder ? holder.groups.length === 1 : false
                return (
                  <Button
                    key={key}
                    type="button"
                    size="xs"
                    variant={active ? "default" : "secondary"}
                    aria-pressed={active}
                    disabled={locked}
                    title={locked ? "Each side needs at least one group" : undefined}
                    onClick={() => toggleGroup(sideIndex, key)}
                  >
                    {label}
                  </Button>
                )
              })}
            </div>

            <ColorChooser
              color={side.color}
              onChange={(color) => setSideColor(sideIndex, color)}
              label={`Side ${sideIndex + 1} color`}
            />
          </div>
        ))}

        {canAddSide && (
          <button
            type="button"
            onClick={addSide}
            className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
          >
            + Add side
          </button>
        )}
      </div>
    </div>
  )
}
