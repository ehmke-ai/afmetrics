import Link from "next/link"
import type { ReactNode } from "react"

import { dataset, type DatasetId } from "@/lib/datasets"

/**
 * The "Notes:" footer under a page or chart. `datasets` lists sources from the registry
 * (lib/datasets), linked to their methodology entries; `children` adds page-specific notes.
 */
export function SourceNote({
  datasets,
  children,
  className = "mt-6",
}: {
  datasets?: DatasetId[]
  children?: ReactNode
  className?: string
}) {
  return (
    <footer className={`fine-print max-w-3xl ${className}`}>
      {datasets && datasets.length > 0 && (
        <p>
          <strong className="font-semibold text-foreground">Sources:</strong>{" "}
          {datasets.map((id, i) => {
            const d = dataset(id)
            return (
              <span key={id}>
                {i > 0 && "; "}
                <Link href={`/methodology#${id}`} className="underline-offset-2 hover:underline">
                  {d.source}
                </Link>{" "}
                ({d.vintage})
              </span>
            )
          })}
          .
        </p>
      )}
      {children && (
        <p className={datasets?.length ? "mt-2" : undefined}>
          <strong className="font-semibold text-foreground">Notes:</strong> {children}
        </p>
      )}
    </footer>
  )
}
