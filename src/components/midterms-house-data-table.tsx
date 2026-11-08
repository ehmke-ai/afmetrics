"use client"

import { useMemo, useState } from "react"

import { MidtermsHouseExportButton } from "@/components/midterms-house-export"
import {
  demographicsViews,
  midterms2026HouseBundle,
  recordsForView,
  type DemographicsViewId,
} from "@/lib/midterms-2026-house"
import type { SourceRecord } from "@/lib/source-registry"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatPct(value: number | null): string {
  if (value == null) return "—"
  return `${value}%`
}

function measureLabel(measure: SourceRecord["measure"]): string {
  switch (measure) {
    case "vote_choice":
      return "Vote choice"
    case "turnout":
      return "Turnout"
    case "electorate_composition":
      return "Electorate share"
    default:
      return measure
  }
}

export function MidtermsHouseDataTable() {
  const [viewId, setViewId] = useState<DemographicsViewId | "all_votes" | "turnout">("all_votes")

  const rows = useMemo(() => {
    if (viewId === "all_votes") {
      return midterms2026HouseBundle.records.filter((r) => r.measure === "vote_choice")
    }
    if (viewId === "turnout") {
      return midterms2026HouseBundle.records.filter((r) => r.measure === "turnout" || r.measure === "electorate_composition")
    }
    return recordsForView(viewId)
  }, [viewId])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="midterms-table-view" className="text-sm text-muted-foreground">
            Table filter
          </label>
          <Select
            value={viewId}
            onValueChange={(value) => {
              if (value) setViewId(value as typeof viewId)
            }}
          >
            <SelectTrigger id="midterms-table-view" className="min-w-[14rem]" aria-label="Table filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_votes">All House vote-choice rows</SelectItem>
              <SelectItem value="turnout">Turnout & electorate share</SelectItem>
              {demographicsViews.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <MidtermsHouseExportButton rows={rows} />
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Population</TableHead>
              <TableHead scope="col">Measure</TableHead>
              <TableHead scope="col" className="text-right">
                Dem.
              </TableHead>
              <TableHead scope="col" className="text-right">
                Rep.
              </TableHead>
              <TableHead scope="col">Value / note</TableHead>
              <TableHead scope="col">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="max-w-[14rem] text-sm">{record.population}</TableCell>
                <TableCell className="text-sm">{measureLabel(record.measure)}</TableCell>
                <TableCell className="text-right font-mono tabular-nums text-sm">
                  {formatPct(record.democraticPct)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-sm">
                  {formatPct(record.republicanPct)}
                </TableCell>
                <TableCell className="max-w-[18rem] text-sm text-muted-foreground">
                  {record.qualitativeNote ?? record.claim}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs capitalize">
                    {record.provisional}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
