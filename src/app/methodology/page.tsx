import type { Metadata } from "next"

import { SectionHeading } from "@/components/layout/section"
import { PageHeader } from "@/components/topic-page"
import { Card, CardContent } from "@/components/ui/card"
import { DATASETS, DOWNLOADS } from "@/lib/datasets"

const description =
  "Where every figure on afmetrics.com comes from: sources, vintages, the scripts that build each file, what they change, and what to keep in mind."

export const metadata: Metadata = {
  title: "Methodology",
  description,
  openGraph: { title: "Methodology — afmetrics.com", description },
}

const GITHUB_TREE = "https://github.com/ehmke-ai/afmetrics/blob/main/"

export default function MethodologyPage() {
  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 pt-6 pb-10 sm:px-6">
      <PageHeader title="Methodology" description={description} />

      <nav aria-label="Datasets" className="mb-2">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {DATASETS.map((d) => (
            <li key={d.id}>
              <a
                href={`#${d.id}`}
                className="text-muted-foreground hover:text-foreground hover:underline"
              >
                {d.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 flex flex-col gap-4">
        {DATASETS.map((d) => (
          <Card key={d.id} id={d.id} className="scroll-mt-20 border-border bg-card shadow-none">
            <CardContent className="space-y-4 pt-6 text-sm">
              <div>
                <h2 className="font-heading text-xl text-foreground">{d.name}</h2>
                <p className="mt-1 text-muted-foreground">
                  <a href={d.url} className="underline underline-offset-2 hover:text-foreground">
                    {d.source}
                  </a>{" "}
                  · {d.vintage}
                </p>
              </div>
              <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[10rem_1fr]">
                <dt className="eyebrow pt-0.5">Built by</dt>
                <dd>
                  {d.script ? (
                    <a
                      href={`${GITHUB_TREE}${d.script}`}
                      className="font-medium underline underline-offset-2"
                    >
                      {d.script}
                    </a>
                  ) : (
                    "Entered by hand from the published tables"
                  )}
                  <span className="text-muted-foreground"> · updated {d.updated}</span>
                </dd>
                <dt className="eyebrow pt-0.5">Files</dt>
                <dd className="text-muted-foreground">{d.outputs.join(", ")}</dd>
                <dt className="eyebrow pt-0.5">Transformations</dt>
                <dd>
                  <ul className="list-disc space-y-1 pl-4">
                    {d.transformations.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </dd>
                <dt className="eyebrow pt-0.5">Caveats</dt>
                <dd>
                  <ul className="list-disc space-y-1 pl-4">
                    {d.caveats.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </dd>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>

      <SectionHeading
        id="downloads"
        title="Data downloads"
        description="The generated JSON files the maps read, as published. Tables and charts across the site also have a Download CSV button."
      />
      <Card className="border-border bg-card shadow-none">
        <CardContent className="p-0">
          <ul className="divide-y divide-border text-sm">
            {DOWNLOADS.map(({ dataset, href }) => (
              <li
                key={href}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
              >
                <span>
                  <span className="font-medium text-foreground">{dataset.name}</span>{" "}
                  <span className="text-muted-foreground">({dataset.vintage})</span>
                </span>
                <a href={href} download className="tabular-nums underline underline-offset-2">
                  {href.replace("/data/", "")}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
