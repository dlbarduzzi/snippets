import type { AppConfig } from "./types"

import { logger } from "./logger"
import { bootstrap, newApp } from "@/core/app"

function newTestConfig(): AppConfig {
  return { logger }
}

const testApp = newApp()
const testConfig = newTestConfig()

bootstrap(testApp, testConfig)

export { testApp }
