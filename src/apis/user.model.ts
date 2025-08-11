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
}

export { UserModel }
