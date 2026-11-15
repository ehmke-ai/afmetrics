import countyLabels from "@/data/county-labels.json"
import countyFips from "@/data/county-fips.json"
import schools from "@/data/schools.json"
import stateGenerationPop from "@/data/state-generation-pop.json"
import {
  VISA_PROGRAMS,
  type GenerationId,
  type VisaProgramId,
  type WorkFieldId,
} from "@/lib/where-you-stand"

export type FieldFile = Record<
  string,
  Partial<Record<WorkFieldId, Partial<Record<VisaProgramId, number>>>>
>

export type PopFile = Record<string, Record<GenerationId, number>>

export type SchoolProgramId = "h1b" | "specialty" | "perm"

export type SchoolVisa = Partial<Record<SchoolProgramId, number>> & {
  fields?: Partial<Record<WorkFieldId, Partial<Record<SchoolProgramId, number>>>>
  jobs?: [string, WorkFieldId, number][]
}

export type SchoolFile = Record<string, SchoolVisa>

export type SchoolOption = { value: string; label: string }

export type CountyOption = { slug: string; label: string }

export type CountyPlace = CountyOption & { fips: string }

export const labels = countyLabels as Record<string, Record<string, string>>

export const fipsByPlace = countyFips as Record<string, Record<string, string>>

export const population = stateGenerationPop as PopFile

export const schoolRows = schools as {
  id: string
  name: string
  city: string
  state: string
}[]

export const schoolOptions: SchoolOption[] = schoolRows.map((row) => ({
  value: row.id,
  label: [row.name, row.city, row.state].filter(Boolean).join(", "),
}))

export const schoolById = new Map(schoolOptions.map((row) => [row.value, row]))

export const FIELD_URL = "/data/county-visa-fields.json"

export const HISTORY_URL = "/data/county-history.json"

export const SCHOOL_URL = "/data/school-visas.json"

export const SCHOOL_PROGRAMS = VISA_PROGRAMS.filter(
  (program): program is (typeof VISA_PROGRAMS)[number] & { id: SchoolProgramId } =>
    program.id === "h1b" || program.id === "specialty" || program.id === "perm",
)

export function countiesIn(stateSlug: string): CountyOption[] {
  const rows = labels[stateSlug]
  if (rows) {
    return Object.entries(rows)
      .map(([slug, label]) => ({ slug, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }
  if (stateSlug === "district-of-columbia") {
    return [{ slug: "district-of-columbia", label: "District of Columbia" }]
  }
  return []
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-US")
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`
}

export function placeHref(stateSlug: string, countySlug: string): string {
  if (stateSlug === "district-of-columbia") return "/united-states/district-of-columbia"
  return `/united-states/${stateSlug}/${countySlug}`
}

export function placeList(labels: string[]): string {
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
  return "these counties"
}
