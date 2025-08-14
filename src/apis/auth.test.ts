import { eq } from "drizzle-orm"
import { afterAll, describe, expect, it } from "vitest"

import { http } from "@/tools/http"
import { testApp } from "@/core/test"
import { generateRandomString, jwt } from "@/core/security"

import { db } from "@/db/connect"
import { users } from "@/db/schemas"

import { authRoutes } from "./auth.api"

testApp.route("/", authRoutes)

const jsonHeaders = new Headers({ "Content-Type": "application/json" })

// Make sure this is the same value as in `vitest.setup.ts` file
// when setting `process.env.SNIPPETS_SECRET` environment variable.
const testSnippetsSecret = "testSnippetsSecret123456789"

describe("auth apis", async () => {
  const randomString = generateRandomString(8, "a-z")

  const email = `test.${randomString}@email.com`
  const password = "testPassword@123"

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, email))
  })

  describe("register", () => {
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

  describe("email-verification", () => {
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

    it("get /email-verification should fail with expired token", async () => {
      const token = await jwt(testSnippetsSecret).sign({ email: "test@email.com" }, 0)
      const params = new URLSearchParams()
      params.append("token", token)
      const res = await testApp.request(`/email-verification?${params.toString()}`, {
        method: "GET",
        headers: { ...jsonHeaders },
      })
      const status = http.StatusUnauthorized
      expect(res.status).toBe(status)
      expect(await res.json()).toEqual({
        status: http.StatusText(status),
        message: "Token is expired.",
      })
    })

    it("get /email-verification should fail with invalid token", async () => {
      const token = "invalid"
      const params = new URLSearchParams()
      params.append("token", token)
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

    it("get /email-verification should fail with invalid JWT payload", async () => {
      const token = await jwt(testSnippetsSecret).sign({ test: "no-email" }, 300)
      const params = new URLSearchParams()
      params.append("token", token)
      const res = await testApp.request(`/email-verification?${params.toString()}`, {
        method: "GET",
        headers: { ...jsonHeaders },
      })
      const status = http.StatusUnauthorized
      expect(res.status).toBe(status)
      expect(await res.json()).toEqual({
        status: http.StatusText(status),
        message: "Token has invalid JWT payload.",
      })
    })

    it("get /email-verification should fail with user not found", async () => {
      const token = await jwt(testSnippetsSecret).sign({ email: "test@xyz.com" }, 300)
      const params = new URLSearchParams()
      params.append("token", token)
      const res = await testApp.request(`/email-verification?${params.toString()}`, {
        method: "GET",
        headers: { ...jsonHeaders },
      })
      const status = http.StatusUnauthorized
      expect(res.status).toBe(status)
      expect(await res.json()).toEqual({
        status: http.StatusText(status),
        message: "User with this email was not found.",
      })
    })

    it("get /email-verification should succeed with email verified", async () => {
      const token = await jwt(testSnippetsSecret).sign({ email }, 300)
      const params = new URLSearchParams()
      params.append("token", token)
      const res = await testApp.request(`/email-verification?${params.toString()}`, {
        method: "GET",
        headers: { ...jsonHeaders },
      })
      const status = http.StatusOk
      expect(res.status).toBe(status)
      expect(await res.json()).toMatchObject({
        user: { email, isEmailVerified: true },
        status: http.StatusText(status),
        message: "Email verified successfully! You can login now.",
      })
    })
  })

  describe("login", () => {
    it("post /login should fail with invalid json request", async () => {
      const res = await testApp.request("/login", {
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

    it("post /login should fail with invalid json payload", async () => {
      const res = await testApp.request("/login", {
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
            ],
          },
        },
      })
    })

    it("post /login should fail with user not found", async () => {
      const res = await testApp.request("/login", {
        body: JSON.stringify({ email: "test@xyz.com", password }),
        method: "POST",
        headers: { ...jsonHeaders },
      })
      const status = http.StatusUnauthorized
      expect(res.status).toBe(status)
      expect(await res.json()).toEqual({
        status: http.StatusText(status),
        message: "Invalid email or password.",
      })
    })

    it("post /login should fail with wrong password", async () => {
      const res = await testApp.request("/login", {
        body: JSON.stringify({ email, password: "wrong" }),
        method: "POST",
        headers: { ...jsonHeaders },
      })
      const status = http.StatusUnauthorized
      expect(res.status).toBe(status)
      expect(await res.json()).toEqual({
        status: http.StatusText(status),
        message: "Invalid email or password.",
      })
    })

    it("post /login should login user successfully", async () => {
      const res = await testApp.request("/login", {
        body: JSON.stringify({ email, password }),
        method: "POST",
        headers: { ...jsonHeaders },
      })

      const response = await res.json()

      if (res.status === http.StatusUnauthorized) {
        const status = http.StatusUnauthorized
        expect(res.status).toBe(status)
        expect(response).toEqual({
          status: http.StatusText(status),
          message: "Invalid email or password.",
        })
      }

      if (res.status === http.StatusOk) {
        const status = http.StatusOk
        expect(res.status).toBe(status)

        expect(response).toMatchObject({
          user: { email },
          status: http.StatusText(status),
          message: "User logged in successfully.",
        })

        expect(response).toHaveProperty("token")
        expect(response.token).toHaveLength(32)
      }
    })
  })
})
