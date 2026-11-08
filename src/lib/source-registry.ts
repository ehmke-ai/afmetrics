/**
 * Reusable metadata for sourced metrics rendered on afmetrics.com and embedded in exports.
 */

export type ProvisionalStatus = "final" | "preliminary" | "estimate"

export type MetricMeasure =
  | "vote_choice"
  | "turnout"
  | "electorate_composition"
  | "margin_reported"

export type SourceRecord = {
  /** Stable id for manifests and exports */
  id: string
  /** Human-readable claim */
  claim: string
  measure: MetricMeasure
  population: string
  geography: string
  office: string
  dataPeriod: string
  /** CIRCLE hub subsection where the figure appears */
  hubSection: string
  /** When the upstream publisher released the analysis (if known) */
  releaseDate: string | null
  /**
   * Explicit upstream data snapshot when the primary source states one.
   * Null when only a checked/retrieved date applies.
   */
  dataSnapshotDate: string | null
  checkedDate: string
  primaryUrl: string
  upstreamNotes: string
  provisional: ProvisionalStatus
  democraticPct: number | null
  republicanPct: number | null
  qualitativeNote?: string
  marginDemMinusRep?: number | null
}

export type SourceBundle = {
  id: string
  label: string
  description: string
  dependency: string
  records: SourceRecord[]
}

export function sourceTimingSummary(record: SourceRecord): string {
  if (record.dataSnapshotDate) return record.dataSnapshotDate
  if (record.releaseDate) return `Release ${record.releaseDate}; checked ${record.checkedDate}`
  return `Checked ${record.checkedDate} — hub does not state a NORC file timestamp for this passage`
}

export function formatSourceFooter(record: SourceRecord): string {
  const parts = [
    record.claim,
    `Measure: ${record.measure.replaceAll("_", " ")}`,
    `Hub section: ${record.hubSection}`,
    `Population: ${record.population}`,
    `Geography: ${record.geography}`,
    `Office: ${record.office}`,
    `Period: ${record.dataPeriod}`,
    record.dataSnapshotDate ? `Data snapshot: ${record.dataSnapshotDate}` : `Retrieved: ${record.checkedDate}`,
    record.releaseDate ? `Release: ${record.releaseDate}` : null,
    `Checked: ${record.checkedDate}`,
    `Status: ${record.provisional}`,
    record.primaryUrl,
  ].filter(Boolean)
  return parts.join(" | ")
}
