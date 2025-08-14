import type { JWTPayload } from "jose"

import { SignJWT } from "jose"
import { randomStringGenerator } from "@/tools/crypto/random"

const generateRandomString = randomStringGenerator("a-z", "A-Z", "0-9", "-_")

function generateId(size?: number) {
  return randomStringGenerator("a-z", "A-Z", "0-9")(size || 32)
}

function jwt(secret: string) {
  const jwtAlgorithm = "HS256"
  const encodedSecret = new TextEncoder().encode(secret)
  return {
    sign: async (payload: JWTPayload, expiresIn: number = 900) => {
      const token = await new SignJWT(payload)
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
        .setProtectedHeader({ alg: jwtAlgorithm })
        .sign(encodedSecret)
      return token
    },
  }
}

export { generateId, generateRandomString, jwt }
