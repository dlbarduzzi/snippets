import type { AppConfig } from "./types"

import { logger } from "@/tools/logger"

function newConfig(): AppConfig {
  return { logger, user: "Jane Cooper" }
}

export { newConfig }
