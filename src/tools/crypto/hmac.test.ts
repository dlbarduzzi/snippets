import { describe, expect, it } from "vitest"
import { hmac } from "./hmac"

describe("hmac key", () => {
  const testValue = "Test value!"
  const testSecret = "test-secret"

  let signature: string

  it("should import HMAC crypto key", async () => {
    const key = await hmac.key(testSecret, "sign")
    expect(key).toBeDefined()
    expect(key.algorithm.name).toBe("HMAC")
  })

  it("should create HMAC signature", async () => {
    signature = await hmac.sign(testValue, testSecret)
    expect(typeof signature).toBe("string")
    expect(signature.length).toBeGreaterThan(0)
  })

  it("should verify HMAC signature", async () => {
    const isVerified = await hmac.verify(testValue, testSecret, signature)
    expect(isVerified).toBeTruthy()
  })

  it("should fail verification with different value", async () => {
    const isVerified = await hmac.verify("New value!", testSecret, signature)
    expect(isVerified).toBeFalsy()
  })

  it("should fail verification with different secret", async () => {
    const isVerified = await hmac.verify(testValue, "new-secret", signature)
    expect(isVerified).toBeFalsy()
  })

  it("should fail verification with different signature", async () => {
    const isVerified = await hmac.verify(testValue, testSecret, "new-signature")
    expect(isVerified).toBeFalsy()
  })
})
