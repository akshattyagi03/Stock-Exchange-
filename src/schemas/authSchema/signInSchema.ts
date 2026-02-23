import { z } from "zod";
import { passwordSchema } from "../inputSchema/passwordSchema";
import { usernameSchema } from "../inputSchema/usernameSchema";

export const signInSchema = z.object({
  identifier: usernameSchema.or(z.string().email()),
  password: passwordSchema,
});