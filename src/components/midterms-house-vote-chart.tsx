"use client"

import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  chartableVoteChoiceRecords,
  demographicsViews,
  midtermsHouseChartColors,
  recordsForView,
  type DemographicsViewId,
} from "@/lib/midterms-2026-house"
import type { SourceRecord } from "@/lib/source-registry"

const chartConfig = {
  democratic: {
    label: "Democratic House",
    color: midtermsHouseChartColors.democratic,
  },
  republican: {
    label: "Republican House",
    color: midtermsHouseChartColors.republican,
  },
} satisfies ChartConfig

function shortPopulation(record: SourceRecord, viewId: DemographicsViewId): string {
  switch (viewId) {
    case "age":
      if (record.id.includes("youth-national")) return "Ages 18–29"
      if (record.id.includes("30-44")) return "Ages 30–44"
      if (record.id.includes("45-64")) return "Ages 45–64"
      if (record.id.includes("65-plus")) return "Ages 65+"
      break
    case "gender":
      if (record.id.includes("women")) return "Women 18–29"
      if (record.id.includes("men")) return "Men 18–29"
      break
    case "race":
      if (record.id.includes("white") && !record.id.includes("men")) return "White youth"
      if (record.id.includes("black")) return "Black youth"
      if (record.id.includes("latino") && !record.id.includes("men")) return "Latino youth"
      if (record.id.includes("aapi")) return "AAPI youth"
      break
    case "race_gender":
      if (record.id.includes("white-men")) return "White men 18–29"
      if (record.id.includes("latino-men")) return "Latino men 18–29"
      break
  }
  return record.population.replace(/^Voters? /i, "").slice(0, 36)
}

type ChartRow = {
  label: string
  democratic: number
  republican?: number
  recordId: string
}

function toChartRows(viewId: DemographicsViewId): ChartRow[] {
  return chartableVoteChoiceRecords(recordsForView(viewId)).map((record) => ({
    label: shortPopulation(record, viewId),
    democratic: record.democraticPct!,
    republican: record.republicanPct ?? undefined,
    recordId: record.id,
  }))
}

export function MidtermsHouseVoteChart() {
  const [viewId, setViewId] = useState<DemographicsViewId>("gender")
  const rows = useMemo(() => toChartRows(viewId), [viewId])
  const view = demographicsViews.find((v) => v.id === viewId)!
  const maxPct = Math.max(
    100,
    ...rows.flatMap((r) => [r.democratic, r.republican ?? 0])
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="midterms-demographics-view" className="text-sm text-muted-foreground">
          Breakdown
        </label>
        <Select
          value={viewId}
          onValueChange={(value) => {
            if (value) setViewId(value as DemographicsViewId)
          }}
        >
          <SelectTrigger id="midterms-demographics-view" className="min-w-[14rem]" aria-label="Demographic breakdown">
            <SelectValue placeholder={view.label} />
          </SelectTrigger>
          <SelectContent>
            {demographicsViews.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-muted-foreground">{view.description}</p>
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[min(420px,70vh)] w-full min-h-[360px]"
        initialDimension={{ width: 900, height: 380 }}
        aria-label={`2026 U.S. House vote choice by ${view.label}`}
      >
        <BarChart data={rows} layout="vertical" margin={{ left: 4, right: 16, top: 8, bottom: 8 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            type="number"
            domain={[0, maxPct]}
            tickFormatter={(v) => `${v}%`}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={132}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--foreground)", fontSize: 12 }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <span className="font-mono tabular-nums">
                    {name}: {value}%
                  </span>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="democratic"
            fill="var(--color-democratic)"
            radius={[0, 4, 4, 0]}
            name="Democratic House"
            maxBarSize={28}
          />
          <Bar
            dataKey="republican"
            fill="var(--color-republican)"
            radius={[0, 4, 4, 0]}
            name="Republican House"
            maxBarSize={28}
          />
        </BarChart>
      </ChartContainer>
      <p className="fine-print text-muted-foreground">
        Bars show reported House vote choice among voters in each group — not turnout rates. Groups without a
        reported Republican share are Democratic-only on the chart; see the table for full sourcing.
      </p>
    </div>
  )
}
