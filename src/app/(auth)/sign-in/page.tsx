"use client"
import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image"
import { LoginForm } from "@/components/login-form"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left panel — form */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-linear-to-b from-black via-zinc-900 to-zinc-950 text-white">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-white text-black flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            TradeX Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right panel — hero image */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
        {/* Unsplash image — finance / trading aesthetic */}
        <Image
          src="https://images.unsplash.com/photo-1620266757065-5814239881fd?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Stock market trading charts"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />

        {/* Gradient overlay for depth & brand cohesion */}
        <div className="absolute inset-0 bg-linear-to-br from-black/70 via-zinc-900/40 to-emerald-950/60" />

        {/* Subtle emerald glow */}
        <div className="absolute w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full bottom-20 right-20 pointer-events-none" />

        {/* Floating text card */}
        <div className="relative z-10 max-w-sm text-center px-8">
          <p className="text-4xl font-bold text-white tracking-tight leading-tight mb-3">
            Trade smarter,<br />
            <span className="text-emerald-400">grow faster.</span>
          </p>
          <p className="text-sm text-emerald-400 leading-relaxed">
            Real-time data, powerful analytics, and seamless execution — all in one platform.
          </p>
        </div>
      </div>
    </div>
  )
}