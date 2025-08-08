import type { Hono } from "hono"
import type { Logger } from "winston"

type AppConfig = {
  user: string
  logger: Logger
}

type AppEnv = {
  Variables: {
    config: AppConfig
  }
}

type App = Hono<AppEnv>

export { type App, type AppConfig, type AppEnv }
