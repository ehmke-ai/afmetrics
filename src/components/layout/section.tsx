import type { ReactNode } from "react"

/** A page section's heading and one-line description; `id` makes it linkable */
export function Section({
  id,
  title,
  description,
  children,
  className = "",
}: {
  id?: string
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`mt-12 scroll-mt-16 ${className}`}>
      <header className="mb-7">
        <h2 className="section-title">{title}</h2>
        {description && <p className="section-sub">{description}</p>}
      </header>
      {children}
    </section>
  )
}

/** Just the heading block, for sections whose content follows as siblings */
export function SectionHeading({
  id,
  title,
  description,
}: {
  id?: string
  title: ReactNode
  description?: ReactNode
}) {
  return (
    <header id={id} className="mt-12 mb-7 scroll-mt-16">
      <h2 className="section-title">{title}</h2>
      {description && <p className="section-sub">{description}</p>}
    </header>
  )
}
