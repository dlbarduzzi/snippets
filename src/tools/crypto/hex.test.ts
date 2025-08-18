import { Buffer } from "node:buffer"
import { describe, expect, it } from "vitest"

import { decodeHex, encodeHex } from "./hex"

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

describe("decode hexadecimal", () => {
  it("should decode a hexadecimal string to its original value", () => {
    const input = "Hello, World!"
    expect(decodeHex(Buffer.from(input).toString("hex"))).toBe(input)
  })

  it("should decode a hexadecimal string to binary data", () => {
    const input = "Hello"
    expect(decodeHex(Buffer.from(input).toString("hex"))).toBe(input)
  })

  it("should decode a hexadecimal string to bytes data", () => {
    const input = "Hello"
    const encoded = decodeHex(Buffer.from(input).toString("hex"), "bytes")
    expect(encoded.toString()).toBe("72,101,108,108,111")
  })

  it("should throw an error for an invalid length string", () => {
    const input = "123"
    expect(() => decodeHex(input)).toThrowError("Invalid hexadecimal string")
  })

  it("should throw an error for a non-hexadecimal string", () => {
    const input = "xxxx"
    expect(() => decodeHex(input)).toThrowError("Invalid hexadecimal string")
  })
})

describe("encode and decode hexadecimal", () => {
  it("should decode original string", () => {
    const input = "Hello, World!"
    const encoded = encodeHex(input)
    const decoded = decodeHex(encoded)
    expect(decoded).toBe(input)
  })

  it("should handle empty strings", () => {
    const input = ""
    const encoded = encodeHex(input)
    const decoded = decodeHex(encoded)
    expect(decoded).toBe(input)
  })
})
