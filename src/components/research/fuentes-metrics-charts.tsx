"use client"

import { useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  platformBars,
  rumbleFollowerHistory,
  xFollowerHistory,
  type ChartView,
} from "@/data/research/nick-fuentes-content"

const barMax = Math.max(...platformBars.map((b) => b.value))

function formatCount(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    return millions >= 10
      ? `${Math.round(millions)}M`
      : `${millions.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}M`
  }
  if (value >= 1000) {
    return `${Math.round(value / 1000)}K`
  }
  return String(value)
}

const lineConfig = {
  followers: { label: "Followers", color: "var(--chart-1)" },
} satisfies ChartConfig

export function PlatformFollowerBars() {
  return (
    <div className="flex flex-col gap-4">
      {platformBars.map((bar) => (
        <div key={bar.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium text-foreground">{bar.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-foreground">{bar.display}</span>
          </div>
          <div
            className="mt-1.5 h-2 overflow-hidden bg-muted"
            role="img"
            aria-label={`${bar.label}: ${bar.display}`}
          >
            <div
              className="h-full bg-chart-1"
              style={{ width: `${(bar.value / barMax) * 100}%` }}
            />
          </div>
          <p className="fine-print mt-1">{bar.meta}</p>
        </div>
      ))}
    </div>
  )
}

export function FollowerHistoryCharts() {
  const [chart, setChart] = useState<ChartView>("x")

  const data = [...(chart === "x" ? xFollowerHistory : rumbleFollowerHistory)]
  const ceiling = chart === "x" ? 1_500_000 : 800_000

  return (
    <div className="flex flex-col gap-4">
      <div
        className="inline-flex w-fit border border-border bg-muted/50 p-0.5"
        role="tablist"
        aria-label="Follower history platform"
      >
        {(
          [
            { value: "x" as const, label: "X followers" },
            { value: "rumble" as const, label: "Rumble followers" },
          ] as const
        ).map((opt) => (
          <Button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={chart === opt.value}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-3 text-xs font-medium",
              chart === opt.value && "bg-background shadow-sm"
            )}
            onClick={() => setChart(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <ChartContainer
        config={lineConfig}
        className="aspect-auto h-[min(320px,50vh)] w-full max-w-none"
        initialDimension={{ width: 640, height: 300 }}
      >
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <YAxis
            domain={[0, ceiling]}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatCount}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            width={48}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => (
                  <span className="font-medium tabular-nums">
                    {typeof value === "number" ? value.toLocaleString("en-US") : value}
                  </span>
                )}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-followers)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--color-followers)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}