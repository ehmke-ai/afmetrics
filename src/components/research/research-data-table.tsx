import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type ResearchTableAlign = "start" | "end"

export function ResearchDataTable({
  columns,
  rows,
  align,
  caption,
  className = "mt-4",
}: {
  columns: string[]
  rows: React.ReactNode[][]
  align?: ResearchTableAlign[]
  caption?: string
  className?: string
}) {
  const colAlign = align ?? columns.map(() => "start" as ResearchTableAlign)

  return (
    <Card className={`${className} min-w-0 overflow-hidden border-border bg-card shadow-none`}>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            {caption && (
              <caption className="caption-bottom px-4 pt-3 pb-1 text-left text-[13px] text-muted-foreground">
                {caption}
              </caption>
            )}
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((col, i) => (
                  <TableHead
                    key={col}
                    className={
                      colAlign[i] === "end" ? "text-right whitespace-nowrap" : "whitespace-nowrap"
                    }
                  >
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, ri) => (
                <TableRow key={ri}>
                  {row.map((cell, ci) => (
                    <TableCell
                      key={ci}
                      className={
                        colAlign[ci] === "end"
                          ? "text-right align-top tabular-nums"
                          : "align-top text-sm leading-snug"
                      }
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}