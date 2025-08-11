import type { DB } from "@/db/connect"

import { lowercase } from "@/tools/strings"
import { hashPassword } from "@/tools/security/password"

import { users, passwords } from "@/db/schemas"

class AuthModel {
  private readonly db: DB

  constructor(db: DB) {
    this.db = db
  }

  public async register(email: string, password: string) {
    return await this.db.transaction(async tx => {
      const [user] = await tx
        .insert(users)
        .values({ email: lowercase(email), isEmailVerified: false })
        .returning()

      if (user == null) {
        throw new Error("user cannot be null after inserted into db")
      }

      const hash = await hashPassword(password)

      const [passwordId] = await tx
        .insert(passwords)
        .values({ hash, userId: user.id })
        .returning({ id: passwords.id })

      if (passwordId == null) {
        throw new Error("password cannot be null after inserted into db")
      }

      return user
    })
  }
}

export { AuthModel }
