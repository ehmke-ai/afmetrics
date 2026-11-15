import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { countiesIn, fipsByPlace, schoolById } from "@/components/where-you-stand/shared"
import { stateNavBySlug } from "@/lib/states"
import { DEMOGRAPHIC_GROUPS, generation, workField } from "@/lib/where-you-stand"

/**
 * The form's state, read from the URL so results are shareable and follow back/forward.
 * `write` replaces the given query keys; county edits are mirrored locally so typing stays
 * responsive while the URL catches up.
 */
export function useWhereYouStandParams() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stateSlug = searchParams.get("state")
  const urlCountyKey = searchParams.getAll("county").join("\0")
  const groupId = searchParams.get("group")
  const fieldId = searchParams.get("field")
  const generationId = searchParams.get("generation")
  const schoolId = searchParams.get("school")
  const remote = searchParams.get("remote") === "1"
  const [countyKey, setCountyKey] = useState(urlCountyKey)
  // Follow the URL when it changes (back/forward); local state keeps typing responsive.
  const [syncedCountyKey, setSyncedCountyKey] = useState(urlCountyKey)
  if (urlCountyKey !== syncedCountyKey) {
    setSyncedCountyKey(urlCountyKey)
    setCountyKey(urlCountyKey)
  }

  const state = stateSlug ? stateNavBySlug[stateSlug] : undefined
  const counties = state ? countiesIn(state.slug) : []
  const selectedCounties = (countyKey ? countyKey.split("\0") : []).flatMap((slug) => {
    const row = counties.find((item) => item.slug === slug)
    return row ? [row] : []
  })
  const group = DEMOGRAPHIC_GROUPS.find((row) => row.id === groupId)
  const field = workField(fieldId)
  const cohort = generation(generationId)
  const school = schoolId ? schoolById.get(schoolId) : undefined
  const places = state
    ? selectedCounties.flatMap((county) => {
        const fips = fipsByPlace[state.slug]?.[county.slug]
        return fips ? [{ ...county, fips }] : []
      })
    : []

  function write(next: Record<string, string | string[] | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(next)) {
      params.delete(key)
      const items = Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []
      for (const item of items) params.append(key, item)
    }
    const query = params.toString()
    router.replace(query ? `/you?${query}` : "/you", { scroll: false })
  }

  function setCounties(slugs: string[]) {
    setCountyKey(slugs.join("\0"))
    write({ county: slugs })
  }

  return {
    state,
    counties,
    selectedCounties,
    group,
    field,
    cohort,
    school,
    remote,
    places,
    write,
    setCounties,
    clearCounties: () => setCountyKey(""),
  }
}

export type WhereYouStandParams = ReturnType<typeof useWhereYouStandParams>
