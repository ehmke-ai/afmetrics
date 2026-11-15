"use client"

import Link from "next/link"
import { Fragment, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VISA_PROGRAMS, type VisaProgramId, type WorkFieldId } from "@/lib/where-you-stand"
import {
  type FieldFile,
  type CountyPlace,
  formatCount,
  formatPct,
  placeHref,
  placeList,
} from "@/components/where-you-stand/shared"

export function nationalSlots(fields: FieldFile, fieldId: WorkFieldId) {
  const programs: Partial<Record<VisaProgramId, number>> = {}
  let count = 0
  let all = 0
  for (const buckets of Object.values(fields)) {
    const fieldPrograms = buckets[fieldId]
    if (fieldPrograms) {
      for (const program of VISA_PROGRAMS) {
        const value = fieldPrograms[program.id] ?? 0
        if (value === 0) continue
        programs[program.id] = (programs[program.id] ?? 0) + value
        count += value
      }
    }
    for (const row of Object.values(buckets)) {
      if (!row) continue
      for (const program of VISA_PROGRAMS) all += row[program.id] ?? 0
    }
  }
  return { programs, count, all }
}

export function fieldSlots(fields: FieldFile, fips: string, fieldId: WorkFieldId) {
  const buckets = fields[fips] ?? {}
  const programs = buckets[fieldId] ?? {}
  const count = VISA_PROGRAMS.reduce((sum, program) => sum + (programs[program.id] ?? 0), 0)
  const countyTotal = Object.values(buckets).reduce((sum, row) => {
    return sum + VISA_PROGRAMS.reduce((inner, program) => inner + (row?.[program.id] ?? 0), 0)
  }, 0)
  return { programs, count, countyTotal }
}

export function VisaCard({
  stateSlug,
  places,
  fieldId,
  fieldLabel,
  remote,
  fields,
}: {
  stateSlug: string
  places: CountyPlace[]
  fieldId: WorkFieldId
  fieldLabel: string
  remote: boolean
  fields: FieldFile
}) {
  const rows = places.map((place) => ({
    ...place,
    ...fieldSlots(fields, place.fips, fieldId),
  }))
  const count = rows.reduce((sum, row) => sum + row.count, 0)
  const countyTotal = rows.reduce((sum, row) => sum + row.countyTotal, 0)
  const share = countyTotal > 0 ? (count / countyTotal) * 100 : null
  const national = useMemo(
    () => (remote ? nationalSlots(fields, fieldId) : null),
    [remote, fields, fieldId],
  )
  const programs = VISA_PROGRAMS.flatMap((program) => {
    const value = rows.reduce((sum, row) => sum + (row.programs[program.id] ?? 0), 0)
    return value > 0 ? [{ ...program, value }] : []
  })
  const compare = national
    ? VISA_PROGRAMS.flatMap((program) => {
        const local = rows.reduce((sum, row) => sum + (row.programs[program.id] ?? 0), 0)
        const country = national.programs[program.id] ?? 0
        return local > 0 || country > 0
          ? [{ id: program.id, label: program.label, local, country }]
          : []
      })
    : []
  const compareRows =
    national && compare.length !== 1
      ? [
          ...compare,
          {
            id: "total",
            label: "Total",
            local: count,
            country: national.count,
          },
        ]
      : compare
  const field = fieldLabel.toLowerCase()
  const where = placeList(rows.map((row) => row.label))
  const several = rows.length > 1
  const nationalShare = national && national.all > 0 ? (national.count / national.all) * 100 : null

  return (
    <Card className="border-border bg-card shadow-none">
      <CardHeader>
        <CardTitle className="text-4xl font-semibold tabular-nums">{formatCount(count)}</CardTitle>
        <CardDescription>
          {count === 0
            ? `No certified foreign-worker job filings in ${field} in ${where}, FY 2025.`
            : `Certified foreign-worker job filings in ${field} in ${where}, FY 2025.`}
          {share != null && count > 0 && (
            <>
              {" "}
              That is {formatPct(share)} of{" "}
              {several ? "certified filings in these counties" : "this county’s certified filings"}{" "}
              ({formatCount(countyTotal)}).
            </>
          )}
          {national && nationalShare != null && (
            <>
              {" "}
              Nationwide, {formatCount(national.count)} in this field, {formatPct(nationalShare)} of
              certified filings in the country ({formatCount(national.all)}).
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {several && (
          <div className="mb-4">
            <p className="mb-2 font-medium text-foreground">By county</p>
            <ul className="flex flex-col gap-1.5 text-foreground">
              {rows.map((row) => (
                <li key={row.fips} className="flex items-baseline justify-between gap-4">
                  <Link
                    href={placeHref(stateSlug, row.slug)}
                    className="underline-offset-2 hover:underline"
                  >
                    {row.label}
                  </Link>
                  <span className="tabular-nums">{formatCount(row.count)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {compareRows.length > 0 ? (
          <div className="mb-3 grid grid-cols-[minmax(0,1.4fr)_minmax(4.5rem,auto)_minmax(6.5rem,auto)] gap-x-4 gap-y-1.5 text-foreground">
            <span />
            <span className="text-right text-xs leading-tight text-muted-foreground">
              {several ? "Selected" : rows[0]?.label}
            </span>
            <span className="text-right text-xs leading-tight text-muted-foreground">
              United States
            </span>
            {compareRows.map((row) => (
              <Fragment key={row.id}>
                <span className={row.id === "total" ? "font-medium" : undefined}>{row.label}</span>
                <span className="text-right tabular-nums">{formatCount(row.local)}</span>
                <span className="text-right tabular-nums">{formatCount(row.country)}</span>
              </Fragment>
            ))}
          </div>
        ) : (
          programs.length > 0 && (
            <div className="mb-3">
              {several && <p className="mb-2 font-medium text-foreground">By visa</p>}
              <ul className="flex flex-col gap-1.5 text-foreground">
                {programs.map((row) => (
                  <li key={row.id} className="flex items-baseline justify-between gap-4">
                    <span>{row.label}</span>
                    <span className="tabular-nums">{formatCount(row.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
        <p>
          Certified job slots in this occupation, not people living in{" "}
          {several ? "these counties" : "the county"}. The same worker can be counted twice when an
          employer certifies both a temporary visa and a green card in the same year. L-1, TN, O-1,
          student work permits, and green cards that skip labor certification are not in these
          files.
        </p>
        <p className="mt-3">
          {rows.length === 1 && (
            <>
              <Link
                href={placeHref(stateSlug, rows[0].slug)}
                className="text-foreground underline-offset-2 hover:underline"
              >
                {rows[0].label} profile
              </Link>
              {" · "}
            </>
          )}
          <Link href="/work-visas" className="text-foreground underline-offset-2 hover:underline">
            Work visas
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
