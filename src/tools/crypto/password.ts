import type { ScryptOpts } from "@noble/hashes/scrypt"

import { getRandomValues } from "uncrypto"

import { hexToBytes } from "@noble/hashes/utils"
import { scryptAsync } from "@noble/hashes/scrypt"

import { encodeHex } from "@/tools/crypto/hex"
import { constantTimeEqual } from "./time"

const config: ScryptOpts = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
}

async function generateBuffer(password: string, salt: string) {
  return await scryptAsync(password.normalize("NFKC"), salt, {
    N: config.N,
    r: config.r,
    p: config.p,
    dkLen: config.dkLen,
    maxmem: 128 * config.N * config.r * 2,
  })
}

export async function hashPassword(password: string) {
  const salt = encodeHex(getRandomValues(new Uint8Array(16)))
  const buffer = await generateBuffer(password, salt)
  return `${salt}:${encodeHex(buffer)}`
}

export async function verifyPassword(hash: string, password: string) {
  const [salt, buffer] = hash.split(":")

  if (salt == null || buffer == null) {
    return false
  }

  const targetBuffer = await generateBuffer(password, salt)
  return constantTimeEqual(targetBuffer, hexToBytes(buffer))
}
