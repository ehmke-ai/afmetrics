"use client"

import type { ReactNode } from "react"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  schoolOptions,
  type CountyOption,
  type SchoolOption,
} from "@/components/where-you-stand/shared"
import type { WhereYouStandParams } from "@/components/where-you-stand/use-params"
import { stateNav } from "@/lib/states"
import { DEMOGRAPHIC_GROUPS, GENERATIONS, WORK_FIELDS } from "@/lib/where-you-stand"

export function CountyPicker({
  counties,
  selected,
  disabled,
  onChange,
}: {
  counties: CountyOption[]
  selected: CountyOption[]
  disabled: boolean
  onChange: (slugs: string[]) => void
}) {
  const anchor = useComboboxAnchor()
  return (
    <Combobox
      items={counties}
      multiple
      disabled={disabled}
      value={selected}
      isItemEqualToValue={(left, right) => left.slug === right.slug}
      onValueChange={(next) => onChange(next.map((row) => row.slug))}
    >
      <ComboboxChips ref={anchor} className="w-full rounded-none">
        <ComboboxValue>
          {(values: CountyOption[]) =>
            values.map((county) => <ComboboxChip key={county.slug}>{county.label}</ComboboxChip>)
          }
        </ComboboxValue>
        <ComboboxChipsInput
          id="you-county"
          disabled={disabled}
          placeholder={
            disabled
              ? "Select a state first"
              : selected.length === 0
                ? "Search counties"
                : "Add another"
          }
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No county found.</ComboboxEmpty>
        <ComboboxList>
          {(county: CountyOption) => (
            <ComboboxItem key={county.slug} value={county}>
              {county.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function Field({
  label,
  htmlFor,
  optional,
  aside,
  children,
}: {
  label: string
  htmlFor: string
  optional?: boolean
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <label htmlFor={htmlFor} className="text-sm text-muted-foreground">
          {label}
          {optional ? " (optional)" : ""}
        </label>
        {aside}
      </div>
      {children}
    </div>
  )
}

export function WhereYouStandForm({
  state,
  counties,
  selectedCounties,
  group,
  field,
  cohort,
  school,
  remote,
  write,
  setCounties,
  clearCounties,
}: WhereYouStandParams) {
  return (
    <form
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      onSubmit={(event) => event.preventDefault()}
    >
      <Field label="State" htmlFor="you-state">
        <Select
          value={state?.slug}
          onValueChange={(value) => {
            clearCounties()
            write({ state: value, county: null })
          }}
        >
          <SelectTrigger id="you-state" className="w-full">
            <SelectValue placeholder="Select a state" />
          </SelectTrigger>
          <SelectContent>
            {stateNav.map((row) => (
              <SelectItem key={row.abbr} value={row.slug}>
                {row.state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field
        label="Counties you’ll work in"
        htmlFor="you-county"
        aside={
          <label
            htmlFor="you-remote"
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <input
              id="you-remote"
              type="checkbox"
              checked={remote}
              onChange={(event) => write({ remote: event.target.checked ? "1" : null })}
              className="size-3.5 shrink-0 accent-foreground"
            />
            Remote (optional)
          </label>
        }
      >
        <CountyPicker
          counties={counties}
          selected={selectedCounties}
          disabled={!state}
          onChange={setCounties}
        />
      </Field>

      <Field label="Work field" htmlFor="you-field">
        <Select value={field?.id} onValueChange={(value) => write({ field: value })}>
          <SelectTrigger id="you-field" className="w-full">
            <SelectValue placeholder="Select a field" />
          </SelectTrigger>
          <SelectContent>
            {WORK_FIELDS.map((row) => (
              <SelectItem key={row.id} value={row.id}>
                {row.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Generation" htmlFor="you-generation">
        <Select value={cohort?.id} onValueChange={(value) => write({ generation: value })}>
          <SelectTrigger id="you-generation" className="w-full">
            <SelectValue placeholder="Select a generation" />
          </SelectTrigger>
          <SelectContent>
            {GENERATIONS.map((row) => (
              <SelectItem key={row.id} value={row.id}>
                {row.label} ({row.born})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="College or university" htmlFor="you-school" optional>
        <Combobox
          items={schoolOptions}
          value={school ?? null}
          limit={50}
          isItemEqualToValue={(left, right) => left.value === right.value}
          itemToStringLabel={(option) => option.label}
          onValueChange={(option) => write({ school: option?.value ?? null })}
        >
          <ComboboxInput
            id="you-school"
            placeholder="Search a college or university"
            showClear={Boolean(school)}
            className="w-full"
          />
          <ComboboxContent>
            <ComboboxEmpty>No college or university found.</ComboboxEmpty>
            <ComboboxList>
              {(option: SchoolOption) => (
                <ComboboxItem key={option.value} value={option}>
                  {option.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>

      <Field label="Demographic" htmlFor="you-group" optional>
        <Select value={group?.id} onValueChange={(value) => write({ group: value })}>
          <SelectTrigger id="you-group" className="w-full">
            <SelectValue placeholder="Select a group" />
          </SelectTrigger>
          <SelectContent>
            {DEMOGRAPHIC_GROUPS.map((row) => (
              <SelectItem key={row.id} value={row.id}>
                {row.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </form>
  )
}
