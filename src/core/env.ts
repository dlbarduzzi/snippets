import { z } from "zod"
import { config } from "dotenv"
import { expand } from "dotenv-expand"

expand(config({ quiet: true }))

const schema = z.object({
  NODE_ENV: z.enum(["test", "development", "production"]),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "silent"]).default("info"),
  APP_URL: z.url(),
  APP_PORT: z.coerce.number().int().positive(),
  IS_LOG_STACK_ALLOWED: z.enum(["true", "false"]).transform(value => value === "true"),
  DATABASE_URL: z.url(),
  SNIPPETS_SECRET: z.string().min(12),
  RESEND_API_KEY: z.string().min(1),
  APP_EMAIL_ONBOARDING: z.email(),
})

// eslint-disable-next-line node/no-process-env
const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables ❌",
    JSON.stringify(parsed.error.issues, null, 2),
  )
  // eslint-disable-next-line node/no-process-exit
  process.exit(1)
}

export const env = parsed.data
