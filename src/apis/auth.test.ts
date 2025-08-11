import { execSync } from "node:child_process"
import { beforeAll, describe, expect, it } from "vitest"

import { http } from "@/tools/http"
import { testApp } from "@/core/test"

import { authRoutes } from "./auth.api"
import { db } from "@/db/connect"
import { users } from "@/db/schemas"
import { eq } from "drizzle-orm"

testApp.route("/", authRoutes)

describe("auth register api", () => {
  const email = "test@email.com"
  const password = "testPassword@123"

  beforeAll(async () => {
    execSync("npx drizzle-kit push")
    await db.delete(users).where(eq(users.email, email))
  })

  const jsonHeaders = new Headers({ "Content-Type": "application/json" })

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

    const response = await res.json()
    expect(response.status).toBe(http.StatusText(status))
    expect(response.message).toBe("User registered successfully.")

    expect(response).toHaveProperty("user")
    expect(response.user).toHaveProperty("email")
    expect(response.user.email).toBe(email)
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
