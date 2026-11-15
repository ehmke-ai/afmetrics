"use client"

import { useMemo, useState } from "react"

import { useCountyGeometry, type CountyMapState } from "@/components/county-map-geometry"
import {
  CountyChoropleth,
  TooltipRows,
  type UsCountyRow,
} from "@/components/maps/county-choropleth"
import { ColorCard, GradientLegend } from "@/components/maps/legends"
import { Button } from "@/components/ui/button"
import { shade, SHADE_RANGE, shadeGradient, shadeStops } from "@/components/us-county-map-export"
import {
  COUNTY_VISAS_URL,
  per100k,
  visaPeak,
  type CountyVisas,
  type VisaPeaks,
  type VisaProgram,
  type VisaScale,
} from "@/lib/county-visas"
import { useJson } from "@/lib/fetch-json"
import { rangeIntensity } from "@/lib/states"
import { formatCount } from "@/lib/work-visas"
import { VISA } from "@/lib/palette"

/** [H-1B positions, H-2A workers, H-2B workers, resident population] */
type Program = VisaProgram
type Scale = VisaScale

const PROGRAMS: Record<
  Program,
  { index: 0 | 1 | 2; label: string; name: string; noun: string; color: string }
> = {
  h1b: { index: 0, label: "H-1B", name: "H-1B positions", noun: "positions", color: VISA.h1b.light },
  h2a: { index: 1, label: "H-2A", name: "H-2A workers", noun: "workers", color: VISA.h2a.light },
  h2b: { index: 2, label: "H-2B", name: "H-2B workers", noun: "workers", color: VISA.h2b.light },
}

const SOURCE =
  "Source: DOL OFLC case disclosure, FY 2025 (worksite). Population: Census Bureau, July 1, 2024 (Connecticut counties, July 1, 2021)."

function formatRate(value: number): string {
  return value >= 100 ? value.toFixed(0) : value.toFixed(1)
}

/** Log scale from 1 to the national maximum, so a few huge counties do not wash out the rest. */
function intensity(value: number, max: number): number {
  if (value <= 0 || max <= 1) return 0
  return rangeIntensity(Math.log10(value), 0, Math.log10(max))
}

function fillFor(value: number | null, max: number, color: string) {
  if (value == null) return "var(--border)"
  const t = intensity(value, max)
  const pct = Math.round(SHADE_RANGE[0] + t * (SHADE_RANGE[1] - SHADE_RANGE[0]))
  return shade(color, pct)
}

export function UsCountyVisaMap({
  counties: rows,
  states,
  state,
  onOpenCounty,
  data,
}: {
  counties: UsCountyRow[]
  /** State FIPS -> USPS abbreviation, for the tooltip heading */
  states: Record<string, string>
  /** Draw only this state's counties */
  state?: CountyMapState
  /** Opens a county's page; with it, the counties in `counties` are clickable links */
  onOpenCounty?: (fips: string) => void
  /** This state's counties, read on the server, with the national peaks for the color scale */
  data?: { visas: CountyVisas; peaks: VisaPeaks }
}) {
  const geometry = useCountyGeometry(state)
  const visasFile = useJson<CountyVisas>(data ? null : COUNTY_VISAS_URL)
  const visas = data?.visas ?? visasFile.data
  const peaks = data?.peaks
  const [program, setProgram] = useState<Program>("h1b")
  const [scale, setScale] = useState<Scale>("positions")
  const [color, setColor] = useState(PROGRAMS.h1b.color)
  const config = PROGRAMS[program]

  const countyOutlines = geometry.counties

  const max = useMemo(() => {
    if (peaks) return peaks[`${program}:${scale}`]
    return visas ? visaPeak(visas, config.index, scale) : 1
  }, [peaks, visas, program, config.index, scale])

  const shapes = useMemo(
    () =>
      countyOutlines.map((outline) => {
        const row = visas?.[outline.fips]
        if (!row) return { ...outline, fill: fillFor(null, max, color) }
        const count = row[config.index]
        const value = scale === "positions" ? count : row[3] ? per100k(count, row[3]) : null
        return { ...outline, fill: fillFor(value, max, color) }
      }),
    [countyOutlines, visas, max, color, config.index, scale]
  )


  const place = state ? ` in ${state.state}` : ""
  const title = `${config.name} by county${place}`
  const subtitle =
    scale === "rate"
      ? `${config.name} per 100,000 residents. The color follows the log of the rate, from none to the highest county in the country.`
      : `Certified ${config.noun} in FY 2025, at the county of the first worksite. The color follows the log of the count, so counties across the range stay visible.`
  const low = "0"
  const high = scale === "rate" ? `${formatRate(max)} per 100,000` : formatCount(Math.round(max))

  const legendName = scale === "rate" ? `${config.name} per 100,000` : config.name

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(PROGRAMS) as Program[]).map((key) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={program === key ? "default" : "secondary"}
            aria-pressed={program === key}
            onClick={() => {
              setProgram(key)
              setColor(PROGRAMS[key].color)
            }}
          >
            {PROGRAMS[key].label}
          </Button>
        ))}
        <div className="inline-flex gap-1" role="group" aria-label="Map scale">
          {(
            [
              ["positions", "Positions"],
              ["rate", "Per 100,000"],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              type="button"
              size="xs"
              variant={scale === key ? "default" : "secondary"}
              aria-pressed={scale === key}
              onClick={() => setScale(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <CountyChoropleth
        title={title}
        subtitle={subtitle}
        source={SOURCE}
        geometry={geometry}
        shapes={shapes}
        rows={rows}
        states={states}
        state={state}
        onOpenCounty={onOpenCounty}
        hasData={(fips) => !!visas?.[fips]}
        tooltipWidth={14}
        tooltipTitle={(fips) => (fips === "11001" ? "District of Columbia" : undefined)}
        tooltip={(fips) => {
          const row = visas![fips]
          const population = row[3]
          return (
            <TooltipRows
              rows={(Object.keys(PROGRAMS) as Program[]).map((key) => {
                const count = row[PROGRAMS[key].index]
                const rate = population ? per100k(count, population) : null
                return {
                  key,
                  label: PROGRAMS[key].name,
                  active: key === program,
                  value: `${formatCount(count)}${scale === "rate" && rate != null ? ` · ${formatRate(rate)}` : ""}`,
                }
              })}
            />
          )
        }}
        legend={
          <GradientLegend name={legendName} background={shadeGradient(color)} low={low} high={high} />
        }
        exportLegend={[{ name: legendName, stops: shadeStops(color), low, high }]}
        dataLoading={!visas && !visasFile.error}
        dataError={visasFile.error}
        onRetryData={visasFile.retry}
        statusLabel="visa data"
      />

      <ColorCard label="Color" color={color} onChange={setColor} />
      <p className="text-xs text-muted-foreground">
        Fiscal year 2025, from the Labor Department’s case files. H-1B counts positions on
        certified Labor Condition Applications. H-2A and H-2B count workers DOL certified,
        including partial certifications. An application that lists several worksites is counted
        in the first county. A certified slot is permission for an employer to petition. It is
        not a visa stamp and not a person admitted. Hover a county for all three counts. Where
        the filing left the county blank, the worksite ZIP is assigned to the county it overlaps
        most.
      </p>
    </div>
  )
}
