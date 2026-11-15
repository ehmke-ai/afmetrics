"use client"

import type { JsonResult } from "@/lib/fetch-json"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { WorkFieldId } from "@/lib/where-you-stand"
import {
  type SchoolProgramId,
  type SchoolFile,
  SCHOOL_PROGRAMS,
  formatCount,
  formatPct,
} from "@/components/where-you-stand/shared"

export function schoolProgramTotal(
  row: Partial<Record<SchoolProgramId, number>> | undefined,
): number {
  return SCHOOL_PROGRAMS.reduce((sum, program) => sum + (row?.[program.id] ?? 0), 0)
}

export function SchoolCard({
  schoolId,
  schoolLabel,
  fieldId,
  fieldLabel,
  file,
}: {
  schoolId: string
  schoolLabel: string
  fieldId: WorkFieldId
  fieldLabel: string
  file: JsonResult<SchoolFile>
}) {
  if (file.error) {
    return (
      <div role="alert" className="flex items-center gap-3 text-sm text-muted-foreground">
        The school figures did not load.
        <Button type="button" size="sm" variant="outline" onClick={file.retry}>
          Try again
        </Button>
      </div>
    )
  }
  if (!file.data) {
    return <p className="text-sm text-muted-foreground">Loading school figures…</p>
  }
  const school = file.data[schoolId]
  if (!school) {
    return (
      <p className="text-sm text-muted-foreground">
        No FY 2025 certified filings for {schoolLabel}.
      </p>
    )
  }
  const fieldPrograms = school.fields?.[fieldId]
  const fieldCount = schoolProgramTotal(fieldPrograms)
  const schoolTotal = schoolProgramTotal(school)
  const share = schoolTotal > 0 ? (fieldCount / schoolTotal) * 100 : null
  const programRows = SCHOOL_PROGRAMS.flatMap((program) => {
    const value = fieldPrograms?.[program.id] ?? 0
    return value > 0 ? [{ ...program, value }] : []
  })
  const jobs = school.jobs ?? []
  const matching = jobs.filter((job) => job[1] === fieldId)
  const others = jobs.filter((job) => job[1] !== fieldId)
  const field = fieldLabel.toLowerCase()

  return (
    <Card className="border-border bg-card shadow-none">
      <CardHeader>
        <CardTitle
          className="text-4xl font-semibold tabular-nums"
          style={{ color: "var(--chart-1)" }}
        >
          {formatCount(fieldCount)}
        </CardTitle>
        <CardDescription>
          {fieldCount === 0
            ? `No certified foreign-worker positions in ${field} at ${schoolLabel}, FY 2025.`
            : `Certified foreign-worker positions in ${field} at ${schoolLabel}, FY 2025.`}
          {share != null && fieldCount > 0 && (
            <>
              {" "}
              That is {formatPct(share)} of this school’s certified positions (
              {formatCount(schoolTotal)}).
            </>
          )}
          {share != null && fieldCount === 0 && schoolTotal > 0 && (
            <> The school certified {formatCount(schoolTotal)} positions in other fields.</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {programRows.length > 0 && (
          <ul className="mb-4 flex flex-col gap-1.5 text-foreground">
            {programRows.map((row) => (
              <li
                key={row.id}
                className="flex items-baseline justify-between gap-4 text-foreground"
              >
                <span>{row.label}</span>
                <span className="tabular-nums">{formatCount(row.value)}</span>
              </li>
            ))}
          </ul>
        )}
        {jobs.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 font-medium text-foreground">Positions</p>
            <ul data-export-expand className="flex max-h-96 flex-col gap-1.5 overflow-y-auto">
              {[...matching, ...others].map((job) => {
                const match = job[1] === fieldId
                return (
                  <li
                    key={`${job[1]}-${job[0]}`}
                    className={
                      match
                        ? "flex items-baseline justify-between gap-4 font-semibold"
                        : "flex items-baseline justify-between gap-4 text-muted-foreground"
                    }
                  >
                    <span style={match ? { color: "var(--chart-1)" } : undefined}>{job[0]}</span>
                    <span
                      className="tabular-nums"
                      style={match ? { color: "var(--chart-1)" } : undefined}
                    >
                      {formatCount(job[2])}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        <p>
          Certified job slots for this employer, not people hired. The same worker can be counted
          twice when the school certifies both a temporary visa and a green card in the same year.
          J-1 scholars, student work permits, TN, and O-1 are not in these files. University
          hospitals that file under a hospital industry code are not included.
        </p>
      </CardContent>
    </Card>
  )
}
