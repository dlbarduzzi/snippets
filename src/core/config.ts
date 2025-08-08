import type { AppConfig } from "./types"

import { logger } from "@/tools/logger"

function newConfig(): AppConfig {
  return { logger, user: "Jane Cooper" }
}

function newTestConfig(): AppConfig {
  return { logger, user: "Brian Smith" }
}

export { newConfig, newTestConfig }
