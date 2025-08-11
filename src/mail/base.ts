import type { JSX } from "react"
import type { CreateEmailResponse } from "resend"

import { env } from "@/core/env"
import { Resend } from "resend"

const resend = new Resend(env.RESEND_API_KEY)

type EmailParams = {
  from: string
  recipients: string[]
  subject: string
  template: JSX.Element
}

async function sendEmail({
  from,
  recipients,
  subject,
  template,
}: EmailParams) {
  const result = await resend.emails.send({
    from,
    to: recipients,
    subject,
    react: template,
  })
  return result
}

type CreateEmailRetryResponse = CreateEmailResponse & {
  attempt: number
}

async function sendEmailWithRetry(
  params: EmailParams,
  maxRetries = 3,
): Promise<CreateEmailRetryResponse> {
  let attempt = 0
  let errorMessage = "send email with retry reached max attempts"

  while (attempt < maxRetries) {
    try {
      const result = await sendEmail(params)
      return { ...result, attempt: attempt + 1 }
    }
    catch (error) {
      attempt++
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
      else {
        if (error instanceof Error) {
          errorMessage = error.message
        }
      }
    }
  }

  // Return default error if email failed to be sent after all retries.
  return {
    data: null,
    error: {
      name: "internal_server_error",
      message: errorMessage,
    },
    attempt,
  }
}

export { sendEmail, sendEmailWithRetry }
