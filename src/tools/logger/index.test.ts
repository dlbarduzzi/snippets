import { logger } from "./index"
import { describe, expect, it } from "vitest"

describe("logger", () => {
  it("should have silent level when testing", () => {
    logger.info("hello world")
    expect(logger.silent).toBeTruthy()
  })
})
