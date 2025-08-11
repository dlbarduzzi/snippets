import type { Hono } from "hono"
import type { Logger } from "./logger"
import type { UserModel } from "@/apis/user.model"
import type { AuthModel } from "@/apis/auth.model"

type AppConfig = {
  logger: Logger
  models: {
    user: UserModel
    auth: AuthModel
  }
}

type AppEnv = {
  Variables: {
    config: AppConfig
  }
}

type App = Hono<AppEnv>

export { type App, type AppConfig, type AppEnv }
