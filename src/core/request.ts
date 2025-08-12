import { env } from "./env"

export function getIpAddress(req: Request | Headers): string | null {
  const testIP = "127.0.0.1"
  if (env.NODE_ENV === "test") {
    return testIP
  }

  const headers = "headers" in req ? req.headers : req
  const ipHeaders = ["x-forwarded-for", "x-client-ip"]

  for (const key of ipHeaders) {
    const value = "get" in headers ? headers.get(key) : headers[key]
    if (typeof value === "string") {
      const values = value.split(",")
      if (values.length > 0) {
        const ip = (values[0] ?? "").trim()
        if (isValidIpAddress(ip)) {
          return ip
        }
      }
    }
  }

  return null
}

function isValidIpAddress(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipv4Regex.test(ip)) {
    const parts = ip.split(".").map(Number)
    return parts.every((part) => part >= 0 && part <= 255)
  }
  const ipv6Regex = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i
  return ipv6Regex.test(ip)
}
