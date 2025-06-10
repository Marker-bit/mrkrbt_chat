import { InferSelectModel } from "drizzle-orm";
import { chat } from "./schema";

export type Chat = typeof chat.$inferSelect;