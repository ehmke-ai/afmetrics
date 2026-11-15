import type { Metadata } from "next"

import { NickFuentesResearch } from "@/components/research/nick-fuentes-research"

const title = "Nick Fuentes, America First, and the Groyper Movement"
const description =
  "A sourced, point-in-time briefing on public biography, platform metrics, recent X engagement, and media coverage, compiled for AFMetrics on November 14, 2026."

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} — afmetrics.com`,
    description,
    type: "article",
    publishedTime: "2026-11-14",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

export default function NickFuentesResearchPage() {
  return <NickFuentesResearch />
}