import { describe, expect, it } from "vitest"
import { randomStringGenerator } from "./random"

describe("crypto random string generator", () => {
  it("should generate a random string with given length", () => {
    const generator = randomStringGenerator("a-z")
    const stringSize = 16
    const randomString = generator(stringSize)
    expect(randomString).toBeDefined()
    expect(randomString).toHaveLength(stringSize)
  })

  it("should use a custom alphabet to generate random string", () => {
    const generator = randomStringGenerator("A-Z", "0-9")
    const randomString = generator(8)
    const allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    expect([...randomString].every((char) => allowedChars.includes(char))).toBe(
      true,
    )
  })

  it("should throw an error when no valid characters are provided", () => {
    expect(() => randomStringGenerator()).toThrowError(
      "Random string generator must have valid alphabet",
    )
  })

  it("should throw an error when length is not positive", () => {
    const generator = randomStringGenerator("a-z")
    expect(() => generator(0)).toThrowError(
      "Random string generator size must be a positive integer",
    )
    expect(() => generator(-5)).toThrowError(
      "Random string generator size must be a positive integer",
    )
  })

  it("should respect a new and valid alphabet when provided during generation", () => {
    const generator = randomStringGenerator("a-z")
    const newAlphabet = "A-Z"
    const randomString = generator(10, newAlphabet)
    const allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    expect([...randomString].every((char) => allowedChars.includes(char))).toBe(
      true,
    )
  })

  it("should generate consistent randomness with valid mask calculations", () => {
    const generator = randomStringGenerator("0-9")
    const randomString = generator(10)
    const allowedChars = "0123456789"
    expect([...randomString].every((char) => allowedChars.includes(char))).toBe(
      true,
    )
  })
})
