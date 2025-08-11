import type { UserSchema } from "@/db/schemas"

import z from "zod"

import { env } from "@/core/env"
import { jwt } from "@/core/security"
import { http } from "@/tools/http"
import { newApp } from "@/core/app"

import {
  internalServerError,
  invalidPayloadError,
  invalidRequestError,
  SafeErrorLogger,
  unprocessableEntityError,
} from "@/core/error"

import { registerSchema } from "./auth.schema"

const app = newApp()

app.get("/test", async ctx => {
  const email = "me@email.com"
  const token = await jwt(env.SNIPPETS_SECRET).sign({ email }, 900)
  ctx.var.config.mail.sendEmailVerification(email, token)
  return ctx.json({ token }, http.StatusOk)
})

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
      includeStack: true,
    })

    return internalServerError()
  }

  const parsed = registerSchema.safeParse(input)

  if (!parsed.success) {
    return invalidPayloadError(z.treeifyError(parsed.error).properties)
  }

  let user: UserSchema | undefined

  try {
    user = await ctx.var.config.models.user.findUserByEmail(parsed.data.email)
  }
  catch (error) {
    SafeErrorLogger.log(error, "db query to find user by email failed", {
      logger: ctx.var.config.logger,
      status: "AUTH_REGISTER_ERROR",
    })
    return internalServerError()
  }

  if (user != null) {
    return unprocessableEntityError("This email is already registered.")
  }

  const { email, password } = parsed.data

  try {
    user = await ctx.var.config.models.auth.register(email, password)
  }
  catch (error) {
    SafeErrorLogger.log(error, "db query to register user failed", {
      logger: ctx.var.config.logger,
      status: "AUTH_REGISTER_ERROR",
    })
    return internalServerError()
  }

  const token = await jwt(env.SNIPPETS_SECRET).sign({ email: user.email }, 900)
  ctx.var.config.mail.sendEmailVerification(user.email, token)

  const status = http.StatusCreated

  return ctx.json(
    {
      user,
      status: http.StatusText(status),
      message: "User registered successfully.",
    },
    status,
  )
})

export const authRoutes = app
