import { describe, expect, it } from "vitest"

import {
  formatDollars,
  formatDollarsShort,
  formatRatio,
  formatRent,
  formatRpp,
  priceToIncome,
  rentToIncome,
} from "@/lib/cost-of-living"

describe("ratios", () => {
  it("computes price to income", () => {
    expect(priceToIncome(300_000, 75_000)).toBe(4)
  })

  it("computes annual rent as a share of income", () => {
    expect(rentToIncome(1_000, 60_000)).toBe(20)
  })

  it("returns null for missing or zero inputs", () => {
    expect(priceToIncome(null, 50_000)).toBeNull()
    expect(priceToIncome(100_000, 0)).toBeNull()
    expect(rentToIncome(1_000, null)).toBeNull()
  })

  it("keeps a zero numerator", () => {
    expect(priceToIncome(0, 50_000)).toBe(0)
  })
})

describe("formatting", () => {
  it("shortens dollars", () => {
    expect(formatDollarsShort(80_700)).toBe("$81K")
    expect(formatDollarsShort(1_234_567)).toBe("$1.23M")
    expect(formatDollarsShort(950)).toBe("$950")
  })

  it("formats full dollars, rent and ratios", () => {
    expect(formatDollars(1_234_567)).toBe("$1,234,567")
    expect(formatRent(1_250)).toBe("$1,250/mo")
    expect(formatRatio(4.26)).toBe("4.3×")
  })

  it("formats regional price parities with a signed difference", () => {
    expect(formatRpp(110.7)).toBe("110.7 (+10.7%)")
    expect(formatRpp(92.5)).toBe("92.5 (−7.5%)")
  })
})
