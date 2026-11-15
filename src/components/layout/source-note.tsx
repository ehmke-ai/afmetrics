import type { ReactNode } from "react"

/** The "Notes:" footer under a page or chart, naming sources and caveats */
export function SourceNote({
  children,
  className = "mt-6",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <footer className={`fine-print max-w-3xl ${className}`}>
      <strong className="font-semibold text-foreground">Notes:</strong> {children}
    </footer>
  )
}
