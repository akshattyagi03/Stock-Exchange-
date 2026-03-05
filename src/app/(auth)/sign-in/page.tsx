"use client"
import { GalleryVerticalEnd } from "lucide-react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { LoginForm } from "@/components/login-form"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-linear-to-b from-black via-zinc-900 to-zinc-950 text-white">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-white text-black flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden bg-linear-to-b from-black via-zinc-900 to-zinc-950">

        {/* glow */}
        <div className="absolute w-125 h-125 bg-emerald-500/10 blur-[140px] rounded-full"></div>

        <DotLottieReact
          src="https://lottie.host/78813d34-220e-4ae2-af6d-30c84577886e/nWfDGO2LcO.lottie"
          loop
          autoplay
          className="w-187.5 h-187.5 object-contain relative z-10"
        />

      </div>
    </div>
  )
}
