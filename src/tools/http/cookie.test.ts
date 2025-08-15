import { describe, expect, it } from "vitest"
import { getAllCookies, getOneCookie, serializeCookie } from "./cookie"

describe("parse cookie", () => {
  const testCookie = "cookie_one=value-one; cookie_two=value-two"

  it("should get all cookies", () => {
    const result = getAllCookies(testCookie)
    expect(result.size).toBe(2)
    expect(result.get("cookie_one")).toBe("value-one")
    expect(result.get("cookie_two")).toBe("value-two")
  })

  it("should get one cookies", () => {
    const result = getOneCookie("cookie_one", testCookie)
    expect(result.size).toBe(1)
    expect(result.get("cookie_one")).toBe("value-one")
  })

  it("should get no cookies", () => {
    const result = getOneCookie("non_existent", testCookie)
    expect(result.size).toBe(0)
    expect(result.get("non_existent")).toBeUndefined()
  })

  it("should get no cookies for invalid cookie", () => {
    const result = getAllCookies("invalid")
    expect(result.size).toBe(0)
  })

  it("should get no cookies for not found cookie name", () => {
    const result = getOneCookie("cookie", testCookie)
    expect(result.size).toBe(0)
  })
})

describe("serialize cookie", () => {
  it("should serialize cookie", () => {
    const result = serializeCookie("cookie_one", "value-one", {})
    expect(result).toBe("cookie_one=value-one")
  })

  it("should serialize cookie with all options", () => {
    const result = serializeCookie("__Secure-cookie_one", "value-one", {
      path: "/",
      secure: true,
      domain: "test.com",
      httpOnly: true,
      maxAge: 1000,
      expires: new Date(Date.UTC(2020, 12, 26, 10, 30, 15, 300)),
      sameSite: "Strict",
      priority: "High",
      partitioned: true,
    })
    expect(result).toBe(
      // eslint-disable-next-line style/max-len
      "__Secure-cookie_one=value-one; Max-Age=1000; Domain=test.com; Path=/; Expires=Tue, 26 Jan 2021 10:30:15 GMT; HttpOnly; Secure; SameSite=Strict; Priority=High; Partitioned",
    )
  })

  it("should serialize cookie with max-age 0", () => {
    const result = serializeCookie("cookie_one", "value-one", { maxAge: 0 })
    expect(result).toBe("cookie_one=value-one; Max-Age=0")
  })

  it("should serialize cookie with max-age -1", () => {
    const result = serializeCookie("cookie_one", "value-one", { maxAge: -1 })
    expect(result).toBe("cookie_one=value-one")
  })

  it("should serialized cookie with host and path options", () => {
    const result = serializeCookie("__Host-cookie_one", "value-one", {
      path: "/",
      secure: true,
    })
    expect(result).toBe("__Host-cookie_one=value-one; Path=/; Secure")
  })

  it("should throw an error with insecure option", () => {
    expect(() => {
      serializeCookie("__Secure-cookie_one", "value-one", {
        secure: false,
      })
    }).toThrowError("__Secure- cookie must have Secure attribute")
  })

  it("should throw an error with host insecure option", () => {
    expect(() => {
      serializeCookie("__Host-cookie_one", "value-one", {
        secure: false,
      })
    }).toThrowError("__Host- cookie must have Secure attribute")
  })

  it("should throw an error with host invalid domain option", () => {
    expect(() => {
      serializeCookie("__Host-cookie_one", "value-one", {
        path: "/",
        secure: true,
        domain: "test.com",
      })
    }).toThrowError("__Host- cookie must not have Domain attribute")
  })

  it("should throw an error with host invalid path option", () => {
    expect(() => {
      serializeCookie("__Host-cookie_one", "value-one", {
        path: "/test",
        secure: true,
      })
    }).toThrowError("__Host- cookie must have Path attribute set to '/'")
  })

  it("should throw an error with max-age invalid option", () => {
    expect(() => {
      serializeCookie("cookie_one", "value-one", {
        maxAge: 3600 * 24 * 402,
      })
    }).toThrowError("Cookie Max-Age attribute must not be greater than 400 days")
  })

  it("should throw an error with expires invalid option", () => {
    expect(() => {
      serializeCookie("cookie_one", "value-one", {
        expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 402),
      })
    }).toThrowError("Cookie Expires attribute must not be greater than 400 days")
  })

  it("should throw an error with invalid partitioned options", () => {
    expect(() => {
      serializeCookie("cookie_one", "value-one", {
        secure: false,
        partitioned: true,
      })
    }).toThrowError("Partitioned cookie must have Secure attribute")
  })
})
