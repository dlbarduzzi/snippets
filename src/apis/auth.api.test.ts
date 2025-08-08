import { describe, expect, it } from "vitest"

import { testApp } from "@/core/test"
import { authRoutes } from "./auth.api"

testApp.route("/", authRoutes)

describe("auth api", () => {
  it("get /test should validate response body", async () => {
    const res = await testApp.request("/test")
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, user: "Brian Smith" })
  })
})
