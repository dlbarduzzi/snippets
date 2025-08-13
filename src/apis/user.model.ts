import type { DB } from "@/db/connect"

import { eq } from "drizzle-orm"

import { lowercase } from "@/tools/strings"
import { passwords, users } from "@/db/schemas"

class UserModel {
  private readonly db: DB

  constructor(db: DB) {
    this.db = db
  }

  public async findUserByEmail(email: string) {
    return await this.db.query.users.findFirst({
      where: eq(users.email, lowercase(email)),
    })
  }

  public async findPasswordByUserId(userId: string) {
    return await this.db.query.passwords.findFirst({
      where: eq(passwords.userId, userId),
    })
  }

  public async verifyUserEmail(email: string) {
    return await this.db.transaction(async tx => {
      const [user] = await tx
        .update(users)
        .set({ isEmailVerified: true })
        .where(eq(users.email, lowercase(email)))
        .returning()

      if (user == null) {
        throw new Error("user cannot be null after updated into db")
      }

      return user
    })
  }

  public async verifyUserEmail2(email: string) {
    return await this.db.update(users)
      .set({ isEmailVerified: true })
      .where(eq(users.email, lowercase(email)))
      .returning()
  }
}

export { UserModel }
