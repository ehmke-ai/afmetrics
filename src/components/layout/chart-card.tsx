import type { ReactNode } from "react"

import type { CsvRow } from "@/lib/csv"

import { DownloadCsvButton } from "@/components/download-csv-button"
import { Swatch } from "@/components/topic-page"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

/**
 * A chart in a card: title, short description, the chart, then its legend swatches under a
 * rule. `action` sits at the right of the header (a download button, for example).
 */
export function ChartCard({
  title,
  description,
  legend,
  action,
  csv,
  children,
  className = "",
}: {
  title: ReactNode
  description?: ReactNode
  /** Swatches under the chart */
  legend?: { color: string; label: string }[]
  action?: ReactNode
  /** The chart's data; adds a Download CSV button named after the title */
  csv?: { rows: CsvRow[]; columns?: string[] }
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={`min-w-0 border-border bg-card shadow-none ${className}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="space-y-1.5">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          {csv && typeof title === "string" && (
            <DownloadCsvButton title={title} rows={csv.rows} columns={csv.columns} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
        {legend && legend.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {legend.map((item) => (
                <Swatch key={item.label} color={item.color} label={item.label} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
