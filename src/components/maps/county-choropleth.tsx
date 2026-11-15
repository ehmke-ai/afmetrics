"use client"

import { Download } from "lucide-react"
import { useMemo, useState, type MouseEvent, type ReactNode } from "react"

import {
  countyLinkHandlers,
  CountyPaths,
  type CountyGeometry,
  type CountyMapState,
  type CountyShape,
} from "@/components/county-map-geometry"
import { NoDataSwatch } from "@/components/maps/legends"
import { MapStatus } from "@/components/maps/map-status"
import { Button } from "@/components/ui/button"
import { downloadMapPng, type MapExport } from "@/components/us-county-map-export"

/** [county FIPS, display label], the server-rendered county list the maps label hovers with */
export type UsCountyRow = [fips: string, label: string]

export function slugifyFileName(title: string) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.png`
}

/**
 * The shared body of every county choropleth: title and PNG export, a loading/error overlay,
 * the county paths (memoized), state borders, a hover outline and tooltip, and a caption with
 * the legend and source. Each map supplies its fills, tooltip rows, and legend.
 */
export function CountyChoropleth({
  title,
  subtitle,
  source,
  geometry,
  shapes,
  rows,
  states,
  state,
  hasData,
  tooltip,
  tooltipTitle,
  tooltipWidth = 11,
  legend,
  noData = true,
  legendExtra,
  exportLegend,
  exportOptions,
  dataLoading,
  dataError,
  onRetryData,
  statusLabel,
  onOpenCounty,
}: {
  title: string
  subtitle: string
  source: string
  geometry: CountyGeometry
  shapes: CountyShape[]
  /** Labels for the counties in view; with `onOpenCounty`, these counties are links */
  rows: UsCountyRow[]
  /** State FIPS -> USPS abbreviation, for tooltip headings on the national map */
  states: Record<string, string>
  /** Set when the map shows one state */
  state?: CountyMapState
  /** Whether a county has a value; only those get a tooltip */
  hasData: (fips: string) => boolean
  /** Tooltip body under the county name */
  tooltip: (fips: string) => ReactNode
  /** Overrides the tooltip heading; undefined keeps the default "County, ST" */
  tooltipTitle?: (fips: string) => string | undefined
  /** Tooltip minimum width, rem */
  tooltipWidth?: number
  /** Legend entries in the caption */
  legend: ReactNode
  /** Show the "No data" swatch (default true) */
  noData?: boolean
  /** Drawn beside the legend (UsMap's county/state toggle) */
  legendExtra?: ReactNode
  exportLegend: MapExport["legend"]
  exportOptions?: Partial<Omit<MapExport, "title" | "subtitle" | "legend" | "source" | "shapes">>
  dataLoading: boolean
  dataError: Error | null
  onRetryData: () => void
  /** What the overlay says failed to load */
  statusLabel: string
  onOpenCounty?: (fips: string) => void
}) {
  const [hoveredFips, setHoveredFips] = useState<string | null>(null)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)
  const [exporting, setExporting] = useState(false)
  const { width, height, stateBorders, regionLabels } = geometry
  const loading = geometry.loading || dataLoading

  const labelByFips = useMemo(() => Object.fromEntries(rows), [rows])
  const pathByFips = useMemo(() => Object.fromEntries(shapes.map((o) => [o.fips, o.d])), [shapes])

  function clearHover() {
    setHoveredFips(null)
    setPointer(null)
  }

  // One listener for the whole map: read the county off the path under the cursor
  function handleMouseMove(e: MouseEvent<SVGSVGElement>) {
    const fips = (e.target as Element).getAttribute("data-fips")
    if (!fips || !hasData(fips)) return clearHover()
    const rect = e.currentTarget.getBoundingClientRect()
    setHoveredFips(fips)
    setPointer({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  function defaultTitle(fips: string) {
    const name = labelByFips[fips] ?? regionLabels[fips] ?? fips
    const abbr = states[fips.slice(0, 2)]
    return state || !abbr ? name : `${name}, ${abbr}`
  }

  async function handleDownload() {
    setExporting(true)
    try {
      await downloadMapPng({
        title,
        subtitle,
        legend: exportLegend,
        source,
        mapWidth: width,
        mapHeight: height,
        shapes,
        stateBorders,
        fileName: slugifyFileName(title),
        ...exportOptions,
      })
    } finally {
      setExporting(false)
    }
  }

  const showTooltip = hoveredFips && pointer && hasData(hoveredFips)

  return (
    // Title, map, legend, and source sit together so a screenshot of this block stands alone
    <figure className="space-y-3 bg-background">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-balance text-foreground sm:text-lg">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleDownload}
          disabled={loading || !!dataError || !!geometry.error || exporting}
        >
          <Download aria-hidden />
          {exporting ? "Saving…" : "PNG"}
        </Button>
      </div>

      <div className="relative">
        <MapStatus
          loading={loading}
          error={geometry.error ?? dataError}
          onRetry={() => {
            geometry.retry()
            onRetryData()
          }}
          label={statusLabel}
        />
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={`h-auto w-full touch-pan-y ${state ? "max-h-[75svh]" : ""}`}
          role={onOpenCounty ? "group" : "img"}
          aria-label={`Map: ${title}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={clearHover}
          {...countyLinkHandlers(onOpenCounty)}
        >
          <CountyPaths shapes={shapes} links={onOpenCounty ? labelByFips : undefined} />
          {stateBorders && (
            <path
              d={stateBorders}
              fill="none"
              stroke="var(--background)"
              strokeWidth={1}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
          )}
          {hoveredFips && pathByFips[hoveredFips] && (
            <path
              d={pathByFips[hoveredFips]}
              fill="none"
              stroke="color-mix(in oklch, var(--foreground) 55%, var(--background))"
              strokeWidth={1.25}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
          )}
        </svg>

        {showTooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-none border border-border bg-popover px-3 py-2 text-sm shadow-md"
            style={{
              minWidth: `${tooltipWidth}rem`,
              left: `min(${pointer.x}%, calc(100% - ${tooltipWidth + 1}rem))`,
              top: `max(${pointer.y - 2}%, 0.5rem)`,
              transform: "translateY(-100%)",
            }}
          >
            <div className="font-medium text-foreground">
              {tooltipTitle?.(hoveredFips) ?? defaultTitle(hoveredFips)}
            </div>
            {tooltip(hoveredFips)}
          </div>
        )}
      </div>

      <figcaption className="flex flex-wrap items-end gap-x-6 gap-y-3 text-xs">
        {legend}
        {noData && <NoDataSwatch />}
        {legendExtra}
        <span className="ml-auto text-muted-foreground">{source}</span>
      </figcaption>
    </figure>
  )
}

/** A tooltip's label/value rows; `active` highlights the row for the shown measure */
export function TooltipRows({
  rows,
}: {
  rows: { key: string; label: ReactNode; value: ReactNode; active?: boolean; color?: string }[]
}) {
  return (
    <ul className="mt-1.5 space-y-0.5 tabular-nums">
      {rows.map((row) => (
        <li key={row.key} className="flex items-center justify-between gap-3">
          <span
            className={`flex items-center gap-1.5 ${row.active ? "text-foreground" : "text-muted-foreground"}`}
          >
            {row.color && (
              <i
                className="inline-block size-2 rounded-full"
                style={{ background: row.color }}
                aria-hidden
              />
            )}
            {row.label}
          </span>
          <span className="font-medium text-foreground">{row.value}</span>
        </li>
      ))}
    </ul>
  )
}
