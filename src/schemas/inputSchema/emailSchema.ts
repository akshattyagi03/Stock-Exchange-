import {z} from "zod";

export const emailSchema = z.string()
    .trim()
    .email("Please enter a valid email address")
    .transform(val => val.toLowerCase());