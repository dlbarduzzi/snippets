function encodeHex(data: string | Uint8Array) {
  if (typeof data === "string") {
    data = new TextEncoder().encode(data)
  }

  if (data.length === 0) {
    return ""
  }

  const buffer = new Uint8Array(data)

  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

export { encodeHex }
