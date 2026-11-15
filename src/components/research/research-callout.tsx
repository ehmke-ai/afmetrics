import { Card, CardContent } from "@/components/ui/card"

export function ResearchCallout({
  lead,
  children,
}: {
  lead: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-border border-l-4 border-l-chart-3 bg-muted/40 shadow-none">
      <CardContent className="px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{lead}</p>
        <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
      </CardContent>
    </Card>
  )
}