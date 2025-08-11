import { http } from "./index"
import { describe, expect, it } from "vitest"

describe("http status", () => {
  it("should match status code and text", () => {
    expect(http.StatusText(http.StatusOk))
      .toBe("Ok")
    expect(http.StatusText(http.StatusCreated))
      .toBe("Created")
    expect(http.StatusText(http.StatusBadRequest))
      .toBe("Bad Request")
    expect(http.StatusText(http.StatusUnauthorized))
      .toBe("Unauthorized")
    expect(http.StatusText(http.StatusForbidden))
      .toBe("Forbidden")
    expect(http.StatusText(http.StatusNotFound))
      .toBe("Not Found")
    expect(http.StatusText(http.StatusUnprocessableEntity))
      .toBe("Unprocessable Entity")
    expect(http.StatusText(http.StatusInternalServerError))
      .toBe("Internal Server Error")
  })

  it("should throw an error with invalid status code", () => {
    // @ts-expect-error: force error to test catch behavior
    expect(() => http.StatusText("test")).toThrowError("Invalid status code: test")
  })
})
