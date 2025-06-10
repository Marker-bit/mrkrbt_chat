"use server";

import { cookies, headers } from "next/headers";
import { auth } from "./auth";
import { db } from "./db/drizzle";
import { and } from "drizzle-orm";
import { chat } from "./db/schema";

export async function setApiKeysAsCookie(
  apiKeys: Record<string, string>
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("apiKeys", JSON.stringify(apiKeys));
}

export async function branchOffChat(
  chatId: string,
  messageId: string
): Promise<{ chatId: string } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Unauthorized" };
  }
  const oldChat = await db.query.chat.findFirst({
    where: (chat, { eq }) =>
      and(eq(chat.id, chatId), eq(chat.userId, session.user.id)),
  });
  if (!oldChat) {
    return { error: "Chat not found" };
  }
  const targetMessage = oldChat.messages.findIndex((message) => message.id === messageId);
  const newMessages = oldChat.messages.slice(0, targetMessage + 1);
  const newId = crypto.randomUUID();
  await db.insert(chat).values({
    id: newId,
    userId: session.user.id,
    messages: newMessages,
    state: "complete",
  });
  return { chatId: newId };
}
