import type { AppConfig } from "./types"

import { logger } from "./logger"

function newConfig(): AppConfig {
  return { logger }
}

export { newConfig }
