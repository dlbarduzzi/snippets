import type { SessionSchema, UserSchema } from "@/db/schemas"
import type { JWTVerifyResult, JWTPayload } from "jose"

import z from "zod"

import { jwtVerify } from "jose"
import { JWTExpired } from "jose/errors"

import { env } from "@/core/env"
import { newApp } from "@/core/app"
import { getDate } from "@/core/time"
import { getIpAddress } from "@/core/request"
import { generateId, jwt } from "@/core/security"

import {
  cookies,
  getCachedCookie,
  getSignedCookie,
  setCookie,
  setSessionCookie,
} from "@/core/cookie"

import {
  forbiddenError,
  internalServerError,
  invalidPayloadError,
  invalidRequestError,
  SafeErrorLogger,
  unauthorizedError,
  unprocessableEntityError,
} from "@/core/error"

import { http } from "@/tools/http"
import { hashPassword, verifyPassword } from "@/tools/crypto/password"

import { loginSchema, registerSchema } from "./auth.schema"

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

app.post("/login", async ctx => {
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
      status: "AUTH_LOGIN_ERROR",
      includeStack: true,
    })

    return internalServerError()
  }

  const parsed = loginSchema.safeParse(input)

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
      status: "AUTH_LOGIN_ERROR",
    })
    return internalServerError()
  }

  if (user == null) {
    // Hash password for valid and invalid emails to ensure uniform response time
    // between requests to help prevent attackers from detecting valid emails.
    await hashPassword(parsed.data.password)
    return unauthorizedError("Invalid email or password.")
  }

  let passwordHash: string

  try {
    const password = await ctx.var.config.models.user.findPasswordByUserId(user.id)

    if (password == null) {
      ctx.var.config.logger.warnSimple("password should exist for found user", {
        user: { id: user.id, email: user.email },
      })
      return unauthorizedError("Invalid email or password.")
    }

    passwordHash = password.hash
  }
  catch (error) {
    SafeErrorLogger.log(error, "db query to find password by user id failed", {
      logger: ctx.var.config.logger,
      status: "AUTH_LOGIN_ERROR",
    })
    return internalServerError()
  }

  const isVerified = await verifyPassword(passwordHash, parsed.data.password)

  if (!isVerified) {
    return unauthorizedError("Invalid email or password.")
  }

  if (!user.isEmailVerified && !ctx.var.config.isUnverifiedEmailAllowed) {
    return forbiddenError("This email is not verified.")
  }

  let session: SessionSchema | undefined

  try {
    session = await ctx.var.config.models.user.createSession({
      token: generateId(32),
      userId: user.id,
      ipAddress: getIpAddress(ctx.req.raw) ?? "",
      userAgent: ctx.req.header()["user-agent"] ?? "",
      expiresAt: parsed.data.rememberMe === false
        ? getDate(60 * 60 * 24 * 1, "sec") // 1 day
        : getDate(60 * 60 * 24 * 7, "sec"), // 7 days,
    })
  }
  catch (error) {
    SafeErrorLogger.log(error, "db query to create user session failed", {
      logger: ctx.var.config.logger,
      status: "AUTH_LOGIN_ERROR",
    })
    return internalServerError()
  }

  const doNotRememberMe = typeof parsed.data.rememberMe === "boolean"
    ? !parsed.data.rememberMe
    : undefined

  await setSessionCookie({
    data: { user, session },
    headers: { get: ctx.req.raw.headers, set: ctx.header },
    doNotRememberMe,
  })

  const status = http.StatusOk

  return ctx.json(
    {
      user,
      token: session.token,
      status: http.StatusText(status),
      message: "User logged in successfully.",
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

app.get("/session", async ctx => {
  const sessionTokenCookie = await getSignedCookie(
    cookies.sessionToken.name,
    env.SNIPPETS_SECRET,
    ctx.req.raw.headers,
  )

  if (sessionTokenCookie == null) {
    const status = http.StatusUnauthorized
    return ctx.json(
      {
        status: http.StatusText(status),
        message: "Session not found.",
        session: null,
      },
      status,
    )
  }

  const sessionData = await getCachedCookie(env.SNIPPETS_SECRET, ctx.req.raw.headers)
  if (sessionData) {
    const isExpired = sessionData.session.expiresAt < new Date()
    if (!isExpired) {
      const status = http.StatusOk
      return ctx.json(
        {
          status: http.StatusText(status),
          message: "Session data found.",
          user: sessionData.user,
          session: sessionData.session,
        },
        status,
      )
    }
    else {
      setCookie({
        name: cookies.sessionData.name,
        value: "",
        headers: ctx.header,
        options: cookies.sessionData.options({ maxAge: 0 }),
      })
    }
  }

  const status = http.StatusOk

  return ctx.json(
    {
      status: http.StatusText(status),
      session: null,
    },
    status,
  )
})

export const authRoutes = app
