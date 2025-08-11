import type { App, AppEnv, AppConfig } from "./types"

import { Hono } from "hono"
import { requestId } from "hono/request-id"

import { logRequest } from "./logger"

import {
  internalServerError,
  notFoundError,
  SafeErrorLogger,
} from "./error"

function newApp() {
  return new Hono<AppEnv>({ strict: false })
}

function bootstrap(app: App, config: AppConfig) {
  app.use("*", requestId())

  app.use("*", async (ctx, next) => {
    ctx.set("config", config)
    await next()
  })

  app.use("*", logRequest)

  app.notFound(() => {
    return notFoundError()
  })

  app.onError((err, ctx) => {
    SafeErrorLogger.log(err, "internal server error", {
      logger: ctx.var.config.logger,
      status: "GLOBAL_ERROR",
    })
    return internalServerError()
  })
}

export { bootstrap, newApp }
