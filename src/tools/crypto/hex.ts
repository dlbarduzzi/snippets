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

function decodeHex(data: string, format: "bytes" | "string" = "string") {
  if (!data) {
    return ""
  }

  if (data.length % 2 !== 0) {
    throw new Error("Invalid hexadecimal string")
  }

  if (!/^[0-9a-f]+$/.test(data)) {
    throw new Error("Invalid hexadecimal string")
  }

  const result = new Uint8Array(data.length / 2)

  for (let i = 0; i < data.length; i += 2) {
    result[i / 2] = Number.parseInt(data.slice(i, i + 2), 16)
  }

  if (format === "bytes") {
    return result
  }

  return new TextDecoder().decode(result)
}

export { decodeHex, encodeHex }
