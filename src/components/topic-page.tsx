import Link from "next/link"

import { DownloadCsvButton } from "@/components/download-csv-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <i
        className="inline-block size-3.5"
        style={{ background: color }}
        aria-hidden
      />
      {label}
    </span>
  )
}

export function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 text-[17px] font-semibold tabular-nums" style={{ color }}>
        {value}
      </dd>
    </div>
  )
}

/** Visible page title, shared by every page: section eyebrow, h1, one-line description */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <header className="mb-7">
      {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
      <h1 className="page-title">{title}</h1>
      {description && <p className="page-sub">{description}</p>}
      {children}
    </header>
  )
}

export function TopicPage({
  eyebrow,
  title,
  description,
  notes,
  children,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description: React.ReactNode
  notes?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 pt-6 pb-10 sm:px-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      {children}

      <footer className="fine-print mt-6 max-w-3xl">
        <strong className="font-semibold text-foreground">Notes:</strong> {notes} Values are
        rounded.
      </footer>
    </main>
  )
}

export type RankingRow = {
  name: string
  href?: string
  value: string
  // Bar fill, 0–1.
  intensity: number
  /** Defaults to the row's position */
  rank?: number
}

export function RankingTable({
  rows,
  valueLabel,
  nameLabel = "Name",
  intensityLabel = "Intensity",
  color,
  badgeClassName,
  className = "mt-7",
  csvTitle,
}: {
  /** Adds a Download CSV button; the file is named after this */
  csvTitle?: string
  rows: RankingRow[]
  valueLabel: string
  nameLabel?: string
  intensityLabel?: string
  color: string
  badgeClassName: string
  className?: string
}) {
  return (
    <Card className={`${className} min-w-0 border-border bg-card shadow-none`}>
      {csvTitle && (
        <div className="flex justify-end border-b px-3 py-2">
          <DownloadCsvButton
            title={csvTitle}
            rows={rows.map((row, i) => ({
              rank: row.rank ?? i + 1,
              [nameLabel]: row.name,
              [valueLabel]: row.value,
            }))}
          />
        </div>
      )}
      <CardContent className="p-0">
        <ul className="md:hidden">
          {rows.map((row, i) => (
            <li key={row.name} className="border-b px-3 py-2.5 last:border-b-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`min-w-7 shrink-0 justify-center ${badgeClassName}`}
                  >
                    {row.rank ?? i + 1}
                  </Badge>
                  {row.href ? (
                    <Link href={row.href} className="min-w-0 font-medium hover:underline">
                      {row.name}
                    </Link>
                  ) : (
                    <span className="min-w-0 font-medium">{row.name}</span>
                  )}
                </div>
                <span
                  className="max-w-[55%] min-w-0 text-right text-[13px] leading-snug font-medium"
                  style={{ color }}
                >
                  {row.value}
                </span>
              </div>
              <span className="mt-2 block h-2 overflow-hidden bg-muted" aria-hidden>
                <span
                  className="block h-full"
                  style={{ width: `${row.intensity * 100}%`, backgroundColor: color }}
                />
              </span>
            </li>
          ))}
        </ul>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Rank</TableHead>
                <TableHead>{nameLabel}</TableHead>
                <TableHead className="text-right">{valueLabel}</TableHead>
                <TableHead className="min-w-[8rem]">{intensityLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={row.name}>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`min-w-7 justify-center ${badgeClassName}`}
                    >
                      {row.rank ?? i + 1}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {row.href ? (
                      <Link href={row.href} className="hover:underline">
                        {row.name}
                      </Link>
                    ) : (
                      row.name
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums" style={{ color }}>
                    {row.value}
                  </TableCell>
                  <TableCell>
                    <span
                      className="block h-2 min-w-24 overflow-hidden bg-muted"
                      aria-hidden
                    >
                      <span
                        className="block h-full"
                        style={{ width: `${row.intensity * 100}%`, backgroundColor: color }}
                      />
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
