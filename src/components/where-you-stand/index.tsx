"use client"

import { WhereYouStandForm } from "@/components/where-you-stand/form"
import { Results } from "@/components/where-you-stand/results"
import { useWhereYouStandParams } from "@/components/where-you-stand/use-params"

export function WhereYouStand() {
  const params = useWhereYouStandParams()
  const { state, places, field, cohort, group, school, remote } = params
  const ready = Boolean(state && places.length > 0 && field && cohort)

  return (
    <div className="flex flex-col gap-6">
      <WhereYouStandForm {...params} />

      {ready && state && field && cohort ? (
        <Results
          stateSlug={state.slug}
          stateName={state.state}
          abbr={state.abbr}
          places={places}
          groupId={group?.id}
          groupLabel={group?.label}
          fieldId={field.id}
          fieldLabel={field.label}
          remote={remote}
          generationId={cohort.id}
          generationLabel={cohort.label}
          schoolId={school?.value}
          schoolLabel={school?.label}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Choose a state, at least one county, a work field, and a generation.
        </p>
      )}
    </div>
  )
}
