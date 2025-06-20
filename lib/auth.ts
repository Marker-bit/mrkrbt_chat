import { db } from "@/lib/db/drizzle";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { config } from "dotenv";
import * as schema from "@/lib/db/schema";
import { RECOMMENDED_MODELS } from "./rec-models";

config({ path: ".env" });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      favouriteModels: {
        type: "string[]",
        defaultValue: RECOMMENDED_MODELS
      },
      additionalInfo: {
        type: "string",
        defaultValue: ""
      }
    },
  },
});
