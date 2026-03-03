"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { signUpSchema } from "@/schemas/authSchema/signUpSchema"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useDebounceValue } from "usehooks-ts"
import { useEffect, useState } from "react"
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })
  const email = form.watch("email")
  const [debouncedEmail] = useDebounceValue(email, 500)
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "exists">("idle")
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    try {
      await axios.post("/api/sign-up", data)
      toast.success("Account created successfully!", { position: "top-center" })
      router.push(`/verify/${data.email}`)
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Error creating account", { position: "top-center" }
      )
    }
  }
  useEffect(() => {
    if (!debouncedEmail) return

    const controller = new AbortController()

    const checkEmail = async () => {
      setEmailStatus("checking")

      try {
        const res = await axios.get(
          `/api/check-email-unique?email=${debouncedEmail}`,
          { signal: controller.signal }
        )

        if (res.data.available) {
          form.clearErrors("email")
          setEmailStatus("available")
        } else {
          form.setError("email", {
            type: "manual",
            message: res.data.message,
          })
          setEmailStatus("exists")
        }

      } catch (error: any) {
        if (error.name !== "CanceledError") {
          console.error(error)
        }
      }
    }

    checkEmail()

    return () => {
      controller.abort()
    }

  }, [debouncedEmail])
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm">
            Fill in the form below to create your account
          </p>
        </div>

        <Field>
          <FieldLabel>Full Name</FieldLabel>
          <Input placeholder="John Doe" {...form.register("name")} />
        </Field>

        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input
            type="email"
            placeholder="johndoe@example.com"
            {...form.register("email")}
          />

          {emailStatus === "checking" && (
            <p className="text-sm text-muted-foreground">
              Checking availability...
            </p>
          )}

          {emailStatus === "available" && !form.formState.errors.email && (
            <p className="text-sm text-green-600">
              Email is available ✓
            </p>
          )}

          {form.formState.errors.email && (
            <p className="text-sm text-red-600">
              {form.formState.errors.email.message as string}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel>Password</FieldLabel>
          <Input type="password" placeholder="Secret_Password123" {...form.register("password")} />
        </Field>


        <Field>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating..." : "Create Account"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={() => signIn("google")}
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-5 w-5"
          >
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303C33.79 32.657 29.288 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.061 0 5.842 1.154 7.964 3.036l5.657-5.657C34.134 6.053 29.315 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
              />
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 16.108 19.007 12 24 12c3.061 0 5.842 1.154 7.964 3.036l5.657-5.657C34.134 6.053 29.315 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.224 0 9.993-1.997 13.518-5.243l-6.237-5.273C29.211 35.091 26.715 36 24 36c-5.265 0-9.756-3.337-11.285-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303c-1.108 3.276-4.105 5.639-7.719 5.639-4.656 0-8.63-3.003-10.061-7.167l-6.522 5.025C14.655 39.892 18.989 44 24 44c11.045 0 20-8.955 20-20 0-1.341-.138-2.651-.389-3.917z"
              />
            </svg>
            Sign up with Google
          </Button>

          <FieldDescription className="px-6 text-center">
            Already have an account?{" "}
            <Link href="/sign-in">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}