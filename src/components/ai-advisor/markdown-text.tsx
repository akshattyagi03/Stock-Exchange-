function formatInline(text: string) {
  const boldParts = text.split(/(\*\*.*?\*\*)/g)
  return boldParts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    const italicParts = part.split(/(\*.*?\*)/g)
    return italicParts.map((ip, j) => {
      if (ip.startsWith("*") && ip.endsWith("*") && ip.length > 2) {
        return <em key={`${i}-${j}`}>{ip.slice(1, -1)}</em>
      }
      return ip
    })
  })
}

export function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n")

  return (
    <div className="space-y-3">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return null

        if (trimmed.startsWith("### "))
          return <h3 key={idx} className="text-lg font-semibold mt-4">{formatInline(trimmed.slice(4))}</h3>
        if (trimmed.startsWith("## "))
          return <h2 key={idx} className="text-xl font-bold mt-5">{formatInline(trimmed.slice(3))}</h2>
        if (trimmed.startsWith("# "))
          return <h1 key={idx} className="text-2xl font-bold mt-6">{formatInline(trimmed.slice(2))}</h1>

        if (trimmed.startsWith("- ") || trimmed.startsWith("* "))
          return <li key={idx} className="ml-4 list-disc marker:text-primary/70">{formatInline(trimmed.substring(2))}</li>

        if (/^\d+\.\s/.test(trimmed))
          return <li key={idx} className="ml-4 list-decimal marker:text-primary/70">{formatInline(trimmed.replace(/^\d+\.\s/, ""))}</li>

        return <p key={idx} className="leading-relaxed">{formatInline(trimmed)}</p>
      })}
    </div>
  )
}
