import {
  integer,
  text,
  boolean,
  pgTable,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { Message } from "./db-types";
import { RECOMMENDED_MODELS } from "../rec-models";

// export const todo = pgTable("todo", {
//   id: integer("id").primaryKey(),
//   text: text("text").notNull(),
//   done: boolean("done").default(false).notNull(),
// });

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  favouriteModels: text("favourite_models").array().default(RECOMMENDED_MODELS),
  additionalInfo: text("additional_info").default(""),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  messagesSent: integer("messages_sent")
    .$default(() => 0)
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const chat = pgTable("chat", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  messages: json("messages").notNull().default([]).$type<Message[]>(),
  state: text("state")
    .notNull()
    .default("complete")
    .$type<"loading" | "complete">(),
  title: text("title").notNull().default("Unnamed").$type<string>(),
  visibility: text("visibility")
    .notNull()
    .default("private")
    .$type<"public" | "private">(),
  isPinned: boolean("is_pinned").notNull().default(false).$type<boolean>(),
});
