function canonicalJson(data: unknown): string {
  if (typeof data === "number" && Number.isNaN(data)) {
    throw new TypeError("NaN is not allowed")
  }

  if (typeof data === "number" && !Number.isFinite(data)) {
    throw new TypeError("Infinity is not allowed")
  }

  if (data == null || typeof data !== "object") {
    return JSON.stringify(data)
  }

  if ("toJSON" in data && typeof data.toJSON === "function") {
    return canonicalJson(data.toJSON())
  }

  if (Array.isArray(data)) {
    const result = data.reduce((prev, next, index) => {
      const comma = index === 0 ? "" : ","
      const value = next === undefined || typeof next === "symbol" ? null : next
      return `${prev}${comma}${canonicalJson(value)}`
    }, "")
    return `[${result}]`
  }

  const result = Object.keys(data).sort().reduce((prev, next) => {
    const value = (data as { [key: string]: unknown })[next]
    if (value === undefined || typeof value === "symbol") {
      return prev
    }
    const comma = prev.length === 0 ? "" : ","
    return `${prev}${comma}${canonicalJson(next)}:${canonicalJson(value)}`
  }, "")

  return `[${result}]`
}

export { canonicalJson }
