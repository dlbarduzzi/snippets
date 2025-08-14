import type { AppConfig } from "./types"

import { db } from "@/db/connect"
import { logger } from "./logger"
import { bootstrap, newApp } from "@/core/app"

import { AuthModel } from "@/apis/auth.model"
import { UserModel } from "@/apis/user.model"

function newTestConfig(): AppConfig {
  return {
    logger,
    models: {
      user: new UserModel(db),
      auth: new AuthModel(db),
    },
    mail: {
      sendEmailVerification: async (_email: string, _token: string) => {
        // Mocking sendEmailVerification function for testing.
      },
    },
    isUnverifiedEmailAllowed: true,
  }
}

const testApp = newApp()
const testConfig = newTestConfig()

bootstrap(testApp, testConfig)

export { testApp }
