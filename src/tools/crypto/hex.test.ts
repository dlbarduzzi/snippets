import { Buffer } from "node:buffer"
import { describe, expect, it } from "vitest"

import { encodeHex } from "./hex"

describe("encode hexadecimal", () => {
  it("should encode a string to hexadecimal", () => {
    const input = "Hello, World!"
    expect(encodeHex(input)).toBe(Buffer.from(input).toString("hex"))
  })

  it("should encode a buffer string to hexadecimal", () => {
    const input = new TextEncoder().encode("Hello")
    expect(encodeHex(input)).toBe(Buffer.from(input).toString("hex"))
  })

  it("should encode a buffer array to hexadecimal", () => {
    const input = new Uint8Array([72, 101, 108, 108, 111])
    expect(encodeHex(input)).toBe(Buffer.from(input).toString("hex"))
  })
})
