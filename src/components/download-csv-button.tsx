"use client"

import { FileSpreadsheet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { csvFileName, toCsv, type CsvRow } from "@/lib/csv"

/** Saves `rows` as a CSV file named after `title` */
export function DownloadCsvButton({
  title,
  rows,
  columns,
  className,
}: {
  title: string
  rows: CsvRow[]
  columns?: string[]
  className?: string
}) {
  function download() {
    // Byte-order mark so Excel reads the file as UTF-8 (en dashes, accented county names)
    const blob = new Blob(["﻿", toCsv(rows, columns)], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = csvFileName(title)
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={download}
      disabled={rows.length === 0}
      className={className}
    >
      <FileSpreadsheet aria-hidden />
      CSV
    </Button>
  )
}
