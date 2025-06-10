import { Message } from "ai";
import { db } from "./drizzle";
import { chat } from "./schema";
import { eq } from "drizzle-orm";

export async function saveMessages(chatId: string, messages: Message[], state: "loading" | "complete") {
  await db.update(chat).set({ messages, state }).where(eq(chat.id, chatId));
}
