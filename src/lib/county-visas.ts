/** [H-1B positions, H-2A workers, H-2B workers, population | null], keyed by county FIPS */
export type CountyVisa = [number, number, number, number | null]
export type CountyVisas = Record<string, CountyVisa>

export type VisaProgram = "h1b" | "h2a" | "h2b"
export type VisaScale = "positions" | "rate"

export const COUNTY_VISAS_URL = "/data/county-visas.json"

export const VISA_PROGRAM_INDEX: Record<VisaProgram, 0 | 1 | 2> = { h1b: 0, h2a: 1, h2b: 2 }

/** Peak per program and scale, keyed `${program}:${scale}` */
export type VisaPeaks = Record<`${VisaProgram}:${VisaScale}`, number>

export function per100k(count: number, population: number): number {
  return (count / population) * 100_000
}

/** The highest county value for one program and scale (at least 1, the bottom of the log scale) */
export function visaPeak(visas: CountyVisas, index: 0 | 1 | 2, scale: VisaScale): number {
  let peak = 1
  for (const row of Object.values(visas)) {
    const count = row[index]
    const population = row[3]
    const value = scale === "rate" ? (population ? per100k(count, population) : 0) : count
    if (value > peak) peak = value
  }
  return peak
}

export function visaPeaks(visas: CountyVisas): VisaPeaks {
  const peaks = {} as VisaPeaks
  for (const [program, index] of Object.entries(VISA_PROGRAM_INDEX) as [VisaProgram, 0 | 1 | 2][]) {
    for (const scale of ["positions", "rate"] as const) {
      peaks[`${program}:${scale}`] = visaPeak(visas, index, scale)
    }
  }
  return peaks
}
