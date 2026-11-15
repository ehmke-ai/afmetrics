import type { MetadataRoute } from "next"

import { DATA_LAST_UPDATED } from "@/lib/datasets"
import { researchArticleHref, researchArticles } from "@/lib/research"
import { getCounties, statesData } from "@/lib/state-data"
import { countySlug } from "@/lib/states"

const BASE = "https://afmetrics.com"

/** Every page: the sections, each state, each county, and the research articles */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${DATA_LAST_UPDATED}T00:00:00Z`)
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${BASE}${path}`,
    lastModified,
    priority,
  })

  return [
    page("/", 1),
    page("/states", 0.9),
    page("/work-visas", 0.7),
    page("/you", 0.7),
    page("/methodology", 0.5),
    page("/research", 0.5),
    ...researchArticles.map((a) => ({
      url: `${BASE}${researchArticleHref(a.slug)}`,
      lastModified: new Date(`${a.publishedAt}T00:00:00Z`),
      priority: 0.5,
    })),
    ...statesData.map((s) => page(`/united-states/${s.slug}`, 0.8)),
    ...statesData.flatMap((s) =>
      getCounties(s).map((c) => page(`/united-states/${s.slug}/${countySlug(c.name)}`, 0.6)),
    ),
  ]
}
