import { capitalize } from "@/tools/strings"

function toSentence(str: string): string {
  str = str.trim()

  if (str === "") {
    return ""
  }

  str = capitalize(str)
  const lastChar = str.charAt(str.length - 1)

  if (lastChar !== "." && lastChar !== "?" && lastChar !== "!") {
    return `${str}.`
  }

  return str
}

export { toSentence }
