"use client"

import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image"
import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">

      {/* LEFT SIDE */}
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
            <SignupForm />
          </div>
        </div>

      </div>

      {/* RIGHT SIDE — hero image */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden">

        {/* Unsplash image */}
        <Image
          src="https://images.unsplash.com/photo-1615992174118-9b8e9be025e7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Financial growth and investment"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-black/70 via-zinc-900/40 to-emerald-950/60" />

        {/* Emerald glow */}
        <div className="absolute w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full bottom-20 right-20 pointer-events-none" />

        {/* Floating text card */}
        <div className="relative z-10 max-w-sm text-center px-8">
          <p className="text-4xl font-bold text-white tracking-tight leading-tight mb-3">
            Your journey<br />
            <span className="text-emerald-400">starts here.</span>
          </p>
          <p className="text-sm text-white/50 leading-relaxed">
            Join thousands of traders building wealth with confidence. Sign up and take control of your financial future.
          </p>
        </div>

      </div>

    </div>
  )
}