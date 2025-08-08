import { describe, expect, it } from "vitest"

import { newTestConfig } from "@/core/config"
import { bootstrap, newApp } from "@/core/app"

import { authRoutes } from "./auth.api"

const testApp = newApp()
const testConfig = newTestConfig()

bootstrap(testApp, testConfig)

testApp.route("/", authRoutes)

describe("auth api", () => {
  it("get /test should validate response body", async () => {
    const res = await testApp.request("/test")
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, user: "Brian Smith" })
  })
})
