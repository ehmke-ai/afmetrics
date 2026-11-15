import { formatRatio, priceToIncome } from "@/lib/cost-of-living"
import { OG_SIZE, ogCard } from "@/lib/og-card"
import { getCountyBySlug, getCountyCost, getStateBySlug } from "@/lib/state-data"
import { countyLabel } from "@/lib/states"

export const alt = "County profile on afmetrics.com"
export const size = OG_SIZE
export const contentType = "image/png"

// 3,000+ counties: render each card on first request and cache it, rather than at build time
export function generateStaticParams() {
  return []
}

export default async function Image({
  params,
}: {
  params: Promise<{ state: string; county: string }>
}) {
  const { state: stateSlug, county: countySlug } = await params
  const state = getStateBySlug(stateSlug)
  const county = state && getCountyBySlug(state, countySlug)
  if (!state || !county) {
    return ogCard({ eyebrow: "United States", title: "County not found", stats: [] })
  }

  const cost = getCountyCost(county)
  const ratio = cost ? priceToIncome(cost[1], cost[0]) : null

  return ogCard({
    eyebrow: `County profile · ${state.state}`,
    title: countyLabel(county),
    stats: [
      { label: "Non-Hispanic White", value: `${county.nonHispanicWhitePct}%` },
      { label: "Hispanic", value: `${county.hispanicPct}%` },
      { label: "Black", value: `${county.blackPct}%` },
      { label: "Home price ÷ income", value: ratio == null ? "—" : formatRatio(ratio) },
    ],
  })
}
