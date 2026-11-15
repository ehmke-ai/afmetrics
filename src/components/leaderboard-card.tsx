"use client"

import { useState } from "react"

import { SegmentedButtons } from "@/components/maps/legends"
import { RankingTable, type RankingRow } from "@/components/topic-page"

export type Leaderboard = {
  id: string
  /** Button label */
  label: string
  title: string
  valueLabel: string
  color: string
  rows: RankingRow[]
}

/** One ranking at a time, with buttons to switch measures */
export function LeaderboardCard({ boards }: { boards: Leaderboard[] }) {
  const [id, setId] = useState(boards[0]?.id)
  const board = boards.find((b) => b.id === id) ?? boards[0]
  if (!board) return null

  return (
    <div className="space-y-4">
      <SegmentedButtons
        label="Leaderboard measure"
        options={boards.map((b) => ({ key: b.id, label: b.label }))}
        value={board.id}
        onChange={setId}
      />
      <div>
        <h3 className="eyebrow mb-2">{board.title}</h3>
        <RankingTable
          className=""
          rows={board.rows}
          nameLabel="State"
          valueLabel={board.valueLabel}
          intensityLabel="Relative"
          color={board.color}
          badgeClassName="bg-foreground/15 text-foreground hover:bg-foreground/15"
        />
      </div>
    </div>
  )
}
