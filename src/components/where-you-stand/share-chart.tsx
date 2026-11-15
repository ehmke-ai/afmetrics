"use client"

import type { CSSProperties } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { POPULATION_COLORS } from "@/components/population-stack-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { COUNTY_HISTORY_YEARS, CT_FIPS, groupShare, type CountyHistory } from "@/lib/county-history"
import { DEMOGRAPHIC_GROUPS } from "@/lib/where-you-stand"
import { type CountyPlace, formatPct } from "@/components/where-you-stand/shared"
import { CATEGORICAL, type ThemedColor } from "@/lib/palette"

/** Distinct line colors when several counties share one chart. */
export const COUNTY_LINE_COLORS: ThemedColor[] = CATEGORICAL

export function seriesKey(fips: string): string {
  return `f${fips}`
}

export function ShareChart({
  places,
  groupId,
  groupLabel,
  history,
}: {
  places: CountyPlace[]
  groupId: (typeof DEMOGRAPHIC_GROUPS)[number]["id"]
  groupLabel: string
  history: CountyHistory
}) {
  const series = places.map((place, index) => ({
    ...place,
    key: seriesKey(place.fips),
    points: sharePoints(history, place.fips, groupId),
    ctTruncated: place.fips.startsWith(CT_FIPS) && !history["2025"]?.[place.fips],
    theme:
      places.length === 1
        ? POPULATION_COLORS[groupId]
        : COUNTY_LINE_COLORS[index % COUNTY_LINE_COLORS.length],
  }))
  const years = COUNTY_HISTORY_YEARS.map(String).filter((year) =>
    series.some((row) => row.points.some((point) => point.year === year)),
  )
  const data = years.map((year) => {
    const row: Record<string, string | number | null> = { year }
    for (const item of series) {
      row[item.key] = item.points.find((point) => point.year === year)?.share ?? null
    }
    return row
  })
  const shares = series.flatMap((row) => row.points.map((point) => point.share))
  const yMin = shares.length ? Math.max(0, Math.floor(Math.min(...shares) / 5) * 5 - 5) : 0
  const yMax = shares.length ? Math.min(100, Math.ceil(Math.max(...shares) / 5) * 5 + 5) : 100
  const chartConfig = Object.fromEntries(
    series.map((row) => [row.key, { label: row.label, theme: row.theme }]),
  ) satisfies ChartConfig
  const multiple = series.length > 1

  return (
    <Card className="border-border bg-card shadow-none">
      <CardHeader>
        <CardTitle>
          {shareTitle(
            groupLabel,
            series.map((row) => row.label),
          )}
        </CardTitle>
        <CardDescription>
          {multiple
            ? shareSentences(groupLabel, series)
            : shareSentence(groupLabel, series[0].label, series[0].points, series[0].ctTruncated)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {data.length > 0 && (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[min(320px,50vh)] w-full"
            initialDimension={{ width: 720, height: 300 }}
          >
            <LineChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="year" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `${value}%`}
                width={48}
                domain={[yMin, yMax]}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {multiple
                            ? (chartConfig[String(name)]?.label ?? String(name))
                            : `${groupLabel} share`}
                        </span>
                        <span className="font-medium tabular-nums text-foreground">
                          {value}%
                        </span>
                      </div>
                    )}
                  />
                }
              />
              {series.map((row) => (
                <Line
                  key={row.key}
                  dataKey={row.key}
                  name={row.key}
                  type="monotone"
                  stroke={`var(--color-${row.key})`}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
        {multiple && (
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {series.map((row) => {
              const latest = row.points[row.points.length - 1]
              return (
                <span
                  key={row.key}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <i
                    className="inline-block size-3.5 bg-(--swatch-light) dark:bg-(--swatch-dark)"
                    style={
                      {
                        "--swatch-light": row.theme?.light,
                        "--swatch-dark": row.theme?.dark,
                      } as CSSProperties
                    }
                    aria-hidden
                  />
                  {row.label}
                  {latest && (
                    <span className="font-medium tabular-nums text-foreground">
                      {formatPct(latest.share)}
                    </span>
                  )}
                </span>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function sharePoints(
  history: CountyHistory,
  fips: string,
  groupId: (typeof DEMOGRAPHIC_GROUPS)[number]["id"],
): { year: string; share: number }[] {
  return COUNTY_HISTORY_YEARS.flatMap((year) => {
    const values = history[String(year)]?.[fips]
    if (!values) return []
    const share = groupShare(values, groupId)
    if (share == null) return []
    return [{ year: String(year), share }]
  })
}

export function shareTitle(groupLabel: string, labels: string[]): string {
  if (labels.length <= 1) return `${groupLabel} share of ${labels[0] ?? "the selected counties"}`
  if (labels.length === 2) return `${groupLabel} share of ${labels[0]} and ${labels[1]}`
  return `${groupLabel} share of ${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`
}

export function shareSentences(
  groupLabel: string,
  series: {
    label: string
    points: { year: string; share: number }[]
    ctTruncated: boolean
  }[],
): string {
  const body = series
    .map((row) => shareSentence(groupLabel, row.label, row.points, false))
    .join(" ")
  if (!series.some((row) => row.ctTruncated)) return body
  return `${body} Connecticut’s 2025 figures are for planning regions, so any Connecticut county ends in 2020.`
}

export function shareSentence(
  groupLabel: string,
  place: string,
  points: { year: string; share: number }[],
  ctTruncated: boolean,
): string {
  if (points.length === 0) return `${place} has no ${groupLabel} figure in this series.`
  const first = points[0]
  const last = points[points.length - 1]
  const body =
    first.year === last.year
      ? `${groupLabel} share of ${place} was ${formatPct(last.share)} in ${last.year}.`
      : `${groupLabel} share of ${place} went from ${formatPct(first.share)} in ${first.year} to ${formatPct(last.share)} in ${last.year}.`
  if (!ctTruncated) return body
  return `${body} Connecticut’s 2025 figures are for planning regions, so this county’s line ends in 2020.`
}
