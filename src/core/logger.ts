import type { MiddlewareHandler } from "hono"

import { env } from "./env"
import { newLogger } from "@/tools/logger"

type Status =
  | "REQUEST_DETAILS"
  | "EMAIL_VERIFICATION_SUCCESS"

type StatusError =
  | "GLOBAL_ERROR"
  | "AUTH_REGISTER_ERROR"
  | "AUTH_VERIFY_EMAIL_ERROR"
  | "EMAIL_VERIFICATION_ERROR"

type Options = { [key: string]: unknown }

const baseLogger = newLogger(env.LOG_LEVEL, env.NODE_ENV === "development")

const logger = {
  debug: (status: Status, message: string, options?: Options) => {
    baseLogger.debug(message, { status, ...options })
  },
  info: (status: Status, message: string, options?: Options) => {
    baseLogger.info(message, { status, ...options })
  },
  infoSimple: (message: string, options?: Options) => {
    baseLogger.info(message, { ...options })
  },
  warn: (status: Status, message: string, options?: Options) => {
    baseLogger.warn(message, { status, ...options })
  },
  error: (status: StatusError, message: string, options?: Options) => {
    baseLogger.error(message, { status, ...options })
  },
}

const logRequest: MiddlewareHandler = async (ctx, next) => {
  const startTime = performance.now()
  await next()

  const endTime = performance.now()

  const duration = `${Math.round(endTime - startTime)}ms`
  const requestId = ctx.get("requestId")

  const { status } = ctx.res
  const { path, method } = ctx.req

  logger.info("REQUEST_DETAILS", "request details", {
    request: { id: requestId, path, method, status, duration },
  })
}

type Logger = typeof logger

export {
  logger,
  type Logger,
  logRequest,
  type StatusError,
}
