"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { usNativeShareHistory, type NativeSharePoint } from "@/lib/demographics"

const chartConfig = {
  native: {
    label: "Non-Hispanic White share",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function NativeShareTrendChart({
  data: chartData = usNativeShareHistory,
}: {
  data?: NativeSharePoint[]
} = {}) {
  const minNative = chartData.length
    ? Math.min(...chartData.map((d) => d.native))
    : 50
  const yMin = Math.max(0, Math.floor((minNative - 8) / 5) * 5)

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
            domain={[yMin, 100]}
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
                formatter={(value) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground">Non-Hispanic White</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {value}%
                    </span>
                  </div>
                )}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="native"
            stroke="var(--color-native)"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "var(--color-native)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
