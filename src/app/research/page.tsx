import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader } from "@/components/topic-page"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { researchArticleHref, researchArticles } from "@/lib/research"

export const metadata: Metadata = {
  title: "Research",
  description:
    "Long-form, sourced research briefings from AF Metrics on public figures, movements, and platform metrics.",
  openGraph: {
    title: "Research — afmetrics.com",
    description:
      "Long-form, sourced research briefings from AF Metrics on public figures, movements, and platform metrics.",
  },
}

export default function ResearchIndexPage() {
  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="AF Metrics"
        title="Research"
        description="Sourced, point-in-time briefings with platform metrics, timelines, and primary links. Figures include pull or publication dates."
      />

      <ul className="mt-2 flex flex-col gap-4">
        {researchArticles.map((article) => (
          <li key={article.slug}>
            <Card className="border-border bg-card shadow-none transition-colors hover:bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  <Link
                    href={researchArticleHref(article.slug)}
                    className="hover:underline"
                  >
                    {article.title}
                  </Link>
                </CardTitle>
                <CardDescription>{article.summary}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="fine-print">
                  Compiled {article.publishedAt}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  )
}