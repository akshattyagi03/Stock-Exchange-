"use client"

import { useEffect, useRef } from "react"

export default function DotBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const spacing = 40
    const radius = 1.2

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener("resize", resize)

    window.addEventListener("mousemove", (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    })

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {

          const dx = mouse.current.x - x
          const dy = mouse.current.y - y
          const dist = Math.sqrt(dx * dx + dy * dy)

          const glow = Math.max(0, 1 - dist / 200)

          ctx.beginPath()
          ctx.arc(x, y, radius + glow * 3, 0, Math.PI * 2)

          ctx.fillStyle = `rgba(140,140,140,${0.2 + glow})`
          ctx.fill()
        }
      }

      requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  )
}