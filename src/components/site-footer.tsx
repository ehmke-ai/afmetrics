import Link from "next/link"

import { DATA_LAST_UPDATED } from "@/lib/datasets"

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-primary/45 bg-black">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-4 py-10 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1.5">
          <div className="font-brand text-lg leading-none font-extrabold tracking-[-0.02em] text-foreground normal-case">
            AF METRICS<span className="text-primary">.</span>
          </div>
          <div>
            Data last updated{" "}
            <time dateTime={DATA_LAST_UPDATED}>{formatDate(DATA_LAST_UPDATED)}</time>
          </div>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/methodology" className="transition-colors hover:text-primary">
            Methodology
          </Link>
          <Link href="/methodology#downloads" className="transition-colors hover:text-primary">
            Data downloads
          </Link>
          <Link href="/states" className="transition-colors hover:text-primary">
            All states
          </Link>
        </nav>
      </div>
    </footer>
  )
}
