import {
  FollowerHistoryCharts,
  PlatformFollowerBars,
} from "@/components/research/fuentes-metrics-charts"
import { ResearchCallout } from "@/components/research/research-callout"
import { ResearchDataTable } from "@/components/research/research-data-table"
import {
  ResearchArticleShell,
  ResearchBulletList,
  ResearchLinkList,
  ResearchProse,
  ResearchSection,
} from "@/components/research/research-article-shell"
import {
  coverageParagraphs,
  coverageTableRows,
  engagementParagraphs,
  engagementPostRows,
  engagementSummaryRows,
  fuentesToc,
  gapsBullets,
  methodCallout,
  methodParagraph,
  metricsAccountTableRows,
  metricsHistoryTableRows,
  metricsParagraphs,
  networkParagraphs,
  networkTableRows,
  overviewParagraphs,
  sourceLinks,
  sourcesIntro,
  timelineRows,
} from "@/data/research/nick-fuentes-content"

const TITLE = "Nick Fuentes, America First, and the Groyper Movement"
const SUMMARY =
  "A sourced, point-in-time briefing on public biography, platform metrics, recent X engagement, and media coverage, compiled for AFMetrics on November 14, 2026."

export function NickFuentesResearch() {
  return (
    <ResearchArticleShell
      title={TITLE}
      description={SUMMARY}
      toc={[...fuentesToc]}
    >
      <ResearchSection id="method" heading="How to read this briefing" className="mt-0 scroll-mt-20">
        <ResearchCallout lead="Scope and method">{methodCallout}</ResearchCallout>
        <ResearchProse>{methodParagraph}</ResearchProse>
      </ResearchSection>

      <ResearchSection id="overview" heading="Overview">
        {overviewParagraphs.map((p) => (
          <ResearchProse key={p.slice(0, 40)}>{p}</ResearchProse>
        ))}
      </ResearchSection>

      <ResearchSection
        id="timeline"
        heading="Public timeline"
        caption="Each item is a widely reported public event, not a complete biography. Dates follow the cited outlet."
      >
        <ResearchDataTable
          className="mt-0 max-w-none"
          columns={["Date", "Event", "Source"]}
          rows={timelineRows.map((row) => row.map((cell) => cell))}
        />
      </ResearchSection>

      <ResearchSection
        id="metrics"
        heading="Account metrics"
        caption="Platform totals are not directly comparable. Some published historical figures were rounded by the original outlet."
      >
        <ResearchProse>{metricsParagraphs[0]}</ResearchProse>
        <div className="max-w-none">
          <PlatformFollowerBars />
        </div>
        <ResearchDataTable
          className="mt-0 max-w-none"
          columns={["Platform", "Account", "Current figure", "Pulled", "Source"]}
          align={["start", "start", "end", "start", "start"]}
          rows={metricsAccountTableRows.map((row) => row.map((cell) => cell))}
        />
        <ResearchProse>{metricsParagraphs[1]}</ResearchProse>
        <ResearchProse>{metricsParagraphs[2]}</ResearchProse>
        <div className="max-w-none">
          <FollowerHistoryCharts />
        </div>
        <ResearchDataTable
          className="mt-0 max-w-none"
          columns={["Date", "X", "Rumble", "Source"]}
          align={["start", "end", "end", "start"]}
          rows={metricsHistoryTableRows.map((row) => row.map((cell) => cell))}
        />
        {metricsParagraphs.slice(3).map((p) => (
          <ResearchProse key={p.slice(0, 48)}>{p}</ResearchProse>
        ))}
      </ResearchSection>

      <ResearchSection id="network" heading="Associated accounts and network">
        <ResearchProse>{networkParagraphs[0]}</ResearchProse>
        <ResearchDataTable
          className="mt-0 max-w-none"
          columns={["What was counted", "Figure", "As of", "Source"]}
          align={["start", "end", "start", "start"]}
          rows={networkTableRows.map((row) => row.map((cell) => cell))}
        />
        {networkParagraphs.slice(1).map((p) => (
          <ResearchProse key={p.slice(0, 40)}>{p}</ResearchProse>
        ))}
      </ResearchSection>

      <ResearchSection
        id="engagement"
        heading="X engagement snapshot"
        caption="25 original posts by @NickJFuentes from September 15 through November 8, 2026, excluding replies and reposts. Metrics as of the November 14, 2026, 6:24 p.m. CT pull."
      >
        <ResearchProse>{engagementParagraphs[0]}</ResearchProse>
        <ResearchDataTable
          className="mt-0 max-w-none"
          columns={["Metric", "Median", "Mean", "25th–75th", "Min", "Max"]}
          align={["start", "end", "end", "end", "end", "end"]}
          rows={engagementSummaryRows.map((row) => row.map((cell) => cell))}
        />
        <ResearchProse>{engagementParagraphs[1]}</ResearchProse>
        <ResearchDataTable
          className="mt-0 max-w-none"
          columns={["Date (CT)", "Post", "Views", "Likes", "Reposts"]}
          align={["start", "start", "end", "end", "end"]}
          rows={engagementPostRows.map((row) => [
            row.date,
            <>
              {row.post}{" "}
              <a
                href={row.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-2 hover:underline"
              >
                {row.postUrl}
              </a>
            </>,
            row.views,
            row.likes,
            row.reposts,
          ])}
        />
      </ResearchSection>

      <ResearchSection id="coverage" heading="Media coverage">
        <ResearchProse>{coverageParagraphs[0]}</ResearchProse>
        <ResearchDataTable
          className="mt-0 max-w-none"
          columns={["Measure", "Figure", "Window", "Source"]}
          align={["start", "end", "start", "start"]}
          rows={coverageTableRows.map((row) => row.map((cell) => cell))}
        />
        {coverageParagraphs.slice(1).map((p, i) => (
          <ResearchProse key={i}>{p}</ResearchProse>
        ))}
      </ResearchSection>

      <ResearchSection id="gaps" heading="Gaps and caveats">
        <ResearchBulletList items={[...gapsBullets]} />
      </ResearchSection>

      <ResearchSection id="sources" heading="Sources">
        <ResearchProse>{sourcesIntro}</ResearchProse>
        <div className="max-w-none">
          <ResearchLinkList links={[...sourceLinks]} />
        </div>
      </ResearchSection>
    </ResearchArticleShell>
  )
}