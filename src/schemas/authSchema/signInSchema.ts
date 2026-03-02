import { email, z } from "zod";
import { passwordSchema } from "../inputSchema/passwordSchema";
import { emailSchema } from "../inputSchema/emailSchema";

export const signInSchema = z.object({
  identifier: emailSchema,
  password: passwordSchema,
});