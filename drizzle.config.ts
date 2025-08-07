import { defineConfig } from "drizzle-kit"
import { initEnv } from "./lib/env"

initEnv()

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
