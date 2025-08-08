import { env } from "@/core/env"
import { createLogger, format, transports } from "winston"

const logger = createLogger({
  level: env.LOG_LEVEL,
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.colorize({ all: env.NODE_ENV === "development" }),
  ),
  silent: env.NODE_ENV === "test" || env.LOG_LEVEL === "silent",
  transports: [new transports.Console()],
})

export { logger }
