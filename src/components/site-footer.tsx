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
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <span className="font-brand text-base text-foreground">afmetrics.com</span> · Data last
          updated <time dateTime={DATA_LAST_UPDATED}>{formatDate(DATA_LAST_UPDATED)}</time>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/methodology" className="hover:text-foreground hover:underline">
            Methodology
          </Link>
          <Link href="/methodology#downloads" className="hover:text-foreground hover:underline">
            Data downloads
          </Link>
          <Link href="/states" className="hover:text-foreground hover:underline">
            All states
          </Link>
        </nav>
      </div>
    </footer>
  )
}
