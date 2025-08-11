import { http } from "@/tools/http"
import { newApp } from "@/core/app"

import {
  internalServerError,
  invalidRequestError,
  SafeErrorLogger,
} from "@/core/error"

const app = newApp()

app.post("/register", async ctx => {
  let input: unknown

  try {
    input = await ctx.req.json()
  }
  catch (error) {
    if (error instanceof SyntaxError) {
      return invalidRequestError()
    }

    SafeErrorLogger.log(error, "failed to parse json request body", {
      logger: ctx.var.config.logger,
      status: "AUTH_REGISTER_ERROR",
    })

    return internalServerError()
  }

  console.warn(input)

  const status = http.StatusCreated

  return ctx.json(
    {
      status: http.StatusText(status),
      message: "User registered successfully.",
    },
    status,
  )
})

export const authRoutes = app
