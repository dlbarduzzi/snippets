import type { SetHeaders } from "./types"
import type { CookieOptions } from "@/tools/http/cookie"
import type { SessionSchema, UserSchema } from "@/db/schemas"

import { hmac } from "@/tools/crypto/hmac"
import { encodeBase64url } from "@/tools/crypto/base64"

import {
  getOneCookie,
  SECURE_PREFIX,
  serializeCookie,
} from "@/tools/http/cookie"

import { env } from "./env"
import { canonicalJson } from "./json"
import { createTime, getDate } from "./time"

type SetCookieParams = {
  name: string
  value: string
  headers: SetHeaders
  options: CookieOptions
}

const COOKIE_PREFIX = "snippets"

function createCookieName(name: string) {
  const secure = env.APP_URL.startsWith("https://") || env.NODE_ENV === "production"
  const prefix = secure ? SECURE_PREFIX : ""
  return `${prefix}${COOKIE_PREFIX}.${name}`
}

function createCookieOptions(options?: CookieOptions): CookieOptions {
  return {
    path: "/",
    sameSite: "Lax",
    httpOnly: true,
    ...options,
  }
}

const cookies = {
  sessionData: {
    name: createCookieName("session_data"),
    options: (options?: CookieOptions) => createCookieOptions({
      maxAge: createTime(5, "m").toSeconds(),
      ...options,
    }),
  },
  sessionToken: {
    name: createCookieName("session_token"),
    options: (options?: CookieOptions) => createCookieOptions({
      maxAge: createTime(7, "d").toSeconds(),
      ...options,
    }),
  },
  doNotRemember: {
    name: createCookieName("do_not_remember"),
    options: (options?: CookieOptions) => createCookieOptions({
      maxAge: createTime(7, "d").toSeconds(),
      ...options,
    }),
  },
}

export function setCookie({
  name,
  value,
  headers,
  options,
}: SetCookieParams) {
  const cookie = serializeCookie(name, value, options)
  headers("Set-Cookie", cookie, { append: true })
}

async function setSignedCookie({
  name,
  value,
  secret,
  headers,
  options,
}: SetCookieParams & { secret: string }) {
  const signature = await hmac.sign(value, secret)
  value = `${value}.${signature}`
  setCookie({ name, value, headers, options })
}

async function getSignedCookie(name: string, secret: string, headers: Headers) {
  const cookie = headers.get("cookie")
  if (!cookie) {
    return null
  }

  const result = getOneCookie(name, cookie)

  const cookieValue = result.get(name)
  if (!cookieValue) {
    return null
  }

  const index = cookieValue.lastIndexOf(".")
  if (index < 0) {
    return null
  }

  const value = cookieValue.substring(0, index)
  const signature = cookieValue.substring(index + 1)

  const isVerified = await hmac.verify(value, secret, signature)
  if (!isVerified) {
    return null
  }

  return value
}

async function setCachedCookie(
  data: { user: UserSchema, session: SessionSchema },
  secret: string,
  headers: SetHeaders,
) {
  const sessionDataCookieName = cookies.sessionData.name
  const sessionDataCookieOptions = cookies.sessionData.options()

  const maxAge = sessionDataCookieOptions.maxAge
    ? sessionDataCookieOptions.maxAge
    : createTime(5, "m").toSeconds()

  const expiresAt = getDate(maxAge, "sec").getTime()

  const signature = await hmac.sign(canonicalJson({
    ...data,
    expiresAt,
  }), secret)

  const payload = encodeBase64url(JSON.stringify({
    data,
    expiresAt,
    signature,
  }), false)

  if (payload.length > 4093) {
    throw new Error(`Session data is too large (${payload.length})`)
  }

  setCookie({
    name: sessionDataCookieName,
    value: payload,
    headers,
    options: sessionDataCookieOptions,
  })
}

async function setSessionCookie({ data, headers, doNotRememberMe }: {
  data: { user: UserSchema, session: SessionSchema }
  headers: { get: Headers, set: SetHeaders }
  doNotRememberMe?: boolean
}) {
  const doNotRememberToken = cookies.doNotRemember

  const doNotRememberMeCookie = await getSignedCookie(
    doNotRememberToken.name,
    env.SNIPPETS_SECRET,
    headers.get,
  )

  const doNotRememberValue = "true"

  doNotRememberMe = typeof doNotRememberMe === "boolean"
    ? doNotRememberMe
    : doNotRememberMeCookie === doNotRememberValue

  const sessionTokenCookie = cookies.sessionToken

  await setSignedCookie({
    name: sessionTokenCookie.name,
    value: data.session.token,
    secret: env.SNIPPETS_SECRET,
    headers: headers.set,
    options: sessionTokenCookie.options({
      secure: sessionTokenCookie.name.startsWith(SECURE_PREFIX),
      maxAge: doNotRememberMe ? undefined : createTime(7, "d").toSeconds(),
    }),
  })

  if (doNotRememberMe) {
    await setSignedCookie({
      name: doNotRememberToken.name,
      value: doNotRememberValue,
      secret: env.SNIPPETS_SECRET,
      headers: headers.set,
      options: sessionTokenCookie.options({
        secure: doNotRememberToken.name.startsWith(SECURE_PREFIX),
        maxAge: createTime(7, "d").toSeconds(),
      }),
    })
  }

  await setCachedCookie(data, env.SNIPPETS_SECRET, headers.set)
}

export {
  createCookieName,
  createCookieOptions,
  getSignedCookie,
  setSessionCookie,
}
