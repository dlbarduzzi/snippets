const HOST_PREFIX = "__Host-"
const SECURE_PREFIX = "__Secure-"

type Cookie = Map<string, string>

type CookieOptions = {
  domain?: string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  path?: string
  secure?: boolean
  sameSite?: "Strict" | "Lax" | "None"
  partitioned?: boolean
  priority?: "Low" | "Medium" | "High"
}

function parse({ name, cookie }: { name?: string, cookie: string }): Cookie {
  const parsedCookie: Cookie = new Map()

  if (name && !cookie.includes(name)) {
    return parsedCookie
  }

  const pairs = cookie.trim().split(";")

  for (let pair of pairs) {
    pair = pair.trim()

    const index = pair.indexOf("=")
    if (index < 0) {
      continue
    }

    const cookieName = pair.substring(0, index).trim()
    if (name && name !== cookieName) {
      continue
    }

    const cookieValue = pair.substring(index + 1).trim()
    parsedCookie.set(cookieName, decodeURIComponent(cookieValue))

    if (name) {
      return parsedCookie
    }
  }

  return parsedCookie
}

function serialize(name: string, value: string, options: CookieOptions): string {
  let cookie = `${name}=${encodeURIComponent(value)}`

  if (name.startsWith(SECURE_PREFIX) && !options.secure) {
    throw new Error(`${SECURE_PREFIX} cookie must have Secure attribute`)
  }

  if (name.startsWith(HOST_PREFIX)) {
    if (!options.secure) {
      throw new Error(`${HOST_PREFIX} cookie must have Secure attribute`)
    }
    if (options.path !== "/") {
      throw new Error(`${HOST_PREFIX} cookie must have Path attribute set to '/'`)
    }
    if (options.domain) {
      throw new Error(`${HOST_PREFIX} cookie must not have Domain attribute`)
    }
  }

  if (typeof options.maxAge === "number" && options.maxAge >= 0) {
    if (options.maxAge > 34560000) {
      throw new Error("Cookie Max-Age attribute must not be greater than 400 days")
    }
    cookie += `; Max-Age=${options.maxAge | 0}`
  }

  if (options.domain && !name.startsWith(HOST_PREFIX)) {
    cookie += `; Domain=${options.domain}`
  }

  if (options.path) {
    cookie += `; Path=${options.path}`
  }

  if (options.expires) {
    if (options.expires.getTime() - Date.now() > 34560000_000) {
      throw new Error("Cookie Expires attribute must not be greater than 400 days")
    }
    cookie += `; Expires=${options.expires.toUTCString()}`
  }

  if (options.httpOnly) {
    cookie += `; HttpOnly`
  }

  if (options.secure) {
    cookie += `; Secure`
  }

  if (options.sameSite) {
    const str = options.sameSite
    cookie += `; SameSite=${str.charAt(0).toUpperCase() + str.slice(1)}`
  }

  if (options.priority) {
    cookie += `; Priority=${options.priority}`
  }

  if (options.partitioned) {
    if (!options.secure) {
      throw new Error("Partitioned cookie must have Secure attribute")
    }
    cookie += `; Partitioned`
  }

  return cookie
}

function getAllCookies(cookie: string) {
  return parse({ cookie })
}

function getOneCookie(name: string, cookie: string) {
  return parse({ name, cookie })
}

function serializeCookie(name: string, value: string, options: CookieOptions) {
  return serialize(name, value, options)
}

export {
  type CookieOptions,
  getAllCookies,
  getOneCookie,
  SECURE_PREFIX,
  serializeCookie,
}
