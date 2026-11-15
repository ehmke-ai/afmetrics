import Link from "next/link"

import { PageHeader } from "@/components/topic-page"
import { cn } from "@/lib/utils"

export type ResearchTocItem = {
  id: string
  label: string
}

export function ResearchProse({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-sm leading-[1.65] text-foreground/95", className)}>{children}</p>
  )
}

export function ResearchSection({
  id,
  heading,
  caption,
  children,
  className = "mt-10 scroll-mt-20",
}: {
  id: string
  heading: string
  caption?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={className}>
      <h2 className="font-heading text-[22px] font-normal tracking-[-0.01em] text-foreground">
        {heading}
      </h2>
      {caption && <p className="section-sub mt-1.5">{caption}</p>}
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  )
}

export function ResearchArticleShell({
  eyebrow = "Research",
  title,
  description,
  toc,
  children,
}: {
  eyebrow?: string
  title: string
  description: string
  toc: ResearchTocItem[]
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,11.5rem)_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        <nav
          aria-label="On this page"
          className="mb-8 lg:sticky lg:top-16 lg:mb-0 lg:self-start"
        >
          <p className="eyebrow mb-2">Contents</p>
          <ul className="flex flex-col gap-1 border-l border-border pl-3 text-[13px]">
            {toc.map((item) => (
              <li key={item.id}>
                <Link
                  href={`#${item.id}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <PageHeader eyebrow={eyebrow} title={title} description={description} />
          <article className="min-w-0">{children}</article>
        </div>
      </div>
    </main>
  )
}

export function ResearchBulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-[1.65] text-foreground/95">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export function ResearchLinkList({
  links,
}: {
  links: { title: string; site: string; href: string; date?: string }[]
}) {
  return (
    <ol className="mt-2 divide-y divide-border rounded-lg border border-border bg-card">
      {links.map((link, i) => (
        <li key={link.href} className="px-3 py-2.5 sm:px-4">
          <div className="flex gap-2 text-sm">
            <span className="shrink-0 tabular-nums text-muted-foreground">{i + 1}.</span>
            <div className="min-w-0">
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                {link.title}
              </a>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {link.site}
                {link.date ? ` · ${link.date}` : ""}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}