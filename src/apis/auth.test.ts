import { afterAll, describe, expect, it } from "vitest"

import { eq } from "drizzle-orm"

import { http } from "@/tools/http"
import { testApp } from "@/core/test"
import { generateRandomString } from "@/core/security"

import { db } from "@/db/connect"
import { users } from "@/db/schemas"

import { authRoutes } from "./auth.api"

testApp.route("/", authRoutes)

const jsonHeaders = new Headers({ "Content-Type": "application/json" })

describe("auth register api", () => {
  const randomString = generateRandomString(8, "a-z")

  const email = `test.${randomString}@email.com`
  const password = "testPassword@123"

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, email))
  })

  it("post /register should fail with invalid json request", async () => {
    const res = await testApp.request("/register", {
      method: "POST",
      headers: { ...jsonHeaders },
    })
    const status = http.StatusBadRequest
    expect(res.status).toBe(status)
    expect(await res.json()).toEqual({
      status: http.StatusText(status),
      message: "Invalid JSON request.",
    })
  })

  it("post /register should fail with invalid json payload", async () => {
    const res = await testApp.request("/register", {
      body: JSON.stringify({ email: "", password: "" }),
      method: "POST",
      headers: { ...jsonHeaders },
    })
    const status = http.StatusBadRequest
    expect(res.status).toBe(status)
    expect(await res.json()).toEqual({
      status: "Bad Request",
      message: "Invalid JSON payload.",
      details: {
        email: {
          errors: [
            "Not a valid email",
            "Email is required",
          ],
        },
        password: {
          errors: [
            "Password is required",
            "Password must be at least 8 characters long",
            "Password must contain at least 1 number",
            "Password must contain at least 1 special character",
            "Password must contain at least 1 lowercase character",
            "Password must contain at least 1 uppercase character",
          ],
        },
      },
    })
  })

  it("post /register should register user successfully", async () => {
    const res = await testApp.request("/register", {
      body: JSON.stringify({ email, password }),
      method: "POST",
      headers: { ...jsonHeaders },
    })
    const status = http.StatusCreated
    expect(res.status).toBe(status)
    expect(await res.json()).toMatchObject({
      user: { email, isEmailVerified: false },
      status: http.StatusText(status),
      message: "User registered successfully.",
    })
  })

  it("post /register should fail with email already registered", async () => {
    const res = await testApp.request("/register", {
      body: JSON.stringify({ email, password }),
      method: "POST",
      headers: { ...jsonHeaders },
    })
    const status = http.StatusUnprocessableEntity
    expect(res.status).toBe(status)
    expect(await res.json()).toEqual({
      status: http.StatusText(status),
      message: "This email is already registered.",
    })
  })
})

describe("auth verify email api", () => {
  it("get /email-verification should fail with missing token", async () => {
    const res = await testApp.request("/email-verification", {
      method: "GET",
      headers: { ...jsonHeaders },
    })
    const status = http.StatusUnauthorized
    expect(res.status).toBe(status)
    expect(await res.json()).toEqual({
      status: http.StatusText(status),
      message: "Token is missing.",
    })
  })

  it("get /email-verification should fail with invalid token", async () => {
    const params = new URLSearchParams()
    params.append("token", "invalid")
    const res = await testApp.request(`/email-verification?${params.toString()}`, {
      method: "GET",
      headers: { ...jsonHeaders },
    })
    const status = http.StatusUnauthorized
    expect(res.status).toBe(status)
    expect(await res.json()).toEqual({
      status: http.StatusText(status),
      message: "Token is invalid.",
    })
  })
})
