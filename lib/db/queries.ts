import { Message } from "ai";
import { db } from "./drizzle";
import { chat } from "./schema";
import { eq } from "drizzle-orm";

export async function saveMessages(chatId: string, messages: Message[]) {
  await db.update(chat).set({ messages }).where(eq(chat.id, chatId));
}
