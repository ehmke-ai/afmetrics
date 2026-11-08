"use client"

import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MIDTERMS_HOUSE_CHECKED_DATE, midterms2026HouseBundle, NORC_SNAPSHOT_LABEL } from "@/lib/midterms-2026-house"
import { formatSourceFooter, type SourceRecord } from "@/lib/source-registry"

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function rowToCsv(record: SourceRecord): string {
  const cells = [
    record.id,
    record.measure,
    record.population,
    record.geography,
    record.office,
    record.dataPeriod,
    record.democraticPct != null ? String(record.democraticPct) : "",
    record.republicanPct != null ? String(record.republicanPct) : "",
    record.qualitativeNote ?? "",
    record.provisional,
    record.dataSnapshotDate ?? "",
    record.checkedDate,
    record.primaryUrl,
    formatSourceFooter(record),
  ]
  return cells.map((c) => escapeCsv(c)).join(",")
}

export function MidtermsHouseExportButton({ rows }: { rows: SourceRecord[] }) {
  function download() {
    const header = [
      "id",
      "measure",
      "population",
      "geography",
      "office",
      "data_period",
      "democratic_pct",
      "republican_pct",
      "qualitative_note",
      "provisional_status",
      "data_snapshot",
      "checked_date",
      "primary_url",
      "source_footer",
    ].join(",")
    const meta = [
      "",
      "# export",
      escapeCsv(`bundle: ${midterms2026HouseBundle.id}`),
      escapeCsv(`as_of: ${NORC_SNAPSHOT_LABEL}`),
      escapeCsv(`checked: ${MIDTERMS_HOUSE_CHECKED_DATE}`),
      escapeCsv(midterms2026HouseBundle.dependency),
    ].join("\n")
    const body = rows.map(rowToCsv).join("\n")
    const blob = new Blob([[header, meta, body].join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "afmetrics-midterms-2026-house-demographics.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={download}>
      <Download className="size-4" aria-hidden />
      Export CSV
    </Button>
  )
}
