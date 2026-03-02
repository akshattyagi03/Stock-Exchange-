"use client"

import { verifySchema } from "@/schemas/authSchema/verifySchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams, useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { RefreshCwIcon } from "lucide-react"

export default function Page() {
  const router = useRouter()
  const params = useParams<{ email: string }>()
  const decodedEmail = params.email
    ? decodeURIComponent(params.email)
    : ""

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  })

  const submit = async (data: z.infer<typeof verifySchema>) => {
    try {
      await axios.post(`/api/verify-code`, {
        email: decodedEmail,
        code: data.code,
      })

      toast.success("Account verified successfully 🎊!", {
        position: "top-center",
      })

      router.replace("/sign-in")
    } catch (error) {
      console.error("Error in verifying code", error)
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(
        axiosError?.response?.data?.message ||
          "Error in verifying code",
        { position: "top-center" }
      )
    }
  }

  return (
    <Card className="mx-auto max-w-md mt-15">
      <form onSubmit={form.handleSubmit(submit)}>
        <CardHeader>
          <CardTitle>Verify your account</CardTitle>
          <CardDescription>
            Enter the verification code we sent to your email address:{" "}
            <span className="font-medium">{decodedEmail}</span>.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="otp-verification">
                Verification code
              </FieldLabel>

              <Button
                type="button"
                variant="outline"
                size="sm"
              >
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                Resend Code
              </Button>
            </div>

            <Controller
              name="code"
              control={form.control}
              render={({ field }) => (
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  id="otp-verification"
                >
                  <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>

                  <InputOTPSeparator className="mx-2" />

                  <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />

            {form.formState.errors.code && (
              <p className="mt-2 text-sm text-red-600">
                {form.formState.errors.code.message}
              </p>
            )}

            <FieldDescription>
              <a href="/sign-up">
                I no longer have access to this email address.
              </a>
            </FieldDescription>
          </Field>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? "Verifying..."
              : "Verify"}
          </Button>

          <div className="text-sm text-muted-foreground">
            Having trouble signing in?{" "}
            <a
              href="#"
              className="underline underline-offset-4 transition-colors hover:text-primary"
            >
              Contact support
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}