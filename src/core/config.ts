import type { AppConfig } from "./types"

import { db } from "@/db/connect"

import { AuthModel } from "@/apis/auth.model"
import { UserModel } from "@/apis/user.model"

import { sendEmailVerification } from "@/mail/email-verification"

import { env } from "./env"
import { logger } from "./logger"

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
    isUnverifiedEmailAllowed: env.ALLOW_UNVERIFIED_EMAIL,
  }
}

export { APP_NAME, newConfig }
