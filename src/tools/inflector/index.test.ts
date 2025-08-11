import { toSentence } from "./index"
import { describe, expect, it } from "vitest"

describe("inflector", () => {
  it("should convert to a sentence", () => {
    expect(toSentence("this is a test")).toBe("This is a test.")
  })
  it("should keep sentence as is", () => {
    expect(toSentence("This is a test.")).toBe("This is a test.")
    expect(toSentence("This is a test?")).toBe("This is a test?")
    expect(toSentence("This is a test!")).toBe("This is a test!")
  })
  it("should return empty string", () => {
    expect(toSentence("")).toBe("")
  })
})
