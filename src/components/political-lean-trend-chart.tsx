"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  COLORS,
  usPoliticalLeanHistory,
  type PoliticalLeanPoint,
} from "@/lib/demographics"

const chartConfig = {
  leftOfCenter: {
    label: "Democratic",
    color: COLORS.leftOfCenter,
  },
  rightOfCenter: {
    label: "Republican",
    color: COLORS.rightOfCenter,
  },
} satisfies ChartConfig

const SERIES = [
  { key: "leftOfCenter" as const, label: "Democratic" },
  { key: "rightOfCenter" as const, label: "Republican" },
]

/** Presidential popular vote by party; defaults to the national series */
export function PoliticalLeanTrendChart({
  data: chartData = usPoliticalLeanHistory,
}: {
  data?: PoliticalLeanPoint[]
} = {}) {
  const leanValues = chartData.flatMap((d) => SERIES.map(({ key }) => d[key]))
  const minLean = leanValues.length ? Math.min(...leanValues) : 0
  const maxLean = leanValues.length ? Math.max(...leanValues) : 55
  const yMin = Math.max(0, Math.floor((minLean - 5) / 5) * 5)
  const yMax = Math.min(100, Math.ceil((maxLean + 8) / 5) * 5)

  return (
    <div className="flex flex-col gap-4">
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[min(360px,56vh)] w-full"
        initialDimension={{ width: 900, height: 340 }}
      >
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            domain={[yMin, yMax]}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            width={44}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as
                    | (typeof chartData)[number]
                    | undefined
                  return row ? String(row.year) : ""
                }}
                formatter={(value, name) => {
                  const label =
                    SERIES.find((s) => s.key === name)?.label ?? String(name)
                  return (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {value}%
                      </span>
                    </div>
                  )
                }}
              />
            }
          />
          {SERIES.map(({ key }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={`var(--color-${key})`}
              strokeWidth={2.5}
              dot={{ r: 3, fill: `var(--color-${key})`, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  )
}
