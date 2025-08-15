import type { Hono, Context } from "hono"

import type { Logger } from "./logger"
import type { UserModel } from "@/apis/user.model"
import type { AuthModel } from "@/apis/auth.model"

type AppConfig = {
  logger: Logger
  models: {
    user: UserModel
    auth: AuthModel
  }
  mail: {
    sendEmailVerification: (email: string, token: string) => Promise<void>
  }
  isUnverifiedEmailAllowed: boolean
}

type AppEnv = {
  Variables: {
    config: AppConfig
  }
}

type App = Hono<AppEnv>
type AppContext = Context<AppEnv>
type SetHeaders = AppContext["header"]

export { type App, type AppConfig, type AppEnv, type SetHeaders }
