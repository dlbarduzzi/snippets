import { describe, it, expect } from "vitest"
import { hashPassword, verifyPassword } from "./password"

describe.sequential("password hashing and verification", async () => {
  // it("should hash and verify valid password", async () => {
  //   const password = "testPassword"
  //   const hash = await hashPassword(password)
  //   expect(hash).toMatch(/^[a-f0-9]{32}:[a-f0-9]+$/)

  //   const isValid = await verifyPassword(hash, password)
  //   expect(isValid).toBe(true)
  // })

  it("should fail verification with incorrect password", async () => {
    const password = "testPassword"
    const newPassword = "newPassword"

    const hash = await hashPassword(password)
    const isValid = await verifyPassword(hash, newPassword)

    expect(isValid).toBe(false)
  })

  it("should return false on malformed hash (missing colon)", async () => {
    const isValid = await verifyPassword("notavalidhash", "irrelevant")
    expect(isValid).toBe(false)
  })

  it("should generate different hashes for the same password", async () => {
    const hash = await hashPassword("repeatable")
    const newHash = await hashPassword("repeatable")
    expect(hash).not.toEqual(newHash)
  })
})
