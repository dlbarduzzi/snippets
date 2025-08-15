import { Buffer } from "node:buffer"
import { describe, it, expect } from "vitest"
import { encodeBase64, encodeBase64url, decodeBase64, decodeBase64url } from "./base64"

describe("base64", () => {
  const input = "Hello, World!"
  const bytes = new TextEncoder().encode(input)

  const encodedBase64 = "SGVsbG8sIFdvcmxkIQ=="
  const encodedBase64url = "SGVsbG8sIFdvcmxkIQ"

  describe("base64 encode", () => {
    it("should encode a string to base64 with padding", async () => {
      const result = encodeBase64(input)
      expect(result).toBe(encodedBase64)
    })

    it("should encode a string to base64 without padding", async () => {
      const result = encodeBase64(input, false)
      expect(result).toBe(encodedBase64.replace(/=+$/, ""))
    })

    it("should encode a string to base64 url safe", async () => {
      const result = encodeBase64url(input, false)
      expect(result).toBe(encodedBase64url)
    })

    it("should encode an ArrayBuffer to base64", async () => {
      const result = encodeBase64(bytes)
      expect(result).toBe(encodedBase64)
    })
  })

  describe("base64 decode", () => {
    it("should decode a base64 string", async () => {
      const encoded = Buffer.from(input).toString("base64")
      const decoded = decodeBase64(encoded, "string")
      expect(decoded).toBe(input)
    })

    it("should decode a base64 safe string", async () => {
      const decoded = decodeBase64(encodedBase64url, "string")
      expect(decoded).toBe(input)
    })

    it("should decode a base64 url safe string", async () => {
      const decoded = decodeBase64url(encodedBase64url, "string")
      expect(decoded).toBe(input)
    })

    it("should throw an error for a invalid base64 char", () => {
      expect(() => decodeBase64("?")).toThrowError("Invalid base64 character: ?")
    })
  })

  describe("base64 encode and decode", () => {
    it("should encode and decode unicode characters", () => {
      const input = "🔥"
      const encoded = encodeBase64(input)
      const decoded = decodeBase64(encoded)
      expect(decoded.toString()).toBe("240,159,148,165")
    })
  })
})
