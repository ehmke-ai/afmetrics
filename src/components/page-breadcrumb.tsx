"use client"

import { usePathname } from "next/navigation"
import { Fragment } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import countyLabels from "@/data/county-labels.json"
import { stateNavBySlug } from "@/lib/states"
import { researchArticles } from "@/lib/research"

type Crumb = { label: string; href?: string }

function crumbsForPathname(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return []

  const [section, slug] = segments

  if (section === "work-visas" && !slug) return [{ label: "Work visas" }]

  if (section === "you" && !slug) return [{ label: "Where you stand" }]

  if (section === "states" && !slug) return [{ label: "All states" }]

  if (section === "united-states" && slug) {
    const state = stateNavBySlug[slug]
    const countySegment = segments[2]
    const stateCrumbs: Crumb[] = [
      { label: "States", href: "/states" },
      { label: state ? state.state : slug, href: `/united-states/${slug}` },
    ]
    if (!countySegment) return stateCrumbs
    const labels: Record<string, string> | undefined =
      countyLabels[slug as keyof typeof countyLabels]
    return [...stateCrumbs, { label: labels?.[countySegment] ?? countySegment }]
  }

  if (section === "research") {
    const research: Crumb = { label: "Research", href: "/research" }
    if (!slug) return [research]
    const article = researchArticles.find((a) => a.slug === slug)
    return [research, { label: article ? article.title : slug }]
  }

  return [{ label: pathname }]
}

export function PageBreadcrumb() {
  const pathname = usePathname()
  const crumbs = crumbsForPathname(pathname)
  // The home page has nothing above it
  if (crumbs.length === 0) return null

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap overflow-hidden">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <Fragment key={`${crumb.label}-${i}`}>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="truncate">
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
