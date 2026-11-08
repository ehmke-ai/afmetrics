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
  /** When the upstream publisher released the analysis (if known) */
  releaseDate: string | null
  /** NORC snapshot, CPI reference month, etc. */
  dataSnapshotDate: string | null
  checkedDate: string
  primaryUrl: string
  upstreamNotes: string
  provisional: ProvisionalStatus
  /** Percentages are only set when explicitly reported by the primary source */
  democraticPct: number | null
  republicanPct: number | null
  /** Qualitative when the source gives a threshold, not an exact split */
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

export function formatSourceFooter(record: SourceRecord): string {
  const parts = [
    record.claim,
    `Measure: ${record.measure.replaceAll("_", " ")}`,
    `Population: ${record.population}`,
    `Office: ${record.office}`,
    `Period: ${record.dataPeriod}`,
    record.dataSnapshotDate ? `Data snapshot: ${record.dataSnapshotDate}` : null,
    record.releaseDate ? `Release: ${record.releaseDate}` : null,
    `Checked: ${record.checkedDate}`,
    `Status: ${record.provisional}`,
    record.primaryUrl,
  ].filter(Boolean)
  return parts.join(" | ")
}
