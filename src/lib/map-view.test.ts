import { describe, expect, it } from "vitest"

import {
  mapLevel,
  nationalMapHref,
  nationalMapView,
  queryValue,
  stateMapHref,
  stateMapView,
  type NationalMapView,
  type StateMapView,
} from "@/lib/map-view"

describe("queryValue / mapLevel", () => {
  it("keeps only single string values", () => {
    expect(queryValue("a")).toBe("a")
    expect(queryValue(["a", "b"])).toBeUndefined()
    expect(queryValue(undefined)).toBeUndefined()
  })

  it("defaults to the county level", () => {
    expect(mapLevel("state")).toBe("state")
    expect(mapLevel("county")).toBe("county")
    expect(mapLevel(undefined)).toBe("county")
  })
})

describe("nationalMapView", () => {
  it("defaults to work visas", () => {
    expect(nationalMapView(undefined, undefined)).toBe("visas")
    expect(nationalMapView("nonsense", undefined)).toBe("visas")
  })

  it("accepts aliases case-insensitively", () => {
    expect(nationalMapView("Election-2024", undefined)).toBe("election2024County")
    expect(nationalMapView("election", "state")).toBe("election2024")
    expect(nationalMapView("cost-of-living", "state")).toBe("costOfLiving")
    expect(nationalMapView("thirty-married-homeowner", undefined)).toBe("thirtyMarriedHomeowner")
    expect(nationalMapView("Midterms", undefined)).toBe("senate2026")
    expect(nationalMapView("house-2026", "state")).toBe("house2026")
    expect(nationalMapView("House", undefined)).toBe("house2026District")
  })

  const views: NationalMapView[] = [
    "visas",
    "costCounty",
    "costOfLiving",
    "native",
    "election2024County",
    "election2024",
    "senate2026",
    "house2026District",
    "house2026",
    "religion",
    "antiImmig",
    "enforcement",
    "thirtyMarriedHomeowner",
    "wealthShareUnder30",
  ]

  it.each(views)("round-trips %s through its href", (view) => {
    const url = new URL(nationalMapHref(view), "https://example.test")
    const parsed = nationalMapView(
      url.searchParams.get("view") ?? undefined,
      url.searchParams.get("level") ?? undefined
    )
    expect(parsed).toBe(view)
  })

  it("omits the query for the default view", () => {
    expect(nationalMapHref("visas")).toBe("/")
  })
})

describe("stateMapView", () => {
  const views: StateMapView[] = ["visas", "demographics", "election2024", "religion", "cost"]

  it.each(views)("round-trips %s through its href", (view) => {
    const url = new URL(stateMapHref("/united-states/ohio", view), "https://example.test")
    expect(url.pathname).toBe("/united-states/ohio")
    expect(stateMapView(url.searchParams.get("view") ?? undefined)).toBe(view)
  })

  it("ignores national-only views", () => {
    expect(stateMapView("enforcement")).toBe("visas")
  })
})
