function constantTimeEqual(a: string | Uint8Array, b: string | Uint8Array): boolean {
  if (typeof a === "string") {
    a = new TextEncoder().encode(a)
  }

  if (typeof b === "string") {
    b = new TextEncoder().encode(b)
  }

  if (a.length !== b.length) {
    return false
  }

  let result = 0

  for (let i = 0; i < a.length; i++) {
    const ai = a[i]
    const bi = b[i]

    if (!ai || !bi) {
      return false
    }

    result |= ai ^ bi
  }

  return result === 0
}

export { constantTimeEqual }
