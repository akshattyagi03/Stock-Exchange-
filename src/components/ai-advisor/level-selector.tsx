export type Level = "beginner" | "intermediate" | "experienced" | "trader"

export const LEVELS = [
  { id: "beginner" as Level,     label: "Beginner",      description: "Simple language, no jargon",          color: { bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.25)",  value: "#4ade80", hover: "rgba(34,197,94,0.15)"  } },
  { id: "intermediate" as Level, label: "Intermediate",  description: "Some technical terms explained",       color: { bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)", value: "#60a5fa", hover: "rgba(59,130,246,0.15)" } },
  { id: "experienced" as Level,  label: "Experienced",   description: "Technical analysis, metrics",          color: { bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.25)", value: "#c084fc", hover: "rgba(168,85,247,0.15)" } },
  { id: "trader" as Level,       label: "Active Trader", description: "Advanced, concise, actionable",        color: { bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)", value: "#fbbf24", hover: "rgba(245,158,11,0.15)" } },
]

export function LevelSelector({ value, onChange }: { value: Level; onChange: (l: Level) => void }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        padding: "4px",
        borderRadius: "10px",
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {LEVELS.map((level) => {
        const isActive = value === level.id
        return (
          <button
            key={level.id}
            type="button"
            title={level.description}
            onClick={() => onChange(level.id)}
            style={{
              padding: "5px 14px",
              borderRadius: "7px",
              fontSize: "12px",
              fontWeight: isActive ? 600 : 400,
              border: isActive ? `1px solid ${level.color.border}` : "1px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
              backgroundColor: isActive ? level.color.bg : "transparent",
              color: isActive ? level.color.value : "hsl(var(--muted-foreground))",
              whiteSpace: "nowrap" as const,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                const t = e.currentTarget as HTMLButtonElement
                t.style.backgroundColor = level.color.hover
                t.style.color = level.color.value
                t.style.border = `1px solid ${level.color.border}`
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                const t = e.currentTarget as HTMLButtonElement
                t.style.backgroundColor = "transparent"
                t.style.color = "hsl(var(--muted-foreground))"
                t.style.border = "1px solid transparent"
              }
            }}
          >
            {level.label}
          </button>
        )
      })}
    </div>
  )
}
