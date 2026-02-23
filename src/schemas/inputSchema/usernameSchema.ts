import {z} from 'zod';

export const usernameSchema = z.string()
  .trim()
  .transform((val) => val.toUpperCase())
  .refine(
    (val) => /^[A-Z]{3}[0-9]{3}$/.test(val),
    { message: "Username must be 3 uppercase letters followed by 3 numbers" }
  );