export type CsvValue = string | number | boolean | null | undefined
export type CsvRow = Record<string, CsvValue>

function cell(value: CsvValue): string {
  if (value == null) return ""
  const text = String(value)
  // RFC 4180: quote fields holding a delimiter, quote, or line break; double inner quotes
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * Rows to CSV text. Columns are `columns` when given, otherwise every key in first-seen order;
 * a row missing a column gets an empty field. Lines end in CRLF, per RFC 4180.
 */
export function toCsv(rows: CsvRow[], columns?: string[]): string {
  const keys = columns ?? [...new Set(rows.flatMap((row) => Object.keys(row)))]
  const lines = [
    keys.map(cell).join(","),
    ...rows.map((row) => keys.map((k) => cell(row[k])).join(",")),
  ]
  return `${lines.join("\r\n")}\r\n`
}

/** A file-safe name: lowercase words joined by dashes, ending in .csv */
export function csvFileName(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `${base || "data"}.csv`
}
