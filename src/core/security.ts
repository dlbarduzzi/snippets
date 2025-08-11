import type { JWTPayload } from "jose"

import { SignJWT } from "jose"

export function jwt(secret: string) {
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
