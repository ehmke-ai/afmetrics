import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { BONE, CATEGORICAL, NEUTRAL, NEUTRAL_DEEP } from "@/lib/palette"

const css = readFileSync(join(__dirname, "../app/globals.css"), "utf8")

/** `--name: value;` declarations inside the first block that starts with `selector {` */
function tokens(selector: string): Record<string, string> {
  const start = css.indexOf(`\n${selector} {`)
  if (start < 0) throw new Error(`No ${selector} block`)
  const block = css.slice(start, css.indexOf("\n}", start))
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()])
  )
}

describe("globals.css mirrors lib/palette", () => {
  const light = tokens(":root")
  const dark = tokens(".dark")

  it("has the categorical slots in order, in both themes", () => {
    CATEGORICAL.forEach((color, i) => {
      expect(light[`chart-${i + 1}`]).toBe(color.light)
      expect(dark[`chart-${i + 1}`]).toBe(color.dark)
    })
  })

  it("has the neutrals and bone", () => {
    expect(light["chart-neutral"]).toBe(NEUTRAL.light)
    expect(dark["chart-neutral"]).toBe(NEUTRAL.dark)
    expect(light["chart-neutral-deep"]).toBe(NEUTRAL_DEEP.light)
    expect(dark["chart-neutral-deep"]).toBe(NEUTRAL_DEEP.dark)
    expect(light["chart-bone"]).toBe(BONE.light)
    expect(dark["chart-bone"]).toBe(BONE.dark)
  })

  it("points the semantic tokens at palette slots", () => {
    expect(light["party-dem"]).toBe("var(--chart-1)")
    expect(light["party-rep"]).toBe("var(--chart-8)")
    expect(light["cost-low"]).toBe("var(--chart-3)")
    expect(light["cost-high"]).toBe("var(--chart-2)")
    expect(light["visa-h1b"]).toBe("var(--chart-1)")
    expect(light["visa-h2a"]).toBe("var(--chart-3)")
    expect(light["visa-h2b"]).toBe("var(--chart-2)")
  })
})
