"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FED_WEALTH,
  fedWealth,
  GENERATIONS,
  generation,
  WEALTH_QUARTER,
  type GenerationId,
} from "@/lib/where-you-stand"
import { population, formatPct } from "@/components/where-you-stand/shared"

export function WealthCard({
  stateName,
  abbr,
  generationId,
}: {
  stateName: string
  abbr: string
  generationId: GenerationId
}) {
  const cohort = generation(generationId)!
  const wealth = fedWealth(cohort.fed)
  const statePop = population[abbr]?.[generationId]
  const usPop = population.US?.[generationId]
  const maxShare = Math.max(...FED_WEALTH.map((row) => row.share))

  return (
    <Card className="border-border bg-card shadow-none">
      <CardHeader>
        <CardTitle>
          {cohort.label} wealth, {WEALTH_QUARTER}
        </CardTitle>
        <CardDescription>
          {wealthSentence(stateName, cohort, wealth.share, statePop, usPop)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {FED_WEALTH.map((row) => {
          const selected = row.id === cohort.fed
          return (
            <div
              key={row.id}
              className="grid grid-cols-[9.5rem_1fr_3.5rem] items-center gap-3 text-sm"
            >
              <span className={selected ? "font-semibold" : "text-muted-foreground"}>
                {row.label}
              </span>
              <span className="block h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${(row.share / maxShare) * 100}%`,
                    background: selected ? "var(--chart-1)" : "var(--muted-foreground)",
                    opacity: selected ? 1 : 0.45,
                  }}
                />
              </span>
              <span className="text-right tabular-nums">{formatPct(row.share)}</span>
            </div>
          )
        })}
        <p className="text-sm text-muted-foreground">
          Share of U.S. household net worth. The Federal Reserve does not publish this by state.
          {cohort.fed === "younger" &&
            " The highlighted bar is everyone born in 1981 or later. The Fed does not split Millennials, Gen Z, and Gen Alpha."}
          {cohort.id === "alpha" &&
            " Gen Alpha are children, so almost none of that 11.2% is theirs."}
        </p>
      </CardContent>
    </Card>
  )
}

export function wealthSentence(
  stateName: string,
  cohort: (typeof GENERATIONS)[number],
  wealthShare: number,
  statePop: number | undefined,
  usPop: number | undefined,
): string {
  const place =
    statePop == null
      ? ""
      : `In ${stateName}, about ${formatPct(statePop)} of residents are ${cohort.label} age (${cohort.ages} in 2024)${
          usPop == null ? "" : `, against ${formatPct(usPop)} nationwide`
        }. `
  if (cohort.fed === "younger") {
    return `${place}People born in 1981 or later hold ${formatPct(wealthShare)} of U.S. household wealth. That line includes ${cohort.label}.`
  }
  const subject =
    cohort.fed === "silent"
      ? "The Silent generation and earlier"
      : cohort.fed === "genx"
        ? "Generation X"
        : "Baby boomers"
  const verb = cohort.fed === "genx" ? "holds" : "hold"
  return `${place}${subject} ${verb} ${formatPct(wealthShare)} of U.S. household wealth.`
}
