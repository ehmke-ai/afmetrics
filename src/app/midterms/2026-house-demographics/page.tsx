import type { Metadata } from "next"
import Link from "next/link"

import { MidtermsHouseDataTable } from "@/components/midterms-house-data-table"
import { MidtermsHouseVoteChart } from "@/components/midterms-house-vote-chart"
import { PageHeader, Stat } from "@/components/topic-page"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  MIDTERMS_HOUSE_CHECKED_DATE,
  midterms2026HouseBundle,
  recordById,
  YOUTH_SHIFTS_NORC_SNAPSHOT,
} from "@/lib/midterms-2026-house"

export const metadata: Metadata = {
  title: "2026 midterms — House vote by demographics",
  description:
    "Preliminary 2026 U.S. House vote choice by age, gender, and race among young voters. CIRCLE analysis of NORC data, with source metadata and turnout shown separately.",
}

const youthNational = recordById("midterms-2026-house-youth-national")!
const youthMen = recordById("midterms-2026-house-youth-men")!
const youthTurnout = recordById("midterms-2026-youth-turnout-estimate")!

export default function Midterms2026HouseDemographicsPage() {
  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="United States · 2026 midterms"
        title="House vote by demographics"
        description="How different groups voted for U.S. House candidates in 2026. Vote choice, turnout, and share of the electorate are separate measures — do not mix them."
      >
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="destructive" className="uppercase tracking-wide">
            Preliminary data
          </Badge>
          <span className="text-sm text-muted-foreground">
            CIRCLE / NORC preliminary · checked {MIDTERMS_HOUSE_CHECKED_DATE} · hub publication date not
            stated
          </span>
        </div>
      </PageHeader>

      <Card className="mb-7 border-amber-500/40 bg-amber-500/5 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Source dependency</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          {midterms2026HouseBundle.description}{" "}
          <span className="font-medium text-foreground">
            {midterms2026HouseBundle.dependency}
          </span>{" "}
          CIRCLE&apos;s hub compares some groups to{" "}
          <strong className="text-foreground">2024 presidential AP VoteCast</strong> (conducted by NORC for
          the Associated Press) — a different office and electorate. That is context, not evidence that the
          same individuals switched parties. Only the{" "}
          <strong className="text-foreground">Youth Shifts</strong> passage states an explicit NORC file
          timestamp ({YOUTH_SHIFTS_NORC_SNAPSHOT}); other rows use per-row checked dates in the table.
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-none">
        <CardContent className="pt-6">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Stat
              label="Youth House vote (18–29)"
              value={`${youthNational.democraticPct}% D / ${youthNational.republicanPct}% R`}
              color="#2563eb"
            />
            <Stat
              label="Young men who voted (House)"
              value={`${youthMen.democraticPct}% D / ${youthMen.republicanPct}% R`}
              color="#2563eb"
            />
            <Stat
              label="Estimated youth turnout"
              value={youthTurnout.qualitativeNote ?? "27%"}
            />
          </dl>
          <p className="fine-print mt-4 text-muted-foreground">
            Young men figures are among <strong>male voters ages 18–29</strong>, not all men under 30 or
            all eligible young men. Turnout line uses CIRCLE&apos;s SSRS-based model, not NORC vote choice.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-7 border-border bg-card shadow-none">
        <CardHeader className="pb-2">
          <CardTitle>House vote choice</CardTitle>
          <CardDescription>
            NORC Civic Health &amp; Elections Project, via{" "}
            <Link
              href="https://circle.tufts.edu/2026-election"
              className="underline underline-offset-2"
            >
              CIRCLE 2026 election hub
            </Link>
            . Bars appear only where CIRCLE reports a Democratic share; Republican bars only when both
            shares are published.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MidtermsHouseVoteChart />
        </CardContent>
      </Card>

      <Card className="mt-7 border-border bg-card shadow-none">
        <CardHeader className="pb-2">
          <CardTitle>Sourced table</CardTitle>
          <CardDescription>
            Office, source timing, and status appear on every row. Expand <strong>Source</strong> for hub
            section, geography, notes, and URL. CSV export carries the same fields per row (no blanket NORC
            timestamp).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MidtermsHouseDataTable />
        </CardContent>
      </Card>

      <Card className="mt-7 border-border bg-card shadow-none">
        <CardHeader className="pb-2">
          <CardTitle>Methodology &amp; limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">Vote choice</strong> rows describe how voters in a group split
            between House candidates. They do not show how many people voted (turnout) or what share of all
            ballots a group cast (composition).
          </p>
          <p>
            <strong className="text-foreground">Race × gender</strong> appears only where CIRCLE published exact
            Democratic and Republican House shares (currently young white men and young Latino men). CIRCLE
            reports wider margins for some groups (e.g., young white women +32 points in 2026) without exact
            splits on the checked hub — those are omitted from numeric charts here.
          </p>
          <p>
            <strong className="text-foreground">Not on this page:</strong> state-level youth House splits, issue
            salience tables, enrolled-student cuts, and 2024 presidential topline replays — add only when primary
            tables are re-checked.
          </p>
          <Separator className="my-4" />
          <p className="fine-print">
            Manifest:{" "}
            <Link href="/data/midterms-2026-house-manifest.json" className="underline">
              /data/midterms-2026-house-manifest.json
            </Link>
            . Site fact log: <code className="text-foreground">data/facts.md</code> in the repository.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
