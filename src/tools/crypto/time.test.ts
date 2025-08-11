import { constantTimeEqual } from "./time"
import { describe, it, expect } from "vitest"

describe("constant time equal", () => {
  it("returns true for identical strings", () => {
    expect(constantTimeEqual("hello", "hello")).toBe(true)
  })

  it("returns false for strings of different length", () => {
    expect(constantTimeEqual("hello", "helloo")).toBe(false)
  })

  it("returns false for strings with different content", () => {
    expect(constantTimeEqual("hello", "hella")).toBe(false)
  })

  it("returns true for identical Uint8Arrays", () => {
    const a = new TextEncoder().encode("secret")
    const b = new TextEncoder().encode("secret")
    expect(constantTimeEqual(a, b)).toBe(true)
  })

  it("returns false for different Uint8Arrays of same length", () => {
    const a = new TextEncoder().encode("secret")
    const b = new TextEncoder().encode("secrex")
    expect(constantTimeEqual(a, b)).toBe(false)
  })

  it("returns false for Uint8Arrays of different length", () => {
    const a = new TextEncoder().encode("short")
    const b = new TextEncoder().encode("longer")
    expect(constantTimeEqual(a, b)).toBe(false)
  })

  it("works correctly with empty strings", () => {
    expect(constantTimeEqual("", "")).toBe(true)
    expect(constantTimeEqual("", "a")).toBe(false)
  })

  it("works correctly with empty Uint8Arrays", () => {
    const a = new Uint8Array([])
    const b = new Uint8Array([])
    expect(constantTimeEqual(a, b)).toBe(true)
  })
})
