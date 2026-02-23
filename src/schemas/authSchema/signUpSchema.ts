import {z} from "zod";
import { passwordSchema } from "../inputSchema/passwordSchema";

export const signUpSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Name must be at least 3 characters long"),

  email: z.string()
    .trim()
    .email("Please enter a valid email address")
    .transform(val => val.toLowerCase()),

  password: passwordSchema,
});