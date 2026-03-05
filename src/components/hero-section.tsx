"use client"

import React, { useEffect, useRef, useCallback, useState } from "react"
import Image from "next/image"
import DotBackground from "./dot-background"

interface NavItem {
  id: string
  label: string
  href?: string
  target?: string
  onClick?: () => void
}

interface HeroSectionProps {
  heading?: string
  tagline?: string
  buttonText?: string
  imageUrl?: string
  videoUrl?: string
  navItems?: NavItem[]
}

const defaultNavItems: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "markets", label: "Markets", href: "/markets" },
  { id: "how-it-works", label: "How It Works", href: "/how-it-works" },
  { id: "get-started", label: "Get Started", href: "/sign-up" },
]

const HeroSection = ({
  heading = "Trade Smarter with Real-Time Market Insights",
  tagline = "Buy and sell stocks instantly, track your portfolio, and analyze market trends.",
  buttonText = "Start Trading",
  imageUrl,
  videoUrl,
  navItems = defaultNavItems,
}: HeroSectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const targetRef = useRef<HTMLButtonElement>(null)
  const mousePosRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const [showVideo, setShowVideo] = useState(false)

  const drawArrow = useCallback(() => {
    if (!canvasRef.current || !targetRef.current || !ctxRef.current) return

    const ctx = ctxRef.current
    const mouse = mousePosRef.current
    const target = targetRef.current

    if (!mouse.x || !mouse.y) return

    const rect = target.getBoundingClientRect()

    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    const x0 = mouse.x
    const y0 = mouse.y

    const angle = Math.atan2(cy - y0, cx - x0)

    const x1 = cx - Math.cos(angle) * (rect.width / 2 + 12)
    const y1 = cy - Math.sin(angle) * (rect.height / 2 + 12)

    const midX = (x0 + x1) / 2
    const midY = (y0 + y1) / 2

    const offset = Math.min(200, Math.hypot(x1 - x0, y1 - y0) * 0.5)

    const controlX = midX
    const controlY = midY + offset

    const distance = Math.hypot(x1 - x0, y1 - y0)
    const opacity = Math.min(1, distance / 500)

    ctx.strokeStyle = `rgba(120,120,120,${opacity})`
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.quadraticCurveTo(controlX, controlY, x1, y1)
    ctx.setLineDash([10, 5])
    ctx.stroke()

    const headLength = 10
    const arrowAngle = Math.atan2(y1 - controlY, x1 - controlX)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(
      x1 - headLength * Math.cos(arrowAngle - Math.PI / 6),
      y1 - headLength * Math.sin(arrowAngle - Math.PI / 6)
    )
    ctx.moveTo(x1, y1)
    ctx.lineTo(
      x1 - headLength * Math.cos(arrowAngle + Math.PI / 6),
      y1 - headLength * Math.sin(arrowAngle + Math.PI / 6)
    )
    ctx.stroke()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    ctxRef.current = canvas.getContext("2d")

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener("resize", updateCanvasSize)
    window.addEventListener("mousemove", handleMouseMove)

    updateCanvasSize()

    const animate = () => {
      const ctx = ctxRef.current
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawArrow()
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      window.removeEventListener("mousemove", handleMouseMove)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [drawArrow])

  useEffect(() => {
    if (!videoRef.current) return

    const video = videoRef.current

    if (showVideo) {
      video.play().catch(() => setShowVideo(false))
    } else {
      video.pause()
    }
  }, [showVideo])

  return (
  <section className="relative min-h-screen flex flex-col text-white bg-linear-to-b from-black via-zinc-900 to-zinc-950 overflow-hidden">

    {/* DOT BACKGROUND COMPONENT */}
    <div className="absolute inset-0 z-0">
      <DotBackground />
    </div>

    {/* ARROW CANVAS BACKGROUND */}
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-1 pointer-events-none"
    />

    {/* CONTENT LAYER */}
    <div className="relative z-10 flex flex-col min-h-screen">

      {/* NAVBAR */}
      <nav className="w-full max-w-6xl mx-auto flex justify-between items-center px-6 py-5 text-sm">
        {navItems.map((item) =>
          item.href ? (
            <a
              key={item.id}
              href={item.href}
              className="text-white/70 hover:text-white transition"
            >
              {item.label}
            </a>
          ) : (
            <button
              key={item.id}
              onClick={item.onClick}
              className="text-white/70 hover:text-white transition"
            >
              {item.label}
            </button>
          )
        )}
      </nav>

      {/* HERO */}
      <div className="flex flex-col items-center text-center mt-24 px-6">
        <h1 className="text-4xl md:text-5xl font-bold max-w-3xl text-white drop-shadow-[0_2px_20px_rgba(255,255,255,0.15)]">
          {heading}
        </h1>

        <p className="mt-4 text-white/70 max-w-xl">
          {tagline}
        </p>

        <button
          ref={targetRef}
          className="mt-8 px-6 py-3 rounded-xl border border-white/40 hover:border-white text-white hover:bg-white/10 transition"
        >
          {buttonText}
        </button>
      </div>

      {/* HERO CARD */}
      <div className="mt-16 w-full max-w-4xl mx-auto px-6">
        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur relative h-100 flex items-center justify-center">

          {imageUrl && !showVideo && (
            <Image
              src={imageUrl}
              alt="Hero preview"
              fill
              className="object-cover"
            />
          )}

          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              className={`absolute inset-0 w-full h-full object-cover ${
                showVideo ? "opacity-100" : "opacity-0"
              }`}
              muted
              playsInline
            />
          )}

          {videoUrl && !showVideo && (
            <button
              onClick={() => setShowVideo(true)}
              className="absolute bottom-6 left-6 bg-black/40 backdrop-blur p-3 rounded-full hover:bg-black/60 transition"
            >
              ▶
            </button>
          )}

        </div>
      </div>

    </div>

  </section>
)
}

export default HeroSection