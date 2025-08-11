import { createLogger, format, transports } from "winston"

function newLogger(level: string, isDev: boolean) {
  return createLogger({
    level,
    format: format.combine(
      format.timestamp(),
      format.json(),
      format.colorize({ all: isDev }),
    ),
    silent: level === "silent",
    transports: [new transports.Console()],
  })
}

export { newLogger }
