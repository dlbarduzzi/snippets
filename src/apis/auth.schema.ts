import { z } from "zod"
import { strings } from "@/tools/strings"

const PASSWORD_MIN_CHARS = 8
const PASSWORD_MAX_CHARS = 72

const loginSchema = z.strictObject({
  email: z
    .email("Not a valid email")
    .trim()
    .min(1, "Email is required"),
  password: z
    .string({ error: "Password is required" })
    .trim()
    .min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(undefined),
})

const registerSchema = z.strictObject({
  email: z
    .email("Not a valid email")
    .trim()
    .min(1, "Email is required"),
  password: z
    .string({ error: "Password is required" })
    .trim()
    .min(1, "Password is required")
    .min(PASSWORD_MIN_CHARS, {
      error: `Password must be at least ${PASSWORD_MIN_CHARS} characters long`,
    })
    .max(PASSWORD_MAX_CHARS, {
      error: `Password must be at most ${PASSWORD_MAX_CHARS} characters long`,
    })
    .refine(value => strings(value).hasNumber(), {
      error: "Password must contain at least 1 number",
    })
    .refine(value => strings(value).hasSpecialChar(), {
      error: "Password must contain at least 1 special character",
    })
    .refine(value => strings(value).hasLowercaseChar(), {
      error: "Password must contain at least 1 lowercase character",
    })
    .refine(value => strings(value).hasUppercaseChar(), {
      error: "Password must contain at least 1 uppercase character",
    }),
})

export { loginSchema, registerSchema }
