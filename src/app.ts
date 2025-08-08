import { newConfig } from "@/core/config"
import { bootstrap, newApp } from "@/core/app"

import { authRoutes } from "@/apis/auth.api"

const app = newApp()
const config = newConfig()

bootstrap(app, config)

app.route("/api/v1/auth", authRoutes)

export { app }
