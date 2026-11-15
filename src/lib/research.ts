import { FileText, type LucideIcon } from "lucide-react"

export type ResearchArticle = {
  slug: string
  title: string
  summary: string
  publishedAt: string
}

export const researchArticles: ResearchArticle[] = [
  {
    slug: "nick-fuentes-america-first-groypers",
    title: "Nick Fuentes, America First, and the Groyper Movement",
    summary:
      "A sourced, point-in-time briefing on public biography, platform metrics, recent X engagement, and media coverage, compiled for AFMetrics on November 14, 2026.",
    publishedAt: "2026-11-14",
  },
]

export const researchNavIcon: LucideIcon = FileText

export function researchArticleHref(slug: string): string {
  return `/research/${slug}`
}