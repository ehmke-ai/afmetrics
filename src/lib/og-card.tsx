import { ImageResponse } from "next/og"

export const OG_SIZE = { width: 1200, height: 630 }

// Light theme values from globals.css; ImageResponse can't read CSS variables
const INK = "#16181d"
const MUTED = "#5f5d57"
const PAGE = "#fbfaf7"
const RULE = "#e3e0d8"
const ACCENT = "#b5452c"

/** The shared social card: eyebrow, place name, and up to four headline figures */
export function ogCard({
  eyebrow,
  title,
  stats,
}: {
  eyebrow: string
  title: string
  stats: { label: string; value: string }[]
}) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: PAGE,
        color: INK,
        padding: "64px 72px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            fontSize: 26,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: MUTED,
            display: "flex",
          }}
        >
          {eyebrow}
        </div>
        <div style={{ fontSize: title.length > 28 ? 68 : 84, fontWeight: 700, lineHeight: 1.05 }}>
          {title}
        </div>
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        {stats.slice(0, 4).map((stat) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              borderTop: `3px solid ${RULE}`,
              paddingTop: 18,
            }}
          >
            <div style={{ fontSize: 24, color: MUTED }}>{stat.label}</div>
            <div style={{ fontSize: 48, fontWeight: 700 }}>{stat.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", fontSize: 28, color: ACCENT, fontWeight: 700 }}>
        afmetrics.com
      </div>
    </div>,
    OG_SIZE,
  )
}
