import type { ReactNode } from "react"

/** One headline figure: label, value, and an optional note under it */
export function StatTile({
  label,
  value,
  note,
  color,
}: {
  label: ReactNode
  value: ReactNode
  note?: ReactNode
  /** Swatch beside the label, tying the figure to its chart color */
  color?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="eyebrow flex items-center gap-1.5">
        {color && (
          <i
            className="inline-block size-2 rounded-full"
            style={{ background: color }}
            aria-hidden
          />
        )}
        {label}
      </div>
      <div className="mt-1 font-heading text-[28px] leading-none font-medium tabular-nums text-foreground">
        {value}
      </div>
      {note && <div className="mt-1.5 text-xs text-muted-foreground">{note}</div>}
    </div>
  )
}
