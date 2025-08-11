import type { Logger, StatusError } from "./logger"
import type { StatusCode, StatusText } from "@/tools/http"

import { http } from "@/tools/http"
import { toSentence } from "@/tools/inflector"

import { env } from "./env"

type ApiError = {
  message?: string
  statusCode: StatusCode
  statusText: StatusText
  errorDetails?: { [key: string]: unknown }
}

function newApiError({
  message,
  statusCode,
  statusText,
  errorDetails,
}: ApiError) {
  return Response.json({
    status: statusText,
    message,
    ...errorDetails,
  }, {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  })
}

function badRequestError(message?: string) {
  if (message) {
    message = toSentence(message.trim())
  }

  const statusCode = http.StatusBadRequest
  const statusText = http.StatusText(statusCode)

  return newApiError({ message, statusCode, statusText })
}

function notFoundError() {
  const message = "The requested resource was not found."

  const statusCode = http.StatusNotFound
  const statusText = http.StatusText(statusCode)

  return newApiError({ message, statusCode, statusText })
}

function internalServerError() {
  const message = toSentence("Something went wrong while processing your request.")

  const statusCode = http.StatusInternalServerError
  const statusText = http.StatusText(statusCode)

  return newApiError({ message, statusCode, statusText })
}

function invalidRequestError() {
  return badRequestError("Invalid JSON request")
}

type SanitizedError = {
  message: string
  cause?: unknown
  stack?: unknown
}

type SafeErrorOptions = {
  logger: Logger
  status: StatusError
  includeStack?: boolean
}

class SafeErrorLogger {
  private static isDev = env.NODE_ENV === "development"
  private static isStackAllowed = env.IS_LOG_STACK_ALLOWED

  static sanitize(error: unknown, message: string, options: SafeErrorOptions) {
    message = message.trim()

    if (message === "") {
      message = "uncaught exception"
    }

    const sanitized: SanitizedError = { message }

    if (!(error instanceof Error)) {
      return sanitized
    }

    const errorMessage = error.message.trim()
    const finalMessage = errorMessage ? `${message} - ${errorMessage}` : message

    const includeStack = typeof options.includeStack === "boolean"
      ? options.includeStack
      : SafeErrorLogger.isDev || SafeErrorLogger.isStackAllowed

    return { message: finalMessage, ...(includeStack && {
      stack: error.stack,
      cause: error.cause,
    }) }
  }

  static log(error: unknown, message: string, options: SafeErrorOptions) {
    const sanitized = SafeErrorLogger.sanitize(error, message, options)

    options.logger.error(options.status, message, {
      stack: sanitized.stack ? sanitized.stack : undefined,
      cause: sanitized.cause ? sanitized.cause : undefined,
    })

    return sanitized
  }
}

export {
  badRequestError,
  internalServerError,
  invalidRequestError,
  notFoundError,
  SafeErrorLogger,
}
