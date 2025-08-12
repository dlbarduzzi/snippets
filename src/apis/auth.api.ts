import type { UserSchema } from "@/db/schemas"
import type { JWTVerifyResult, JWTPayload } from "jose"

import z from "zod"

import { jwtVerify } from "jose"
import { JWTExpired } from "jose/errors"

import { env } from "@/core/env"
import { jwt } from "@/core/security"
import { http } from "@/tools/http"
import { newApp } from "@/core/app"

import {
  internalServerError,
  invalidPayloadError,
  invalidRequestError,
  SafeErrorLogger,
  unauthorizedError,
  unprocessableEntityError,
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

app.get("/email-verification", async ctx => {
  const token = ctx.req.query("token")
  if (!token) {
    return unauthorizedError("Token is missing.")
  }

  let jwt: JWTVerifyResult<JWTPayload>

  try {
    jwt = await jwtVerify(
      token,
      new TextEncoder().encode(env.SNIPPETS_SECRET),
      {
        algorithms: ["HS256"],
      },
    )
  }
  catch (error) {
    if (error instanceof JWTExpired) {
      return unauthorizedError("Token is expired.")
    }
    else {
      return unauthorizedError("Token is invalid.")
    }
  }

  const schema = z.object({ email: z.email() })
  const parsed = schema.safeParse(jwt.payload)

  if (!parsed.success) {
    return unauthorizedError("Token has invalid JWT payload.")
  }

  let user: UserSchema | undefined

  try {
    user = await ctx.var.config.models.user.findUserByEmail(parsed.data.email)
  }
  catch (error) {
    SafeErrorLogger.log(error, "db query to find user by email failed", {
      logger: ctx.var.config.logger,
      status: "AUTH_EMAIL_VERIFICATION_ERROR",
    })
    return internalServerError()
  }

  if (user == null) {
    return unauthorizedError("User with this email was not found.")
  }

  try {
    user = await ctx.var.config.models.user.verifyUserEmail(user.email)
  }
  catch (error) {
    SafeErrorLogger.log(error, "db query to verify user email failed", {
      logger: ctx.var.config.logger,
      status: "AUTH_EMAIL_VERIFICATION_ERROR",
    })
    return internalServerError()
  }

  const status = http.StatusOk

  return ctx.json(
    {
      user,
      status: http.StatusText(status),
      message: "Email verified successfully! You can login now.",
    },
    status,
  )
})

export const authRoutes = app
