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
          >
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