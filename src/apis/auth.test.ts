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

  it("post /register should succeed", async () => {
    const res = await testApp.request("/register", {
      body: JSON.stringify({ email: "", password: "" }),
      method: "POST",
      headers: { ...jsonHeaders },
    })
    const status = http.StatusCreated
    expect(res.status).toBe(status)
    expect(await res.json()).toEqual({
      status: http.StatusText(status),
      message: "User registered successfully.",
    })
  })
})
