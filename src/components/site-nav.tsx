"use client"

import { ChevronDown, Flag, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { PlaceSearch } from "@/components/place-search"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { researchArticleHref, researchArticles } from "@/lib/research"

type NavLink = { href: string; label: string; description?: string }

const SECTIONS: NavLink[] = [
  { href: "/", label: "United States" },
  { href: "/states", label: "States" },
  { href: "/research", label: "Research" },
]

const TOOLS: NavLink[] = [
  {
    href: "/you",
    label: "Where you stand",
    description: "Your county, field, and generation against the data",
  },
  {
    href: "/work-visas",
    label: "Work visas",
    description: "H-1B, H-2A, and H-2B jobs by state and county",
  },
]

/** Whether `href` is the current section: state and county pages belong to States */
function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  if (href === "/states") return pathname === "/states" || pathname.startsWith("/united-states/")
  return pathname === href || pathname.startsWith(`${href}/`)
}

const linkClass = (active: boolean) =>
  `rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-accent hover:text-foreground ${
    active ? "font-medium text-foreground" : "text-muted-foreground"
  }`

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex shrink-0 items-center gap-2 text-foreground">
      <Flag className="size-4 text-brand-accent" aria-hidden />
      <span className="font-brand text-xl leading-none">afmetrics.com</span>
    </Link>
  )
}

/** Top navigation: sections and a Tools menu on wide screens, a sheet menu on narrow ones */
export function SiteNav({ actions }: { actions?: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsActive = TOOLS.some((t) => isActive(pathname, t.href))

  return (
    <div className="mx-auto flex h-14 w-full max-w-[1100px] items-center gap-4 px-4 sm:px-6">
      <Wordmark />

      <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
        {SECTIONS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={linkClass(isActive(pathname, link.href))}
            aria-current={isActive(pathname, link.href) ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
        <Popover open={toolsOpen} onOpenChange={setToolsOpen}>
          <PopoverTrigger className={`${linkClass(toolsActive)} inline-flex items-center gap-1`}>
            Tools
            <ChevronDown className="size-3.5" aria-hidden />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-1.5">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setToolsOpen(false)}
                className="block rounded-md px-3 py-2 hover:bg-accent"
              >
                <div className="text-sm font-medium text-foreground">{tool.label}</div>
                <div className="text-xs text-muted-foreground">{tool.description}</div>
              </Link>
            ))}
          </PopoverContent>
        </Popover>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <PlaceSearch className="hidden w-60 lg:block" />
        {actions}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" aria-hidden />
          </SheetTrigger>
          <SheetContent side="left" className="gap-0 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                <Wordmark onClick={() => setOpen(false)} />
              </SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-6">
              <PlaceSearch onNavigate={() => setOpen(false)} />
              {(
                [
                  ["Sections", SECTIONS],
                  ["Tools", TOOLS],
                  [
                    "Research",
                    researchArticles.map((a) => ({
                      href: researchArticleHref(a.slug),
                      label: a.title,
                    })),
                  ],
                ] as const
              ).map(([heading, links]) => (
                <nav key={heading} aria-label={heading}>
                  <div className="eyebrow mb-1.5 px-2.5">{heading}</div>
                  <ul>
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={`block ${linkClass(isActive(pathname, link.href))}`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
