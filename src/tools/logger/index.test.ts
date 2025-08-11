import { newLogger } from "./index"
import { describe, expect, it } from "vitest"

describe("logger", () => {
  it("should have silent level when testing", () => {
    const logger = newLogger("silent", false)
    logger.info("hello world")
    expect(logger.silent).toBeTruthy()
  })
})
