import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  name: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "STOCKS EX | Verification Code for Registration",
      react: VerificationEmail({ name, verifyCode }),
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        message: "Failed to send verification email. Please try again later.",
      };
    }

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (emailError) {
    console.error("Unexpected email error:", emailError);
    return {
      success: false,
      message: "Failed to send verification email. Please try again later.",
    };
  }
}
