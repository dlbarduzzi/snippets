import z from "zod"

import { http } from "@/tools/http"
import { newApp } from "@/core/app"

import {
  internalServerError,
  invalidPayloadError,
  invalidRequestError,
  SafeErrorLogger,
} from "@/core/error"

import { registerSchema } from "./auth.schema"

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

  const parsed = registerSchema.safeParse(input)

  if (!parsed.success) {
    return invalidPayloadError(z.treeifyError(parsed.error).properties)
  }

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
