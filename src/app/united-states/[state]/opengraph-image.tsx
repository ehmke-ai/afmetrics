import { OG_SIZE, ogCard } from "@/lib/og-card"
import { getStateBySlug, statesData } from "@/lib/state-data"
import { election2024Margin, latestPopulation, stateMapByAbbr } from "@/lib/states"

export const alt = "State profile on afmetrics.com"
export const size = OG_SIZE
export const contentType = "image/png"

export function generateStaticParams() {
  return statesData.map((s) => ({ state: s.slug }))
}

export default async function Image({ params }: { params: Promise<{ state: string }> }) {
  const { state: slug } = await params
  const state = getStateBySlug(slug)
  if (!state) return ogCard({ eyebrow: "United States", title: "State not found", stats: [] })

  const population = latestPopulation(state)
  const metrics = stateMapByAbbr[state.abbr]
  const margin = metrics ? election2024Margin(metrics) : null
  const nonHispanicWhite = Math.round((population.european + (population.arab ?? 0)) * 10) / 10

  return ogCard({
    eyebrow: "State profile",
    title: state.state,
    stats: [
      { label: "Population", value: `${state.population.toFixed(1)}M` },
      { label: "Non-Hispanic White", value: `${nonHispanicWhite}%` },
      {
        label: "2024 margin",
        value: margin == null ? "—" : `${margin >= 0 ? "R" : "D"}+${Math.abs(margin).toFixed(1)}`,
      },
      { label: "Married homeowners at 30", value: `${state.thirtyMarriedHomeowner}%` },
    ],
  })
}
