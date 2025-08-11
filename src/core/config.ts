import type { AppConfig } from "./types"

import { db } from "@/db/connect"
import { logger } from "./logger"

import { AuthModel } from "@/apis/auth.model"
import { UserModel } from "@/apis/user.model"

import { sendEmailVerification } from "@/mail/email-verification"

const APP_NAME = "Snippets"

function newConfig(): AppConfig {
  return {
    logger,
    models: {
      user: new UserModel(db),
      auth: new AuthModel(db),
    },
    mail: {
      sendEmailVerification,
    },
  }
}

export { APP_NAME, newConfig }
