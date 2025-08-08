import type { App, AppEnv, AppConfig } from "./types"

import { Hono } from "hono"
import { requestId } from "hono/request-id"

function newApp() {
  return new Hono<AppEnv>({ strict: false })
}

function bootstrap(app: App, config: AppConfig) {
  app.use("*", requestId())

  app.use("*", async (ctx, next) => {
    ctx.set("config", config)
    await next()
  })
}

export { bootstrap, newApp }
