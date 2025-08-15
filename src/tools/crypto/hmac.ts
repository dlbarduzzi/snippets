import { subtle } from "uncrypto"
import { encodeHex } from "./hex"

const algorithm = { name: "HMAC", hash: { name: "SHA-256" } }

const hmac = {
  key: async (secret: string, keyUsage: "sign" | "verify") => {
    return await subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      algorithm,
      false,
      [keyUsage],
    )
  },
  sign: async (data: string, secret: string) => {
    const key = await hmac.key(secret, "sign")
    const buffer = await subtle.sign(
      algorithm.name,
      key,
      new TextEncoder().encode(data),
    )
    return encodeHex(new Uint8Array(buffer))
  },
  verify: async (data: string, secret: string, hexSignature: string) => {
    const bytes = new Uint8Array(hexSignature.length / 2)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Number.parseInt(hexSignature.slice(i * 2, i * 2 + 2), 16)
    }
    const key = await hmac.key(secret, "verify")
    const signature = new Uint8Array(bytes)
    return await subtle.verify(
      algorithm.name,
      key,
      signature,
      new TextEncoder().encode(data),
    )
  },
}

export { hmac }
