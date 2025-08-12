import type { DB } from "@/db/connect"

import { eq } from "drizzle-orm"

import { users } from "@/db/schemas"
import { lowercase } from "@/tools/strings"

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
