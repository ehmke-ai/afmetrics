import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

/** A labeled color bar: sequential or diverging, depending on `background` */
export function GradientLegend({
  name,
  background,
  low,
  high,
  className = "w-48",
}: {
  className?: string
  name: ReactNode
  /** CSS background for the bar, e.g. shadeGradient() or divergingGradient() */
  background: string
  low: ReactNode
  high: ReactNode
}) {
  return (
    <div className={`${className} space-y-1`}>
      <div className="font-medium text-foreground">{name}</div>
      <div className="h-2.5 border border-border" style={{ background }} />
      <div className="flex justify-between gap-2 tabular-nums text-muted-foreground">
        <span>{low}</span>
        <span className="text-right">{high}</span>
      </div>
    </div>
  )
}

export function LegendSwatch({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <i
        className="inline-block size-3 border border-border"
        style={{ background: color }}
        aria-hidden
      />
      {children}
    </span>
  )
}

export function NoDataSwatch() {
  return <LegendSwatch color="var(--map-nodata)">No data</LegendSwatch>
}

/** One swatch per category */
export function CategoricalLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((item) => (
        <LegendSwatch key={item.label} color={item.color}>
          {item.label}
        </LegendSwatch>
      ))}
    </div>
  )
}

/** A row of toggle buttons picking one of `options` */
export function SegmentedButtons<K extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { key: K; label: string }[]
  value: K
  onChange: (key: K) => void
  /** Accessible name for the group */
  label: string
}) {
  return (
    <div className="inline-flex flex-wrap gap-1" role="group" aria-label={label}>
      {options.map((option) => (
        <Button
          key={option.key}
          type="button"
          size="xs"
          variant={value === option.key ? "default" : "secondary"}
          aria-pressed={value === option.key}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}

/** "Show by County | State" links, beside the legend of a tab that has both levels */
export function LevelToggle({
  label,
  current,
  hrefs,
}: {
  /** Accessible name for the group */
  label: string
  current: "county" | "state"
  hrefs: Record<"county" | "state", string>
}) {
  return (
    <OptionToggle
      prefix="Show by"
      label={label}
      current={current}
      options={[
        { key: "county", label: "County", href: hrefs.county },
        { key: "state", label: "State", href: hrefs.state },
      ]}
    />
  )
}

/** A row of linked buttons, one pressed: the map level toggle, the Senate/House toggle */
export function OptionToggle<K extends string>({
  prefix,
  label,
  current,
  options,
}: {
  prefix: string
  /** Accessible name for the group */
  label: string
  current: K
  options: { key: K; label: string; href: string }[]
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{prefix}</span>
      <div className="inline-flex gap-1" role="group" aria-label={label}>
        {options.map((o) => (
          <Button key={o.key} asChild size="xs" variant={current === o.key ? "default" : "secondary"}>
            <Link href={o.href} scroll={false} aria-pressed={current === o.key}>
              {o.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
