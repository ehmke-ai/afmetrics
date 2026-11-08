"use client"

import { Fragment, useMemo, useState } from "react"
import Link from "next/link"

import { MidtermsHouseExportButton } from "@/components/midterms-house-export"
import {
  demographicsViews,
  midterms2026HouseBundle,
  recordsForView,
  type DemographicsViewId,
} from "@/lib/midterms-2026-house"
import { sourceTimingSummary, type SourceRecord } from "@/lib/source-registry"
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

function shortOffice(office: string): string {
  if (office.startsWith("U.S. House")) return "U.S. House"
  if (office.includes("electorate")) return "Midterm electorate"
  return office.length > 22 ? `${office.slice(0, 20)}…` : office
}

export function MidtermsHouseDataTable() {
  const [viewId, setViewId] = useState<DemographicsViewId | "all_votes" | "turnout">("all_votes")

  const rows = useMemo(() => {
    if (viewId === "all_votes") {
      return midterms2026HouseBundle.records.filter((r) => r.measure === "vote_choice")
    }
    if (viewId === "turnout") {
      return midterms2026HouseBundle.records.filter(
        (r) => r.measure === "turnout" || r.measure === "electorate_composition"
      )
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
              <SelectValue placeholder="All House vote-choice rows" />
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
        <Table className="min-w-[920px]">
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="w-[18%]">
                Population
              </TableHead>
              <TableHead scope="col" className="w-[10%]">
                Measure
              </TableHead>
              <TableHead scope="col" className="w-[7%] text-right">
                Dem.
              </TableHead>
              <TableHead scope="col" className="w-[7%] text-right">
                Rep.
              </TableHead>
              <TableHead scope="col" className="w-[9%]">
                Office
              </TableHead>
              <TableHead scope="col" className="w-[24%]">
                Source timing
              </TableHead>
              <TableHead scope="col" className="w-[10%]">
                Status
              </TableHead>
              <TableHead scope="col" className="w-[15%]">
                Details
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((record) => (
              <Fragment key={record.id}>
                <TableRow>
                  <TableCell className="text-sm leading-snug">{record.population}</TableCell>
                  <TableCell className="text-sm">{measureLabel(record.measure)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-sm">
                    {formatPct(record.democraticPct)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-sm">
                    {formatPct(record.republicanPct)}
                  </TableCell>
                  <TableCell className="text-sm">{shortOffice(record.office)}</TableCell>
                  <TableCell className="text-xs leading-snug text-muted-foreground">
                    {sourceTimingSummary(record)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="outline" className="text-xs capitalize">
                      {record.provisional}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium text-foreground underline-offset-2 hover:underline">
                        Source
                      </summary>
                      <div className="mt-2 space-y-1.5 text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">Hub section:</span>{" "}
                          {record.hubSection}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Period:</span>{" "}
                          {record.dataPeriod}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Geography:</span>{" "}
                          {record.geography}
                        </p>
                        <p>{record.upstreamNotes}</p>
                        <p className="break-all">
                          <Link href={record.primaryUrl} className="underline">
                            {record.primaryUrl}
                          </Link>
                        </p>
                      </div>
                    </details>
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="fine-print text-xs text-muted-foreground">
        CSV export repeats per-row office, hub section, snapshot (if stated on hub), release date,
        checked date, URL, and full source footer.
      </p>
    </div>
  )
}
