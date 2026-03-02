"use client"
import z from "zod"
import { GalleryVerticalEnd } from "lucide-react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { LoginForm } from "@/components/login-form"
import { signInSchema } from "@/schemas/authSchema/signInSchema"

export default function SignupPage() {
  const onSubmit = (data: z.infer<typeof signInSchema>)=>{

  }
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
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

// 'use client'
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import * as z from "zod"
// import Link from "next/link"
// import axios, {AxiosError} from "axios"
// import { useState } from "react"
// import {useDebounceValue} from "usehooks-ts"
// import { toast } from "sonner"
// import { useRouter } from "next/navigation"
// import { signInSchema } from "@/schemas/authSchema/signInSchema"
// export default function Page() {
//   const [email, setEmail] = useState("");
//   const [emailMessage, setEmailMessage] = useState("");
//   const [isCheckingEmail, setIsCheckingEmail] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useDebounceValue(email, 300);
//   const router = useRouter();

//   const form = useForm<z.infer<typeof signInSchema>>({
//     resolver: zodResolver(signInSchema),
//     defaultValues: {
//       identifier: '',
//       password: ''
//     }
//   });
//   return (
//     <div>Page</div>
//   );
// }