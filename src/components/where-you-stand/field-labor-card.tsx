"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FIELD_CITIZENSHIP_YEAR,
  fieldLabor,
  MIN_FIELD_SAMPLE,
  type FieldLabor,
  type WorkFieldId,
} from "@/lib/where-you-stand"
import { formatPct } from "@/components/where-you-stand/shared"

export function laborTotal(cell: FieldLabor): number {
  return cell.citizen + cell.noncitizen
}

export function laborPct(cell: FieldLabor, key: "citizen" | "naturalized" | "noncitizen"): number {
  return (cell[key] / laborTotal(cell)) * 100
}

export function LaborBar({ share, highlight }: { share: number; highlight: boolean }) {
  return (
    <span className="block h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
      <span
        className="block h-full rounded-full"
        style={{
          width: `${share}%`,
          background: highlight ? "var(--chart-1)" : "var(--muted-foreground)",
          opacity: highlight ? 1 : 0.45,
        }}
      />
    </span>
  )
}

export function FieldLaborCard({
  stateName,
  abbr,
  fieldId,
  fieldLabel,
  countyCount,
  remote,
}: {
  stateName: string
  abbr: string
  fieldId: WorkFieldId
  fieldLabel: string
  countyCount: number
  remote: boolean
}) {
  const stateCell = fieldLabor(abbr, fieldId)
  const usCell = fieldLabor("US", fieldId)
  if (!usCell || laborTotal(usCell) <= 0) return null
  const stateOk = Boolean(stateCell && stateCell.n >= MIN_FIELD_SAMPLE && laborTotal(stateCell) > 0)
  const focus = stateOk && stateCell ? stateCell : usCell
  const noncitizen = laborPct(focus, "noncitizen")
  const citizen = laborPct(focus, "citizen")
  const naturalized = laborPct(focus, "naturalized")
  const field = fieldLabel.toLowerCase()
  const place = stateOk ? stateName : "the United States"
  const compare = remote && stateOk && stateCell
  const rows = [
    {
      id: "citizen" as const,
      label: "U.S. citizens",
      share: citizen,
      highlight: false,
    },
    {
      id: "noncitizen" as const,
      label: "Non-citizens",
      share: noncitizen,
      highlight: true,
    },
  ]
  const places = compare
    ? [
        { id: "state", label: stateName, cell: stateCell },
        { id: "us", label: "United States", cell: usCell },
      ]
    : []
  const slotNote =
    countyCount === 1
      ? "The county figure below is certified job slots in this occupation, for the county rather than the state."
      : "The figures below are certified job slots in this occupation, summed across the counties you chose, rather than the state."
  const nationalNote = remote
    ? " With remote checked, that card also lists the same slots for this field in the whole country."
    : ""

  return (
    <Card className="border-border bg-card shadow-none">
      <CardHeader>
        <CardTitle className="text-4xl font-semibold tabular-nums">
          {formatPct(noncitizen)}
        </CardTitle>
        <CardDescription>
          {stateOk
            ? `Non-U.S. citizens among people working in ${field} in ${stateName}, ${FIELD_CITIZENSHIP_YEAR}. Nationwide, ${formatPct(laborPct(usCell, "noncitizen"))}.`
            : `${stateName}’s ${FIELD_CITIZENSHIP_YEAR} sample of people working in ${field} is too small, so this is the U.S. share.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {compare
          ? rows.map((row) => (
              <div key={row.id} className="flex flex-col gap-1.5">
                <span
                  className={
                    row.highlight ? "text-sm font-semibold" : "text-sm text-muted-foreground"
                  }
                >
                  {row.label}
                </span>
                {places.map((column) => {
                  const share = laborPct(column.cell, row.id)
                  return (
                    <div
                      key={column.id}
                      className="grid grid-cols-[minmax(6.5rem,11rem)_minmax(0,1fr)_3.25rem] items-center gap-3 text-sm"
                    >
                      <span className="text-muted-foreground">{column.label}</span>
                      <LaborBar share={share} highlight={row.highlight} />
                      <span className="text-right tabular-nums">{formatPct(share)}</span>
                    </div>
                  )
                })}
              </div>
            ))
          : rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[8.5rem_minmax(0,1fr)_3.25rem] items-center gap-3 text-sm"
              >
                <span className={row.highlight ? "font-semibold" : "text-muted-foreground"}>
                  {row.label}
                </span>
                <LaborBar share={row.share} highlight={row.highlight} />
                <span className="text-right tabular-nums">{formatPct(row.share)}</span>
              </div>
            ))}
        <p className="text-sm text-muted-foreground">
          Citizens include naturalized citizens, {formatPct(naturalized)} of workers in this field
          in {place}
          {compare ? ` and ${formatPct(laborPct(usCell, "naturalized"))} in the United States` : ""}
          . Non-citizens include green-card holders, temporary workers such as H-1B, refugees, and
          people without status who answered the survey. The American Community Survey records
          citizenship and has no visa class. {slotNote}
          {nationalNote}
        </p>
      </CardContent>
    </Card>
  )
}
