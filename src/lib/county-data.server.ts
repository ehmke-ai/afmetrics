import { readFile } from "node:fs/promises"
import { join } from "node:path"

import type { CountyCosts } from "@/components/us-county-cost-map"
import type { CountyResults } from "@/components/us-county-election-map"
import type { CountyReligion } from "@/components/us-county-religion-map"
import type { CountyHistory } from "@/lib/county-history"
import { visaPeaks, type CountyVisas, type VisaPeaks } from "@/lib/county-visas"

/**
 * Server-only reads of the county data files in `public/data`, so a state page can hand its
 * maps just that state's counties instead of each browser downloading the national files.
 */

const files = new Map<string, Promise<unknown>>()

function readData<T>(name: string): Promise<T> {
  let file = files.get(name)
  if (!file) {
    // process.cwd() is the project root (see the Next.js docs for reading local files)
    file = readFile(join(process.cwd(), "public", "data", name), "utf8").then(JSON.parse)
    file.catch(() => files.delete(name))
    files.set(name, file)
  }
  return file as Promise<T>
}

function pick<V>(rows: Record<string, V>, prefix: string): Record<string, V> {
  const out: Record<string, V> = {}
  for (const fips in rows) if (fips.startsWith(prefix)) out[fips] = rows[fips]
  return out
}

function pickByYear<V>(
  years: Record<string, Record<string, V>>,
  prefix: string
): Record<string, Record<string, V>> {
  return Object.fromEntries(Object.entries(years).map(([year, rows]) => [year, pick(rows, prefix)]))
}

export type StateCountyData = {
  history: CountyHistory
  religion: CountyReligion
  costs: CountyCosts
  election: CountyResults
  visas: { visas: CountyVisas; peaks: VisaPeaks }
}

let peaks: Promise<VisaPeaks> | undefined

/** Every county data file, cut down to the counties whose FIPS starts with `stateFips` */
export async function stateCountyData(stateFips: string): Promise<StateCountyData> {
  if (!peaks) {
    peaks = readData<CountyVisas>("county-visas.json").then(visaPeaks)
    peaks.catch(() => (peaks = undefined))
  }
  const [history, religion, costs, election, visas, nationalPeaks] = await Promise.all([
    readData<CountyHistory>("county-history.json"),
    readData<CountyReligion>("county-religion.json"),
    readData<CountyCosts>("county-cost.json"),
    readData<CountyResults>("county-election-2024.json"),
    readData<CountyVisas>("county-visas.json"),
    peaks,
  ])
  return {
    history: pickByYear(history, stateFips),
    religion: pickByYear(religion, stateFips),
    costs: pick(costs, stateFips),
    election: pick(election, stateFips),
    visas: { visas: pick(visas, stateFips), peaks: nationalPeaks },
  }
}
