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

// Mono uppercase links that turn red on hover; the current section sits on a red underline
const linkClass = (active: boolean) =>
  `border-b-2 px-2.5 py-1.5 font-mono text-[12.5px] tracking-[0.08em] uppercase transition-colors hover:text-primary ${
    active ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
  }`

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="afmetrics.com home"
      className="group flex shrink-0 items-center gap-2 text-foreground"
    >
      <span className="flex size-7 items-center justify-center bg-primary text-primary-foreground transition-colors group-hover:bg-primary/85">
        <Flag className="size-3.5" fill="currentColor" aria-hidden />
      </span>
      <span className="font-brand text-[19px] leading-none font-extrabold tracking-[-0.02em] uppercase">
        AF Metrics
        <span className="text-primary">.</span>
      </span>
    </Link>
  )
}

/** Top navigation: sections and a Tools menu on wide screens, a sheet menu on narrow ones */
export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsActive = TOOLS.some((t) => isActive(pathname, t.href))

  return (
    <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center gap-4 px-4 sm:px-6">
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
                className="block border-l-2 border-transparent px-3 py-2 transition-colors hover:border-primary hover:bg-accent"
              >
                <div className="font-mono text-xs tracking-[0.08em] text-foreground uppercase">
                  {tool.label}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{tool.description}</div>
              </Link>
            ))}
          </PopoverContent>
        </Popover>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <PlaceSearch className="hidden w-60 lg:block" />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="inline-flex size-9 items-center justify-center text-foreground transition-colors hover:text-primary md:hidden"
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
