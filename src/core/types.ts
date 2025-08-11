import type { Hono } from "hono"
import type { Logger } from "./logger"

type AppConfig = {
  logger: Logger
}

type AppEnv = {
  Variables: {
    config: AppConfig
  }
}

type App = Hono<AppEnv>

export { type App, type AppConfig, type AppEnv }
