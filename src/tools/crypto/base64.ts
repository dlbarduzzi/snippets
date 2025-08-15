const base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
const base64url = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

type DecodeFormat = "bytes" | "string"

function encode(data: Uint8Array, padding: boolean, alphabet: string) {
  let shift = 0
  let buffer = 0
  let result = ""

  for (const byte of data) {
    shift += 8
    buffer = (buffer << 8) | byte
    while (shift >= 6) {
      shift -= 6
      result += alphabet[(buffer >> shift) & 0x3F]
    }
  }

  if (shift > 0) {
    result += alphabet[(buffer << (6 - shift)) & 0x3F]
  }

  if (padding) {
    const padCount = (4 - (result.length % 4)) % 4
    result += "=".repeat(padCount)
  }

  return result
}

function decode(data: string, alphabet: string, decodeFormat: DecodeFormat = "bytes") {
  const decodeMap = new Map<string, number>()
  for (let i = 0; i < alphabet.length; i++) {
    decodeMap.set(alphabet[i]!, i)
  }

  const result: number[] = []

  let buffer = 0
  let bitsCollected = 0

  for (const char of data) {
    if (char === "=") {
      break
    }

    const value = decodeMap.get(char)
    if (value === undefined) {
      throw new Error(`Invalid base64 character: ${char}`)
    }

    buffer = (buffer << 6) | value
    bitsCollected += 6

    if (bitsCollected >= 8) {
      bitsCollected -= 8
      result.push((buffer >> bitsCollected) & 0xFF)
    }
  }

  const bytes = Uint8Array.from(result)

  if (decodeFormat === "string") {
    return new TextDecoder().decode(bytes)
  }

  return bytes
}

export function encodeBase64(
  data: string | Uint8Array,
  padding: boolean = true,
) {
  const bytes = typeof data === "string"
    ? new TextEncoder().encode(data)
    : new Uint8Array(data)
  return encode(bytes, padding, base64)
}

export function encodeBase64url(
  data: string | Uint8Array,
  padding: boolean = true,
) {
  const bytes = typeof data === "string"
    ? new TextEncoder().encode(data)
    : new Uint8Array(data)
  return encode(bytes, padding, base64url)
}

export function decodeBase64(
  data: string | Uint8Array,
  format: DecodeFormat = "bytes",
) {
  if (typeof data !== "string") {
    data = new TextDecoder().decode(data)
  }
  const urlSafe = data.includes("-") || data.includes("_")
  const alphabet = urlSafe ? base64url : base64
  return decode(data, alphabet, format)
}

export function decodeBase64url(data: string, format: DecodeFormat = "bytes") {
  const urlSafe = data.includes("-") || data.includes("_")
  const alphabet = urlSafe ? base64url : base64
  return decode(data, alphabet, format)
}
