"use client"

import { GalleryVerticalEnd } from "lucide-react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">

      {/* LEFT SIDE */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        
        {/* Logo */}
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>

      </div>

      {/* RIGHT SIDE ANIMATION */}
      <div className="bg-muted relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 scale-125">
          <DotLottieReact
            src="https://lottie.host/78813d34-220e-4ae2-af6d-30c84577886e/nWfDGO2LcO.lottie"
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

    </div>
  )
}