"use client"

import { FileDown, Link2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useResultsExport } from "@/components/where-you-stand/export"
import { FieldLaborCard } from "@/components/where-you-stand/field-labor-card"
import { SchoolCard } from "@/components/where-you-stand/school-card"
import { ShareChart } from "@/components/where-you-stand/share-chart"
import type { CountyPlace } from "@/components/where-you-stand/shared"
import { useWhereYouStandData } from "@/components/where-you-stand/use-data"
import { VisaCard } from "@/components/where-you-stand/visa-card"
import { WealthCard } from "@/components/where-you-stand/wealth-card"
import {
  DEMOGRAPHIC_GROUPS,
  whereYouStandSources,
  type GenerationId,
  type WorkFieldId,
} from "@/lib/where-you-stand"

export function Results(props: {
  stateSlug: string
  stateName: string
  abbr: string
  places: CountyPlace[]
  groupId?: (typeof DEMOGRAPHIC_GROUPS)[number]["id"]
  groupLabel?: string
  fieldId: WorkFieldId
  fieldLabel: string
  remote: boolean
  generationId: GenerationId
  generationLabel: string
  schoolId?: string
  schoolLabel?: string
}) {
  const {
    fields,
    history,
    schoolFile,
    failed,
    loading,
    ready: canExport,
  } = useWhereYouStandData(props.schoolId)
  const summary = [
    props.stateName,
    props.places.map((place) => place.label).join(", "),
    props.fieldLabel,
    props.generationLabel,
    props.groupLabel,
    props.schoolLabel,
    props.remote ? "Remote" : null,
  ]
    .filter(Boolean)
    .join(" · ")

  const { rootRef, exporting, exportError, save, copied, shareUrl, copyLink } = useResultsExport(
    `where-you-stand-${props.stateSlug}-${props.fieldId}`,
  )

  return (
    <div id="results" ref={rootRef} className="flex scroll-mt-16 flex-col gap-6">
      <div data-capture="exclude" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={copyLink}>
            <Link2 aria-hidden />
            {copied ? "Copied" : "Copy link"}
          </Button>
          {/* PNG export is paused.
          <Button type="button" size="sm" variant="outline" onClick={() => save("png")} disabled={!canExport || exporting !== null}>
            <Download aria-hidden />
            {exporting === "png" ? "Saving…" : "PNG"}
          </Button>
          */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => save("pdf")}
            disabled={!canExport || exporting !== null}
          >
            <FileDown aria-hidden />
            {exporting === "pdf" ? "Saving…" : "PDF"}
          </Button>
        </div>
        {shareUrl && (
          <Input
            readOnly
            value={shareUrl}
            aria-label="Share link"
            onFocus={(event) => event.currentTarget.select()}
          />
        )}
        {exportError && (
          <p className="text-sm text-muted-foreground">The file could not be saved.</p>
        )}
      </div>
      <div data-export-only data-export-card hidden>
        <h2 className="font-heading text-2xl text-foreground">Where you stand</h2>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </div>
      {failed && (
        <div role="alert" className="flex items-center gap-3 text-sm text-muted-foreground">
          The county figures did not load.
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              fields.retry()
              history.retry()
            }}
          >
            Try again
          </Button>
        </div>
      )}
      {loading && <p className="text-sm text-muted-foreground">Loading county figures…</p>}
      {props.schoolId && props.schoolLabel && (
        <div data-export-card>
          <SchoolCard
            schoolId={props.schoolId}
            schoolLabel={props.schoolLabel}
            fieldId={props.fieldId}
            fieldLabel={props.fieldLabel}
            file={schoolFile}
          />
        </div>
      )}
      <div data-export-card>
        <FieldLaborCard
          stateName={props.stateName}
          abbr={props.abbr}
          fieldId={props.fieldId}
          fieldLabel={props.fieldLabel}
          countyCount={props.places.length}
          remote={props.remote}
        />
      </div>
      {fields.data && (
        <div data-export-card>
          <VisaCard {...props} fields={fields.data} />
        </div>
      )}
      <div data-export-card>
        <WealthCard
          stateName={props.stateName}
          abbr={props.abbr}
          generationId={props.generationId}
        />
      </div>
      {history.data && props.groupId && props.groupLabel && props.places.length > 0 && (
        <div data-export-card>
          <ShareChart
            places={props.places}
            groupId={props.groupId}
            groupLabel={props.groupLabel}
            history={history.data}
          />
        </div>
      )}
      <div data-export-only data-export-card hidden className="fine-print max-w-3xl">
        <ul className="space-y-2">
          {whereYouStandSources.map((source) => (
            <li key={source.label}>
              <span className="font-medium text-foreground">{source.label}</span>. {source.detail}
            </li>
          ))}
        </ul>
        <p className="mt-3">afmetrics.com</p>
      </div>
    </div>
  )
}
