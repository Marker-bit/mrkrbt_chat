import { Message } from "./db-types";
import { db } from "./drizzle";
import { chat } from "./schema";
import { eq } from "drizzle-orm";

export async function saveMessages(
  chatId: string,
  messages: Message[],
  options: {
    state?: "loading" | "complete";
    visibility?: "public" | "private";
  } = {}
) {
  await db
    .update(chat)
    .set({ messages, ...options })
    .where(eq(chat.id, chatId));
}
