import { newApp } from "@/core/app"

const app = newApp()

app.get("/test", ctx => {
  ctx.var.config.logger.info("hello from test api")
  return ctx.json({
    ok: true,
    user: ctx.var.config.user,
  }, 200)
})

export const authRoutes = app
