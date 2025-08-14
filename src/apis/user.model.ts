import type { DB } from "@/db/connect"
import type { SessionSchema } from "@/db/schemas"

import { eq } from "drizzle-orm"

import { lowercase } from "@/tools/strings"
import { passwords, sessions, users } from "@/db/schemas"

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

  public async createSession({
    token,
    userId,
    ipAddress,
    userAgent,
    expiresAt,
  }: Omit<SessionSchema, "id" | "createdAt" | "updatedAt">) {
    return await this.db.transaction(async tx => {
      const [session] = await tx
        .insert(sessions)
        .values({ token, userId, ipAddress, userAgent, expiresAt })
        .returning()

      if (session == null) {
        throw new Error("session cannot be null after inserted into db")
      }

      return session
    })
  }
}

export { UserModel }
