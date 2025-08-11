import { describe, expect, it } from "vitest"

import { http } from "@/tools/http"
import { testApp } from "@/core/test"

import { authRoutes } from "./auth.api"

testApp.route("/", authRoutes)

describe("auth register api", () => {
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
})
